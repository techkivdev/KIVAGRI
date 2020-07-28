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

//---- PATH Details --------------
function getFirestorePath(key) {

  var firestorepath = {
    BASEPATH : 'DATABASE',
    PROJECT : 'DATABASE/PROJECT',
    DEVICE : 'DATABASE/PROJECT/DEVICE'
  }

  return firestorepath[key]

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