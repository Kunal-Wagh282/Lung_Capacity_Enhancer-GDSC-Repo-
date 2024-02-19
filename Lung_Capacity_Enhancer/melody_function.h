

#ifndef MELODY_FUNCTION_H
#define MELODY_FUNCTION_H
#include <Arduino.h>


void tone(uint8_t _pin, unsigned int frequency, unsigned long duration);
void noTone(uint8_t _pin);
void over(int BUZZER_PIN);
void start(int BUZZER_PIN);
void tune(int s, int BUZZER_PIN, float l1, float l2, float l3, float l4, float l5);

#endif
