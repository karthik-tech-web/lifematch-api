const boom = require('@hapi/boom');
const dbService = require('../db/dbService');
// const utilsChecks = require('../utils/checks');

const userAuthorize = (paramType, fieldName) => async(req, res, next) => {
    try {
        if (!req[paramType] || !req[paramType][fieldName]) {
            next(boom.badRequest('Invalid Request param or field'));
        }
        const userDetails = await dbService.checkExists('User', { _id: req[paramType][fieldName] });
        if (!userDetails || !userDetails._id) {
            next(boom.badRequest('Invalid UserId'));
        } else if (userDetails.firebaseUid !== req.userMeta.uid) {
            next(boom.badRequest('Unauthorized User Access'));
        }
        next();
    } catch (err) {
        // eslint-disable-next-line no-console
        console.log(err);
        next(boom.internal('Something went wrong.'));
    }
};

module.exports = { userAuthorize };