#include <ESP8266WiFi.h>
#include <ArduinoJson.h>
 
const char* ssid = "Vivek2.4g";
const char* password = "VISH@123";
 
int ledPin = 16; // GPIO16

// Main Config
String device_name = "DEVICE1";
bool risk = false;

// Analog Array Variable
byte total_analog_pins = 6;
long analog_pin_data[6];

// Digital Input Array Variable
byte total_digiIN_pins = 6;
byte digiIN_pin_data[6];

// Digital Output Array Variable
byte total_digiOUT_pins = 6;
byte digiOUT_pin_data[6];


// Request Variables
int MODE = 0;
String OPTION = "NA";
String PARAMETERS = "NA";


WiFiServer server(80);

// ------------------------------------
// SETUP()
// ------------------------------------
void setup() {
  Serial.begin(115200);
  delay(10);
 
  pinMode(ledPin, OUTPUT);
  digitalWrite(ledPin, LOW);
 
  // Connect to WiFi network
  Serial.println();
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);
 
  WiFi.begin(ssid, password);
 
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("WiFi connected");
 
  // Start the server
  server.begin();
  Serial.println("Server started");
 
  // Print the IP address
  Serial.print("Use this URL to connect: ");
  Serial.print("http://");
  Serial.print(WiFi.localIP());
  Serial.println("/");
 
}



// ------------------------------------
// LOOP()
// ------------------------------------
void loop() {

  digitalWrite(ledPin, LOW);
  
  // Check if a client has connected
  WiFiClient client = server.available();
  if (!client) {
    return;
  }
 
  // Wait until the client sends some data
  Serial.println("new client");
  while(!client.available()){
    delay(1);
  }
 
  // Read the first line of the request
  String request = client.readStringUntil('\r');
 
  // Request Handling
  // http://192.168.1.20/KIV&MODE=COLLECT:OPTION=OPTION:PARAMETER=PARAMETERS&
  requestHandling(getValue(request,'&', 1));

  client.flush();


  // Request MODE Processing
  
  // Allocate a temporary JsonDocument
  // Use arduinojson.org/v6/assistant to compute the capacity.
  StaticJsonDocument<500> doc;

  // ------- MODE HANDLING START ---------

  switch(MODE)
  {

     // ------- COLLECT ------------
     case 1 :

            {
            digitalWrite(ledPin, HIGH);    
            Serial.println("REQUEST : MODE=COLLECT");        
            Serial.println("COLLECT : START");  

            // Read Data from pins and update Array
            readDataAndUpdate();
           
            // Add values in the document
            doc["REQ_STATUS"] = "COLLECT";
            doc["DEVICE_NAME"] = device_name;
            doc["TIME"] = 1351824120;  
            doc["RISK"] = risk;        
            
            // Add an array.
            JsonArray analog_data = doc.createNestedArray("ANALOG");
            for (byte an_i = 0; an_i < total_analog_pins; an_i = an_i + 1) {
              analog_data.add(analog_pin_data[an_i]);
            }

            JsonArray digiIN_data = doc.createNestedArray("DIGITALIN");
            for (byte dIN_i = 0; dIN_i < total_digiIN_pins; dIN_i = dIN_i + 1) {
              digiIN_data.add(digiIN_pin_data[dIN_i]);
            }

            JsonArray digiOUT_data = doc.createNestedArray("DIGITALOUT");
            for (byte dOUT_i = 0; dOUT_i < total_digiOUT_pins; dOUT_i = dOUT_i + 1) {
              digiOUT_data.add(digiOUT_pin_data[dOUT_i]);
            }         
            
            
            
            Serial.print(F("Sending: "));
            serializeJson(doc, Serial);
            Serial.println();
            Serial.println("COLLECT : END");
            digitalWrite(ledPin, LOW);
            }

     break;

     // ------- INFO ------------
     case 2 :

              {
              digitalWrite(ledPin, HIGH);    
              Serial.println("REQUEST : MODE=INFO");          
              Serial.println("INFO : START"); 
                          
              doc["REQ_STATUS"] = "INFO";
              doc["RISK"] = risk;
              doc["DEVICE_NAME"] = device_name;
              doc["NETWORK_NAME"] = WiFi.SSID();
              doc["SIGNAL"] = WiFi.RSSI();
              doc["WIFI_STATUS"] = WiFi.status();

              Serial.print(F("Sending: "));
              serializeJson(doc, Serial);
              Serial.println();
              Serial.println("INFO : END");
              digitalWrite(ledPin, LOW);
              }

     break;


     // ------- CONTROL ------------
     case 3 :

              {
              digitalWrite(ledPin, HIGH);    
              Serial.println("REQUEST : PROCESS");
              Serial.println("PROCESS : START");
          
          
              Serial.println("PROCESS : END");
              digitalWrite(ledPin, LOW);
              }

     break;


     // ------- NO REQUEST ------------
     default :

              {
              digitalWrite(ledPin, HIGH);    
              Serial.println("NO REQUEST : Send Default Data");
              // Add values in the document
              doc["REQ_STATUS"] = "DEFAULT";
              doc["RISK"] = risk;
              doc["DEVICE_NAME"] = device_name;
              doc["NETWORK_NAME"] = WiFi.SSID();
              doc["SIGNAL"] = WiFi.RSSI();
              doc["WIFI_STATUS"] = WiFi.status(); 
                         
              
              Serial.print(F("Sending: "));
              serializeJson(doc, Serial);
              Serial.println();
              digitalWrite(ledPin, LOW);
              }

     break;
     
  }
  // ----- MODE HANDLING END --------



  // Sending Response Back to Client
  // Write response headers
  client.println(F("HTTP/1.0 200 OK"));
  client.println(F("Content-Type: application/json"));
  client.println(F("Connection: close"));
  client.print(F("Content-Length: "));
  client.println(measureJsonPretty(doc));
  client.println();

  // Write JSON document
  serializeJsonPretty(doc, client);
  // Disconnect
  //client.stop();
 
  delay(1);
  Serial.println("Client disonnected");
  Serial.println("");
  
 
} // ---- MAIN END -------

// ========= FUNCTIONS =================


// ----------------------------------------
// Read Data From Pins and Update Array
// ----------------------------------------
void readDataAndUpdate()
{
   analog_pin_data[0] = random(230);
   analog_pin_data[1] = random(230);
   analog_pin_data[2] = random(230);
   analog_pin_data[3] = random(230);
   analog_pin_data[4] = random(230);
   analog_pin_data[5] = random(230);

   digiIN_pin_data[0] = random(2);
   digiIN_pin_data[1] = random(2);
   digiIN_pin_data[2] = random(2);
   digiIN_pin_data[3] = random(2);
   digiIN_pin_data[4] = random(2);
   digiIN_pin_data[5] = random(2);

   digiOUT_pin_data[0] = random(2);
   digiOUT_pin_data[1] = random(2);
   digiOUT_pin_data[2] = random(2);
   digiOUT_pin_data[3] = random(2);
   digiOUT_pin_data[4] = random(2);
   digiOUT_pin_data[5] = random(2);

  
}

// -----------------------------------------
// Request Handling
// -----------------------------------------
void requestHandling(String main_request) 
{
    Serial.println("------------------------------");
    Serial.println("Request Handling..");
    Serial.println(main_request);

    String each_request = "NA";
    each_request = getValue(main_request,':', 0);
    String each_mode = getValue(each_request,'=', 1);
    if(each_mode == "COLLECT")
    {
      MODE = 1;
    } else if(each_mode == "INFO") {
      MODE = 2;
    } else if(each_mode == "CONTROL") {
      MODE = 3;
    } else {
      MODE = 0;
    }
    Serial.println(MODE);
  
    each_request = getValue(main_request,':', 1);
    OPTION = getValue(each_request,'=', 1);
    Serial.println(OPTION);
  
    each_request = getValue(main_request,':', 2);
    PARAMETERS = getValue(each_request,'=', 1);
    Serial.println(PARAMETERS);

    Serial.println("------------------------------");
  
}


// -----------------------------------------
// Parse String 
// -----------------------------------------
String getValue(String data, char separator, int index)
{
    int found = 0;
    int strIndex[] = { 0, -1 };
    int maxIndex = data.length() - 1;

    for (int i = 0; i <= maxIndex && found <= index; i++) {
        if (data.charAt(i) == separator || i == maxIndex) {
            found++;
            strIndex[0] = strIndex[1] + 1;
            strIndex[1] = (i == maxIndex) ? i+1 : i;
        }
    }
    return found > index ? data.substring(strIndex[0], strIndex[1]) : "";
}
