const path = require("path")
const functions = require("firebase-functions");
const express = require('express');
const engines = require('consolidate');
var hbs = require("handlebars");
var fs = require('fs');

const app = express();
const publicDirectoryPath = path.join(__dirname, "../public")
app.use(express.static(publicDirectoryPath))

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
var auth = require("firebase/auth");
var firestore = require("firebase/firestore");
const handler_firestore = require('./FirebaseFirestoreService');

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
var db = firestore.getFirestore(defaultProject);
const {registerUser, loginUser, logoutUser, sendPasswordResetEmail, loginWithGoogle, subscribeToAuthChanges} = require("./FirebaseAuthService");
const { async } = require("@firebase/util");

hbs.registerHelper("link_product_detail", function(product_id, product_type) {
    var product_id = hbs.escapeExpression(product_id);
    var product_type = hbs.escapeExpression(product_type);    
    return new hbs.SafeString("href='/product-detail/" + product_type + '/' + product_id + "'");
});

app.get('/',async (req, res) =>{
    const productList =await handler_firestore.getProducts(db);
    console.log(productList);
    res.render("index",{productlist:productList});
});

app.get('/about', async (req, res) => {
    res.render("about");
})

app.get('/add_product', async (req, res) =>{
    res.render("add_product");
})

app.get('/contact', async (req, res) => {
    res.render("contact");
})

app.get('/product-detail/', async (req, res) => {
    res.render("product-detail");
})

app.get('/all-products', async (req, res) => {
    res.render("all-products");
})

app.get('/cart', async (req, res) => {
    res.render("cart");
})

app.get('/shipping', async (req, res) => {
    res.render("shipping");
})

app.get('/payment', async (req, res) => {
    res.render("payment");
})

app.get('/thank-you', async (req, res) => {
    res.render("thanks");
})

app.get('*', (req, res) => {
    res.render("404")
})
exports.app = functions.https.onRequest(app);

