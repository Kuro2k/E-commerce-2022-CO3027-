var auth = require("firebase/auth");
const registerUser = (email, password) => {
    return auth.createUserWithEmailAndPassword(auth.getAuth(), email, password);
};

const loginUser = (email, password) => {
    return auth.signInWithEmailAndPassword(auth.getAuth(), email, password);
};

const logoutUser = () => {
    return auth.signOut(auth.getAuth());
};

const sendPasswordResetEmail = (email) => {
    return auth.sendPasswordResetEmail(auth.getAuth(), email);
};

const loginWithGoogle = async () => {
    const provider = new auth.GoogleAuthProvider(); 
    return await auth.signInWithPopup(auth.getAuth(), provider);
};

const subscribeToAuthChanges = () => auth.getAuth().currentUser;

module.exports = {
    registerUser:registerUser,
    loginUser: loginUser,
    logoutUser:logoutUser,
    sendPasswordResetEmail: sendPasswordResetEmail,
    loginWithGoogle: loginWithGoogle,
    subscribeToAuthChanges: subscribeToAuthChanges
};



