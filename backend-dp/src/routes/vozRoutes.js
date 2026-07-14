const express = require('express');
const voz = require('../controllers/vozController');
const { validateTwilioWebhook } = require('../middleware/validateTwilioWebhook');

const router = express.Router();
router.use(validateTwilioWebhook);
router.post('/inicio', voz.iniciarIVR);
router.post('/confirmar-expediente', voz.confirmarExpediente);
router.post('/menu-confirmacion', voz.menuConfirmacion);
router.post('/consultar-estado', voz.consultarYResponder);
router.post('/menu-error', voz.menuError);
module.exports = router;
