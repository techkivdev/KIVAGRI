// *******************************************************************************
// SCRIPT : configdevice.js
//
//
// Author : Vivek Thakur
// Date : 27/7/2020
// *******************************************************************************


println('[START] : configdevice script.')

init_operation()

readDatabaseAndUpdatePage()


// ************** READ DATABASE ***************

async function readDatabaseAndUpdatePage() {

    showPleaseWait()
    
    const doc = await db.collection(getFirestorePath('BASEPATH')).doc('PROJECT').get();
    if (!doc.exists) {
        println('No such document!');

    } else {

        let projectData = doc.data()

        setHTMLValue('projectname',projectData['NAME'])
        setHTMLValue('projectdetails',projectData['DETAILS'])
        setHTMLValue('projecttype',projectData['TYPE'])
      
    }

    let listgroupdetails = '<div class="col-4">\
                            <div class="list-group" id="list-tab" role="tablist">'

    
    let listtabdetails = ' <div class="col-8">\
                           <div class="tab-content" id="nav-tabContent">'

    const snapshot = await db.collection(getFirestorePath('DEVICE')).get();
    snapshot.forEach(doc => {

        //console.log(doc.id, '=>', doc.data());
         let eachDeviceData = doc.data()

         listgroupdetails += '<a class="list-group-item list-group-item-action " id="list-'+doc.id+'-list" data-toggle="list" href="#list-'+doc.id+'" role="tab" aria-controls="'+doc.id+'">'+doc.id+'</a>'
       
         listtabdetails += ' <div class="tab-pane fade " id="list-'+doc.id+'" role="tabpanel" aria-labelledby="list-'+doc.id+'-list">\
         <div class="card">\
           <div class="card-body">\
              <h4>'+doc.id+' Details</h4>\
              \
              <div class="form-group">\
               <label for="'+doc.id+'_devicename">Name</label>\
               <input type="text" class="form-control" id="'+doc.id+'_devicename" value="'+eachDeviceData['NAME']+'">\
             </div>\
\
             <div class="form-group">\
               <label for="'+doc.id+'_deviceaddress">Address</label>\
               <input type="text" class="form-control" id="'+doc.id+'_deviceaddress" value="'+eachDeviceData['ADDRESS']+'">\
             </div>\
             \
             <div class="form-group">\
             <label for="'+doc.id+'_devicedetails">Details</label>\
             <textarea class="form-control" id="'+doc.id+'_devicedetails" rows="3">'+eachDeviceData['DETAILS']+'</textarea>\
             </div>\
             \
             <div class="form-group">\
          <label for="'+doc.id+'_devicemode">Mode</label>\
          <select class="form-control" id="'+doc.id+'_devicemode">'

          let selectline = ''
          let checkwith = ''

          checkwith = 'TEST'
          if(eachDeviceData['MODE'] == checkwith) {selectline += '<option selected>'+checkwith+'</option>'} else { selectline += ' <option>'+checkwith+'</option>' }
          checkwith = 'DEV'
          if(eachDeviceData['MODE'] == checkwith) {selectline += '<option selected>'+checkwith+'</option>'} else { selectline += ' <option>'+checkwith+'</option>' }
          checkwith = 'PRO'
          if(eachDeviceData['MODE'] == checkwith) {selectline += '<option selected>'+checkwith+'</option>'} else { selectline += ' <option>'+checkwith+'</option>' }
           
          listtabdetails +=  selectline +'</select>\
        </div>\
        \
        <div class="form-group">\
        <label for="'+doc.id+'_deviceenable">Mode</label>\
        <select class="form-control" id="'+doc.id+'_deviceenable">'
          
        selectline = ''        
        if(eachDeviceData['ENABLE'] == 'TRUE') {selectline = '<option selected>TRUE</option><option >FALSE</option>'} else { selectline = '<option >TRUE</option><option selected>FALSE</option>' }
        
        listtabdetails +=  selectline +'</select>\
      </div>\
\
             <div class="form-group" style="margin-top: 20px;">\
             <button onclick="updateEachDeviceDetails(\'' + doc.id + '\')" id="'+doc.id+'_deviceupdatebtn" class="btn btn-success float-right">UPDATE</button>\
             </div>\
             </div>\
             </div>\
             </div>'

    });

    listgroupdetails += '</div></div>'
    listtabdetails += '</div></div>'

    let allDeviceDetails = ' <div class="row">' + listgroupdetails + listtabdetails + '</div>'

    setHTML('alldevicesection',allDeviceDetails)

    hidePleaseWait()

    handleBlockView('main_section','show')


}



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
   
    // Check Validation 
    if(validateInput) {

        println(projectname)
        println(projectdetails)
        println(projecttype)

        // Update Database
        let dbData = {}
        dbData['NAME'] = projectname
        dbData['DETAILS'] = projectdetails
        dbData['TYPE'] = projecttype

        setNewDocument(getFirestorePath('BASEPATH'),'PROJECT',dbData,'Project Configuration Updated !!')


    } else {
        println('Validation FAILED !!')

        toastMsg('MESSAGE ', 'PROJECT : Please provide all field details !!')
    }


}

// ADD New Device
function addNewDevice() {

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
         dbData['ENABLE'] = 'TRUE'
        
 
         setNewDocument(getFirestorePath('DEVICE'),devicename ,dbData,'New Device Added !!')


    }
    else {

        println('Validation FAILED !!')

        toastMsg('MESSAGE ', 'DEVICE : Please provide device details !!')

    }


}

// Update Each Device Details
function updateEachDeviceDetails(key) {

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
 
         setNewDocument(getFirestorePath('DEVICE'),devicename ,dbData,'New Device Added !!')


    }
    else {

        println('Validation FAILED !!')

        toastMsg('MESSAGE ', 'DEVICE : Please provide Name and Address details !!')

    }

}






 
  