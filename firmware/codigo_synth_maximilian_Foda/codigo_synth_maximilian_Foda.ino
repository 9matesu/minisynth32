#include <Arduino.h>
#include <driver/i2s.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SH110X.h>
#include <freertos/FreeRTOS.h>
#include <freertos/semphr.h>

// 1. Defina sua configuração de pinos atual aqui
#define I2S_BCLK       18
#define I2S_LRC        8
#define I2S_DOUT       16

#define OLED_SDA       21
#define OLED_SCL       17

#define POT_ATTACK     2
#define POT_DECAY      4
#define POT_RESONANCE  5
#define POT_RELEASE    6
#define POT_CUTOFF     7

#define BTN_WAVE       36
#define BTN_ARP        37
#define BTN_CHORD_MAJ  34
#define BTN_CHORD_MIN  35

#define SCREEN_WIDTH   128
#define SCREEN_HEIGHT  64
#define OLED_RESET     -1
#define OLED_ADDR      0x3C

#define SAMPLE_RATE    44100
#define BUFFER_SIZE    1024 
#define SERIAL_BAUD    115200

#define USE_HARDWARE_KNOBS false // Mude para true quando conectar os potenciometros
#define USE_HARDWARE_BUTTONS true // Mude para true quando colocar os botões com resistores pull-down!

// Task handles
TaskHandle_t audioTaskHandle;
TaskHandle_t uiTaskHandle;
SemaphoreHandle_t stateMutex;

Adafruit_SH1106G display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

enum WaveMode : uint8_t { WM_SQUARE = 0, WM_SINE = 1, WM_SAW = 2, WM_TRI = 3 };

struct SynthState {
  // Oscillator
  uint8_t waveIdx = 2; // 0=square, 1=sine, 2=saw, 3=tri
  int8_t octave = 0;   // -2 to +2
  uint8_t detune = 0;  // 0-100
  uint8_t volume = 72; // 0-100

  // ADSR (0-100 normalized)
  uint8_t attack = 12;
  uint8_t decay = 46;
  uint8_t sustain = 78;
  uint8_t release = 34;

  // Filter (0-100 normalized)
  bool filterOn = true;
  uint8_t cutoff = 58;
  uint8_t resonance = 36;
  uint8_t filterSlope = 12; // 12 or 24
  uint8_t filterEnv = 42;

  // Arpeggiator
  bool arpEnabled = false;
  uint8_t arpRate = 8; // 1-32

  // Global
  uint8_t voices = 4; // 1-4
  bool multiCore = true;

  // Arp & chord runtime
  uint8_t arpNoteIdx = 0;
  double activeFreqs[10];
  uint8_t activeFreqCount = 0;

  // Display
  uint32_t lastDisplayMs = 0;
  uint32_t lastHeartbeatMs = 0;
  uint32_t lastPotSendMs = 0;
  
  char lastParamName[16] = "MiniSynth32";
  char lastParamVal[16] = "Ready";
};

// Scope Buffer
int8_t scopeBuffer[128];
uint8_t scopeWriteIdx = 0;

static SynthState s;

struct Voice {
  uint32_t phase[3] = {0, 0, 0};
  float currentFreq = 0.0f;
  float targetFreq = 0.0f;
  bool noteOn = false;
  uint8_t adsrPhase = 0; // 0=IDLE, 1=ATTACK, 2=DECAY, 3=SUSTAIN, 4=RELEASE
  float adsrLevel = 0.0f;
  
  // Filter state
  float lp1 = 0.0f, hp1 = 0.0f, bp1 = 0.0f;
  float lp2 = 0.0f, hp2 = 0.0f, bp2 = 0.0f;
};
Voice voices[4];

static uint8_t prevPotAttack = 255;
static uint8_t prevPotDecay = 255;
static uint8_t prevPotRelease = 255;
static uint8_t prevPotCutoff = 255;
static uint8_t prevPotResonance = 255;

static bool btnWaveState = false;
static bool btnArpState = false;
static bool btnMajState = false;
static bool btnMinState = false;

static const char *waveName(uint8_t idx) {
  switch (idx) {
  case WM_SQUARE: return "SQUARE";
  case WM_SINE: return "SINE";
  case WM_SAW: return "SAW";
  case WM_TRI: return "TRI";
  default: return "UNK";
  }
}

static const char *waveNameLower(uint8_t idx) {
  switch (idx) {
  case WM_SQUARE: return "square";
  case WM_SINE: return "sine";
  case WM_SAW: return "saw";
  case WM_TRI: return "triangle";
  default: return "saw";
  }
}

#define POT_DEADBAND 2

static bool potChanged(uint8_t newVal, uint8_t &prevVal) {
  if (prevVal == 255 || abs((int)newVal - (int)prevVal) > POT_DEADBAND) {
    prevVal = newVal;
    return true;
  }
  return false;
}

static uint16_t ema_a = 0;
static uint16_t ema_d = 0;
static uint16_t ema_r = 0;
static uint16_t ema_c = 0;
static uint16_t ema_res = 0;
static uint8_t adcCycle = 0;

static void triggerInternalNoteOn(double freq) {
  for (int i = 0; i < s.voices; i++) {
    if (voices[i].adsrPhase == 0 && !voices[i].noteOn) {
      voices[i].targetFreq = freq * pow(2.0, s.octave);
      voices[i].noteOn = true;
      voices[i].adsrPhase = 1; // ATTACK
      voices[i].phase[0] = 0;
      voices[i].phase[1] = 0;
      voices[i].phase[2] = 0;
      break;
    }
  }
}

static void triggerInternalNoteOff(double freq) {
  double transposedFreq = freq * pow(2.0, s.octave);
  for(int i = 0; i < s.voices; i++) {
    if(abs(voices[i].targetFreq - transposedFreq) < 0.1 && voices[i].noteOn) {
      voices[i].noteOn = false;
      voices[i].adsrPhase = 4; // RELEASE
      break;
    }
  }
}

static void readControls() {
  static bool firstRead = true;
  if (firstRead) {
    ema_a = analogRead(POT_ATTACK);
    ema_d = analogRead(POT_DECAY);
    ema_r = analogRead(POT_RELEASE);
    ema_c = analogRead(POT_CUTOFF);
    ema_res = analogRead(POT_RESONANCE);
    firstRead = false;
    return;
  }

  switch (adcCycle) {
  case 0: {
    uint16_t a = analogRead(POT_ATTACK);
    ema_a = (ema_a * 7 + a) >> 3;
    uint8_t val = (uint8_t)(((uint32_t)ema_a * 100) >> 12);
    if (potChanged(val, prevPotAttack)) {
      s.attack = val;
      strncpy(s.lastParamName, "Attack", 15);
      snprintf(s.lastParamVal, 15, "%d%%", val);
    }
    break;
  }
  case 1: {
    uint16_t d = analogRead(POT_DECAY);
    ema_d = (ema_d * 7 + d) >> 3;
    uint8_t val = (uint8_t)(((uint32_t)ema_d * 100) >> 12);
    if (potChanged(val, prevPotDecay)) {
      s.decay = val;
      strncpy(s.lastParamName, "Decay", 15);
      snprintf(s.lastParamVal, 15, "%d%%", val);
    }
    break;
  }
  case 2: {
    uint16_t r = analogRead(POT_RELEASE);
    ema_r = (ema_r * 7 + r) >> 3;
    uint8_t val = (uint8_t)(((uint32_t)ema_r * 100) >> 12);
    if (potChanged(val, prevPotRelease)) {
      s.release = val;
      strncpy(s.lastParamName, "Release", 15);
      snprintf(s.lastParamVal, 15, "%d%%", val);
    }
    break;
  }
  case 3: {
    uint16_t c = analogRead(POT_CUTOFF);
    ema_c = (ema_c * 7 + c) >> 3;
    uint8_t val = (uint8_t)(((uint32_t)ema_c * 100) >> 12);
    if (potChanged(val, prevPotCutoff)) {
      s.cutoff = val;
      strncpy(s.lastParamName, "Cutoff", 15);
      snprintf(s.lastParamVal, 15, "%d%%", val);
    }
    break;
  }
  case 4: {
    uint16_t res = analogRead(POT_RESONANCE);
    ema_res = (ema_res * 7 + res) >> 3;
    uint8_t val = (uint8_t)(((uint32_t)ema_res * 100) >> 12);
    if (potChanged(val, prevPotResonance)) {
      s.resonance = val;
      strncpy(s.lastParamName, "Resonance", 15);
      snprintf(s.lastParamVal, 15, "%d%%", val);
    }
    break;
  }
  }

  adcCycle++;
  if (adcCycle >= 5) adcCycle = 0;
}

static void readButtons() {
  // Read Buttons
  bool wState = digitalRead(BTN_WAVE) == HIGH;
  if (wState && !btnWaveState) {
    s.waveIdx = (s.waveIdx + 1) % 4;
    strncpy(s.lastParamName, "Wave", 15);
    strncpy(s.lastParamVal, waveName(s.waveIdx), 15);
  }
  btnWaveState = wState;

  bool arpState = digitalRead(BTN_ARP) == HIGH;
  if (arpState && !btnArpState) {
    s.arpEnabled = !s.arpEnabled;
    strncpy(s.lastParamName, "Arpeggiator", 15);
    strncpy(s.lastParamVal, s.arpEnabled ? "ON" : "OFF", 15);
  }
  btnArpState = arpState;

  bool majState = digitalRead(BTN_CHORD_MAJ) == HIGH;
  if (majState && !btnMajState) {
    strncpy(s.lastParamName, "Modifier", 15);
    strncpy(s.lastParamVal, "Maj Held", 15);
  } else if (!majState && btnMajState) {
    strncpy(s.lastParamName, "Modifier", 15);
    strncpy(s.lastParamVal, "Maj Released", 15);
  }
  btnMajState = majState;

  bool minState = digitalRead(BTN_CHORD_MIN) == HIGH;
  if (minState && !btnMinState) {
    strncpy(s.lastParamName, "Modifier", 15);
    strncpy(s.lastParamVal, "Min Held", 15);
  } else if (!minState && btnMinState) {
    strncpy(s.lastParamName, "Modifier", 15);
    strncpy(s.lastParamVal, "Min Released", 15);
  }
  btnMinState = minState;
}

static uint8_t sentAttack = 255;
static uint8_t sentDecay = 255;
static uint8_t sentRelease = 255;
static uint8_t sentCutoff = 255;
static uint8_t sentResonance = 255;
static uint8_t sentWaveIdx = 255;
static uint8_t sentArp = 255;

static void sendPotChanges() {
  if (s.attack != sentAttack) {
    if (sentAttack != 255) Serial.printf("{\"type\":\"state_update\",\"path\":\"ampAdsr.attack\",\"value\":%d}\n", s.attack);
    sentAttack = s.attack;
  }
  if (s.decay != sentDecay) {
    if (sentDecay != 255) Serial.printf("{\"type\":\"state_update\",\"path\":\"ampAdsr.decay\",\"value\":%d}\n", s.decay);
    sentDecay = s.decay;
  }
  if (s.release != sentRelease) {
    if (sentRelease != 255) Serial.printf("{\"type\":\"state_update\",\"path\":\"ampAdsr.release\",\"value\":%d}\n", s.release);
    sentRelease = s.release;
  }
  if (s.cutoff != sentCutoff) {
    if (sentCutoff != 255) Serial.printf("{\"type\":\"state_update\",\"path\":\"filter.cutoff\",\"value\":%d}\n", s.cutoff);
    sentCutoff = s.cutoff;
  }
  if (s.resonance != sentResonance) {
    if (sentResonance != 255) Serial.printf("{\"type\":\"state_update\",\"path\":\"filter.resonance\",\"value\":%d}\n", s.resonance);
    sentResonance = s.resonance;
  }
  if (s.waveIdx != sentWaveIdx) {
    if (sentWaveIdx != 255) Serial.printf("{\"type\":\"state_update\",\"path\":\"osc1.waveform\",\"value\":\"%s\"}\n", waveNameLower(s.waveIdx));
    sentWaveIdx = s.waveIdx;
  }
  uint8_t arpVal = s.arpEnabled ? 1 : 0;
  if (arpVal != sentArp) {
    if (sentArp != 255) Serial.printf("{\"type\":\"state_update\",\"path\":\"arpeggiator.enabled\",\"value\":%s}\n", s.arpEnabled ? "true" : "false");
    sentArp = arpVal;
  }
}

static char serialBuf[512];
static int serialBufPos = 0;

static void addActiveFreq(double f) {
  if (s.activeFreqCount < 10) {
    for (int i = 0; i < s.activeFreqCount; i++) {
      if (abs(s.activeFreqs[i] - f) < 0.1) return;
    }
    s.activeFreqs[s.activeFreqCount++] = f;
  }
}

static void removeActiveFreq(double f) {
  for (int i = 0; i < s.activeFreqCount; i++) {
    if (abs(s.activeFreqs[i] - f) < 0.1) {
      for (int j = i; j < s.activeFreqCount - 1; j++) {
        s.activeFreqs[j] = s.activeFreqs[j + 1];
      }
      s.activeFreqCount--;
      return;
    }
  }
}

static void handleSerialCommand(const char *json) {
  const char *typeVal = strstr(json, "\"type\":\"");
  if (!typeVal) return;
  typeVal += 8;

  if (strncmp(typeVal, "param_set", 9) == 0) {
    const char *pathVal = strstr(json, "\"path\":\"");
    if (!pathVal) return;
    pathVal += 8;
    const char *pathEnd = strchr(pathVal, '"');
    if (!pathEnd) return;

    char path[48];
    size_t pathLen = min((size_t)(pathEnd - pathVal), sizeof(path) - 1);
    strncpy(path, pathVal, pathLen);
    path[pathLen] = '\0';

    const char *valStart = strstr(json, "\"value\"");
    if (!valStart) return;
    valStart = strchr(valStart, ':');
    if (!valStart) return;
    valStart++;

    while (*valStart == ' ') valStart++;

    if (*valStart == '"') {
      valStart++;
      const char *valEnd = strchr(valStart, '"');
      if (!valEnd) return;
      char strVal[32];
      size_t valLen = min((size_t)(valEnd - valStart), sizeof(strVal) - 1);
      strncpy(strVal, valStart, valLen);
      strVal[valLen] = '\0';

      if (strcmp(path, "osc1.waveform") == 0) {
        if (strcmp(strVal, "square") == 0) s.waveIdx = WM_SQUARE;
        else if (strcmp(strVal, "sine") == 0) s.waveIdx = WM_SINE;
        else if (strcmp(strVal, "saw") == 0) s.waveIdx = WM_SAW;
        else if (strcmp(strVal, "triangle") == 0) s.waveIdx = WM_TRI;
        strncpy(s.lastParamName, "Wave", 15);
        strncpy(s.lastParamVal, strVal, 15);
      }
    } else if (*valStart == 't' || *valStart == 'f') {
      bool boolVal = (*valStart == 't');
      if (strcmp(path, "filter.enabled") == 0) s.filterOn = boolVal;
      else if (strcmp(path, "arpeggiator.enabled") == 0) s.arpEnabled = boolVal;
      else if (strcmp(path, "global.multiCore") == 0) s.multiCore = boolVal;
      
      const char *shortName = strrchr(path, '.');
      shortName = shortName ? shortName + 1 : path;
      strncpy(s.lastParamName, shortName, 15);
      strncpy(s.lastParamVal, boolVal ? "ON" : "OFF", 15);
    } else {
      double numVal = atof(valStart);
      int intVal = (int)numVal;

      if (strcmp(path, "osc1.octave") == 0) s.octave = constrain(intVal, -2, 2);
      else if (strcmp(path, "osc1.detune") == 0) s.detune = constrain(intVal, 0, 100);
      else if (strcmp(path, "osc1.volume") == 0) s.volume = constrain(intVal, 0, 100);
      else if (strcmp(path, "ampAdsr.attack") == 0) s.attack = constrain(intVal, 0, 100);
      else if (strcmp(path, "ampAdsr.decay") == 0) s.decay = constrain(intVal, 0, 100);
      else if (strcmp(path, "ampAdsr.sustain") == 0) s.sustain = constrain(intVal, 0, 100);
      else if (strcmp(path, "ampAdsr.release") == 0) s.release = constrain(intVal, 0, 100);
      else if (strcmp(path, "filter.cutoff") == 0) s.cutoff = constrain(intVal, 0, 100);
      else if (strcmp(path, "filter.resonance") == 0) s.resonance = constrain(intVal, 0, 100);
      else if (strcmp(path, "filter.envelope") == 0) s.filterEnv = constrain(intVal, 0, 100);
      else if (strcmp(path, "filter.slope") == 0) s.filterSlope = (intVal == 24) ? 24 : 12;
      else if (strcmp(path, "arpeggiator.rate") == 0) s.arpRate = constrain(intVal, 1, 32);
      else if (strcmp(path, "global.voices") == 0) s.voices = constrain(intVal, 1, 4);
      
      const char *shortName = strrchr(path, '.');
      shortName = shortName ? shortName + 1 : path;
      strncpy(s.lastParamName, shortName, 15);
      snprintf(s.lastParamVal, 15, "%d", intVal);
    }

    Serial.printf("{\"type\":\"ack\",\"path\":\"%s\",\"ok\":true}\n", path);

  } else if (strncmp(typeVal, "note_on", 7) == 0) {
    const char *freqStart = strstr(json, "\"freq\"");
    if (freqStart) {
      freqStart = strchr(freqStart, ':');
      if (freqStart) {
        freqStart++;
        while (*freqStart == ' ') freqStart++;
        double freq = atof(freqStart);
        if (freq > 0) {
          if (btnMajState) {
            double third = freq * 1.25992; // Major third
            double fifth = freq * 1.49830; // Perfect fifth
            addActiveFreq(freq);
            addActiveFreq(third);
            addActiveFreq(fifth);
            if (!s.arpEnabled) {
              triggerInternalNoteOn(freq);
              triggerInternalNoteOn(third);
              triggerInternalNoteOn(fifth);
            }
          } else if (btnMinState) {
            double third = freq * 1.18920; // Minor third
            double fifth = freq * 1.49830; // Perfect fifth
            addActiveFreq(freq);
            addActiveFreq(third);
            addActiveFreq(fifth);
            if (!s.arpEnabled) {
              triggerInternalNoteOn(freq);
              triggerInternalNoteOn(third);
              triggerInternalNoteOn(fifth);
            }
          } else {
            addActiveFreq(freq);
            if (!s.arpEnabled) {
              triggerInternalNoteOn(freq);
            }
          }
        }
      }
    }
  } else if (strncmp(typeVal, "note_off", 8) == 0) {
    const char *freqStart = strstr(json, "\"freq\"");
    if (freqStart) {
      freqStart = strchr(freqStart, ':');
      if (freqStart) {
        freqStart++;
        double freq = atof(freqStart);
        removeActiveFreq(freq);
        removeActiveFreq(freq * 1.25992);
        removeActiveFreq(freq * 1.49830);
        removeActiveFreq(freq * 1.18920);
      }
    } else {
      s.activeFreqCount = 0;
    }
    
    if (s.activeFreqCount == 0) {
      for(int i=0; i<4; i++) {
        if(voices[i].noteOn) {
          voices[i].noteOn = false;
          voices[i].adsrPhase = 4; // RELEASE
        }
      }
    } else if (!s.arpEnabled) {
      const char *freqStart2 = strstr(json, "\"freq\"");
      if(freqStart2) {
        freqStart2 = strchr(freqStart2, ':');
        if(freqStart2) {
          freqStart2++;
          double freq = atof(freqStart2);
          triggerInternalNoteOff(freq);
          triggerInternalNoteOff(freq * 1.25992);
          triggerInternalNoteOff(freq * 1.49830);
          triggerInternalNoteOff(freq * 1.18920);
        }
      }
    }
  }
}

static void processSerial() {
  while (Serial.available()) {
    char c = Serial.read();
    if (c == '\n' || c == '\r') {
      if (serialBufPos > 0) {
        serialBuf[serialBufPos] = '\0';
        handleSerialCommand(serialBuf);
        serialBufPos = 0;
      }
    } else if (serialBufPos < (int)sizeof(serialBuf) - 1) {
      serialBuf[serialBufPos++] = c;
    }
  }
}

static void sendHeartbeat() {
  Serial.printf("{\"type\":\"heartbeat\",\"uptime\":%lu}\n", millis());
}



static void drawDisplay() {
  display.clearDisplay();

  // 1. Oscilloscope (Top 2/3: Y = 0 to 42, center = 21)
  for (int i = 0; i < 127; i++) {
    int y1 = 21 - scopeBuffer[i];
    int y2 = 21 - scopeBuffer[i + 1];
    
    // Constrain to oscilloscope area
    if (y1 < 0) y1 = 0; if (y1 > 42) y1 = 42;
    if (y2 < 0) y2 = 0; if (y2 > 42) y2 = 42;
    
    display.drawLine(i, y1, i + 1, y2, SH110X_WHITE);
  }

  // Separator
  display.drawLine(0, 43, 127, 43, SH110X_WHITE);

  // 2. Dynamic Menu (Bottom 1/3: Y = 44 to 63)
  display.setTextColor(SH110X_WHITE, SH110X_BLACK);
  display.setTextSize(1);
  
  // Param Name
  display.setCursor(4, 50);
  display.print(s.lastParamName);
  
  // Param Value
  display.setCursor(80, 50);
  display.print(s.lastParamVal);

  display.display();
}

// 2. A Task dedicada ao Áudio (Rodando no Core 1)
void audioTask(void *pvParameters) {
    int16_t outBuffer[BUFFER_SIZE * 2]; // Estéreo (L e R)
    size_t bytesWritten;

    uint32_t arpCounter = 0;
    // Otimização: A matemática da fase e do DSP foi inlined aqui 
    // e processada em chunks de 64 samples para não dar "starvation" na UI task no Core 0
    // Usamos uint32_t para a fase do oscilador, o que garante wrapping automático
    // usando overflow natural (sem if) e evita qualquer operação de divisão, 
    // maximizando performance na arquitetura inteira com multiplicadores float.
    const float phaseIncMult = 4294967296.0f / (float)SAMPLE_RATE;

    while (true) {
        for (int chunk = 0; chunk < BUFFER_SIZE; chunk += 64) {
            xSemaphoreTake(stateMutex, portMAX_DELAY);
            
            // Pré-calcula constantes (divisões substituídas por multiplicações FPU)
            float attackRate = 1.0f / (SAMPLE_RATE * (0.005f + s.attack * 0.04995f));
            float decayRate  = 1.0f / (SAMPLE_RATE * (0.030f + s.decay * 0.01170f));
            float sustainLvl = s.sustain * 0.01f;
            float releaseRate= 1.0f / (SAMPLE_RATE * (0.010f + s.release * 0.01990f));

            float q = 1.0f - (s.resonance * 0.01f);
            if (q < 0.15f) q = 0.15f; // Safeguard contra explosão de ressonância
            float baseCutoff = 40.0f * powf(300.0f, s.cutoff * 0.01f);
            float envAmount = s.filterEnv * 60.0f; 
            float masterVol = s.volume * 0.005f;   
            
            // Mapeando rotary knob do Arp (1 a 32) para ritmos 1/4, 1/8, 1/16, 1/24, 1/32 (Base 120BPM)
            uint32_t arpPeriod;
            if (s.arpRate <= 6) arpPeriod = 22050;        // 1/4 note
            else if (s.arpRate <= 13) arpPeriod = 11025;  // 1/8 note
            else if (s.arpRate <= 19) arpPeriod = 5512;   // 1/16 note
            else if (s.arpRate <= 25) arpPeriod = 3675;   // 1/24 note
            else arpPeriod = 2756;                        // 1/32 note

            for (int i = 0; i < 64; i++) {
                int outIdx = chunk + i;

                // --- Arpeggiator ---
                if (s.arpEnabled) {
                    if (s.activeFreqCount > 0) {
                        arpCounter++;
                        if (arpCounter >= arpPeriod) {
                            arpCounter = 0;
                            s.arpNoteIdx++;
                            if (s.arpNoteIdx >= s.activeFreqCount) s.arpNoteIdx = 0;
                            voices[0].targetFreq = s.activeFreqs[s.arpNoteIdx] * powf(2.0f, s.octave);
                            voices[0].noteOn = true;
                            voices[0].adsrPhase = 1; // ATTACK
                            voices[0].phase[0] = 0;
                            voices[0].phase[1] = 0;
                            voices[0].phase[2] = 0;
                        }
                    } else if (voices[0].noteOn) {
                        voices[0].noteOn = false;
                        voices[0].adsrPhase = 4; // RELEASE
                    }
                }

                float mix = 0.0f;

                // --- Polyphony (DSP para cada Voice) ---
                for (int v = 0; v < s.voices; v++) {
                    Voice &voice = voices[v];
                    if (voice.adsrPhase == 0) continue; // Voice IDLE

                    // ADSR Envelopes
                    if (voice.adsrPhase == 1) {
                        voice.adsrLevel += attackRate;
                        if (voice.adsrLevel >= 1.0f) { voice.adsrLevel = 1.0f; voice.adsrPhase = 2; }
                    } else if (voice.adsrPhase == 2) {
                        voice.adsrLevel -= decayRate;
                        if (voice.adsrLevel <= sustainLvl) { voice.adsrLevel = sustainLvl; voice.adsrPhase = 3; }
                    } else if (voice.adsrPhase == 3) {
                        voice.adsrLevel = sustainLvl;
                        if (!voice.noteOn) voice.adsrPhase = 4;
                    } else if (voice.adsrPhase == 4) {
                        voice.adsrLevel -= releaseRate;
                        if (voice.adsrLevel <= 0.0f) { voice.adsrLevel = 0.0f; voice.adsrPhase = 0; }
                    }

                    // Portamento Suave
                    if (voice.currentFreq == 0.0f) voice.currentFreq = voice.targetFreq;
                    voice.currentFreq = voice.currentFreq * 0.99f + voice.targetFreq * 0.01f;

                    // Unison Detune Interno (3 Osciladores por Voice)
                    float detuneVal = s.detune * 0.0003f;
                    float f0 = voice.currentFreq;
                    float f1 = voice.currentFreq * (1.0f + detuneVal);
                    float f2 = voice.currentFreq * (1.0f - detuneVal);

                    uint32_t pInc0 = (uint32_t)(f0 * phaseIncMult);
                    uint32_t pInc1 = (uint32_t)(f1 * phaseIncMult);
                    uint32_t pInc2 = (uint32_t)(f2 * phaseIncMult);
                    
                    voice.phase[0] += pInc0;
                    voice.phase[1] += pInc1;
                    voice.phase[2] += pInc2;

                    // Oscilador Rápido (bitshifts e cast integer evitam divisões)
                    float rawOsc = 0.0f;
                    if (s.waveIdx == 0) { // Square
                        rawOsc += ((int32_t)voice.phase[0] < 0) ? -1.0f : 1.0f;
                        rawOsc += ((int32_t)voice.phase[1] < 0) ? -1.0f : 1.0f;
                        rawOsc += ((int32_t)voice.phase[2] < 0) ? -1.0f : 1.0f;
                    } else if (s.waveIdx == 1) { // Sine (Otimizado)
                        rawOsc += sinf((float)voice.phase[0] * 1.462918e-9f);
                        rawOsc += sinf((float)voice.phase[1] * 1.462918e-9f);
                        rawOsc += sinf((float)voice.phase[2] * 1.462918e-9f);
                    } else if (s.waveIdx == 2) { // Saw
                        rawOsc += (float)((int32_t)voice.phase[0]) * 4.656613e-10f;
                        rawOsc += (float)((int32_t)voice.phase[1]) * 4.656613e-10f;
                        rawOsc += (float)((int32_t)voice.phase[2]) * 4.656613e-10f;
                    } else if (s.waveIdx == 3) { // Tri
                        rawOsc += 2.0f * fabsf((float)((int32_t)voice.phase[0]) * 4.656613e-10f) - 1.0f;
                        rawOsc += 2.0f * fabsf((float)((int32_t)voice.phase[1]) * 4.656613e-10f) - 1.0f;
                        rawOsc += 2.0f * fabsf((float)((int32_t)voice.phase[2]) * 4.656613e-10f) - 1.0f;
                    }
                    rawOsc *= 0.333333f; // Media dos 3 osciladores

                    // Lowpass Filter (Chamberlin SVF)
                    float sample = rawOsc;
                    if (s.filterOn) {
                        float modulatedCutoff = baseCutoff + envAmount * voice.adsrLevel;
                        if (modulatedCutoff > 8000.0f) modulatedCutoff = 8000.0f;
                        
                        float f_coeff = 2.0f * sinf(PI * modulatedCutoff / SAMPLE_RATE);
                        
                        voice.hp1 = sample - voice.lp1 - q * voice.bp1;
                        voice.bp1 += f_coeff * voice.hp1;
                        voice.lp1 += f_coeff * voice.bp1;
                        sample = voice.lp1;

                        if (s.filterSlope == 24) { // Slope 24dB
                            voice.hp2 = sample - voice.lp2 - q * voice.bp2;
                            voice.bp2 += f_coeff * voice.hp2;
                            voice.lp2 += f_coeff * voice.bp2;
                            sample = voice.lp2;
                        }
                    }

                    mix += sample * voice.adsrLevel;
                }

                mix *= masterVol;
                
                // Soft clipping algébrico
                mix = mix / (1.0f + fabsf(mix));

                if (mix > 1.0f) mix = 1.0f;
                else if (mix < -1.0f) mix = -1.0f;

                // Grab every Nth sample for the scope buffer
                static int scopeSkip = 0;
                if (scopeSkip++ > 5) { // Skip 5 samples
                    scopeBuffer[scopeWriteIdx++] = (int8_t)(mix * 20.0f);
                    if (scopeWriteIdx >= 128) scopeWriteIdx = 0;
                    scopeSkip = 0;
                }

                int16_t pcm = (int16_t)(mix * 32767.0f);
                outBuffer[outIdx * 2] = pcm;
                outBuffer[outIdx * 2 + 1] = pcm;
            }
            xSemaphoreGive(stateMutex);
        }

        // 3. Envia o buffer via DMA. A CPU fica livre até o buffer esvaziar.
        i2s_write(I2S_NUM_0, outBuffer, sizeof(outBuffer), &bytesWritten, portMAX_DELAY);
    }
}

// A Task dedicada a UI e Leitura (Rodando no Core 0)
void uiTask(void *pvParameters) {
  for (;;) {
    xSemaphoreTake(stateMutex, portMAX_DELAY);
    
    processSerial();

#if USE_HARDWARE_KNOBS
    readControls();
#endif

#if USE_HARDWARE_BUTTONS
    readButtons();
#endif

    xSemaphoreGive(stateMutex);

    uint32_t now = millis();

    if (now - s.lastPotSendMs >= 50) {
      sendPotChanges();
      s.lastPotSendMs = now;
    }

    if (now - s.lastHeartbeatMs >= 500) {
      sendHeartbeat();
      s.lastHeartbeatMs = now;
    }

    if (now - s.lastDisplayMs >= 100) {
      drawDisplay();
      s.lastDisplayMs = now;
    }

    vTaskDelay(1); 
  }
}

void setup() {
    Serial.begin(SERIAL_BAUD);

    analogReadResolution(12);
    analogSetPinAttenuation(POT_ATTACK, ADC_11db);
    analogSetPinAttenuation(POT_DECAY, ADC_11db);
    analogSetPinAttenuation(POT_RELEASE, ADC_11db);
    analogSetPinAttenuation(POT_CUTOFF, ADC_11db);
    analogSetPinAttenuation(POT_RESONANCE, ADC_11db);

    pinMode(POT_ATTACK, INPUT);
    pinMode(POT_DECAY, INPUT);
    pinMode(POT_RELEASE, INPUT);
    pinMode(POT_CUTOFF, INPUT);
    pinMode(POT_RESONANCE, INPUT);

    pinMode(BTN_WAVE, INPUT);
    pinMode(BTN_ARP, INPUT);
    pinMode(BTN_CHORD_MAJ, INPUT);
    pinMode(BTN_CHORD_MIN, INPUT);

    Wire.begin(OLED_SDA, OLED_SCL);
    delay(250);
    display.begin(OLED_ADDR, true);
    display.clearDisplay();
    display.display();

    Serial.println("{\"type\":\"log\",\"level\":\"info\",\"message\":\"MiniSynth32 firmware ready\"}");

    stateMutex = xSemaphoreCreateMutex();

    // Configuração do I2S
    i2s_config_t i2s_config = {
        .mode = (i2s_mode_t)(I2S_MODE_MASTER | I2S_MODE_TX),
        .sample_rate = SAMPLE_RATE,
        .bits_per_sample = I2S_BITS_PER_SAMPLE_16BIT,
        .channel_format = I2S_CHANNEL_FMT_RIGHT_LEFT,
        .communication_format = I2S_COMM_FORMAT_STAND_I2S,
        .intr_alloc_flags = ESP_INTR_FLAG_LEVEL1,
        .dma_buf_count = 4,      // Quantidade de buffers DMA
        .dma_buf_len = BUFFER_SIZE, // 1024 para max performance
        .use_apll = false        // Mude para true se precisar de um clock de áudio ultra-preciso
    };

    i2s_pin_config_t pin_config = {
        .bck_io_num = I2S_BCLK,
        .ws_io_num = I2S_LRC,
        .data_out_num = I2S_DOUT,
        .data_in_num = I2S_PIN_NO_CHANGE
    };

    i2s_driver_install(I2S_NUM_0, &i2s_config, 0, NULL);
    i2s_set_pin(I2S_NUM_0, &pin_config);

    // Lança a UI task no Core 0
    xTaskCreatePinnedToCore(uiTask, "UITask", 8192, NULL, 1, &uiTaskHandle, 0);

    // 4. Inicia a task no Core 1 com prioridade máxima
    xTaskCreatePinnedToCore(
        audioTask,        // Função da task
        "Audio DSP",      // Nome
        8192,             // Tamanho da stack em bytes
        NULL,             // Parâmetros
        configMAX_PRIORITIES - 1, // Prioridade mais alta possível
        &audioTaskHandle, // Handle
        1                 // Core 1 (APP_CPU)
    );
}

void loop() {
    vTaskDelete(NULL);
}