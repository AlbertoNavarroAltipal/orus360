// src/app/[lang]/(dashboard)/(private)/legalizacion-gastos-y-anticipos/administracion/conceptos/page.tsx
import * as React from 'react'

import ConceptosView, { type Concept } from '@views/legalizacion-gastos-y-anticipos/administracion/conceptos'

export default async function Page() {
  const initialRows: Concept[] = [] // placeholder para el primer render

  return <ConceptosView initialRows={initialRows} />
}
