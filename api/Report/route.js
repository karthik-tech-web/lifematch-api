/* eslint-disable no-unused-vars */
const express = require('express');

const router = express.Router();
const { celebrate } = require('celebrate');
const c = require('../../system/utils/controller-handler');
const schema = require('./schema');
const controller = require('./controller');

router.get('/', celebrate(schema.getReport, schema.options), c(controller.getReport, (req, res, next) => [req.query]));

router.post('/send-report', celebrate(schema.sendReport, schema.options), c(controller.sendReport, (req, res, next) => [req.body]));

module.exports = router;