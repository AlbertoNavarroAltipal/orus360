export type ListParams = {
  page?: number
  limit?: number
  orderBy?: 'descripcion' | 'created_at'
  order?: 'asc' | 'desc'
  estado?: boolean | ''
  search?: string
}

const base = process.env.NEXT_PUBLIC_URL_ORUS_API as string

const authHeader = (token: string) => ({
  Authorization: `Bearer ${token}`
})

/** Errores estándar NestJS que muestras en tu ejemplo */
export type OrusError = {
  statusCode: number // o 400 | 401 | 404 | 409
  timestamp?: string
  path?: string
  method?: string
  message: string | string[]
}

export async function listCategories(params: ListParams, token: string) {
  const q = new URLSearchParams()

  if (params.page) q.set('page', String(params.page))
  if (params.limit) q.set('limit', String(params.limit))
  if (params.orderBy) q.set('orderBy', params.orderBy)
  if (params.order) q.set('order', params.order)
  if (params.estado !== undefined && params.estado !== '') q.set('estado', String(params.estado))
  if (params.search) q.set('search', params.search)

  const res = await fetch(`${base}/api/categorias-conceptos?${q.toString()}`, {
    method: 'GET',
    headers: authHeader(token)
  })

  const data = await res.json()

  if (!res.ok) throw Object.assign(new Error('List failed'), { detail: data as OrusError })

  return data as {
    statusCode: 200
    message: string
    data: Array<{ id: string; descripcion: string; estado: boolean; created_at: string }>
    pagination: { total: number; page: number; limit: number; totalPages: number }
    orderBy: string
    order: 'asc' | 'desc'
  }
}

export async function createCategory(payload: { descripcion: string; estado: boolean }, token: string) {
  const res = await fetch(`${base}/api/categorias-conceptos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader(token) },
    body: JSON.stringify(payload)
  })

  const data = await res.json()

  if (!res.ok) throw Object.assign(new Error('Create failed'), { detail: data as OrusError })

  return data as {
    statusCode: 201
    message: string
    data: { id: string; descripcion: string; estado: boolean; created_at: string }
  }
}

export async function updateCategory(
  id: string | number,
  payload: { descripcion: string; estado: boolean },
  token: string
) {
  const res = await fetch(`${base}/api/categorias-conceptos/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeader(token) },
    body: JSON.stringify(payload)
  })

  const data = await res.json()

  if (!res.ok) throw Object.assign(new Error('Update failed'), { detail: data as OrusError })

  return data as {
    statusCode: 200
    message: string
    data: { id: string; descripcion: string; estado: boolean; created_at: string }
  }
}

export async function deleteCategory(id: string | number, confirmId: string | number, token: string) {
  const res = await fetch(`${base}/api/categorias-conceptos/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', ...authHeader(token) },
    body: JSON.stringify({ confirmId })
  })

  const data = await res.json()

  if (!res.ok) throw Object.assign(new Error('Delete failed'), { detail: data as OrusError })

  // éxito
  return data as { statusCode: 200; message: string }
}
