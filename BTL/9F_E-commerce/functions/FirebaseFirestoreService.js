var firestore = require("firebase/firestore");

const createDocument = (collection, document) => {
    return firestore.collection(collection).add(document);
};

module.exports = createDocument;