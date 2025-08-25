'use client'

// React Imports
import { useEffect, useState, useMemo } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import TablePagination from '@mui/material/TablePagination'
import IconButton from '@mui/material/IconButton'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import type { TextFieldProps } from '@mui/material/TextField'
import type { ButtonProps } from '@mui/material/Button'

// Third-party Imports
import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import type { RankingInfo } from '@tanstack/match-sorter-utils'
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

// Types
interface Permission {
  code: string
  description: string
  root: boolean
  created_at: string
  created_at_co: string
  created_by: string
}

interface PermissionResponse {
  statusCode: number
  message: string
  data: Permission[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
  orderBy: string
  order: string
}

interface ErrorResponse {
  statusCode: number
  timestamp: string
  path: string
  method: string
  message: string[]
}

type PermissionWithAction = Permission & {
  action?: string
}

// Vars
const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)
  addMeta({ itemRank })
  return itemRank.passed
}

const DebouncedInput = ({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
} & Omit<TextFieldProps, 'onChange'>) => {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
  }, [value, onChange, debounce])

  return <TextField {...props} value={value} onChange={e => setValue(e.target.value)} size='small' />
}

// Column Definitions
const columnHelper = createColumnHelper<PermissionWithAction>()

const Permissions = () => {
  // States
  const [data, setData] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [globalFilter, setGlobalFilter] = useState('')
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10
  })
  const [sorting, setSorting] = useState<any>([])

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null)
  const [dialogLoading, setDialogLoading] = useState(false)

  // Form states
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    root: false
  })
  const [formErrors, setFormErrors] = useState<string[]>([])

  // Menu states
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null)

  // Delete dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteConfirmCode, setDeleteConfirmCode] = useState('')
  const [deleteErrors, setDeleteErrors] = useState<string[]>([])

  // API response states
  const [totalRows, setTotalRows] = useState(0)

  const { data: session } = useSession()

  // API Functions
  const getAuthHeaders = () => {
    const token = (session as any)?.user?.masterToken
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  }

  const fetchPermissions = async () => {
    try {
      setLoading(true)
      const token = (session as any)?.user?.masterToken

      if (!token) {
        toast.error('No se encontró token de autenticación')
        return
      }

      const params = new URLSearchParams()
      params.append('page', (pagination.pageIndex + 1).toString())
      params.append('limit', pagination.pageSize.toString())

      if (globalFilter) {
        params.append('search', globalFilter)
      }

      if (sorting.length > 0) {
        params.append('orderBy', sorting[0].id)
        params.append('order', sorting[0].desc ? 'desc' : 'asc')
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_ORUS_API}/api/permisos?${params.toString()}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const result: PermissionResponse = await response.json()

      if (response.ok) {
        setData(result.data)
        setTotalRows(result.pagination.total)
      } else {
        const errorResult = result as unknown as ErrorResponse
        toast.error(errorResult.message?.join(', ') || 'Error al cargar permisos')
      }
    } catch (error) {
      toast.error('Error al conectar con el servidor')
    } finally {
      setLoading(false)
    }
  }

  const createPermission = async () => {
    try {
      setDialogLoading(true)
      setFormErrors([])

      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_ORUS_API}/api/permisos`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          code: formData.code,
          description: formData.description,
          root: formData.root
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Permiso creado exitosamente')
        setDialogOpen(false)
        resetForm()
        fetchPermissions()
      } else {
        const errorResult = result as ErrorResponse
        setFormErrors(errorResult.message || ['Error desconocido'])
      }
    } catch (error) {
      toast.error('Error al conectar con el servidor')
    } finally {
      setDialogLoading(false)
    }
  }

  const updatePermission = async () => {
    if (!editingPermission) return

    try {
      setDialogLoading(true)
      setFormErrors([])

      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_ORUS_API}/api/permisos/${editingPermission.code}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          description: formData.description,
          root: formData.root
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Permiso actualizado exitosamente')
        setDialogOpen(false)
        resetForm()
        fetchPermissions()
      } else {
        const errorResult = result as ErrorResponse
        setFormErrors(errorResult.message || ['Error desconocido'])
      }
    } catch (error) {
      toast.error('Error al conectar con el servidor')
    } finally {
      setDialogLoading(false)
    }
  }

  const deletePermission = async () => {
    if (!selectedPermission) return

    try {
      setDialogLoading(true)
      setDeleteErrors([])

      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_ORUS_API}/api/permisos/${selectedPermission.code}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          confirmCode: deleteConfirmCode
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(`Permiso '${selectedPermission.code}' eliminado exitosamente`)
        setDeleteDialogOpen(false)
        setDeleteConfirmCode('')
        setSelectedPermission(null)
        fetchPermissions()
      } else {
        const errorResult = result as ErrorResponse
        setDeleteErrors(errorResult.message || ['Error desconocido'])
      }
    } catch (error) {
      toast.error('Error al conectar con el servidor')
    } finally {
      setDialogLoading(false)
    }
  }

  // Helper Functions
  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      root: false
    })
    setFormErrors([])
    setEditingPermission(null)
  }

  const handleAddPermission = () => {
    resetForm()
    setDialogOpen(true)
  }

  const handleEditPermission = (permission: Permission) => {
    setEditingPermission(permission)
    setFormData({
      code: permission.code,
      description: permission.description,
      root: permission.root
    })
    setDialogOpen(true)
  }

  const handleDeleteClick = (permission: Permission) => {
    setSelectedPermission(permission)
    setDeleteConfirmCode('')
    setDeleteErrors([])
    setDeleteDialogOpen(true)
    setAnchorEl(null)
  }

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, permission: Permission) => {
    setAnchorEl(event.currentTarget)
    setSelectedPermission(permission)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedPermission(null)
  }

  // Effects
  useEffect(() => {
    if (session) {
      fetchPermissions()
    }
  }, [session, pagination.pageIndex, pagination.pageSize, globalFilter, sorting])

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setPagination(prev => ({ ...prev, pageIndex: 0 }))
    }, 500)

    return () => clearTimeout(timer)
  }, [globalFilter])

  // Columns
  const columns = useMemo<ColumnDef<PermissionWithAction, any>[]>(
    () => [
      columnHelper.accessor('code', {
        header: 'Código',
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <Typography color='text.primary' className='font-medium'>
              {row.original.code}
            </Typography>
            {row.original.root && <Chip label='Root' color='error' size='small' />}
          </div>
        )
      }),
      columnHelper.accessor('description', {
        header: 'Descripción',
        cell: ({ row }) => (
          <Typography color='text.primary' className='max-w-md'>
            {row.original.description}
          </Typography>
        )
      }),
      columnHelper.accessor('created_at_co', {
        header: 'Fecha de creación',
        cell: ({ row }) => <Typography>{row.original.created_at_co}</Typography>
      }),
      columnHelper.accessor('created_by', {
        header: 'Creado por',
        cell: ({ row }) => <Typography className='capitalize'>{row.original.created_by}</Typography>
      }),
      columnHelper.accessor('action', {
        header: 'Acciones',
        cell: ({ row }) => (
          <div className='flex items-center'>
            <IconButton onClick={() => handleEditPermission(row.original)}>
              <i className='ri-edit-box-line text-textSecondary' />
            </IconButton>
            <IconButton onClick={e => handleMenuClick(e, row.original)}>
              <i className='ri-more-2-line text-textSecondary' />
            </IconButton>
          </div>
        ),
        enableSorting: false
      })
    ],
    []
  )

  const table = useReactTable({
    data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      globalFilter,
      pagination,
      sorting
    },
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    manualPagination: true,
    manualSorting: true,
    pageCount: Math.ceil(totalRows / pagination.pageSize)
  })

  const buttonProps: ButtonProps = {
    variant: 'contained',
    children: 'Agregar permiso',
    onClick: handleAddPermission,
    className: 'max-sm:is-full'
  }

  return (
    <>
      <Card>
        <CardContent className='flex flex-col gap-4 sm:flex-row items-start sm:items-center justify-between'>
          <DebouncedInput
            value={globalFilter ?? ''}
            onChange={value => setGlobalFilter(String(value))}
            placeholder='Buscar permisos'
            className='max-sm:is-full'
          />
          <Button {...buttonProps} />
        </CardContent>

        <div className='overflow-x-auto'>
          <table className={tableStyles.table}>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id}>
                      {header.isPlaceholder ? null : (
                        <div
                          className={classnames({
                            'flex items-center': header.column.getIsSorted(),
                            'cursor-pointer select-none': header.column.getCanSort()
                          })}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: <i className='ri-arrow-up-s-line text-xl' />,
                            desc: <i className='ri-arrow-down-s-line text-xl' />
                          }[header.column.getIsSorted() as 'asc' | 'desc'] ?? null}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            {loading ? (
              <tbody>
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center py-8'>
                    <CircularProgress />
                  </td>
                </tr>
              </tbody>
            ) : data.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center py-8'>
                    No hay permisos disponibles
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {table.getRowModel().rows.map(row => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component='div'
          className='border-bs'
          count={totalRows}
          rowsPerPage={pagination.pageSize}
          page={pagination.pageIndex}
          onPageChange={(_, page) => {
            setPagination(prev => ({ ...prev, pageIndex: page }))
          }}
          onRowsPerPageChange={e => {
            setPagination(prev => ({
              ...prev,
              pageSize: Number(e.target.value),
              pageIndex: 0
            }))
          }}
        />
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>{editingPermission ? 'Editar Permiso' : 'Crear Permiso'}</DialogTitle>

        <DialogContent>
          {formErrors.length > 0 && (
            <Alert severity='error' className='mb-4'>
              <ul className='list-disc list-inside'>
                {formErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </Alert>
          )}

          <div className='flex flex-col gap-4 mt-4'>
            <TextField
              fullWidth
              label='Código'
              value={formData.code}
              onChange={e => setFormData(prev => ({ ...prev, code: e.target.value }))}
              disabled={!!editingPermission}
              placeholder='modulo::accion (ej: user::create)'
              helperText={editingPermission ? 'El código no se puede modificar' : 'Formato: modulo::accion'}
            />

            <TextField
              fullWidth
              label='Descripción'
              multiline
              rows={3}
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder='Descripción del permiso'
              helperText='Entre 5 y 500 caracteres'
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.root}
                  onChange={e => setFormData(prev => ({ ...prev, root: e.target.checked }))}
                />
              }
              label='Permiso root (crítico del sistema)'
            />
          </div>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={dialogLoading}>
            Cancelar
          </Button>
          <Button
            variant='contained'
            onClick={editingPermission ? updatePermission : createPermission}
            disabled={dialogLoading}
          >
            {dialogLoading && <CircularProgress size={16} className='mr-2' />}
            {editingPermission ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Actions Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => selectedPermission && handleEditPermission(selectedPermission)}>
          <i className='ri-edit-line mr-2' />
          Editar
        </MenuItem>
        <MenuItem onClick={() => selectedPermission && handleDeleteClick(selectedPermission)} className='text-error'>
          <i className='ri-delete-bin-line mr-2' />
          Eliminar
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>Confirmar eliminación</DialogTitle>

        <DialogContent>
          {deleteErrors.length > 0 && (
            <Alert severity='error' className='mb-4'>
              <ul className='list-disc list-inside'>
                {deleteErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </Alert>
          )}

          <Typography className='mb-4'>
            ¿Estás seguro de que deseas eliminar el permiso <strong>{selectedPermission?.code}</strong>?
          </Typography>

          <Typography variant='body2' color='text.secondary' className='mb-4'>
            Para confirmar la eliminación, escribe el código del permiso:
          </Typography>

          <TextField
            fullWidth
            label='Código de confirmación'
            value={deleteConfirmCode}
            onChange={e => setDeleteConfirmCode(e.target.value)}
            placeholder={selectedPermission?.code}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={dialogLoading}>
            Cancelar
          </Button>
          <Button
            variant='contained'
            color='error'
            onClick={deletePermission}
            disabled={dialogLoading || deleteConfirmCode !== selectedPermission?.code}
          >
            {dialogLoading && <CircularProgress size={16} className='mr-2' />}
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default Permissions
