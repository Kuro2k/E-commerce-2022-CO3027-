const { async } = require("@firebase/util");

var {auth} = require('../FirebaseAdminConfig');

const createUser = async (req, res) => {
    const {email, password, firstName, lastName} = req.body;
    const user = await auth.createUser({
        email: email,
        password: password,
        displayName: `${firstName} ${lastName}`
    });

    return res.send(user);
};

module.exports = createUser;