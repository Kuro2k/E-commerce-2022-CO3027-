var firestore = require("firebase/firestore");
const { async } = require("@firebase/util");

const addProduct = async (db, document) => {
    const product = firestore.collection(db, 'Product');
    await firestore.addDoc(product, document);
};

async function getProducts(db, product_detail = {}){
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
    return await (await firestore.getDocs(product_detail)).docs[0].data();
}

async function getFruitProducts(db){
    const product = firestore.collection(db, 'Product');
    const constraint = firestore.where("category", "==", "fruit");
    const fruit = firestore.query(product, constraint);
    return (await firestore.getDocs(fruit)).docs.map(doc => doc.data());
}

async function getMeatProducts(db){
    const product = firestore.collection(db, 'Product');
    const constraint = firestore.where("category", "==", "meat");
    const fruit = firestore.query(product, constraint);
    return (await firestore.getDocs(fruit)).docs.map(doc => doc.data());
}

async function getRelatedProducts(db, category, limit=null){
    const product = firestore.collection(db, 'Product');
    const constraint = firestore.where("category", "==", category);
    var meat;
    if (limit) {
        const constraint1 = firestore.limit(limit);
        meat = firestore.query(product, constraint, constraint1);
    } else {
        meat = firestore.query(product, constraint);
    }
    return (await firestore.getDocs(meat)).docs.map(doc => doc.data());
}

async function getSeaFoodProducts(db){
    const product = firestore.collection(db, 'Product');
    const constraint = firestore.where("category", "==", "seafood");
    const seaFood = firestore.query(product, constraint);
    return (await firestore.getDocs(seaFood)).docs.map(doc => doc.data());
}

async function getVegeProducts(db){
    const product = firestore.collection(db, 'Product');
    const constraint = firestore.where("category", "==", "vegetable");
    const vege = firestore.query(product, constraint);
    return (await firestore.getDocs(vege)).docs.map(doc => doc.data());
}

async function getSGProducts(db){
    const product = firestore.collection(db, 'Product');
    const constraint = firestore.where("location", "==", "TP. Hồ Chí Minh");
    const query = firestore.query(product, constraint);
    return (await firestore.getDocs(query)).docs.map(doc => doc.data());
}

async function getHNProducts(db){
    const product = firestore.collection(db, 'Product');
    const constraint = firestore.where("location", "==", "Hà Nội");
    const query = firestore.query(product, constraint);
    return (await firestore.getDocs(query)).docs.map(doc => doc.data());
}

async function getDNProducts(db){
    const product = firestore.collection(db, 'Product');
    const constraint = firestore.where("location", "==", "Đà Nẵng");
    const query = firestore.query(product, constraint);
    return (await firestore.getDocs(query)).docs.map(doc => doc.data());
}

async function getCTProducts(db){
    const product = firestore.collection(db, 'Product');
    const constraint = firestore.where("location", "==", "Cần Thơ");
    const query = firestore.query(product, constraint);
    return (await firestore.getDocs(query)).docs.map(doc => doc.data());
}

async function getU100Products(db){
    const product = firestore.collection(db, 'Product');
    const constraint = firestore.where("price", "<=", 100000);
    const query = firestore.query(product, constraint);
    return (await firestore.getDocs(query)).docs.map(doc => doc.data());
}

async function getU300Products(db){
    const product = firestore.collection(db, 'Product');
    const constraint1 = firestore.where("price", ">=", 100000);
    const constraint2 = firestore.where("price", "<=", 300000);
    const query = firestore.query(product, constraint1, constraint2);
    return (await firestore.getDocs(query)).docs.map(doc => doc.data());
}

async function getU500Products(db){
    const product = firestore.collection(db, 'Product');
    const constraint1 = firestore.where("price", ">=", 300000);
    const constraint2 = firestore.where("price", "<=", 500000);
    const query = firestore.query(product, constraint1, constraint2);
    return (await firestore.getDocs(query)).docs.map(doc => doc.data());
}

async function getU1000Products(db){
    const product = firestore.collection(db, 'Product');
    const constraint1 = firestore.where("price", ">=", 500000);
    const constraint2 = firestore.where("price", "<=", 1000000);
    const query = firestore.query(product, constraint1, constraint2);
    return (await firestore.getDocs(query)).docs.map(doc => doc.data());
}

async function getO1000Products(db){
    const product = firestore.collection(db, 'Product');
    const constraint = firestore.where("price", ">=", 1000000);
    const query = firestore.query(product, constraint);
    return (await firestore.getDocs(query)).docs.map(doc => doc.data());
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

module.exports = {
    getRelatedProducts: getRelatedProducts,
    addProduct: addProduct,
    getProducts: getProducts,
    getProduct: getProduct,
    getFruitProducts: getFruitProducts,
    getMeatProducts: getMeatProducts,
    getSeaFoodProducts: getSeaFoodProducts,
    getVegeProducts: getVegeProducts,
    getSGProducts: getSGProducts,
    getHNProducts: getHNProducts,
    getDNProducts: getDNProducts,
    getCTProducts: getCTProducts,
    getU100Products: getU100Products,
    getU300Products: getU300Products,
    getU500Products: getU500Products,
    getU1000Products: getU1000Products,
    getO1000Products: getO1000Products,
    getProductsByName: getProductsByName,
    getNewProducts: getNewProducts,
    getHotProducts: getHotProducts,
};