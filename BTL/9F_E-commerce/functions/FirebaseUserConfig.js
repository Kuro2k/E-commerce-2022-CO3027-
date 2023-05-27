var firebase = require("firebase/app");

const firebaseConfig = {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
    measurementId: ""
};

var user_app=firebase.initializeApp(firebaseConfig);

module.exports = {user_app};
