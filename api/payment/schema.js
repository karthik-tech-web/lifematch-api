const joi = require('celebrate').Joi;

module.exports.initiatePayment = {
    body: joi.object().keys({
        orderId: joi.string().required(),
        paymentGateway: joi.string().required(),
        userId: joi.string().required(),
        userIp: joi.string().allow(null, '').optional(),
    }),
};

module.exports.updatePayment = {
    body: joi.object().keys({
        paymentId: joi.string().required(),
        paymentMethod: joi.string().allow(null, '').optional(),
        orderId: joi.string().required(),
        amount: joi.number().required(),
        status: joi.string().required(),
        userId: joi.string().required(),
    }),
};

module.exports.successPayment = {
    body: joi.object().keys({
        gatewayMethod: joi.string().required(), // paypal, others
        paymentId: joi.string().required(),
        payerId: joi.when('gatewayMethod', { is: 'paypal', then: joi.string().required(), otherwise: joi.optional() }),
        paymentMethod: joi.string().allow(null, '').optional(),
        // orderId: joi.string().required(),
        // amount: joi.number().required(),
        // status: joi.string().required(),
        userId: joi.string().required(),
    }),
};

module.exports.refundPayment = {
    body: joi.object().keys({
        paymentId: joi.string().required(),
        userId: joi.string().required(),
    }),
};