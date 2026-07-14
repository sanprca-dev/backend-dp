const express = require('express');
const { getExpediente } = require('../controllers/expedienteController');
const { validateConsulta } = require('../middleware/validateConsulta');

const router = express.Router();
router.post('/', validateConsulta, getExpediente);
module.exports = router;
