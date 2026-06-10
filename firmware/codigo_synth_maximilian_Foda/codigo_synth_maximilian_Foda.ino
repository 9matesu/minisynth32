#include "AudioTools.h"
#include "AudioTools/AudioLibs/MaximilianDSP.h"
#include <Adafruit_GFX.h>
#include <Adafruit_SH110X.h>
#include <Arduino.h>
#include <Wire.h>

/* ── Pin definitions ──────────────────────────────────────────────────── */

#define OLED_SDA 21
#define OLED_SCL 17

#define POT_ATTACK 32
#define POT_DECAY 33 
#define POT_FILTER 34
#define POT_WAVE 35
#define POT_VOLUME 36

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

/* ── Dummy Print to disable AudioTools logging ────────────────────────── */

class DummyPrint : public Print {
public:
  size_t write(uint8_t c) override { return 1; }
  size_t write(const uint8_t *buffer, size_t size) override { return size; }
};
DummyPrint dummyPrint;

/* ── Waveform enum ────────────────────────────────────────────────────── */

enum WaveMode : uint8_t { WM_SQUARE = 0, WM_SINE = 1, WM_SAW = 2, WM_TRI = 3 };

/* ── ADSR Envelope States ─────────────────────────────────────────────── */

enum AdsrPhase : uint8_t {
  ADSR_IDLE = 0,
  ADSR_ATTACK,
  ADSR_DECAY,
  ADSR_SUSTAIN,
  ADSR_RELEASE
};

/* ── Synth State (all normalized 0-100 for serial protocol) ───────────── */

struct SynthState {
  // Oscillator
  uint8_t waveIdx = 2; // 0=square, 1=sine, 2=saw, 3=tri
  int8_t octave = 0;   // -2 to +2
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

  // Runtime (not serialized)
  float currentFreq =
      0.0f; // float is atomic on 32-bit ESP32, preventing cross-core tearing!
  bool noteOn = false;
  AdsrPhase adsrPhase = ADSR_IDLE;
  double adsrLevel = 0.0;
  uint32_t adsrTime = 0;

  // Arp & chord runtime
  uint8_t arpNoteIdx = 0;
  double activeFreqs[10];
  uint8_t activeFreqCount = 0;

  // Display
  uint32_t lastDisplayMs = 0;
  uint32_t lastHeartbeatMs = 0;
  uint32_t lastPotSendMs = 0;

  // Waveform capture
  float sampleBuffer[32];
  uint8_t sampleIdx = 0;
};

static SynthState s;

/* ── Previous pot values for deadband ─────────────────────────────────── */

static uint8_t prevPotAttack = 255;
static uint8_t prevPotDecay = 255;
static uint8_t prevPotFilter = 255;
static uint8_t prevPotWave = 255;
static uint8_t prevPotVolume = 255;

/* ── Internal range mapping helpers ───────────────────────────────────── */

static double mapAttack() {
  return 0.005 + (s.attack / 100.0) * 4.995;
} // 5ms - 5s
static double mapDecay() {
  return 0.030 + (s.decay / 100.0) * 1.170;
} // 30ms - 1.2s
static double mapSustain() { return s.sustain / 100.0; } // 0.0 - 1.0
static double mapRelease() {
  return 0.010 + (s.release / 100.0) * 1.990;
} // 10ms - 2s
static double mapCutoff() {
  // Exponential mapping: 40Hz to 12000Hz (safe for 32kHz sample rate)
  return 40.0 * pow(300.0, s.cutoff / 100.0);
}
static double mapResonance() {
  return 0.1 + (s.resonance / 100.0) * 0.85;
} // 0.1 - 0.95 to avoid filter explosion
static double mapVolume() { return s.volume / 100.0; } // 0.0 - 1.0

/* ── Waveform name helpers ────────────────────────────────────────────── */

static const char *waveName(uint8_t idx) {
  switch (idx) {
  case WM_SQUARE:
    return "SQUARE";
  case WM_SINE:
    return "SINE";
  case WM_SAW:
    return "SAW";
  case WM_TRI:
    return "TRI";
  default:
    return "UNK";
  }
}

static const char *waveNameLower(uint8_t idx) {
  switch (idx) {
  case WM_SQUARE:
    return "square";
  case WM_SINE:
    return "sine";
  case WM_SAW:
    return "saw";
  case WM_TRI:
    return "triangle";
  default:
    return "saw";
  }
}

/* ── Smoothed ADC reading (EMA Filter) ────────────────────────────────── */

// Global EMA state variables for the 5 potentiometers
static float ema_a = 0.0f;
static float ema_d = 0.0f;
static float ema_f = 0.0f;
static float ema_w = 0.0f;
static float ema_v = 0.0f;

// The smoothing factor (alpha). Lower is smoother but slower.
// 0.1 gives heavy smoothing without feeling unresponsive.
static const float EMA_ALPHA = 0.1f;

static void readControls() {
  // Read raw values
  uint16_t a = analogRead(POT_ATTACK);
  uint16_t d = analogRead(POT_DECAY);
  uint16_t f = analogRead(POT_FILTER);
  uint16_t w = analogRead(POT_WAVE);
  uint16_t v = analogRead(POT_VOLUME);

  // Initialize EMA on first read to avoid slow ramp-up
  static bool firstRead = true;
  if (firstRead) {
    ema_a = a;
    ema_d = d;
    ema_f = f;
    ema_w = w;
    ema_v = v;
    firstRead = false;
  } else {
    // Apply EMA filter
    ema_a = ema_a * (1.0f - EMA_ALPHA) + (float)a * EMA_ALPHA;
    ema_d = ema_d * (1.0f - EMA_ALPHA) + (float)d * EMA_ALPHA;
    ema_f = ema_f * (1.0f - EMA_ALPHA) + (float)f * EMA_ALPHA;
    ema_w = ema_w * (1.0f - EMA_ALPHA) + (float)w * EMA_ALPHA;
    ema_v = ema_v * (1.0f - EMA_ALPHA) + (float)v * EMA_ALPHA;
  }

  uint8_t a_val = (uint8_t)(((uint32_t)ema_a * 100UL) / 4095UL);
  uint8_t d_val = (uint8_t)(((uint32_t)ema_d * 100UL) / 4095UL);
  uint8_t f_val = (uint8_t)(((uint32_t)ema_f * 100UL) / 4095UL);
  uint8_t w_val = (uint8_t)min(3UL, ((uint32_t)ema_w * 4UL) / 4096UL);
  uint8_t v_val = (uint8_t)(((uint32_t)ema_v * 100UL) / 4095UL);

  // Pot takeover: only overwrite synth state if the physical knob was turned
  if (potChanged(a_val, prevPotAttack))
    s.attack = a_val;
  if (potChanged(d_val, prevPotDecay))
    s.decay = d_val;
  if (potChanged(f_val, prevPotFilter))
    s.cutoff = f_val;
  if (potChanged(w_val, prevPotWave))
    s.waveIdx = w_val;
  if (potChanged(v_val, prevPotVolume))
    s.volume = v_val;
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

static uint8_t sentAttack = 255;
static uint8_t sentDecay = 255;
static uint8_t sentCutoff = 255;
static uint8_t sentWaveIdx = 255;
static uint8_t sentVolume = 255;

static void sendPotChanges() {
  if (s.attack != sentAttack) {
    if (sentAttack != 255)
      Serial.printf("{\"type\":\"state_update\",\"path\":\"ampAdsr.attack\","
                    "\"value\":%d}\n",
                    s.attack);
    sentAttack = s.attack;
  }
  if (s.decay != sentDecay) {
    if (sentDecay != 255)
      Serial.printf("{\"type\":\"state_update\",\"path\":\"ampAdsr.decay\","
                    "\"value\":%d}\n",
                    s.decay);
    sentDecay = s.decay;
  }
  if (s.cutoff != sentCutoff) {
    if (sentCutoff != 255)
      Serial.printf("{\"type\":\"state_update\",\"path\":\"filter.cutoff\","
                    "\"value\":%d}\n",
                    s.cutoff);
    sentCutoff = s.cutoff;
  }
  if (s.waveIdx != sentWaveIdx) {
    if (sentWaveIdx != 255)
      Serial.printf("{\"type\":\"state_update\",\"path\":\"osc1.waveform\","
                    "\"value\":\"%s\"}\n",
                    waveNameLower(s.waveIdx));
    sentWaveIdx = s.waveIdx;
  }
  if (s.volume != sentVolume) {
    if (sentVolume != 255)
      Serial.printf(
          "{\"type\":\"state_update\",\"path\":\"osc1.volume\",\"value\":%d}\n",
          s.volume);
    sentVolume = s.volume;
  }
}

/* ── JSON Serial Protocol: Parse incoming commands ────────────────────── */

static char serialBuf[512];
static int serialBufPos = 0;

static void addActiveFreq(double f) {
  if (s.activeFreqCount < 10) {
    for (int i = 0; i < s.activeFreqCount; i++) {
      if (abs(s.activeFreqs[i] - f) < 0.1) return; // Already exists
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
  if (!typeVal)
    return;
  typeVal += 8;

  if (strncmp(typeVal, "param_set", 9) == 0) {
    // Parse path - find "path":
    const char *pathVal = strstr(json, "\"path\":\"");
    if (!pathVal)
      return;
    pathVal += 8;
    const char *pathEnd = strchr(pathVal, '"');
    if (!pathEnd)
      return;

    char path[48];
    size_t pathLen = min((size_t)(pathEnd - pathVal), sizeof(path) - 1);
    strncpy(path, pathVal, pathLen);
    path[pathLen] = '\0';

    // Parse value - find "value":
    const char *valStart = strstr(json, "\"value\"");
    if (!valStart)
      return;
    valStart = strchr(valStart, ':');
    if (!valStart)
      return;
    valStart++;

    // Skip whitespace
    while (*valStart == ' ')
      valStart++;

    // Determine value type
    if (*valStart == '"') {
      // String value (waveform)
      valStart++;
      const char *valEnd = strchr(valStart, '"');
      if (!valEnd)
        return;
      char strVal[32];
      size_t valLen = min((size_t)(valEnd - valStart), sizeof(strVal) - 1);
      strncpy(strVal, valStart, valLen);
      strVal[valLen] = '\0';

      if (strcmp(path, "osc1.waveform") == 0) {
        if (strcmp(strVal, "square") == 0)
          s.waveIdx = WM_SQUARE;
        else if (strcmp(strVal, "sine") == 0)
          s.waveIdx = WM_SINE;
        else if (strcmp(strVal, "saw") == 0)
          s.waveIdx = WM_SAW;
        else if (strcmp(strVal, "triangle") == 0)
          s.waveIdx = WM_TRI;
      }
    } else if (*valStart == 't' || *valStart == 'f') {
      // Boolean
      bool boolVal = (*valStart == 't');
      if (strcmp(path, "filter.enabled") == 0)
        s.filterOn = boolVal;
      else if (strcmp(path, "arpeggiator.enabled") == 0)
        s.arpEnabled = boolVal;
    } else {
      // Numeric
      double numVal = atof(valStart);
      int intVal = (int)numVal;

      if (strcmp(path, "osc1.octave") == 0)
        s.octave = constrain(intVal, -2, 2);
      else if (strcmp(path, "osc1.volume") == 0)
        s.volume = constrain(intVal, 0, 100);
      else if (strcmp(path, "ampAdsr.attack") == 0)
        s.attack = constrain(intVal, 0, 100);
      else if (strcmp(path, "ampAdsr.decay") == 0)
        s.decay = constrain(intVal, 0, 100);
      else if (strcmp(path, "ampAdsr.sustain") == 0)
        s.sustain = constrain(intVal, 0, 100);
      else if (strcmp(path, "ampAdsr.release") == 0)
        s.release = constrain(intVal, 0, 100);
      else if (strcmp(path, "filter.cutoff") == 0)
        s.cutoff = constrain(intVal, 0, 100);
      else if (strcmp(path, "filter.resonance") == 0)
        s.resonance = constrain(intVal, 0, 100);
      else if (strcmp(path, "filter.envelope") == 0)
        s.filterEnv = constrain(intVal, 0, 100);
      else if (strcmp(path, "filter.slope") == 0)
        s.filterSlope = (intVal == 24) ? 24 : 12;
      else if (strcmp(path, "arpeggiator.rate") == 0)
        s.arpRate = constrain(intVal, 1, 32);
    }

    // ACK the param set
    Serial.printf("{\"type\":\"ack\",\"path\":\"%s\",\"ok\":true}\n", path);

  } else if (strncmp(typeVal, "note_on", 7) == 0) {
    // Parse freq
    const char *freqStart = strstr(json, "\"freq\"");
    if (freqStart) {
      freqStart = strchr(freqStart, ':');
      if (freqStart) {
        freqStart++;
        while (*freqStart == ' ')
          freqStart++;
        double freq = atof(freqStart);
        if (freq > 0) {
          addActiveFreq(freq);
          // Apply octave transposition
          double transposedFreq = freq * pow(2.0, s.octave);
          if (!s.arpEnabled) {
            s.currentFreq = transposedFreq;
            s.noteOn = true;
            s.adsrPhase = ADSR_ATTACK;
            s.adsrTime = 0;
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
      }
    } else {
      // Fallback: clear all if no freq provided
      s.activeFreqCount = 0;
    }
    
    if (s.activeFreqCount == 0) {
      if (s.noteOn) {
        s.noteOn = false;
        s.adsrPhase = ADSR_RELEASE;
        s.adsrTime = 0;
      }
    } else if (!s.arpEnabled) {
      // Fallback to highest playing note if playing monophonic chords
      double highestFreq = 0;
      for (int i=0; i<s.activeFreqCount; i++) {
        if (s.activeFreqs[i] > highestFreq) highestFreq = s.activeFreqs[i];
      }
      s.currentFreq = highestFreq * pow(2.0, s.octave);
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

/* ── ADSR Envelope Processor ────────────────────────────────────────────
 */

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

/* ── Oscillator selection ───────────────────────────────────────────────
 */

static double selectOsc(uint8_t wave, double freq) {
  switch (wave) {
  case WM_SQUARE:
    return osc.square(freq);
  case WM_SINE:
    return osc.sinewave(freq);
  case WM_SAW:
    return osc.sawn(freq);
  case WM_TRI:
    return osc.triangle(freq);
  default:
    return osc.sawn(freq);
  }
}

/* ── Main audio callback (Maximilian) ───────────────────────────────────
 */

void play(float *output) {
  // Update arp tempo dynamically
  static uint8_t lastArpRate = 0;
  if (s.arpRate != lastArpRate) {
    // map rate 1-32 to roughly 30 - 480 BPM
    myClock.setTempo(s.arpRate * 15);
    lastArpRate = s.arpRate;
  }

  myClock.ticker();

  // Arpeggiator: cycle held notes on clock tick
  if (s.arpEnabled && myClock.tick) {
    if (s.activeFreqCount > 0) {
      s.arpNoteIdx = (s.arpNoteIdx + 1) % s.activeFreqCount;
      double freq = s.activeFreqs[s.arpNoteIdx] * pow(2.0, s.octave);
      s.currentFreq = freq;
      s.noteOn = true;
      s.adsrPhase = ADSR_ATTACK;
      s.adsrTime = 0;
    } else if (s.noteOn) {
      s.noteOn = false;
      s.adsrPhase = ADSR_RELEASE;
      s.adsrTime = 0;
    }
  }

  double sample = 0.0;

  if (s.currentFreq > 0 && s.adsrPhase != ADSR_IDLE) {
    // 5ms Portamento to prevent clicking on instantaneous Arp freq jumps
    static double smoothedFreq = 0.0;
    if (smoothedFreq == 0.0 || !s.noteOn)
      smoothedFreq = s.currentFreq;
    smoothedFreq = smoothedFreq * 0.95 + s.currentFreq * 0.05;

    // Generate oscillator output using selected waveform
    double rawOsc = selectOsc(s.waveIdx, smoothedFreq);

    // Apply ADSR envelope
    double env = processADSR();

    // Apply filter
    double cutoffHz = mapCutoff();
    double res = mapResonance();

    // Filter envelope modulation (scaled to prevent blowing past Nyquist)
    double envMod = (s.filterEnv / 100.0) * env * 6000.0;
    double modulatedCutoff = cutoffHz + envMod;

    // STRICT CONSTRAINT to prevent EADDRINUSE/Distortion/DSP explosion
    modulatedCutoff = constrain(modulatedCutoff, 40.0, 14000.0);

    double filtered = rawOsc;
    if (s.filterOn) {
      filtered = filter.lores(rawOsc, modulatedCutoff, res);

      // Cascade 24dB mode
      if (s.filterSlope == 24) {
        static maxiFilter filter2;
        filtered = filter2.lores(filtered, modulatedCutoff, res);
      }
    }

    // Apply volume and envelope
    // Reduce internal gain significantly to prevent filter overload and
    // distortion
    sample = filtered * env * mapVolume() * 0.2;
  }

  // Safety check to prevent NaN propagation to the JSON encoder and I2S
  // buffer
  if (isnan(sample) || isinf(sample)) {
    sample = 0.0;
    // Reset the filter and oscillator internal states to recover from NaN
    // lock
    filter = maxiFilter();
    osc = maxiOsc();
  }

  // Clean hard limiter to protect the I2S DAC from digital wrap-around
  sample = constrain(sample, -1.0, 1.0);

  // Capture waveform samples for display
  if (s.sampleIdx < 32) {
    s.sampleBuffer[s.sampleIdx++] = (float)sample;
  }

  output[0] = (float)sample;
  output[1] = (float)sample;
}

/* ── Send heartbeat with full state ─────────────────────────────────────
 */

static void sendHeartbeat() {
  Serial.printf("{\"type\":\"heartbeat\",\"uptime\":%lu}\n", millis());
}

/* ── Send waveform samples ──────────────────────────────────────────────
 */

static void sendWaveformSamples() {
  Serial.print(
      "{\"type\":\"state_update\",\"path\":\"waveDisplay.samples\","
      "\"value\":[");
  for (int i = 0; i < 32; i++) {
    // Normalize samples to -1..1 range
    float normalized = s.sampleBuffer[i];
    normalized = constrain(normalized, -1.0f, 1.0f);
    if (i > 0)
      Serial.print(",");
    Serial.printf("%.3f", normalized);
  }
  Serial.println("]}");
  s.sampleIdx = 0;
}

/* ── OLED Display ───────────────────────────────────────────────────────
 */

static void drawWaveIcon(int x, int y, uint8_t idx) {
  for (int i = 0; i < 24; i++) {
    int yy = y + 8;
    if (idx == WM_SINE)
      yy = y + 8 + (int)(sinf((float)i * 0.35f) * 6.0f);
    else if (idx == WM_SAW)
      yy = y + 14 - (i / 2);
    else if (idx == WM_SQUARE)
      yy = y + ((i < 12) ? 2 : 14);
    else if (idx == WM_TRI)
      yy = y + ((i < 12) ? (14 - i) : (i - 10));
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

/* ── Setup ──────────────────────────────────────────────────────────────
 */

void setup() {
  Serial.begin(SERIAL_BAUD);
  AudioLogger::instance().begin(dummyPrint, AudioLogger::Warning);

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
  cfg.pin_bck = 26;
  cfg.pin_ws = 25;
  cfg.pin_data = 27;
  cfg.sample_rate = SAMPLE_RATE;
  cfg.buffer_size = 512;

  out.begin(cfg);
  maximilian.begin(cfg);

  myClock.setTicksPerBeat(4);
  myClock.setTempo(120);

  // Send initial log
  Serial.println("{\"type\":\"log\",\"level\":\"info\",\"message\":"
                 "\"MiniSynth32 firmware ready\"}");

  // Launch UI/Serial task on Core 0 to keep audio free from stutter on Core
  // 1
  xTaskCreatePinnedToCore(uiTask, "UITask",
                          8192, // Stack size
                          NULL,
                          1, // Priority
                          NULL,
                          0 // Core 0
  );
}

/* ── FreeRTOS Task for UI & Serial (Core 0) ─────────────────────────────
 */

void uiTask(void *pvParameters) {
  for (;;) {
    // Process incoming serial commands
    processSerial();

    // Read physical controls
    readControls();

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

    vTaskDelay(1); // minimal yield to Watchdog
  }
}

/* ── Main loop (Core 1) ──────────────────────────────────────────────────
 */

void loop() {
  // Maximilian audio processing (Runs continuously)
  maximilian.copy();
}