// src/views/legalizacion-gastos-y-anticipos/administracion/conceptos/index.tsx
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
import { type GridSortModel } from '@mui/x-data-grid-premium'

import Datagrid from './Datagrid'
import FormDrawer from './FormDrawer'
import { listConcepts, createConcept, updateConcept, deleteConcept, type OrusError } from '@/libs/orus/conceptos'

export type Concept = {
  id: number | string
  concepto: string
  cuentaContable: string
  categoriaProyecto: string | number
  categoriaProyectoDesc?: string
  codigo: string
  estado: boolean
  createdAt: number | string | Date
}

type Props = { initialRows?: Concept[] }

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
  const [estado] = React.useState<'' | boolean>('') // Si luego deseas filtro por estado, agrega UI
  const [categoriaProyecto, setCategoriaProyecto] = React.useState<string | number | ''>('')

  const [loading, setLoading] = React.useState(false)
  const [deleteTarget, setDeleteTarget] = React.useState<Concept | null>(null)

  // util: normalizar errores del backend a string[]
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
        } catch {
          /* noop */
        }
      }
    }

    push(d?.message ?? d)
    return msgs.length ? msgs : ['Ocurrió un error.']
  }

  // cargar lista
  const load = React.useCallback(async () => {
    if (!token) return
    setLoading(true)
    setDrawerErrors(null)
    try {
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

      const mapped: Concept[] = res.data.map(i => ({
        id: i.id,
        concepto: i.concepto,
        cuentaContable: i.cuenta_contable,
        categoriaProyecto: i.categoria_proyecto,
        categoriaProyectoDesc: i.categoria_proyecto_rel?.descripcion,
        codigo: i.codigo,
        estado: i.estado,
        createdAt: new Date(i.created_at).getTime()
      }))

      setRows(mapped)
      setTotal(res.pagination.total)
    } catch (err: any) {
      console.error('List concepts error:', err?.detail ?? err)
    } finally {
      setLoading(false)
    }
  }, [token, page, pageSize, orderBy, order, estado, search, categoriaProyecto])

  React.useEffect(() => {
    load()
  }, [load])

  // crear
  const handleCreate = async (payload: {
    concepto: string
    cuenta_contable: string
    categoria_proyecto: string | number
    codigo: string
    estado: boolean
  }) => {
    if (!token) return
    setDrawerErrors(null)
    setLoading(true)
    try {
      await createConcept(payload, token)
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
            Administra los conceptos, su cuenta contable, categoría de proyecto, código y estado.
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
        <Grid size={{ xs: 12, md: 5 }}>
          <TextField
            fullWidth
            size='small'
            placeholder='Buscar (por concepto, código, etc.)'
            value={search}
            onChange={e => {
              setSearch(e.target.value)
              setPage(1)
            }}
            InputProps={{ startAdornment: <i className='ri-search-line mr-2 text-textSecondary' /> }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
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
            >
              <MenuItem value=''>Todas</MenuItem>
              {/* Si quieres opciones reales aquí, podemos reutilizar listActiveCategories con un pequeño hook */}
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
                codigo: editing.codigo || '',
                estado: !!editing.estado
              }
            : { concepto: '', cuenta_contable: '', categoria_proyecto: '', codigo: '', estado: true }
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
            : async ({ concepto, cuenta_contable, categoria_proyecto, codigo, estado }) =>
                handleCreate({ concepto, cuenta_contable, categoria_proyecto, codigo: codigo!, estado })
        }
      />
    </Box>
  )
}

export default ConceptosView
