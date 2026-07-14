# Deploy correcto en Vercel

## Configuración del proyecto

- Root Directory: `backend-dp`
- Framework Preset: `Express`
- Build Command: sin override
- Output Directory: sin override
- Install Command: sin override

El archivo `vercel.json` fuerza el preset `express`:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "express"
}
```

No borrar `index.js`, `server.js` ni `src/app.js`.

## Variables iniciales

- `NODE_ENV=production`
- `USE_MOCK_EXPEDIENTE=true`
- `TWILIO_MOCK_MODE=true`
- `TWILIO_VALIDATE_WEBHOOKS=false`
- `CORS_ORIGINS=*`
- `API_TIMEOUT_MS=10000`
- `PUBLIC_BASE_URL=https://TU-PROYECTO.vercel.app`

## Pruebas

- `/`
- `/api/health`
