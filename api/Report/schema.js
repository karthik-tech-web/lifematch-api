const joi = require('celebrate').Joi;

module.exports.options = {
    abortEarly: false,
    convert: true,
    stripUnknown: true,
};

module.exports.getReport = {
    query: joi.object().keys({
        reportType: joi.number().required(),
    }),
};

module.exports.sendReport = {
    body: joi.object().keys({
        reporterId: joi.string().required(),
        reportedUserId: joi.string().required(),
        reportType: joi.number().required(),
        postId: joi.when('reportType', { is: 2, then: joi.string().required(), otherwise: joi.string().optional() }),
        postType: joi.when('reportType', { is: 2, then: joi.number().required(), otherwise: joi.number().optional() }),
    }),
};