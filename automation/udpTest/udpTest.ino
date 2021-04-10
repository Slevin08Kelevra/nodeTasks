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
