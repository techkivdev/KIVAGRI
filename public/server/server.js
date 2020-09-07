// *******************************************************************************
// SCRIPT : server.js
//
//
// Author : Vivek Thakur
// Date : 27/7/2020
// *******************************************************************************


println('[START] : server script.')

init_operation()

// Timer Details --- every 5 min
var collectAllSamples = setInterval(collectAllSamples, 300000);

showPleaseWait()

// Collect Project Data
collectProjectData()

// Collect all Devices Data
collectAllDevicesDetails()


// -------------------------------------
// Collect Sample Details
// -------------------------------------

var syncStatus = true

var sampleCounter = {}
sampleCounter['COLLECT_ANALOG'] = 0
sampleCounter['COLLECT_DIGIIN'] = 0
sampleCounter['COLLECT_DIGIOUT'] = 0

var sampleCounterFailed = {}
sampleCounterFailed['COLLECT_ANALOG'] = 0
sampleCounterFailed['COLLECT_DIGIIN'] = 0
sampleCounterFailed['COLLECT_DIGIOUT'] = 0

// Collect Sample main function call
async function collectAllSamples() {

     // Check MAIN SERVER Status
     if(projectData['SERVER'] == 'ENABLE') {

        // Read Each Device Status And Update
        let timeDateDetails = getTodayDate() + ' : '  + getCurrentTime()
        let htmlline = '<p>Status Updated At : '+ timeDateDetails +'</p>'
         // Read All Devices Details
         for(each_device_key in allDeviceDetails) {                
            let each_device_data = allDeviceDetails[each_device_key]

            if(each_device_data['ENABLE'] == 'TRUE') {
                setHTML(each_device_key+'_device_message_section','<b>Device Status is ENABLE !!</b><br>' + htmlline)
            } else {
                setHTML(each_device_key+'_device_message_section','<b>Device Status is DISABLE !!</b><br>' + htmlline)
            }

         }

            analogValues_collectionProcess()

            await delay(60000);

            digiinValues_collectionProcess()

            await delay(60000);

            customeFounctionCalling()

            await delay(60000);

            digioutValues_collectionProcess()

     }
     else {
        println('Project Server is Disabled !!')
    }


}

// ANALOG Values
async function analogValues_collectionProcess() {

    if(syncStatus == false) {

        println('Syncronization Status : FALSE')

    } else {

            // Read All Devices Details
            for(each_device_key in allDeviceDetails) {
                
                let each_device_data = allDeviceDetails[each_device_key]

                if(each_device_data['ENABLE'] == 'TRUE') { 
                    // Check Active Configuration
                    if(each_device_data['ACTIVECONFIG'].split(',')[0] != '0') {
                         collectedSampleFromDevice(each_device_key,'COLLECT_ANALOG')
                    } else {
                        setHTML(each_device_key + '_' + 'COLLECT_ANALOG' + '_section','<h6>'+'COLLECT_ANALOG'+' : Active Config is DISABLE !!</h6>') 
                    }
                }                   

            }        
            
    }


}

// DIGITAL Input Values
async function digiinValues_collectionProcess() {

    if(syncStatus == false) {

        println('Syncronization Status : FALSE')

    } else {
       
            // Read All Devices Details
            for(each_device_key in allDeviceDetails) {
                
                let each_device_data = allDeviceDetails[each_device_key]

                if(each_device_data['ENABLE'] == 'TRUE') {                  

                     // Check Active Configuration
                     if(each_device_data['ACTIVECONFIG'].split(',')[1] != '0') {
                        collectedSampleFromDevice(each_device_key,'COLLECT_DIGIIN')
                     } else {
                        setHTML(each_device_key + '_' + 'COLLECT_DIGIIN' + '_section','<h6>'+'COLLECT_DIGIIN'+' : Active Config is DISABLE !!</h6>') 
                     }

                }                   

            } 

    }


}

// DIGITAL Output Values
async function digioutValues_collectionProcess() {

    if(syncStatus == false) {

        println('Syncronization Status : FALSE')

    } else {
       
            // Read All Devices Details
            for(each_device_key in allDeviceDetails) {
                
                let each_device_data = allDeviceDetails[each_device_key]

                if(each_device_data['ENABLE'] == 'TRUE') {                    

                     // Check Active Configuration
                     if(each_device_data['ACTIVECONFIG'].split(',')[2] != '0') {
                          collectedSampleFromDevice(each_device_key,'COLLECT_DIGIOUT')
                     } else {
                        setHTML(each_device_key + '_' + 'COLLECT_DIGIOUT' + '_section','<h6>'+'COLLECT_DIGIOUT'+' : Active Config is DISABLE !!</h6>')
                     }

                }                  

            }  

    }


}

// Custome Function Execution
async function customeFounctionCalling() {

    println("Device Custome Fuction Calls ...")

    if(syncStatus == false) {

        println('Syncronization Status : FALSE')

    } else {
       
            // Read All Devices Details
            for(each_device_key in allDeviceDetails) {
                
                let each_device_data = allDeviceDetails[each_device_key]

                if(each_device_data['ENABLE'] == 'TRUE') {   
                    
                    println(currentSampleData)
                    controlLogicForDevice(each_device_key,allDeviceDetails,allDevicePinConfig,allDeviceCalib,currentSampleData)

                    setHTML(each_device_key + '_CUSTOME_FCN_section','<h6>'+'CUSTOME FUNCTION : Completed At - '+getTodayDate() + ' : '  + getCurrentTime()+'</h6>')

                    syncStatus = true

                }                  

            }  

    }
}

// --------------------------------------
// Collect Device Sample 
// --------------------------------------

// Collect Sample From Device
function collectSampleFromDeviceTesting(deviceData) {

    // Send request to device 

    let sampleData = {}

    sampleData['DATE'] = getTodayDate()
    sampleData['DATELIST'] = getTodayDateList()

    sampleData['TIME'] = getCurrentTime()

    sampleData['MESSAGE'] = 'Last Sample Collected On : ' + getTodayDate() + ' At : ' + getCurrentTime()

    const timestamp = firebase.firestore.FieldValue.serverTimestamp();
    sampleData['UPDATEON'] = timestamp

    sampleData['DATASET'] = {
        'CH1' : Math.floor(Math.random() * 255),
        'CH2' : Math.floor(Math.random() * 255),
        'CH3' : Math.floor(Math.random() * 255),
        'CH4' : Math.floor(Math.random() * 255),
        'CH5' : Math.floor(Math.random() * 255),
        'CH6' : Math.floor(Math.random() * 255),
        'CH7' : Math.floor(Math.random() * 255),
        'CH8' : Math.floor(Math.random() * 255),
        'CH9' : Math.floor(Math.random() * 255),
        'CH10' : Math.floor(Math.random() * 255)
    }

    return sampleData
}

// Collected Sample from Device
async function collectedSampleFromDevice(ID,mode) {

    println('Collection For : ' + ID + '  Mode : ' + mode)
    let eachDeviceData = allDeviceDetails[ID]

    let section = ID + '_' + mode + '_section'

    // Send Command to hardware
    let cmdUrl = getCommand(eachDeviceData['ADDRESS'],ID,mode,'DATA','PARAMETER')

    println(cmdUrl)

    setHTML(section,'<h6>'+mode+' : Please Wait ....</h6>')

    syncStatus = false
        
    getURLData(cmdUrl).then(data => {       
        println("SUCCESS!!")
        println(data)

        sampleCounter[mode]++;

        currentSampleData[ID][mode] = 
        {
            DATA : data,
            SUCCESS : sampleCounter[mode],
            FAILED : sampleCounterFailed[mode]
        }        

        let timeDateDetails = getTodayDate() + ' : '  + getCurrentTime()
        let htmlline = '<h6>'+mode+' : SUCCESS on - '+ timeDateDetails +'</h6>'
        htmlline += '<p>Sample Collected : <br>SUCCESS : '+sampleCounter[mode] + '<br>FAILED : '+sampleCounterFailed[mode]+'</p>'

        setHTML(section,htmlline)        

        // Update Into Database
        updateSampleIntoDataBase(ID,data)

     
    }).catch(function(error) {
        println("FAILED !!")
        println(error)  

        sampleCounterFailed[mode]++;

        currentSampleData[ID][mode] = 
        {
            DATA : [],
            SUCCESS : sampleCounter[mode],
            FAILED : sampleCounterFailed[mode]
        } 

        let timeDateDetails = getTodayDate() + ' : '  + getCurrentTime()
        let htmlline = '<h6>'+mode+' : FAILED on - '+ timeDateDetails +'</h6>'
        htmlline += '<p>Sample Collected : <br>SUCCESS : '+sampleCounter[mode] + '<br>FAILED : '+sampleCounterFailed[mode]+'</p>'

        setHTML(section,htmlline)

         // Update Into Database
         updateFailedSampleIntoDataBase(ID,mode)
        
    });

}

// Update Sample Into Database
async function updateSampleIntoDataBase(devicename,dbData) {

    let sampleData = {}

    sampleData['DATE'] = getTodayDate()
    sampleData['DATELIST'] = getTodayDateList()

    sampleData['TIME'] = getCurrentTime()

    sampleData['MESSAGE'] = 'Last Sample Collected On : ' + getTodayDate() + ' At : ' + getCurrentTime()

    const timestamp = firebase.firestore.FieldValue.serverTimestamp();
    sampleData['UPDATEON'] = timestamp

    sampleData['TYPE'] = dbData['TYPE']
    sampleData['DATASET'] = dbData['DATA']


     // Set Main Device Document
    await db.collection(getFirestorePath('DEVICESAMPLE') + '/' + devicename + '/' + dbData['TYPE']).add(sampleData).then(function() {        
    }).then(function() {
        println(devicename + ' : New Sample Added')

        /*
        // Update Message in Main Device Document
        db.collection(getFirestorePath('DEVICE')).doc(devicename).update({
            "LASTMESSAGE": sampleData['MESSAGE']
        })
        .then(function() {
            // Completed

            setHTML(devicename+'_messagearea',sampleData['MESSAGE'])

            println(devicename + ' : Sample Collected.')
        });
        */

       syncStatus = true

    });


}

// Update Failed Sample Into Database
async function updateFailedSampleIntoDataBase(devicename,mode) {

    let sampleData = {}

    sampleData['DATE'] = getTodayDate()
    sampleData['DATELIST'] = getTodayDateList()

    sampleData['TIME'] = getCurrentTime()

    sampleData['MESSAGE'] = 'Last Sample Collected On : ' + getTodayDate() + ' At : ' + getCurrentTime()

    const timestamp = firebase.firestore.FieldValue.serverTimestamp();
    sampleData['UPDATEON'] = timestamp

    sampleData['TYPE'] = mode.replace('_','')
    //sampleData['DATASET'] = dbData['DATA']


     // Set Main Device Document
    await db.collection(getFirestorePath('DEVICESAMPLEFAILED') + '/' + devicename + '/' + mode.replace('_','')).add(sampleData).then(function() {        
    }).then(function() {
        println(devicename + ' : New Sample Added')

       syncStatus = true

    });


}

// ===============================================

// -------------------------------------------
// Collect All Devices Details
// -------------------------------------------
var currentSampleData = {}
var allDeviceDetails = {}
var allDevicePinConfig = {}
var allDeviceCalib = {}
async function collectAllDevicesDetails() {

    await db.collection(getFirestorePath('DEVICE'))
    .onSnapshot(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            allDeviceDetails[doc.id] = doc.data()
            currentSampleData[doc.id] = {
                COLLECT_ANALOG : [],
                COLLECT_DIGIIN : [],
                COLLECT_DIGIOUT : []
            }
        });

        println("All Device Data Updated !!")
        println(allDeviceDetails)

        getDeviceOtherData()

    });


}

// Get Device Other DATA
async function getDeviceOtherData() {

    for(eachkey in allDeviceDetails) {

        const pinconfigdoc = await db.collection(getFirestorePath('DEVICE')).doc(eachkey + '/DATA/' + 'PINCONFIG').get();
        if (!pinconfigdoc.exists) {
            println('No Document !!')
        } else {
            //println(pinconfigdoc.data())
            allDevicePinConfig[eachkey] = pinconfigdoc.data()
        }


        const calibdoc = await db.collection(getFirestorePath('DEVICE')).doc(eachkey + '/DATA/' + 'CALIB').get();
        if (!calibdoc.exists) {
            println('No Document !!')
        } else {
            //println(calibdoc.data())
            allDeviceCalib[eachkey] = calibdoc.data()
        }


    }

    
    println(allDevicePinConfig)
    println(allDeviceCalib)

    // Start Nest Process
    startServerProcess()
}

// ------------------------------------------------------
// START Server Process after DB read complete
function startServerProcess() {
    
    println('START Server Process ....')

    updateHTMLPage()

    hidePleaseWait()

}

// Update HTML Page
function updateHTMLPage() {

    // Update Server Header Section
    let timeDateDetails = getTodayDate() + ' : '  + getCurrentTime()
    let htmlline = '<h6>Server Started At : '+ timeDateDetails +'</h6>'

    setHTML("serverheader",project_name + ' Server')
    setHTML("serverheadersection",htmlline)


    // Create Card Section
    let card_html_lines = ''

    for(eachkey in allDeviceDetails) {
        let devicedata = allDeviceDetails[eachkey]

        card_html_lines += ' <div class="card" style="margin-top : 40px;">\
        <div class="card-header">\
          <h6>Device 1</h6>\
        </div>\
        <div class="card-body">\
          <h5 class="card-title">'+eachkey+'</h5>\
          <div class="card-text" id="DEVICE1_messagearea">\
            <div id="'+eachkey+'_device_message_section" style="margin-top : 20px;">Device Message Section</div>\
            <div id="'+eachkey+'_COLLECT_ANALOG_section" style="margin-top : 20px;">Analog Sample Section</div>\
            <div id="'+eachkey+'_COLLECT_DIGIIN_section" style="margin-top : 20px;">Digital Input Section</div>\
            <div id="'+eachkey+'_CUSTOME_FCN_section" style="margin-top : 20px;">Custome Function Section</div>\
            <div id="'+eachkey+'_COLLECT_DIGIOUT_section" style="margin-top : 20px;">Digital Output Section</div>\
          </div>\
        </div>\
        </div>'

    }

    setHTML('main_card_section',card_html_lines)

}


// -------------------------------------------
// Collect Project Data
// -------------------------------------------

var projectData = {}
async function collectProjectData() {

    await db.collection(getFirestorePath('BASEPATH')).doc(project_name)
    .onSnapshot(function(doc) {
        projectData =  doc.data();
        if(projectData != null) {
            println("Project Data Updated !!")
            println(projectData)
        }
    });

    

}







 
  