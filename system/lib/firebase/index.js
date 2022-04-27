const admin = require('firebase-admin');
const boom = require('@hapi/boom');
const jwtAuth = require('../../utils/jwt-auth');
const stringConfig = require('../../utils/config');

const serviceAccount = require(`../../../${process.env.FIREBASE_SERVICE_ACCOUNT}`);

const firebaseAdmin = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // databaseURL: process.env.FIREBASE_DATABASE_URL,
});

const actionCodeSettings = {
    url: process.env.FIREBASE_EMAIL_REDIRECT_LINK,
};

const createUser = async(user) => {
    console.log('Creating User in firebase');
    try {
        const newUser = await firebaseAdmin.auth().createUser({
            email: user.email,
            password: user.password,
            displayName: user.email,
            emailVerified: user.emailVerified,
        });
        console.log(`Firebase user created: ${newUser.uid}, email: ${user.email}`);
        return {
            uid: newUser.uid,
        };
    } catch (error) {
        return error.errorInfo.message;
    }
};

const generateEmailVerificationLink = async(email, verifyUrl = null) => {
    try {
        actionCodeSettings.url = verifyUrl || actionCodeSettings.url;
        const verificationEmailLink = await firebaseAdmin.auth().generateEmailVerificationLink(email, actionCodeSettings);
        return verificationEmailLink;
    } catch (error) {
        // To-do:handle this error
        return error.errorInfo;
    }
};

const verifyIdToken = async(req, res, next) => {
    if (!req.headers.authorization) {
        return next(boom.unauthorized());
    }
    const token = req.headers.authorization;
    if (req.headers.authorization === 'auth') {
        return next();
    }
    console.log('====req.headers========>', req.headers);
    if (req.headers.authorization === 'jwt-verify') {
        if (!req.headers['jwt-token']) {
            return next(boom.unauthorized('Unauthorized Forget Password Token'));
        }
        const jwtVerify = await jwtAuth.tokenVerify(req.headers['jwt-token'], stringConfig.jwtResetPasswdSecretSalt);
        console.log('====jwtVerify========>', jwtVerify);
        req.userMeta = jwtVerify.payload;
        return next();
    }
    const idToken = token.split(' ').pop();
    firebaseAdmin.auth().verifyIdToken(idToken)
        .then((decodedToken) => {
            req.userMeta = decodedToken;
            return next();
        }).catch((error) => {
            console.log('===========error======>', error);
            if (error.errorInfo && error.errorInfo.code) {
                if (error.errorInfo.code.indexOf('token-expired') !== -1) {
                    next(boom.gatewayTimeout('Token Expired.'));
                }
                next(boom.badRequest(error.errorInfo.message));
            }
            next(boom.unauthorized());
        });
};

const deleteUser = async(uid) => {
    try {
        await firebaseAdmin.auth().deleteUser(uid);
        return 'Successfully deleted user';
    } catch (error) {
        return error.errorInfo.message;
    }
};

const resetUserPassword = async(uid, newPassword) => {
    try {
        const updateUser = await firebaseAdmin.auth().updateUser(uid, {
            password: newPassword,
            emailVerified: true,
        });
        return {
            uid: updateUser.uid,
        };
    } catch (error) {
        return error.errorInfo.message;
    }
};

const getUser = async(uid) => {
    try {
        const userDetail = await firebaseAdmin.auth().getUser(uid);
        return userDetail;
    } catch (error) {
        return error.errorInfo.message;
    }
};

const pushNotification = async(userToken, payload, option = {}) => new Promise((resolve) => {
    try {
        // Send Notifiction
        firebaseAdmin.messaging().sendToDevice(userToken, payload, option).then((response) => {
            console.log('Successfully send message=>', JSON.stringify(response));
            resolve(response);
        }).catch((error) => {
            console.log(`Error sending message: ${error}`);
        });
    } catch (err) {
        console.log('Error message', err);
    }
});

module.exports = {
    createUser,
    generateEmailVerificationLink,
    verifyIdToken,
    deleteUser,
    resetUserPassword,
    getUser,
    pushNotification,
};