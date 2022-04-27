/* eslint-disable no-restricted-syntax */

const boom = require('@hapi/boom');
const mongoose = require('mongoose');
const isEmpty = require('lodash.isempty');
const dbService = require('../../system/db/dbService');
const activity = require('../ActivityLog/controller');
const paypal = require('../../system/payment/paypal');

// const utilsChecks = require('../../system/utils/checks');
// const service = require('./service');

const { ObjectId } = mongoose.Types;

const initiatePayment = async(bodyParams) => {
    try {
        let insertParams = {
            orderId: bodyParams.orderId,
            paymentGateway: bodyParams.paymentGateway,
            userId: bodyParams.userId,
            userIp: bodyParams.userIp ? bodyParams.userIp : null,
        };
        const orderDetails = await dbService.checkExists('order', { _id: bodyParams.orderId });
        if (isEmpty(orderDetails) || !orderDetails) {
            throw boom.notFound('Invalid Order Id');
        }
        // if (!orderDetails.currency || !orderDetails.orderAmount || !orderDetails.productId) {
        //     throw boom.badRequest('Invalid Order to Process Payment');
        // }
        if (orderDetails.userId.toString() !== bodyParams.userId) {
            throw boom.badRequest('Invalid UserId to Access Order');
        // } else if (orderDetails.orderProcessed > 0) {
        //     throw boom.badRequest('Order already Processed');
        }
        orderDetails.currency = orderDetails.currency ? orderDetails.currency : 'USD';
        orderDetails.orderAmount = orderDetails.orderAmount ? orderDetails.orderAmount : 0;
        insertParams = {
            ...insertParams,
            currency: orderDetails.currency,
            amount: orderDetails.orderAmount,
        };
        const userDetails = await dbService.checkExists('User', { _id: bodyParams.userId });
        if (isEmpty(userDetails) || !userDetails) {
            throw boom.notFound('Invalid user');
        }
        const paypalParams = {
            intent: 'sale',
            payer: {
                payment_method: 'paypal',
            },
            transactions: [{
                amount: {
                    total: orderDetails.orderAmount,
                    currency: orderDetails.currency,
                    // details: {
                    //     subtotal: '30.00',
                    //     tax: '0.07',
                    //     shipping: '0.03',
                    //     handling_fee: '1.00',
                    //     shipping_discount: '-1.00',
                    //     insurance: '0.01',
                    // },
                },
                description: 'This is the payment transaction description.',
                // custom: bodyParams.orderId,
                // invoice_number: 'GGV-000001',
                payment_options: {
                    allowed_payment_method: 'INSTANT_FUNDING_SOURCE',
                },
                // soft_descriptor: 'ECHI5786786',
                // item_list: {
                //     items: [{
                //         name: 'hat',
                //         description: 'Brown color hat',
                //         quantity: '5',
                //         price: '3',
                //         tax: '0.01',
                //         sku: '1',
                //         currency: 'USD',
                //     }, {
                //         name: 'handbag',
                //         description: 'Black color hand bag',
                //         quantity: '1',
                //         price: '15',
                //         tax: '0.02',
                //         sku: 'product34',
                //         currency: 'USD',
                //     }],
                //     shipping_address: {
                //         recipient_name: 'Hello World',
                //         line1: '4thFloor',
                //         line2: 'unit#34',
                //         city: 'SAn Jose',
                //         country_code: 'US',
                //         postal_code: '95131',
                //         phone: '011862212345678',
                //         state: 'CA',
                //     },
                // },
            }],
            note_to_payer: 'Contact us for any questions on your order.',
        };
        const createPayment = await paypal.createPayment(paypalParams);
        console.log('======createPayment========>', createPayment);
        if (createPayment.state !== 'created' || !createPayment.id || !createPayment.links || createPayment.links.length <= 0) {
            throw boom.badRequest('Something went wrong. Please try again.');
        }
        const approvalLink = createPayment.links.filter((x) => x.rel === 'approval_url');
        insertParams.paymentGatewayId = createPayment.id;
        const add = await dbService.addService('payment', insertParams);
        if (!add) {
            throw boom.badRequest('Something went wrong. Please try again.');
        }
        const result = {
            status: 200,
            message: 'Payment Initiated Successfully',
            redirectUrl: approvalLink[0].href,
            detail: [add],
        };
        return result;
    } catch (err) {
        const errMsg = err || 'Something went wrong. Please try again.';
        throw boom.badRequest(errMsg);
    }
};

const successPayment = async(bodyParams) => {
    try {
        const matchCondition = {};
        if (bodyParams.gatewayMethod === 'paypal') {
            matchCondition.paymentGatewayId = bodyParams.paymentId;
        } else {
            matchCondition._id = bodyParams.paymentId;
        }
        const paymentDetails = await dbService.checkExists('payment', matchCondition);
        if (isEmpty(paymentDetails) || !paymentDetails) {
            throw boom.notFound('Invalid PaymentId');
        } else if (paymentDetails.paymentStatus > 0) {
            throw boom.badRequest('Payment already Processed');
        } else if (paymentDetails.userId.toString() !== bodyParams.userId) {
            throw boom.badRequest('Invalid UserId to process payment');
        }
        const result = {
            status: 200,
            message: 'Payment Received Successfully',
        };
        return result;
    } catch (err) {
        const errMsg = err || 'Something went wrong. Please try again.';
        throw boom.badRequest(errMsg);
    }
};

const paymentFailure = async(bodyParams) => {
    try {
        const matchCondition = {};
        if (bodyParams.gatewayMethod === 'paypal') {
            matchCondition.paymentGatewayId = bodyParams.paymentId;
        } else {
            matchCondition._id = bodyParams.paymentId;
        }
        const paymentDetails = await dbService.checkExists('payment', matchCondition);
        if (isEmpty(paymentDetails) || !paymentDetails) {
            throw boom.notFound('Invalid PaymentId');
        } else if (paymentDetails.paymentStatus > 0) {
            throw boom.badRequest('Payment already Processed');
        }
        // const executePayment = await paypal.executePayment(bodyParams);
        const paymentDate = new Date();
        const updateParams = {
            paymentDate,
            paymentStatus: 2,
            paymentMethod: 5,
        };
        const updateCondition = {
            _id: paymentDetails._id,
        };
        const update = await dbService.updateOneService('payment', updateCondition, updateParams);
        if (!update) {
            throw boom.badRequest('Something went wrong. Please try again.');
        }
        const updateOrderCondition = {
            _id: paymentDetails.orderId,
        };
        const updateOrderParams = {
            orderProcessed: updateParams.paymentStatus,
            orderDate: paymentDate,
        };
        const updateOrder = await dbService.updateOneService('order', updateOrderCondition, updateOrderParams);
        if (!updateOrder) {
            throw boom.badRequest('Something went wrong. Please try again.');
        }
        const updateProductCondition = {
            orderId: paymentDetails.orderId,
        };
        const updateProductParams = {
            orderStatus: updateParams.paymentStatus,
            orderDate: paymentDate,
        };
        const updateOrderProduct = await dbService.updateManyService('orderProduct', updateProductCondition, updateProductParams);
        if (!updateOrderProduct) {
            throw boom.badRequest('Something went wrong. Please try again..');
        }

        /** activity Log starts */
        const logParams = {
            logModel: 'user',
            // logType: 'successOrder',
            userId: paymentDetails.userId,
            logModelId: paymentDetails.userId,
        };
        logParams.logType = 'orderFailure';
        await activity.activityLog(logParams);
        /** activity Log Ends */
        /** send payment Message Starts */
        /** send payment Message Ends */
        const result = {
            status: 200,
            message: 'Payment Failed',
        };
        return result;
    } catch (err) {
        const errMsg = err || 'Something went wrong. Please try again.';
        throw boom.badRequest(errMsg);
    }
};

module.exports = {
    initiatePayment,
    successPayment,
    paymentFailure,
};