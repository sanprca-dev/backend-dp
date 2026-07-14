const twilio = require('twilio');
const { config } = require('../config/env');

const hasTwilioConfig = Boolean(
  config.twilioAccountSid && config.twilioAuthToken && config.twilioPhoneNumber
);

const client = hasTwilioConfig
  ? twilio(config.twilioAccountSid, config.twilioAuthToken)
  : null;

const unavailableError = () => {
  const error = new Error('Twilio no está configurado en este entorno.');
  error.statusCode = 503;
  return error;
};

const enviarSMS = async (telefono, mensaje) => {
  if (!client) {
    if (!config.twilioMockMode) throw unavailableError();
    console.log('[TWILIO][MOCK] SMS simulado.');
    return { sid: 'MOCK-SMS', to: telefono, body: mensaje, mock: true };
  }

  return client.messages.create({
    body: mensaje,
    from: config.twilioPhoneNumber,
    to: telefono
  });
};

const realizarLlamadaVoz = async (telefono, mensaje) => {
  if (!client) {
    if (!config.twilioMockMode) throw unavailableError();
    console.log('[TWILIO][MOCK] Llamada simulada.');
    return { sid: 'MOCK-CALL', to: telefono, mock: true };
  }

  const response = new twilio.twiml.VoiceResponse();
  response.say({ language: 'es-MX', voice: 'Polly.Mia' }, mensaje);

  return client.calls.create({
    twiml: response.toString(),
    to: telefono,
    from: config.twilioPhoneNumber
  });
};

module.exports = { enviarSMS, realizarLlamadaVoz };
