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
import { type GridSortModel } from '@mui/x-data-grid-premium'

import Datagrid from './Datagrid'
import FormDrawer from './FormDrawer'
import { listCategories, createCategory, updateCategory, deleteCategory } from '@/libs/orus/categories'

export type Category = {
  id: number | string
  descripcion: string | null
  estado: boolean
  createdAt: number | string | Date
}

type Props = { initialRows?: Category[] }

const CategoriasView = ({ initialRows = [] }: Props) => {
  const { data: session } = useSession()

  const token =
    (session as any)?.masterToken || (session as any)?.user?.masterToken || process.env.NEXT_PUBLIC_MASTER_TOKEN || ''

  // Drawer / modo + error visible dentro del drawer
  const [open, setOpen] = React.useState(false)
  const [mode, setMode] = React.useState<'crear' | 'editar'>('crear')
  const [editing, setEditing] = React.useState<Category | null>(null)
  const [drawerError, setDrawerError] = React.useState<string | null>(null)

  // tabla/consulta
  const [rows, setRows] = React.useState<Category[]>(initialRows)
  const [total, setTotal] = React.useState(0)
  const [search, setSearch] = React.useState('')
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)
  const [sortModel, setSortModel] = React.useState<GridSortModel>([{ field: 'descripcion', sort: 'asc' }])
  const orderBy = sortModel[0]?.field === 'createdAt' ? 'created_at' : 'descripcion'
  const order = sortModel[0]?.sort ?? 'asc'
  const [estado] = React.useState<'' | boolean>('')

  // loading: SOLO DataGrid/Skeletons
  const [loading, setLoading] = React.useState(false)

  // diálogo de confirmación (eliminar)
  const [deleteTarget, setDeleteTarget] = React.useState<Category | null>(null)

  // utils para errores del backend
  const extractApiMessage = (err: any): string => {
    const d = err?.detail ?? err

    if (!d) return 'Ocurrió un error desconocido.'
    if (Array.isArray(d?.message)) return d.message.join(' ')
    if (typeof d?.message === 'string') return d.message
    if (typeof d === 'string') return d

    try {
      return JSON.stringify(d)
    } catch {
      return 'Ocurrió un error.'
    }
  }

  // cargar lista
  const load = React.useCallback(async () => {
    if (!token) return
    setLoading(true)
    setDrawerError(null) // limpiar error visible en drawer si estuviera abierto

    try {
      const res = await listCategories(
        { page, limit: pageSize, orderBy: orderBy as any, order: order as any, estado, search },
        token
      )

      const mapped: Category[] = res.data.map(i => ({
        id: i.id,
        descripcion: i.descripcion,
        estado: i.estado,
        createdAt: new Date(i.created_at).getTime()
      }))

      setRows(mapped)
      setTotal(res.pagination.total)
    } catch (err: any) {
      console.error('List error:', err?.detail ?? err)
    } finally {
      setLoading(false)
    }
  }, [token, page, pageSize, orderBy, order, estado, search])

  React.useEffect(() => {
    load()
  }, [load])

  // crear
  const handleCreate = async (payload: { descripcion: string; estado: boolean }) => {
    if (!token) return
    setDrawerError(null)
    setLoading(true) // usa loader del grid

    try {
      await createCategory(payload, token)
      await load()
      setOpen(false) // ⬅️ cerrar SOLO en éxito
    } catch (err: any) {
      const msg = extractApiMessage(err)

      setDrawerError(msg) // ⬅️ mostrar mensaje en el Drawer
      console.error('Create error:', err?.detail ?? err)
    } finally {
      setLoading(false)
    }
  }

  // editar
  const handleEdit = async (payload: { descripcion: string; estado: boolean }) => {
    if (!token || !editing) return
    setDrawerError(null)
    setLoading(true)

    try {
      await updateCategory(editing.id, payload, token)
      await load()
      setOpen(false) // ⬅️ cerrar SOLO en éxito
      setEditing(null)
      setMode('crear')
    } catch (err: any) {
      const msg = extractApiMessage(err)

      setDrawerError(msg)
      console.error('Update error:', err?.detail ?? err)
    } finally {
      setLoading(false)
    }
  }

  // acciones por fila
  const onEditRow = (row: Category) => {
    setMode('editar')
    setEditing(row)
    setDrawerError(null)
    setOpen(true)
  }

  const onRequestDeleteRow = (row: Category) => setDeleteTarget(row)

  const confirmDelete = async () => {
    if (!token || !deleteTarget) return
    const id = deleteTarget.id

    setDeleteTarget(null)
    setLoading(true)

    try {
      await deleteCategory(id, id, token)
      await load()
    } catch (err: any) {
      console.error('Delete error:', err?.detail ?? err)
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
            Categorías {totalLabel}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Administra la descripción y el estado de las categorías usadas en la legalización de gastos y anticipos.
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
            placeholder='Buscar'
            value={search}
            onChange={e => {
              setSearch(e.target.value)
              setPage(1)
            }}
            InputProps={{ startAdornment: <i className='ri-search-line mr-2 text-textSecondary' /> }}
          />
        </Grid>

        <Grid
          size={{ xs: 12, md: 6 }}
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
              setDrawerError(null)
              setOpen(true)
            }}
            variant='contained'
            startIcon={<i className='ri-add-line' />}
            disabled={loading}
          >
            Crear categoría
          </Button>
        </Grid>
      </Grid>

      {/* Tabla con menú ⋯ por fila */}
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
          setSortModel(m.length ? m : [{ field: 'descripcion', sort: 'asc' }])
          setPage(1)
        }}
        onEditRow={onEditRow}
        onRequestDeleteRow={onRequestDeleteRow}
      />

      {/* Drawer */}
      <FormDrawer
        open={open}
        mode={mode}
        initialValues={
          mode === 'editar' && editing
            ? { descripcion: editing.descripcion || '', estado: editing.estado }
            : { descripcion: '', estado: true }
        }
        apiError={drawerError} // ⬅️ pasa el mensaje del backend al formulario
        onClose={() => {
          setOpen(false)
          setEditing(null)
          setMode('crear')
          setDrawerError(null)
        }}
        onSubmit={mode === 'editar' ? handleEdit : handleCreate}
      />

      {/* Confirmación eliminar */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth='xs' fullWidth>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Seguro que deseas eliminar la categoría
            {deleteTarget
              ? ` con ID '${deleteTarget.id}'${deleteTarget.descripcion ? ` (${deleteTarget.descripcion})` : ''}`
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
    </Box>
  )
}

export default CategoriasView
