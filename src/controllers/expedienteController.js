const { consultarExpediente } = require('../services/apiPresidenciaService');

const getExpediente = async (req, res) => {
  const { usuario, clave } = req.consulta;
  const resultado = await consultarExpediente(usuario, clave);
  const status = Number(resultado?.codigo_estado) || 500;
  const httpStatus = status >= 400 && status <= 599 ? status : 200;
  return res.status(httpStatus).json(resultado);
};

module.exports = { getExpediente };
