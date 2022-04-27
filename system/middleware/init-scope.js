/* eslint-disable no-restricted-syntax */
// const isEmpty = require('lodash.isempty');
// const boom = require('@hapi/boom');

module.exports = async(req, res, next) => {
    const routeParts = req.path.split('/');
    const transformedPath = [];
    for (const part of routeParts) {
        if (part.match('^\\d+$') || part.match('^[u|t|f|ui][a-z0-9.]{12,32}$')) {
            transformedPath.push(':param');
        } else {
            transformedPath.push(part);
        }
    }
    const temp = req.method + transformedPath.join('/');
    req.bvEndpoint = temp.replace(/\/$/, '');
    next();
};