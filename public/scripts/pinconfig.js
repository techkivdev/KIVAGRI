// *******************************************************************************
// SCRIPT : pinconfig.js
//
//
// Author : Vivek Thakur
// Date : 17/8/2020
// *******************************************************************************


// Get All PIN Configuration Set
function getAllPINConfig() {

  let allPINConfigSet = {}

  // Analog Pins
  var i;
  for (i = 0; i < 16; i++) {
    let AID = "AID" + i

    allPINConfigSet[AID] = {
            ID : AID,
            NAME : AID + " Name",
            DESC : AID + " Short Desc",
            TYPE : "ANALOG",
            PIN : i.toString(),
            STATUS : "FALSE",
            INITVALUE : "0",
            MINVALUE : "0",
            MAXVALUE : "250",
            CONFACTOR : "1",
            CNGFACTOR : "10",
            EXTRA : "0,100,200,250#G,Y,R"
          }

  }

  // Digital Input
  for (i = 0; i < 16; i++) {
    let DINID = "DINID" + i

    allPINConfigSet[DINID] = {
            ID : DINID,
            NAME : DINID + " Name",
            DESC : DINID + " Short Desc",
            TYPE : "DIGITALIN",
            PIN : i.toString(),
            STATUS : "FALSE",
            INITVALUE : "0",
            MINVALUE : "0",
            MAXVALUE : "1",
            CONFACTOR : "1",
            CNGFACTOR : "1",
            EXTRA : "NA"
          }

  }


    // Digital Output
    for (i = 0; i < 16; i++) {
      let DOUTID = "DOUTID" + i
  
      allPINConfigSet[DOUTID] = {
              ID : DOUTID,
              NAME : DOUTID + " Name",
              DESC : DOUTID + " Short Desc",
              TYPE : "DIGITALOUT",
              PIN : i.toString(),
              STATUS : "FALSE",
              INITVALUE : "0",
              MINVALUE : "0",
              MAXVALUE : "1",
              CONFACTOR : "1",
              CNGFACTOR : "1",
              EXTRA : "NA"
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