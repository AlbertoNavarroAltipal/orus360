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
import { useForm, Controller } from 'react-hook-form'

type Props = {
  open: boolean
  mode?: 'crear' | 'editar'
  initialValues?: { descripcion: string; estado: boolean }
  apiError?: string | null // ⬅️ nuevo: mensaje de error a mostrar en el formulario
  onClose: () => void
  onSubmit: (payload: { descripcion: string; estado: boolean }) => Promise<void> | void
}

export default function FormDrawer({
  open,
  mode = 'crear',
  initialValues = { descripcion: '', estado: true },
  apiError = null,
  onClose,
  onSubmit
}: Props) {
  const [submitting, setSubmitting] = React.useState(false)
  const { control, handleSubmit, reset, setError, clearErrors } = useForm({ defaultValues: initialValues })

  // Rehidrata valores al cambiar modo/fila
  React.useEffect(() => {
    reset(initialValues)
    clearErrors()
  }, [initialValues, reset, clearErrors])

  // Si el backend dice que la descripción está duplicada o no válida, lo mostramos arriba
  React.useEffect(() => {
    if (apiError) {
      // Marca el field si es un caso común de descripción duplicada
      if (apiError.toLowerCase().includes('descripción')) {
        setError('descripcion', { type: 'server', message: apiError })
      }
    }
  }, [apiError, setError])

  const submit = async (v: { descripcion: string; estado: boolean }) => {
    setSubmitting(true)

    try {
      await onSubmit(v) // si el padre falla, NO cerramos aquí
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Drawer anchor='right' open={open} onClose={onClose}>
      <Box sx={{ width: { xs: 340, sm: 380 }, p: 4 }}>
        <Typography variant='h6' sx={{ mb: 2 }}>
          {mode === 'editar' ? 'Editar categoría' : 'Nueva categoría'}
        </Typography>

        {apiError ? (
          <Alert severity='error' sx={{ mb: 2 }}>
            {apiError}
          </Alert>
        ) : null}

        <form onSubmit={handleSubmit(submit)}>
          <Controller
            name='descripcion'
            control={control}
            rules={{
              required: 'La descripción es obligatoria',
              minLength: { value: 3, message: 'Mínimo 3 caracteres' },
              maxLength: { value: 255, message: 'Máximo 255 caracteres' },
              validate: v => (v?.trim()?.length ? true : 'La descripción no puede estar vacía')
            }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                autoFocus
                fullWidth
                label='Descripción'
                margin='normal'
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name='estado'
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Switch checked={field.value} onChange={e => field.onChange(e.target.checked)} />}
                label='Activo'
              />
            )}
          />

          <Divider sx={{ my: 2 }} />

          <Box display='flex' justifyContent='flex-end' gap={2}>
            <Button onClick={onClose} disabled={submitting}>
              Cancelar
            </Button>
            <Button type='submit' variant='contained' disabled={submitting}>
              {mode === 'editar' ? 'Guardar cambios' : 'Crear'}
            </Button>
          </Box>
        </form>
      </Box>
    </Drawer>
  )
}
