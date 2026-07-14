const express = require('express');
const { consultaSMS, recibirSMS } = require('../controllers/smsController');
const { validateConsulta } = require('../middleware/validateConsulta');
const { validateTwilioWebhook } = require('../middleware/validateTwilioWebhook');

const router = express.Router();
router.post('/consulta', validateConsulta, consultaSMS);
router.post('/incoming', validateTwilioWebhook, recibirSMS);
module.exports = router;
