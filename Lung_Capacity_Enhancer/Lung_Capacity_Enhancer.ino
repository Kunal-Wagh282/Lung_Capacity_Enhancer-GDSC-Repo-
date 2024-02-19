#include <LiquidCrystal.h>
#include <SoftwareSerial.h>
#include "melody_function.h"
#include "levels_function.h"
// Define all pin
#define SENSOR 2
#define BUZZER_PIN 12
#define RED1 14
#define RED2 15
#define YELLOW1 16
#define YELLOW2 17
#define GREEN 18
// SoftwareSerial for Bluetooth communication
SoftwareSerial bluetooth(10, 11); // RX, TX pins for HC-05 module 
LiquidCrystal lcd(8, 7, 6, 5, 4, 3); // LiquidCrystal for LCD display
float Main_intrrupt_count = 0.0;
float Speed_intrrupt_count = 0.0;
bool flag=true;
float l1=1.25,l2=2.5,l3=3.75,l4=5.0,l5=6.25,s;      
int age=12,t=6.25;// Initial age and threshold time
unsigned long blowStartTime=0;
const unsigned long blowStopinterval = 7000;// Time interval for the game
const unsigned long interval2 = 1500;// Time interval for the game over sound
String data="0.00,0.00;";
float l_hour;
unsigned long currentTime;
unsigned long cloopTime;
unsigned long nowTime;
float durationInSeconds;
String receivedData;

void setup() {
      Serial.begin(9600); // Initialize serial communication
      pinMode(BUZZER_PIN, OUTPUT);
      bluetooth.begin(9600);
      lcd.begin(16, 2);
      analogWrite(9, 75);
      lcd.setCursor(0, 0);
      lcd.print("   !!Welcome!!");
      lcd.setCursor(0, 1);
      lcd.print("   CONNECT B_T");
      start(BUZZER_PIN  );// Play the starting melody
      pinMode(SENSOR, INPUT_PULLUP);// Set the blowing interrupt pin as an input with a pull-up resistor
      pinMode(RED1, OUTPUT);
      pinMode(RED2, OUTPUT);
      pinMode(YELLOW1, OUTPUT);
      pinMode(YELLOW2, OUTPUT);
      pinMode(GREEN, OUTPUT);
      attachInterrupt(digitalPinToInterrupt(2), InterruptFunction, RISING); // Attach the interrupt handler
      sei(); // Enable interrupts
      currentTime = millis();
      cloopTime = currentTime;
  }

void resetgame()
{
  analogWrite(9, 75);
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.setCursor(5, 0);
  if (age==0){age=12;}
  lcd.print("AGE=");
  lcd.print(age);
  lcd.setCursor(0, 1);
  lcd.print("   NEXT TURN..!!       ");
  all_off(RED1,RED2,YELLOW1,YELLOW2,GREEN);
  Main_intrrupt_count= 0;
  s=0.00;
  blowStartTime = 0;
  l_hour=0; 
  flag=true;
  bluetooth.println("0.00,0.00");
}

void InterruptFunction()
{
  Main_intrrupt_count++;
  Speed_intrrupt_count ++;
  nowTime=millis();
  if(Main_intrrupt_count>=3 && Main_intrrupt_count<=8)// Start the timer for the game
    {
      blowStartTime = millis();
    }
}
void loop(){
  if(bluetooth.available())
  { 
    
    receivedData = bluetooth.readStringUntil('\n'); // Read the incoming data until newline character
    receivedData.trim();
    age = receivedData.toInt();
    if(age==0){age=12;}
      //Serial.println(receivedValueString);
        if(age<5)
        {
          lcd.clear();
          lcd.setCursor(2, 0);
          lcd.print("INVALID AGE..");
          lcd.setCursor(0, 1);
          lcd.print("ENTER VALID AGE");
        }
        else
        {
          lcd.clear();
          lcd.setCursor(5, 0);
          lcd.print("AGE=");
          lcd.print(age);
          lcd.setCursor(0,1);
          if(age!=12){lcd.print(" START BLOWING");}
          else{lcd.print("   NEXT TURN..!!       ");}
            // Set time thresholds based on age
            //1 LITRES
          if(age<=8 && age>5){l1=0.875;l2=1.50;l3=3.125;l4=3.75;l5=4.5;t=4.5; } 
          //1 LITRES 
          if(age<=12 && age>8){l1=1.875;l2=2.50;l3=3.125;l4=5.75;l5=6.5;t=6.5;}
          //2 LITRES 
          if((age<=16 && age>12)|| (age>40)){l1=3.25;l2=4.5;l3=5.75;l4=7.0;l5=8.25;t=8.25;}
          //4 LITRES
          if(age<=40 && age>25){l1=2.5;l2=5.0;l3=7.5;l4=10.0;l5=12.5;t=12.5;}
          //4.8 LITRES
          if(age<=25 && age>16){l1=3;l2=6;l3=9;l4=12;l5=15;t=15;}   
        }
  } 
   if(age==0){age=12;}
     currentTime = millis();
   // Every second, calculate and print litres/hour
  if(currentTime >= (cloopTime+1000))
  { 
    cloopTime = currentTime; // Updates cloopTime
    // Pulse frequency (Hz) = 7.5Q, Q is flow rate in L/min.
    l_hour = (Speed_intrrupt_count * 1 / 255); // (Pulse frequency x 60 min) / 7.5Q = flowrate in L/hour
    Speed_intrrupt_count = 0; // Reset Counter    
  }
  if (s < l2 && s >=l1){level_1(RED1,RED2,YELLOW1,YELLOW2,GREEN);   }
  else if (s < l3 && s >= l2){level_2(RED1,RED2,YELLOW1,YELLOW2,GREEN) ;  }
  else if (s < l4 && s >= l3) {level_3(RED1,RED2,YELLOW1,YELLOW2,GREEN);}
  else if (s < l5 && s >= l4) {level_4(RED1,RED2,YELLOW1,YELLOW2,GREEN);}
  else if (s >= l5) {level_5(RED1,RED2,YELLOW1,YELLOW2,GREEN);}   
  if(blowStartTime!=0)
  {
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Your_time:");
    lcd.print(s); lcd.print(" Sec");
    lcd.setCursor(0, 1);
    s = (nowTime - blowStartTime) / 1000.0;
    float score=(100*s)/t;// Calculate score
    if(score<100){lcd.print("Score:");lcd.print(score);lcd.print("%");}
    else{lcd.print("Score:");lcd.print("100%");}
    data=String(s)+","+String(l_hour,4)+";";
    bluetooth.println(data);
    Serial.println(data);
  }

  
  if(blowStartTime != 0 && (millis() - nowTime) > interval2 && flag) 
  {  
    tune(s,BUZZER_PIN,l1,l2,l3,l4,l5); 
    flag=false;           
  }
  if(blowStartTime != 0 && (millis() - nowTime) > blowStopinterval ) 
  {     
    over(BUZZER_PIN);// Play the game over melody
    resetgame(); // Reset the game state    
  } 
  delay(500);
}

  