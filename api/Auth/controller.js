const path = require('path');
const boom = require('@hapi/boom');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const service = require('./service');
const stringConfig = require('../../system/utils/config');
const sendMail = require('../../system/sendmail/index');
const jwtAuth = require('../../system/utils/jwt-auth');

const isArray = (a) => (!!a) && (a.constructor === Array);

const userVerificationviaMail = async(tenantId, params, tenantMetaData) => {
    if (!params.email || params.email === '' || params.email === null || params.email === 'null') {
        throw boom.badRequest('Not a Valid Email');
    }
    const payload = { email: params.email };
    const token = await jwtAuth.tokenCreation(payload, stringConfig.jwtEmailVerifySecretSalt, '12h');
    const mailTemplatePath = path.resolve(`${__dirname}/email-templates/email-verification.ejs`);
    const emailParams = {
        name: params.first_name,
        verify_url: `${process.env.SERVER_DOMAIN}/auth/email-verification?tenantId=${tenantId}&email=${params.email}&secretToken=${token}`,
    };
    const jsonTenantMetaData = JSON.parse(JSON.stringify(tenantMetaData));
    const mailOptions = {
        from: jsonTenantMetaData.DEFAULT_FROM_MAIL,
        to: params.email,
        subject: 'Account Verification',
        mailSettings: jsonTenantMetaData.MAIL_SETTINGS,
    };
    await sendMail.readFile(mailTemplatePath, emailParams, mailOptions);
    const result = {
        status: 200,
        message: 'Verification Mail Sent Successfully',
    };
    return result;
};

const createUser = async(tenantId, params, tenantMetaData) => {
    if (!params.email) {
        throw boom.badRequest('Mail Id Requirred');
    }
    let passwordValidation = false;
    if (params.password) {
        passwordValidation = stringConfig.passwordValidation(params.password);
    }
    if (passwordValidation === false) {
        throw boom.badRequest('Enter Valid Password');
    }
    const encryptPasswd = await bcrypt.hash(params.password.trim(), stringConfig.PawwordsaltRounds);
    if (encryptPasswd) {
        params.password = encryptPasswd;
    } else {
        throw boom.badRequest('Password Hash Generation Problem.');
    }
    const checkUser = await service.checkUserExists(tenantId, params);
    let result = '';
    if (checkUser !== null && checkUser._id && checkUser._id !== '' && (checkUser.social_auth && checkUser.social_auth === 1) && (!params.user_approval || params.user_approval !== 1)) {
        result = {
            status: 400,
            message: 'You have an existing Google linked account. Would you like to connect these accounts?',
        };
        return result;
    }
    if (checkUser !== null && checkUser._id && checkUser._id !== '' && checkUser.password) {
        result = {
            status: 500,
            message: 'User Already Exists.',
        };
        return result;
    }
    params.tenant_id = tenantId;
    params.status = 0;
    let newUser = '';
    if ((checkUser !== null && checkUser.social_auth && checkUser.social_auth === 1) && (params.user_approval && params.user_approval === 1)) {
        params.status = 1;
        const updatePathParams = {
            email: params.email,
        };
        newUser = await service.updateUserService(tenantId, updatePathParams, params);
    } else {
        newUser = await service.createUserService(tenantId, params);
    }
    if (!newUser._id) {
        result = {
            status: 500,
            message: 'Something went wrong. Please try again.',
        };
        return result;
    }
    if (params.status === 0) {
        await userVerificationviaMail(tenantId, params, tenantMetaData);
    }
    result = {
        status: 200,
        message: 'User Registered Successfully',
    };
    return result;
};

const userLogin = async(tenantId, params) => {
    let getUser = await service.getUserDetailService(tenantId, params);
    if (isArray(getUser) !== true || getUser.length === 0 || !getUser[0].password) {
        throw boom.badRequest('Invalid Login Credentials.');
    }
    if (getUser[0].status === 0) {
        throw boom.badRequest('Please verify your email to login.');
    }
    const match = await bcrypt.compare(params.password, getUser[0].password);
    if (!match) {
        throw boom.badRequest('Invalid Login Credentials.');
    }
    getUser = JSON.parse(JSON.stringify(getUser[0]));
    delete getUser.password;
    const result = {
        status: 200,
        message: 'User logged in Successfully',
    };
    if (getUser.two_factor_enable === true && params.is_mobile_app !== 1) {
        // result.otpauth = authenticator.generateTotpUri(getUser.authorization_key, getUser.email, 'Noqnoq', 'SHA1', 6, 30);
        result.two_factor_authentication = getUser.two_factor_enable;
    } else {
    // Create a token
        const payload = { email: params.email, tenant_id: tenantId, user_id: getUser._id };
        const token = await jwtAuth.tokenCreation(payload, stringConfig.jwtSecretSalt, '15d');
        result.two_factor_authentication = false;
        result.accessToken = token;
        result.detail = [getUser];
    }

    return result;
};

const updatePassword = async(tenantId, newPassword, updatePathParams) => {
    let passwordValidation = false;
    if (newPassword) {
        passwordValidation = stringConfig.passwordValidation(newPassword);
    }
    if (passwordValidation === false) {
        throw boom.badRequest('Enter valid new Password');
    }
    const EncryptedPassword = await bcrypt.hash(newPassword.trim(), stringConfig.PawwordsaltRounds);
    const updateparams = {
        password: EncryptedPassword,
    };
    const updateuser = await service.updateUserService(tenantId, updatePathParams, updateparams);
    if (!updateuser._id) {
        throw boom.badRequest('Something went wrong. Please try again.');
    }
    const result = {
        status: 200,
        message: 'Password Updated Successfully',
    };
    return result;
};

const resetPassword = async(tenantId, params) => {
    if (params.newpassword.length < 8) {
        throw boom.badRequest('New Password should be minimum 8 characters');
    }
    const userDetails = await service.getUserDetailService(tenantId, params);
    if (isArray(userDetails) !== true || userDetails.length === 0) {
        throw boom.badRequest('User not found');
    }
    const match = await bcrypt.compare(params.password.trim(), userDetails[0].password);
    if (!match) {
        throw boom.badRequest('Your current password is incorrect.');
    }
    if (params.password === params.newpassword) {
        throw boom.badRequest('Current password and New password should be different');
    }
    const updatePathParams = {
        _id: userDetails[0]._id,
    };
    const updateResult = updatePassword(tenantId, params.newpassword, updatePathParams);
    return updateResult;
};

const forgotPassword = async(tenantId, params, tenantMetaData) => {
    const userDetails = await service.getUserDetailService(tenantId, params);
    if (isArray(userDetails) !== true || userDetails.length === 0) {
        throw boom.badRequest('User not found');
    }
    const payload = { email: params.email };
    // const options = { expiresIn: 3600 };
    // const secret = ConfigDetails.jwtResetPasswdSecretSalt;
    // const token = jwt.sign(payload, secret, options);
    const token = await stringConfig.tokenCreation(payload, stringConfig.jwtResetPasswdSecretSalt, 3600);
    const mailTemplatePath = path.resolve(`${__dirname}/email-templates/forgot-password.ejs`);
    const emailParams = {
        name: userDetails[0].first_name,
        reset_url: `${process.env.SERVER_DOMAIN}/auth/forgot-password-update?tenantId=${tenantId}&email=${params.email}&secretToken=${token}`,
    };
    const jsonTenantMetaData = JSON.parse(JSON.stringify(tenantMetaData));
    const mailOptions = {
        from: jsonTenantMetaData.DEFAULT_FROM_MAIL,
        to: userDetails[0].email,
        subject: 'Password Reset',
        mailSettings: jsonTenantMetaData.MAIL_SETTINGS,
    };
    await sendMail.readFile(mailTemplatePath, emailParams, mailOptions);
    const result = {
        status: 200,
        message: 'Re-set Mail Sent Successfully',
    };
    return result;
};

const forgotPasswordVerify = async(tenantId, params) => {
    try {
        jwt.verify(params.secretToken, stringConfig.jwtResetPasswdSecretSalt);
    } catch (err) {
        throw boom.unauthorized('Link Expired');
    }
    const decoded = jwt.decode(params.secretToken, {
        complete: true,
    });
    if (params.email !== decoded.payload.email) {
        throw boom.unauthorized('Invalid User');
    }
    const result = {
        status: 200,
        message: 'Valid Token',
        valid_token: 1,
    };
    return result;
};

const updateForgotPassword = async(tenantId, params) => {
    try {
        jwt.verify(params.secretToken, stringConfig.jwtResetPasswdSecretSalt);
    } catch (err) {
        throw boom.unauthorized('Link Expired');
    }
    const updatePathParams = {
        email: params.email,
    };
    const updateResult = updatePassword(tenantId, params.newpassword, updatePathParams);
    return updateResult;
};

const userVerification = async(tenantId, params) => {
    const updatePathParams = {
        email: params.email,
    };
    const updateparams = {
        status: 1,
    };
    const updateuser = await service.updateUserService(tenantId, updatePathParams, updateparams);
    if (!updateuser._id) {
        throw boom.badRequest('Something went wrong. Please try again.');
    }

    const result = {
        status: 200,
        message: 'Mail verified Successfully',
    };
    return result;
};

const getUserFromEmail = async(tenantId, params) => {
    const User = await service.getUserDetailService(tenantId, params);
    if (isArray(User) !== true || User.length === 0) {
        throw boom.badRequest('Something went wrong. Please try again.');
    }
    const result = {
        status: 200,
        message: 'User Detail',
        detail: User,
    };
    return result;
};

module.exports = {
    createUser,
    userLogin,
    resetPassword,
    forgotPassword,
    forgotPasswordVerify,
    updateForgotPassword,
    userVerification,
    getUserFromEmail,
    userVerificationviaMail,
};