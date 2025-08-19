// Component Imports
import Permissions from '@views/apps/permissions'

// Data Imports
import { getPermissionsData } from '@/app/server/actions'

/*
  Si necesita datos utilizando una llamada de API, sin comment el siguiente código API, actualice la variable `process.env.api_url` en la
 El archivo `.env` encontrado en la raíz de su proyecto y también actualiza los puntos finales de API como`/Apps/Permissions` en el siguiente ejemplo.
  Además, elimine la importación de acción del servidor anterior y la acción en sí del archivo `src/app/server/accion.ts` para limpiar el código no utilizado porque hemos utilizado la acción del servidor para obtener nuestros datos estáticos.
 */

/* const getPermissionsData = async () => {
  // Vars
  const res = await fetch(`${process.env.API_URL}/apps/permissions`)

  if (!res.ok) {
    throw new Error('Failed to fetch permissions data')
  }

  return res.json()
} */

const PermissionsApp = async () => {
  // Vars
  const data = await getPermissionsData()

  return <Permissions permissionsData={data} />
}

export default PermissionsApp
