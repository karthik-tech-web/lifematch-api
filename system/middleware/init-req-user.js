const isEmpty = require('lodash.isempty');
const boom = require('@hapi/boom');
const userService = require('../../api/User/service');
const logger = require('../utils/logger');
const utilsDatatime = require('../../system/utils/datetime');

module.exports = async (req, res, next) => {
    try {
        let requestor = {};
        const fbUid = req.user.sub;
        requestor = await userService.getByFbUid(fbUid);
        if (isEmpty(requestor)) {
            return next(boom.unauthorized('Unauthorised requestor!'));
        }
        req.user.role = requestor.role;
        req.user.subscriptionPlan = requestor.subscriptionPlan;
        req.req_user = requestor;
        const updateParams = {
            user_id: requestor._id,
            lastAPICallAt: utilsDatatime.getCurrentUnixTimestamp(),
            online: true
        };
        await userService.update(updateParams);
    } catch (error) {
        logger(error);
        next(boom.unauthorized('Unauthorised requestor'));
    }
    next();
};