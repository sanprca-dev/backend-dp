const axios = require('axios');
const { config } = require('../config/env');

const respuestaFallback = (expediente) => {
  const dias = expediente.tiempo_estimado_resolucion_dias;
  const plazo = dias ? ` El tiempo estimado informado es de ${dias} días.` : '';
  return `Su expediente se encuentra en estado ${expediente.estado_actual}. ${expediente.detalle_estado}.${plazo}`;
};

const consultarIA = async (prompt, expediente) => {
  if (!config.ollamaURL || !config.ollamaModel) return respuestaFallback(expediente);

  try {
    const response = await axios.post(
      `${config.ollamaURL.replace(/\/$/, '')}/api/generate`,
      { model: config.ollamaModel, prompt, stream: false },
      { timeout: 15000 }
    );
    return response.data?.response || respuestaFallback(expediente);
  } catch (error) {
    console.error('[OLLAMA] No disponible:', error.code || error.message);
    return respuestaFallback(expediente);
  }
};

module.exports = { consultarIA };
