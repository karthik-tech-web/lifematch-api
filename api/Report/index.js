const { Schema } = require('mongoose');
const { dbConn } = require('../../system/db/mongo');

const reportSchema = new Schema({
    _id: {
        type: Schema.ObjectId,
        auto: true,
    },
    reporterId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
    },
    reportedUserId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
    },
    reportType: Number, // 1.user 2.post
    postId: {
        type: Schema.Types.ObjectId,
        ref: 'post',
    },
    postType: Number, // 1.Event 2.Video 3.Feed
}, {
    timestamps: true,
});

const getModel = async() => dbConn.models.report || dbConn.model('report', reportSchema, 'reports');

module.exports = { getModel };