const { Schema } = require('mongoose');
const { dbConn } = require('../../system/db/mongo');
const config = require('../../system/utils/config');

const paymentSchema = new Schema({
    _id: {
        type: Schema.ObjectId,
        auto: true,
    },
    // cardNumber: String,
    // expiryYear: Number,
    // expiryMonth: Number,
    paymentMethod: {
        type: String,
        enum: Object.keys(config.paymentMethodObj),
    },
    paymentGateway: {
        type: String,
        enum: Object.keys(config.paymentGatewayObj),
    },
    currency: String,
    amount: Number,
    paymentDate: Date,
    // productId: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'post',
    // },
    paymentGatewayId: String,
    orderId: {
        type: Schema.Types.ObjectId,
        ref: 'post',
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
    },
    userIp: String,
    paymentStatus: {
        type: Number,
        default: 0, // 0.attempt 1.Success 2.Failure
    },
    status: {
        type: Number,
        default: 1,
    },
}, {
    timestamps: true,
});

const getModel = async() => dbConn.models.payment || dbConn.model('payment', paymentSchema);

module.exports = { getModel };