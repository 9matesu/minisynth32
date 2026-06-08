#include <Arduino.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SH110X.h>
#include "AudioTools.h"
#include "AudioTools/AudioLibs/MaximilianDSP.h"

/* ── Pin definitions ──────────────────────────────────────────────────── */

#define OLED_SDA 21
#define OLED_SCL 17

#define POT_ATTACK 2
#define POT_DECAY 4
#define POT_FILTER 5
#define POT_WAVE 6
#define POT_VOLUME 7

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
#define OLED_ADDR 0x3C

#define SAMPLE_RATE 32000
#define SERIAL_BAUD 115200

/* ── Hardware ─────────────────────────────────────────────────────────── */

Adafruit_SH1106G display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

I2SStream out;
Maximilian maximilian(out);

maxiOsc osc;
maxiFilter filter;
maxiClock myClock;

/* ── Waveform enum ────────────────────────────────────────────────────── */

enum WaveMode : uint8_t { WM_SQUARE = 0, WM_SINE = 1, WM_SAW = 2, WM_TRI = 3 };

/* ── ADSR Envelope States ─────────────────────────────────────────────── */

enum AdsrPhase : uint8_t { ADSR_IDLE = 0, ADSR_ATTACK, ADSR_DECAY, ADSR_SUSTAIN, ADSR_RELEASE };

/* ── Synth State (all normalized 0-100 for serial protocol) ───────────── */

struct SynthState {
  // Oscillator
  uint8_t waveIdx     = 2;    // 0=square, 1=sine, 2=saw, 3=tri
  int8_t  octave      = 0;    // -2 to +2
  uint8_t volume      = 72;   // 0-100

  // ADSR (0-100 normalized)
  uint8_t attack      = 12;
  uint8_t decay       = 46;
  uint8_t sustain     = 78;
  uint8_t release     = 34;

  // Filter (0-100 normalized)
  bool    filterOn    = true;
  uint8_t cutoff      = 58;
  uint8_t resonance   = 36;
  uint8_t filterSlope = 12;   // 12 or 24
  uint8_t filterEnv   = 42;

  // Arpeggiator
  bool    arpEnabled  = false;
  uint8_t arpRate     = 8;    // 1-32

  // Runtime (not serialized)
  double  currentFreq = 0.0;
  bool    noteOn      = false;
  AdsrPhase adsrPhase = ADSR_IDLE;
  double  adsrLevel   = 0.0;
  uint32_t adsrTime   = 0;

  // Arp runtime
  uint8_t arpNoteIdx  = 0;
  double  arpFreqs[8] = { 261.63, 329.63, 392.00, 493.88, 523.25, 659.25, 784.00, 987.77 };
  uint8_t arpNoteCount = 4;

  // Display
  uint32_t lastDisplayMs   = 0;
  uint32_t lastHeartbeatMs = 0;
  uint32_t lastPotSendMs   = 0;

  // Waveform capture
  float sampleBuffer[32];
  uint8_t sampleIdx = 0;
};

static SynthState s;

/* ── Previous pot values for deadband ─────────────────────────────────── */

static uint8_t prevPotAttack  = 255;
static uint8_t prevPotDecay   = 255;
static uint8_t prevPotFilter  = 255;
static uint8_t prevPotWave    = 255;
static uint8_t prevPotVolume  = 255;

/* ── Internal range mapping helpers ───────────────────────────────────── */

static double mapAttack()    { return 0.005 + (s.attack / 100.0) * 4.995; }    // 5ms - 5s
static double mapDecay()     { return 0.030 + (s.decay / 100.0) * 1.170; }     // 30ms - 1.2s
static double mapSustain()   { return s.sustain / 100.0; }                      // 0.0 - 1.0
static double mapRelease()   { return 0.010 + (s.release / 100.0) * 1.990; }   // 10ms - 2s
static double mapCutoff()    { return 200.0 + (s.cutoff / 100.0) * 6000.0; }   // 200 - 6200 Hz
static double mapResonance() { return 0.1 + (s.resonance / 100.0) * 0.9; }     // 0.1 - 1.0
static double mapVolume()    { return s.volume / 100.0; }                        // 0.0 - 1.0

/* ── Waveform name helpers ────────────────────────────────────────────── */

static const char* waveName(uint8_t idx) {
  switch (idx) {
    case WM_SQUARE: return "SQUARE";
    case WM_SINE:   return "SINE";
    case WM_SAW:    return "SAW";
    case WM_TRI:    return "TRI";
    default:        return "UNK";
  }
}

static const char* waveNameLower(uint8_t idx) {
  switch (idx) {
    case WM_SQUARE: return "square";
    case WM_SINE:   return "sine";
    case WM_SAW:    return "saw";
    case WM_TRI:    return "triangle";
    default:        return "saw";
  }
}

/* ── Smoothed ADC reading ─────────────────────────────────────────────── */

static uint16_t readAvg(int pin) {
  uint32_t sum = 0;
  for (int i = 0; i < 8; i++) sum += analogRead(pin);
  return (uint16_t)(sum >> 3);
}

/* ── Read pots → normalized 0-100 ─────────────────────────────────────── */

static void readControls() {
  uint16_t a = readAvg(POT_ATTACK);
  uint16_t d = readAvg(POT_DECAY);
  uint16_t f = readAvg(POT_FILTER);
  uint16_t w = readAvg(POT_WAVE);
  uint16_t v = readAvg(POT_VOLUME);

  s.attack  = (uint8_t)((a * 100UL) / 4095UL);
  s.decay   = (uint8_t)((d * 100UL) / 4095UL);
  s.cutoff  = (uint8_t)((f * 100UL) / 4095UL);
  s.waveIdx = (uint8_t)min(3UL, (w * 4UL) / 4096UL);
  s.volume  = (uint8_t)((v * 100UL) / 4095UL);
}

/* ── Pot deadband check ───────────────────────────────────────────────── */

#define POT_DEADBAND 2

static bool potChanged(uint8_t newVal, uint8_t &prevVal) {
  if (prevVal == 255 || abs((int)newVal - (int)prevVal) > POT_DEADBAND) {
    prevVal = newVal;
    return true;
  }
  return false;
}

/* ── Send pot changes over serial if significant ──────────────────────── */

static void sendPotChanges() {
  if (potChanged(s.attack, prevPotAttack)) {
    Serial.printf("{\"type\":\"state_update\",\"path\":\"ampAdsr.attack\",\"value\":%d}\n", s.attack);
  }
  if (potChanged(s.decay, prevPotDecay)) {
    Serial.printf("{\"type\":\"state_update\",\"path\":\"ampAdsr.decay\",\"value\":%d}\n", s.decay);
  }
  if (potChanged(s.cutoff, prevPotFilter)) {
    Serial.printf("{\"type\":\"state_update\",\"path\":\"filter.cutoff\",\"value\":%d}\n", s.cutoff);
  }
  if (potChanged(s.waveIdx, prevPotWave)) {
    Serial.printf("{\"type\":\"state_update\",\"path\":\"osc1.waveform\",\"value\":\"%s\"}\n", waveNameLower(s.waveIdx));
  }
  if (potChanged(s.volume, prevPotVolume)) {
    Serial.printf("{\"type\":\"state_update\",\"path\":\"osc1.volume\",\"value\":%d}\n", s.volume);
  }
}

/* ── JSON Serial Protocol: Parse incoming commands ────────────────────── */

static char serialBuf[512];
static int  serialBufPos = 0;

static void handleSerialCommand(const char* json) {
  // Very lightweight JSON parsing (no external lib needed)
  // Expected: {"type":"param_set","path":"xxx","value":yyy}
  //           {"type":"note_on","note":"C4","freq":261.63}
  //           {"type":"note_off"}

  // Find "type"
  const char* typeStart = strstr(json, "\"type\"");
  if (!typeStart) return;
  const char* typeVal = strstr(typeStart, ":\"");
  if (!typeVal) return;
  typeVal += 2;

  if (strncmp(typeVal, "param_set", 9) == 0) {
    // Parse path
    const char* pathStart = strstr(json, "\"path\"");
    if (!pathStart) return;
    const char* pathVal = strstr(pathStart, ":\"");
    if (!pathVal) return;
    pathVal += 2;
    const char* pathEnd = strchr(pathVal, '"');
    if (!pathEnd) return;

    char path[48];
    size_t pathLen = min((size_t)(pathEnd - pathVal), sizeof(path) - 1);
    strncpy(path, pathVal, pathLen);
    path[pathLen] = '\0';

    // Parse value - find "value":
    const char* valStart = strstr(json, "\"value\"");
    if (!valStart) return;
    valStart = strchr(valStart, ':');
    if (!valStart) return;
    valStart++;

    // Skip whitespace
    while (*valStart == ' ') valStart++;

    // Determine value type
    if (*valStart == '"') {
      // String value (waveform)
      valStart++;
      const char* valEnd = strchr(valStart, '"');
      if (!valEnd) return;
      char strVal[32];
      size_t valLen = min((size_t)(valEnd - valStart), sizeof(strVal) - 1);
      strncpy(strVal, valStart, valLen);
      strVal[valLen] = '\0';

      if (strcmp(path, "osc1.waveform") == 0) {
        if (strcmp(strVal, "square") == 0)     s.waveIdx = WM_SQUARE;
        else if (strcmp(strVal, "sine") == 0)  s.waveIdx = WM_SINE;
        else if (strcmp(strVal, "saw") == 0)   s.waveIdx = WM_SAW;
        else if (strcmp(strVal, "triangle") == 0) s.waveIdx = WM_TRI;
      }
    } else if (*valStart == 't' || *valStart == 'f') {
      // Boolean
      bool boolVal = (*valStart == 't');
      if (strcmp(path, "filter.enabled") == 0)     s.filterOn = boolVal;
      else if (strcmp(path, "arpeggiator.enabled") == 0) s.arpEnabled = boolVal;
    } else {
      // Numeric
      double numVal = atof(valStart);
      int intVal = (int)numVal;

      if (strcmp(path, "osc1.octave") == 0)        s.octave = constrain(intVal, -2, 2);
      else if (strcmp(path, "osc1.volume") == 0)    s.volume = constrain(intVal, 0, 100);
      else if (strcmp(path, "ampAdsr.attack") == 0)  s.attack = constrain(intVal, 0, 100);
      else if (strcmp(path, "ampAdsr.decay") == 0)   s.decay = constrain(intVal, 0, 100);
      else if (strcmp(path, "ampAdsr.sustain") == 0)  s.sustain = constrain(intVal, 0, 100);
      else if (strcmp(path, "ampAdsr.release") == 0)  s.release = constrain(intVal, 0, 100);
      else if (strcmp(path, "filter.cutoff") == 0)   s.cutoff = constrain(intVal, 0, 100);
      else if (strcmp(path, "filter.resonance") == 0) s.resonance = constrain(intVal, 0, 100);
      else if (strcmp(path, "filter.envelope") == 0)  s.filterEnv = constrain(intVal, 0, 100);
      else if (strcmp(path, "filter.slope") == 0)    s.filterSlope = (intVal == 24) ? 24 : 12;
      else if (strcmp(path, "arpeggiator.rate") == 0) s.arpRate = constrain(intVal, 1, 32);
    }

    // ACK the param set
    Serial.printf("{\"type\":\"ack\",\"path\":\"%s\",\"ok\":true}\n", path);

  } else if (strncmp(typeVal, "note_on", 7) == 0) {
    // Parse freq
    const char* freqStart = strstr(json, "\"freq\"");
    if (freqStart) {
      freqStart = strchr(freqStart, ':');
      if (freqStart) {
        freqStart++;
        while (*freqStart == ' ') freqStart++;
        double freq = atof(freqStart);
        if (freq > 0) {
          // Apply octave transposition
          double transposedFreq = freq * pow(2.0, s.octave);
          s.currentFreq = transposedFreq;
          s.noteOn = true;
          s.adsrPhase = ADSR_ATTACK;
          s.adsrTime = 0;
        }
      }
    }

  } else if (strncmp(typeVal, "note_off", 8) == 0) {
    if (s.noteOn) {
      s.noteOn = false;
      s.adsrPhase = ADSR_RELEASE;
      s.adsrTime = 0;
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

/* ── ADSR Envelope Processor ──────────────────────────────────────────── */

static double processADSR() {
  double dt = 1.0 / SAMPLE_RATE;

  switch (s.adsrPhase) {
    case ADSR_ATTACK: {
      double attackTime = mapAttack();
      s.adsrLevel += dt / attackTime;
      if (s.adsrLevel >= 1.0) {
        s.adsrLevel = 1.0;
        s.adsrPhase = ADSR_DECAY;
      }
      break;
    }
    case ADSR_DECAY: {
      double decayTime = mapDecay();
      double sustainLevel = mapSustain();
      s.adsrLevel -= dt / decayTime * (1.0 - sustainLevel);
      if (s.adsrLevel <= sustainLevel) {
        s.adsrLevel = sustainLevel;
        s.adsrPhase = ADSR_SUSTAIN;
      }
      break;
    }
    case ADSR_SUSTAIN:
      s.adsrLevel = mapSustain();
      break;
    case ADSR_RELEASE: {
      double releaseTime = mapRelease();
      s.adsrLevel -= dt / releaseTime * s.adsrLevel;
      if (s.adsrLevel <= 0.001) {
        s.adsrLevel = 0.0;
        s.adsrPhase = ADSR_IDLE;
      }
      break;
    }
    case ADSR_IDLE:
    default:
      s.adsrLevel = 0.0;
      break;
  }

  return s.adsrLevel;
}

/* ── Oscillator selection ─────────────────────────────────────────────── */

static double selectOsc(uint8_t wave, double freq) {
  switch (wave) {
    case WM_SQUARE: return osc.square(freq);
    case WM_SINE:   return osc.sinewave(freq);
    case WM_SAW:    return osc.sawn(freq);
    case WM_TRI:    return osc.triangle(freq);
    default:        return osc.sawn(freq);
  }
}

/* ── Main audio callback (Maximilian) ─────────────────────────────────── */

void play(float *output) {
  myClock.ticker();

  // Arpeggiator: cycle notes on clock tick when enabled
  if (s.arpEnabled && myClock.tick) {
    s.arpNoteIdx = (s.arpNoteIdx + 1) % s.arpNoteCount;
    double freq = s.arpFreqs[s.arpNoteIdx] * pow(2.0, s.octave);
    s.currentFreq = freq;
    s.noteOn = true;
    s.adsrPhase = ADSR_ATTACK;
    s.adsrTime = 0;
  }

  double sample = 0.0;

  if (s.currentFreq > 0 && s.adsrPhase != ADSR_IDLE) {
    // Generate oscillator output using selected waveform
    double rawOsc = selectOsc(s.waveIdx, s.currentFreq);

    // Apply ADSR envelope
    double env = processADSR();

    // Apply filter
    double cutoffHz = mapCutoff();
    double res = mapResonance();

    // Filter envelope modulation
    double envMod = (s.filterEnv / 100.0) * env * 4000.0;
    double modulatedCutoff = cutoffHz + envMod;
    modulatedCutoff = constrain(modulatedCutoff, 20.0, 20000.0);

    double filtered = rawOsc;
    if (s.filterOn) {
      filtered = filter.lores(rawOsc, modulatedCutoff, res);
    }

    // Apply volume and envelope
    sample = filtered * env * mapVolume() * 0.5;
  }

  // Capture waveform samples for display
  if (s.sampleIdx < 32) {
    s.sampleBuffer[s.sampleIdx++] = (float)sample;
  }

  output[0] = (float)sample;
  output[1] = (float)sample;
}

/* ── Send heartbeat with full state ───────────────────────────────────── */

static void sendHeartbeat() {
  Serial.printf("{\"type\":\"heartbeat\",\"uptime\":%lu}\n", millis());
}

/* ── Send waveform samples ────────────────────────────────────────────── */

static void sendWaveformSamples() {
  Serial.print("{\"type\":\"state_update\",\"path\":\"waveDisplay.samples\",\"value\":[");
  for (int i = 0; i < 32; i++) {
    // Normalize samples to -1..1 range
    float normalized = s.sampleBuffer[i];
    normalized = constrain(normalized, -1.0f, 1.0f);
    if (i > 0) Serial.print(",");
    Serial.printf("%.3f", normalized);
  }
  Serial.println("]}");
  s.sampleIdx = 0;
}

/* ── OLED Display ─────────────────────────────────────────────────────── */

static void drawWaveIcon(int x, int y, uint8_t idx) {
  for (int i = 0; i < 24; i++) {
    int yy = y + 8;
    if (idx == WM_SINE) yy = y + 8 + (int)(sinf((float)i * 0.35f) * 6.0f);
    else if (idx == WM_SAW) yy = y + 14 - (i / 2);
    else if (idx == WM_SQUARE) yy = y + ((i < 12) ? 2 : 14);
    else if (idx == WM_TRI) yy = y + ((i < 12) ? (14 - i) : (i - 10));
    display.drawPixel(x + i, yy, SH110X_WHITE);
  }
}

static void drawDisplay() {
  display.clearDisplay();
  display.setTextColor(SH110X_WHITE, SH110X_BLACK);
  display.setTextWrap(false);
  display.setTextSize(1);

  drawWaveIcon(0, 0, s.waveIdx);

  display.setCursor(28, 0);
  display.print(waveName(s.waveIdx));

  display.setCursor(80, 0);
  display.print("Oct:");
  display.print(s.octave);

  display.setCursor(0, 14);
  display.print("A:");
  display.print(s.attack);
  display.print(" D:");
  display.print(s.decay);

  display.setCursor(0, 26);
  display.print("S:");
  display.print(s.sustain);
  display.print(" R:");
  display.print(s.release);

  display.setCursor(0, 38);
  display.print("Cut:");
  display.print(s.cutoff);
  display.print(" Res:");
  display.print(s.resonance);

  display.setCursor(0, 50);
  display.print("Vol:");
  display.print(s.volume);
  display.print("% ");
  display.print(s.arpEnabled ? "ARP" : "");

  display.display();
}

/* ── Setup ────────────────────────────────────────────────────────────── */

void setup() {
  Serial.begin(SERIAL_BAUD);

  analogReadResolution(12);
  analogSetPinAttenuation(POT_ATTACK, ADC_11db);
  analogSetPinAttenuation(POT_DECAY, ADC_11db);
  analogSetPinAttenuation(POT_FILTER, ADC_11db);
  analogSetPinAttenuation(POT_WAVE, ADC_11db);
  analogSetPinAttenuation(POT_VOLUME, ADC_11db);

  pinMode(POT_ATTACK, INPUT);
  pinMode(POT_DECAY, INPUT);
  pinMode(POT_FILTER, INPUT);
  pinMode(POT_WAVE, INPUT);
  pinMode(POT_VOLUME, INPUT);

  Wire.begin(OLED_SDA, OLED_SCL);
  delay(250);
  display.begin(OLED_ADDR, true);
  display.clearDisplay();
  display.display();

  auto cfg = out.defaultConfig(TX_MODE);
  cfg.is_master = true;
  cfg.pin_bck = 3;
  cfg.pin_ws = 1;
  cfg.pin_data = 9;
  cfg.sample_rate = SAMPLE_RATE;
  cfg.buffer_size = 512;

  out.begin(cfg);
  maximilian.begin(cfg);

  myClock.setTicksPerBeat(4);
  myClock.setTempo(120);

  // Send initial log
  Serial.println("{\"type\":\"log\",\"level\":\"info\",\"message\":\"MiniSynth32 firmware ready\"}");
}

/* ── Main loop ────────────────────────────────────────────────────────── */

void loop() {
  // Process incoming serial commands
  processSerial();

  // Read physical controls
  readControls();

  // Maximilian audio processing
  maximilian.copy();

  uint32_t now = millis();

  // Send pot changes with deadband (immediate, on-change)
  if (now - s.lastPotSendMs >= 50) {
    sendPotChanges();
    s.lastPotSendMs = now;
  }

  // Periodic heartbeat + waveform samples (500ms)
  if (now - s.lastHeartbeatMs >= 500) {
    sendHeartbeat();
    sendWaveformSamples();
    s.lastHeartbeatMs = now;
  }

  // Display update (100ms)
  if (now - s.lastDisplayMs >= 100) {
    drawDisplay();
    s.lastDisplayMs = now;
  }
}