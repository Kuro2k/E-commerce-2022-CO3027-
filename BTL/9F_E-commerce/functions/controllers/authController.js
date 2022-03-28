const { async } = require("@firebase/util");

var {auth} = require('../FirebaseAdminConfig');
var {user_app} = require("../FirebaseUserConfig");
var firestore = require("firebase/firestore");

const createUser = async (req, res) => {
    const {name,email, phone, password} = req.body;
    const user = await auth.createUser({
        email: email,
        password: password,
        displayName: name,
        phoneNumber: "+84" + phone
    });
    const user_doc = {
        uid: user.uid,
        default_location: "",
    }
    const db = firestore.getFirestore(user_app);
    const user_col = firestore.collection(db, "User");
    await firestore.addDoc(user_col, user_doc);
    res.redirect('/');
};

module.exports = createUser;