/* eslint-disable global-require */
/* eslint-disable brace-style */
/* eslint-disable camelcase */
// const moment = require('moment');
const mongoose = require('mongoose');
const boom = require('@hapi/boom');
const path = require('path');
const fs = require('fs');
const config = require('../utils/config');

const { ObjectId } = mongoose.Types;

/**
 *
 * @param {*} indexType will give input as index folder name
 * @returns return index
 */

const getCollectionIndex = (indexType) => {
    const basePath = path.resolve(__dirname, '../..');
    const indexPath = `${basePath}/api/${indexType}/index.js`;
    if (indexType && !fs.existsSync(indexPath)) {
        throw boom.badRequest('Invalid Index Type');
    }
    // eslint-disable-next-line import/no-dynamic-require
    return require(indexPath);
};

const checkExists = async(indexType, getCondition) => {
    const index = getCollectionIndex(indexType);
    // const index = `${indexType}Index`;
    const Model = await index.getModel();
    const CheckDataExists = await Model.findOne(getCondition, '-__v');
    return CheckDataExists;
};

const addService = async(indexType, addParams) => {
    if (addParams.email) { addParams.email = addParams.email.trim().toLowerCase(); }
    const index = getCollectionIndex(indexType);
    const Model = await index.getModel();
    const newRecord = new Model(addParams);
    const saveRecord = await newRecord.save();
    return saveRecord;
};

const bulkCreateService = async(indexType, params) => {
    const option = {
        ordered: false,
    };
    const index = getCollectionIndex(indexType);
    const Model = await index.getModel();
    const result = await Model.insertMany(params, option);
    return result;
};

const listService = async(indexType, filterParams = null, projectparams = null, facatParams) => {
    const index = getCollectionIndex(indexType);
    const Model = await index.getModel();
    const filterCondtion = filterParams || { status: 1 };
    const skipCount = (facatParams && facatParams.skipCondition) ? facatParams.skipCondition : 0;
    const limitCount = (facatParams && facatParams.limitCondition) ? facatParams.limitCondition : 0;
    const projectCondition = projectparams || '-__v';
    const sortCondtion = (facatParams && facatParams.sortCondition) || { createdAt: 1 };
    const list = await Model.find(filterCondtion, projectCondition).sort(sortCondtion).skip(skipCount).limit(limitCount);
    return list;
};

const updateOneService = async(indexType, updateCondtion, updateParams, projectParams = {}) => {
    const options = {
        new: true,
        upsert: true,
    };
    if (updateParams.email) { updateParams.email = updateParams.email.trim().toLowerCase(); }
    if (Object.keys(projectParams).length > 0) {
        options.projection = projectParams;
    }
    const index = getCollectionIndex(indexType);
    const Model = await index.getModel();
    const result = await Model.findOneAndUpdate(updateCondtion, updateParams, options);
    return result;
};

const updateManyService = async(indexType, updateCondtion, updateParams) => {
    const options = {
        upsert: true,
    };
    const index = getCollectionIndex(indexType);
    const Model = await index.getModel();
    const result = await Model.updateMany(updateCondtion, updateParams, options);
    return result;
};

const deleteService = async(indexType, deleteCondtion) => {
    const index = getCollectionIndex(indexType);
    const Model = await index.getModel();
    const result = await Model.deleteMany(deleteCondtion);
    return result;
};

const searchService = async(indexType, searchQuery, skip, limit) => {
    const postIndex = await getCollectionIndex(indexType);
    const postModel = await postIndex.getModel();

    const userIndex = await getCollectionIndex('user');
    const userModel = await userIndex.getModel();

    const userResult = await userModel.aggregate([
        {
            $search: {
                index: 'users_search_index',
                text: {
                    query: searchQuery,
                    path: {
                        wildcard: '*',
                    },
                },
            },
        },
        {
            $facet: {
                users: [
                    { $skip: skip },
                    { $limit: limit },
                ],
                pageInfo: [
                    { $group: { _id: null, count: { $sum: 1 } } },
                ],
            },
        },
    ]);

    const postResult = await postModel.aggregate([
        {
            $search: {
                index: 'title_and_description',
                text: {
                    query: searchQuery,
                    path: {
                        wildcard: '*',
                    },
                },
            },
        },
        {
            $facet: {
                posts: [
                    { $skip: skip },
                    { $limit: limit },
                ],
                pageInfo: [
                    { $group: { _id: null, count: { $sum: 1 } } },
                ],
            },
        },
    ]);

    return {
        posts: postResult[0].posts,
        users: userResult[0].users,
    };
};

const stopwords = ['i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours',
    'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its',
    'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this',
    'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has',
    'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because',
    'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into',
    'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out',
    'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where',
    'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no',
    'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just',
    'don', 'should', 'now'];

const remove_stopwords = (str) => {
    const res = [];
    const words = str.split(' ');
    for (let i = 0; i < words.length; i++) {
        const word_clean = words[i].split('.').join('');
        if (!stopwords.includes(word_clean)) {
            if (word_clean !== ' ' && word_clean !== '')
            {
                res.push(new RegExp(word_clean, 'i'));
            }
        }
    }
    return (res);
};

const searchUserService = async(indexType, searchQuery, skip, limit) => {
    const userIndex = await getCollectionIndex(indexType);
    const userModel = await userIndex.getModel();
    const searchQuerArray = remove_stopwords(searchQuery);
    console.log(searchQuerArray, '------------------------>>>>');
    const userResult = await userModel.find({
        $or: [
            { displayName: { $regex: `.*${searchQuery}.*`, $options: 'i' } },
            { email: { $regex: `.*${searchQuery}.*`, $options: 'i' } },
            { displayName: { $in: searchQuerArray } },
            { email: { $in: searchQuerArray } },
        ],

    }).skip(skip).limit(limit);
    return userResult;
};

const searchPostService = async(indexType, searchQuery, skip, limit) => {
    const postIndex = await getCollectionIndex(indexType);
    const postModel = await postIndex.getModel();
    const postResult = await postModel.aggregate([
        {
            $search: {
                index: 'title_and_description',
                text: {
                    query: searchQuery,
                    path: {
                        wildcard: '*',
                    },
                },
            },
        },
        {
            $lookup: {
            from: 'users',
            localField: 'createdBy',
            foreignField: '_id',
            as: 'user',
            },
        },
        { 
            $unwind: '$user',
        },
        {
            $facet: {
                posts: [
                    { $skip: skip },
                    { $limit: limit },
                ],
                pageInfo: [
                    { $group: { _id: null, count: { $sum: 1 } } },
                ],
            },
        },
    ]);

    return postResult;
};

const searchIndexService = async(indexType, matchCondition, searchQuery, project, skip = 0, limit = 0) => {
    if (!project || !Object.keys(project) || Object.keys(project).length <= 0) {
        throw boom.badRequest('Invalid project Value');
    }
    const index = await getCollectionIndex(indexType);
    const indexVal = config.searchIndexObj[indexType] ? config.searchIndexObj[indexType] : null;
    if (!indexVal) {
        throw boom.badRequest('Invalid Index Value');
    }
    const indexModel = await index.getModel();
    const result = await indexModel.aggregate([
        {
            $search: {
                index: indexVal,
                text: {
                    query: searchQuery,
                    path: {
                        wildcard: '*',
                    },
                },
            },
        },
        {
            $match: matchCondition,
        },
        {
            $project: project,
        },
        {
            $facet: {
                paginatedResults: [
                    { $skip: skip },
                    { $limit: limit },
                ],
                pageInfo: [
                    { $group: { _id: null, count: { $sum: 1 } } },
                ],
            },
        },
    ]);
    return result;
};

const setUserActionCount = async(indexType, updateId, field, value, recordType = 'Record') => {
    const checkRecordExists = await checkExists(indexType, { _id: updateId });
    if (!checkRecordExists || !checkRecordExists._id) {
        throw boom.notFound(`Invalid ${recordType}`);
    }
    const updateCondition = {
        _id: updateId,
    };
    const updateParams = {
        $inc: {},
    };
    updateParams.$inc[field] = value;
    await updateOneService(indexType, updateCondition, updateParams);
};

module.exports = {
    checkExists,
    addService,
    bulkCreateService,
    listService,
    updateOneService,
    updateManyService,
    deleteService,
    searchService,
    searchPostService,
    searchUserService,
    searchIndexService,
    ObjectId,
    setUserActionCount,
};