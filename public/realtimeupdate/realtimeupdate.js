// *******************************************************************************
// SCRIPT : realtimeupdate.js
//
//
// Author : Vivek Thakur
// Date : 27/7/2020
// *******************************************************************************


println('[START] : Real Time Update script.')

var DEVICE = ''
var MODE = ''

init_operation()

getParams()

// Collect all Devices Data
collectAllDevicesDetails()

// ===============================================

// ----------- Read Parameters -------------------
function getParams() {
    // Read Parameters
    println('Read Parameters ...')
    var idx = document.URL.indexOf('?');
    var params = new Array();
    var parmFound = false
    if (idx != -1) {
      var pairs = document.URL.substring(idx + 1, document.URL.length).split('&');
      for (var i = 0; i < pairs.length; i++) {
        nameVal = pairs[i].split('=');
        params[nameVal[0]] = nameVal[1];
        parmFound = true
      }
    }
    println(params); 
    if(parmFound) {
        DEVICE = params['DEVICE']
        MODE = params['MODE'].replace('#!','')
    }
  
}

// -------------------------------------------
// Collect All Devices Details
// -------------------------------------------
var deviceData = {}
var devicePinConfig = {}
var deviceCalibData = {}
var allDevicesData = {}

// Read All Devices Details
async function readallDevicesDetails() {  
    const snapshot = await db.collection(getFirestorePath('DEVICE')).get();
    snapshot.forEach(doc => {
        //console.log(doc.id, '=>', doc.data());
         allDevicesData[doc.id] = doc.data() 
    });
}

// Read Each Device Details
async function collectAllDevicesDetails() {

   showPleaseWait()

    const devdatadoc = await db.collection(getFirestorePath('DEVICE')).doc(DEVICE).get();
    if (!devdatadoc.exists) {
        println('No such document!');
    } else {
        deviceData = devdatadoc.data()
        println(DEVICE + " : Data Updated !!")      
    }

    const pinconfigdatadoc = await db.collection(getFirestorePath('DEVICE') + '/' + DEVICE + '/DATA').doc('PINCONFIG').get();
    if (!pinconfigdatadoc.exists) {
        println('No such document!');
    } else {
        devicePinConfig = pinconfigdatadoc.data()
        println(DEVICE + " : PINCONFIG Updated !!")      
    }

    const calibdatadoc = await db.collection(getFirestorePath('DEVICE') + '/' + DEVICE + '/DATA').doc('CALIB').get();
    if (!calibdatadoc.exists) {
        println('No such document!');
    } else {
        deviceCalibData = calibdatadoc.data()
        println(DEVICE + " : CALIB Updated !!")      
    }

    // Update UI Component
    updateGUIComponent()

    hidePleaseWait()

}

// Read Real Time Data and Update Page
var realTimeAnalogData = {}
function readRealAnalogTimeData() {
    var dbRealRef = db_real.ref(project_name + '/DEVICE/' + DEVICE + '/REALTIMESAMPLE/ANALOG');
    dbRealRef.on('value', function(snapshot) {
        realTimeAnalogData = snapshot.val()
        //println(realTimeAnalogData)
        // Update Analog Section   
        if(realTimeAnalogData != null) {
            updateAnalogValue(devicePinConfig,realTimeAnalogData)
        }

    });
}

// Read Real Time Data and Update Page
var realTimeDigiINData = {}
function readRealDigiINTimeData() {
    var dbRealRef = db_real.ref(project_name + '/DEVICE/' + DEVICE + '/REALTIMESAMPLE/DIGIIN');
    dbRealRef.on('value', function(snapshot) {
        realTimeDigiINData = snapshot.val()
        //println(realTimeDigiINData)
        // Update Analog Section  
        if(realTimeDigiINData != null) { 
           updateDigitalInput(devicePinConfig,realTimeDigiINData)
        }

    });
}

// Read Real Time Data and Update Page
var realTimeDigiOUTData = {}
function readRealDigiOUTTimeData() {
    var dbRealRef = db_real.ref(project_name + '/DEVICE/' + DEVICE + '/CONTROL/DIGIOUT');
    dbRealRef.on('value', function(snapshot) {
        realTimeDigiOUTData = snapshot.val()
        //println(realTimeDigiOUTData)
        // Update Analog Section  
        if(realTimeDigiOUTData != null) { 
          updateDigitalOutput(devicePinConfig,realTimeDigiOUTData)
        }

    });
}


// Update GUI Compnent
function updateGUIComponent()
{
    // Create Analog Component
    createAnalogGUIComponent(devicePinConfig)

    // Create Digital Input Section
    createDigitalInputSection(devicePinConfig)

    // Create Digital Output Section
    createDigitalOutputSection(devicePinConfig)

    // Update Calibration Data
    updateCalibrationSection()

    // Listener to update HTML Value
    readRealAnalogTimeData()

    readRealDigiINTimeData()

    readRealDigiOUTTimeData()

    readRealTimeInfoDetails()

    readDeviceStatusDetails()


}


// -------------------------------------------
// Update HTML Page
// -------------------------------------------
function updateHTMLPage()
{
    

}

// --------------------------------------------------------
// Create Digital Input Section
function createDigitalInputSection(allPinDetails) {
    let html_lines = ''

    println('Create DIGITALIN Component')

    let count = 0
    for(eachkey in allPinDetails){
        let eachpindata = allPinDetails[eachkey]

        if(eachpindata['TYPE'] == "DIGITALIN" && eachpindata['STATUS'] == 'TRUE') 
        {
             // Create Set of three
             if(count == 0) {html_lines += '<div class="card-deck" style="margin-top : 20px;">'}

            count++;           

           html_lines += '<div class="card align-items-center" style="width: 180px; height : 250px;">\
                <img id="digital_'+eachkey+'_image" class="card-img-top" style="margin-left: 20px; margin-top : 10px; width: 100px; height: 100px;" src="https://media.geeksforgeeks.org/wp-content/uploads/OFFbulb.jpg" alt="Card image cap">\
                <div class="card-body text-center">\
                    <h4 class="card-title">'+eachkey+'</h4>\
                    <h6 class="card-subtitle mb-2 text-muted">'+eachpindata['NAME']+'</h6>\
                    <a href="#!" id="'+eachkey+'_moreoption" onclick="openDigitalINDeviceIDOptions(\'' + eachkey + '\')" class="card-link">More</a>\
                </div>\
                </div>'

            if(count == 5){
                count = 0
                html_lines += '</div>'
            }
        }


    }

    // Set HTML
    setHTML("digitalinguisection",'<h2 style="margin-top: 10px;"></h2>' + html_lines)

}

// Update Digital Input Details
function updateDigitalInput(allPinDetails,data)
{

    for(eachkey in allPinDetails)
    {
        let eachpindata = allPinDetails[eachkey]

        if(eachpindata['TYPE'] == "DIGITALIN" && eachpindata['STATUS'] == 'TRUE') 
        {
            let value = data[eachkey]

            var image = document.getElementById('digital_'+eachkey+'_image'); 
            if (value) 
            {
                image.src = "https://media.geeksforgeeks.org/wp-content/uploads/ONbulb.jpg"; 
            }
            else
            {
                image.src = "https://media.geeksforgeeks.org/wp-content/uploads/OFFbulb.jpg"; 
            } 
        
        }
    }

   
}


// ----------------------------------------------------------
// Create Digital Output Section
var digitalOUTStatus = {}
var digitalOUTControlStatus = {}
function createDigitalOutputSection(allPinDetails) {
    let html_lines = ''

    println('Create DIGITALOUT Component')

    let count = 0
    for(eachkey in allPinDetails){
        let eachpindata = allPinDetails[eachkey]

        if(eachpindata['TYPE'] == "DIGITALOUT" && eachpindata['STATUS'] == 'TRUE') 
        {
             // Create Set of three
             if(count == 0) {html_lines += '<div class="card-deck" style="margin-top : 20px;">'}

            count++;  

            digitalOUTControlStatus[eachkey] = true
            
            digitalOUTStatus[eachkey] = "OFF"

           html_lines += '<div class="card align-items-center" style="width: 180px; height : 300px;">\
                <img id="digital_'+eachkey+'_image" class="card-img-top" style="margin-left: 20px; margin-top : 10px; width: 100px; height: 100px;" src="https://media.geeksforgeeks.org/wp-content/uploads/OFFbulb.jpg" alt="Card image cap">\
                <div class="card-body text-center">\
                    <h4 class="card-title">'+eachkey+'</h4>\
                    <h6 class="card-subtitle mb-2 text-muted">'+eachpindata['NAME']+'</h6>\
                    <div class="row" id="'+eachkey+'_controlbtnsection">\
                    <a href="#!" id="'+eachkey+'_controlstatusoption" onclick="controlDigitalOUTStatus(\'' + eachkey + '#OFF' + '\')" class="btn btn-light col disabled" aria-disabled="true">OFF</a>\
                    <a href="#!" id="'+eachkey+'_controlstatusoption" onclick="controlDigitalOUTStatus(\'' + eachkey + '#ON' + '\')" class="btn btn-dark col">ON</a>\
                    </div><br>\
                    <a href="#!" id="'+eachkey+'_moreoption" onclick="openDigitalOUTDeviceIDOptions(\'' + eachkey + '\')" class="card-link col">More</a>\
                    </div>\
                </div>'

            if(count == 5){
                count = 0
                html_lines += '</div>'
            }
        }


    }

    // Set HTML
    setHTML("digitaloutguisection",'<h2 style="margin-top: 10px;"></h2>' + html_lines)

    println(digitalOUTControlStatus)

}

// Update Digital Input Details
function updateDigitalOutput(allPinDetails,data)
{

    for(eachkey in allPinDetails)
    {
        let eachpindata = allPinDetails[eachkey]

        if(eachpindata['TYPE'] == "DIGITALOUT" && eachpindata['STATUS'] == 'TRUE') 
        {
            let value = data[eachkey]

            digitalOUTControlStatus[eachkey] = true

            var image = document.getElementById('digital_'+eachkey+'_image'); 
            if (value) 
            {
                image.src = "https://media.geeksforgeeks.org/wp-content/uploads/ONbulb.jpg"; 
                digitalOUTStatus[eachkey] = "ON"
   
                let controlline = ' <a href="#!" id="'+eachkey+'_controlstatusoption" onclick="controlDigitalOUTStatus(\'' + eachkey + '#LOW' + '\')" class="btn btn-dark col">OFF</a>\
                <a href="#!" id="'+eachkey+'_controlstatusoption" onclick="controlDigitalOUTStatus(\'' + eachkey + '#HIGH' + '\')" class="btn btn-light col disabled" aria-disabled="true">ON</a>'

                setHTML(eachkey+'_controlbtnsection',controlline)
            }
            else
            {
                image.src = "https://media.geeksforgeeks.org/wp-content/uploads/OFFbulb.jpg"; 
                digitalOUTStatus[eachkey] = "OFF"
                let controlline = ' <a href="#!" id="'+eachkey+'_controlstatusoption" onclick="controlDigitalOUTStatus(\'' + eachkey + '#LOW' + '\')" class="btn btn-light col disabled" aria-disabled="true" >OFF</a>\
                <a href="#!" id="'+eachkey+'_controlstatusoption" onclick="controlDigitalOUTStatus(\'' + eachkey + '#HIGH' + '\')" class="btn btn-dark col">ON</a>'

                setHTML(eachkey+'_controlbtnsection',controlline)
            } 
        
        }
    }

   
}

// Control Digital Status
function controlDigitalOUTStatus(details) {
    println(details)
    let eachKey = details.split('#')[0]
    let pinstatus = details.split('#')[1]

    /*
    // Testing
    if(details.split('#')[1] == 'ON') {
        testingPinData['DIGIOUT'][details.split('#')[0]] = 1
    } else {
        testingPinData['DIGIOUT'][details.split('#')[0]] = 0
    }

    updateDigitalOutput(devicePinConfig,testingPinData)
    */
    

    // Send Command to hardware
    let mode = 'CONTROL_DOUT'
    let option = eachKey
    let parameter = pinstatus
    let cmdUrl = getCommand(deviceData['ADDRESS'],DEVICE,mode,option,parameter)

    println(cmdUrl)
    println(digitalOUTControlStatus)

    if(digitalOUTControlStatus[eachKey]) 
    {
        digitalOUTControlStatus[eachKey] = false
        
        getURLData(cmdUrl).then(data => {       
            println("SUCCESS!!")
            println(data)

            digitalOUTControlStatus[eachKey] = false

        }).catch(function(error) {
            println("FAILED !!")
            println(error);
            digitalOUTControlStatus[eachKey] = true

        });
    } else {
        println("Request Already Sent ....")
    }

}

// ---------------------------------------------------
// Status Hanling

// Refresh Status
var realtimeinfodetails = {}
var controlStatusClickBtnStatus = false
function readRealTimeInfoDetails() {
    var dbRealRef = db_real.ref(project_name + '/DEVICE/' + DEVICE + '/REALTIMESAMPLE/INFO');
    dbRealRef.on('value', function(snapshot) {
        //println('Real Time Info Updated !!')
        realtimeinfodetails = snapshot.val()
        // Object.keys(realtimeinfodetails).length > 0
        if(realtimeinfodetails != null) {
            updateRealTimeInfoDetails()
        }       

    });
}

// Device Status
var deviceStatusDetails = {}
function readDeviceStatusDetails() {
    var dbRealRef = db_real.ref(project_name + '/DEVICE/' + DEVICE + '/DEVICESTATUS');
    dbRealRef.on('value', function(snapshot) {
        println('Device Status Details !!')
        deviceStatusDetails = snapshot.val()
        // Object.keys(realtimeinfodetails).length > 0
        if(deviceStatusDetails != null) {
            setHTML('device_details_devicestatus','Device Status :  ' + deviceStatusDetails['CURRENT'])
        }       

    });
}

// Update Real Time Info Details
function updateRealTimeInfoDetails() 
{
    //println(realtimeinfodetails)

    // Check Status
    if(realtimeinfodetails["ACTIVESTATUS"]) {
        setHTML('device_details_realtimestatus','Real Time Mode is : Active')
        setHTML('device_details_realtimestatuscontrolssec','<a href="#" onclick="realTimeStatusHandling(\'' + 'FALSE' +  '\')" class="btn btn-primary">De-Activate</a>')
    } else {
        setHTML('device_details_realtimestatus','Real Time Mode is : Not Active')
        setHTML('device_details_realtimestatuscontrolssec','<a href="#" onclick="realTimeStatusHandling(\'' + 'TRUE' +  '\')" class="btn btn-primary">Activate</a>')
    }

    // Update Counter Value
    setHTML('device_details_realtimecount','Counter : ' + realtimeinfodetails["COUNT"].toString())

    setHTML('device_details_realtimestatuscontrolstatus','<h6>Connected</h6>')
    controlStatusClickBtnStatus = false

}

// Real Time Status Handling
function realTimeStatusHandling(status) 
{
    //println(status)

    // Send Command to hardware
    let mode = 'CONTROL_STATUS'
    let option = 'REALTIME'
    let parameter = status
    let cmdUrl = getCommand(deviceData['ADDRESS'],DEVICE,mode,option,parameter)

    println(cmdUrl)  
    setHTML('device_details_realtimestatuscontrolstatus','<h6>Please Wait ...</h6>')
    
    if(!controlStatusClickBtnStatus) {

        controlStatusClickBtnStatus = true
        
        getURLData(cmdUrl).then(data => {       
            println("SUCCESS!!")
            setHTML('device_details_realtimestatuscontrolstatus','<h6>SUCCESS!!</h6>')
            println(data)
            controlStatusClickBtnStatus = false
        }).catch(function(error) {
            println("FAILED !!")
            setHTML('device_details_realtimestatuscontrolstatus','<h6>FAILED!!</h6>')
            println(error);  
            controlStatusClickBtnStatus = false          
        });

    } else {
        println('Already In-Progress !!')
    }
    

}


//--------------------------------------------------
// Update Calibration Section
function updateCalibrationSection() {

    let htmlline = ''
    for(eachkey in deviceCalibData){
        let calibdata = deviceCalibData[eachkey]

        htmlline += '<li><b>'+eachkey+'     :      </b>'+calibdata['VALUE']+'</li>'
    }

    // Set HTML
    setHTML("calibsection",htmlline)

}

// Open Analog ID Options
function openAnalogDeviceIDOptions(ID)
{
    println(ID)
}

// Open Digital IN ID Options
function openDigitalINDeviceIDOptions(ID)
{
    println(ID)
}

// Open Digital OUT ID Options
function openDigitalOUTDeviceIDOptions(ID)
{
    println(ID)
}









 
  