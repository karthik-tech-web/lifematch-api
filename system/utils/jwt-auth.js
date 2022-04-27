// const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const boom = require('@hapi/boom');

const tokenCreation = async(payload, secretSalt, options = {}) => {
    const token = jwt.sign(payload, secretSalt, options);
    return token;
};

const tokenCreationWithExpiryOnly = async(payload, secretSalt, expirytime) => {
    const options = { expiresIn: expirytime };
    const token = jwt.sign(payload, secretSalt, options);
    return token;
};

const tokenVerify = async(secretToken, SecretSalt) => {
    try {
        jwt.verify(secretToken, SecretSalt);
    } catch (err) {
        throw boom.unauthorized('Link Expired');
    }
    const decoded = jwt.decode(secretToken, {
        complete: true,
    });
    return decoded;
};

module.exports = {
    tokenCreation,
    tokenCreationWithExpiryOnly,
    tokenVerify,
};