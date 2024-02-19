#include "pitches.h"

#include <Arduino.h>

// Melody arrays for different tunes  
int melody[] = {
  NOTE_E5, NOTE_E5, REST, NOTE_E5, REST, NOTE_C5, NOTE_E5,
  NOTE_G5, REST, NOTE_G4, REST, 
  NOTE_C5, NOTE_G4, REST, NOTE_E4,
  NOTE_A4, NOTE_B4, NOTE_AS4, NOTE_A4,
  NOTE_G4, NOTE_E5, NOTE_G5, NOTE_A5, NOTE_F5, NOTE_G5,
  REST, NOTE_E5,NOTE_C5, NOTE_D5, NOTE_B4,
  NOTE_C5, NOTE_G4, REST, NOTE_E4,
  NOTE_A4, NOTE_B4, NOTE_AS4, NOTE_A4,
  NOTE_G4, NOTE_E5, NOTE_G5, NOTE_A5, NOTE_F5, NOTE_G5,
  REST, NOTE_E5,NOTE_C5, NOTE_D5, NOTE_B4
};// Melody played during the game
int melody2[]={
NOTE_C5, NOTE_G4, NOTE_E4,
  NOTE_A4, NOTE_B4, NOTE_A4, NOTE_GS4, NOTE_AS4, NOTE_GS4,
  NOTE_G4, NOTE_D4, NOTE_E4
}; // Melody played when the game is over

int durations[] = {
  8, 8, 8, 8, 8, 8, 8,
  4, 4, 8, 4,  
};// Durations of notes in the melodies
int durations1[] = {
  //game over sound
   
  8, 8, 8, 8, 8, 8,
  8, 8, 2
};

void over(int BUZZER_PIN)
{
 int size = sizeof(durations1) / sizeof(int);

  for (int note = 0; note < size; note++) {
    //to calculate the note duration, take one second divided by the note type.
    //e.g. quarter note = 1000 / 4, eighth note = 1000/8, etc.
    int duration = 1000 / durations1[note];
    tone(BUZZER_PIN, melody2[note], duration);

    //to distinguish the notes, set a minimum time between them.
    //the note's duration + 30% seems to work well:
    int pauseBetweenNotes = duration * 1.30;
    delay(pauseBetweenNotes);
    
    //stop the tone playing:
    noTone(BUZZER_PIN);

  }
}


void start(int BUZZER_PIN)// Function to play the starting melody
{
   int size = sizeof(durations) / sizeof(int);

  for (int note = 0; note < size; note++) {
    //to calculate the note duration, take one second divided by the note type.
    //e.g. quarter note = 1000 / 4, eighth note = 1000/8, etc.
    int duration = 1000 / durations[note];
    tone(BUZZER_PIN, melody[note], duration);

    //to distinguish the notes, set a minimum time between them.
    //the note's duration + 30% seems to work well:
    int pauseBetweenNotes = duration * 1.30;
    delay(pauseBetweenNotes);
    
    //stop the tone playing:
    noTone(BUZZER_PIN);
}
}

void tune(int s, int BUZZER_PIN, float l1, float l2, float l3, float l4, float l5){
  // Play different sounds based on the achieved level   
  int c=-1,i;
  if(s >= l5){c=5;}
  else if(s < l5 && s >= l4){c=4;}
  else if(s < l4 && s >= l3){c=3;}
  else if(s < l3 && s >= l2){c=2;}
  else if(s < l2 && s >=l1){c=1;}
  for(i=0;i<c;i++){
          if(s >= l5)//5 lights
          {tone(BUZZER_PIN,NOTE_F5 , 200);delay(200);
          tone(BUZZER_PIN,NOTE_G5 , 400);delay(200);
          tone(BUZZER_PIN,NOTE_A5 , 600);delay(200);
          tone(BUZZER_PIN,NOTE_B5, 800);delay(200);
          tone(BUZZER_PIN,NOTE_C5 , 1000);delay(200);
          noTone(BUZZER_PIN);delay(100);} 
          else if(s < l5 && s >= l4)//4 lights
          {tone(BUZZER_PIN,NOTE_F5 , 200);delay(200);
          tone(BUZZER_PIN,NOTE_G5 , 400);delay(200);
          tone(BUZZER_PIN,NOTE_A5 , 600);delay(200);
          tone(BUZZER_PIN,NOTE_B5, 800);delay(200);
          noTone(BUZZER_PIN);delay(100);}
          else if(s < l4 && s >= l3)//3 lights
          {tone(BUZZER_PIN,NOTE_F5 , 200);delay(200);
          tone(BUZZER_PIN,NOTE_G5 , 400);delay(200);
          tone(BUZZER_PIN,NOTE_A5 , 600);delay(200);
          noTone(BUZZER_PIN);delay(100);}
          else if(s < l2 && s >=0)//1 lights
          {tone(BUZZER_PIN,NOTE_F5 , 200);delay(200);
          noTone(BUZZER_PIN);delay(100);}
          else if(s < l3 && s >= l2)//2 lights
          {tone(BUZZER_PIN,NOTE_F5 , 200);delay(200);
          tone(BUZZER_PIN,NOTE_G5 , 400);delay(200);
          noTone(BUZZER_PIN);delay(100);}
          
  }     
  }
