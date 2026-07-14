const twilio = require('twilio');
const { consultarExpediente } = require('../services/apiPresidenciaService');
const { normalizarExpediente } = require('../utils/expediente');

const sayOptions = { language: 'es-MX', voice: 'Polly.Mia' };

const properCase = (text = '') =>
  String(text)
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

const sendTwiml = (res, response) => {
  res.type('text/xml');
  return res.send(response.toString());
};

const iniciarIVR = (_req, res) => {
  const response = new twilio.twiml.VoiceResponse();
  response.say(sayOptions, 'Bienvenido a DP Te Responde 24 horas, servicio de consulta de expedientes.');
  const gather = response.gather({
    action: '/api/voice/confirmar-expediente',
    method: 'POST',
    finishOnKey: '#',
    input: 'dtmf',
    timeout: 10
  });
  gather.say(sayOptions, 'Marque su número de expediente, sin guion, y luego presione la tecla numeral.');
  response.redirect({ method: 'POST' }, '/api/voice/inicio');
  return sendTwiml(res, response);
};

const confirmarExpediente = (req, res) => {
  const raw = String(req.body.Digits || '').replace(/\D/g, '');
  if (!raw) return iniciarIVR(req, res);

  const expediente = normalizarExpediente(raw);
  const response = new twilio.twiml.VoiceResponse();
  response.say(sayOptions, `Usted ingresó ${raw.split('').join(' ')}.`);
  const gather = response.gather({
    action: `/api/voice/menu-confirmacion?expediente=${encodeURIComponent(expediente)}`,
    method: 'POST',
    numDigits: 1,
    timeout: 8
  });
  gather.say(sayOptions, 'Si es correcto, presione 1. Para corregirlo, presione 2.');
  response.redirect({ method: 'POST' }, '/api/voice/inicio');
  return sendTwiml(res, response);
};

const menuConfirmacion = (req, res) => {
  const seleccion = String(req.body.Digits || '');
  const expediente = String(req.query.expediente || '');
  const response = new twilio.twiml.VoiceResponse();

  if (seleccion === '2') {
    response.redirect({ method: 'POST' }, '/api/voice/inicio');
    return sendTwiml(res, response);
  }

  if (seleccion !== '1') {
    response.say(sayOptions, 'Opción no válida.');
    response.redirect({ method: 'POST' }, `/api/voice/confirmar-expediente`);
    return sendTwiml(res, response);
  }

  const gather = response.gather({
    action: `/api/voice/consultar-estado?expediente=${encodeURIComponent(expediente)}`,
    method: 'POST',
    finishOnKey: '#',
    input: 'dtmf',
    timeout: 10
  });
  gather.say(sayOptions, 'Ahora marque su clave de cuatro dígitos y luego presione la tecla numeral.');
  response.redirect({ method: 'POST' }, '/api/voice/inicio');
  return sendTwiml(res, response);
};

const consultarYResponder = async (req, res) => {
  const clave = String(req.body.Digits || '').replace(/\D/g, '');
  const expediente = normalizarExpediente(req.query.expediente || '');
  const response = new twilio.twiml.VoiceResponse();

  const resultado = await consultarExpediente(expediente, clave);
  if (Number(resultado?.codigo_estado) === 200 && resultado?.data) {
    const d = resultado.data;
    response.say(
      sayOptions,
      `Gracias por esperar, ${properCase(d.administrado)}. Su trámite de ${d.tramite} se encuentra en ${d.estado_actual}. ${d.detalle_estado}. El plazo estimado informado es de ${d.tiempo_estimado_resolucion_dias} días. Gracias por llamar.`
    );
    response.hangup();
    return sendTwiml(res, response);
  }

  response.say(sayOptions, 'Los datos ingresados no pudieron ser validados.');
  const gather = response.gather({
    action: `/api/voice/menu-error?expediente=${encodeURIComponent(expediente)}`,
    method: 'POST',
    numDigits: 1,
    timeout: 8
  });
  gather.say(sayOptions, 'Para volver a ingresar la clave, presione 1. Para empezar de nuevo, presione 2.');
  response.hangup();
  return sendTwiml(res, response);
};

const menuError = (req, res) => {
  const seleccion = String(req.body.Digits || '');
  const expediente = String(req.query.expediente || '');
  const response = new twilio.twiml.VoiceResponse();

  if (seleccion === '1') {
    const gather = response.gather({
      action: `/api/voice/consultar-estado?expediente=${encodeURIComponent(expediente)}`,
      method: 'POST',
      finishOnKey: '#',
      input: 'dtmf'
    });
    gather.say(sayOptions, 'Marque nuevamente su clave de cuatro dígitos y luego presione numeral.');
  } else {
    response.redirect({ method: 'POST' }, '/api/voice/inicio');
  }

  return sendTwiml(res, response);
};

module.exports = { iniciarIVR, confirmarExpediente, menuConfirmacion, consultarYResponder, menuError };
