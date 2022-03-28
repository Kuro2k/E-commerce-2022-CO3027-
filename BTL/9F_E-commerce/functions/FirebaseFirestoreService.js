var firestore = require("firebase/firestore");
const { async } = require("@firebase/util");

const addProduct = async (db, document) => {
    const product = firestore.collection(db, 'Product');
    await firestore.addDoc(product, document);
};

const getUserCart = async(db, uid) => {
    const user_db = firestore.collection(db, "User");
    const constraint = firestore.where("uid", '==', uid);
    const query = firestore.query(user_db, constraint);
    const refUser = (await firestore.getDocs(query)).docs.map(doc => {return doc.ref});
    return firestore.collection(db, refUser[0].path+'/Cart');
}

const getUserPurchaseHistory = async (db, uid) => {
    const user_db = firestore.collection(db, "User");
    const constraint = firestore.where("uid", '==', uid);
    const query = firestore.query(user_db, constraint);
    const refUser = (await firestore.getDocs(query)).docs.map(doc => {return doc.ref});
    return firestore.collection(db, refUser[0].path+'/Purchase_history');
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
    getUserPurchaseHistory: getUserPurchaseHistory
};