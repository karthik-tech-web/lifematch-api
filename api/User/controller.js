const boom = require('@hapi/boom');
const mongoose = require('mongoose');
const isEmpty = require('lodash.isempty');
const authenticator = require('authenticator');
const { google } = require('googleapis');
const service = require('./service');
const dbService = require('../../system/db/dbService');
const firebaseApi = require('../../system/lib/firebase/index');
const stringConfig = require('../../system/utils/config');
const jwtAuth = require('../../system/utils/jwt-auth');
const aws = require('../../system/lib/aws/index');
// const sendMail = require('../../system/sendmail/index');
// const configController = require('../Config/controller');
// const utilsChecks = require('../../system/utils/checks');4

const { ObjectId } = mongoose.Types;

const getUserDetails = async(params) => {
    // const getParamsValue = { 1: '_id', 2: 'firebaseUid', 3: 'email' };
    const getParams = {};
    if (params.type === 1) {
        getParams._id = params.data;
    } else if (params.type === 2) {
        getParams.firebaseUid = params.data;
    }
    const detail = await dbService.checkExists('User', getParams);
    if (!detail) {
        throw boom.notFound('No User Found');
    }
    const result = {
        status: 200,
        message: 'User Detail',
        detail: [detail],
    };
    return result;
};

const updateUser = async(pathParams, params = {}) => {
    if (params && Object.keys(params).length === 0) {
        throw boom.notFound('No Update Parameters are Found');
    }
    const getUserParams = {
        _id: pathParams.userId,
    };
    const user = await dbService.checkExists('User', getUserParams);
    if (isEmpty(user)) {
        throw boom.notFound('User does not exist');
    }
    const updateDetails = await dbService.updateOneService('User', getUserParams, params);
    const result = {
        status: 200,
        message: 'User updated Successfully',
        detail: [updateDetails],
    };
    return result;
};

const updateProfileImage = async(pathParams, fileParams = {}) => {
    if (fileParams && Object.keys(fileParams).length === 0) {
        throw boom.notFound('No Update Parameters are Found');
    }
    const getUserParams = {
        _id: pathParams.userId,
    };
    const user = await dbService.checkExists('User', getUserParams);
    if (isEmpty(user)) {
        throw boom.notFound('User does not edeleteFileURLxist');
    }
    const updateParams = {
        photoUrl: `profile-uploads/${fileParams.image[0].filename}`,
    };
    const updateDetails = await dbService.updateOneService('User', getUserParams, updateParams);
    const result = {
        status: 200,
        message: 'Profile Image updated Successfully',
        detail: [updateDetails],
    };
    return result;
};

const removeProfileImage = async(pathParams) => {
    const getUserParams = {
        _id: pathParams.userId,
    };
    const user = await dbService.checkExists('User', getUserParams);
    if (isEmpty(user)) {
        throw boom.notFound('User does not exist');
    }
    const updateParams = {
        photoUrl: null,
        storageType: 1,
    };
    if (user.storageType === '2' && user.photoUrl) {
        await aws.deleteFileURL(user.photoUrl);
    }
    const updateDetails = await dbService.updateOneService('User', getUserParams, updateParams);
    const result = {
        status: 200,
        message: 'Profile Image Removed Successfully',
        detail: [updateDetails],
    };
    return result;
};

const getProfileDetails = async(params, queryParams) => {
    const matchCondition = {};
    matchCondition.match1 = {
        _id: ObjectId(params.profileId.toString()),
    };
    matchCondition.loggedInUserId = queryParams.loggedInUserId;
    const detail = await service.userDetails(matchCondition);
    if (isEmpty(detail)) {
        throw boom.notFound('No User Found');
    }
    const result = {
        status: 200,
        message: 'User Detail',
        detail,
    };
    return result;
};

const updatePassword = async(params, bodyParams) => {
    if (!stringConfig.passwordValidation(bodyParams.newPassword)) {
        throw boom.badRequest('Enter Strong Password');
    }
    const matchCondition = {};
    if (bodyParams.newPassword !== bodyParams.confirmPassword) {
        throw boom.badRequest('Password Does not Match');
    }
    if (bodyParams.type === 1) {
        matchCondition._id = params.userId;
    } else if (bodyParams.type === 2) {
        matchCondition.firebaseUid = params.userId;
    }
    const userDetail = await dbService.checkExists('User', matchCondition);
    if (!userDetail || !userDetail._id || !userDetail.firebaseUid) {
        throw boom.notFound('Invalid User');
    }
    if (userDetail.providerType.indexOf('email') === -1) {
        throw boom.badRequest('Password Will Reset for Email Signed IN User Only.');
    }
    await firebaseApi.resetUserPassword(userDetail.firebaseUid, bodyParams.newPassword);
    const result = {
        status: 200,
        message: 'Password Reset Done Successfully',
    };
    return result;
};

module.exports = {
    getUserDetails,
    updateUser,
    getProfileDetails,
    updateProfileImage,
    updatePassword,
    removeProfileImage,
};