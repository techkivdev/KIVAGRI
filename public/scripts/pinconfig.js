// *******************************************************************************
// SCRIPT : pinconfig.js
//
//
// Author : Vivek Thakur
// Date : 17/8/2020
// *******************************************************************************


// Get All PIN Configuration Set
function getAllPINConfig(activeconfig) {

  let allPINConfigSet = {}

  let analog_active_config = activeconfig.split(',')[0]
  let digiin_active_config = activeconfig.split(',')[1]
  let digiout_active_config = activeconfig.split(',')[2]
  let calib_active_config = activeconfig.split(',')[3]

  // Analog Pins
  var i;
  for (i = 0; i < 16; i++) {
    let AID = "AID" + i

    // Update Status
    let status = "FALSE"
    if( (analog_active_config > 0 ) && (i <= analog_active_config) ) {
      status = "TRUE"
    }

    allPINConfigSet[AID] = {
            ID : AID,
            NAME : AID + " Name",
            DESC : AID + " Short Desc",
            TYPE : "ANALOG",
            PIN : i.toString(),
            STATUS : status,
            INITVALUE : "0",
            MINVALUE : "0",
            MAXVALUE : "250",
            CONFACTOR : "1",
            CNGFACTOR : "0",
            EXTRA : "0,100,200,250#G,Y,R",
            ALERTMODE : "NONE", // Range Check, Control DOUT, Notification, Start Operation
            ALERTRANGE : "0,250",
            ALERTOPTION : "NA"
          }

  }

  // Digital Input
  for (i = 0; i < 16; i++) {
    let DINID = "DINID" + i

    // Update Status
    let status = "FALSE"
    if( (digiin_active_config > 0 ) && (i <= digiin_active_config) ) {
      status = "TRUE"
    }

    allPINConfigSet[DINID] = {
            ID : DINID,
            NAME : DINID + " Name",
            DESC : DINID + " Short Desc",
            TYPE : "DIGITALIN",
            PIN : i.toString(),
            STATUS : status,
            INITVALUE : "0",
            MINVALUE : "0",
            MAXVALUE : "1",
            CONFACTOR : "1",
            CNGFACTOR : "1",
            EXTRA : "NA",
            ALERTMODE : "NONE", // Range Check, Control DOUT, Notification, Start Operation
            ALERTRANGE : "0,250",
            ALERTOPTION : "NA"
          }

  }


    // Digital Output
    for (i = 0; i < 16; i++) {
      let DOUTID = "DOUTID" + i

      // Update Status
    let status = "FALSE"
    if( (digiout_active_config > 0 ) &&  ( i <= digiout_active_config) ) {
      status = "TRUE"
    }
  
      allPINConfigSet[DOUTID] = {
              ID : DOUTID,
              NAME : DOUTID + " Name",
              DESC : DOUTID + " Short Desc",
              TYPE : "DIGITALOUT",
              PIN : i.toString(),
              STATUS : status,
              INITVALUE : "0",
              MINVALUE : "0",
              MAXVALUE : "1",
              CONFACTOR : "1",
              CNGFACTOR : "1",
              EXTRA : "NA",
              ALERTMODE : "NONE", // Range Check, Control DOUT, Notification, Start Operation
              ALERTRANGE : "0,250",
              ALERTOPTION : "NA"
            }
  
    }


    return allPINConfigSet;


}

// Get Calibration Data
function getCalibrationData() {

  let allCalibData = {}

  var i;
  for (i = 0; i < 11; i++) {
    let CID = "CALIBID" + i

    allCalibData[CID] = {
            ID : CID,
            VALUE : "0"
          }

  }

  return allCalibData;

}