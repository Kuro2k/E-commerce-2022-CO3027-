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

hbs.registerHelper("link_product_detail", function(product_name, product_type) {
    var product_name = hbs.escapeExpression(product_name);
    var product_type = hbs.escapeExpression(product_type);    
    return new hbs.SafeString("href='/product-detail?category=" + product_type + '&name=' + product_name + "'");
});

hbs.registerHelper("product_category", function(category) {
    var category = hbs.escapeExpression(category);
    if (category === "fruit"){
        return "Trái cây";
    } else if (category === "vegetable"){
        return "Rau củ quả";
    } else if (category === "meat") {
        return "Thịt";
    } else {
        return "Hải sản";
    } 
});

app.get('/',async (req, res) =>{
    const newest_productList = await handler_firestore.getNewProducts(db);
    const hottest_productList = await handler_firestore.getHotProducts(db);
    const meat_productList = await handler_firestore.getMeatProducts(db, 8);
    const meat1_productList = meat_productList.slice(0,4);
    const meat2_productList = meat_productList.slice(4,8);
    console.log(meat2_productList);
    res.render("index",{
        newest_productList:newest_productList,
        hottest_productList: hottest_productList,
        meat1_productList: meat1_productList,
        meat2_productList: meat2_productList
    });
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
    const ref = storage.ref(storage.getStorage(user_app), `${req.body.category}/${req.file.originalname}`);
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

app.get('/product-detail', async (req, res) => {
    const product_detail = await handler_firestore.getProduct(db, req.query);
    const related_products = await handler_firestore.getRelatedProducts(db, req.query.category, 4)
    res.render("product-detail", {product_detail: product_detail, related_products: related_products});
})

app.get('/all-products', async (req, res) => {
    res.render("all-products");
})

app.get('/fruitdata', async (req, res) => {
    const fruit = await handler_firestore.getRelatedProducts(db, "fruit");
    res.send(fruit);
})

app.get('/meatdata', async (req, res) => {
    const meat = await handler_firestore.getRelatedProducts(db, "meat");
    res.send(meat);
})

app.get('/seafooddata', async (req, res) => {
    const seaFood = await handler_firestore.getRelatedProducts(db, "seafood");
    res.send(seaFood);
})

app.get('/vegedata', async (req, res) => {
    const vege = await handler_firestore.getRelatedProducts(db, "vegetable");
    res.send(vege);
})

app.get('/sgloc', async (req, res) => {
    const products = await handler_firestore.getProductsByLocation(db, "TP. Hồ Chí Minh");
    res.send(products);
})

app.get('/hnloc', async (req, res) => {
    const products = await handler_firestore.getProductsByLocation(db, "Hà Nội");
    res.send(products);
})

app.get('/dnloc', async (req, res) => {
    const products = await handler_firestore.getProductsByLocation(db, "Đà Nẵng");
    res.send(products);
})

app.get('/ctloc', async (req, res) => {
    const products = await handler_firestore.getProductsByLocation(db, "Cần Thơ");
    res.send(products);
})

app.get('/u100price', async (req, res) => {
    const products = await handler_firestore.getProductsByPrice(db, 0, 100000);
    res.send(products);
})

app.get('/u300price', async (req, res) => {
    const products = await handler_firestore.getProductsByPrice(db, 100000, 300000);
    res.send(products);
})

app.get('/u500price', async (req, res) => {
    const products = await handler_firestore.getProductsByPrice(db, 300000, 500000);
    res.send(products);
})

app.get('/u1000price', async (req, res) => {
    const products = await handler_firestore.getProductsByPrice(db, 500000, 1000000);
    res.send(products);
})

app.get('/o1000price', async (req, res) => {
    const products = await handler_firestore.getO1000Products(db, 1000000, 100000000);
    res.send(products);
})

app.get('/byname', async (req, res) => {
    const name = "Mãng cầu";
    const products = await handler_firestore.getProductsByName(db, name);
    res.send(products);
})

app.get('/newproduct', async (req, res) => {
    const products = await handler_firestore.getNewProducts(db);
    res.send(products);
})

app.get('/hotproduct', async (req, res) => {
    const products = await handler_firestore.getHotProducts(db);
    res.send(products);
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
