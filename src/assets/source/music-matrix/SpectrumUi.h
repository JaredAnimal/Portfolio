#pragma once

#include <stdint.h>

namespace SpectrumUi {

constexpr int WIDTH = 64;
constexpr int HEIGHT = 64;
constexpr int BAND_COUNT = 8;
constexpr int SIDE_MARGIN = 2;
constexpr int COLUMN_PITCH = 8;
constexpr int FIRST_BAND_CENTER = (WIDTH - 1 - (BAND_COUNT - 1) * COLUMN_PITCH) / 2;
constexpr int BAR_WIDTH = 4;
constexpr int HALF_HEIGHT = 18;
constexpr int MIN_CAP_HEIGHT = 2;
constexpr int CENTER_TOP = 31;
constexpr int CENTER_BOTTOM = 32;
constexpr int NOTE_Y = 52;
constexpr int NOTE_SCALE_Y = 2;
constexpr int SHARP_LETTER_Y = 51;
constexpr int SHARP_SIGN_Y = 57;

static_assert(CENTER_TOP + CENTER_BOTTOM == HEIGHT - 1,
              "The spectrum must mirror around the middle of the panel.");
static_assert(MIN_CAP_HEIGHT >= 2 && MIN_CAP_HEIGHT <= HALF_HEIGHT,
              "Idle caps must have a gap and stay inside the spectrum area.");
static_assert(CENTER_BOTTOM + HALF_HEIGHT < SHARP_LETTER_Y,
              "Leave space between the bars and note labels.");
static_assert(NOTE_Y + 5 * NOTE_SCALE_Y <= HEIGHT - SIDE_MARGIN,
              "Keep note labels inside the bottom margin.");
static_assert(SHARP_SIGN_Y + 5 <= HEIGHT - SIDE_MARGIN,
              "Keep stacked sharps inside the bottom margin.");
static_assert(COLUMN_PITCH >= 5,
              "Leave space between three-pixel-wide pitch labels.");
static_assert(FIRST_BAND_CENTER - (BAR_WIDTH - 1) / 2 >= SIDE_MARGIN,
              "Keep the first bar inside the left margin.");
static_assert(FIRST_BAND_CENTER + (BAND_COUNT - 1) * COLUMN_PITCH + BAR_WIDTH / 2 <
                  WIDTH - SIDE_MARGIN,
              "Keep the last bar inside the right margin.");

struct PitchLabel {
  char letter;
  bool sharp;
  char octave;
};

struct Rgb {
  uint8_t r;
  uint8_t g;
  uint8_t b;
};

// Red, orange, yellow, green, blue, indigo, violet; interpolate across the bars.
constexpr Rgb RAINBOW[] = {
  {255, 0, 0},
  {255, 112, 0},
  {255, 224, 0},
  {0, 220, 60},
  {0, 100, 255},
  {75, 0, 180},
  {148, 0, 211}
};

constexpr Rgb rainbowColor(int band) {
  const int scaled = band * 6;
  const int section = scaled / (BAND_COUNT - 1);
  const int mix = scaled % (BAND_COUNT - 1);
  if (section >= 6) return RAINBOW[6];
  const Rgb a = RAINBOW[section];
  const Rgb b = RAINBOW[section + 1];
  return {
    uint8_t((a.r * (BAND_COUNT - 1 - mix) + b.r * mix) / (BAND_COUNT - 1)),
    uint8_t((a.g * (BAND_COUNT - 1 - mix) + b.g * mix) / (BAND_COUNT - 1)),
    uint8_t((a.b * (BAND_COUNT - 1 - mix) + b.b * mix) / (BAND_COUNT - 1))
  };
}

constexpr int bandCenter(int band) {
  return FIRST_BAND_CENTER + band * COLUMN_PITCH;
}

constexpr int barLeft(int band) {
  return bandCenter(band) - (BAR_WIDTH - 1) / 2;
}

struct TinyGlyph {
  char character;
  uint8_t rows[5];
};

// Natural notes use double-height letters; sharp notes stack two small glyphs.
constexpr TinyGlyph GLYPHS[] = {
  {'A', {2, 5, 7, 5, 5}},
  {'B', {6, 5, 6, 5, 6}},
  {'C', {7, 4, 4, 4, 7}},
  {'D', {6, 5, 5, 5, 6}},
  {'E', {7, 4, 6, 4, 7}},
  {'F', {7, 4, 6, 4, 4}},
  {'G', {7, 4, 5, 5, 7}},
  {'#', {5, 7, 5, 7, 5}}
};

template <typename Canvas>
void drawGlyph(Canvas &canvas, char character, int x, int y, uint16_t color,
               int scaleY = NOTE_SCALE_Y) {
  for (const TinyGlyph &glyph : GLYPHS) {
    if (glyph.character != character) continue;
    for (int row = 0; row < 5; ++row) {
      for (int column = 0; column < 3; ++column) {
        if (glyph.rows[row] & (1 << (2 - column))) {
          for (int dy = 0; dy < scaleY; ++dy) {
            canvas.drawPixel(x + column, y + row * scaleY + dy, color);
          }
        }
      }
    }
    return;
  }
}

template <typename Canvas>
void drawPitch(Canvas &canvas, int band, const PitchLabel &pitch, uint16_t color) {
  // Every label is three pixels wide, centered under its bar.
  const int x = bandCenter(band) - 1;
  if (pitch.sharp) {
    drawGlyph(canvas, pitch.letter, x, SHARP_LETTER_Y, color, 1);
    drawGlyph(canvas, '#', x, SHARP_SIGN_Y, color, 1);
  } else {
    drawGlyph(canvas, pitch.letter, x, NOTE_Y, color);
  }
}

}  // namespace SpectrumUi
