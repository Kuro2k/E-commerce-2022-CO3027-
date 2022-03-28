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
const handler_auth = require('./FirebaseAuthService');
const auth_router = require("./Routes/auth");
const { stringify } = require("querystring");
app.use('/auth', auth_router);

var db = firestore.getFirestore(user_app);
const db_img = admin.storageBucket;

hbs.registerHelper('grouped_each', function(every, context, options) {
    var out = "", subcontext = [], i;
    if (context && context.length > 0) {
        for (i = 0; i < context.length; i++) {
            if (i > 0 && i % every === 0) {
                out += options.fn(subcontext);
                subcontext = [];
            }
            subcontext.push(context[i]);
        }
        out += options.fn(subcontext);
    }
    return out;
});

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

const isLogged = async () => {
    var user = handler_auth.subscribeToAuthChanges();
    if (user) {
        const user_cart = await handler_firestore.getUserCart(db, user.uid);
        
        const len_cart = (await firestore.getDocs(user_cart)).docs.length;
        user = user.displayName;
        return {user: user, len_cart: len_cart}
    }
    return {user: null, len_cart: 0}
}
app.get('/',async (req, res) =>{
    const newest_productList = await handler_firestore.getNewProducts(db);
    const hottest_productList = await handler_firestore.getHotProducts(db);
    const meat_productList = await handler_firestore.getRelatedProducts(db,'meat', 8);
    const meat1_productList = meat_productList.slice(0,4);
    const meat2_productList = meat_productList.slice(4,8);
    const {user, len_cart} = await isLogged();
    res.render("index",{
        user: user,
        len_cart: len_cart,
        newest_productList:newest_productList,
        hottest_productList: hottest_productList,
        meat1_productList: meat1_productList,
        meat2_productList: meat2_productList
    });
});
// app.get('/test', async (req, res) => {
//     const a = firestore.collection(db, 'Product');
//     const constraint1 = firestore.where("category", "==", "seafood");
//     const constraint2 = firestore.where("date_upload", "==", "2022-03-25");
//     const product_detail = await firestore.query(a, constraint1, constraint2);
//     res.send((await firestore.getDocs(product_detail)).docs.map(doc => firestore.deleteDoc(doc.ref)));
// });
app.get('/test', async (req, res) => {
    // var user = handler_auth.subscribeToAuthChanges();
    const cart_user = await handler_firestore.getUserCart(db, '1');
    // const doc1 = firestore.doc(cart_user, 'cart1');
    // firestore.setDoc(doc1, {value2: "value2"});
    // firestore.updateDoc();
    res.send((await firestore.getDocs(cart_user)).docs)
})

app.get('/login', async (req, res) => {
    res.render("login");
})

app.get('/signup', async (req, res) => {
    res.render("signup");
})

app.get('/about', async (req, res) => {
    const {user, len_cart} = await isLogged();
    res.render("about", {user: user, len_cart:len_cart});
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
    const {user, len_cart} = await isLogged();
    res.render("contact", {user: user, len_cart: len_cart});
})

app.post("/addToCart", async (req, res) => {
    const doc = JSON.parse(req.body);
    const results = await handler_firestore.addToCart(db, doc);
    res.send({result: "Success"});
})

app.post("/updateCart", async (req, res) => {
    const docList = JSON.parse(req.body);
    await handler_firestore.updateCart(db, docList);
    // const user_cart = await handler_firestore.getUserCart(db, handler_auth.subscribeToAuthChanges().uid);
    // await firestore.addDoc(user_cart, doc);
    res.send({result: "Success"})
})
app.get('/product-detail', async (req, res) => {
    const {user, len_cart} = await isLogged();
    const product_detail = await handler_firestore.getProduct(db, req.query);
    const related_products = await handler_firestore.getRelatedProducts(db, req.query.category, 4)
    res.render("product-detail", {user: user, len_cart: len_cart, product_detail: product_detail, related_products: related_products});
})

app.get('/all-products', async (req, res) => {
    const {user, len_cart} = await isLogged();
    var product_list = null;
    if (!req.query || Object.keys(req.query).length === 0){
        product_list = await handler_firestore.getProducts(db);
    } else if (req.query.category && (!req.query.name)){
        product_list = await handler_firestore.getRelatedProducts(db, req.query.category)
    } else if (req.query.search){
        product_list = await handler_firestore.searchProducts(db, req.query.search);
    }
    // console.log(product_list);
    res.render("all-products", {product_list: product_list, user:user, len_cart: len_cart});
})

app.get('/cart', async (req, res) => {
    const {user, len_cart} = await isLogged();
    const user_cart = await handler_firestore.getUserCart(db, "ogQllI52OPSGSP8Wt0cd4rUG1jo1")
    const product_list = (await firestore.getDocs(user_cart)).docs.map(doc => doc.data())
    res.render("cart", {user: user, len_cart: len_cart, product_list: product_list});
})

app.get('/shipping', async (req, res) => {
    const {user, len_cart} = await isLogged();
    const user_cart = await handler_firestore.getUserCart(db, "ogQllI52OPSGSP8Wt0cd4rUG1jo1")
    const product_list = (await firestore.getDocs(user_cart)).docs.map(doc => doc.data())
    res.render("shipping", {user: user, len_cart: len_cart, product_list:product_list});
})

app.get('/payment', async (req, res) => {
    const {user, len_cart} = await isLogged();
    res.render("payment", {user: user, len_cart});
})

app.get('/thank-you', async (req, res) => {
    var user = handler_auth.subscribeToAuthChanges();
    if (user) {
        user = user.displayName;
    }
    res.render("thanks", {user: user});
})

app.get('*', (req, res) => {
    res.render("404")
})
// app.listen(3000, () => console.log('Server started on port 3000'));
exports.app = functions.https.onRequest(app);
