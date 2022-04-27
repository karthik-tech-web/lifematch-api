const joi = require('celebrate').Joi;

module.exports.options = {
    abortEarly: false,
    convert: true,
    stripUnknown: true,
};

module.exports.createUser = {
    body: joi.object().keys({
        is_mobile_app: joi.number().required(),
        first_name: joi.when('is_mobile_app', { is: 1, then: joi.string().required(), otherwise: joi.optional() }),
        last_name: joi.when('is_mobile_app', { is: 1, then: joi.string().required(), otherwise: joi.optional() }),
        nric_id: joi.string().allow(null, '').optional(),
        nationality: joi.string().allow(null, '').optional(),
        passport_number: joi.string().allow(null, '').optional(),
        country_code: joi.when('is_mobile_app', { is: 1, then: joi.number().required(), otherwise: joi.optional() }),
        password: joi.string().required(),
        email: joi.string().required(),
        user_approval: joi.number().optional(),
        phone_number: joi.when('is_mobile_app', { is: 1, then: joi.number().required(), otherwise: joi.optional() }),
    }),
    query: {
        tenantId: joi.string().required(),
    },
};

module.exports.userLogin = {
    body: joi.object().keys({
        email: joi.string().required(),
        password: joi.required(),
        is_mobile_app: joi.number().optional(),
    }),
    query: {
        tenantId: joi.string().required(),
    },
};

module.exports.resetPassword = {
    body: joi.object().keys({
        email: joi.string().required(),
        password: joi.string().required(),
        newpassword: joi.string().required(),
    }),
    query: {
        tenantId: joi.string().required(),
    },
};

module.exports.forgotPassword = {
    body: joi.object().keys({
        email: joi.string().required(),
    }),
    query: {
        tenantId: joi.string().required(),
    },
};

module.exports.forgetPasswordVerify = {
    body: joi.object().keys({ }),
    query: {
        tenantId: joi.string().required(),
        email: joi.string().required(),
        secretToken: joi.string().required(),
    },
};

module.exports.updateForgotPassword = {
    body: joi.object().keys({
        email: joi.string().required(),
        secretToken: joi.string().required(),
        newpassword: joi.string().required(),
    }),
    query: {
        tenantId: joi.string().required(),
    },
};

module.exports.guardCheck = {
    body: joi.object().keys({
        secretToken: joi.string().required(),
    }),
    query: {
        tenantId: joi.string().required(),
    },
};

module.exports.userVerification = {
    body: joi.object().keys({
        email: joi.string().required(),
    }),
    query: {
        tenantId: joi.string().required(),
    },
};

module.exports.getUserFromEmail = {
    body: joi.object().keys({}),
    query: {
        tenantId: joi.string().required(),
    },
    params: {
        email: joi.string().required(),
    },
};

module.exports.resendEmailVerification = {
    body: joi.object().keys({
        email: joi.string().required(),
    }),
    query: {
        tenantId: joi.string().required(),
    },
};

module.exports.viewSurvey = {
    body: joi.object().keys({ }),
    query: {
        tenantId: joi.string().required(),
    },
    params: {
        survey_id: joi.string().required(),
    },
};

module.exports.locationDetail = {
    body: joi.object().keys({
    }),
    query: {
        tenantId: joi.string().required(),
    },
    params: {
        location_id: joi.string().required(),
    },
};

module.exports.visitorRegistration = {
    body: joi.object().keys({
        first_name: joi.string().required(),
        last_name: joi.string().required(),
        email: joi.string().required(),
        country_code: joi.number().required(),
        phone_number: joi.number().required(),
        nationality: joi.string().required(),
        nric_id: joi.optional(),
        location_id: joi.string().required(),
    }),
    query: {
        tenantId: joi.string().required(),
    },
};

module.exports.twoFactorAuthentication = {
    body: joi.object().keys({
        email: joi.string().required(),
        otp: joi.string().required(),
    }),
    query: {
        tenantId: joi.string().required(),
    },
};

module.exports.redirectUrl = {
    body: joi.object().keys({
    }),
    query: {
        tenantId: joi.string().required(),
    },
};

module.exports.googleAuth = {
    body: joi.object().keys({
        tokenId: joi.string().required(),
        is_mobile_app: joi.number().required(),
        user_approval: joi.number().optional(),
    }),
    query: {
        tenantId: joi.string().required(),
    },
};

module.exports.userExist = {
    body: joi.object().keys({
        email: joi.string().required(),
        is_mobile_app: joi.number().optional(),
    }),
    query: {
        tenantId: joi.string().required(),
    },
};

module.exports.notifyEmail = {
    body: joi.object().keys({}),
    query: {
        tenantId: joi.string().required(),
        user_acklowledge_email: joi.string().allow(null, '').optional(),
    },
};