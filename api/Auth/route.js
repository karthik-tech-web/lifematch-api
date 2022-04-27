/* eslint-disable no-unused-vars */
const express = require('express');
const trimRequest = require('trim-request');
const multer = require('multer');
const path = require('path');

const router = express.Router();
const { celebrate } = require('celebrate');
const c = require('../../system/utils/controller-handler');
const controller = require('./controller');
const schema = require('./schema');

const storage = multer.diskStorage({
    filename(req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    },
});
const upload = multer({ storage });

router.post('/google-auth', celebrate(schema.googleAuth, schema.options), c.json(controller.googleAuth, (req) => [req.query.tenantId, req.body]));

router.get('/redirecturl', celebrate(schema.redirectUrl, schema.options), c.json(controller.getRedirectUrl, (req) => [req.query.tenantId]));

router.post('/visitorRegistration', trimRequest.body, celebrate(schema.visitorRegistration, schema.options), c.json(controller.visitorRegistration, (req) => [req.query.tenantId, req.body, req.clientIp]));

router.post('/register', trimRequest.body, celebrate(schema.createUser, schema.options), c.json(controller.createUser, (req, res, next) => [req.query.tenantId, req.body, req.tenantMetaData]));

router.post('/login', trimRequest.body, celebrate(schema.userLogin, schema.options), c.json(controller.userLogin, (req, res, next) => [req.query.tenantId, req.body]));

router.post('/reset-password', trimRequest.body, celebrate(schema.resetPassword, schema.options), c.json(controller.resetPassword, (req, res, next) => [req.query.tenantId, req.body]));

router.post('/forgot-password', celebrate(schema.forgotPassword, schema.options), c.json(controller.forgotPassword, (req, res, next) => [req.query.tenantId, req.body, req.tenantMetaData]));

router.get('/forgot-password-verify', celebrate(schema.forgetPasswordVerify, schema.options), c.json(controller.forgotPasswordVerify, (req, res, next) => [req.query.tenantId, req.query]));

router.post('/update-forgot-password', trimRequest.body, celebrate(schema.updateForgotPassword, schema.options), c.json(controller.updateForgotPassword, (req, res, next) => [req.query.tenantId, req.body]));

router.post('/guard-check', celebrate(schema.guardCheck, schema.options), c.json(controller.guardCheck, (req, res, next) => [req.query.tenantId, req.body]));

router.post('/mail-verification', celebrate(schema.userVerification, schema.options), c.json(controller.userVerification, (req, res, next) => [req.query.tenantId, req.body]));

router.post('/resend-verification-mail', celebrate(schema.resendEmailVerification, schema.options), c.json(controller.userVerificationviaMail, (req, res, next) => [req.query.tenantId, req.body, req.tenantMetaData]));

router.get('/:email', celebrate(schema.getUserFromEmail, schema.options), c.json(controller.getUserFromEmail, (req) => [req.query.tenantId, req.params]));

router.get('/:survey_id/detail', celebrate(schema.viewSurvey, schema.options), c.json(controller.viewSurvey, (req) => [req.query.tenantId, req.params]));

router.get('/detail/:location_id', celebrate(schema.locationDetail, schema.options), c.json(controller.locationDetail, (req) => [req.query.tenantId, req.params, req.body]));

router.post('/twoway-authentication', celebrate(schema.twoFactorAuthentication, schema.options), c.json(controller.twoFactorAuthentication, (req) => [req.query.tenantId, req.body]));

router.post('/user-exist', celebrate(schema.userExist, schema.options), c.json(controller.checkUserExist, (req) => [req.query.tenantId, req.body]));

const cpUpload = upload.fields([{ name: 'pdf_attachment', maxCount: 1 }, { name: 'q_file', maxCount: 1 }]);
router.post('/notify-email/:location_id', cpUpload, celebrate(schema.notifyEmail, schema.options), c.json(controller.notifyEmail, (req) => [req.query.tenantId, req.params, req.files, req.tenantMetaData, req.query]));
module.exports = router;