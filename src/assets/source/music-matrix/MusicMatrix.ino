#include <Arduino.h>
#include <ESP32-HUB75-MatrixPanel-I2S-DMA.h>
#include <arduinoFFT.h>
#include <esp_adc/adc_continuous.h>
#include <freertos/FreeRTOS.h>
#include <freertos/queue.h>
#include <freertos/task.h>
#include <math.h>
#include <string.h>

#include "SpectrumUi.h"

#if !defined(CONFIG_IDF_TARGET_ESP32)
#error "This sketch targets the classic ESP32 / ESP32-WROVER, not S2/S3/C3."
#endif

// MAX9814: OUT -> GPIO34, VDD/GAIN -> 3V3, GND/AR -> GND.
constexpr int MIC_PIN = 34;
constexpr uint32_t SAMPLE_RATE = 32000;
constexpr uint16_t FFT_SAMPLES = 1024;
constexpr int BAND_COUNT = SpectrumUi::BAND_COUNT;

// Adjust these first if the bars are too quiet or too lively.
constexpr float SENSITIVITY_DB = -9.0f;  // Try -15 for less response, -3 for more.
constexpr float NOISE_FLOOR_DB = -36.0f;
constexpr float DISPLAY_TOP_DB = -12.0f;
constexpr float RESPONSE_EXPONENT = 3.0f;  // Higher favors only the loudest peaks.
constexpr float RMS_NOISE_GATE = 12.0f;  // ADC counts, not a sound-pressure level.
constexpr uint8_t BRIGHTNESS = 80;

constexpr int PANEL_WIDTH = SpectrumUi::WIDTH;
constexpr int PANEL_HEIGHT = SpectrumUi::HEIGHT;
constexpr uint32_t FRAME_INTERVAL_MS = 33;
constexpr uint32_t AUDIO_STALE_MS = 500;
constexpr uint32_t PEAK_HOLD_MS = 250;

static_assert((FFT_SAMPLES & (FFT_SAMPLES - 1)) == 0,
              "FFT_SAMPLES must be a power of two.");
static_assert(NOISE_FLOOR_DB < DISPLAY_TOP_DB, "Invalid display range.");
static_assert(RESPONSE_EXPONENT >= 1.0f, "Use an exponent >= 1 for quiet suppression.");
static_assert(SOC_ADC_DIGI_RESULT_BYTES == 2, "Unexpected ESP32 ADC format.");
static_assert(ESP32_I2S_DEVICE == I2S_NUM_1,
              "The panel must use I2S1; continuous ADC capture needs I2S0.");

struct SpectrumFrame {
  float levels[BAND_COUNT];
  float rms;
  float dc;
  uint16_t minimum;
  uint16_t maximum;
  uint32_t capturedMs;
  uint32_t fftUs;
  uint32_t captureResets;
};

MatrixPanel_I2S_DMA *display = nullptr;
adc_continuous_handle_t adcHandle = nullptr;
adc_channel_t micChannel;
QueueHandle_t spectrumQueue = nullptr;
portMUX_TYPE overflowMux = portMUX_INITIALIZER_UNLOCKED;
uint32_t adcOverflows = 0;  // Every access is protected by overflowMux.

float realPart[FFT_SAMPLES];
float imagPart[FFT_SAMPLES];
ArduinoFFT<float> fft(realPart, imagPart, FFT_SAMPLES, float(SAMPLE_RATE), true);
uint16_t bandEdges[BAND_COUNT + 1];
uint16_t barColors[BAND_COUNT];
uint16_t labelColors[BAND_COUNT];
SpectrumUi::PitchLabel pitchLabels[BAND_COUNT];
alignas(4) uint8_t adcBytes[1024];

float barLevels[BAND_COUNT] = {};
float peakHeights[BAND_COUNT] = {};
uint32_t peakTimes[BAND_COUNT] = {};

// Explicit declarations also keep Arduino's automatic prototypes after the type.
void analyzeFrame(SpectrumFrame &frame);
void drawSpectrum(const SpectrumFrame &frame, bool receiving,
                  uint32_t nowMs, float dt);

bool IRAM_ATTR onAdcOverflow(adc_continuous_handle_t,
                            const adc_continuous_evt_data_t *, void *) {
  portENTER_CRITICAL_ISR(&overflowMux);
  ++adcOverflows;
  portEXIT_CRITICAL_ISR(&overflowMux);
  return false;
}

uint32_t overflowCount() {
  portENTER_CRITICAL(&overflowMux);
  const uint32_t count = adcOverflows;
  portEXIT_CRITICAL(&overflowMux);
  return count;
}

float clamp01(float value) {
  return fminf(1.0f, fmaxf(0.0f, value));
}

void fatalError(const char *message) {
  Serial.println(message);
  if (display) {
    display->clearScreen();
    display->setTextSize(1);
    display->setTextWrap(true);
    display->setTextColor(display->color565(255, 60, 20));
    display->setCursor(2, 4);
    display->println(message);
    display->println("See Serial");
    display->flipDMABuffer();
  }
  while (true) delay(1000);
}

void requireAdc(esp_err_t result, const char *operation) {
  if (result == ESP_OK) return;
  Serial.printf("%s: %s\n", operation, esp_err_to_name(result));
  fatalError("MIC ERROR");
}

void beginDisplay() {
  // Same wiring as WestwoodMatrix and AquariumMatrix.
  HUB75_I2S_CFG::i2s_pins pins = {
    25, 26, 27,          // R1 G1 B1
    14, 13, 32,          // R2 G2 B2
    23, 19, 5, 21, 18,   // A B C D E
    4, 15, 22            // LAT OE CLK
  };
  HUB75_I2S_CFG config(PANEL_WIDTH, PANEL_HEIGHT, 1, pins);
  config.double_buff = true;
  static MatrixPanel_I2S_DMA panel(config);
  if (!panel.begin()) fatalError("Panel initialization failed: check free RAM.");
  display = &panel;
  display->clearScreen();
  display->flipDMABuffer();
  display->clearScreen();
  display->setBrightness8(BRIGHTNESS);
  display->setTextWrap(false);
  display->setTextSize(1);

  for (int band = 0; band < BAND_COUNT; ++band) {
    const SpectrumUi::Rgb color = SpectrumUi::rainbowColor(band);
    barColors[band] = display->color565(color.r, color.g, color.b);
    // Lighten the labels slightly to keep blue/violet text legible.
    labelColors[band] = display->color565(
        (2 * color.r + 192) / 3,
        (2 * color.g + 192) / 3,
        (2 * color.b + 192) / 3);
  }
}

void beginMicrophone() {
  adc_unit_t unit;
  requireAdc(adc_continuous_io_to_channel(MIC_PIN, &unit, &micChannel),
             "Find microphone ADC channel");
  if (unit != ADC_UNIT_1) fatalError("Use ADC1");

  // On classic ESP32, ADC DMA uses I2S0. The HUB75 driver uses I2S1.
  // Do not also call analogRead() or initialize an I2S microphone in this sketch.
  adc_continuous_handle_cfg_t handleConfig = {};
  handleConfig.max_store_buf_size = 8192;
  handleConfig.conv_frame_size = 512;
  requireAdc(adc_continuous_new_handle(&handleConfig, &adcHandle),
             "Allocate continuous ADC");

  adc_digi_pattern_config_t pattern = {};
  pattern.atten = ADC_ATTEN_DB_12;
  pattern.channel = micChannel;
  pattern.unit = ADC_UNIT_1;
  pattern.bit_width = ADC_BITWIDTH_12;

  adc_continuous_config_t config = {};
  config.sample_freq_hz = SAMPLE_RATE;
  config.conv_mode = ADC_CONV_SINGLE_UNIT_1;
  config.format = ADC_DIGI_OUTPUT_FORMAT_TYPE1;
  config.pattern_num = 1;
  config.adc_pattern = &pattern;
  requireAdc(adc_continuous_config(adcHandle, &config), "Configure continuous ADC");
  adc_continuous_evt_cbs_t callbacks = {};
  callbacks.on_pool_ovf = onAdcOverflow;
  requireAdc(adc_continuous_register_event_callbacks(adcHandle, &callbacks, nullptr),
             "Register ADC overflow callback");
  requireAdc(adc_continuous_start(adcHandle), "Start microphone capture");
}

void beginBands() {
  // Logarithmic spacing from 31.25 Hz to 14 kHz, rounded to actual FFT bins.
  const float binHz = float(SAMPLE_RATE) / FFT_SAMPLES;
  for (int i = 0; i <= BAND_COUNT; ++i) {
    const float hz = 31.25f * powf(14000.0f / 31.25f, float(i) / BAND_COUNT);
    bandEdges[i] = uint16_t(ceilf(hz / binHz));
  }
  for (int i = 0; i < BAND_COUNT; ++i) {
    if (bandEdges[i] < 1 || bandEdges[i + 1] <= bandEdges[i] ||
        bandEdges[i + 1] > FFT_SAMPLES / 2) {
      fatalError("Band setup");
    }
    // Label the geometric center of the FFT bins actually used by this band.
    // These are band references, not detection of individual notes in the song.
    const float centerHz = binHz * sqrtf(float(bandEdges[i]) *
                                         float(bandEdges[i + 1] - 1));
    const int midi = int(lroundf(69.0f + 12.0f * log2f(centerHz / 440.0f)));
    if (midi < 12 || midi > 131) fatalError("Pitch setup");
    const int pitchClass = midi % 12;
    pitchLabels[i] = {
      "CCDDEFFGGAAB"[pitchClass],
      pitchClass == 1 || pitchClass == 3 || pitchClass == 6 ||
          pitchClass == 8 || pitchClass == 10,
      char('0' + midi / 12 - 1)
    };
    Serial.printf("Band %2d: %.1f - %.1f Hz | center %.1f Hz ~ %c%s%c\n", i + 1,
                  bandEdges[i] * binHz, bandEdges[i + 1] * binHz, centerHz,
                  pitchLabels[i].letter, pitchLabels[i].sharp ? "#" : "",
                  pitchLabels[i].octave);
  }
}

void analyzeFrame(SpectrumFrame &frame) {
  const uint32_t startedUs = micros();
  float sum = 0;
  frame.minimum = 4095;
  frame.maximum = 0;
  for (int i = 0; i < FFT_SAMPLES; ++i) {
    const uint16_t raw = uint16_t(realPart[i]);
    if (raw < frame.minimum) frame.minimum = raw;
    if (raw > frame.maximum) frame.maximum = raw;
    sum += realPart[i];
  }
  frame.dc = sum / FFT_SAMPLES;

  // MAX9814 output has a DC bias. Measure and remove it every block;
  // subtracting a fixed 2048 would leave an offset on this microphone.
  float sumSquares = 0;
  for (int i = 0; i < FFT_SAMPLES; ++i) {
    const float centered = realPart[i] - frame.dc;
    sumSquares += centered * centered;
    realPart[i] = centered / 2048.0f;
    imagPart[i] = 0;
  }
  frame.rms = sqrtf(sumSquares / FFT_SAMPLES);
  fft.windowing(FFTWindow::Hann, FFTDirection::Forward);
  fft.compute(FFTDirection::Forward);
  fft.complexToMagnitude();

  // 2/N for a one-sided magnitude, another 2 for the Hann window gain.
  // Band powers are for visualization, not calibrated acoustic measurements.
  const float scale = 4.0f / FFT_SAMPLES;
  for (int band = 0; band < BAND_COUNT; ++band) {
    float power = 0;
    for (int k = bandEdges[band]; k < bandEdges[band + 1]; ++k) {
      const float amplitude = realPart[k] * scale;
      power += amplitude * amplitude;
    }
    const float db = 10.0f * log10f(fmaxf(power, 1.0e-12f));
    const float normalized = clamp01((db + SENSITIVITY_DB - NOISE_FLOOR_DB) /
                                     (DISPLAY_TOP_DB - NOISE_FLOOR_DB));
    // Expand the decibel-normalized level to suppress quiet and moderate input.
    frame.levels[band] = frame.rms < RMS_NOISE_GATE ? 0.0f :
                        powf(normalized, RESPONSE_EXPONENT);
  }
  frame.capturedMs = millis();
  frame.fftUs = micros() - startedUs;
}

void audioTask(void *) {
  size_t filled = 0;
  uint32_t previousOverflows = 0;
  SpectrumFrame frame = {};
  while (true) {
    uint32_t bytesRead = 0;
    esp_err_t result = adc_continuous_read(
        adcHandle, adcBytes, sizeof(adcBytes), &bytesRead, 100);
    const uint32_t currentOverflows = overflowCount();
    if (result == ESP_ERR_INVALID_STATE || currentOverflows != previousOverflows) {
      // Discard an incomplete FFT block after an ADC buffer overrun.
      // Restart with fresh samples instead of combining across a gap.
      filled = 0;
      ++frame.captureResets;
      result = adc_continuous_stop(adcHandle);
      if (result == ESP_OK) result = adc_continuous_flush_pool(adcHandle);
      previousOverflows = overflowCount();
      if (result == ESP_OK) result = adc_continuous_start(adcHandle);
      if (result == ESP_OK) continue;
    } else if (result == ESP_ERR_TIMEOUT) {
      continue;
    } else if (result == ESP_OK) {
      for (uint32_t offset = 0;
           offset + SOC_ADC_DIGI_RESULT_BYTES <= bytesRead;
           offset += SOC_ADC_DIGI_RESULT_BYTES) {
        adc_digi_output_data_t sample = {};
        // TYPE1 records occupy two bytes on ESP32, even if the union is larger.
        memcpy(&sample, adcBytes + offset, SOC_ADC_DIGI_RESULT_BYTES);
        if (sample.type1.channel != micChannel) {
          filled = 0;
          ++frame.captureResets;
          continue;
        }
        realPart[filled++] = float(sample.type1.data);
        if (filled == FFT_SAMPLES) {
          analyzeFrame(frame);
          xQueueOverwrite(spectrumQueue, &frame);
          filled = 0;
        }
      }
      continue;
    }
    Serial.printf("ADC capture stopped: %s. Reset the board to retry.\n",
                  esp_err_to_name(result));
    adc_continuous_stop(adcHandle);
    vTaskDelete(nullptr);
  }
}

void drawSpectrum(const SpectrumFrame &frame, bool receiving,
                  uint32_t nowMs, float dt) {
  display->clearScreen();
  const uint16_t grid = display->color565(8, 12, 18);
  for (int offset = 0; offset < SpectrumUi::HALF_HEIGHT; offset += 6) {
    display->drawFastHLine(SpectrumUi::SIDE_MARGIN,
                          SpectrumUi::CENTER_TOP - offset,
                          PANEL_WIDTH - 2 * SpectrumUi::SIDE_MARGIN, grid);
    display->drawFastHLine(SpectrumUi::SIDE_MARGIN,
                          SpectrumUi::CENTER_BOTTOM + offset,
                          PANEL_WIDTH - 2 * SpectrumUi::SIDE_MARGIN, grid);
  }
  for (int band = 0; band < BAND_COUNT; ++band) {
    const float target = receiving ? frame.levels[band] : 0.0f;
    const float timeConstant = target > barLevels[band] ? 0.025f : 0.18f;
    barLevels[band] += (target - barLevels[band]) *
                      (1.0f - expf(-dt / timeConstant));
    const float pixels = clamp01(barLevels[band]) * SpectrumUi::HALF_HEIGHT;
    if (pixels >= peakHeights[band]) {
      peakHeights[band] = pixels;
      peakTimes[band] = nowMs;
    } else if (uint32_t(nowMs - peakTimes[band]) > PEAK_HOLD_MS) {
      peakHeights[band] = fmaxf(pixels, peakHeights[band] - 10.0f * dt);
    }
    const int x = SpectrumUi::barLeft(band);
    const int height = int(lroundf(pixels));
    for (int y = 0; y < height; ++y) {
      display->drawFastHLine(x, SpectrumUi::CENTER_TOP - y,
                            SpectrumUi::BAR_WIDTH, barColors[band]);
      display->drawFastHLine(x, SpectrumUi::CENTER_BOTTOM + y,
                            SpectrumUi::BAR_WIDTH, barColors[band]);
    }
    // Keep both white caps visible at rest, with a small gap at the center.
    const int trackedPeak = int(lroundf(peakHeights[band]));
    const int peak = trackedPeak < SpectrumUi::MIN_CAP_HEIGHT ?
                    SpectrumUi::MIN_CAP_HEIGHT : trackedPeak;
    const uint16_t peakColor = display->color565(170, 190, 220);
    display->drawFastHLine(x, SpectrumUi::CENTER_BOTTOM - peak,
                          SpectrumUi::BAR_WIDTH, peakColor);
    display->drawFastHLine(x, SpectrumUi::CENTER_TOP + peak,
                          SpectrumUi::BAR_WIDTH, peakColor);
    SpectrumUi::drawPitch(*display, band, pitchLabels[band], labelColors[band]);
  }
  const char *title = receiving ? "SPECTRUM" : "MIC?";
  display->setTextColor(receiving ? display->color565(75, 95, 125) :
                                   display->color565(255, 60, 20));
  const int titleWidth = int(strlen(title)) * 6 - 1;
  display->setCursor((PANEL_WIDTH - titleWidth) / 2, 4);
  display->print(title);
  if (receiving && (frame.minimum <= 4 || frame.maximum >= 4091)) {
    display->fillRect(60, 4, 2, 2, display->color565(255, 0, 0));
  }
  display->flipDMABuffer();
}

void setup() {
  Serial.begin(115200);
  Serial.println("MusicMatrix: MAX9814 on GPIO34, 32 kHz, 1024-point FFT.");
  beginDisplay();
  beginBands();
  spectrumQueue = xQueueCreate(1, sizeof(SpectrumFrame));
  if (!spectrumQueue) fatalError("Queue RAM");
  beginMicrophone();
  // Core 0 handles capture/FFT; Arduino loop draws on core 1.
  if (xTaskCreatePinnedToCore(audioTask, "MusicFFT", 6144, nullptr,
                              2, nullptr, 0) != pdPASS) {
    adc_continuous_stop(adcHandle);
    fatalError("Task RAM");
  }
}

void loop() {
  static SpectrumFrame latest = {};
  static bool haveAudio = false;
  static uint32_t lastDrawMs = millis();
  static uint32_t lastLogMs = 0;
  if (xQueueReceive(spectrumQueue, &latest, 0) == pdTRUE) haveAudio = true;

  const uint32_t nowMs = millis();
  const bool receiving = haveAudio &&
                         uint32_t(nowMs - latest.capturedMs) < AUDIO_STALE_MS;
  if (uint32_t(nowMs - lastDrawMs) >= FRAME_INTERVAL_MS) {
    const float dt = fminf(float(uint32_t(nowMs - lastDrawMs)) / 1000.0f, 0.1f);
    lastDrawMs = nowMs;
    drawSpectrum(latest, receiving, nowMs, dt);
  }
  if (uint32_t(nowMs - lastLogMs) >= 1000) {
    lastLogMs = nowMs;
    Serial.printf("%s | DC %.0f | RMS %.1f | min/max %u/%u | FFT %lu us | resets %lu\n",
                  receiving ? "Audio" : "No ADC data", latest.dc, latest.rms,
                  unsigned(latest.minimum), unsigned(latest.maximum),
                  static_cast<unsigned long>(latest.fftUs),
                  static_cast<unsigned long>(latest.captureResets));
  }
  delay(1);
}
