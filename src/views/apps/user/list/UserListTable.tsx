'use client'

// React Imports
import { useEffect, useState, useMemo } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import { styled } from '@mui/material/styles'
import type { TextFieldProps } from '@mui/material/TextField'

// MUI X Data Grid
import { DataGridPremium, type GridColDef, type GridFilterModel } from '@mui/x-data-grid-premium'

// Third-party Imports
// classnames no longer used

// Type Imports
import type { ThemeColor } from '@core/types'
import type { UsersType } from '@/types/apps/userTypes'
import type { Locale } from '@configs/i18n'

// Component Imports
import TableFilters from './TableFilters'
import AddUserDrawer from './AddUserDrawer'
import OptionMenu from '@core/components/option-menu'
import CustomAvatar from '@core/components/mui/Avatar'

// Util Imports
import { getInitials } from '@/utils/getInitials'
import { getLocalizedUrl } from '@/utils/i18n'

// Style Imports
// import tableStyles from '@core/styles/table.module.css'

// UsersTypeWithAction ya no es necesario con DataGrid

type UserRoleType = {
  [key: string]: { icon: string; color: string }
}

type UserStatusType = {
  [key: string]: ThemeColor
}

// Styled Components
const Icon = styled('i')({})

// Eliminado: filtros fuzzy de TanStack; usaremos quickFilter de DataGrid

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
  // States
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return <TextField {...props} value={value} onChange={e => setValue(e.target.value)} size='small' />
}

// Vars
const userRoleObj: UserRoleType = {
  admin: { icon: 'ri-vip-crown-line', color: 'error' },
  author: { icon: 'ri-computer-line', color: 'warning' },
  editor: { icon: 'ri-edit-box-line', color: 'info' },
  maintainer: { icon: 'ri-pie-chart-2-line', color: 'success' },
  subscriber: { icon: 'ri-user-3-line', color: 'primary' }
}

const userStatusObj: UserStatusType = {
  active: 'success',
  pending: 'warning',
  inactive: 'secondary'
}

// Column Definitions handled via GridColDef en DataGrid

const UserListTable = ({ tableData }: { tableData?: UsersType[] }) => {
  // States
  const [addUserOpen, setAddUserOpen] = useState(false)
  const [data, setData] = useState(...[tableData])
  const [filteredData, setFilteredData] = useState(data)
  const [globalFilter, setGlobalFilter] = useState('')
  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [], quickFilterValues: [] })

  // Hooks
  const { lang: locale } = useParams()

  const columns = useMemo<GridColDef[]>(
    () => [
      {
        field: 'fullName',
        headerName: 'Usuario',
        flex: 1.3,
        minWidth: 220,
        sortable: true,
        renderCell: params => (
          <div className='flex items-center gap-4'>
            {getAvatar({ avatar: (params.row as UsersType).avatar, fullName: params.value })}
            <div className='flex flex-col'>
              <Typography className='font-medium' color='text.primary'>
                {params.value}
              </Typography>
              <Typography variant='body2'>{(params.row as UsersType).username}</Typography>
            </div>
          </div>
        )
      },
      {
        field: 'email',
        headerName: 'Correo',
        flex: 1,
        minWidth: 200,
        renderCell: params => <Typography>{params.value || '—'}</Typography>
      },
      {
        field: 'contact',
        headerName: 'Contacto',
        flex: 0.8,
        minWidth: 140,
        renderCell: params => <Typography>{params.value || '—'}</Typography>
      },
      {
        field: 'phoneVerified',
        headerName: 'Teléfono verificado',
        flex: 0.8,
        minWidth: 180,
        sortable: false,
        renderCell: params => (
          <Chip
            variant='tonal'
            label={params.value ? 'Sí' : 'No'}
            size='small'
            color={params.value ? 'success' : 'secondary'}
            className='capitalize'
          />
        )
      },
      {
        field: 'emailVerified',
        headerName: 'Correo verificado',
        flex: 0.8,
        minWidth: 160,
        sortable: false,
        renderCell: params => (
          <Chip
            variant='tonal'
            label={params.value ? 'Sí' : 'No'}
            size='small'
            color={params.value ? 'success' : 'secondary'}
            className='capitalize'
          />
        )
      },
      {
        field: 'role',
        headerName: 'Rol',
        flex: 0.8,
        minWidth: 160,
        renderCell: params => (
          <div className='flex items-center gap-2'>
            {params.value && userRoleObj[params.value as string] ? (
              <Icon
                className={userRoleObj[params.value as string].icon}
                sx={{
                  color: `var(--mui-palette-${userRoleObj[params.value as string].color}-main)`,
                  fontSize: '1.375rem'
                }}
              />
            ) : (
              <Icon
                className='ri-user-3-line'
                sx={{ fontSize: '1.375rem', color: 'var(--mui-palette-text-secondary)' }}
              />
            )}
            <Typography className='capitalize' color='text.primary'>
              {params.value || '—'}
            </Typography>
          </div>
        )
      },
      {
        field: 'status',
        headerName: 'Estado',
        flex: 0.8,
        minWidth: 160,
        renderCell: params => {
          const s = ((params.row as any).cognitoStatus as string) || (params.value as string)

          const map: Record<string, string> = {
            active: 'activo',
            pending: 'pendiente',
            inactive: 'inactivo',
            UNCONFIRMED: 'no confirmado',
            CONFIRMED: 'confirmado',
            ARCHIVED: 'archivado',
            COMPROMISED: 'comprometido',
            UNKNOWN: 'desconocido',
            RESET_REQUIRED: 'reinicio requerido',
            FORCE_CHANGE_PASSWORD: 'cambio de contraseña forzado',
            EXTERNAL_PROVIDER: 'proveedor externo'
          }

          return (
            <Chip
              variant='tonal'
              label={map[s] || s || '—'}
              size='small'
              color={userStatusObj[(params.row as any).status] || 'secondary'}
              className='capitalize'
            />
          )
        }
      },
      {
        field: 'createdAt',
        headerName: 'Fecha de creación',
        flex: 1,
        minWidth: 200,
        renderCell: params => {
          const v = params.value as string | number | undefined

          if (!v) return <Typography>—</Typography>

          const d = new Date(Number(v))

          const formatted = isNaN(d.getTime())
            ? String(v)
            : new Intl.DateTimeFormat(undefined, {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              }).format(d)

          return <Typography>{formatted}</Typography>
        }
      },
      {
        field: 'actions',
        headerName: 'Acciones',
        sortable: false,
        filterable: false,
        align: 'left',
        headerAlign: 'left',
        minWidth: 160,
        renderCell: params => (
          <div className='flex items-center'>
            <IconButton onClick={() => setData(prev => prev?.filter(u => u.id !== (params.row as UsersType).id))}>
              <i className='ri-delete-bin-7-line text-textSecondary' />
            </IconButton>
            <IconButton>
              <Link href={getLocalizedUrl('/apps/user/view', locale as Locale)} className='flex'>
                <i className='ri-eye-line text-textSecondary' />
              </Link>
            </IconButton>
            <OptionMenu
              iconButtonProps={{ size: 'medium' }}
              iconClassName='text-textSecondary'
              options={[
                {
                  text: 'Descargar',
                  icon: 'ri-download-line',
                  menuItemProps: { className: 'flex items-center gap-2 text-textSecondary' }
                },
                {
                  text: 'Editar',
                  icon: 'ri-edit-box-line',
                  menuItemProps: { className: 'flex items-center gap-2 text-textSecondary' }
                }
              ]}
            />
          </div>
        )
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, filteredData]
  )

  // Sin TanStack: DataGrid maneja sorting, filtering y pagination internamente

  const getAvatar = (params: Pick<UsersType, 'avatar' | 'fullName'>) => {
    const { avatar, fullName } = params

    if (avatar) {
      return <CustomAvatar src={avatar} skin='light' size={34} />
    } else {
      return (
        <CustomAvatar skin='light' size={34}>
          {getInitials(fullName as string)}
        </CustomAvatar>
      )
    }
  }

  return (
    <>
      <Card>
        <CardHeader title='Filtros' />
        <TableFilters setData={setFilteredData} tableData={data} />
        <Divider />
        <div className='flex justify-between p-5 gap-4 flex-col items-start sm:flex-row sm:items-center'>
          <Button
            color='secondary'
            variant='outlined'
            startIcon={<i className='ri-upload-2-line text-xl' />}
            className='max-sm:is-full'
          >
            Exportar
          </Button>
          <div className='flex items-center gap-x-4 gap-4 flex-col max-sm:is-full sm:flex-row'>
            <DebouncedInput
              value={globalFilter ?? ''}
              onChange={value => {
                const v = String(value)

                setGlobalFilter(v)
                setFilterModel(prev => ({ ...prev, quickFilterValues: v ? [v] : [] }))
              }}
              placeholder='Buscar usuario'
              className='max-sm:is-full'
            />
            <Button variant='contained' onClick={() => setAddUserOpen(!addUserOpen)} className='max-sm:is-full'>
              Agregar usuario
            </Button>
          </div>
        </div>
        <div className='overflow-x-auto'>
          <div style={{ width: '100%' }}>
            <DataGridPremium
              autoHeight
              rows={filteredData || []}
              columns={columns}
              checkboxSelection
              disableRowSelectionOnClick
              pagination
              pageSizeOptions={[10, 25, 50]}
              initialState={{
                pagination: { paginationModel: { page: 0, pageSize: 10 } }
              }}
              filterModel={filterModel}
              onFilterModelChange={setFilterModel}
              getRowId={row => (row as UsersType).id}
              slots={{
                noRowsOverlay: () => (
                  <div className='py-6 text-center'>
                    <Typography>No hay datos</Typography>
                  </div>
                )
              }}
            />
          </div>
        </div>
      </Card>
      <AddUserDrawer
        open={addUserOpen}
        handleClose={() => setAddUserOpen(!addUserOpen)}
        userData={data}
        setData={setData}
      />
    </>
  )
}

export default UserListTable
