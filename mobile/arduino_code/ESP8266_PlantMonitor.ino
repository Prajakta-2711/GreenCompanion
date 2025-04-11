#include <ESP8266WiFi.h>
#include <Servo.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>

// Wi-Fi credentials
const char* ssid = "your_SSID";
const char* password = "your_PASSWORD";

// WebSocket connection information
const char* websocket_server = "your-server-address.com";
const int websocket_port = 80;
const char* websocket_path = "/ws";

// Servo motor setup
Servo myServo;  // Create a Servo object

// Relay pin for water pump
const int relayPin = D2;  // Relay connected to D2 on ESP8266

// Sensor pins
const int moistureSensorPin = A0;
const int lightSensorPin = D5;
const int dhtPin = D6;  // DHT22 temperature and humidity sensor

// WebSocket client
WebSocketsClient webSocket;

// Timing variables
unsigned long lastSensorReading = 0;
const unsigned long sensorInterval = 30000;  // Read sensors every 30 seconds
bool automaticMode = true;  // Default to automatic mode

void setup() {
  // Start serial communication
  Serial.begin(115200);  // For debugging
  
  // Initialize pins
  pinMode(relayPin, OUTPUT);
  digitalWrite(relayPin, LOW);  // Ensure pump is off initially
  pinMode(lightSensorPin, INPUT);
  
  // Initialize servo motor (connected to D1)
  myServo.attach(D1);
  myServo.write(0);  // Initial position
  
  // Connect to Wi-Fi
  WiFi.begin(ssid, password);
  Serial.println("Connecting to WiFi...");
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("");
  Serial.println("WiFi connected");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
  
  // Initialize WebSocket connection
  Serial.println("Connecting to WebSocket server...");
  webSocket.begin(websocket_server, websocket_port, websocket_path);
  webSocket.onEvent(webSocketEvent);
  webSocket.setReconnectInterval(5000);
}

void loop() {
  webSocket.loop();
  
  // Read and send sensor data periodically
  if (millis() - lastSensorReading > sensorInterval) {
    sendSensorData();
    lastSensorReading = millis();
    
    // If in automatic mode, check if watering is needed
    if (automaticMode) {
      int moisture = readMoistureSensor();
      if (moisture < 400) {  // Adjust threshold as needed for your soil and sensor
        waterPlant(5000);  // Water for 5 seconds
      }
    }
  }
}

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
  switch(type) {
    case WStype_DISCONNECTED:
      Serial.println("WebSocket disconnected");
      break;
    case WStype_CONNECTED:
      Serial.println("WebSocket connected");
      // Send device info upon connection
      sendDeviceInfo();
      break;
    case WStype_TEXT:
      handleWebSocketMessage(payload, length);
      break;
  }
}

void handleWebSocketMessage(uint8_t * payload, size_t length) {
  // Parse JSON command
  DynamicJsonDocument doc(1024);
  DeserializationError error = deserializeJson(doc, payload, length);
  
  if (error) {
    Serial.print("deserializeJson() failed: ");
    Serial.println(error.c_str());
    return;
  }
  
  // Process commands
  String command = doc["command"];
  
  if (command == "water_plant") {
    int duration = doc["duration"] | 3000;  // Default 3 seconds if not specified
    waterPlant(duration);
  } 
  else if (command == "move_servo") {
    int angle = doc["angle"] | 90;  // Default 90 degrees if not specified
    myServo.write(angle);
  }
  else if (command == "set_mode") {
    automaticMode = doc["automatic"] | true;
    String modeStr = automaticMode ? "automatic" : "manual";
    Serial.print("Mode set to: ");
    Serial.println(modeStr);
  }
  else if (command == "request_data") {
    sendSensorData();
  }
}

void sendDeviceInfo() {
  DynamicJsonDocument doc(1024);
  doc["type"] = "device_info";
  doc["id"] = WiFi.macAddress();
  doc["ip"] = WiFi.localIP().toString();
  doc["name"] = "PlantCare_ESP8266";
  doc["capabilities"] = "moisture,light,temperature,humidity,pump,servo";
  
  String jsonStr;
  serializeJson(doc, jsonStr);
  webSocket.sendTXT(jsonStr);
}

void sendSensorData() {
  int moistureValue = readMoistureSensor();
  int lightValue = readLightSensor();
  float temperature = readTemperature();
  float humidity = readHumidity();
  
  // Create JSON document
  DynamicJsonDocument doc(1024);
  doc["type"] = "sensor_data";
  doc["device_id"] = WiFi.macAddress();
  doc["timestamp"] = millis();
  
  JsonObject data = doc.createNestedObject("data");
  data["moisture"] = moistureValue;
  data["light"] = lightValue;
  data["temperature"] = temperature;
  data["humidity"] = humidity;
  
  // Convert to string and send
  String jsonStr;
  serializeJson(doc, jsonStr);
  webSocket.sendTXT(jsonStr);
  
  // Print data for debugging
  Serial.print("Sending sensor data - Moisture: ");
  Serial.print(moistureValue);
  Serial.print(", Light: ");
  Serial.print(lightValue);
  Serial.print(", Temp: ");
  Serial.print(temperature);
  Serial.print("°C, Humidity: ");
  Serial.print(humidity);
  Serial.println("%");
}

void waterPlant(int duration) {
  // Send status update
  DynamicJsonDocument doc(256);
  doc["type"] = "status_update";
  doc["status"] = "watering_started";
  doc["device_id"] = WiFi.macAddress();
  
  String jsonStr;
  serializeJson(doc, jsonStr);
  webSocket.sendTXT(jsonStr);
  
  // Position servo over plant
  myServo.write(90);
  delay(500);
  
  // Turn on the pump
  digitalWrite(relayPin, HIGH);
  Serial.print("Watering plant for ");
  Serial.print(duration / 1000);
  Serial.println(" seconds...");
  
  // Keep the pump on for the specified duration
  delay(duration);
  
  // Turn off the pump
  digitalWrite(relayPin, LOW);
  
  // Return servo to home position
  myServo.write(0);
  
  // Send status update
  doc["status"] = "watering_completed";
  serializeJson(doc, jsonStr);
  webSocket.sendTXT(jsonStr);
  
  Serial.println("Watering completed");
}

// Sensor reading functions
int readMoistureSensor() {
  // Read the moisture sensor
  int value = analogRead(moistureSensorPin);
  // Map the value if needed based on your sensor's range
  // Lower values typically indicate higher moisture
  return value;
}

int readLightSensor() {
  // Read the light sensor (photoresistor or LDR)
  // This assumes a digital read, change if using analog
  return digitalRead(lightSensorPin) == HIGH ? 1000 : 0;
}

float readTemperature() {
  // This is a placeholder - implement with your temperature sensor
  // If using DHT22, you'd need the DHT library
  // For this example, we'll return a simulated value
  return 22.5 + (random(0, 100) / 50.0);  // 22.5-24.5°C range
}

float readHumidity() {
  // This is a placeholder - implement with your humidity sensor
  // If using DHT22, you'd need the DHT library
  // For this example, we'll return a simulated value
  return 45.0 + (random(0, 100) / 10.0);  // 45-55% range
}
