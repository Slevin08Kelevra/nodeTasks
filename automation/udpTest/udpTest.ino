#include <ESP8266WiFi.h>
#include <WiFiUdp.h>

// Set WiFi credentials
#define WIFI_SSID "MIWIFI_2G_qhmE"
#define WIFI_PASS "J6pyy37h"
#define UDP_PORT 8286

// UDP
WiFiUDP UDP;
char packet[255];
char reply[] = "Packet received!";
char repTrue[] = "true";
char repFalse[] = "false";

#define uno 20
#define dos 19
#define tres 18
#define cuatro 17

bool s1 = false;
bool s2 = false;
bool s3 = false;
bool s4 = false;

void setup() {
  // Setup serial port
  Serial.begin(115200);
  Serial.println();

  // Begin WiFi
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

  // If packet received...
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

    if (cmd == "SWITCH_1_ON") {
      digitalWrite(D1, HIGH);
    } else if (cmd == "SWITCH_1_OFF") {
      digitalWrite(D1, LOW);
    } else if (cmd == "SWITCH_2_ON") {
      digitalWrite(D2, HIGH);
    } else if (cmd == "SWITCH_2_OFF") {
      digitalWrite(D2, LOW);
    } else if (cmd == "SWITCH_3_ON") {
      digitalWrite(D3, HIGH);
    } else if (cmd == "SWITCH_3_OFF") {
      digitalWrite(D3, LOW);
    } else if (cmd == "SWITCH_4_ON") {
      digitalWrite(D0, HIGH);
    } else if (cmd == "SWITCH_4_OFF") {
      digitalWrite(D0, LOW);
    }

    // Send return packet
    IPAddress ip = WiFi.localIP();
    ip[3] = 255;
    UDP.beginPacket(ip, 8284);
    //UDP.beginPacket(UDP.remoteIP(), 8284);
    Serial.println("pasa por aqui");
    UDP.write(reply);
    UDP.endPacket();

  }

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
