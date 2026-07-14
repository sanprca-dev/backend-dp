const express = require('express');
const { getChatResponse } = require('../controllers/chatController');
const { validateConsulta } = require('../middleware/validateConsulta');

const router = express.Router();
router.post('/', validateConsulta, getChatResponse);
module.exports = router;
