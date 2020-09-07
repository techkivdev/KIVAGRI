// *******************************************************************************
// SCRIPT : common.js
//
//
// Author : Vivek Thakur
// Date : 27/7/2020
// *******************************************************************************


// Variables
var toastHeader = ''
var toastBody = ''

// ---------------------------------------------
var project_name = 'KIVAGRI'
// ---------------------------------------------

//---- PATH Details --------------
function getFirestorePath(key) {

  var firestorepath = {
    BASEPATH : 'DATABASE',
    PROJECT : 'DATABASE/' + project_name,
    DEVICE : 'DATABASE/'+project_name+'/DEVICE',
    DEVICESAMPLE : 'DATABASE/'+project_name+'/DEVICESAMPLE',
    DEVICEANALYSIS : 'DATABASE/'+project_name+'/DEVICEANALYSIS'
  }

  return firestorepath[key]

}

// Get Hardware Config Details
function getHardwareConfigDetails() {
 
  let CONTROL_STATUS = {
    0 : "ACTIVE STATUS",
    1 : "REAL TIME UPDATE STATUS",
    2 : "FUNCTION HANDLING STATUS",
    3 : "DEVICE FREEZ",
    4 : "DEVICE RISK",
    5 : "ONE TIME OPERATION",
    6 : "DEVICE RESTART",
    7 : "FIREBASE UPDATE",
    8 : "UPDATE CONTROL",
    9 : "UPDATE DOUTPIN",
    10 : "UPDATE STATUS",
    11 : "DEEP SLEEP STATUS"
  }

  return CONTROL_STATUS

}

// Display Log Values
function println(message) {
  console.log(message)
}

// ============== Document Update API ==============

// Get HTML ID
function getHTML(id) {
  //println(id)
  return document.getElementById(id)
}

// Set HTML Text Content
function setHTML(id,value){
 //println(id)
 $("#"+id).html(value)
}

// Set HTML Value
function setHTMLValue(id,data) {
  //println(id)
 document.getElementById(id).value = data
}

// Selected HTML
function selectedHTML(id) {
 //println(id)
document.getElementById(id).selected = true
}

// Checked HTML
function checkedHTML(id,data) {
 //println(id)
 document.getElementById(id).checked = data
}

// Show or Hide Block
function handleBlockView(id,status='hide') {
 if(status == 'hide') {
   document.getElementById(id).style.display = 'none';
 } else {
   document.getElementById(id).style.display = 'block';
 }
 
}

// Get HTML Value
function getHTMLValue(id) {
//println(id)
return document.getElementById(id).value.trim()
}

// Check isEmpty
function isEmpty(value) {
  if((value == '') || (value == null)) {
    return true
  } else {
    return false
  }

}

// Get HTML Checked
function getHTMLChecked(id) {
 //println(id)
 return document.getElementById(id).checked
}

// Open New Link
function openNewLink(details) {
    //println(details)
    window.open(details); 
}

// Display Toast Message
function toastMsg(hdr='Message ', msg) {
  //M.toast({ html: msg })
  toastHeader = hdr
  toastBody = toastBody + '<br>' + msg
  $("#myToast").toast('show');

}

// --------- Show Progress Bar -------------
function showPleaseWait() {
  $('#progressModal').modal('show')
}

function hidePleaseWait() {
  $('#progressModal').modal('hide')
}


// ----------- Document Handling -------------------
function addNewDocument(path,data,message,option='REL') { 

  showPleaseWait()

  // Create our initial doc
  db.collection(path).add(data).then(function() {

    hidePleaseWait()

    if(message != 'NA') {toastMsg(message);}

    if(option == 'REL') {location.reload();}

  }).then(function() {
    hidePleaseWait()
 });
}

function setNewDocument(path,docid,data,message,option='REL') {

  showPleaseWait()

// Create our initial doc
db.collection(path).doc(docid).set(data).then(function() {

  hidePleaseWait()

  if(message != 'NA') {toastMsg(message);}

  if(option == 'REL') {location.reload();}

}).then(function() {
   hidePleaseWait()
});


}

function updateDocument(path,data,message) {

  // Create our initial doc
  db.doc(path).update(data).then(function() {
    if(message != 'NA') {toastMsg(message);}
  });
  
  
}

function deleteDocument(path,message) {

  db.doc(path).delete().then(function() { 
    if(message != 'NA') {toastMsg(message);}
  }); 

}

// Get Current Time
function getCurrentTime() {

  var today = new Date();

  return today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

}


// Get Current Date
function getTodayDate() {

  var month = new Array();
  month[0] = "January";
  month[1] = "February";
  month[2] = "March";
  month[3] = "April";
  month[4] = "May";
  month[5] = "June";
  month[6] = "July";
  month[7] = "August";
  month[8] = "September";
  month[9] = "October";
  month[10] = "November";
  month[11] = "December";

  var today = new Date();
  var date = month[today.getMonth()] + ' ' + today.getDate() + ', ' + today.getFullYear();

  return date
}


function getTodayDateList() {

  var month = new Array();
  month[0] = "January";
  month[1] = "February";
  month[2] = "March";
  month[3] = "April";
  month[4] = "May";
  month[5] = "June";
  month[6] = "July";
  month[7] = "August";
  month[8] = "September";
  month[9] = "October";
  month[10] = "November";
  month[11] = "December";

  var today = new Date();
  var date = [month[today.getMonth()] , today.getDate() , today.getFullYear()];  

  return date
}


// Create Command
function getCommand(deviceip,devicename,mode,option,parameter) {

  // http://192.168.1.20/KIV&MODE=COLLECT:OPTION=OPTION:PARAMETER=PARAMETERS&

  let url = 'http://'+deviceip+'/KIV&PROJECT='+project_name+':DEVICE='+devicename+':MODE='+mode+':OPTION='+option+':PARAMETER='+parameter+'&'

  return url


}

// Create fetch request.
async function getURLData(myUrl) {

  const controller = new AbortController();
  const signal = controller.signal;

  // 10 second timeout:
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  let response = await fetch(myUrl , {signal});
  println(response)

  if(response.ok) {
      let data = await response.json()
      return data;
  } else {
      throw Error(response.statusText);
  }


 // await fetch('https://jsonplaceholder.typicode.com/todos/1')
//.then(response => response.json())
//.then(json => console.log(json))


}


// --------- Init Operation ----------------

function init_operation() {

  $('#progressModal').modal({
      backdrop: 'static',
      keyboard: false,
      show: false
    });

   
    $('#myToast').on('show.bs.toast', function () {
      // do something...
      setHTML('toastHeader',toastHeader)
      setHTML('toastbody',toastBody)

    })

    $('#myToast').on('hide.bs.toast', function () {
      // do something...
      toastHeader = ''
      toastBody = ''
      setHTML('toastHeader',toastHeader)
      setHTML('toastbody',toastBody)

    })

}