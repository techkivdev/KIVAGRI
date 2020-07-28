// *********************************************************************	
// Initialize Firebase
// *********************************************************************	

const config = {
  apiKey: "AIzaSyAvdjkhystCw33ttYVtqStj7BhR1DDoaVY",
  authDomain: "kivagri.firebaseapp.com",
  databaseURL: "https://kivagri.firebaseio.com",
  projectId: "kivagri",
  storageBucket: "kivagri.appspot.com",
  messagingSenderId: "836162554609",
  appId: "1:836162554609:web:bd8b0bf3c3cf47f807b750",
  measurementId: "G-DHF5C8XEME"
};

firebase.initializeApp(config);
let firestore = firebase.firestore();
let db = firebase.firestore();
let storage  = firebase.storage();
let auth = firebase.auth();
//var functions = firebase.functions();
console.log("Cloud Firestores Loaded");


// *********************************************************************	
// Enable offline capabilities
// *********************************************************************	
firebase.firestore().enablePersistence()
    .then(function() {
        // Initialize Cloud Firestore through firebase
        var db = firebase.firestore();
    })
    .catch(function(err) {
        if (err.code == 'failed-precondition') {
            // Multiple tabs open, persistence can only be enabled in one tab at a a time.
            console.log("Multiple tabs open, persistence can only be enabled in one tab at a a time.");

        } else if (err.code == 'unimplemented') {
            // The current browser does not support all of the
            // features required to enable persistence
            // ...
            console.log("The current browser does not support all of the eatures required to enable persistence");
        }
    });



