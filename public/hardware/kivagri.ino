#include "config.h"
#include "FirebaseESP8266.h"
#include <ESP8266WiFi.h>
#include <ArduinoJson.h>


// ****************************************
// ---------- Global Main Variables -------
// ****************************************

// Control Device Operation
#define MAX_CONTROL_STATUS                     11

#define DEVICE_ACTIVE_STATUS                   0
#define DEVICE_REALTIMEUPDATE_STATUS           1
#define DEVICE_HANDLING_STATUS                 2
#define DEVICE_FREEZ                           3
#define DEVICE_RISK                            4
#define DEVICE_ONE_TIME_OPERATION              5
#define DEVICE_RESTART                         6
#define DEVICE_FIREBASE_UPDATE                 7
#define DEVICE_UPDATE_CONTROL                  8
#define DEVICE_UPDATE_DOUT                     9
#define DEVICE_REINIT                          10

bool DEVICE_CONTROL_STATUS[MAX_CONTROL_STATUS];


// Device Handling Function Mode
String DEVICE_FCN_MODE = "NA";


// Timer Information
#define TASK_TIMER 10000 // Timer 3 Sec
#define DELAY_TIMER 1000 // Timer 3 Sec

// Define FirebaseESP8266 data object for data sending and receiving
FirebaseData firebaseData;

// REALTIME DATABASE Parameter's
unsigned long refereshDeviceDataPrevMills = 0;
String DB_BASE_PATH = "/" + MAIN_PROJECT_NAME + "/DEVICE/" + MAIN_DEVICE_NAME;
uint16_t DB_REALTIME_CNT = 0;
uint16_t MAX_DB_REALTIME_CNT = 10;



// ------ Function Declaration -------------




// ****************************************
// ---------- PIN Configuration -----------
// ****************************************
#define MAXPINCONFIG   16
String AID[MAXPINCONFIG] = {"AID0", "AID1", "AID2", "AID3", "AID4", "AID5", "AID6", "AID7", "AID8", "AID9", "AID10", "AID11", "AID12", "AID13", "AID14" , "AID15" };
String DINID[MAXPINCONFIG] = {"DINID0" , "DINID1" , "DINID2" , "DINID3" , "DINID4" , "DINID5" , "DINID6" , "DINID7" , "DINID8" , "DINID9" ,"DINID10" ,"DINID11" ,"DINID12" ,"DINID13" , "DINID14" , "DINID15" };
String DOUTID[MAXPINCONFIG] = {"DOUTID0", "DOUTID1", "DOUTID2", "DOUTID3", "DOUTID4", "DOUTID5", "DOUTID6", "DOUTID7", "DOUTID8", "DOUTID9", "DOUTID10", "DOUTID11", "DOUTID12", "DOUTID13", "DOUTID14" , "DOUTID15" };

#define ANALOGIDX  0
#define DIGIINIDX  1
#define DIGIOUTIDX 2

struct ANALOG_PIN_CONFIG
{
  byte PIN;
  bool STATUS;  
  bool CHANGE_STATUS;
  uint16_t INIT;
  uint16_t DATA;
  uint16_t DATA_BUFF;
  uint8_t CONFACTOR;
  uint8_t CNGFACTOR;
  uint16_t MIN;
  uint16_t MAX;
} ANALOGDATA[MAXPINCONFIG];

struct DIGITAL_PIN_CONFIG
{
  byte PIN;
  bool STATUS;  
  bool CHANGE_STATUS;
  bool INIT;
  bool DATA;
  bool DATA_BUFF;
} DIGIINDATA[MAXPINCONFIG], DIGIOUTDATA[MAXPINCONFIG];


// Server Request Variables
#define NOREQUEST_MODE            0
#define COLLECT_ANALOG_MODE       1
#define COLLECT_DIGIIN_MODE       2
#define COLLECT_DIGIOUT_MODE      3
#define INFO_MODE                 4
#define CONTROL_DOUT_MODE         5
#define RESTART_MODE              6
#define REINIT_MODE               7

	
byte MODE = 0;
String OPTION = "NA";
String PARAMETERS = "NA";


WiFiServer server(80);

// ------------------------------------
// SETUP()
// ------------------------------------
void setup() {

  // Init Serial Communication
  Serial.begin(115200);
  delay(10);

  // Init Control Status
  DEVICE_CONTROL_STATUS[DEVICE_ACTIVE_STATUS]  = false;
  DEVICE_CONTROL_STATUS[DEVICE_REALTIMEUPDATE_STATUS]  = false;
  DEVICE_CONTROL_STATUS[DEVICE_HANDLING_STATUS]  = false;
  DEVICE_CONTROL_STATUS[DEVICE_FREEZ] = false;
  DEVICE_CONTROL_STATUS[DEVICE_RISK] = false;
  DEVICE_CONTROL_STATUS[DEVICE_ONE_TIME_OPERATION] = true;
  DEVICE_CONTROL_STATUS[DEVICE_RESTART] = false;
  DEVICE_CONTROL_STATUS[DEVICE_FIREBASE_UPDATE] = true;
  DEVICE_CONTROL_STATUS[DEVICE_UPDATE_CONTROL] = true;
  DEVICE_CONTROL_STATUS[DEVICE_UPDATE_DOUT] = false;
  DEVICE_CONTROL_STATUS[DEVICE_REINIT] = false;
  
  
  
  

  // ------- Pin Configuration ----------------
 

  // ------- WiFi Configuration ----------------
  // Connect to WiFi network
  printData("Connecting to ");
  printData(WIFI_SSID);
 
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
 
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  printData("");
  printData("WiFi connected");
 
  // Start the server
  server.begin();
  printData("Server started");
 
  // Print the IP address
  Serial.print("Use this URL to connect: ");
  Serial.print("http://");
  Serial.print(WiFi.localIP());
  printData("/");

  //Set your Firebase info
  Firebase.begin(FIREBASE_HOST, FIREBASE_AUTH);
  //Enable auto reconnect the WiFi when connection lost
  Firebase.reconnectWiFi(true);

  //Set the size of WiFi rx/tx buffers in the case where we want to work with large data.
  firebaseData.setBSSLBufferSize(2048, 2048);
  //Set the size of HTTP response buffers in the case where we want to work with large data.
  firebaseData.setResponseSize(2048);
  
  if (!Firebase.beginStream(firebaseData, DB_BASE_PATH))
  {

      Serial.println("------------------------------------");
      Serial.println("Can't begin stream connection...");
      Serial.println("REASON: " + firebaseData.errorReason());
      Serial.println("------------------------------------");
      Serial.println();

  }

  // Update Device Data
  readDeviceDataAndUpdate();
  
 
}



// ------------------------------------
// LOOP()
// ------------------------------------
void loop() {


  // Buffering Function
  taskBuffering();
  
  
  // Check if a client has connected
  WiFiClient client = server.available();
  if (!client) {
    //printData("No Client Request .....");
    return;
  }
 
  // Wait until the client sends some data
  printData("New Client Connected ..... ");
  while(!client.available()){
    delay(1);
  }
 
  // Read the first line of the request
  String request = client.readStringUntil('\r');
 
  // Request Handling
  // http://192.168.1.20/KIV&PROJECT=PROJECT:DEVICE=DEVICE:MODE=COLLECT:OPTION=OPTION:PARAMETER=PARAMETERS&
  serverRequestHandling(getParseStringValue(request,'&', 1));

  client.flush();


  // Request MODE Processing
  
  // Allocate a temporary JsonDocument
  // Use arduinojson.org/v6/assistant to compute the capacity.
  StaticJsonDocument<500> doc;

  // ------- MODE HANDLING START ---------

  switch(MODE)
  {

     // ------- COLLECT_ANALOG_MODE ------------
     case COLLECT_ANALOG_MODE :

            {
                
            printData("REQUEST : MODE=COLLECT_ANALOG_MODE");        
            printData("COLLECT_ANALOG_MODE : START");  

            // Read Data from pins and update Array
            readDataAndUpdate(true, false);
           
            // Add values in the document
            doc["REQ_STATUS"] = "COLLECT_ANALOG_MODE";
            doc["DEVICE_NAME"] = MAIN_DEVICE_NAME;
            doc["PROJECT_NAME"] = MAIN_PROJECT_NAME;
            //doc["TIME"] = 1351824120;  
                    
            
            // Add an array.
            JsonArray analog_data = doc.createNestedArray("ANALOG");
            for (byte an_i = 0; an_i < MAXPINCONFIG; an_i = an_i + 1) {
              analog_data.add(ANALOGDATA[an_i].DATA);
            }
            
            Serial.print(F("Sending: "));
            serializeJson(doc, Serial);
            printData("COLLECT_ANALOG_MODE : END");
            
            }

     break;
	 
	 // ------- COLLECT_DIGIIN_MODE ------------
     case COLLECT_DIGIIN_MODE :

            {
                
            printData("REQUEST : MODE=COLLECT_DIGIIN_MODE");        
            printData("COLLECT_DIGIIN_MODE : START");  

            // Read Data from pins and update Array
            readDataAndUpdate(false, true);
           
            // Add values in the document
            doc["REQ_STATUS"] = "COLLECT_DIGIIN_MODE";
            doc["DEVICE_NAME"] = MAIN_DEVICE_NAME;
            doc["PROJECT_NAME"] = MAIN_PROJECT_NAME;
            //doc["TIME"] = 1351824120;  
                    

            JsonArray digiIN_data = doc.createNestedArray("DIGITALIN");
            for (byte dIN_i = 0; dIN_i < MAXPINCONFIG; dIN_i = dIN_i + 1) {
               if(OPTION == "DATA") {digiIN_data.add(DIGIINDATA[dIN_i].DATA);}
              else {digiIN_data.add(DIGIINDATA[dIN_i].STATUS);}
              
            }           
            
            Serial.print(F("Sending: "));
            serializeJson(doc, Serial);
            printData("COLLECT_DIGIIN_MODE : END");
            
            }

     break;
	 
	 // ------- COLLECT_DIGIOUT_MODE ------------
     case COLLECT_DIGIOUT_MODE :

            {
                
            printData("REQUEST : MODE=COLLECT_DIGIOUT_MODE");        
            printData("COLLECT_DIGIOUT_MODE : START");  
           
            // Add values in the document
            doc["REQ_STATUS"] = "COLLECT_DIGIOUT_MODE";
            doc["DEVICE_NAME"] = MAIN_DEVICE_NAME;
            doc["PROJECT_NAME"] = MAIN_PROJECT_NAME;
            //doc["TIME"] = 1351824120;  
                    

            JsonArray digiOUT_data = doc.createNestedArray("DIGITALOUT");
            for (byte dOUT_i = 0; dOUT_i < MAXPINCONFIG; dOUT_i = dOUT_i + 1) {
              if(OPTION == "DATA") {digiOUT_data.add(DIGIOUTDATA[dOUT_i].DATA);}
              else {digiOUT_data.add(DIGIOUTDATA[dOUT_i].STATUS);}
              
            } 
            
            Serial.print(F("Sending: "));
            serializeJson(doc, Serial);
            printData("COLLECT_DIGIOUT_MODE : END");
            
            }

     break;

     // ------- INFO ------------
     case INFO_MODE :

              {
                 
              printData("REQUEST : MODE=INFO");          
              printData("INFO : START"); 
                          
              doc["REQSTATUS"] = "INFO";
              doc["DEVICENAME"] = MAIN_DEVICE_NAME;
              doc["PROJECTNAME"] = MAIN_PROJECT_NAME;
              doc["NETWORK_NAME"] = WiFi.SSID();
              doc["SIGNAL"] = WiFi.RSSI();
              doc["WIFISTATUS"] = WiFi.status();			  
			  doc["DEVICEFCNMODE"] = DEVICE_FCN_MODE;
			  
			  // Collect Status 
			  JsonArray deviceStatus_data = doc.createNestedArray("DEVICESTATUS");
			  for (byte dstat_i = 0; dstat_i < MAX_CONTROL_STATUS; dstat_i = dstat_i + 1) {
				  deviceStatus_data.add(DEVICE_CONTROL_STATUS[dstat_i]);
			  }
  
              

              Serial.print(F("Sending: "));
              serializeJson(doc, Serial);
              printData("INFO : END");
              
              }

     break;


     // ------- CONTROL_DOUT_MODE ------------
     case CONTROL_DOUT_MODE :

              {
              
              printData("REQUEST : CONTROL_DOUT_MODE");
              printData("CONTROL_DOUT_MODE : START");              

              DEVICE_CONTROL_STATUS[DEVICE_UPDATE_DOUT]  = true;

              doc["REQ_STATUS"] = "CONTROL_DOUT_MODE";
              doc["STATUS"] = "DONE"; 
          
          
              printData("CONTROL_DOUT_MODE : END");
              
              }

              break;

      // ------- RESTART DEVICE ------------
     case RESTART_MODE :

              {
                  
              printData("REQUEST : SYNC DEVICE");
              printData("PROCESS : START");

              DEVICE_CONTROL_STATUS[DEVICE_RESTART] = true;                            

              doc["REQ_STATUS"] = "SYNC";
              doc["STATUS"] = "DONE";             
                       
          
              printData("PROCESS : END");
              
              }

     break;
	 
	 // ------- REINIT DEVICE ------------
     case REINIT_MODE :

              {
                  
              printData("REQUEST : REINIT_MODE DEVICE");
              printData("REINIT_MODE : START");

              DEVICE_CONTROL_STATUS[DEVICE_REINIT] = true;              			  

              doc["REQ_STATUS"] = "REINIT_MODE";
              doc["STATUS"] = "DONE";             
                       
          
              printData("REINIT_MODE : END");
              
              }

     break;


     // ------- NO REQUEST ------------
     default :

              {
               
              printData("NO REQUEST : Send Default Data");
              // Add values in the document
              doc["REQ_STATUS"] = "NO_REQUEST";
                                     
              
              Serial.print(F("Sending: "));
              serializeJson(doc, Serial);
             
              }

     break;
     
  }
  // ----- MODE HANDLING END --------



  // Sending Response Back to Client
  // Write response headers
  client.println(F("HTTP/1.0 200 OK"));
  client.println(F("Content-Type: application/json"));
  client.println(F("Connection: close"));
  client.println(F("Access-Control-Allow-Origin: *"));
  client.print(F("Content-Length: "));  
  client.println(measureJsonPretty(doc));
  client.println();

  // Write JSON document
  serializeJsonPretty(doc, client);
  // Disconnect
  client.stop();
 
  delay(1);
  printData("Client disonnected");
  printData("");


  // Posting Function
  taskPosting();
  
 
} // ---- MAIN END -------

/* **************************************************
*  -------------- Functions -------------------------
* ***************************************************/

/* ================================================
*  FUNCTION :   setupPinConfig()
*
*  Details : Setup Pin Configuration , like OUTPUT or INPUT                                                
*
 ==================================================*/
void setupPinConfig()
{

   // Digital OUT Pin
   //pinMode(DOUT_ID0, OUTPUT);
    
}

/* ================================================
*  FUNCTION :   taskBuffering()
*
*  Details : Buffering function , call at startup loop                                                
*
 ==================================================*/
void taskBuffering() 
{

    // One time Operation.
    if(DEVICE_CONTROL_STATUS[DEVICE_ONE_TIME_OPERATION])
    {
      //updateDOUT("ID0" , LOW);

      printData("Updating DOUT to their Init Value..");
      // Update All DOUT to Init Value
      for (byte dOUT_i = 0; dOUT_i < MAXPINCONFIG; dOUT_i = dOUT_i + 1) {
		 if(DIGIOUTDATA[dOUT_i].STATUS) {
			updateDOUT(DOUTID[dOUT_i] , DIGIOUTDATA[dOUT_i].DATA );
		 }              
      }

      DEVICE_CONTROL_STATUS[DEVICE_ONE_TIME_OPERATION] = false;
      printData("First Time Operation Completed.");      
      
    }

    // Run at every Loop
    if(DEVICE_CONTROL_STATUS[DEVICE_ACTIVE_STATUS])
    {
    
      //Serial.println();
      //Serial.println("-------- millis value ---------");
      //Serial.println(millis());
      //Serial.println(refereshDeviceDataPrevMills);  
    
      // Update Data According to time 
      if (millis() - refereshDeviceDataPrevMills > TASK_TIMER)
      {
          refereshDeviceDataPrevMills = millis();
    
         // Read Data from pins and update Array
          readDataAndUpdate(true, true);
    
          // Device Handling
          deviceHandling();
    
          // Update Real Time Data.
          realTimeUpdateData();
                
      }
      
    } 
  
}


/* ================================================
*  FUNCTION :   taskPosting()
*
*  Details : Posting Function , Call at every end of loop fcn.                                               
*
 ==================================================*/
void taskPosting() 
{

    // RESTART Device.
    if(DEVICE_CONTROL_STATUS[DEVICE_RESTART])
    {
      printData("Restart Device ...");
      ESP.restart();
	  
    }   
              

    if(DEVICE_CONTROL_STATUS[DEVICE_ACTIVE_STATUS])
    {
		
		// REINIT Values
		if(DEVICE_CONTROL_STATUS[DEVICE_REINIT])
		{
		  DEVICE_CONTROL_STATUS[DEVICE_REINIT] = false;
		  resetAllDataToInitValue();
		}	
			  
        // Update DOUT
        if(DEVICE_CONTROL_STATUS[DEVICE_UPDATE_DOUT])
        {
          DEVICE_CONTROL_STATUS[DEVICE_UPDATE_DOUT]  = false;
          updateDOUT(OPTION , (PARAMETERS == "HIGH" ? true : false));
        }
        
    }
  
}

/* ================================================
*  FUNCTION :   resetAllDataToInitValue()
*
*  Details : Reset All Data To Init Value                                               
*
 ==================================================*/
void resetAllDataToInitValue()
{
	printData("RESET All Data to INIT Value.");
	
	for (byte an_i = 0; an_i < MAXPINCONFIG; an_i = an_i + 1) {
          if(ANALOGDATA[an_i].STATUS) { ANALOGDATA[an_i].DATA = ANALOGDATA[an_i].INIT; }
    }
	
	for (byte din_i = 0; din_i < MAXPINCONFIG; din_i = din_i + 1) {
          if(DIGIINDATA[din_i].STATUS) { DIGIINDATA[din_i].DATA = DIGIINDATA[din_i].INIT; }
    }
	
	for (byte dout_i = 0; dout_i < MAXPINCONFIG; dout_i = dout_i + 1) {
          if(DIGIOUTDATA[dout_i].STATUS) { 
			  DIGIOUTDATA[dout_i].DATA = DIGIOUTDATA[dout_i].INIT; 
			  updateDOUT(DOUTID[dout_i] , DIGIOUTDATA[dout_i].DATA );
		  }
    }
	
	
}


/* ================================================
*  FUNCTION :   readDeviceDataAndUpdate()
*
*  Details : Read Device Info Data from Firebase                                                
*
 ==================================================*/
void readDeviceDataAndUpdate()
{
  bool deviceDataUpdated = false;

  byte retry_cnt = 0;
  
  while (!deviceDataUpdated) {
    
    delay(DELAY_TIMER);
    printData("Read DEVICE DATA from Firebase ...");
    
    String jsonStr = "";    

    if (Firebase.get(firebaseData, DB_BASE_PATH + "/INFO"))
    {
        //printData("PASSED");
        if (firebaseData.dataType() == "json")
        {
            jsonStr = firebaseData.jsonString();
            parseDeviceData(firebaseData);

            deviceDataUpdated = true;
            DEVICE_CONTROL_STATUS[DEVICE_FIREBASE_UPDATE] = true;

            
            printData("DEVICE Data Updated..");
            
        }
    }
    else
    {
        printData("FAILED");
        printData("REASON: " + firebaseData.errorReason());
        DEVICE_CONTROL_STATUS[DEVICE_FIREBASE_UPDATE] = false;

        retry_cnt++;

        delay(DELAY_TIMER);

        
    }

    // Try only 5 times
    if(retry_cnt > 5) {deviceDataUpdated = true;}

  }


  // Read PIN Configuration
  if (DEVICE_CONTROL_STATUS[DEVICE_FIREBASE_UPDATE]) {
    printData("Device Update : SUCCESS !!");
    DEVICE_CONTROL_STATUS[DEVICE_FREEZ] = false;
    
    readAllPINConfigDetailsAndUpdate();
    
  } else {

    printData("Device Update : FAILED !!");
    DEVICE_CONTROL_STATUS[DEVICE_FREEZ] = true;

    DEVICE_CONTROL_STATUS[DEVICE_ACTIVE_STATUS]  = false;
    DEVICE_CONTROL_STATUS[DEVICE_REALTIMEUPDATE_STATUS]  = false;
    DEVICE_CONTROL_STATUS[DEVICE_HANDLING_STATUS]  = false;
    
  }

  
}

/* ================================================
*  FUNCTION :   readAllPINConfigDetailsAndUpdate()
*
*  Details : Read All Pin Configuration from Firebase.                                                
*
 ==================================================*/
void readAllPINConfigDetailsAndUpdate()
{

  // Analog Config
  printData("Analog PIN Config Data Updating.");
  for (byte aid_i = 0; aid_i < MAXPINCONFIG; aid_i = aid_i + 1) {
	  Serial.print(".");
      getPinDataAndUpdate(AID[aid_i], ANALOGIDX , aid_i);
  }

  // Digital Input Config
  printData(".");
  printData("Digital Input PIN Config Data Updating.");
   for (byte dinid_i = 0; dinid_i < MAXPINCONFIG; dinid_i = dinid_i + 1) {
	   Serial.print(".");
      getPinDataAndUpdate(DINID[dinid_i], DIGIINIDX , dinid_i);
   }
   
   // Digital Output Config
   printData(".");
   printData("Digital Output PIN Config Data Updating.");
    for (byte doutid_i = 0; doutid_i < MAXPINCONFIG; doutid_i = doutid_i + 1) {
		Serial.print(".");
      getPinDataAndUpdate(DOUTID[doutid_i], DIGIOUTIDX , doutid_i);
   }

  printData(".");
  // If any Read Operation FAILED
  if( !DEVICE_CONTROL_STATUS[DEVICE_FIREBASE_UPDATE]) {
    printData("PIN Config Update : FAILED !!");
    DEVICE_CONTROL_STATUS[DEVICE_FREEZ] = true;

    DEVICE_CONTROL_STATUS[DEVICE_ACTIVE_STATUS]  = false;
    DEVICE_CONTROL_STATUS[DEVICE_REALTIMEUPDATE_STATUS]  = false;
    DEVICE_CONTROL_STATUS[DEVICE_HANDLING_STATUS]  = false;
    
  } else {

    printData("PIN Config Update : SUCCESS !!");
    DEVICE_CONTROL_STATUS[DEVICE_FREEZ] = false;
    
  }
  
}


/* ================================================
*  FUNCTION :   getPinDataAndUpdate()
*
*  Details : Read Each PIN ID Details from Firebase.                                                
*
 ==================================================*/
void getPinDataAndUpdate(String ID, byte type, byte index)
{
  bool deviceDataUpdated = false;

  byte retry_cnt = 0;
  
  while (!deviceDataUpdated) {
    
    delay(DELAY_TIMER);
    //printData("Read PIN Config and Update : " + ID);
    
    String jsonStr = "";    

    if (Firebase.get(firebaseData, DB_BASE_PATH + "/DATA/PINCONFIG/" + ID))
    {
        //printData("PASSED");
        if (firebaseData.dataType() == "json")
        {
            jsonStr = firebaseData.jsonString();

            if(type == ANALOGIDX) { parseAnalogPinConfigData(firebaseData,index); }
            else { parseDigitalPinConfigData(firebaseData,type,index); }
            

            deviceDataUpdated = true;
            DEVICE_CONTROL_STATUS[DEVICE_FIREBASE_UPDATE] = true;

      
            //printData("DONE.");
            
        }
    }
    else
    {
        printData("FAILED");
        printData("REASON: " + firebaseData.errorReason());
        DEVICE_CONTROL_STATUS[DEVICE_FIREBASE_UPDATE] = false;

        retry_cnt++;

        delay(DELAY_TIMER);

        
    }

    // Try only 5 times
    if(retry_cnt > 5) {deviceDataUpdated = true;}

  }

  
}


/* ================================================
*  FUNCTION :   deviceHandling()
*
*  Details : Perform Device Related operstion in every loop.                                                
*
 ==================================================*/
void deviceHandling() 
{
    if(DEVICE_CONTROL_STATUS[DEVICE_HANDLING_STATUS])
    {
      printData("Device Handling START.");
      printData(DEVICE_FCN_MODE);
      delay(DELAY_TIMER);
      printData("Device Handling END.");
    }
}

/* ================================================
*  FUNCTION :   realTimeUpdateData()
*
*  Details : Update Analog or Digital Input into Firebase.                                                
*
 ==================================================*/
void realTimeUpdateData() 
{
    if(DEVICE_CONTROL_STATUS[DEVICE_REALTIMEUPDATE_STATUS])
    {
        // Example Link
        // https://github.com/mobizt/Firebase-ESP8266/blob/master/examples/jsonObject/jsonObject.ino      

        // Update DB only if their is any difference.
        if (checkAnyDiffInData())
        {
                        
            DB_REALTIME_CNT++;  

             // Check with MAX_DB_REALTIME_CNT
             if(DB_REALTIME_CNT > MAX_DB_REALTIME_CNT) 
             {
                 // STOP DB Update.
                 DEVICE_CONTROL_STATUS[DEVICE_REALTIMEUPDATE_STATUS] = false;
                 DB_REALTIME_CNT = 0;

                 updateFirebaseDB_Bool("INFO/ACTIVESTATUS", DEVICE_REALTIMEUPDATE_STATUS);
                 printData("Real Time Data Update : Disabled due to MAX Limit.");
             }

              if ( DB_REALTIME_CNT > 65000 )
              {
                DB_REALTIME_CNT = 0;
              }

              // Analog Update
              for(byte aid_i = 0 ; aid_i < MAXPINCONFIG ; aid_i = aid_i +1)
              {
                if (ANALOGDATA[aid_i].CHANGE_STATUS)
                {
                  updateFirebaseDB_Analog(AID[aid_i], aid_i , ANALOGDATA[aid_i].DATA);
                }
                
              }

              
			       // Update Digital Input
              for(byte dinid_i = 0 ; dinid_i < MAXPINCONFIG ; dinid_i = dinid_i +1)
              {
                if (DIGIINDATA[dinid_i].CHANGE_STATUS)
                {
                  updateFirebaseDB_DigiIN(DINID[dinid_i], dinid_i , DIGIINDATA[dinid_i].DATA);
                }
                
              }

           

            updateFirebaseDB_Int("INFO/COUNT", DB_REALTIME_CNT);

            delay(DELAY_TIMER);
            
        } // END if any Diff found  
        
    
    } //END activate flag
}

/* ================================================
*  FUNCTION :   updateFirebaseDB_Analog()
*
*  Details : Update Analog DATA into Firebase.                                                
*
 ==================================================*/
void updateFirebaseDB_Analog(String ID, byte index, uint16_t data)
{
  String db_realtime_path = DB_BASE_PATH + "/REALTIMESAMPLE/ANALOG/";           
          
  if (Firebase.setInt(firebaseData, db_realtime_path + ID , data))
  {
      //printData("Analog Update : PASSED");
      ANALOGDATA[index].DATA_BUFF = data;
  }
  else
  {
      printData("Analog Update : FAILED");
      printData("REASON: " + firebaseData.errorReason());
  }

  delay(DELAY_TIMER);
  
}


/* ================================================
*  FUNCTION :   updateFirebaseDB_DigiIN()
*
*  Details : Update Digital Input DATA into Firebase.                                                
*
 ==================================================*/
void updateFirebaseDB_DigiIN(String ID, byte index, bool data)
{
  String db_realtime_path = DB_BASE_PATH + "/REALTIMESAMPLE/DIGIIN/";           
          
  if (Firebase.setBool(firebaseData, db_realtime_path + ID , data))
  {
      //printData("Digital Update : PASSED");
      DIGIINDATA[index].DATA_BUFF = data;
  }
  else
  {
      printData("Digital Update : FAILED");
      printData("REASON: " + firebaseData.errorReason());
  }

  delay(DELAY_TIMER);
  
}

/* ================================================
*  FUNCTION :   updateFirebaseDB_Int()
*
*  Details : Update Int DATA into Firebase.                                                
*
 ==================================================*/
void updateFirebaseDB_Int(String path, uint16_t data)
{
  String db_realtime_path = DB_BASE_PATH + "/REALTIMESAMPLE/" + path;           
          
  if (Firebase.setInt(firebaseData, db_realtime_path , data))
  {
      //printData("Digital Update : PASSED");
  }
  else
  {
      printData("Digital Update : FAILED");
      printData("REASON: " + firebaseData.errorReason());
  }

  delay(DELAY_TIMER);
  
}

/* ================================================
*  FUNCTION :   updateFirebaseDB_Bool()
*
*  Details : Update Bool DATA into Firebase.                                                
*
 ==================================================*/
void updateFirebaseDB_Bool(String path, bool data)
{
  String db_realtime_path = DB_BASE_PATH + "/REALTIMESAMPLE/" + path;           
          
  if (Firebase.setBool(firebaseData, db_realtime_path , data))
  {
      //printData("Digital Update : PASSED");
  }
  else
  {
      printData("Digital Update : FAILED");
      printData("REASON: " + firebaseData.errorReason());
  }

  delay(DELAY_TIMER);
  
}



/* ================================================
*  FUNCTION :   updateDOUT()
*
*  Details : Complete Digital Output Handling.                                                
*
 ==================================================*/
void updateDOUT(String ID, bool data)
{

   // Collect Index
   byte index = getPINIndex(ID,DIGIOUTIDX); 
      
  if(DIGIOUTDATA[index].STATUS) { 
      
      // Check Difference with Buffer
      DIGIOUTDATA[index].CHANGE_STATUS = false;   
      
      DIGIOUTDATA[index].DATA = data;
      
      if(DIGIOUTDATA[index].DATA_BUFF != DIGIOUTDATA[index].DATA)
      {
        DIGIOUTDATA[index].CHANGE_STATUS = true;
        //printData("DOUT Pin Diff. found !");
      }
    
      if(DIGIOUTDATA[index].CHANGE_STATUS) {
        
          // Get Pin Details
    	  //byte pin_details = DIGIOUTIDX[index].PIN;
    	  //digitalWrite(pin_details , (DIGIOUTIDX[index].DATA == true ? HIGH : LOW));
          Serial.print(data);
    	  printData(" : " + ID + " - Updated.");
    	
    	if(DEVICE_CONTROL_STATUS[DEVICE_UPDATE_CONTROL]) {
    		
    		  String db_realtime_path = DB_BASE_PATH + "/CONTROL/DIGIOUT/";   
    
    		  bool is_db_updated = false;
    		  byte retry_cnt = 0;
    
    		  while(!is_db_updated)
    		  {
    				  
    			if (Firebase.setBool(firebaseData, db_realtime_path + ID , DIGIOUTDATA[index].DATA))
    			{
    				//printData("DB Updated !!");
    				
    				DIGIOUTDATA[index].DATA_BUFF = data;
    				is_db_updated = true;
    			}
    			else
    			{
    				printData("OUTPUT- " + ID +" : Update FAILED ..");
    				printData("REASON: " + firebaseData.errorReason());
    
    				retry_cnt++;
    
    				delay(DELAY_TIMER);
    			}
    
    			//Try only 5 times
    			if(retry_cnt > 5) {is_db_updated = true;}
    
    		  }
    		
    		  delay(DELAY_TIMER);
    	  
    	 }
    	 else {
    	    DIGIOUTDATA[index].DATA_BUFF = data;
    	 }
    
      }

  }
  
}


/* ================================================
*  FUNCTION :   readDataAndUpdate()
*
*  Details : Read Analog and Digital Input Data from PIN and Update Struct.                                                
*
 ==================================================*/
void readDataAndUpdate(bool updateAnalog, bool updateDigiin)
{

  // Read all Analog Active and Digital INPUT Pin Data

  if(updateAnalog)
  {
	  for(byte aid_i = 0 ; aid_i < MAXPINCONFIG ; aid_i = aid_i + 1)
	  {
		if(ANALOGDATA[aid_i].STATUS)
		{
		   //printData("Analog Signal Read.. " + AID[aid_i]);
		   // Actual Read Data from PIN and Update
		   // For Testing 
		   ANALOGDATA[aid_i].DATA = random(230);
		   
		   // Range Check
		   if( ANALOGDATA[aid_i].DATA < ANALOGDATA[aid_i].MIN)
		   {
			   ANALOGDATA[aid_i].DATA = ANALOGDATA[aid_i].MIN;
		   }
		   
		   if( ANALOGDATA[aid_i].DATA > ANALOGDATA[aid_i].MAX)
		   {
			   ANALOGDATA[aid_i].DATA = ANALOGDATA[aid_i].MAX;
		   }
		}
		else 
		{
		   ANALOGDATA[aid_i].DATA = 0;
		}
		
	  }
  
  }
  
  
  if(updateDigiin)
  {
		  for(byte dinid_i = 0 ; dinid_i < MAXPINCONFIG ; dinid_i = dinid_i + 1)
		  {
			if(DIGIINDATA[dinid_i].STATUS)
			{
			   //printData("Digital Signal Read.. " + DINID[dinid_i]);
			   // Actual Read Data from PIN and Update
			   // For Testing 
         byte rndvalue = random(2);
         DIGIINDATA[dinid_i].DATA = ( rndvalue == 1 ? true : false );
			   
			}
			else 
			{
			   DIGIINDATA[dinid_i].DATA = false;
			}
			
		  }
  
  }

  
}

/* ================================================
*  FUNCTION :   checkAnyDiffInData()
*
*  Details : Find and difference between current value and Buffer value.                                                
*
 ==================================================*/
bool checkAnyDiffInData()
{
   bool diff_found = false;

   // Check analog pin data difference
   for (byte aid_i = 0; aid_i < MAXPINCONFIG; aid_i = aid_i + 1) 
   {

    if( ANALOGDATA[aid_i].STATUS )
    {

      if( ANALOGDATA[aid_i].DATA > ANALOGDATA[aid_i].DATA_BUFF)
      {
        // Check Difference
        if ( ( ANALOGDATA[aid_i].DATA - ANALOGDATA[aid_i].DATA_BUFF ) > ANALOGDATA[aid_i].CNGFACTOR )
        {
           //printData("New Data is Greater Than Old Buffer Data. ANALOG DIFF Found for Index : ");
           //printData(String(an_i));
           //printData(String(ANALOG_PIN_DATA[an_i]));
           //printData(String(ANALOG_PIN_DATA_BUF[an_i]));
           ANALOGDATA[aid_i].CHANGE_STATUS = true;
           diff_found = true;
           
        } else {
          ANALOGDATA[aid_i].CHANGE_STATUS = false;
        }
        
      } else {

        // Check Difference
        if ( ( ANALOGDATA[aid_i].DATA_BUFF - ANALOGDATA[aid_i].DATA ) > ANALOGDATA[aid_i].CNGFACTOR )
        {
           //printData("New Data is Greater Than Old Buffer Data. ANALOG DIFF Found for Index : ");
           //printData(String(an_i));
           //printData(String(ANALOG_PIN_DATA[an_i]));
           //printData(String(ANALOG_PIN_DATA_BUF[an_i]));
           ANALOGDATA[aid_i].CHANGE_STATUS = true;
           diff_found = true;
           
        } else {
          ANALOGDATA[aid_i].CHANGE_STATUS = false;
        }
        
      }
      //EOF

    } else { ANALOGDATA[aid_i].CHANGE_STATUS = false; }

      
  }

// Check Digital Input Pin Data Difference
  for (byte dinid_i = 0; dinid_i < MAXPINCONFIG; dinid_i = dinid_i + 1) 
  {
    if( DIGIINDATA[dinid_i].STATUS )
    {
       if( DIGIINDATA[dinid_i].DATA_BUFF != DIGIINDATA[dinid_i].DATA )
       {
           //printData("DIGITAL IN DIFF Found for Index : ");
           //printData(String(dIN_i));
           DIGIINDATA[dinid_i].CHANGE_STATUS = true;
           diff_found = true;
       } else {
          DIGIINDATA[dinid_i].CHANGE_STATUS = false;
       }
    } else { DIGIINDATA[dinid_i].CHANGE_STATUS = false; }
  }

  return diff_found;
  
}

/* ================================================
*  FUNCTION :   getPINIndex()
*
*  Details : Get PIN Index Value.                                                
*
 ==================================================*/
byte getPINIndex(String ID, byte type) {

  byte index;

  for(byte pinidx = 0 ; pinidx < MAXPINCONFIG ; pinidx = pinidx + 1 )
  {
    if(type == ANALOGIDX ) { if (ID == AID[pinidx]) { return pinidx ;} }
    else if(type == DIGIINIDX ) { if (ID == DINID[pinidx]) { return pinidx ;} }
    else if(type == DIGIOUTIDX ) { if (ID == DOUTID[pinidx]) { return pinidx ;} }
    else {return 0;}    
  }
  
}

/* ================================================
*  FUNCTION :   serverRequestHandling()
*
*  Details : Server Request Handling.                                                
*
 ==================================================*/
void serverRequestHandling(String main_request) 
{
    printData("------------------------------");
    printData("Request Handling..");
    printData(main_request);

    String each_request = "NA";
    // Read Project Details
    each_request = getParseStringValue(main_request,':', 0);
    String project_name = getParseStringValue(each_request,'=', 1);

    // Read Device Details
    each_request = getParseStringValue(main_request,':', 1);
    String device_name = getParseStringValue(each_request,'=', 1);


    // Read Mode Details
    each_request = getParseStringValue(main_request,':', 2);
    String each_mode = getParseStringValue(each_request,'=', 1);
    printData(each_mode);
	
    if(each_mode == "COLLECT_ANALOG") {
      MODE = COLLECT_ANALOG_MODE;
    } else if(each_mode == "COLLECT_DIGIIN") {
      MODE = COLLECT_DIGIIN_MODE;
    } else if(each_mode == "COLLECT_DIGIOUT") {
      MODE = COLLECT_DIGIOUT_MODE;
    } else if(each_mode == "INFO") {
      MODE = INFO_MODE;
    } else if(each_mode == "CONTROL_DOUT" ) {
      MODE = CONTROL_DOUT_MODE;
    } else if(each_mode == "RESTART") {
      MODE = RESTART_MODE;
    } else if(each_mode == "REINIT") {
      MODE = REINIT_MODE;
    } else {
      MODE = NOREQUEST_MODE;
    }	

    // Update Mode According to the Active Status
    if(!DEVICE_CONTROL_STATUS[DEVICE_ACTIVE_STATUS])
    {
      if( (each_mode == "INFO") || (each_mode == "SYNC") )
      {
        printData("BY Pass Active Request.");
      }
      else 
      {
        printData("Reset Mode Request ..");
        MODE = NOREQUEST_MODE;
      }
      
    }

    // Read Option Details
    each_request = getParseStringValue(main_request,':', 3);
    OPTION = getParseStringValue(each_request,'=', 1);
    printData(OPTION);

    // Read Parameter Details
    each_request = getParseStringValue(main_request,':', 4);
    PARAMETERS = getParseStringValue(each_request,'=', 1);
    printData(PARAMETERS);

    if(project_name != MAIN_PROJECT_NAME){
      printData("ERROR : Wrong Project Name.");
      MODE = NOREQUEST_MODE;
    }

    if(device_name != MAIN_DEVICE_NAME){
      printData("ERROR : Wrong Device Name.");
      MODE = NOREQUEST_MODE;
    }

    Serial.println(MODE);

    printData("------------------------------");
  
}


/* ================================================
*  FUNCTION :   printData()
*
*  Details : Print Serial Data.                                                
*
 ==================================================*/
void printData(String message)
{
  Serial.println(message);
}


/* ================================================
*  FUNCTION :   getParseStringValue()
*
*  Details : Parse String Value.                                                
*
 ==================================================*/
String getParseStringValue(String data, char separator, int index)
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


/* ================================================
*  FUNCTION :   parseDeviceData()
*
*  Details : Parse Device JSON Data and Update.                                                
*
 ==================================================*/
void parseDeviceData(FirebaseData &data)
{
    if (data.dataType() == "json")
    {
        FirebaseJson &json = data.jsonObject();
        //Print all object data
        //Serial.println("Pretty printed JSON data:");
        String jsonStr;
        json.toString(jsonStr, true);
        //Serial.println(jsonStr);
        //Serial.println();
        //Serial.println("Iterate JSON data:");
        //Serial.println();
        size_t len = json.iteratorBegin();
        String key, value = "";
        int type = 0;
        for (size_t i = 0; i < len; i++)
        {
            json.iteratorGet(i, type, key, value);
            //Serial.print(i);
            //Serial.print(", ");
            //Serial.print("Type: ");
            //Serial.print(type == FirebaseJson::JSON_OBJECT ? "object" : "array");
            if (type == FirebaseJson::JSON_OBJECT)
            {
                //Serial.println();
                //Serial.print(key);
                //Serial.print("  :  ");
                //Serial.print(value);

                // Update STATUS
                if(key == "ENABLE") {DEVICE_CONTROL_STATUS[DEVICE_ACTIVE_STATUS] = (value == "TRUE" ? true : false);}
                if(key == "REALTIMESTATUS") {DEVICE_CONTROL_STATUS[DEVICE_REALTIMEUPDATE_STATUS] = (value == "TRUE" ? true : false);}
                if(key == "DEVICEFCNSTATUS") {DEVICE_CONTROL_STATUS[DEVICE_HANDLING_STATUS] = (value == "TRUE" ? true : false);}

                // Update VALUE
                if(key == "REALTIMEMAXLIMIT") {
                  if(value == "10") {MAX_DB_REALTIME_CNT = 10;}
                  if(value == "100") {MAX_DB_REALTIME_CNT = 100;}
                  if(value == "500") {MAX_DB_REALTIME_CNT = 500;}                  
                }
                
                if(key == "DEVICEFCNMODE") {DEVICE_FCN_MODE = value; }
            }
           
        }
        json.iteratorEnd();
    }   
    else
    {
        Serial.println(data.payload());
    }
}


/* ================================================
*  FUNCTION :   parseAnalogPinConfigData()
*
*  Details : Parse Analog PIN Config JSON Data and Update.                                                
*
 ==================================================*/
void parseAnalogPinConfigData(FirebaseData &data, byte index)
{

  if (data.dataType() == "json")
    {
        FirebaseJson &json = data.jsonObject();
        String jsonStr;
        json.toString(jsonStr, true);
        size_t len = json.iteratorBegin();
        String key, value = "";
        int type = 0;
        for (size_t i = 0; i < len; i++)
        {
            json.iteratorGet(i, type, key, value);
            if (type == FirebaseJson::JSON_OBJECT)
            {
                //Serial.println();
                //Serial.print(key);
                //Serial.print("  :  ");
                //Serial.print(value);
                
                if(key == "PIN") { ANALOGDATA[index].PIN = value.toInt(); }
                if(key == "STATUS") { ANALOGDATA[index].STATUS = (value == "TRUE" ? true : false); }
                if(key == "INITVALUE") { 
				   ANALOGDATA[index].INIT = value.toInt();
				   ANALOGDATA[index].DATA = value.toInt(); 
				   ANALOGDATA[index].DATA_BUFF = value.toInt(); 
				   ANALOGDATA[index].CHANGE_STATUS = false;
				}
                if(key == "CONFACTOR") { ANALOGDATA[index].CONFACTOR = value.toInt(); }
                if(key == "CNGFACTOR") { ANALOGDATA[index].CNGFACTOR = value.toInt(); }
                if(key == "MINVALUE") { ANALOGDATA[index].MIN = value.toInt(); }
                if(key == "MAXVALUE") { ANALOGDATA[index].MAX = value.toInt(); } 
                
            }
           
        }
        json.iteratorEnd();
    }   
    else
    {
        Serial.println(data.payload());
    }
}


/* ================================================
*  FUNCTION :   parseDigitalPinConfigData()
*
*  Details : Parse Digital PIN Config JSON Data and Update.                                                
*
 ==================================================*/
void parseDigitalPinConfigData(FirebaseData &data, byte typeidx , byte index)
{

  if (data.dataType() == "json")
    {
        FirebaseJson &json = data.jsonObject();
        String jsonStr;
        json.toString(jsonStr, true);
        size_t len = json.iteratorBegin();
        String key, value = "";
        int type = 0;
        for (size_t i = 0; i < len; i++)
        {
            json.iteratorGet(i, type, key, value);
            if (type == FirebaseJson::JSON_OBJECT)
            {
                //Serial.println();
                //Serial.print(key);
                //Serial.print("  :  ");
                //Serial.print(value);

                if( typeidx == DIGIINIDX) {
                
                  if(key == "PIN") { DIGIINDATA[index].PIN = value.toInt(); }
                  if(key == "STATUS") { DIGIINDATA[index].STATUS = (value == "TRUE" ? true : false); }
                  if(key == "INITVALUE") { 
				    DIGIINDATA[index].INIT = (value.toInt() == 1 ? true : false) ; 
                    DIGIINDATA[index].DATA = (value.toInt() == 1 ? true : false) ; 
                    DIGIINDATA[index].DATA_BUFF = (value.toInt() == 1 ? true : false) ;
                    DIGIINDATA[index].CHANGE_STATUS = false;
                   }

                } else {

                  if(key == "PIN") { DIGIOUTDATA[index].PIN = value.toInt(); }
                  if(key == "STATUS") { DIGIOUTDATA[index].STATUS = (value == "TRUE" ? true : false); }
                  if(key == "INITVALUE") { 
				    DIGIOUTDATA[index].INIT = (value.toInt() == 1 ? true : false) ; 
                    DIGIOUTDATA[index].DATA = (value.toInt() == 1 ? true : false) ; 
                    DIGIOUTDATA[index].DATA_BUFF = (value.toInt() != 1 ? true : false) ;
                    DIGIOUTDATA[index].CHANGE_STATUS = false;
                   }
                  
                }
              
                
            }
           
        }
        json.iteratorEnd();
    }   
    else
    {
        Serial.println(data.payload());
    }
}



// -----------------------------------------------
// Print JSON Result Received from Firebase
// -----------------------------------------------
/*
void printResult(FirebaseData &data)
{
  if (data.dataType() == "int")
        Serial.println(data.intData());
  else if (data.dataType() == "float")
        Serial.println(data.floatData(), 5);
  else if (data.dataType() == "double")
        printf("%.9lf\n", data.doubleData());
  else if (data.dataType() == "boolean")
        Serial.println(data.boolData() == 1 ? "true" : "false");
  else if (data.dataType() == "string")
        Serial.println(data.stringData());
  else if (data.dataType() == "json")
    {
        FirebaseJson &json = data.jsonObject();
        //Print all object data
        Serial.println("Pretty printed JSON data:");
        String jsonStr;
        json.toString(jsonStr, true);
        Serial.println(jsonStr);
        Serial.println();
        Serial.println("Iterate JSON data:");
        Serial.println();
        size_t len = json.iteratorBegin();
        String key, value = "";
        int type = 0;
        for (size_t i = 0; i < len; i++)
        {
            json.iteratorGet(i, type, key, value);
            Serial.print(i);
            Serial.print(", ");
            Serial.print("Type: ");
            Serial.print(type == FirebaseJson::JSON_OBJECT ? "object" : "array");
            if (type == FirebaseJson::JSON_OBJECT)
            {
                Serial.print(", Key: ");
                Serial.print(key);
            }
            Serial.print(", Value: ");
            Serial.println(value);
        }
        json.iteratorEnd();
    }
    else if (data.dataType() == "array")
    {
        Serial.println();
        //get array data from FirebaseData using FirebaseJsonArray object
        FirebaseJsonArray &arr = data.jsonArray();
        //Print all array values
        Serial.println("Pretty printed Array:");
        String arrStr;
        arr.toString(arrStr, true);
        Serial.println(arrStr);
        Serial.println();
        Serial.println("Iterate array values:");
        Serial.println();
        for (size_t i = 0; i < arr.size(); i++)
        {
            Serial.print(i);
            Serial.print(", Value: ");
            FirebaseJsonData &jsonData = data.jsonData();
            //Get the result data from FirebaseJsonArray object
            arr.get(jsonData, i);
            if (jsonData.typeNum == FirebaseJson::JSON_BOOL)
                Serial.println(jsonData.boolValue ? "true" : "false");
            else if (jsonData.typeNum == FirebaseJson::JSON_INT)
                Serial.println(jsonData.intValue);
            else if (jsonData.typeNum == FirebaseJson::JSON_FLOAT)
                Serial.println(jsonData.floatValue);
            else if (jsonData.typeNum == FirebaseJson::JSON_DOUBLE)
                printf("%.9lf\n", jsonData.doubleValue);
            else if (jsonData.typeNum == FirebaseJson::JSON_STRING ||
                     jsonData.typeNum == FirebaseJson::JSON_NULL ||
                     jsonData.typeNum == FirebaseJson::JSON_OBJECT ||
                     jsonData.typeNum == FirebaseJson::JSON_ARRAY)
                Serial.println(jsonData.stringValue);
        }
    }
    else
    {
        Serial.println(data.payload());
    }
}
*/
