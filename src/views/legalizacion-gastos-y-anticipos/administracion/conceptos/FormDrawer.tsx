// src/views/legalizacion-gastos-y-anticipos/administracion/conceptos/FormDrawer.tsx
'use client'

import * as React from 'react'

import Drawer from '@mui/material/Drawer'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import CircularProgress from '@mui/material/CircularProgress'
import { useForm, Controller } from 'react-hook-form'
import { listActiveCategories } from '@/libs/orus/conceptos'

type BaseValues = {
  concepto: string
  cuenta_contable: string
  categoria_proyecto: string | number | ''
  estado: boolean
}
type CreateValues = BaseValues & { codigo?: string }

type Props = {
  open: boolean
  token: string
  mode?: 'crear' | 'editar'
  initialValues?: CreateValues
  apiErrors?: string[] | null
  onClose: () => void
  onSubmit: (payload: CreateValues) => Promise<void> | void
}

export default function FormDrawer({
  open,
  token,
  mode = 'crear',
  initialValues = { concepto: '', cuenta_contable: '', categoria_proyecto: '', codigo: '', estado: true },
  apiErrors = null,
  onClose,
  onSubmit
}: Props) {
  const [submitting, setSubmitting] = React.useState(false)
  const { control, handleSubmit, reset, setError, clearErrors, getValues, setValue } = useForm<CreateValues>({
    defaultValues: initialValues
  })

  // catálogo categorías activas
  const [loadingCats, setLoadingCats] = React.useState(false)
  const [cats, setCats] = React.useState<Array<{ id: string; descripcion: string }>>([])

  // Rehidrata valores al cambiar modo/fila
  React.useEffect(() => {
    reset(initialValues)
    clearErrors()
  }, [initialValues, reset, clearErrors])

  // Cargar categorías activas al abrir
  React.useEffect(() => {
    if (!open || !token) return
    let mounted = true
    ;(async () => {
      setLoadingCats(true)
      try {
        const res = await listActiveCategories(token)
        if (!mounted) return
        const items = res.data.map(c => ({ id: String(c.id), descripcion: c.descripcion }))
        setCats(items)
        const current = String(getValues('categoria_proyecto') ?? '')
        if (current && !items.some(i => i.id === current)) {
          setValue('categoria_proyecto', '')
        }
      } catch (e: any) {
        console.error('Error cargando categorías activas:', e?.detail ?? e)
        if (mounted) setCats([])
      } finally {
        if (mounted) setLoadingCats(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [open, token, getValues, setValue])

  // Mapear errores del backend a campos
  React.useEffect(() => {
    if (!apiErrors || !apiErrors.length) return

    clearErrors()

    const lowerList = apiErrors.map(m => m.toLowerCase())
    const includesAny = (msg: string, keys: string[]) => keys.some(k => msg.includes(k))

    lowerList.forEach((msg, idx) => {
      if (includesAny(msg, ['concepto'])) {
        setError('concepto', { type: 'server', message: apiErrors[idx] })
        return
      }
      if (includesAny(msg, ['código', 'codigo'])) {
        setError('codigo', { type: 'server', message: apiErrors[idx] })
        return
      }
      if (includesAny(msg, ['cuenta contable', 'cuenta_contable'])) {
        setError('cuenta_contable', { type: 'server', message: apiErrors[idx] })
        return
      }
      if (includesAny(msg, ['categoría de proyecto', 'categoria de proyecto', 'categoria_proyecto'])) {
        setError('categoria_proyecto', { type: 'server', message: apiErrors[idx] })
        return
      }
      // otros mensajes se quedan en el Alert general
    })
  }, [apiErrors, clearErrors, setError])

  const submit = async (v: CreateValues) => {
    setSubmitting(true)
    try {
      // normalizaciones antes de enviar
      const payload: any = {
        concepto: v.concepto?.trim(),
        cuenta_contable: String(v.cuenta_contable ?? '').trim(),
        categoria_proyecto: v.categoria_proyecto === '' ? '' : String(v.categoria_proyecto),
        estado: !!v.estado
      }
      if (mode === 'crear') {
        payload.codigo = String(v.codigo ?? '')
          .trim()
          .toUpperCase()
      }
      await onSubmit(payload)
    } finally {
      setSubmitting(false)
    }
  }

  const isCreate = mode === 'crear'

  return (
    <Drawer anchor='right' open={open} onClose={onClose}>
      <Box sx={{ width: { xs: 360, sm: 420 }, p: 4 }}>
        <Typography variant='h6' sx={{ mb: 2 }}>
          {isCreate ? 'Nuevo concepto' : 'Editar concepto'}
        </Typography>

        {apiErrors && apiErrors.length ? (
          <Alert severity='error' sx={{ mb: 2 }}>
            <Typography variant='subtitle2' sx={{ mb: 0.5 }}>
              Corrige los siguientes puntos:
            </Typography>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {apiErrors.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          </Alert>
        ) : null}

        <form onSubmit={handleSubmit(submit)}>
          <Controller
            name='concepto'
            control={control}
            rules={{
              required: 'El concepto es obligatorio',
              minLength: { value: 3, message: 'Mínimo 3 caracteres' },
              maxLength: { value: 255, message: 'Máximo 255 caracteres' },
              validate: v => (v?.trim()?.length ? true : 'El concepto no puede estar vacío')
            }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                autoFocus
                fullWidth
                label='Concepto'
                margin='normal'
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />

          {isCreate && (
            <Controller
              name='codigo'
              control={control}
              rules={{
                required: 'El código es obligatorio',
                pattern: {
                  value: /^[A-Z0-9]{1,3}$/,
                  message: 'Solo MAYÚSCULAS y números (1–3 caracteres)'
                }
              }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  fullWidth
                  label='Código'
                  margin='normal'
                  inputProps={{ maxLength: 3 }}
                  onChange={e => {
                    const raw = e.target.value || ''
                    const next = raw.replace(/\s+/g, '').toUpperCase()
                    field.onChange(next)
                  }}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          )}

          <Controller
            name='cuenta_contable'
            control={control}
            rules={{
              required: 'La cuenta contable es obligatoria',
              pattern: { value: /^[0-9]+$/, message: 'Solo números' },
              minLength: { value: 4, message: 'Mínimo 4 dígitos' }
            }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                fullWidth
                label='Cuenta contable'
                margin='normal'
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name='categoria_proyecto'
            control={control}
            rules={{ required: 'Selecciona una categoría' }}
            render={({ field, fieldState }) => (
              <FormControl fullWidth margin='normal' error={!!fieldState.error}>
                <InputLabel id='categoria-proyecto-label'>Categoría de proyecto</InputLabel>
                <Select
                  labelId='categoria-proyecto-label'
                  label='Categoría de proyecto'
                  value={field.value === undefined || field.value === null ? '' : String(field.value)}
                  onChange={e => field.onChange(e.target.value)}
                  renderValue={val => {
                    if (!val) return ''
                    const item = cats.find(c => c.id === val)
                    return item ? `${item.descripcion}` : String(val)
                  }}
                >
                  {loadingCats ? (
                    <MenuItem disabled>
                      <CircularProgress size={16} sx={{ mr: 1 }} /> Cargando...
                    </MenuItem>
                  ) : cats.length ? (
                    cats.map(c => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.descripcion}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No hay categorías activas</MenuItem>
                  )}
                </Select>
                {fieldState.error ? (
                  <Typography variant='caption' color='error' sx={{ mt: 0.5 }}>
                    {fieldState.error.message}
                  </Typography>
                ) : null}
              </FormControl>
            )}
          />

          <FormControlLabel
            control={
              <Controller
                name='estado'
                control={control}
                render={({ field }) => (
                  <Switch checked={!!field.value} onChange={e => field.onChange(e.target.checked)} />
                )}
              />
            }
            label='Activo'
            sx={{ mt: 1 }}
          />

          <Divider sx={{ my: 2 }} />

          <Box display='flex' justifyContent='flex-end' gap={2}>
            <Button onClick={onClose} disabled={submitting}>
              Cancelar
            </Button>
            <Button type='submit' variant='contained' disabled={submitting}>
              {isCreate ? 'Crear' : 'Guardar cambios'}
            </Button>
          </Box>
        </form>
      </Box>
    </Drawer>
  )
}
