/* eslint-disable no-await-in-loop */
/* eslint-disable object-curly-spacing */
/* eslint-disable no-restricted-syntax */
const boom = require('@hapi/boom');
const mongoose = require('mongoose');
const moment = require('moment');
const dbService = require('../../system/db/dbService');
const index = require('./index');
const service = require('./service');
// const postController = require('../posts/controller');
const config = require('../../system/utils/config');

const { ObjectId } = mongoose.Types;

const isArray = (a) => (!!a) && (a.constructor === Array);

const checkActivityExist = async(checkExistParams, type = 2) => {
    checkExistParams.createdAt = {
        $gt: moment().subtract(10, 's').toDate(),
        $lte: moment().add(10, 's').toDate(),
    };
    const checkList = await dbService.listService('ActivityLog', checkExistParams);
    if (checkList && checkList.length > 0) {
        if (type === 2) {
            throw boom.badRequest('Activity Already Exist.');
        } else {
            console.log('Activity Already Exist.');
            return true;
        }
    }
    return false;
};

const activityLog = async(params) => {
    const checkExist = await checkActivityExist(params, 1);
    if (checkExist === true) {
        return;
    }
    delete params.createdAt;
    const add = await dbService.addService('ActivityLog', params);
    if (!add || (add && !add._id)) {
        console.log('Something went wrong in activity log.');
    }
    console.log('Activity Log added Successfully');
};

const addActivity = async(params) => {
    await checkActivityExist(params, 2);
    delete params.createdAt;
    const add = await dbService.addService('ActivityLog', params);
    if (!add || (add && !add._id)) {
        throw boom.badRequest('Something went wrong. Please try again.');
    }
    const result = {
        status: 200,
        message: 'Activity Log added Successfully',
    };
    return result;
};

const facatParams = (pathParams, queryParams) => {
    const matchCond1 = {
        userId: ObjectId(pathParams.userId.toString()),
    };
    const sortCond = {
        createdAt: -1,
    };
    // const skipCond = params.offset * params.limit;
    const facetParams = {
        matchCondition1: matchCond1,
        sortCondition: sortCond,
    };
    if (queryParams.limit) {
        facetParams.skipCondition = queryParams.offset * queryParams.limit;
        facetParams.limitCondition = queryParams.limit;
    }
    return facetParams;
};

const listActivity = async(pathParams, queryParams) => {
    const facatDetails = facatParams(pathParams, queryParams);
    const list = await service.listService(facatDetails);
    if (isArray(list) !== true || list.length === 0) {
        throw boom.notFound('No Activity Found');
    }
    if (isArray(list[0].paginatedResults) !== true || list[0].paginatedResults.length === 0) {
        throw boom.notFound('No Activity Found.');
    }
    const logContent = [];
    for (const activity of list[0].paginatedResults) {
        const content = index.LOG_TYPE[activity.logType] ? index.LOG_TYPE[activity.logType] : 'Activity Log added Successfully';
        let replaceData = 'data';
        if (activity.logModel === 'post') {
            const postType = config.getPostType(activity.postType);
            replaceData = `<b>${activity.logPostTitle}</b> ${postType}`;
        } else if (activity.logModel === 'user') {
            replaceData = `<b>${activity.logUserName}</b>`;
        }
        activity.content = content.replace('#data#', replaceData);
        logContent.push({_id: activity._id, logContent: activity.content, createdAt: activity.createdAt});
    }
    list[0].paginatedResults = logContent;
    const result = {
        status: 200,
        message: 'Activity List',
        detail: list,
    };
    return result;
};

const deleteActivity = async(params) => {
    /** delete post and related records starts */
    const postlist = await dbService.listService('posts', params);
    if (postlist && postlist.length > 0) {
        const deletePostArray = [];
        for (const post of postlist) {
            deletePostArray.push(post._id);
        }
        /** delete post starts */
        await dbService.deleteService('posts', params);
        /** delete post Ends */
        const deletePostParams = {
            postId: {
                $in: deletePostArray,
            },
        };
        /** delete post Related Records Starts */
        const deleteColectionList = ['bookmarks', 'comments', 'likes', 'unlikes', 'postViews'];
        for (const collection of deleteColectionList) {
            await dbService.deleteService(collection, deletePostParams);
        }
        /** delete post Related Records Ends */
    }
    /** delete post and related records Ends */

    /** delete post related Array records Starts */
    const dcObject = {
        likes: 'likedUsers',
        bookmarks: 'bookMarkedUsers',
        // comments: 'parentCommentId',
        followers: 'followers',
        unlikes: 'unlikedUsers',
        commentLikes: 'likedUsers',
        profileLikes: 'likedUsers',
    };
    for (const deleteCollection of Object.keys(dcObject)) {
        const deleteParams = {};
        const updateParams = {};
        deleteParams[dcObject[deleteCollection]] = params.userId;
        const list = await dbService.listService(deleteCollection, deleteParams);
        const deleteRecordArray = [];
        for (const data of list) {
            let userArray = data[dcObject[deleteCollection]];
            if (userArray.length === 1) {
                deleteRecordArray.push(data._id);
            } else if (userArray.length > 1) {
                userArray = userArray.filter((userId) => userId.toString() !== params.userId);
                updateParams[dcObject[deleteCollection]] = userArray;
                await dbService.updateOneService(deleteCollection, {_id: data._id}, updateParams);
            }
        }
        if (deleteRecordArray.length > 0) {
            await dbService.deleteService(deleteCollection, {_id: {$in: deleteRecordArray}});
        }
    }
    /** delete post related Array records Ends */

    /** delete post related records and child Starts */
    const dcObj2 = {comments: 'parentCommentId'};
    for (const deleteCollection of Object.keys(dcObj2)) {
        const deleteParams = {};
        // const updateParams = {};
        const list = await dbService.listService(deleteCollection, params);
        const deleteRecordArray = [];
        for (const data of list) {
            deleteRecordArray.push(data._id);
        }
        if (deleteRecordArray.length > 0) {
            await dbService.deleteService(deleteCollection, params);
            deleteParams[dcObj2[deleteCollection]] = {
                $in: deleteRecordArray,
            };
            await dbService.deleteService(deleteCollection, deleteParams);
        }
    }
    /** delete post related records and child Ends */

    const result = {
        status: 200,
        message: 'Activity Log removed Successfully',
    };
    return result;
};

module.exports = {
    activityLog,
    addActivity,
    listActivity,
    deleteActivity,
};