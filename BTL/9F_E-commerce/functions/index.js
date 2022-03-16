const functions = require("firebase-functions");
const express = require('express');
const engines = require('consolidate');
var hbs = require('handlebars');

const app = express();
app.engine('hbs',engines.handlebars);
app.set('views','./views');
app.set('view engine','hbs');

var firebase = require("firebase/app");
require("firebase/firebase-auth");
require("firebase/firebase-firestore");

const firebaseConfig = {
    apiKey: "AIzaSyAYOfXw-7HAFfrOjdwWK8eyKpSNT2Qy1Tg",
    authDomain: "farmnine-6d2d9.firebaseapp.com",
    projectId: "farmnine-6d2d9",
    storageBucket: "farmnine-6d2d9.appspot.com",
    messagingSenderId: "527234496843",
    appId: "1:527234496843:web:8651706cd64f05f19690ce",
    measurementId: "G-GB1RK8N62V"
};

var defaultProject=firebase.initializeApp(firebaseConfig);
var auth = defaultProject.auth();

const {registerUser, loginUser, logoutUser, sendPasswordResetEmail, loginWithGoogle, subscribeToAuthChanges} = require("./FirebaseAuthService")

app.get('/',async (request,response) =>{
    registerUser("abcdef@abcd.com", "123456", auth);
    response.send("test")
});

exports.app = functions.https.onRequest(app);

