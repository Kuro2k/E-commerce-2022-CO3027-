var firestore = require("firebase/firestore");
const { async } = require("@firebase/util");

const addProduct = async (db, document) => {
    const product = firestore.collection(db, 'Product');
    await firestore.addDoc(product, document);
};

async function getProducts(db){
    const product = firestore.collection(db, 'Product');
    const productSnapshot = await firestore.getDocs(product);
    const productList = productSnapshot.docs.map(doc => doc.data());
    return productList;
}

async function getFruitProducts(db){
    const product = firestore.collection(db, 'Product');
    const constraint = firestore.where("category", "==", "fruit");
    return await (await firestore.getDocs(product, constraint)).docs.map(doc => doc.data());
}
module.exports = {
    addProduct: addProduct,
    getProducts: getProducts,
    getFruitProducts: getFruitProducts
};