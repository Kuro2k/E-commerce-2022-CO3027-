const { async } = require("@firebase/util");

var {auth} = require('../FirebaseAdminConfig');
var {user_app} = require("../FirebaseUserConfig");
var firestore = require("firebase/firestore");
const e = require("express");
const { json } = require("express");

const createUser = async (req, res) => {
    try {
    const {name,email, phone, psw, re_psw} = JSON.parse(req.body);
    const user = await auth.createUser({
        email: email,
        password: psw,
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
    res.status(200).send({result: "Success"})
} catch (error) {
    res.status(200).send({error: error.message})
}
};

module.exports = createUser;