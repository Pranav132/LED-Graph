#include <FastLED.h>

#define NUM_LEDS 450
#define DATA_PIN 5
#define BAUD_RATE 115200

CRGB leds[NUM_LEDS];

void setup() {
  Serial.begin(BAUD_RATE);
  FastLED.addLeds<WS2812, DATA_PIN, GRB>(leds, NUM_LEDS);
}

void loop() {
  if (Serial.available() >= (NUM_LEDS * 3)) {
    for (int i = 0; i < NUM_LEDS; i++) {
      uint8_t r = Serial.read();
      uint8_t g = Serial.read();
      uint8_t b = Serial.read();
      leds[i] = CRGB(r, g, b);
    }
    FastLED.show();
  }
}
