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
        return {user: user.displayName, len_cart: len_cart, uid: user.uid}
    }
    return {user: null, len_cart: 0, uid: null}
}
app.get('/',async (req, res) =>{
    const newest_productList = await handler_firestore.getNewProducts(db);
    const hottest_productList = await handler_firestore.getHotProducts(db);
    const meat_productList = await handler_firestore.getRelatedProducts(db,'meat', 8);
    const meat1_productList = meat_productList.slice(0,4);
    const meat2_productList = meat_productList.slice(4,8);
    const {user, len_cart, uid} = await isLogged();
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
//     const a = await handler_firestore.getUserOrder(db, "ogQllI52OPSGSP8Wt0cd4rUG1jo1");
//     res.send((await firestore.getDocs(a)).docs.map(doc => firestore.deleteDoc(doc.ref)));
// });

app.get('/login', async (req, res) => {
    var error;
    if (req.query.error)
        error="Bạn đã nhập sai tên đăng nhập hoặc mật khẩu";
    res.render("login", {error: error});
})

app.get('/signup', async (req, res) => {
    res.render("signup");
})

app.get('/about', async (req, res) => {
    const {user, len_cart, uid} = await isLogged();
    res.render("about", {user: user, len_cart:len_cart});
})
app.get('/upload', (req, res) => { 
    res.render("upload")
})

app.get('/add_product', async (req, res) => {
    const {user, len_cart, uid} = await isLogged();
    res.render('add_product', {user: user});
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
    const {user, len_cart, uid} = await isLogged();
    res.render("contact", {user: user, len_cart: len_cart});
})

app.post("/addToCart", async (req, res) => {
    const {user, len_cart, uid} = await isLogged();
    if( !user){
        res.status(303).send("Need to login");
    } else {
        try {
            const doc = JSON.parse(req.body);
            const num_cart = await handler_firestore.addToCart(db, doc, uid);
            res.status(200).send({result: num_cart});
        } catch (error) {
            console.log(error.message);
            res.status(100).send(error.message);
        } 
    }
})

app.get('/product-detail', async (req, res) => {
    const {user, len_cart, uid} = await isLogged();
    const product_detail = await handler_firestore.getProduct(db, req.query);
    const related_products = await handler_firestore.getRelatedProducts(db, req.query.category, 4)
    res.render("product-detail", {user: user, len_cart: len_cart, product_detail: product_detail, related_products: related_products});
})

app.get('/all-products', async (req, res) => {
    const {user, len_cart, uid} = await isLogged();
    var product_list = null;
    var page_name = null;
    if (!req.query || Object.keys(req.query).length === 0){
        product_list = await handler_firestore.getProducts(db);
    } else if (req.query.category && (!req.query.name)){
        const category = req.query.category;
        if (category === "fruit"){
            page_name = "Trái cây";
        } else if (category === "vegetable"){
            page_name = "Rau củ quả";
        } else if (category === "meat") {
            page_name = "Thịt các loại";
        } else {
            page_name = "Thủy hải sản";
        } 
        product_list = await handler_firestore.getRelatedProducts(db, category)
    } else if (req.query.search){
        page_name= "Các kết quả tìm kiếm phù hợp"
        product_list = await handler_firestore.searchProducts(db, req.query.search);
    }
    // console.log(product_list);
    res.render("all-products", {product_list: product_list, user:user, len_cart: len_cart, page_name: page_name});
})

app.get('/cart', async (req, res) => {
    const {user, len_cart, uid} = await isLogged();
    if( !user){
        res.redirect("/login");
    } 
    const user_cart = await handler_firestore.getUserCart(db, uid)
    const product_list = (await firestore.getDocs(user_cart)).docs.map(doc => doc.data())
    res.render("cart", {user: user, len_cart: len_cart, product_list: product_list});
})
app.post("/updateCart", async (req, res) => {
    var {user, len_cart, uid} = await isLogged();
    const docList = JSON.parse(req.body);
    if (docList[0] == {}){
        len_cart = 0;
    } else{
        len_cart = docList.length
    }
    await handler_firestore.updateCart(db, docList, uid);
    res.status(200).send({result: len_cart});
})
app.get('/order', async (req, res) => {
    const {user, len_cart, uid} = await isLogged();
    if( !user){
        res.redirect("/login");
    } 
    if (req.query.update_cart){
        const docList = JSON.parse(req.query.update_cart);
        await handler_firestore.updateCart(db, docList, uid);
        const user_db = firestore.collection(db, "User");
        const constraint = firestore.where("uid", "==", uid)
        const query = firestore.query(user_db, constraint);
        const receiver_info = (await firestore.getDocs(query)).docs[0].data()
        res.render("order", {user: user, len_cart: docList.length, product_list: docList, receiver_info: receiver_info});
    } else {   
        const user_cart = await handler_firestore.getUserCart(db, uid)
        const user_db = firestore.collection(db, "User");
        const constraint = firestore.where("uid", "==", uid)
        const query = firestore.query(user_db, constraint);
        const receiver_info = (await firestore.getDocs(query)).docs[0].data()
        const product_list = (await firestore.getDocs(user_cart)).docs.map(doc => doc.data())
        res.render("order", {user: user, len_cart: len_cart, product_list:product_list, receiver_info: receiver_info});
    }
})

app.post('/updateReceiverInfo', async (req, res) => {
    const {user, len_cart, uid} = await isLogged();
    if( !user){
        res.status(303).send("Need to login");
    } 
    const doc = JSON.parse(req.body);
    const user_db = firestore.collection(db, "User");
    const constraint = firestore.where("uid", "==", uid)
    const query = firestore.query(user_db, constraint);
    const receiver_ref = (await firestore.getDocs(query)).docs[0].ref
    await firestore.updateDoc(receiver_ref, doc);
    res.send({result: "Success"})
})

app.get('/thank-you', async (req, res) => {
    const {user, len_cart, uid} = await isLogged();
    if( !user){
        res.redirect("/login");
    } 
    if (req.query.order_detail){
        const order_detail = JSON.parse(req.query.order_detail);
        const order_id = await handler_firestore.addOrderDetail(db, order_detail, uid);
        await handler_firestore.updateCart(db, [], uid);
        res.render("thanks", {user: user,  len_cart: 0,order: order_id});
    } else{
        res.redirect("/")
    }
    // const user_order = await handler_firestore.getUserOrder(db, uid)
    // const constraint1 = firestore.orderBy("time", "desc");
    // const constraint2 = firestore.limit(1)
    // const query = firestore.query(user_order, constraint1,constraint2);
    // const order = (await firestore.getDocs(query)).docs.map(doc => doc.data())
    
})

app.get('*', (req, res) => {
    res.render("404")
})
// app.listen(3000, () => console.log('Server started on port 3000'));
exports.app = functions.https.onRequest(app);
