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
}
