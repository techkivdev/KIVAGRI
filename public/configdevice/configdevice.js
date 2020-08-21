// *******************************************************************************
// SCRIPT : configdevice.js
//
//
// Author : Vivek Thakur
// Date : 27/7/2020
// *******************************************************************************


println('[START] : configdevice script.')

// ------------------------------------
// Variables

var test_device_ID = ''
var allDevicesData = {}

init_operation()

readDatabaseAndUpdatePage()


// ************** READ DATABASE ***************

async function readDatabaseAndUpdatePage() {

    showPleaseWait()
    
    const doc = await db.collection(getFirestorePath('BASEPATH')).doc(project_name).get();
    if (!doc.exists) {
        println('No such document!');

        // Create Default Project
        println('Project Created !!')

        // Update Database
        let dbData = {}
        dbData['NAME'] = project_name
        dbData['DETAILS'] = ''
        dbData['TYPE'] = 'TYPE 1'
        dbData['SERVER'] = 'DISABLE'

        setNewDocument(getFirestorePath('BASEPATH'),project_name,dbData,'Project Configuration Updated !!')

    } else {

        let projectData = doc.data()

        setHTMLValue('projectname',projectData['NAME'])
        setHTMLValue('projectdetails',projectData['DETAILS'])
        setHTMLValue('projecttype',projectData['TYPE'])
        setHTMLValue('projectserver',projectData['SERVER'])
      
    }

    let listgroupdetails = '<div class="col-4">\
                            <div class="list-group" id="list-tab" role="tablist">'

    
    let listtabdetails = ' <div class="col-8">\
                           <div class="tab-content" id="nav-tabContent">'

    const snapshot = await db.collection(getFirestorePath('DEVICE')).get();
    snapshot.forEach(doc => {

        //console.log(doc.id, '=>', doc.data());
         allDevicesData[doc.id] = doc.data()

        // Create Each Devices Navigation Tabs

        let each_device_tab = ' <ul class="nav nav-tabs" id="'+doc.id+'_navtabs" role="tablist">\
        <li class="nav-item" role="presentation">\
            <a class="nav-link active" id="'+doc.id+'_home-tab" data-toggle="tab" href="#'+doc.id+'_home" role="tab" aria-controls="home" aria-selected="true">Home</a>\
        </li>\
        <li class="nav-item" role="presentation">\
            <a class="nav-link" id="'+doc.id+'_option-tab" data-toggle="tab" href="#'+doc.id+'_option" role="tab" aria-controls="option" aria-selected="false">Option</a>\
        </li>\
        <li class="nav-item" role="presentation">\
            <a class="nav-link" id="'+doc.id+'_control-tab" data-toggle="tab" href="#'+doc.id+'_control" role="tab" aria-controls="control" aria-selected="false">Control</a>\
        </li>\
        <li class="nav-item" role="presentation">\
            <a class="nav-link" id="'+doc.id+'_calib-tab" data-toggle="tab" href="#'+doc.id+'_calib" role="tab" aria-controls="calib" aria-selected="false">Calib</a>\
        </li>\
        <li class="nav-item" role="presentation">\
            <a class="nav-link" id="'+doc.id+'_config-tab" data-toggle="tab" href="#'+doc.id+'_config" role="tab" aria-controls="config" aria-selected="false">Config</a>\
        </li>\
        </ul>'

        let each_device_tab_data = '<div class="tab-content" id="myTabContent">\
        <div class="tab-pane fade show active" id="'+doc.id+'_home" role="tabpanel" aria-labelledby="home-tab">' + getDeviceHomeTabsDetails(doc.id) +'</div>\
        <div class="tab-pane fade" id="'+doc.id+'_option" role="tabpanel" aria-labelledby="option-tab">' + getDeviceOptionTabsDetails(doc.id) +'</div>\
        <div class="tab-pane fade" id="'+doc.id+'_control" role="tabpanel" aria-labelledby="control-tab">' + getDeviceControlTabsDetails(doc.id) +'</div>\
        <div class="tab-pane fade" id="'+doc.id+'_calib" role="tabpanel" aria-labelledby="calib-tab">' + getDeviceCalibTabsDetails(doc.id) +'</div>\
        <div class="tab-pane fade" id="'+doc.id+'_config" role="tabpanel" aria-labelledby="config-tab">' + getDeviceConfigTabsDetails(doc.id) +'</div>\
        </div>'
        


    // Final Creation of Device Section
    listgroupdetails += '<a class="list-group-item list-group-item-action " id="list-'+doc.id+'-list" data-toggle="list" href="#list-'+doc.id+'" role="tab" aria-controls="'+doc.id+'">'+doc.id+'</a>'

    listtabdetails += ' <div class="tab-pane fade " id="list-'+doc.id+'" role="tabpanel" aria-labelledby="list-'+doc.id+'-list">' + 
                       each_device_tab + each_device_tab_data
                       + '</div>'


    });

    listgroupdetails += '</div></div>'
    listtabdetails += '</div></div>'

    let allDeviceDetails = ' <div class="row">' + listgroupdetails + listtabdetails + '</div>'

    setHTML('alldevicesection',allDeviceDetails)

    hidePleaseWait()

    handleBlockView('main_section','show')


}


// Get Device Home HTML Lines
function getDeviceHomeTabsDetails (ID) {

    let eachDeviceData = allDevicesData[ID]
    let each_device_tabs_lines = '<br>\
    <div class="card">\
      <div class="card-body">\
         <h4>'+ID+' Home</h4>\
         \
         <div class="form-group">\
          <label for="'+ID+'_devicename">Name</label>\
          <input type="text" class="form-control" id="'+ID+'_devicename" value="'+eachDeviceData['NAME']+'">\
        </div>\
\
        <div class="form-group">\
          <label for="'+ID+'_deviceaddress">Address</label>\
          <input type="text" class="form-control" id="'+ID+'_deviceaddress" value="'+eachDeviceData['ADDRESS']+'">\
        </div>\
        \
        <div class="form-group">\
        <label for="'+ID+'_devicedetails">Details</label>\
        <textarea class="form-control" id="'+ID+'_devicedetails" rows="3">'+eachDeviceData['DETAILS']+'</textarea>\
        </div>\
        \
        <div class="form-group">\
     <label for="'+ID+'_devicemode">Mode</label>\
     <select class="form-control" id="'+ID+'_devicemode">'

     let selectline = ''
     let checkwith = ''

     checkwith = 'TEST'
     if(eachDeviceData['MODE'] == checkwith) {selectline += '<option selected>'+checkwith+'</option>'} else { selectline += ' <option>'+checkwith+'</option>' }
     checkwith = 'DEV'
     if(eachDeviceData['MODE'] == checkwith) {selectline += '<option selected>'+checkwith+'</option>'} else { selectline += ' <option>'+checkwith+'</option>' }
     checkwith = 'PRO'
     if(eachDeviceData['MODE'] == checkwith) {selectline += '<option selected>'+checkwith+'</option>'} else { selectline += ' <option>'+checkwith+'</option>' }
      
     each_device_tabs_lines +=  selectline +'</select>\
   </div>\
   \
   <div class="form-group">\
   <label for="'+ID+'_deviceenable">Active Status</label>\
   <select class="form-control" id="'+ID+'_deviceenable">'
     
   selectline = ''        
   if(eachDeviceData['ENABLE'] == 'TRUE') {selectline = '<option selected>TRUE</option><option >FALSE</option>'} else { selectline = '<option >TRUE</option><option selected>FALSE</option>' }
   
   each_device_tabs_lines +=  selectline +'</select>\
 </div>\
    \
    <div class="form-group">\
    <label for="'+ID+'_realtimeStatus">Realtime Activation</label>\
    <select class="form-control" id="'+ID+'_realtimeStatus">'
    
    selectline = ''        
    if(eachDeviceData['REALTIMESTATUS'] == 'TRUE') {selectline = '<option selected>TRUE</option><option >FALSE</option>'} else { selectline = '<option >TRUE</option><option selected>FALSE</option>' }
    
    each_device_tabs_lines +=  selectline +'</select>\
    </div>\
    <div class="form-group">\
    <label for="'+ID+'_realtimemaxlimit">Real Time MAX Limt</label>\
    <select class="form-control" id="'+ID+'_realtimemaxlimit">'

    selectline = ''
    checkwith = ''

    checkwith = '10'
    if(eachDeviceData['REALTIMEMAXLIMIT'] == checkwith) {selectline += '<option selected>'+checkwith+'</option>'} else { selectline += ' <option>'+checkwith+'</option>' }
    checkwith = '100'
    if(eachDeviceData['REALTIMEMAXLIMIT'] == checkwith) {selectline += '<option selected>'+checkwith+'</option>'} else { selectline += ' <option>'+checkwith+'</option>' }
    checkwith = '500'
    if(eachDeviceData['REALTIMEMAXLIMIT'] == checkwith) {selectline += '<option selected>'+checkwith+'</option>'} else { selectline += ' <option>'+checkwith+'</option>' }
     
    each_device_tabs_lines +=  selectline +'</select>\
  </div>\
    \
    <div class="form-group">\
    <label for="'+ID+'_devicefcnStatus">Device Function Activation</label>\
    <select class="form-control" id="'+ID+'_devicefcnStatus">'
    
    selectline = ''        
    if(eachDeviceData['DEVICEFCNSTATUS'] == 'TRUE') {selectline = '<option selected>TRUE</option><option >FALSE</option>'} else { selectline = '<option >TRUE</option><option selected>FALSE</option>' }
    
    each_device_tabs_lines +=  selectline +'</select>\
    </div>\
    <div class="form-group">\
    <label for="'+ID+'_devicefcnmode">Device Function Mode</label>\
    <select class="form-control" id="'+ID+'_devicefcnmode">'

    selectline = ''
    checkwith = ''

    checkwith = 'MODE1'
    if(eachDeviceData['DEVICEFCNMODE'] == checkwith) {selectline += '<option selected>'+checkwith+'</option>'} else { selectline += ' <option>'+checkwith+'</option>' }
    checkwith = 'MODE2'
    if(eachDeviceData['DEVICEFCNMODE'] == checkwith) {selectline += '<option selected>'+checkwith+'</option>'} else { selectline += ' <option>'+checkwith+'</option>' }
    checkwith = 'MODE3'
    if(eachDeviceData['DEVICEFCNMODE'] == checkwith) {selectline += '<option selected>'+checkwith+'</option>'} else { selectline += ' <option>'+checkwith+'</option>' }
     
    each_device_tabs_lines +=  selectline +'</select>\
  </div>\
\
        <div class="form-group" style="margin-top: 20px;">\
        <button onclick="updateEachDeviceDetails(\'' + ID + '\')" id="'+ID+'_deviceupdatebtn" class="btn btn-success float-right">UPDATE</button>\
        </div>\
        </div>\
        </div>'



   return each_device_tabs_lines;

}

// Get Device Options HTML Lines
function getDeviceOptionTabsDetails (ID) {

    let eachDeviceData = allDevicesData[ID]
    let each_device_tabs_lines = '<br>\
    <div class="card">\
      <div class="card-body">\
         <h6>Connect to Hardware</h6>\
         <div class="form-group" style="margin-top: 20px;">\
          <button onclick="deviceTestExecution(\'' + ID + '\')" id="'+ID+'_devicetestexection" class="btn btn-primary">Perform Test</button>\
        </div>\
        </div></div>'

    each_device_tabs_lines += '<br>\
        <div class="card">\
          <div class="card-body">\
             <h6>Sync Device Data</h6>\
             <div class="form-group" style="margin-top: 20px;">\
              <button onclick="syncDeviceDataConfig(\'' + ID + '\')" id="'+ID+'_devicetestexection" class="btn btn-primary">SYNC</button>\
             </div>\
            <div id="'+ID+'_devicecurrentsyncid" style="margin-top : 30px;"><p>Sync Status</p></div>\
            </div></div>'


   return each_device_tabs_lines;

}

// Get Device Control HTML Lines
function getDeviceControlTabsDetails (ID) {

    let eachDeviceData = allDevicesData[ID]
    let each_device_tabs_lines = '<br>\
    <div class="card">\
      <div class="card-body">\
         <h4>'+ID+' Control</h4>\
         \
         \
        </div></div>'


   return each_device_tabs_lines;

}

// Get Device Config HTML Lines
function getDeviceConfigTabsDetails (ID) {

    let eachDeviceData = allDevicesData[ID]

    // Configuration
    let each_device_tabs_lines = '\
      <div id="'+ID+'_devicepinconfigsection" style="margin-top : 20px;">\
      <h6>Please SYNC Device Data</h6>\
      </div>'


   return each_device_tabs_lines;

}

// Get Device Calib HTML Lines
function getDeviceCalibTabsDetails(ID) {

    let eachDeviceData = allDevicesData[ID]

    // Configuration
    let each_device_tabs_lines = '\
      <div id="'+ID+'_devicecalibsection" style="margin-top : 20px;">\
      <h6>Please SYNC Device Data</h6>\
      </div>'


   return each_device_tabs_lines;

}

// Update Pin Config Section
function updatePinConfigSection(ID) {

    // Configuration
    let each_device_configline = '\
      <div>\
      <div class="card" style="margin-top : 20px;">\
      <div class="card-body">\
         <h6>'+ID+' Pin Configuration</h6>\
         <div class="row">\
         <div class="col-sm-12 form-group">\
         <label for="'+ID+'_deviceselectpinconfigid">Select ID</label>\
         <select class="form-control" id="'+ID+'_devicepinconfigid">\
            <option selected>Please Select</option>'

            let selectionline = ''
            for(eachkey in currentDevicePinConfigData) {
                selectionline += '<option>'+eachkey+'</option>'
            }

            each_device_configline +=  selectionline + '</select>\
       </div>\
         <div class="col-sm-12 form-group" style="margin-top: 20px;">\
          <button onclick="updateDevicePinConfig(\'' + ID + '\')" id="'+ID+'_deviceupdatepinconfig" class="btn btn-warning float-right">Update</button>\
        </div>\
        <div class="col-sm-12" id="'+ID+'_devicepinconfig">\
        </div></div></div>'

        setHTML(ID+'_devicepinconfigsection', each_device_configline)

}

// Update Calib Section
function updateCalibSection(ID) {

    let calibHtmlLines = ''

    for(eachkey in currentDeviceCalibData) {
        let calibdata = currentDeviceCalibData[eachkey]

        calibHtmlLines += ' <div class="col-sm-12 form-group">\
        <label for="'+ID+ '_' +eachkey+ '_calibvalue">'+calibdata['ID']+'</label>\
        <input type="number" class="form-control" id="'+ID + '_' +eachkey+ '_calibvalue" value="'+calibdata['VALUE']+'">\
        </div>'

    }

    calibHtmlLines += ' <div class="col-sm-12 form-group" style="margin-top: 10px;">\
        <button onclick="saveDeviceCalibData(\'' + ID + '\')" id="'+ID + '_calibsave" class="btn btn-success float-right">SAVE</button>\
        </div>'

       
        setHTML(ID+"_devicecalibsection",'<div class="row">'+calibHtmlLines+'</div>')

}



// ************ Device Execution **********************

// Perform Device Test Execution
function deviceTestExecution(details) {

    println(details + ' : Test Execution..')

    test_device_ID = details

    $('#deviceTestExecutionModal').modal('show')

    setHTMLValue('deviceCommandResultModal',test_device_ID + ' Test START.')

    setHTML('deviceCommandDetailsSec','<h6>'+test_device_ID+'</h6>')

}

// Update Details Section
function updateDetailsSection(mode,jsonData)
{
    println(jsonData)

    let htmlline = ''    

    for(eachkey in jsonData){
        let value = jsonData[eachkey];

        if(Array.isArray(value)){
           
            let arrayline = ''
            for(idx in value){
                let avalue = value[idx]
                let ID = getArrayIDDetails(mode,idx)
                if(ID != 'NA') {
                   arrayline += '<li><b>' + ID + ' : </b>' + avalue + '</li>'
                }
            }

            htmlline += '<br><b>' + eachkey + ' Status : </b><br>' + arrayline            

        } else {
            htmlline += '<li><b>' + eachkey + '    :    </b>' + value + '</li>'
        }
        
    }

    setHTML('deviceCommandDetailsSec','<h6>'+test_device_ID+'</h6><br>' + htmlline)
}

// Get ID Details Accroding to the Mode
function getArrayIDDetails(mode,idx) {

    let control_status = getHardwareConfigDetails()

    if(mode == 'INFO') {
        return control_status[idx]
    } else if(mode == 'COLLECT_ANALOG') {
        
        let ID = 'AID'+idx
        if( ID in currentDevicePinConfigData) {
            if(currentDevicePinConfigData[ID]['STATUS'] == 'TRUE') {
                return ID
            } else {
                return 'NA'
            }
           
        } else {
            return ID
        }
        
    } else if(mode == 'COLLECT_DIGIIN') {

        let ID = 'DINID'+idx
        if( ID in currentDevicePinConfigData) {
            if(currentDevicePinConfigData[ID]['STATUS'] == 'TRUE') {
                return ID
            } else {
                return 'NA'
            }
           
        } else {
            return ID
        }

    } else if(mode == 'COLLECT_DIGIOUT') {
        
        let ID = 'DOUTID'+idx
        if( ID in currentDevicePinConfigData) {
            if(currentDevicePinConfigData[ID]['STATUS'] == 'TRUE') {
                return ID
            } else {
                return 'NA'
            }
           
        } else {
            return ID
        }

    } else {
        return idx
    }

}

// Start Test Execution
function startTestExecution() {

    let result_line = ''

    var deviceCommandModal = getHTMLValue("deviceCommandModal");

    let eachDeviceData = allDevicesData[test_device_ID]

    // Create URL
    let mode = deviceCommandModal
    let option = 'DATA'
    let parameter = 'PARAMETER'

    let cmdUrl = ''
    if(mode == "CONTROL_DOUT")
    {
        option = 'DOUTID0'
        parameter = 'HIGH'
        cmdUrl = getCommand(eachDeviceData['ADDRESS'],test_device_ID,mode,option,parameter)
    } else {
        cmdUrl = getCommand(eachDeviceData['ADDRESS'],test_device_ID,mode,option,parameter)
    }
    
    //cmdUrl = 'https://jsonplaceholder.typicode.com/todos/1'  // -- testing

    
    result_line += test_device_ID + ' Test START.\n'

    result_line += 'Device : ' + test_device_ID + '\n'
    result_line += 'Command : ' + cmdUrl + '\n\n'

    // Start Get Request
   
    result_line += 'START...\n'
    setHTMLValue('deviceCommandResultModal',result_line)

    getURLData(cmdUrl).then(data => {

        updateDetailsSection(mode,data)

        result_line += 'END\n\nRESULT : SUCCESS.\n\n'
        result_line += data
        setHTMLValue('deviceCommandResultModal',result_line)

    }).catch(function(error) {
        println(error);

        setHTML('deviceCommandDetailsSec','<h6>'+test_device_ID+'</h6><br><b>Request FAILED !!</b>')

        result_line += 'END\n\nRESULT : FAILED.\n\n'
        result_line += 'ERROR FOUND \n'
        result_line += error

        setHTMLValue('deviceCommandResultModal',result_line)
    });
   

    

}

// Sync Device Data Config
var currentDevicePinConfigData = {}
var currentDeviceCalibData = {}
var currentDeviceID = ''
async function syncDeviceDataConfig(ID) {

    println("Sync Device Config Data : " + ID)
    currentDeviceID = ID;

    showPleaseWait()

    setHTML(ID+"_devicecurrentsyncid","<p>Please Wait .... </p>")

    const pinconfigdoc = await db.collection(getFirestorePath('DEVICE') + '/' + ID + '/DATA').doc('PINCONFIG').get();
    if (!pinconfigdoc.exists) {
        println('No such document!');
    } else {
        currentDevicePinConfigData = pinconfigdoc.data()      
    }

    const calibdoc = await db.collection(getFirestorePath('DEVICE') + '/' + ID + '/DATA').doc('CALIB').get();
    if (!calibdoc.exists) {
        println('No such document!');
    } else {
        currentDeviceCalibData = calibdoc.data()      
    }

    setHTML(ID+"_devicecurrentsyncid","<p>Current Sync Device ID : " + currentDeviceID+"</p>")

    updatePinConfigSection(ID)
    updateCalibSection(ID)

    println(ID + " - SYNC DONE.")

    println(currentDevicePinConfigData)
    println(currentDeviceCalibData)

    hidePleaseWait()



}

// -------------- PIN Config Handling ------------------------
// Update Device Config Details
function updateDevicePinConfig(ID) {

    println("Update Pin Config For : " + ID)

    var devicepinconfigid = getHTMLValue(ID + "_devicepinconfigid");

    if(devicepinconfigid != 'Please Select') {

        let eachDeviceConfig = currentDevicePinConfigData[devicepinconfigid]

        println(eachDeviceConfig)

        // Update Pin Config Section

        let eachPinDetails = ''
        let dissabledline = ''
        eachPinDetails += ' <div class="col-sm-12 form-group">\
                <label for="'+ID+ '_' +devicepinconfigid+ '_pinconfigid">ID</label>\
                <input disabled type="text" class="form-control" id="'+ID + '_' +devicepinconfigid+ '_pinconfigid" value="'+eachDeviceConfig['ID']+'">\
                </div>'

        eachPinDetails += ' <div class="col-sm-12 form-group">\
                <label for="'+ID+ '_' +devicepinconfigid+ '_pinconfigname">Name</label>\
                <input type="text" class="form-control" id="'+ID + '_' +devicepinconfigid+ '_pinconfigname" value="'+eachDeviceConfig['NAME']+'">\
                </div>'

        eachPinDetails += ' <div class="col-sm-12 form-group">\
        <label for="'+ID+ '_' +devicepinconfigid+ '_pinconfigdesc">Short Description</label>\
        <input type="text" class="form-control" id="'+ID + '_' +devicepinconfigid+ '_pinconfigdesc" value="'+eachDeviceConfig['DESC']+'">\
        </div>'

        eachPinDetails += ' <div class="col-sm-12 form-group">\
        <label for="'+ID+ '_' +devicepinconfigid+ '_pinconfigtype">Type</label>\
        <input disabled type="text" class="form-control" id="'+ID + '_' +devicepinconfigid+ '_pinconfigtype" value="'+eachDeviceConfig['TYPE']+'">\
        </div>'

        if(eachDeviceConfig['TYPE'] != 'ANALOG') {
            dissabledline = 'disabled'
        } 

        eachPinDetails += ' <div class="col-sm-12 form-group">\
        <label for="'+ID+ '_' +devicepinconfigid+ '_pinconfigpin">Pin Details</label>\
        <input type="text" class="form-control" id="'+ID + '_' +devicepinconfigid+ '_pinconfigpin" value="'+eachDeviceConfig['PIN']+'">\
        </div>'

        /*
        eachPinDetails += ' <div class="col-sm-12 form-group">\
        <label for="'+ID+ '_' +devicepinconfigid+ '_pinconfigstatus">Status</label>\
        <input type="text" class="form-control" id="'+ID + '_' +devicepinconfigid+ '_pinconfigstatus" value="'+eachDeviceConfig['STATUS']+'">\
        </div>'
        */

        eachPinDetails += '<div class="col-sm-12 form-group">\
        <label for="'+ID + '_' +devicepinconfigid+ '_pinconfigstatus">Status</label>\
        <select class="form-control" id="'+ID + '_' +devicepinconfigid+ '_pinconfigstatus">'
          
        selectline = ''        
        if(eachDeviceConfig['STATUS'] == 'TRUE') {selectline = '<option selected>TRUE</option><option >FALSE</option>'} else { selectline = '<option >TRUE</option><option selected>FALSE</option>' }
        
        eachPinDetails +=  selectline +'</select>\
      </div>'

        eachPinDetails += ' <div class="col-sm-12 form-group">\
        <label for="'+ID+ '_' +devicepinconfigid+ '_pinconfiginitvalue">Init Value</label>\
        <input type="text" class="form-control" id="'+ID + '_' +devicepinconfigid+ '_pinconfiginitvalue" value="'+eachDeviceConfig['INITVALUE']+'">\
        </div>'

        eachPinDetails += ' <div class="col-sm-12 form-group">\
        <label for="'+ID+ '_' +devicepinconfigid+ '_pinconfigminvalue">MIN Value</label>\
        <input '+dissabledline+' type="text" class="form-control" id="'+ID + '_' +devicepinconfigid+ '_pinconfigminvalue" value="'+eachDeviceConfig['MINVALUE']+'">\
        </div>'

        eachPinDetails += ' <div class="col-sm-12 form-group">\
        <label for="'+ID+ '_' +devicepinconfigid+ '_pinconfigmaxvalue">MAX Value</label>\
        <input '+dissabledline+' type="text" class="form-control" id="'+ID + '_' +devicepinconfigid+ '_pinconfigmaxvalue" value="'+eachDeviceConfig['MAXVALUE']+'">\
        </div>'

        eachPinDetails += ' <div class="col-sm-12 form-group">\
        <label for="'+ID+ '_' +devicepinconfigid+ '_pinconfigconfactor">Conversion Factor</label>\
        <input '+dissabledline+' type="text" class="form-control" id="'+ID + '_' +devicepinconfigid+ '_pinconfigconfactor" value="'+eachDeviceConfig['CONFACTOR']+'">\
        </div>'

        eachPinDetails += ' <div class="col-sm-12 form-group">\
        <label for="'+ID+ '_' +devicepinconfigid+ '_pinconfigcngfactor">Change Factor</label>\
        <input '+dissabledline+' type="text" class="form-control" id="'+ID + '_' +devicepinconfigid+ '_pinconfigcngfactor" value="'+eachDeviceConfig['CNGFACTOR']+'">\
        </div>'

        eachPinDetails += ' <div class="col-sm-12 form-group">\
        <label for="'+ID+ '_' +devicepinconfigid+ '_pinconfigextra">Extra</label>\
        <input type="text" class="form-control" id="'+ID + '_' +devicepinconfigid+ '_pinconfigextra" value="'+eachDeviceConfig['EXTRA']+'">\
        </div>'

        eachPinDetails += ' <div class="col-sm-12 form-group" style="margin-top: 10px;">\
        <button onclick="saveDevicePinConfig(\'' + ID + '#' + devicepinconfigid + '\')" id="'+ID + '_' +devicepinconfigid+ '_pinconfigsave" class="btn btn-success float-right">SAVE</button>\
        <button onclick="viewallDevicePinConfig(\'' + ID + '#' + eachDeviceConfig['TYPE'] + '\')" id="'+ID + '_' +devicepinconfigid+ '_pinconfigviewall" class="btn btn-info float-right" style="margin-right : 20px;">VIEW ALL</button>\
        </div>'



        setHTML(ID+"_devicepinconfig",'<div class="row">'+eachPinDetails+'</div>')

    }
}

// View PIN Configuration details in table format
function viewallDevicePinConfig(details) {

    println("View Pin Configuration : " + details)

    $('#pinconfigurationModal').modal('show')



}

// Update Pin Configuration Table Data
function updatePinConfigTableData() {

    println("Update Pin Configuration Data.")

    var pinconfigtypes = getHTMLValue("pinconfigtypes");

    if(pinconfigtypes != "Please Select") {

            let tableData = ''
            tableData += '<br><br><table class="table table-striped">\
            <thead>\
            <tr>\
                <th>ID</th>\
                <th>NAME</th>\
                <th>PIN</th>\
                <th>STATUS</th>\
                <th>INIT</th>\
                <th>MIN-MAX</th>\
                <th>CONF-CNG</th>\
            </tr>\
            </thead>\
            <tbody>'

            for(eachkey in currentDevicePinConfigData) {
                let eachPinData = currentDevicePinConfigData[eachkey]

                if(eachPinData['TYPE'] == pinconfigtypes) {
                    
                    tableData += '<tr>\
                                    <td>'+eachPinData["ID"]+'</td>\
                                    <td>'+eachPinData["NAME"]+'</td>\
                                    <td>'+eachPinData["PIN"]+'</td>\
                                    <td>'+eachPinData["STATUS"]+'</td>\
                                    <td>'+eachPinData["INITVALUE"]+'</td>\
                                    <td>'+eachPinData["MINVALUE"] + ' - ' + eachPinData["MAXVALUE"]+'</td>\
                                    <td>'+eachPinData["CONFACTOR"] + ' - ' + eachPinData["CNGFACTOR"]+'</td>\
                                    </tr>'
                }
            }

            tableData += '</tbody></table>'


            setHTML("pinconfigtableview",tableData)

    }

    

}

// -------------------------------------------------------------


// ********* Update Database ******************

// Save Project COnfiguration
function saveProjectConfiguration() {
    println('Save Project Configuration ...')

    var validateInput = true

    var projectname = getHTMLValue("projectname");
    if(isEmpty(projectname)) {
        validateInput = false  
    }
    
    var projectdetails = getHTMLValue("projectdetails");
    if(isEmpty(projectdetails)) {
        validateInput = false  
    }
    
    var projecttype = getHTMLValue("projecttype");
    if(isEmpty(projecttype)) {
        validateInput = false  
    }

    var projectserver = getHTMLValue("projectserver");
    if(isEmpty(projectserver)) {
        validateInput = false  
    }
   
    // Check Validation 
    if(validateInput) {

        println(projectname)
        println(projectdetails)
        println(projecttype)
        println(projectserver)

        // Update Database
        let dbData = {}
        dbData['NAME'] = projectname
        dbData['DETAILS'] = projectdetails
        dbData['TYPE'] = projecttype
        dbData['SERVER'] = projectserver

        setNewDocument(getFirestorePath('BASEPATH'),project_name,dbData,'Project Configuration Updated !!')


    } else {
        println('Validation FAILED !!')

        toastMsg('MESSAGE ', 'PROJECT : Please provide all field details !!')
    }


}

// ADD New Device
async function addNewDevice() {

    println('Adding New Device')

    $('#addNewDeviceModal').modal('hide')

    var validateInput = true

    var devicename = getHTMLValue("devicename");
    if(isEmpty(devicename)) {
        validateInput = false  
    }

    var deviceaddress = getHTMLValue("deviceaddress");
    if(isEmpty(deviceaddress)) {
        validateInput = false  
    }

    if(validateInput) {

        println(devicename)
        println(deviceaddress)

         // Update Database
         let dbData = {}
         dbData['NAME'] = devicename
         dbData['ADDRESS'] = deviceaddress
         dbData['DETAILS'] = devicename + ' Information and Notes.'
         dbData['MODE'] = 'PRO'
         dbData['ENABLE'] = 'FALSE'
         dbData['DISPLAY'] = 'FALSE'
         dbData['REALTIMESTATUS'] = 'FALSE' 
         dbData['REALTIMEMAXLIMIT'] = '10'     
         dbData['DEVICEFCNSTATUS'] = 'FALSE'  
         dbData['DEVICEFCNMODE'] = 'MODE1'
         

         showPleaseWait()
         
         // Set Main Device Document
         await db.collection(getFirestorePath('DEVICE')).doc(devicename).set(dbData).then(function() {        
            }).then(function() {
                println(devicename + ' : Main Added')
            });

        // Set Sample Device Document
        await db.collection(getFirestorePath('DEVICE_SAMPLE')).doc(devicename).set({NAME : devicename}).then(function() {        
            }).then(function() {
                println(devicename + ' : Sample Added')
            });

         // Set Analysis Device Document
         await db.collection(getFirestorePath('DEVICE_ANALYSIS')).doc(devicename).set({NAME : devicename}).then(function() {        
            }).then(function() {
                println(devicename + ' : Analysis Added')
            });


             // Update Realtime Database
             await db_real.ref(project_name + '/DEVICE/' + devicename + '/INFO').set(dbData).then(function() {        
            }).then(function() {
                println(devicename + ' : Realtime INFO Added')
            });

            await db_real.ref(project_name + '/DEVICE/' + devicename + '/SYNCSTATUS').set({
                ACTIVE : false
            }).then(function() {
                println(devicename + ' : Realtime SYNC STATUS Added')
            });

            await db_real.ref(project_name + '/DEVICE/' + devicename + '/REALTIMESAMPLE/INFO').set({
                ACTIVESTATUS : false,
                COUNT : 0,
                UPDATEDON : getTodayDate()
            }).then(function() {
                println(devicename + ' : Realtime REALTIMESAMPLE Added')
            });

            await db_real.ref(project_name + '/DEVICE/' + devicename + '/CONTROL').set({
                INFO : 'DOUT'
            }).then(function() {
                println(devicename + ' : Realtime CONTROL')
            });


            // Collect PIN DATA and Update
            let pinConfigDetails = getAllPINConfig()

            // Set Main Device Document
            await db.collection(getFirestorePath('DEVICE') + "/" + devicename + "/DATA").doc("PINCONFIG").set(pinConfigDetails).then(function() {        
            }).then(function() {
                println(devicename + ' : Pin Config Updated.')
            });

            await db_real.ref(project_name + '/DEVICE/' + devicename + '/DATA/PINCONFIG').set(pinConfigDetails).then(function() {
                println(devicename + ' : Realtime Pin Config')
            });



             // Collect CALIB and Update
             let calibDetails = getCalibrationData()

             // Set Main Device Document
             await db.collection(getFirestorePath('DEVICE') + "/" + devicename + "/DATA").doc("CALIB").set(calibDetails).then(function() {        
             }).then(function() {
                 println(devicename + ' : calibDetails Updated.')
             });
 
             await db_real.ref(project_name + '/DEVICE/' + devicename + '/DATA/CALIB').set(calibDetails).then(function() {
                 println(devicename + ' : Realtime calibDetails')
             });


            hidePleaseWait()

            location.reload();


    }
    else {

        println('Validation FAILED !!')

        toastMsg('MESSAGE ', 'DEVICE : Please provide device details !!')

    }


}

// Update Each Device Details
async function updateEachDeviceDetails(key) {

    println('Update Device : ' + key)

    var validateInput = true

    var devicename = getHTMLValue(key + "_devicename");
    if(isEmpty(devicename)) {
        validateInput = false  
    }

    var deviceaddress = getHTMLValue(key + "_deviceaddress");
    if(isEmpty(deviceaddress)) {
        validateInput = false  
    }

    var devicedetails = getHTMLValue(key + "_devicedetails");
    var devicemode = getHTMLValue(key + "_devicemode");
    var deviceenable = getHTMLValue(key + "_deviceenable");

    var realtimeStatus = getHTMLValue(key + "_realtimeStatus");
    var realtimemaxlimit = getHTMLValue(key + "_realtimemaxlimit");
    var devicefcnStatus = getHTMLValue(key + "_devicefcnStatus");
    var devicefcnmode = getHTMLValue(key + "_devicefcnmode");
   

    if(validateInput) {

        println(devicename)
        println(deviceaddress)
        println(devicedetails)
        println(devicemode)
        println(deviceenable)

         // Update Database
         let dbData = {}
         dbData['NAME'] = devicename
         dbData['ADDRESS'] = deviceaddress
         dbData['DETAILS'] = devicedetails
         dbData['MODE'] = devicemode
         dbData['ENABLE'] = deviceenable   
         dbData['DISPLAY'] = 'FALSE'  
         
         dbData['REALTIMESTATUS'] = realtimeStatus  
         dbData['REALTIMEMAXLIMIT'] = realtimemaxlimit  
         dbData['DEVICEFCNSTATUS'] = devicefcnStatus  
         dbData['DEVICEFCNMODE'] = devicefcnmode
 
         
         showPleaseWait()
         
         // Set Main Device Document
         await db.collection(getFirestorePath('DEVICE')).doc(devicename).set(dbData).then(function() {        
            }).then(function() {
                println(devicename + ' : Main Added')
            });

        // Set Sample Device Document
        await db.collection(getFirestorePath('DEVICE_SAMPLE')).doc(devicename).set({NAME : devicename}).then(function() {        
            }).then(function() {
                println(devicename + ' : Sample Added')
            });

         // Set Analysis Device Document
         await db.collection(getFirestorePath('DEVICE_ANALYSIS')).doc(devicename).set({NAME : devicename}).then(function() {        
            }).then(function() {
                println(devicename + ' : Analysis Added')
            });


            // Update Realtime Database
            await db_real.ref(project_name + '/DEVICE/' + devicename + '/INFO').set(dbData).then(function() {        
            }).then(function() {
                println(devicename + ' : Realtime INFO Added')
            });
            

            /*
            await db_real.ref(project_name + '/DEVICE/' + devicename + '/ACTIVESTATUS').set({
                ACTIVE : 0
            }).then(function() {
                println(devicename + ' : Realtime ACTIVE STATUS Added')
            });

            await db_real.ref(project_name + '/DEVICE/' + devicename + '/REALTIMESAMPLE').set({
                DATA : [0, 0 , 0]
            }).then(function() {
                println(devicename + ' : Realtime REALTIMESAMPLE Added')
            });

            await db_real.ref(project_name + '/DEVICE/' + devicename + '/CONTROL').set({
                DATA : [0, 0 , 0]
            }).then(function() {
                println(devicename + ' : Realtime CONTROL')
            });
            */


            hidePleaseWait()

            location.reload();


    }
    else {

        println('Validation FAILED !!')

        toastMsg('MESSAGE ', 'DEVICE : Please provide Name and Address details !!')

    }

}


// Save Pin Config Details
async function saveDevicePinConfig(details) {

    println('Save Pin Config Details : ' + details)

    showPleaseWait()

     // Collect PIN DATA and Update
     currentDevicePinConfigData[details.split('#')[1]]['NAME'] = getHTMLValue(details.replace('#','_',) + "_pinconfigname");
     currentDevicePinConfigData[details.split('#')[1]]['DESC'] = getHTMLValue(details.replace('#','_',) + "_pinconfigdesc");
     currentDevicePinConfigData[details.split('#')[1]]['PIN'] = getHTMLValue(details.replace('#','_',) + "_pinconfigpin");
     currentDevicePinConfigData[details.split('#')[1]]['STATUS'] = getHTMLValue(details.replace('#','_',) + "_pinconfigstatus");
     currentDevicePinConfigData[details.split('#')[1]]['INITVALUE'] = getHTMLValue(details.replace('#','_',) + "_pinconfiginitvalue");
     currentDevicePinConfigData[details.split('#')[1]]['MINVALUE'] = getHTMLValue(details.replace('#','_',) + "_pinconfigminvalue");
     currentDevicePinConfigData[details.split('#')[1]]['MAXVALUE'] = getHTMLValue(details.replace('#','_',) + "_pinconfigmaxvalue");
     currentDevicePinConfigData[details.split('#')[1]]['CONFACTOR'] = getHTMLValue(details.replace('#','_',) + "_pinconfigconfactor");
     currentDevicePinConfigData[details.split('#')[1]]['CNGFACTOR'] = getHTMLValue(details.replace('#','_',) + "_pinconfigcngfactor");
     currentDevicePinConfigData[details.split('#')[1]]['EXTRA'] = getHTMLValue(details.replace('#','_',) + "_pinconfigextra");


     // Set Main Device Document
     await db.collection(getFirestorePath('DEVICE') + "/" + details.split('#')[0] + "/DATA").doc('PINCONFIG').set(currentDevicePinConfigData).then(function() {        
     }).then(function() {
         println(devicename + ' : Pin Config Updated.')
     });

     await db_real.ref(project_name + '/DEVICE/' + details.split('#')[0]  + '/DATA/PINCONFIG').set(currentDevicePinConfigData).then(function() {
         println(devicename + ' : Realtime Pin Config')
     });

     hidePleaseWait()


}


// Save Calib Data
async function saveDeviceCalibData(ID) {

    showPleaseWait()
   
    for(eachkey in currentDeviceCalibData) { 
        currentDeviceCalibData[eachkey]["VALUE"] = getHTMLValue(ID + '_' + eachkey + "_calibvalue");
    }

    println(currentDeviceCalibData)

     // Set Main Device Document
     await db.collection(getFirestorePath('DEVICE') + "/" + ID + "/DATA").doc('CALIB').set(currentDeviceCalibData).then(function() {        
    }).then(function() {
        println(devicename + ' : CALIB Updated.')
    });

    await db_real.ref(project_name + '/DEVICE/' + ID  + '/DATA/CALIB').set(currentDeviceCalibData).then(function() {
        println(devicename + ' : Realtime CALIB')
    });

    hidePleaseWait()

}





 
  