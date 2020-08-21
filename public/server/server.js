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
var collectionProcessTimer = setInterval(collectionProcess, 300000);

// Collect Project Data
collectProjectData()

// Collect all Devices Data
collectAllDevicesDetails()


// -------------------------------------
// Collect Sample Details
// -------------------------------------
function collectionProcess() {

    // Check MAIN SERVER Status
    if(projectData['SERVER'] == 'ENABLE') {

        // Read All Devices Details
        for(each_device_key in allDeviceData) {
            
            let each_device_data = allDeviceData[each_device_key]
            if(each_device_data['ENABLE'] == 'TRUE') {
                println(each_device_key + ' : Device Enable.')
                collectDeviceSample(each_device_key)
            } else {
                println(each_device_key + ' : Device Disable.')
            }                     

        }        
        
    } else {
        println('Project Server is Disabled !!')
    }


}

// --------------------------------------
// Collect Device Sample 
// --------------------------------------

function collectDeviceSample(devicename) {

    println(' Collect Sample : ' + devicename)

    // Read Device Details   

    let deviceData = allDeviceData[devicename]

    //println(deviceData)

    // Collect Sample from Device
    let sampleData = collectSampleFromDevice(deviceData)

    //println(sampleData)

    // Update Sample Data Into Database
    db.collection(getFirestorePath('DEVICESAMPLE') + '/' + devicename + '/SAMPLE').add(sampleData).then(function() {
    }).then(function() {
            // Completed

             // Update Message in Main Device Document
             db.collection(getFirestorePath('DEVICE')).doc(devicename).update({
                "LASTMESSAGE": sampleData['MESSAGE']
            })
            .then(function() {
                // Completed

                setHTML(devicename+'_messagearea',sampleData['MESSAGE'])

                println(devicename + ' : Sample Collected.')
            });

    });   
    


}

// Collect Sample From Device
function collectSampleFromDevice(deviceData) {

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


// ===============================================

// -------------------------------------------
// Collect All Devices Details
// -------------------------------------------
var allDeviceData = {}
function collectAllDevicesDetails() {

    db.collection(getFirestorePath('DEVICE'))
    .onSnapshot(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            allDeviceData[doc.id] = doc.data()
        });

        println("All Device Data Updated !!")
        println(allDeviceData)
    });


}


// -------------------------------------------
// Collect Project Data
// -------------------------------------------

var projectData = ''
async function collectProjectData() {

    await db.collection(getFirestorePath('BASEPATH')).doc(project_name)
    .onSnapshot(function(doc) {
        projectData =  doc.data();

        println("Project Data Updated !!")
        println(projectData)
    });

    

}







 
  