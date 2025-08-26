'use client'

import * as React from 'react'

import { DataGridPremium, GridColDef, GridRenderCellParams, GridToolbar } from '@mui/x-data-grid-premium'

import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'

import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'

import type { Concept } from './index'

type Props = {
  rows: Concept[]
  loading?: boolean
  quickFilter?: string
  page: number // 1-based
  pageSize: number
  rowCount: number
  onPageChange: (newPage: number) => void
  onPageSizeChange: (newPageSize: number) => void
  sortModel: any
  onSortModelChange: (model: any) => void
  onRowDoubleClick?: (row: Concept) => void
  onEditRow?: (row: Concept) => void
  onRequestDeleteRow?: (row: Concept) => void
}

/** dd/mm/aaaa (Colombia) */
const renderDateCO = (v: unknown) => {
  const t = typeof v === 'number' ? v : v instanceof Date ? v.getTime() : v ? Date.parse(String(v)) : NaN

  if (isNaN(t)) return ''
  const d = new Date(t)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()

  return `${dd}/${mm}/${yyyy}`
}

/** Menú de acciones por fila */
const RowActions: React.FC<{
  row: Concept
  onEditRow?: (row: Concept) => void
  onRequestDeleteRow?: (row: Concept) => void
}> = ({ row, onEditRow, onRequestDeleteRow }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  return (
    <>
      <IconButton
        size='small'
        onClick={e => {
          e.stopPropagation()
          setAnchorEl(e.currentTarget)
        }}
      >
        <i className='ri-more-2-line' />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        onClick={e => e.stopPropagation()}
      >
        <MenuItem
          onClick={() => {
            setAnchorEl(null)
            onEditRow?.(row)
          }}
        >
          <ListItemIcon>
            <i className='ri-edit-line' />
          </ListItemIcon>
          <ListItemText primary='Editar' />
        </MenuItem>

        <MenuItem
          onClick={() => {
            setAnchorEl(null)
            onRequestDeleteRow?.(row)
          }}
        >
          <ListItemIcon>
            <i className='ri-delete-bin-6-line' />
          </ListItemIcon>
          <ListItemText primary='Eliminar' />
        </MenuItem>
      </Menu>
    </>
  )
}

const Datagrid: React.FC<Props> = ({
  rows,
  loading = false,
  quickFilter = '',
  page,
  pageSize,
  rowCount,
  onPageChange,
  onPageSizeChange,
  sortModel,
  onSortModelChange,
  onRowDoubleClick,
  onEditRow,
  onRequestDeleteRow
}) => {
  const columns = React.useMemo<GridColDef<Concept>[]>(
    () => [
      // ✅ “Código” visual: proviene de rows[i].codigoVisual (id padded)
      {
        field: 'codigoVisual',
        headerName: 'Código',
        width: 110
      },
      {
        field: 'concepto',
        headerName: 'Concepto',
        flex: 1.4,
        minWidth: 200
      },
      {
        field: 'codigo',
        headerName: 'Código (API)',
        width: 120
      },
      {
        field: 'cuentaContable',
        headerName: 'Cuenta contable',
        width: 160
      },
      {
        field: 'categoria',
        headerName: 'Categoría',
        flex: 1,
        minWidth: 160,
        valueGetter: params => params?.row?.categoriaProyectoDesc ?? params?.row?.categoriaProyecto ?? '',

        renderCell: (params: GridRenderCellParams<string>) => {
          const nombre = params?.row?.categoriaProyectoDesc
          const idCat = params?.row?.categoriaProyecto

          return <span title={idCat ? `ID: ${idCat}` : ''}>{nombre || idCat || ''}</span>
        }
      },
      {
        field: 'estado',
        headerName: 'Estado',
        width: 120,
        sortable: false,
        renderCell: (params: GridRenderCellParams<boolean>) =>
          params.value ? (
            <Chip size='small' label='Activo' color='success' variant='outlined' />
          ) : (
            <Chip size='small' label='Inactivo' color='default' variant='outlined' />
          )
      },
      {
        field: 'createdAt',
        headerName: 'Fecha de creación',
        width: 160,
        renderCell: params => renderDateCO(params?.row?.createdAt)
      },
      {
        field: 'actions',
        headerName: '',
        width: 72,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        align: 'right',
        headerAlign: 'right',
        renderCell: params => (
          <RowActions row={params.row} onEditRow={onEditRow} onRequestDeleteRow={onRequestDeleteRow} />
        )
      }
    ],
    [onEditRow, onRequestDeleteRow]
  )

  const filterModel = React.useMemo(
    () => ({
      items: [] as any[],
      quickFilterValues: quickFilter ? [quickFilter] : []
    }),
    [quickFilter]
  )

  return (
    <Box
      sx={{
        height: 600,
        width: '100%',
        '& .MuiDataGrid-cell:focus,& .MuiDataGrid-cell:focus-within': { outline: 'none' }
      }}
    >
      <DataGridPremium
        rows={rows ?? []}
        getRowId={r => r.id}
        columns={columns}
        loading={loading}
        disableRowSelectionOnClick
        density='compact'
        filterModel={filterModel}
        slots={{ toolbar: GridToolbar }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
            quickFilterProps: { debounceMs: 300 }
          }
        }}
        initialState={{
          columns: {
            columnVisibilityModel: { codigo: false }
          }
        }}
        paginationMode='server'
        rowCount={rowCount ?? 0}
        pageSizeOptions={[5, 10, 20, 50]}
        paginationModel={{ page: Math.max(0, (page ?? 1) - 1), pageSize: pageSize ?? 10 }}
        onPaginationModelChange={m => {
          if (m.pageSize !== pageSize) onPageSizeChange(m.pageSize)
          if (m.page !== page - 1) onPageChange(m.page + 1)
        }}
        sortingMode='server'
        sortModel={sortModel ?? []}
        onSortModelChange={onSortModelChange}
        onRowDoubleClick={params => params?.row && onRowDoubleClick?.(params.row)}
      />
    </Box>
  )
}

export default Datagrid
