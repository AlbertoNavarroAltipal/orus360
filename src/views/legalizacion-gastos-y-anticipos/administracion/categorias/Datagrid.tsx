'use client'

import * as React from 'react'

import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'

import {
  DataGridPremium,
  type GridColDef,
  type GridFilterModel,
  type GridRowSelectionModel,
  type GridSortModel
} from '@mui/x-data-grid-premium'

import type { Category } from './index'

type Props = {
  rows: Category[]
  loading?: boolean
  quickFilter?: string
  onRowDoubleClick?: (row: Category) => void

  // paginación/sort
  page: number
  pageSize: number
  rowCount?: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  sortModel: GridSortModel
  onSortModelChange: (m: GridSortModel) => void

  // acciones por fila
  onEditRow: (row: Category) => void
  onRequestDeleteRow: (row: Category) => void
}

export default function Datagrid({
  rows,
  loading = false,
  quickFilter = '',
  onRowDoubleClick,
  page,
  pageSize,
  rowCount = 0,
  onPageChange,
  onPageSizeChange,
  sortModel,
  onSortModelChange,
  onEditRow,
  onRequestDeleteRow
}: Props) {
  const [filterModel, setFilterModel] = React.useState<GridFilterModel>({
    items: [],
    quickFilterValues: quickFilter ? [quickFilter] : []
  })

  React.useEffect(() => {
    setFilterModel(prev => ({ ...prev, quickFilterValues: quickFilter ? [quickFilter] : [] }))
  }, [quickFilter])

  // estado del menú de acciones (fila + ancla)
  const [menuEl, setMenuEl] = React.useState<null | HTMLElement>(null)
  const [menuRow, setMenuRow] = React.useState<Category | null>(null)
  const menuOpen = Boolean(menuEl)

  const openMenu = (row: Category, e: React.MouseEvent<HTMLElement>) => {
    setMenuRow(row)
    setMenuEl(e.currentTarget)
  }

  const closeMenu = () => {
    setMenuEl(null)
    setMenuRow(null)
  }

  const columns = React.useMemo<GridColDef[]>(
    () => [
      {
        field: 'descripcion',
        headerName: 'Descripción',
        flex: 2,
        minWidth: 240,
        sortable: true,
        headerAlign: 'left',
        align: 'left',
        renderCell: params => <Typography>{params.value || '—'}</Typography>
      },
      {
        field: 'estado',
        headerName: 'Estado',
        flex: 1,
        minWidth: 140,
        sortable: true,
        headerAlign: 'left',
        align: 'left',
        renderCell: params => (
          <Chip
            variant='tonal'
            size='small'
            color={params.value ? 'success' : 'secondary'}
            label={params.value ? 'Activo' : 'Inactivo'}
          />
        )
      },
      {
        field: 'createdAt',
        headerName: 'Fecha de creación',
        flex: 1.2,
        minWidth: 200,
        sortable: true,
        headerAlign: 'left',
        align: 'left',
        renderCell: params => {
          const v = params.value

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
        headerName: '',
        sortable: false,
        filterable: false,
        align: 'left',
        headerAlign: 'left',
        minWidth: 64,
        renderCell: params => (
          <IconButton
            size='small'
            onClick={e => openMenu(params.row as Category, e)}
            aria-label='acciones'
            aria-controls={menuOpen ? 'row-actions' : undefined}
            aria-haspopup='true'
            aria-expanded={menuOpen ? 'true' : undefined}
          >
            <i className='ri-more-2-line' />
          </IconButton>
        )
      }
    ],
    [menuOpen]
  )

  const handleRowSelectionChange = (model: GridRowSelectionModel | { ids?: GridRowSelectionModel }) => {
    console.log('selected rows', model)
  }

  return (
    <Card
      sx={{
        '& .MuiDataGrid-root': { border: 'none' },
        '& .MuiDataGrid-cell': { display: 'flex', alignItems: 'center' }
      }}
    >
      <div className='overflow-x-auto'>
        <div style={{ width: '100%' }}>
          <DataGridPremium
            rows={rows}
            columns={columns}
            loading={loading}
            disableRowSelectionOnClick
            paginationMode='server'
            sortingMode='server'
            pagination
            pageSizeOptions={[10, 25, 50]}
            rowCount={rowCount}
            onPaginationModelChange={m => {
              onPageChange((m.page ?? 0) + 1)
              onPageSizeChange(m.pageSize ?? pageSize)
            }}
            paginationModel={{ page: page - 1, pageSize }}
            sortModel={sortModel}
            onSortModelChange={onSortModelChange}
            getRowId={row => (row as Category).id}
            filterModel={filterModel}
            onFilterModelChange={setFilterModel}
            onRowSelectionModelChange={handleRowSelectionChange}
            onRowDoubleClick={params => onRowDoubleClick?.(params.row as Category)}
            slots={{
              noRowsOverlay: () => (
                <div className='py-6 text-center'>
                  <Typography>{loading ? 'Cargando…' : 'No hay datos'}</Typography>
                </div>
              )
            }}
          />
        </div>
      </div>

      {/* Menú de acciones por fila, anclado a la izquierda */}
      <Menu
        id='row-actions'
        anchorEl={menuEl}
        open={menuOpen}
        onClose={closeMenu}
        anchorOrigin={{ vertical: 'center', horizontal: 'left' }}
        transformOrigin={{ vertical: 'center', horizontal: 'right' }} // se despliega hacia la izquierda
      >
        <MenuItem
          onClick={() => {
            if (menuRow) onEditRow(menuRow)
            closeMenu()
          }}
        >
          <i className='ri-edit-box-line mr-2' /> Editar
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuRow) onRequestDeleteRow(menuRow)
            closeMenu()
          }}
        >
          <i className='ri-delete-bin-7-line mr-2' /> Eliminar
        </MenuItem>
      </Menu>
    </Card>
  )
}
