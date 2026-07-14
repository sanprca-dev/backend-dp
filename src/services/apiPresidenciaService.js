const axios = require('axios');
const { config } = require('../config/env');

const MOCK = {
  codigo_estado: 200,
  mensaje: 'Consulta procesada exitosamente en modo de demostración.',
  data: {
    numero_expediente: '2026-0004721',
    tramite: 'Denuncia Administrativa',
    administrado: 'PAREDES RIOS CARLOS EDUARDO',
    estado_actual: 'EN PROCESO',
    detalle_estado: 'Su expediente se encuentra en proceso de evaluación por el área correspondiente del Despacho Presidencial.',
    origen_canal: 'Asistente Virtual IA - Canal Ligero',
    ultima_actualizacion: '2026-06-14 23:55:59',
    tiempo_estimado_resolucion_dias: 7
  }
};

const consultarMock = (usuario, clave) => {
  if (usuario === '2026-0004721' && clave === '1548') return MOCK;
  return { codigo_estado: 404, mensaje: 'Expediente o clave incorrectos.', data: null };
};

const consultarExpediente = async (usuario, clave) => {
  if (config.useMockExpediente) return consultarMock(usuario, clave);

  if (!config.apiDP) {
    return { codigo_estado: 503, mensaje: 'El servicio externo de expedientes no está configurado.', data: null };
  }

  try {
    const response = await axios.post(
      config.apiDP,
      { usuario, clave },
      {
        timeout: config.apiTimeoutMs,
        headers: { 'Content-Type': 'application/json' },
        validateStatus: () => true
      }
    );

    if (!response.data || typeof response.data !== 'object') {
      return { codigo_estado: 502, mensaje: 'El servicio externo devolvió una respuesta inválida.', data: null };
    }

    return response.data;
  } catch (error) {
    console.error('[API_DP] Error de conexión:', error.code || error.message);
    return { codigo_estado: 503, mensaje: 'No fue posible conectar con el servicio de expedientes.', data: null };
  }
};

module.exports = { consultarExpediente };
