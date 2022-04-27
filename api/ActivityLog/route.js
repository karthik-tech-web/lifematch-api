const express = require('express');
const trimRequest = require('trim-request');

const router = express.Router();
const { celebrate } = require('celebrate');
const c = require('../../system/utils/controller-handler');
const schema = require('./schema');
const controller = require('./controller');

router.post('/', trimRequest.body, celebrate(schema.addActivity, schema.options), c(controller.addActivity, (req) => [req.body]));

router.get('/:userId/list', celebrate(schema.listActivity, schema.options), c(controller.listActivity, (req) => [req.params, req.query]));

router.delete('/:userId', celebrate(schema.deleteActivity, schema.options), c(controller.deleteActivity, (req) => [req.params]));

module.exports = router;