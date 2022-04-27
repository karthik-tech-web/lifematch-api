const { Schema } = require('mongoose');
const { dbConn } = require('../../system/db/mongo');
const config = require('../../system/utils/config');

const userSchema = new Schema({
    _id: {
        type: Schema.ObjectId,
        auto: true,
    },
    displayName: String,
    firstName: String,
    middleName: String,
    lastName: String,
    email: {
        type: String,
        unique: true,
        required: true,
    },
    emailVerified: {
        type: Boolean,
        default: false,
    },
    countryCode: String,
    phone: String,
    about: String,
    country: String,
    photoUrl: {
        type: String,
        default: null,
    },
    storageType: {
        type: String,
        enum: Object.keys(config.storageTypeObj),
        default: 1,
    },
    // forgetMailDate: {
    //     type: Date,
    //     default: null,
    // },
    // forgetMailCount: {
    //     type: Number,
    //     default: 0,
    // },
    // forgetMailCode: {
    //     type: Array,
    //     default: [],
    // },
    status: {
        type: Number,
        default: 0,
    },
    online: {
        type: Boolean,
        default: false,
    },
    loginCount: {
        type: Number,
    },
    lastLogin: Date,
}, {
    timestamps: true,
});

const getModel = async() => dbConn.model('user', userSchema, 'users');

module.exports = { getModel };