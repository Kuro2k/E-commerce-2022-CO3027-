var firestore = require("firebase/firestore");
const { async } = require("@firebase/util");

const createDocument = (collection, document) => {
    return firestore.collection(collection).add(document);
};

async function getProducts(db){
    const product = firestore.collection(db, 'Product');
    const productSnapshot = await firestore.getDocs(product);
    const productList = productSnapshot.docs.map(doc => doc.data());
    return productList;
}
module.exports = {
    createDocument: createDocument,
    getProducts: getProducts
};