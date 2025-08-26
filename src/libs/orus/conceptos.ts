// src/libs/orus/conceptos.ts

export type ListConceptParams = {
  page?: number
  limit?: number
  orderBy?: 'concepto' | 'created_at'
  order?: 'asc' | 'desc'
  estado?: boolean | ''
  search?: string
  categoria_proyecto?: string | number | ''
}

const base = process.env.NEXT_PUBLIC_URL_ORUS_API as string

const authHeader = (token: string) => ({
  Authorization: `Bearer ${token}`
})

/** Errores estándar NestJS de tu backend */
export type OrusError = {
  statusCode: number
  timestamp?: string
  path?: string
  method?: string
  message: string | string[]
}

/** -----------------------
 *  CONCEPTOS
 *  ----------------------*/
export async function listConcepts(params: ListConceptParams, token: string) {
  const q = new URLSearchParams()

  if (params.page) q.set('page', String(params.page))
  if (params.limit) q.set('limit', String(params.limit))
  if (params.orderBy) q.set('orderBy', params.orderBy)
  if (params.order) q.set('order', params.order)
  if (params.estado !== undefined && params.estado !== '') q.set('estado', String(params.estado))
  if (params.search) q.set('search', params.search)
  if (params.categoria_proyecto !== undefined && params.categoria_proyecto !== '')
    q.set('categoria_proyecto', String(params.categoria_proyecto))

  const res = await fetch(`${base}/api/conceptos?${q.toString()}`, {
    method: 'GET',
    headers: authHeader(token)
  })

  const data = await res.json()

  if (!res.ok) throw Object.assign(new Error('List concepts failed'), { detail: data as OrusError })

  return data as {
    statusCode: 200
    message: string
    data: Array<{
      id: string
      concepto: string
      cuenta_contable: string
      categoria_proyecto: string
      codigo: string
      estado: boolean
      created_at: string
      categoria_proyecto_rel?: { id: string; descripcion: string; estado: boolean; created_at: string }
    }>
    pagination: { total: number; page: number; limit: number; totalPages: number }
    orderBy: string
    order: 'asc' | 'desc'
  }
}

export async function getConcept(id: string | number, token: string) {
  const res = await fetch(`${base}/api/conceptos/${id}`, {
    method: 'GET',
    headers: authHeader(token)
  })

  const data = await res.json()

  if (!res.ok) throw Object.assign(new Error('Get concept failed'), { detail: data as OrusError })

  return data as {
    statusCode: 200
    message: string
    data: {
      id: string
      concepto: string
      cuenta_contable: string
      categoria_proyecto: string
      codigo: string
      estado: boolean
      created_at: string
      categoria_proyecto_rel?: { id: string; descripcion: string; estado: boolean; created_at: string }
      usedByAnticipos: any[]
      usedByReembolsos: any[]
      usedByLegalizaciones: any[]
    }
  }
}

export async function createConcept(
  // 👇 codigo es opcional ahora
  payload: {
    concepto: string
    cuenta_contable: string
    categoria_proyecto: string | number
    estado: boolean
    codigo?: string
  },
  token: string
) {
  const res = await fetch(`${base}/api/conceptos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader(token) },
    body: JSON.stringify(payload)
  })

  const data = await res.json()

  if (!res.ok) throw Object.assign(new Error('Create concept failed'), { detail: data as OrusError })

  return data as {
    statusCode: 201
    message: string
    data: {
      id: string
      concepto: string
      cuenta_contable: string
      categoria_proyecto: string
      codigo: string
      estado: boolean
      created_at: string
      categoria_proyecto_rel?: { id: string; descripcion: string; estado: boolean; created_at: string }
    }
  }
}

export async function updateConcept(
  id: string | number,
  payload: { concepto: string; cuenta_contable: string; categoria_proyecto: string | number; estado: boolean },
  token: string
) {
  const res = await fetch(`${base}/api/conceptos/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeader(token) },
    body: JSON.stringify(payload)
  })

  const data = await res.json()

  if (!res.ok) throw Object.assign(new Error('Update concept failed'), { detail: data as OrusError })

  return data as {
    statusCode: 200
    message: string
    data: {
      id: string
      concepto: string
      cuenta_contable: string
      categoria_proyecto: string
      codigo: string
      estado: boolean
      created_at: string
      categoria_proyecto_rel?: { id: string; descripcion: string; estado: boolean; created_at: string }
    }
  }
}

export async function deleteConcept(id: string | number, confirmId: string | number, token: string) {
  const res = await fetch(`${base}/api/conceptos/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', ...authHeader(token) },
    body: JSON.stringify({ confirmId })
  })

  const data = await res.json()

  if (!res.ok) throw Object.assign(new Error('Delete concept failed'), { detail: data as OrusError })

  return data as { statusCode: 200; message: string }
}

/** -----------------------
 *  CATEGORÍAS activas (para el <select>)
 *  ----------------------*/
export async function listActiveCategories(token: string, opts?: { limit?: number }) {
  const q = new URLSearchParams()

  console.log(opts)

  q.set('page', '1')
  q.set('orderBy', 'descripcion')
  q.set('order', 'asc')
  q.set('estado', 'true')
  q.set('search', '')

  const res = await fetch(`${base}/api/categorias-conceptos?${q.toString()}`, {
    method: 'GET',
    headers: authHeader(token)
  })

  const data = await res.json()

  if (!res.ok) {
    throw Object.assign(new Error('List categories failed'), { detail: data as OrusError })
  }

  return data as {
    statusCode: 200
    message: string
    data: Array<{ id: string; descripcion: string; estado: boolean; created_at: string }>
    pagination: { total: number; page: number; limit: number; totalPages: number }
    orderBy: string
    order: 'asc' | 'desc'
  }
}
