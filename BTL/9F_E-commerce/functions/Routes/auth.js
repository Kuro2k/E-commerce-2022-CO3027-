const express = require("express");
const auth_router = express.Router();
const createUser = require("../controllers/authController");
const checkIfAuthenticated = require("../middlewares/auth-middleware");
const handler_auth = require("../FirebaseAuthService");
const { async } = require("@firebase/util");
auth_router.post('/auth/signup', createUser);

auth_router.post('/auth/login', async (req, res) => {
    const {email, password} = req.body;
    handler_auth.loginUser(email, password);
    res.status(200).send("ok");
})
module.exports = auth_router;