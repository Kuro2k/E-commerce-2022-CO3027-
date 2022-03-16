const registerUser = (email, password, auth) => {
    return auth.createUserWithEmailAndPassword(email, password);
};

const loginUser = (email, password, auth) => {
    return auth.signInWithEmailAndPassword(email, password);
};

const logoutUser = (auth) => {
    return auth.signOut();
};

const sendPasswordResetEmail = (email, auth) => {
    return auth.sendPasswordResetEmail(email);
};

const loginWithGoogle = (auth, firebase) => {
    const provider = new firebase.auth.GoogleAuthProvider;

    return auth.signInWithPopup(provider);
};

const subscribeToAuthChanges = (handleAuthChange, auth) => {
    auth.onAuthStateChanged((user) => {
        handleAuthChange(user);
    });
};

module.exports = {
    registerUser:registerUser,
    loginUser: loginUser,
    logoutUser:logoutUser,
    sendPasswordResetEmail: sendPasswordResetEmail,
    loginWithGoogle: loginWithGoogle,
    subscribeToAuthChanges: subscribeToAuthChanges
};



