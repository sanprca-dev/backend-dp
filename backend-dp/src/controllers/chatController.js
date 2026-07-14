const { consultarExpediente } = require('../services/apiPresidenciaService');
const { consultarIA } = require('../services/ollamaService');

const getChatResponse = async (req, res) => {
  const { usuario, clave } = req.consulta;
  const pregunta = String(req.body.pregunta || '¿Cuál es el estado de mi expediente?').trim();

  const resultado = await consultarExpediente(usuario, clave);
  if (Number(resultado?.codigo_estado) !== 200 || !resultado?.data) {
    return res.status(404).json({ respuesta: resultado?.mensaje || 'No se encontró el expediente.' });
  }

  const expediente = resultado.data;
  const prompt = [
    'Eres un asistente de orientación sobre expedientes.',
    'Responde únicamente con la información del JSON suministrado.',
    'No inventes fechas, causas, plazos ni normas.',
    `EXPEDIENTE: ${JSON.stringify(expediente)}`,
    `PREGUNTA: ${pregunta}`
  ].join('\n');

  const respuesta = await consultarIA(prompt, expediente);
  return res.json({ respuesta, expediente });
};

module.exports = { getChatResponse };
