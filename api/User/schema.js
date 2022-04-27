const joi = require('celebrate').Joi;

module.exports.options = {
    abortEarly: false,
    convert: true,
    stripUnknown: true,
};

module.exports.getUserDetails = {
    params: joi.object().keys({
        data: joi.string().required(),
        type: joi.number().required(), // 1.schemaId 2.firebaseId 3.Email
    }),
};

module.exports.getProfileDetails = {
    params: joi.object().keys({
        profileId: joi.string().required(),
    }),
    query: joi.object().keys({
        loggedInUserId: joi.string().required(),
    }),
};

module.exports.updateUser = {
    body: joi.object().keys({
        displayName: joi.string().allow(null, '').optional(),
        firstName: joi.string().allow(null, '').optional(),
        middleName: joi.string().allow(null, '').optional(),
        lastName: joi.string().allow(null, '').optional(),
        phone: joi.string().allow(null, '').optional(),
        countryCode: joi.string().allow(null, '').optional(),
        country: joi.string().allow(null, '').optional(),
        timeZone: joi.string().allow(null, '').optional(),
        currency: joi.string().allow(null, '').optional(),
        about: joi.string().allow(null, '').optional(),
    }),
    params: joi.object().keys({
        userId: joi.string().required(),
    }),
};

module.exports.updatePassword = {
    body: joi.object().keys({
        newPassword: joi.string().required(),
        confirmPassword: joi.string().required(),
        type: joi.number().required(),
    }),
    params: joi.object().keys({
        userId: joi.string().required(),
    }),
};

module.exports.twoFactorAuthentication = {
    params: {
        userId: joi.string().required(),
    },
};

module.exports.twoFactorEnable = {
    body: joi.object().keys({
        authCode: joi.string().required(),
        authKey: joi.string().required(),
    }),
    params: {
        userId: joi.string().required(),
    },
};

module.exports.twoFactorDisable = {
    body: joi.object().keys({
        authCode: joi.string().required(),
    }),
    params: {
        userId: joi.string().required(),
    },
};

module.exports.generateGoogleAuthLink = {
    query: {
        redirectUrl: joi.number().allow('', null).optional(),
        stateData: joi.string().allow('', null).optional(),
        isCalenderOnly: joi.boolean().allow('', null).optional(),
    },
};

module.exports.googleAccountLink = {
    body: joi.object().keys({
        authCode: joi.string().required(),
        userId: joi.string().required(),
    }),
    query: {
        redirectUrl: joi.number().allow('', null).optional(),
        isCalenderOnly: joi.boolean().allow('', null).optional(),
    },
};

module.exports.googleAccountUnLink = {
    body: joi.object().keys({
        userId: joi.string().required(),
    }),
};

module.exports.profileImageUpdate = {
    params: joi.object().keys({
        userId: joi.string().required(),
    }),
};