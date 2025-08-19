'use client'

import { LicenseInfo } from '@mui/x-license'

/**
 * Sets the MUI X license key on the client. Reads from NEXT_PUBLIC_MUI_X_LICENSE_KEY.
 * Render once near the root to remove watermarks/console warnings for Pro/Premium packages.
 */
export default function MuiXLicense() {
  return null
}

// Activate license at module evaluation time on the client (recommended by MUI X)
const key = process.env.NEXT_PUBLIC_MUI_X_LICENSE_KEY

if (typeof window !== 'undefined') {
  if (key) {
    LicenseInfo.setLicenseKey(key)
  } else if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.warn(
      '[MUI X] Falta la variable NEXT_PUBLIC_MUI_X_LICENSE_KEY. Se mostrará watermark/aviso si usas paquetes Pro/Premium.'
    )
  }

  // Telemetry opt-in: deshabilitado por defecto; habilítalo en dev con NEXT_PUBLIC_MUI_X_TELEMETRY_DISABLED=false
  const isDev = process.env.NODE_ENV !== 'production'
  const telemetryDisabledEnv = process.env.NEXT_PUBLIC_MUI_X_TELEMETRY_DISABLED
  const telemetryDebugEnv = process.env.NEXT_PUBLIC_MUI_X_TELEMETRY_DEBUG

  if (isDev) {
    if (typeof telemetryDisabledEnv !== 'undefined') {
      // false/0 => habilita; cualquier otro valor => deshabilita
      ;(globalThis as any).__MUI_X_TELEMETRY_DISABLED__ = !['false', '0'].includes(String(telemetryDisabledEnv))
    }

    if (telemetryDebugEnv === 'true' || telemetryDebugEnv === '1') {
      ;(globalThis as any).__MUI_X_TELEMETRY_DEBUG__ = true
      // eslint-disable-next-line no-console
      console.info('[MUI X] Telemetry: debug habilitado (si es compatible con la versión instalada).')
    }
  }
}
