'use client'

// React Imports
import { useState, useMemo, useEffect } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import TablePagination from '@mui/material/TablePagination'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Badge from '@mui/material/Badge'
import Tooltip from '@mui/material/Tooltip'
import type { TextFieldProps } from '@mui/material/TextField'

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
interface Role {
  code: string
  description: string
  root: boolean
  created_at: string
  created_at_co: string
  created_by: string
}

interface RoleResponse {
  statusCode: number
  message: string
  data: Role[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
  orderBy: string
  order: string
}

interface RoleDetail extends Role {
  usedByUsers: string[]
  permissions: Array<{
    code: string
    description: string
  }>
}

interface Permission {
  code: string
  description: string
}

interface ErrorResponse {
  statusCode: number
  timestamp: string
  path: string
  method: string
  message: string[]
}

interface PermissionResponse {
  statusCode: number
  message: string
  assigned?: string[]
  alreadyAssigned?: string[]
  revoked?: string[]
  notAssigned?: string[]
}

type RoleWithAction = Role & {
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
const columnHelper = createColumnHelper<RoleWithAction>()

const RolesTable = () => {
  // States
  const [data, setData] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [globalFilter, setGlobalFilter] = useState('')
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10
  })
  const [sorting, setSorting] = useState<any>([])

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [dialogLoading, setDialogLoading] = useState(false)

  // Form states
  const [formData, setFormData] = useState({
    description: '',
    root: false
  })
  const [formErrors, setFormErrors] = useState<string[]>([])

  // Menu states
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)

  // Delete dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleteErrors, setDeleteErrors] = useState<string[]>([])

  // Detail dialog states
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [roleDetail, setRoleDetail] = useState<RoleDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  // Permissions dialog states
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false)
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([])
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>([])
  const [permissionsLoading, setPermissionsLoading] = useState(false)

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

  const fetchRoles = async () => {
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

      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_ORUS_API}/api/roles?${params.toString()}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const result: RoleResponse = await response.json()

      if (response.ok) {
        setData(result.data)
        setTotalRows(result.pagination.total)
      } else {
        const errorResult = result as unknown as ErrorResponse
        toast.error(errorResult.message?.join(', ') || 'Error al cargar roles')
      }
    } catch (error) {
      toast.error('Error al conectar con el servidor')
    } finally {
      setLoading(false)
    }
  }

  const fetchRoleDetail = async (code: string) => {
    try {
      setDetailLoading(true)
      const token = (session as any)?.user?.masterToken

      if (!token) {
        toast.error('No se encontró token de autenticación')
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_ORUS_API}/api/roles/${code}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const result = await response.json()

      if (response.ok) {
        setRoleDetail(result.data)
        setDetailDialogOpen(true)
      } else {
        const errorResult = result as ErrorResponse
        toast.error(errorResult.message?.join(', ') || 'Error al cargar detalle del rol')
      }
    } catch (error) {
      toast.error('Error al conectar con el servidor')
    } finally {
      setDetailLoading(false)
    }
  }

  const fetchAvailablePermissions = async () => {
    try {
      setPermissionsLoading(true)
      const token = (session as any)?.user?.masterToken

      if (!token) {
        toast.error('No se encontró token de autenticación')
        return
      }

      // Hacer múltiples peticiones para obtener todos los permisos
      const allPermissions: Permission[] = []
      let page = 1
      let hasMorePages = true

      while (hasMorePages) {
        const url = `${process.env.NEXT_PUBLIC_URL_ORUS_API}/api/permisos?page=${page}&limit=100`

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if (!response.ok) {
          toast.error(`Error al cargar permisos: ${response.status}`)
          break
        }

        let result
        try {
          result = await response.json()
        } catch (parseError) {
          toast.error('Error al procesar respuesta del servidor')
          break
        }

        if (result.data && Array.isArray(result.data)) {
          const pagePermissions = result.data.map((p: any) => ({
            code: p.code,
            description: p.description
          }))
          allPermissions.push(...pagePermissions)

          // Verificar si hay más páginas
          if (result.pagination) {
            hasMorePages = page < result.pagination.totalPages
            page++
          } else {
            hasMorePages = false
          }
        } else {
          hasMorePages = false
        }
      }

      setAvailablePermissions(allPermissions)

      if (allPermissions.length === 0) {
        toast.warning('No se encontraron permisos disponibles')
      }
    } catch (error) {
      toast.error('Error al conectar con el servidor para cargar permisos')
    } finally {
      setPermissionsLoading(false)
    }
  }

  const createRole = async () => {
    try {
      setDialogLoading(true)
      setFormErrors([])

      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_ORUS_API}/api/roles`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          description: formData.description,
          root: formData.root
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Rol creado exitosamente')
        setDialogOpen(false)
        resetForm()
        fetchRoles()
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

  const updateRole = async () => {
    if (!editingRole) return

    try {
      setDialogLoading(true)
      setFormErrors([])

      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_ORUS_API}/api/roles/${editingRole.code}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          description: formData.description,
          root: formData.root
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Rol actualizado exitosamente')
        setDialogOpen(false)
        resetForm()
        fetchRoles()
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

  const deleteRole = async () => {
    if (!selectedRole) return

    try {
      setDialogLoading(true)
      setDeleteErrors([])

      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_ORUS_API}/api/roles/${selectedRole.code}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          confirmAction: deleteConfirm
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(`Rol '${selectedRole.description}' eliminado exitosamente`)
        setDeleteDialogOpen(false)
        setDeleteConfirm('')
        setSelectedRole(null)
        fetchRoles()
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

  const assignPermissions = async () => {
    if (!selectedRole || selectedPermissions.length === 0) return

    try {
      setPermissionsLoading(true)

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL_ORUS_API}/api/roles/${selectedRole.code}/permissions`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            permissions: selectedPermissions.map(p => p.code)
          })
        }
      )

      const result: PermissionResponse = await response.json()

      if (response.ok) {
        const { assigned = [], alreadyAssigned = [] } = result
        let message = 'Permisos procesados exitosamente'

        if (assigned.length > 0) {
          message += `\n• Asignados: ${assigned.length}`
        }
        if (alreadyAssigned.length > 0) {
          message += `\n• Ya asignados: ${alreadyAssigned.length}`
        }

        toast.success(message)
        setPermissionsDialogOpen(false)
        setSelectedPermissions([])
        if (roleDetail) {
          fetchRoleDetail(selectedRole.code)
        }
      } else {
        const errorResult = result as unknown as ErrorResponse
        toast.error(errorResult.message?.join(', ') || 'Error al asignar permisos')
      }
    } catch (error) {
      toast.error('Error al conectar con el servidor')
    } finally {
      setPermissionsLoading(false)
    }
  }

  const revokePermissions = async (permissions: string[]) => {
    if (!selectedRole || permissions.length === 0) return

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL_ORUS_API}/api/roles/${selectedRole.code}/permissions`,
        {
          method: 'DELETE',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            permissions
          })
        }
      )

      const result: PermissionResponse = await response.json()

      if (response.ok) {
        const { revoked = [], notAssigned = [] } = result
        let message = 'Permisos procesados exitosamente'

        if (revoked.length > 0) {
          message += `\n• Revocados: ${revoked.length}`
        }
        if (notAssigned.length > 0) {
          message += `\n• No asignados: ${notAssigned.length}`
        }

        toast.success(message)
        if (roleDetail) {
          fetchRoleDetail(selectedRole.code)
        }
      } else {
        const errorResult = result as unknown as ErrorResponse
        toast.error(errorResult.message?.join(', ') || 'Error al revocar permisos')
      }
    } catch (error) {
      toast.error('Error al conectar con el servidor')
    }
  }

  // Helper Functions
  const resetForm = () => {
    setFormData({
      description: '',
      root: false
    })
    setFormErrors([])
    setEditingRole(null)
  }

  const handleAddRole = () => {
    resetForm()
    setDialogOpen(true)
  }

  const handleEditRole = (role: Role) => {
    setEditingRole(role)
    setFormData({
      description: role.description,
      root: role.root
    })
    setDialogOpen(true)
  }

  const handleDeleteClick = (role: Role) => {
    setSelectedRole(role)
    setDeleteConfirm('')
    setDeleteErrors([])
    setDeleteDialogOpen(true)
    setAnchorEl(null)
  }

  const handleDetailClick = (role: Role) => {
    setSelectedRole(role)
    fetchRoleDetail(role.code)
    setAnchorEl(null)
  }

  const handlePermissionsClick = async (role: Role) => {
    setSelectedRole(role)
    setSelectedPermissions([])
    setPermissionsDialogOpen(true)
    setAnchorEl(null)
    await fetchAvailablePermissions()
  }

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, role: Role) => {
    setAnchorEl(event.currentTarget)
    setSelectedRole(role)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedRole(null)
  }

  // Effects
  useEffect(() => {
    if (session) {
      fetchRoles()
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
  const columns = useMemo<ColumnDef<RoleWithAction, any>[]>(
    () => [
      columnHelper.accessor('description', {
        header: 'Rol',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <div className='flex items-center justify-center w-10 h-10 bg-primary-50 rounded-lg'>
              <i className='ri-shield-user-line text-primary text-lg' />
            </div>
            <div>
              <Typography
                color='primary'
                className='font-semibold cursor-pointer hover:underline text-[14px]'
                onClick={() => handleDetailClick(row.original)}
              >
                {row.original.description}
              </Typography>
              <Typography variant='caption' color='text.secondary' className='text-[12px]'>
                ID: {row.original.code}
              </Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('root', {
        header: 'Tipo',
        cell: ({ row }) => (
          <div className='flex items-center'>
            {row.original.root ? (
              <Chip
                label='Sistema'
                color='error'
                size='small'
                variant='outlined'
                sx={{ borderRadius: '6px', fontWeight: 500, fontSize: '12px' }}
              />
            ) : (
              <Chip
                label='Usuario'
                color='success'
                size='small'
                variant='outlined'
                sx={{ borderRadius: '6px', fontWeight: 500, fontSize: '12px' }}
              />
            )}
          </div>
        )
      }),
      columnHelper.accessor('created_at_co', {
        header: 'Creado',
        cell: ({ row }) => (
          <div>
            <Typography variant='body2' className='text-[13px] font-medium'>
              {row.original.created_at_co}
            </Typography>
            <Typography variant='caption' color='text.secondary' className='text-[11px] capitalize'>
              por {row.original.created_by}
            </Typography>
          </div>
        )
      }),
      columnHelper.accessor('action', {
        header: 'Acciones',
        cell: ({ row }) => (
          <div className='flex items-center gap-1'>
            <Tooltip title='Ver detalles'>
              <IconButton
                size='small'
                onClick={() => handleDetailClick(row.original)}
                sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
              >
                <i className='ri-eye-line text-[18px]' />
              </IconButton>
            </Tooltip>
            <Tooltip title='Editar rol'>
              <IconButton
                size='small'
                onClick={() => handleEditRole(row.original)}
                sx={{ color: 'text.secondary', '&:hover': { color: 'warning.main' } }}
              >
                <i className='ri-edit-box-line text-[18px]' />
              </IconButton>
            </Tooltip>
            <Tooltip title='Más opciones'>
              <IconButton
                size='small'
                onClick={e => handleMenuClick(e, row.original)}
                sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}
              >
                <i className='ri-more-2-line text-[18px]' />
              </IconButton>
            </Tooltip>
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

  return (
    <>
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: 3 }}>
          <div className='flex flex-col gap-4 sm:flex-row items-start sm:items-center justify-between'>
            <div className='flex items-center gap-3'>
              <DebouncedInput
                value={globalFilter ?? ''}
                onChange={value => setGlobalFilter(String(value))}
                placeholder='Buscar roles...'
                className='max-sm:is-full'
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    backgroundColor: 'background.paper'
                  }
                }}
              />
              <Badge badgeContent={totalRows} color='primary' sx={{ '& .MuiBadge-badge': { fontSize: '11px' } }}>
                <Chip label='Total' variant='outlined' size='small' sx={{ borderRadius: '6px', fontWeight: 500 }} />
              </Badge>
            </div>
            <Button
              variant='contained'
              onClick={handleAddRole}
              startIcon={<i className='ri-add-line' />}
              className='max-sm:is-full'
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                py: 1.5
              }}
            >
              Crear Rol
            </Button>
          </div>
        </CardContent>

        <div className='overflow-x-auto'>
          <table className={tableStyles.table}>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} style={{ backgroundColor: '#fafafa' }}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} style={{ padding: '16px', borderBottom: '1px solid #e0e0e0' }}>
                      {header.isPlaceholder ? null : (
                        <div
                          className={classnames({
                            'flex items-center gap-2': header.column.getIsSorted(),
                            'cursor-pointer select-none': header.column.getCanSort()
                          })}
                          onClick={header.column.getToggleSortingHandler()}
                          style={{ fontWeight: 600, fontSize: '13px', color: '#424242' }}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: <i className='ri-arrow-up-s-line text-lg text-primary' />,
                            desc: <i className='ri-arrow-down-s-line text-lg text-primary' />
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
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center py-12'>
                    <div className='flex flex-col items-center gap-3'>
                      <CircularProgress size={24} />
                      <Typography variant='body2' color='text.secondary'>
                        Cargando roles...
                      </Typography>
                    </div>
                  </td>
                </tr>
              </tbody>
            ) : data.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center py-12'>
                    <div className='flex flex-col items-center gap-3'>
                      <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center'>
                        <i className='ri-shield-user-line text-2xl text-gray-400' />
                      </div>
                      <div>
                        <Typography variant='body1' className='font-medium mb-1'>
                          No hay roles disponibles
                        </Typography>
                        <Typography variant='body2' color='text.secondary'>
                          Crea tu primer rol para comenzar
                        </Typography>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {table.getRowModel().rows.map((row, index) => (
                  <tr
                    key={row.id}
                    style={{
                      backgroundColor: index % 2 === 0 ? 'transparent' : '#fafafa',
                      borderBottom: '1px solid #f0f0f0'
                    }}
                  >
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} style={{ padding: '16px' }}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>

        <Divider />
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component='div'
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
          sx={{
            '& .MuiTablePagination-toolbar': {
              padding: '16px 24px'
            },
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              fontSize: '13px',
              fontWeight: 500
            }
          }}
        />
      </Card>

      {/* Create/Edit Dialog - Professional Style */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth='sm'
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px',
            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04)'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center'>
              <i className={`${editingRole ? 'ri-edit-line' : 'ri-add-line'} text-primary text-lg`} />
            </div>
            <div>
              <Typography variant='h6' className='font-semibold'>
                {editingRole ? 'Editar Rol' : 'Crear Nuevo Rol'}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                {editingRole ? 'Modifica la información del rol' : 'Define un nuevo rol del sistema'}
              </Typography>
            </div>
          </div>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ p: 3 }}>
          {formErrors.length > 0 && (
            <Alert severity='error' sx={{ mb: 3, borderRadius: '8px' }}>
              <Typography variant='body2' className='font-medium mb-1'>
                Se encontraron los siguientes errores:
              </Typography>
              <ul className='list-disc list-inside text-sm'>
                {formErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </Alert>
          )}

          <Stack spacing={3}>
            <TextField
              fullWidth
              label='Descripción del rol'
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder='Ej: Administrador de contenido'
              helperText='Entre 3 y 100 caracteres'
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px'
                }
              }}
            />

            <Paper variant='outlined' sx={{ p: 2, borderRadius: '8px', bgcolor: 'background.default' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.root}
                    onChange={e => setFormData(prev => ({ ...prev, root: e.target.checked }))}
                    color='error'
                  />
                }
                label={
                  <div>
                    <Typography variant='body2' className='font-medium'>
                      Rol de sistema (Root)
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Los roles de sistema tienen privilegios especiales y no pueden ser eliminados
                    </Typography>
                  </div>
                }
              />
            </Paper>
          </Stack>
        </DialogContent>

        <Divider />
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={() => setDialogOpen(false)}
            disabled={dialogLoading}
            sx={{ borderRadius: '8px', textTransform: 'none' }}
          >
            Cancelar
          </Button>
          <Button
            variant='contained'
            onClick={editingRole ? updateRole : createRole}
            disabled={dialogLoading}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              px: 3
            }}
          >
            {dialogLoading && <CircularProgress size={16} sx={{ mr: 1 }} />}
            {editingRole ? 'Actualizar Rol' : 'Crear Rol'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05)',
            border: '1px solid',
            borderColor: 'divider'
          }
        }}
      >
        <MenuItem onClick={() => selectedRole && handleDetailClick(selectedRole)} sx={{ gap: 2, py: 1.5 }}>
          <i className='ri-eye-line text-primary' />
          <div>
            <Typography variant='body2' className='font-medium'>
              Ver detalle
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              Información completa
            </Typography>
          </div>
        </MenuItem>
        <MenuItem onClick={() => selectedRole && handlePermissionsClick(selectedRole)} sx={{ gap: 2, py: 1.5 }}>
          <i className='ri-shield-keyhole-line text-warning' />
          <div>
            <Typography variant='body2' className='font-medium'>
              Gestionar permisos
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              Asignar o revocar permisos
            </Typography>
          </div>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => selectedRole && handleDeleteClick(selectedRole)}
          sx={{ gap: 2, py: 1.5, color: 'error.main' }}
        >
          <i className='ri-delete-bin-line' />
          <div>
            <Typography variant='body2' className='font-medium'>
              Eliminar rol
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              Acción irreversible
            </Typography>
          </div>
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth='sm'
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px',
            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04)'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 bg-error-50 rounded-lg flex items-center justify-center'>
              <i className='ri-alert-line text-error text-lg' />
            </div>
            <div>
              <Typography variant='h6' className='font-semibold text-error'>
                Confirmar eliminación
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                Esta acción no se puede deshacer
              </Typography>
            </div>
          </div>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ p: 3 }}>
          {deleteErrors.length > 0 && (
            <Alert severity='error' sx={{ mb: 3, borderRadius: '8px' }}>
              <ul className='list-disc list-inside'>
                {deleteErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </Alert>
          )}

          <Stack spacing={3}>
            <Paper variant='outlined' sx={{ p: 3, borderRadius: '8px', bgcolor: 'error.50', borderColor: 'error.200' }}>
              <Typography className='mb-2 font-medium'>
                ¿Estás seguro de eliminar el rol <strong>{selectedRole?.description}</strong>?
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Esta acción eliminará permanentemente el rol y todas sus asignaciones.
              </Typography>
            </Paper>

            <div>
              <Typography variant='body2' className='mb-2 font-medium'>
                Para confirmar, escribe exactamente: <code className='bg-gray-100 px-1 py-0.5 rounded'>eliminar</code>
              </Typography>
              <TextField
                fullWidth
                label='Confirmación'
                value={deleteConfirm}
                onChange={e => setDeleteConfirm(e.target.value)}
                placeholder='eliminar'
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px'
                  }
                }}
              />
            </div>
          </Stack>
        </DialogContent>

        <Divider />
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={dialogLoading}
            sx={{ borderRadius: '8px', textTransform: 'none' }}
          >
            Cancelar
          </Button>
          <Button
            variant='contained'
            color='error'
            onClick={deleteRole}
            disabled={dialogLoading || deleteConfirm !== 'eliminar'}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              px: 3
            }}
          >
            {dialogLoading && <CircularProgress size={16} sx={{ mr: 1 }} />}
            Eliminar Definitivamente
          </Button>
        </DialogActions>
      </Dialog>

      {/* Role Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth='lg'
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px',
            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04)',
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 bg-info-50 rounded-lg flex items-center justify-center'>
              <i className='ri-shield-user-line text-info text-lg' />
            </div>
            <div>
              <Typography variant='h6' className='font-semibold'>
                Detalle del Rol
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                Información completa y permisos asignados
              </Typography>
            </div>
          </div>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ p: 0 }}>
          {detailLoading ? (
            <div className='flex flex-col items-center justify-center py-12'>
              <CircularProgress size={32} />
              <Typography variant='body2' color='text.secondary' sx={{ mt: 2 }}>
                Cargando información del rol...
              </Typography>
            </div>
          ) : roleDetail ? (
            <div className='p-6 space-y-8'>
              {/* Basic Info Card */}
              <Paper variant='outlined' sx={{ p: 3, borderRadius: '8px' }}>
                <Typography variant='h6' className='mb-4 font-semibold flex items-center gap-2'>
                  <i className='ri-information-line' />
                  Información Básica
                </Typography>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                  <div>
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      className='uppercase font-medium tracking-wide'
                    >
                      Código
                    </Typography>
                    <Typography variant='body1' className='font-mono mt-1'>
                      #{roleDetail.code}
                    </Typography>
                  </div>

                  <div>
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      className='uppercase font-medium tracking-wide'
                    >
                      Tipo de Rol
                    </Typography>
                    <div className='mt-1'>
                      {roleDetail.root ? (
                        <Chip label='Sistema (Root)' color='error' size='small' sx={{ borderRadius: '6px' }} />
                      ) : (
                        <Chip label='Usuario' color='success' size='small' sx={{ borderRadius: '6px' }} />
                      )}
                    </div>
                  </div>

                  <div>
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      className='uppercase font-medium tracking-wide'
                    >
                      Estado
                    </Typography>
                    <div className='mt-1'>
                      <Chip
                        label='Activo'
                        color='success'
                        variant='outlined'
                        size='small'
                        sx={{ borderRadius: '6px' }}
                      />
                    </div>
                  </div>

                  <div className='md:col-span-3'>
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      className='uppercase font-medium tracking-wide'
                    >
                      Descripción
                    </Typography>
                    <Typography variant='body1' className='mt-1 font-medium'>
                      {roleDetail.description}
                    </Typography>
                  </div>

                  <div>
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      className='uppercase font-medium tracking-wide'
                    >
                      Fecha de Creación
                    </Typography>
                    <Typography variant='body2' className='mt-1'>
                      {roleDetail.created_at_co}
                    </Typography>
                  </div>

                  <div>
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      className='uppercase font-medium tracking-wide'
                    >
                      Creado Por
                    </Typography>
                    <Typography variant='body2' className='mt-1 capitalize font-medium'>
                      {roleDetail.created_by}
                    </Typography>
                  </div>
                </div>
              </Paper>

              {/* Users Section */}
              <Paper variant='outlined' sx={{ p: 3, borderRadius: '8px' }}>
                <div className='flex items-center justify-between mb-4'>
                  <Typography variant='h6' className='font-semibold flex items-center gap-2'>
                    <i className='ri-user-line' />
                    Usuarios Asignados
                    <Badge badgeContent={roleDetail.usedByUsers.length} color='primary' sx={{ ml: 1 }} />
                  </Typography>
                </div>
                {roleDetail.usedByUsers.length > 0 ? (
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                    {roleDetail.usedByUsers.map((email, index) => (
                      <Paper key={index} variant='outlined' sx={{ p: 2, borderRadius: '6px', bgcolor: 'primary.50' }}>
                        <div className='flex items-center gap-3'>
                          <div className='w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center'>
                            <i className='ri-user-line text-primary text-sm' />
                          </div>
                          <div>
                            <Typography variant='body2' className='font-medium'>
                              {email}
                            </Typography>
                            <Typography variant='caption' color='text.secondary'>
                              Usuario activo
                            </Typography>
                          </div>
                        </div>
                      </Paper>
                    ))}
                  </div>
                ) : (
                  <div className='text-center py-8'>
                    <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3'>
                      <i className='ri-user-line text-2xl text-gray-400' />
                    </div>
                    <Typography color='text.secondary' className='italic'>
                      No hay usuarios asignados a este rol
                    </Typography>
                  </div>
                )}
              </Paper>

              {/* Permissions Section */}
              <Paper variant='outlined' sx={{ p: 3, borderRadius: '8px' }}>
                <div className='flex items-center justify-between mb-4'>
                  <Typography variant='h6' className='font-semibold flex items-center gap-2'>
                    <i className='ri-shield-keyhole-line' />
                    Permisos Asignados
                    <Badge badgeContent={roleDetail.permissions.length} color='secondary' sx={{ ml: 1 }} />
                  </Typography>
                  <Button
                    variant='outlined'
                    size='small'
                    onClick={() => handlePermissionsClick(roleDetail)}
                    startIcon={<i className='ri-settings-4-line' />}
                    sx={{ borderRadius: '6px', textTransform: 'none' }}
                  >
                    Gestionar
                  </Button>
                </div>
                {roleDetail.permissions.length > 0 ? (
                  <div className='max-h-96 overflow-y-auto'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                      {roleDetail.permissions.map((permission, index) => (
                        <Paper
                          key={index}
                          variant='outlined'
                          sx={{ p: 3, borderRadius: '6px', bgcolor: 'secondary.50' }}
                        >
                          <div className='flex justify-between items-start gap-3'>
                            <div className='flex-1'>
                              <Typography variant='body2' className='font-medium mb-1'>
                                {permission.code}
                              </Typography>
                              <Typography variant='caption' color='text.secondary' className='block mb-2'>
                                {permission.description}
                              </Typography>
                              <Chip
                                label='Asignado'
                                color='success'
                                size='small'
                                variant='outlined'
                                sx={{ borderRadius: '4px', fontSize: '10px', height: '20px' }}
                              />
                            </div>
                            <Tooltip title='Revocar permiso'>
                              <IconButton
                                size='small'
                                onClick={() => revokePermissions([permission.code])}
                                sx={{ color: 'error.main', '&:hover': { bgcolor: 'error.50' } }}
                              >
                                <i className='ri-delete-bin-line text-sm' />
                              </IconButton>
                            </Tooltip>
                          </div>
                        </Paper>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className='text-center py-8'>
                    <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3'>
                      <i className='ri-shield-keyhole-line text-2xl text-gray-400' />
                    </div>
                    <Typography color='text.secondary' className='italic mb-3'>
                      No hay permisos asignados a este rol
                    </Typography>
                    <Button
                      variant='contained'
                      size='small'
                      onClick={() => handlePermissionsClick(roleDetail)}
                      startIcon={<i className='ri-add-line' />}
                      sx={{ borderRadius: '6px', textTransform: 'none' }}
                    >
                      Asignar Permisos
                    </Button>
                  </div>
                )}
              </Paper>
            </div>
          ) : null}
        </DialogContent>

        <Divider />
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button onClick={() => setDetailDialogOpen(false)} sx={{ borderRadius: '8px', textTransform: 'none' }}>
            Cerrar
          </Button>
          {roleDetail && (
            <Button
              variant='contained'
              onClick={() => {
                setDetailDialogOpen(false)
                handleEditRole(roleDetail)
              }}
              startIcon={<i className='ri-edit-line' />}
              sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
            >
              Editar Rol
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Permissions Management Dialog */}
      <Dialog
        open={permissionsDialogOpen}
        onClose={() => setPermissionsDialogOpen(false)}
        maxWidth='md'
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px',
            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04)'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 bg-warning-50 rounded-lg flex items-center justify-center'>
              <i className='ri-shield-keyhole-line text-warning text-lg' />
            </div>
            <div>
              <Typography variant='h6' className='font-semibold'>
                Gestionar Permisos
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                Rol: {selectedRole?.description}
              </Typography>
            </div>
          </div>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ p: 3 }}>
          {permissionsLoading ? (
            <div className='flex flex-col items-center justify-center py-8'>
              <CircularProgress size={24} />
              <Typography variant='body2' color='text.secondary' sx={{ mt: 2 }}>
                Cargando permisos disponibles...
              </Typography>
            </div>
          ) : (
            <Stack spacing={3}>
              <Autocomplete
                multiple
                options={availablePermissions}
                getOptionLabel={option => `${option.code} - ${option.description}`}
                value={selectedPermissions}
                onChange={(_, newValue) => setSelectedPermissions(newValue)}
                renderInput={params => (
                  <TextField
                    {...params}
                    label='Seleccionar permisos'
                    placeholder='Buscar y seleccionar permisos...'
                    helperText={`${availablePermissions.length} permisos disponibles`}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px'
                      }
                    }}
                  />
                )}
                renderOption={(props, option) => {
                  const { key, ...otherProps } = props
                  return (
                    <Box component='li' key={key} {...otherProps} sx={{ p: 2 }}>
                      <div className='w-full'>
                        <Typography variant='body2' className='font-medium'>
                          {option.code}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          {option.description}
                        </Typography>
                      </div>
                    </Box>
                  )
                }}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant='outlined'
                      label={option.code}
                      {...getTagProps({ index })}
                      key={option.code}
                      sx={{ borderRadius: '6px' }}
                    />
                  ))
                }
                noOptionsText='No hay permisos disponibles'
                sx={{
                  '& .MuiChip-root': {
                    borderRadius: '6px'
                  }
                }}
              />

              {selectedPermissions.length > 0 && (
                <Alert severity='info' sx={{ borderRadius: '8px' }}>
                  <Typography variant='body2'>
                    Se asignarán <strong>{selectedPermissions.length}</strong> permisos al rol{' '}
                    <strong>{selectedRole?.description}</strong>.
                  </Typography>
                </Alert>
              )}
            </Stack>
          )}
        </DialogContent>

        <Divider />
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={() => setPermissionsDialogOpen(false)}
            disabled={permissionsLoading}
            sx={{ borderRadius: '8px', textTransform: 'none' }}
          >
            Cancelar
          </Button>
          <Button
            variant='contained'
            onClick={assignPermissions}
            disabled={permissionsLoading || selectedPermissions.length === 0}
            startIcon={permissionsLoading ? <CircularProgress size={16} /> : <i className='ri-shield-check-line' />}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              px: 3
            }}
          >
            Asignar Permisos
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default RolesTable
