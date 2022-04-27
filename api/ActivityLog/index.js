const { Schema } = require('mongoose');
const { dbConn } = require('../../system/db/mongo');

// dont change key. it is refered to collection name
const LOG_MODEL = Object.freeze({
    bookmark: 'bookmark',
    cart: 'cart',
    comment: 'comment',
    commentLike: 'commentLike',
    contact: 'contact',
    follower: 'follower',
    like: 'like',
    post: 'post',
    postView: 'postView',
    profileLike: 'profileLike',
    unlike: 'unlike',
    user: 'user',
    order: 'order',
});

const LOG_TYPE = Object.freeze({
    add: 'Your #data# has been added Successfully',
    bookmark: '#data# has been bookmarked Successfully',
    removeBookmark: '#data# has been removed from Bookmark',
    cart: '#data# has been added to cart',
    removeCart: '#data# has been removed from cart',
    chat: 'You just started chating with #data#..',
    comment: 'You commented on #data#.',
    commentUpdate: 'You update comment on #data#.',
    commentLike: 'You liked the comment.',
    // commentLike: 'You liked the comment.',
    edit: 'Your #data# has been edited Successfully',
    follow: 'You started following #data#',
    like: '#data# has been liked Successfully',
    profileLike: '#data# Proflie has been liked Successfully',
    view: '#data# has been viewed recently',
    live: 'You are live now.',
    save: '#data# has been saved Successfully',
    unlike: '#data# has been Unliked Successfully',
    upload: 'Your #data# has been Uploaded Successfully.',
    report: '#data# has been reported Successfully.',
    orderSuccess: 'Your Order has been Placed Successfully.',
    orderFailure: 'Your order has been failed.',
});

const activityLogSchema = new Schema({
    _id: {
        type: Schema.ObjectId,
        auto: true,
    },
    logModel: {
        type: String,
        enum: Object.keys(LOG_MODEL),
    },
    logType: {
        type: String,
        enum: Object.keys(LOG_TYPE),
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
    },
    logModelId: {
        type: Schema.Types.ObjectId,
        required: true,
        refPath: 'logModel',
    },
    // logModelRef: {
    //     type: String,
    //     required: true,
    //     enum: Object.keys(LOG_MODEL),
    // },
}, {
    timestamps: true,
});

const getModel = async() => dbConn.models.activityLog || dbConn.model('activityLog', activityLogSchema);

module.exports = {
    getModel,
    LOG_TYPE,
};