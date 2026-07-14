const normalizarExpediente = (value = '') => {
  const cleaned = String(value).trim().replace(/\s+/g, '');
  if (/^\d{4}-\d+$/.test(cleaned)) return cleaned;
  const digits = cleaned.replace(/\D/g, '');
  if (digits.length <= 4) return cleaned;
  return `${digits.slice(0, 4)}-${digits.slice(4)}`;
};

const normalizarClave = (value = '') => String(value).trim();

const obtenerCredenciales = (body = {}) => ({
  usuario: normalizarExpediente(body.usuario || body.numero_expediente || body.expediente || ''),
  clave: normalizarClave(body.clave || '')
});

module.exports = { normalizarExpediente, normalizarClave, obtenerCredenciales };
