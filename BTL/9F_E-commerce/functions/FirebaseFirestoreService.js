import firebase from "firebase";

const firestore = firebase.firestore();

const createDocument = (collection, document) => {
    return firebase.collection(collection).add(document);
};

const FirebaseFirestoreService = {
    createDocument,
};

export default FirebaseFirestoreService;