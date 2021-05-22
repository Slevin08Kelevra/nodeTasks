#include <ESP8266WiFi.h>
#include <WiFiUdp.h>

// Set WiFi credentials
#define WIFI_SSID "MIWIFI_2G_qhmE"
#define WIFI_PASS "J6pyy37h"
#define UDP_PORT 8286

// UDP
WiFiUDP UDP;
char packet[255];
char reply[] = "0:0:0:0";

bool s1 = false;
bool s2 = false;
bool s3 = false;
bool s0 = false;

void setup() {
  // Setup serial port
  Serial.begin(115200);
  Serial.println();

  WiFi.setOutputPower(5);
  WiFi.begin(WIFI_SSID, WIFI_PASS);

  // Connecting to WiFi...
  Serial.print("Connecting to ");
  Serial.print(WIFI_SSID);
  // Loop continuously while WiFi is not connected
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(100);
    Serial.print(".");
  }

  // Connected to WiFi
  Serial.println();
  Serial.print("Connected! IP address: ");
  Serial.println(WiFi.localIP());

  // Begin listening to UDP port
  UDP.begin(UDP_PORT);
  Serial.print("Listening on UDP port ");
  Serial.println(UDP_PORT);

  pinMode(D1, OUTPUT);
  delay(100);
  digitalWrite(D1, LOW);
  pinMode(D2, OUTPUT);
  delay(100);
  digitalWrite(D2, LOW);
  pinMode(D3, OUTPUT);
  delay(100);
  digitalWrite(D3, LOW);
  pinMode(D0, OUTPUT);
  delay(100);
  digitalWrite(D0, LOW);

}

void loop() {

  bool doSomeThing = false;
  int packetSize = UDP.parsePacket();
  if (packetSize) {
    Serial.print("Received packet! Size: ");
    Serial.println(packetSize);
    int len = UDP.read(packet, 255);
    if (len > 0)
    {
      packet[len] = '\0';
    }
    Serial.print("Packet received: ");
    Serial.println(packet);

    String cmd = charToString(packet);

    doSomeThing = (cmd.startsWith("SWITCH_")) ? true : false;

    if (cmd == "SWITCH_1_ON") {
      digitalWrite(D1, HIGH);
      s1 = true;
    } else if (cmd == "SWITCH_1_OFF") {
      digitalWrite(D1, LOW);
      s1 = false;
    } else if (cmd == "SWITCH_2_ON") {
      digitalWrite(D2, HIGH);
      s2 = true;
    } else if (cmd == "SWITCH_2_OFF") {
      digitalWrite(D2, LOW);
      s2 = false;
    } else if (cmd == "SWITCH_3_ON") {
      digitalWrite(D3, HIGH);
      s3 = true;
    } else if (cmd == "SWITCH_3_OFF") {
      digitalWrite(D3, LOW);
      s3 = false;
    } else if (cmd == "SWITCH_4_ON") {
      digitalWrite(D0, HIGH);
      s0 = true;
    } else if (cmd == "SWITCH_4_OFF") {
      digitalWrite(D0, LOW);
      s0 = false;
    } else if (cmd == "SWITCH_STATUS") {
      //DO NOTHING
    } else {
      doSomeThing = false;
    }

    if (doSomeThing) {
      IPAddress ip = WiFi.localIP();
      ip[3] = 255;
      UDP.beginPacket(ip, 8284);

      Serial.println("pasa por aqui");
      String resutl = String(s1);

      reply[0] = (s0) ? '1' : '0';
      reply[2] = (s1) ? '1' : '0';
      reply[4] = (s2) ? '1' : '0';
      reply[6] = (s3) ? '1' : '0';
      UDP.write(reply);

      UDP.endPacket();
    }

  }

  delay(4);
}

String charToString(const char S[])
{
  byte at = 0;
  const char *p = S;
  String D = "";

  while (*p++) {
    D.concat(S[at++]);
  }

  return D;
}
