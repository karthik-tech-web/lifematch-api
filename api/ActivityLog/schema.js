const joi = require('celebrate').Joi;

module.exports.options = {
    abortEarly: false,
    convert: true,
    stripUnknown: true,
};

module.exports.addActivity = {
    body: joi.object().keys({
        logModel: joi.string().required(),
        logType: joi.string().required(),
        userId: joi.string().required(),
        logModelId: joi.string().required(),
    }),
};

module.exports.listActivity = {
    params: {
        userId: joi.string().required(),
    },
    query: {
        // search: joi.string().allow('', null).optional(),
        // sortBy: joi.string().allow(null, '').optional(),
        // sortDir: joi.string().allow(null, '').optional(),
        limit: joi.number().required(),
        offset: joi.number().required(),
    },
};

module.exports.deleteActivity = {
    body: joi.object().keys({ }),
    params: {
        userId: joi.string().required(),
    },
};
