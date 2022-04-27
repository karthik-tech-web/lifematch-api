/* eslint-disable no-unused-vars */
const express = require('express');

const router = express.Router();
const { celebrate } = require('celebrate');
const c = require('../../system/utils/controller-handler');
const schema = require('./schema');
const controller = require('./controller');

router.post('/', celebrate(schema.initiatePayment, schema.options), c(controller.initiatePayment, (req, res, next) => [req.body]));

router.put('/', celebrate(schema.successPayment, schema.options), c(controller.successPayment, (req, res, next) => [req.body]));

module.exports = router;