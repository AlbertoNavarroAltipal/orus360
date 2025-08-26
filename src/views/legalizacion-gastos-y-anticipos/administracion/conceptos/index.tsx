'use client'

import * as React from 'react'

import { useSession } from 'next-auth/react'

import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Skeleton from '@mui/material/Skeleton'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import CircularProgress from '@mui/material/CircularProgress'
import { type GridSortModel } from '@mui/x-data-grid-premium'

import Datagrid from './Datagrid'
import FormDrawer from './FormDrawer'
import {
  listConcepts,
  createConcept,
  updateConcept,
  deleteConcept,
  getConcept,
  listActiveCategories,
  type OrusError
} from '@/libs/orus/conceptos'

export type Concept = {
  id: number | string
  concepto: string
  cuentaContable: string
  categoriaProyecto: string | number
  categoriaProyectoDesc?: string
  codigo: string
  estado: boolean
  createdAt: number | string | Date
  codigoVisual: string
}

type Props = { initialRows?: Concept[] }

/** Detecta “código visual”: 003, 12, 0007, etc. */
const isVisualCode = (s: string) => /^\s*0*\d+\s*$/.test(s)

/** Convierte “003” -> “3” */
const visualToId = (s: string) => String(parseInt(s, 10))

/** Genera “003” a partir de un id numérico o devuelve el id si no es numérico */
const makeCodigoVisual = (id: string | number) => {
  const s = String(id)

  return /^\d+$/.test(s) ? s.padStart(3, '0') : s
}

const ConceptosView = ({ initialRows = [] }: Props) => {
  const { data: session } = useSession()

  const token =
    (session as any)?.masterToken || (session as any)?.user?.masterToken || process.env.NEXT_PUBLIC_MASTER_TOKEN || ''

  const [open, setOpen] = React.useState(false)
  const [mode, setMode] = React.useState<'crear' | 'editar'>('crear')
  const [editing, setEditing] = React.useState<Concept | null>(null)
  const [drawerErrors, setDrawerErrors] = React.useState<string[] | null>(null)

  // tabla/consulta
  const [rows, setRows] = React.useState<Concept[]>(initialRows)
  const [total, setTotal] = React.useState(0)
  const [search, setSearch] = React.useState('')
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)
  const [sortModel, setSortModel] = React.useState<GridSortModel>([{ field: 'concepto', sort: 'asc' }])
  const orderBy = sortModel[0]?.field === 'createdAt' ? 'created_at' : 'concepto'
  const order = sortModel[0]?.sort ?? 'asc'
  const [estado] = React.useState<'' | boolean>('')

  // Filtro de Categoría de proyecto
  const [categoriaProyecto, setCategoriaProyecto] = React.useState<string | number | ''>('')
  const [cats, setCats] = React.useState<Array<{ id: string; descripcion: string }>>([])
  const [loadingCats, setLoadingCats] = React.useState(false)

  const [loading, setLoading] = React.useState(false)
  const [deleteTarget, setDeleteTarget] = React.useState<Concept | null>(null)

  // 🛡️ Guard contra respuestas obsoletas
  const reqSeq = React.useRef(0)

  // normalizar errores backend -> string[]
  const normalizeBackendErrors = (err: any): string[] => {
    const d: OrusError | any = err?.detail ?? err
    const msgs: string[] = []

    if (!d) return ['Ocurrió un error desconocido.']

    const push = (m: any) => {
      if (!m) return

      if (Array.isArray(m)) m.forEach(x => push(x))
      else if (typeof m === 'string') msgs.push(m)
      else {
        try {
          msgs.push(JSON.stringify(m))
        } catch {}
      }
    }

    push(d?.message ?? d)

    return msgs.length ? msgs : ['Ocurrió un error.']
  }

  // Cargar categorías activas para el filtro
  React.useEffect(() => {
    if (!token) return
    let mounted = true

    ;(async () => {
      setLoadingCats(true)

      try {
        const res = await listActiveCategories(token, { limit: 1000 })

        if (!mounted) return
        const items = res.data.map(c => ({ id: String(c.id), descripcion: c.descripcion }))

        setCats(items)

        if (categoriaProyecto && !items.some(i => i.id === String(categoriaProyecto))) {
          setCategoriaProyecto('')
        }
      } catch (e) {
        console.error('Error cargando categorías para filtro:', e)
      } finally {
        if (mounted) setLoadingCats(false)
      }
    })()

    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  // cargar lista / o búsqueda por código visual
  const load = React.useCallback(async () => {
    if (!token) return
    const mySeq = ++reqSeq.current // ⬅️ marca esta ejecución como la más reciente

    setLoading(true)
    setDrawerErrors(null)

    try {
      // Si el buscador es un “código visual” (ej. 003), hacemos GET /conceptos/:id
      if (search && isVisualCode(search)) {
        const id = visualToId(search.trim())

        try {
          const one = await getConcept(id, token)

          // Si llegó otra búsqueda después, ignora esta respuesta
          if (mySeq !== reqSeq.current) return

          const i = one.data

          const single: Concept = {
            id: i.id,
            concepto: i.concepto,
            cuentaContable: i.cuenta_contable,
            categoriaProyecto: i.categoria_proyecto,
            categoriaProyectoDesc: i.categoria_proyecto_rel?.descripcion,
            codigo: i.codigo,
            estado: i.estado,
            createdAt: new Date(i.created_at).getTime(),
            codigoVisual: makeCodigoVisual(i.id)
          }

          setRows([single])
          setTotal(1)

          return
        } catch (_e) {
          if (mySeq !== reqSeq.current) return

          // 404 u otro error -> sin resultados
          setRows([])
          setTotal(0)

          return
        } finally {
          if (mySeq === reqSeq.current) setLoading(false)
        }
      }

      // Flujo normal (texto libre): pedir listado al backend
      const res = await listConcepts(
        {
          page,
          limit: pageSize,
          orderBy: orderBy as any,
          order: order as any,
          estado,
          search,
          categoria_proyecto: categoriaProyecto
        },
        token
      )

      if (mySeq !== reqSeq.current) return

      const mapped: Concept[] = res.data.map(i => ({
        id: i.id,
        concepto: i.concepto,
        cuentaContable: i.cuenta_contable,
        categoriaProyecto: i.categoria_proyecto,
        categoriaProyectoDesc: i.categoria_proyecto_rel?.descripcion,
        codigo: i.codigo,
        estado: i.estado,
        createdAt: new Date(i.created_at).getTime(),
        codigoVisual: makeCodigoVisual(i.id)
      }))

      setRows(mapped)
      setTotal(res.pagination.total)
    } catch (err: any) {
      if (mySeq !== reqSeq.current) return
      console.error('List concepts error:', err?.detail ?? err)
    } finally {
      if (mySeq === reqSeq.current) setLoading(false)
    }
  }, [token, page, pageSize, orderBy, order, estado, search, categoriaProyecto])

  React.useEffect(() => {
    load()
  }, [load])

  // crear (sin 'codigo' desde el form)
  const handleCreate = async (payload: {
    concepto: string
    cuenta_contable: string
    categoria_proyecto: string | number
    estado: boolean
  }) => {
    if (!token) return
    setDrawerErrors(null)
    setLoading(true)

    try {
      await createConcept(payload, token) // no enviamos 'codigo'
      await load()
      setOpen(false)
    } catch (err: any) {
      const msgs = normalizeBackendErrors(err)

      setDrawerErrors(msgs)
      console.error('Create concept error:', err?.detail ?? err)
    } finally {
      setLoading(false)
    }
  }

  // editar
  const handleEdit = async (payload: {
    concepto: string
    cuenta_contable: string
    categoria_proyecto: string | number
    estado: boolean
  }) => {
    if (!token || !editing) return
    setDrawerErrors(null)
    setLoading(true)

    try {
      await updateConcept(editing.id, payload, token)
      await load()
      setOpen(false)
      setEditing(null)
      setMode('crear')
    } catch (err: any) {
      const msgs = normalizeBackendErrors(err)

      setDrawerErrors(msgs)
      console.error('Update concept error:', err?.detail ?? err)
    } finally {
      setLoading(false)
    }
  }

  // acciones por fila
  const onEditRow = (row: Concept) => {
    setMode('editar')
    setEditing(row)
    setDrawerErrors(null)
    setOpen(true)
  }

  const onRequestDeleteRow = (row: Concept) => setDeleteTarget(row)

  const confirmDelete = async () => {
    if (!token || !deleteTarget) return
    const id = deleteTarget.id

    setDeleteTarget(null)
    setLoading(true)

    try {
      await deleteConcept(id, id, token)
      await load()
    } catch (err: any) {
      console.error('Delete concept error:', err?.detail ?? err)
    } finally {
      setLoading(false)
    }
  }

  const totalLabel = loading && rows.length === 0 ? <Skeleton variant='text' width={80} /> : <>({total})</>

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Grid container spacing={1} alignItems='center' sx={{ mb: 1 }}>
        <Grid size={{ xs: 12 }}>
          <Typography variant='h5' fontWeight={700}>
            Conceptos {totalLabel}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Administra los conceptos, su cuenta contable, categoría de proyecto y estado.
          </Typography>
        </Grid>
      </Grid>

      {/* Toolbar */}
      <Grid
        container
        spacing={2}
        alignItems='center'
        sx={{
          mb: 2,
          p: { xs: 1.5, sm: 2 },
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper'
        }}
      >
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            size='small'
            placeholder='Buscar (por concepto, código visual 003, etc.)'
            value={search}
            onChange={e => {
              setSearch(e.target.value)
              setPage(1)
            }}
            InputProps={{ startAdornment: <i className='ri-search-line mr-2 text-textSecondary' /> }}
          />
        </Grid>

        {/* Filtro de categoría funcional */}
        <Grid size={{ xs: 12, md: 3 }}>
          <FormControl fullWidth size='small'>
            <InputLabel id='cat-proy-label'>Categoría de proyecto</InputLabel>
            <Select
              labelId='cat-proy-label'
              label='Categoría de proyecto'
              value={categoriaProyecto}
              onChange={e => {
                setCategoriaProyecto(e.target.value as any)
                setPage(1)
              }}
              renderValue={val => {
                if (!val) return 'Todas'
                const it = cats.find(c => c.id === String(val))

                return it ? it.descripcion : String(val)
              }}
              displayEmpty
            >
              <MenuItem value=''>
                <em>Todas</em>
              </MenuItem>

              {loadingCats ? (
                <MenuItem disabled>
                  <CircularProgress size={16} sx={{ mr: 1 }} /> Cargando...
                </MenuItem>
              ) : (
                cats.map(c => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.descripcion}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </Grid>

        <Grid
          size={{ xs: 12, md: 3 }}
          sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}
        >
          <Tooltip title='Actualizar'>
            <span>
              <IconButton onClick={load} disabled={loading}>
                <i className='ri-refresh-line' />
              </IconButton>
            </span>
          </Tooltip>

          <Button
            onClick={() => {
              setMode('crear')
              setEditing(null)
              setDrawerErrors(null)
              setOpen(true)
            }}
            variant='contained'
            startIcon={<i className='ri-add-line' />}
            disabled={loading}
          >
            Crear concepto
          </Button>
        </Grid>
      </Grid>

      {/* Tabla */}
      <Datagrid
        rows={rows}
        loading={loading}
        quickFilter={search}
        onRowDoubleClick={row => onEditRow(row)}
        page={page}
        pageSize={pageSize}
        rowCount={total}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        sortModel={sortModel}
        onSortModelChange={m => {
          setSortModel(m.length ? m : [{ field: 'concepto', sort: 'asc' }])
          setPage(1)
        }}
        onEditRow={onEditRow}
        onRequestDeleteRow={onRequestDeleteRow}
      />

      {/* Confirmación eliminar */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth='xs' fullWidth>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Seguro que deseas eliminar el concepto
            {deleteTarget
              ? ` con ID '${deleteTarget.id}'${deleteTarget.concepto ? ` (${deleteTarget.concepto})` : ''}`
              : ''}
            ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancelar</Button>
          <Button color='error' variant='contained' onClick={confirmDelete}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Drawer */}
      <FormDrawer
        open={open}
        mode={mode}
        token={token}
        initialValues={
          mode === 'editar' && editing
            ? {
                concepto: editing.concepto || '',
                cuenta_contable: editing.cuentaContable || '',
                categoria_proyecto: editing.categoriaProyecto || '',
                estado: !!editing.estado
              }
            : { concepto: '', cuenta_contable: '', categoria_proyecto: '', estado: true }
        }
        apiErrors={drawerErrors}
        onClose={() => {
          setOpen(false)
          setEditing(null)
          setMode('crear')
          setDrawerErrors(null)
        }}
        onSubmit={
          mode === 'editar'
            ? async ({ concepto, cuenta_contable, categoria_proyecto, estado }) =>
                handleEdit({ concepto, cuenta_contable, categoria_proyecto, estado })
            : async ({ concepto, cuenta_contable, categoria_proyecto, estado }) =>
                handleCreate({ concepto, cuenta_contable, categoria_proyecto, estado })
        }
      />
    </Box>
  )
}

export default ConceptosView
