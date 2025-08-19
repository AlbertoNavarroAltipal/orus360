// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'

type PermissionDialogProps = {
  open: boolean
  setOpen: (open: boolean) => void
  data?: string
}

type EditProps = {
  handleClose: () => void
  data: string
}

const AddContent = ({ handleClose }: { handleClose: () => void }) => {
  return (
    <>
      <DialogContent className='overflow-visible pbs-0 sm:pli-16'>
        <IconButton onClick={handleClose} className='absolute block-start-4 inline-end-4'>
          <i className='ri-close-line text-textSecondary' />
        </IconButton>
        <TextField
          fullWidth
          label='Nombre del permiso'
          variant='outlined'
          placeholder='Ingresa el nombre del permiso'
          className='mbe-2'
        />
        <FormControlLabel control={<Checkbox />} label='Establecer como permiso principal' />
      </DialogContent>
      <DialogActions className='max-sm:flex-col max-sm:items-center gap-2 justify-center pbs-0 sm:pbe-16 sm:pli-16'>
        <Button type='submit' variant='contained' onClick={handleClose}>
          Crear permiso
        </Button>
        <Button onClick={handleClose} variant='outlined'>
          Descartar
        </Button>
      </DialogActions>
    </>
  )
}

const EditContent = ({ handleClose, data }: EditProps) => {
  return (
    <DialogContent className='overflow-visible pbs-0 sm:pli-16'>
      <IconButton onClick={handleClose} className='absolute block-start-4 inline-end-4'>
        <i className='ri-close-line text-textSecondary' />
      </IconButton>
      <Alert severity='warning' className='mbe-8'>
        <AlertTitle>¡Advertencia!</AlertTitle>
        Al editar el nombre del permiso, podrías afectar la funcionalidad del sistema de permisos. Asegúrate por
        completo antes de continuar.
      </Alert>
      <div className='flex items-center gap-4 mbe-2'>
        <TextField
          fullWidth
          size='small'
          defaultValue={data}
          variant='outlined'
          placeholder='Ingresa el nombre del permiso'
        />
        <Button variant='contained' onClick={handleClose}>
          Actualizar
        </Button>
      </div>
      <FormControlLabel control={<Checkbox />} label='Establecer como permiso principal' />
    </DialogContent>
  )
}

const PermissionDialog = ({ open, setOpen, data }: PermissionDialogProps) => {
  const handleClose = () => {
    setOpen(false)
  }

  return (
    <Dialog open={open} onClose={handleClose} closeAfterTransition={false}>
      <DialogTitle variant='h4' className='flex flex-col gap-2 text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
        {data ? 'Editar permiso' : 'Agregar nuevo permiso'}
        <Typography component='span' className='flex flex-col text-center'>
          {data ? 'Edita el permiso según tus necesidades.' : 'Permisos que puedes usar y asignar a tus usuarios.'}
        </Typography>
      </DialogTitle>
      {data ? <EditContent handleClose={handleClose} data={data} /> : <AddContent handleClose={handleClose} />}
    </Dialog>
  )
}

export default PermissionDialog
