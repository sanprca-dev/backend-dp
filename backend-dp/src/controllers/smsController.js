const twilio = require('twilio');
const { consultarExpediente } = require('../services/apiPresidenciaService');
const { enviarSMS, realizarLlamadaVoz } = require('../services/twilioService');
const { normalizarExpediente } = require('../utils/expediente');

const properCase = (text = '') =>
  String(text)
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

const smsResponse = (res, message) => {
  const response = new twilio.twiml.MessagingResponse();
  response.message(message);
  res.type('text/xml');
  return res.send(response.toString());
};

const consultaSMS = async (req, res) => {
  const { usuario, clave } = req.consulta;
  const telefono = String(req.body.telefono || '').trim();
  const tipo = String(req.body.tipo || 'sms').toLowerCase();

  if (!/^\+[1-9]\d{7,14}$/.test(telefono)) {
    return res.status(400).json({ success: false, error: 'El teléfono debe estar en formato internacional E.164, por ejemplo +51987654321.' });
  }

  if (!['sms', 'voz'].includes(tipo)) {
    return res.status(400).json({ success: false, error: 'El tipo debe ser sms o voz.' });
  }

  const resultado = await consultarExpediente(usuario, clave);
  if (Number(resultado?.codigo_estado) !== 200 || !resultado?.data) {
    const status = Number(resultado?.codigo_estado) >= 500 ? 503 : 404;
    return res.status(status).json({ success: false, error: resultado?.mensaje || 'Expediente no encontrado.' });
  }

  const d = resultado.data;
  const nombre = properCase(d.administrado).split(' ').slice(0, 2).join(' ');
  const mensajeSMS = `DP 24/7: ${nombre}, exp. ${d.numero_expediente}: ${d.estado_actual}. Plazo estimado: ${d.tiempo_estimado_resolucion_dias} días.`;

  const entrega = tipo === 'voz'
    ? await realizarLlamadaVoz(
        telefono,
        `Hola ${properCase(d.administrado)}. Su trámite ${d.tramite} está ${d.estado_actual}. ${d.detalle_estado}. Plazo estimado: ${d.tiempo_estimado_resolucion_dias} días.`
      )
    : await enviarSMS(telefono, mensajeSMS);

  return res.json({
    success: true,
    canal: tipo,
    sid: entrega.sid,
    mock: Boolean(entrega.mock),
    mensaje: tipo === 'voz' ? 'Llamada solicitada correctamente.' : 'SMS enviado correctamente.'
  });
};

const recibirSMS = async (req, res) => {
  const body = String(req.body.Body || '').trim();

  if (!body || /^(hola|inicio|ayuda)$/i.test(body)) {
    return smsResponse(
      res,
      'DP Te Responde 24/7. Envíe su expediente y clave en un solo mensaje. Ejemplo: 2026-0004721 1548'
    );
  }

  const match = body.match(/(\d{4}-?\d{7})\s+(\d{4})/);
  if (!match) {
    return smsResponse(
      res,
      'Formato no reconocido. Envíe: EXPEDIENTE CLAVE. Ejemplo: 2026-0004721 1548'
    );
  }

  const expediente = normalizarExpediente(match[1]);
  const clave = match[2];
  const resultado = await consultarExpediente(expediente, clave);

  if (Number(resultado?.codigo_estado) !== 200 || !resultado?.data) {
    return smsResponse(res, 'No pudimos validar el expediente y la clave. Revise los datos e intente nuevamente.');
  }

  const d = resultado.data;
  return smsResponse(
    res,
    `Exp. ${d.numero_expediente}: ${d.estado_actual}. ${d.detalle_estado} Plazo estimado: ${d.tiempo_estimado_resolucion_dias} días.`
  );
};

module.exports = { consultaSMS, recibirSMS };
