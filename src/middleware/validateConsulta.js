const { obtenerCredenciales } = require('../utils/expediente');

const validateConsulta = (req, res, next) => {
  const { usuario, clave } = obtenerCredenciales(req.body);

  if (!usuario || !clave) {
    return res.status(400).json({
      codigo_estado: 400,
      mensaje: 'El número de expediente y la clave son obligatorios.',
      data: null
    });
  }

  if (!/^\d{4}-\d{7}$/.test(usuario)) {
    return res.status(400).json({
      codigo_estado: 400,
      mensaje: 'Formato de expediente inválido. Use, por ejemplo, 2026-0004721.',
      data: null
    });
  }

  if (!/^\d{4}$/.test(clave)) {
    return res.status(400).json({
      codigo_estado: 400,
      mensaje: 'La clave debe contener exactamente 4 dígitos.',
      data: null
    });
  }

  req.consulta = { usuario, clave };
  return next();
};

module.exports = { validateConsulta };
