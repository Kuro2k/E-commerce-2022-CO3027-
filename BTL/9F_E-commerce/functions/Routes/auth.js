const express = require("express");
const auth_router = express.Router();
const createUser = require("../controllers/authController");
const checkIfAuthenticated = require("../middlewares/auth-middleware");
const handler_auth = require("../FirebaseAuthService");
const { async } = require("@firebase/util");
const { auth } = require("firebase-admin");
auth_router.post('/signup', createUser);

auth_router.post('/login', async (req, res) => {
    const {email, password} = req.body;
    try {
        await handler_auth.loginUser(email, password);
        res.redirect('/');
    } catch (error) {
        res.status(401).send(error)
    }
})
auth_router.get('/logout', async (req, res) => {
    try {
        await handler_auth.logoutUser();
        res.redirect('/');
    } catch (error) {
        res.status(401).send(error)
    }
})

auth_router.post('/forgetpsw', async (req, res) => {
    try {
        await handler_auth.sendPasswordResetEmail(req.body.email);
        res.status(200).send("oke");
    } catch (error) {
        res.status(401).send(error)
    }
})
module.exports = auth_router;