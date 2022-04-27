/* eslint-disable no-unused-vars */
const express = require('express');

const router = express.Router();
const { celebrate } = require('celebrate');
const c = require('../../system/utils/controller-handler');
const schema = require('./schema');
const controller = require('./controller');
const fileUpload = require('../../system/middleware/process-upload');

router.get('/profile-details/:profileId', celebrate(schema.getProfileDetails, schema.options), c(controller.getProfileDetails, (req, res, next) => [req.params, req.query]));

router.get('/:data/:type', celebrate(schema.getUserDetails, schema.options), c(controller.getUserDetails, (req, res, next) => [req.params]));

const imageField = [{ name: 'image', maxCount: 2 }];
router.put('/profile-image/:userId', fileUpload('PROFILE_IMAGE', imageField), celebrate(schema.profileImageUpdate, schema.options), c(controller.updateProfileImage, (req, res, next) => [req.params, req.files]));

router.delete('/profile-image/:userId', celebrate(schema.profileImageUpdate, schema.options), c(controller.removeProfileImage, (req, res, next) => [req.params]));

router.put('/:userId', celebrate(schema.updateUser, schema.options), c(controller.updateUser, (req, res, next) => [req.params, req.body]));

router.put('/reset-password/:userId', celebrate(schema.updatePassword, schema.options), c(controller.updatePassword, (req, res, next) => [req.params, req.body]));

module.exports = router;