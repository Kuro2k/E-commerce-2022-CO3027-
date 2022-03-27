const { async } = require("@firebase/util");

var {auth} = require('../FirebaseAdminConfig');

const createUser = async (req, res) => {
    const {name,email, phone, password} = req.body;
    const user = await auth.createUser({
        email: email,
        password: password,
        displayName: name,
        phoneNumber: "+84" + phone
    });

    return res.send(user);
};

module.exports = createUser;