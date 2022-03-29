var firestore = require("firebase/firestore");
const { async } = require("@firebase/util");
const handler_auth = require("./FirebaseAuthService")

const addProduct = async (db, document) => {
    const product = firestore.collection(db, 'Product');
    await firestore.addDoc(product, document);
};

const addToCart = async (db, doc, uid) => {
    console.log(uid)
    const user_cart = await getUserCart(db, uid);
    const constraint = firestore.where("name", "==", doc.name);
    const constraint1 = firestore.where("category", "==", doc.category);
    const query = firestore.query(user_cart, constraint, constraint1);
    const products = (await firestore.getDocs(query)).docs;
    if (products.length == 0){
        await firestore.addDoc(user_cart, doc);
    } else {
        const old_doc = products[0].data();
        const new_value = doc.amount + old_doc.amount;
        await firestore.updateDoc(products[0].ref, {amount: new_value});
    }
}

const updateCart = async (db, docList, uid) => {
    for (let i = 0; i < docList.length; i++){
        if (docList[i].category === "Trái cây"){
            docList[i].category = "fruit";
        } else if (docList[i].category === "Rau củ quả"){
            docList[i].category = "vegetable";
        } else if (docList[i].category === "Thịt") {
            docList[i].category = "meat";
        } else {
            docList[i].category = "seafood";
        } 
        const product_db = firestore.collection(db, "Product")
        const constraint1 = firestore.where("name","==", docList[i].name);
        const constraint2 = firestore.where("category", "==", docList[i].category);
        const query = firestore.query(product_db, constraint1, constraint2);
        const product = (await firestore.getDocs(query)).docs[0].data();
        docList[i].img_url=product.img_url;
    }
    const user_cart = await getUserCart(db, uid);
    (await firestore.getDocs(user_cart)).docs.map(async (doc) => {await firestore.deleteDoc(doc.ref)});
    docList.forEach(async (doc) => {await firestore.addDoc(user_cart, doc)})
}

const addOrderDetail = async (db, doc, uid) => {
    const user_order = await getUserOrder(db, uid);
    const orderPath = await firestore.addDoc(user_order, doc);
    const order_id = orderPath.id;
    const time = new Date().getTime();
    await firestore.updateDoc(orderPath, {order_id: order_id, time: time});
    return order_id;
}

const getUserCart = async(db, uid) => {
    const user_db = firestore.collection(db, "User");
    const constraint = firestore.where("uid", '==', uid);
    const query = firestore.query(user_db, constraint);
    const refUser = (await firestore.getDocs(query)).docs.map(doc => {return doc.ref});
    return firestore.collection(db, refUser[0].path+'/Cart');
}

const getUserOrder = async (db, uid) => {
    const user_db = firestore.collection(db, "User");
    const constraint = firestore.where("uid", '==', uid);
    const query = firestore.query(user_db, constraint);
    const refUser = (await firestore.getDocs(query)).docs.map(doc => {return doc.ref});
    return firestore.collection(db, refUser[0].path+'/Order');
}

async function getProducts(db){
    const product = firestore.collection(db, 'Product');
    const productSnapshot = await firestore.getDocs(product);
    const productList = productSnapshot.docs.map(doc => doc.data());
    return productList;
}

async function getProduct(db, product_query){
    const product = firestore.collection(db, 'Product');
    const constraint1 = firestore.where("category", "==", product_query.category);
    const constraint2 = firestore.where("name", "==", product_query.name);
    const product_detail = firestore.query(product, constraint1, constraint2);
    return (await firestore.getDocs(product_detail)).docs[0].data();
}

async function getRelatedProducts(db, category, limit=null){
    const product = firestore.collection(db, 'Product');
    const constraint = firestore.where("category", "==", category);
    let result;
    if (limit) {
        const constraint1 = firestore.limit(limit);
        result = firestore.query(product, constraint, constraint1);
    } else {
        result = firestore.query(product, constraint);
    }
    return (await firestore.getDocs(result)).docs.map(doc => doc.data());
}

async function getProductsByLocation(db, location, limit=null){
    const product = firestore.collection(db, 'Product');
    const constraint = firestore.where("location", "==", location);
    let result;
    if (limit) {
        const constraint1 = firestore.limit(limit);
        result = firestore.query(product, constraint, constraint1);
    } else {
        result = firestore.query(product, constraint);
    }
    return (await firestore.getDocs(result)).docs.map(doc => doc.data());
}

async function getProductsByPrice(db, left, right, limit=null){
    const product = firestore.collection(db, 'Product');
    const constraint = firestore.where("price", ">=", left);
    const constraint1 = firestore.where("price", "<=", right);
    let result;
    if (limit) {
        const constraint2 = firestore.limit(limit);
        result = firestore.query(product, constraint, constraint1, constraint2);
    } else {
        result = firestore.query(product, constraint, constraint1);
    }
    return (await firestore.getDocs(result)).docs.map(doc => doc.data());
}

async function getProductsByName(db, name){
    const product = firestore.collection(db, 'Product');
    const constraint = firestore.where("name", "==", name);
    const query = firestore.query(product, constraint);
    return (await firestore.getDocs(query)).docs.map(doc => doc.data());
}

async function getNewProducts(db){
    const product = firestore.collection(db, 'Product');
    const constraint1 = firestore.orderBy('date_upload', 'desc');
    const constraint2 = firestore.limit(4);
    const query = firestore.query(product, constraint1, constraint2);
    return (await firestore.getDocs(query)).docs.map(doc => doc.data());
}

async function getHotProducts(db){
    const product = firestore.collection(db, 'Product');
    const constraint1 = firestore.orderBy('sold_amount', 'desc');
    const constraint2 = firestore.limit(4);
    const query = firestore.query(product, constraint1, constraint2);
    return (await firestore.getDocs(query)).docs.map(doc => doc.data());
}

// Search by prefix, case-sensitive
async function searchProducts(db, name){
    const product = firestore.collection(db, 'Product');
    const constraint = firestore.where('name', '>=', name);
    const constraint1 = firestore.where('name', '<=', name+ '\uf8ff');
    const query = firestore.query(product, constraint, constraint1)
    return (await firestore.getDocs(query)).docs.map(doc => doc.data());
}

module.exports = {
    addOrderDetail: addOrderDetail,
    updateCart: updateCart,
    addToCart: addToCart,
    addProduct: addProduct,
    getProducts: getProducts,
    getProduct: getProduct,
    getRelatedProducts: getRelatedProducts,
    getProductsByLocation: getProductsByLocation,
    getProductsByPrice: getProductsByPrice,
    getProductsByName: getProductsByName,
    getNewProducts: getNewProducts,
    getHotProducts: getHotProducts,
    searchProducts: searchProducts,
    getUserCart: getUserCart,
    getUserOrder: getUserOrder
};