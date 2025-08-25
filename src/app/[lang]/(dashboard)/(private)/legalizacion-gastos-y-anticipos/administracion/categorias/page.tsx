// /src/app/[lang]/(dashboard)/(private)/legalizacion-gastos-y-anticipos/administracion/categorias/page.tsx
import * as React from 'react'

import CategoriasView, { type Category } from '@views/legalizacion-gastos-y-anticipos/administracion/categorias'

// Si quieres usar server actions reales, crea algo como getCategorias() en '@/app/server/actions'
/*
import { getCategorias } from '@/app/server/actions'
*/

export default async function Page() {
  // const initialRows: Category[] = await getCategorias()
  const initialRows: Category[] = [] // placeholder

  return <CategoriasView initialRows={initialRows} />
}
