/* eslint-disable no-unused-vars */
const express = require('express');
const trimRequest = require('trim-request');

const router = express.Router();
const { celebrate } = require('celebrate');
const c = require('../../system/utils/controller-handler');
const controller = require('./controller');
const schema = require('./schema');

router.post('/register', trimRequest.body, celebrate(schema.createUser, schema.options), c(controller.createUser, (req, res, next) => [req.query.tenantId, req.body, req.tenantMetaData]));

router.post('/login', trimRequest.body, celebrate(schema.userLogin, schema.options), c(controller.userLogin, (req, res, next) => [req.query.tenantId, req.body]));

router.post('/reset-password', trimRequest.body, celebrate(schema.resetPassword, schema.options), c(controller.resetPassword, (req, res, next) => [req.query.tenantId, req.body]));

router.post('/forgot-password', celebrate(schema.forgotPassword, schema.options), c(controller.forgotPassword, (req, res, next) => [req.query.tenantId, req.body, req.tenantMetaData]));

router.get('/forgot-password-verify', celebrate(schema.forgetPasswordVerify, schema.options), c(controller.forgotPasswordVerify, (req, res, next) => [req.query.tenantId, req.query]));

router.post('/update-forgot-password', trimRequest.body, celebrate(schema.updateForgotPassword, schema.options), c(controller.updateForgotPassword, (req, res, next) => [req.query.tenantId, req.body]));

router.post('/mail-verification', celebrate(schema.userVerification, schema.options), c(controller.userVerification, (req, res, next) => [req.query.tenantId, req.body]));

router.post('/resend-verification-mail', celebrate(schema.resendEmailVerification, schema.options), c(controller.userVerificationviaMail, (req, res, next) => [req.query.tenantId, req.body, req.tenantMetaData]));

router.get('/:email', celebrate(schema.getUserFromEmail, schema.options), c(controller.getUserFromEmail, (req) => [req.query.tenantId, req.params]));

module.exports = router;