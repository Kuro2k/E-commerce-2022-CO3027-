const express = require("express");
const auth_router = express.Router();
const createUser = require("../controllers/authController");
const checkIfAuthenticated = require("../middlewares/auth-middleware");
const handler_auth = require("../FirebaseAuthService");
const { async } = require("@firebase/util");
auth_router.post('/signup', createUser);

auth_router.post('/login', async (req, res) => {
    const {email, password} = req.body;
    try {
        await handler_auth.loginUser(email, password);
        res.status(200).send("oke");
    } catch (error) {
        res.status(401).send(error)
    }
})
auth_router.get('/logout', async (req, res) => {
    try {
        await handler_auth.logoutUser();
        res.status(200).send("oke");
    } catch (error) {
        res.status(401).send(error)
    }
})
module.exports = auth_router;