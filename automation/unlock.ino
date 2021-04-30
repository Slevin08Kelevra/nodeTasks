#include "Keyboard.h"
#include "Mouse.h"

void setup() {

  Serial.begin(9600);

  Mouse.begin();
  Keyboard.begin();

}

void loop() {

  if (Serial.available() > 0) {
    String password = Serial.readString();
    password.trim();
    Mouse.click(MOUSE_LEFT);
    delay(400);
    Keyboard.print(password);
    delay(300);
    Keyboard.press(KEY_RETURN);
    Keyboard.release(KEY_RETURN);

  }

}
