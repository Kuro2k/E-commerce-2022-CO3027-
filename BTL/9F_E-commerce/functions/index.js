const path = require("path")
const functions = require("firebase-functions");
const express = require('express');
const engines = require('consolidate');
var hbs = require("handlebars");
var fs = require('fs');

const app = express();
const partialsPath = path.join(__dirname, "/partials");
app.engine('hbs',engines.handlebars);
app.set('views','./views');
app.set('view engine','hbs');


var partialsDir = __dirname + '/partials';
var filenames = fs.readdirSync(partialsDir);
filenames.forEach(function (filename) {
    var matches = /^([^.]+).hbs$/.exec(filename);
    if (!matches) {
        return;
    }
    var name = matches[1];
    var template = fs.readFileSync(partialsDir + '/' + filename, 'utf8');
    hbs.registerPartial(name, template);
});

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

const {registerUser, loginUser, logoutUser, sendPasswordResetEmail, loginWithGoogle, subscribeToAuthChanges} = require("./FirebaseAuthService");
const { async } = require("@firebase/util");

app.get('/',async (req, res) =>{
    res.render("index");
});

app.get('/about', async (req, res) => {
    res.render("about");
})

exports.app = functions.https.onRequest(app);

