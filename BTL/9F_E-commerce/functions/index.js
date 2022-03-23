const path = require("path");
const admin = require("./FirebaseAdminConfig");
const {user_app} = require("./FirebaseUserConfig");
const functions = admin.functions;
const express = require('express');
const engines = require('consolidate');
var hbs = require("handlebars");
const fs = require("fs");
const { async } = require("@firebase/util");

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
const publicDirectoryPath = path.join(__dirname, "../public")
app.use(express.static(publicDirectoryPath))
// handle form in post method

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


var auth = require("firebase/auth");
var firestore = require("firebase/firestore");
var storage = require('firebase/storage');
const handler_firestore = require('./FirebaseFirestoreService');


var db = firestore.getFirestore(user_app);


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


app.get('/test', (req, res) => {
    res.render('test_upload');
})
// const db_img = storage.getStorage(defaultProject, 'https://console.firebase.google.com/project/farmnine-6d2d9/storage/farmnine-6d2d9.appspot.com/files')
// const ref = storage.ref(db_img, 'fruit')
app.put('/api/test', async (req, res) => {
    console.log(req.body)
    await storage.uploadBytes(ref, req.body, 'base8')
    res.send({result: 'success'});
})

app.get('/fetch_product', (req, res) => {
    res.render('fetch_product');
})
app.post('/api/add_product', async (req, res) => {
    console.log(req.body);
    await handler_firestore.addProduct(db, req.body);
    res.send({result: 'success'})
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

