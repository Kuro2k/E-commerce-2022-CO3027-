const path = require("path");
const admin = require("./FirebaseAdminConfig");
const {user_app} = require("./FirebaseUserConfig");
const functions = admin.functions;
const express = require('express');
const engines = require('consolidate');
var hbs = require("handlebars");
const fs = require("fs");
const { async } = require("@firebase/util");
const multer = require("multer-firebase");
const { v4: uuidv4 } = require('uuid');
// SET STORAGE
const sto = multer.diskStorage({
    startProcessing (req, busboy) {
        if (req.rawBody) { // indicates the request was pre-processed
            busboy.end(req.rawBody)
        } else {
            req.pipe(busboy)
        }
    },
})
var upload = multer({ storage: sto });
const cors = require("cors");
const app = express();
app.use(cors({origin: true}))
app.use(express.json({extended: false}));
app.use(express.urlencoded({extended: false}));
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
const db_img = admin.storageBucket;

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
app.get('/upload', (req, res) => { 
    res.render("upload")
})

app.get('/add_product', (req, res) => {
    res.render('add_product');
})

app.post('/api/add_product',upload.single('photo'), async (req, res) => {
    if (!req.file) {
        res.status(400).send("Error: No files found")
    }
    const img_uploaded = await db_img.upload(req.file.path, {
        public: true,
        destination: `${req.body.category}/${req.file.originalname}`,
        metadata: {
            firebaseStorageDownloadTokens: uuidv4(),
        }
    });
    const ref = storage.ref(storage.getStorage(user_app), 'fruit/22-3-2022-express js.jpg');
    const img_url = await storage.getDownloadURL(ref);
    req.body.img_url = img_url;
    req.body.price = parseInt(req.body.price);
    req.body.stock = parseInt(req.body.stock);
    req.body.sold_amount = parseInt(req.body.sold_amount);
    req.body.date_upload = new Date().toISOString().split('T')[0]
    await handler_firestore.addProduct(db, req.body);
    res.send("success")
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
// app.listen(3000, () => console.log('Server started on port 3000'));
exports.app = functions.https.onRequest(app);

