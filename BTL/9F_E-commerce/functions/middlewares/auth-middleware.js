const { async } = require("@firebase/util");
var {auth} = require("../FirebaseAdminConfig");

const getAuthToken = (req, res, next) => {
    if (
        req.headers.authorization &&
        req.headers.authorization.split(' ')[0] ==='Farmnine'
    ) {
        req.authToken = req.headers.authorization.split(' ')[1];
    } else {
        req.authToken = null;
    }
    next();
};

const checkIfAuthenticated = (req, res, next) => {
    getAuthToken(req, res, async () => {
        try {
            const { authToken } = req;
            const userInfo = await auth.verifyIdToken(authToken);
            req.authId = userInfo.uid;
            return next();
        } catch (err) {
            return res.status(401).send({error: 'You are not authorized to make this request' });
        }
    });
};

module.exports = checkIfAuthenticated;