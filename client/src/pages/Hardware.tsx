import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { InfoIcon, DropletIcon, SunIcon, ThermometerIcon, CloudRainIcon, AlertTriangleIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Interface for sensor data
interface SensorData {
  moisture: number;
  light: number;
  temperature: number;
  humidity: number;
  timestamp: Date;
}

export default function Hardware() {
  const [sensorData, setSensorData] = useState<SensorData>({
    moisture: 0,
    light: 0,
    temperature: 0,
    humidity: 0,
    timestamp: new Date()
  });
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectCount, setReconnectCount] = useState(0);
  const { toast } = useToast();
  
  // Connect to WebSocket and handle sensor data
  useEffect(() => {
    let ws: WebSocket;
    let reconnectTimeout: NodeJS.Timeout;
    
    const connectWebSocket = () => {
      // Create WebSocket connection
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        
        // Reset reconnect count after successful connection
        if (reconnectCount > 0) {
          setReconnectCount(0);
          toast({
            title: 'Connection Restored',
            description: 'Successfully reconnected to hardware sensors',
          });
        }
      };
      
      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.type === 'sensor_data') {
            setSensorData({
              ...message.data,
              timestamp: new Date(message.data.timestamp)
            });
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        
        // Try to reconnect with exponential backoff
        const reconnectDelay = Math.min(1000 * Math.pow(2, reconnectCount), 30000);
        console.log(`Reconnecting in ${reconnectDelay}ms...`);
        
        reconnectTimeout = setTimeout(() => {
          setReconnectCount(prev => prev + 1);
          connectWebSocket();
        }, reconnectDelay);
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    };
    
    connectWebSocket();
    
    // Cleanup on unmount
    return () => {
      if (ws) {
        ws.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, [reconnectCount, toast]);
  
  // Simulate sensor data for demo purposes
  useEffect(() => {
    // Only use simulation if no real data is being received
    if (sensorData.moisture === 0) {
      const simulationInterval = setInterval(() => {
        // Generate random sensor data
        const simulatedData = {
          moisture: Math.floor(Math.random() * 900) + 100,
          light: Math.floor(Math.random() * 800) + 100, 
          temperature: 20 + (Math.random() * 10),
          humidity: 40 + (Math.random() * 40),
          timestamp: new Date()
        };
        
        setSensorData(simulatedData);
      }, 5000);
      
      return () => clearInterval(simulationInterval);
    }
  }, [sensorData.moisture]);
  
  // Determine moisture status and color
  const getMoistureStatus = () => {
    if (sensorData.moisture < 300) {
      return { status: 'Dry', color: 'text-red-500', bgColor: 'bg-red-100', progress: 20 };
    } else if (sensorData.moisture < 600) {
      return { status: 'Moderate', color: 'text-yellow-500', bgColor: 'bg-yellow-100', progress: 60 };
    } else {
      return { status: 'Moist', color: 'text-green-500', bgColor: 'bg-green-100', progress: 90 };
    }
  };
  
  // Determine light status and color
  const getLightStatus = () => {
    if (sensorData.light < 200) {
      return { status: 'Low', color: 'text-blue-500', bgColor: 'bg-blue-100', progress: 20 };
    } else if (sensorData.light < 600) {
      return { status: 'Medium', color: 'text-yellow-500', bgColor: 'bg-yellow-100', progress: 60 };
    } else {
      return { status: 'Bright', color: 'text-orange-500', bgColor: 'bg-orange-100', progress: 90 };
    }
  };
  
  // Format timestamp
  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString();
  };
  
  const moistureStatus = getMoistureStatus();
  const lightStatus = getLightStatus();
  
  return (
    <div className="flex flex-col p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Hardware Monitoring</h1>
        <Badge variant={isConnected ? 'default' : 'destructive'}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </Badge>
      </div>
      
      {!isConnected && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangleIcon className="h-4 w-4" />
          <AlertTitle>Connection Lost</AlertTitle>
          <AlertDescription>
            Cannot connect to hardware sensors. Attempting to reconnect... 
            (Attempt {reconnectCount})
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <DropletIcon className="mr-2 h-5 w-5 text-blue-500" />
              Soil Moisture
            </CardTitle>
            <CardDescription>Current soil moisture level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Reading: {sensorData.moisture}</span>
                <span className={`font-semibold ${moistureStatus.color}`}>{moistureStatus.status}</span>
              </div>
              <Progress value={moistureStatus.progress} className={moistureStatus.bgColor} />
              <p className="text-sm text-muted-foreground">
                Threshold: 400 (below this value, soil is considered dry)
              </p>
              {sensorData.moisture < 400 && (
                <Alert>
                  <AlertTriangleIcon className="h-4 w-4" />
                  <AlertTitle>Low Moisture Alert</AlertTitle>
                  <AlertDescription>
                    Soil moisture is below recommended level. Consider watering your plant soon.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <SunIcon className="mr-2 h-5 w-5 text-yellow-500" />
              Light Level
            </CardTitle>
            <CardDescription>Current light intensity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Reading: {sensorData.light}</span>
                <span className={`font-semibold ${lightStatus.color}`}>{lightStatus.status}</span>
              </div>
              <Progress value={lightStatus.progress} className={lightStatus.bgColor} />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="temperature">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="temperature">Temperature</TabsTrigger>
          <TabsTrigger value="humidity">Humidity</TabsTrigger>
        </TabsList>
        
        <TabsContent value="temperature" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <ThermometerIcon className="mr-2 h-5 w-5 text-red-500" />
                Temperature
              </CardTitle>
              <CardDescription>Current temperature in Celsius</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-center my-6">
                {sensorData.temperature.toFixed(1)}°C
              </div>
              <div className="text-sm text-muted-foreground text-center">
                Last updated: {formatTimestamp(sensorData.timestamp)}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="humidity" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <CloudRainIcon className="mr-2 h-5 w-5 text-blue-500" />
                Humidity
              </CardTitle>
              <CardDescription>Current humidity percentage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-center my-6">
                {sensorData.humidity.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground text-center">
                Last updated: {formatTimestamp(sensorData.timestamp)}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center">
            <InfoIcon className="mr-2 h-5 w-5" />
            Connection Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li><strong>Status:</strong> {isConnected ? 'Connected' : 'Disconnected'}</li>
            <li><strong>Last Data Received:</strong> {formatTimestamp(sensorData.timestamp)}</li>
            <li><strong>Reconnection Attempts:</strong> {reconnectCount}</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center">
            <InfoIcon className="mr-2 h-5 w-5" />
            Hardware Setup Guide
          </CardTitle>
          <CardDescription>How to set up ESP8266 for plant monitoring</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Components Needed</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>ESP8266 NodeMCU</li>
                <li>Arduino UNO (optional, for more sensors)</li>
                <li>Soil Moisture Sensor</li>
                <li>Light Sensor (LDR)</li>
                <li>DHT11/DHT22 Temperature & Humidity Sensor</li>
                <li>Servo Motor (for automatic watering)</li>
                <li>5V Relay Module and Water Pump (for automatic watering)</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Connections</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Soil Moisture Sensor: Analog pin (A0)</li>
                <li>Light Sensor: Analog pin (A1)</li>
                <li>DHT Sensor: Digital pin (D4)</li>
                <li>Servo Motor: D1 pin</li>
                <li>Relay Module: D2 pin (for water pump control)</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Code Setup</h3>
              <p className="text-sm">
                Upload the following code to your ESP8266. Make sure to update the Wi-Fi credentials 
                and WebSocket server URL to match your PlantPal installation.
              </p>
              <div className="bg-slate-100 p-3 rounded-md text-xs mt-2 overflow-auto max-h-40">
                <pre>{`#include <ESP8266WiFi.h>
#include <Servo.h>

// Wi-Fi credentials
const char* ssid = "your_SSID";
const char* password = "your_PASSWORD";

// Servo motor setup
Servo myServo;  // Create a Servo object

// Relay pin
const int relayPin = D2;  // Relay connected to D2 on ESP8266

void setup() {
  // Start serial communication
  Serial.begin(115200);  // For debugging
  Serial1.begin(9600);    // Communication with Arduino via Serial1

  // Initialize relay pin
  pinMode(relayPin, OUTPUT);
  digitalWrite(relayPin, LOW);  // Ensure pump is off initially
  
  // Initialize servo motor (connected to D1)
  myServo.attach(D1);
  
  // Connect to Wi-Fi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi!");
}

void loop() {
  if (Serial1.available()) {
    String sensorData = Serial1.readString();  // Read data from Arduino
    
    // Parse the sensor values
    int moistureValue = sensorData.substring(
      sensorData.indexOf("moisture=") + 9, 
      sensorData.indexOf("\\n")).toInt();
    
    // Automatic watering logic
    if (moistureValue < 400) {
      digitalWrite(relayPin, HIGH);  // Turn on water pump
      myServo.write(90);  // Move servo to watering position
    } else {
      digitalWrite(relayPin, LOW);   // Turn off water pump
      myServo.write(0);   // Move servo back
    }
  }
  
  delay(5000);  // Check every 5 seconds
}`}</pre>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">WebSocket Integration</h3>
              <p className="text-sm">
                To send sensor data to PlantPal, add these WebSocket calls to your ESP8266 code:
              </p>
              <div className="bg-slate-100 p-3 rounded-md text-xs mt-2 overflow-auto max-h-32">
                <pre>{`#include <WebSocketsClient.h>
#include <ArduinoJson.h>

WebSocketsClient webSocket;

// In setup():
webSocket.begin("your-plantpal-server.com", 80, "/ws");
webSocket.onEvent(webSocketEvent);
webSocket.setReconnectInterval(5000);

// Send sensor data:
DynamicJsonDocument doc(1024);
doc["type"] = "sensor_data";
doc["data"]["moisture"] = moistureValue;
doc["data"]["light"] = lightValue;
doc["data"]["temperature"] = temperature;
doc["data"]["humidity"] = humidity;
doc["data"]["plantId"] = 1;  // Set to your plant ID

String json;
serializeJson(doc, json);
webSocket.sendTXT(json);`}</pre>
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground mt-4">
              Note: For detailed instructions and troubleshooting, refer to the project's GitHub repository.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}