// Unificación de datos de menú minimalista según requerimientos del negocio
// Type Imports
import type { HorizontalMenuDataType, VerticalMenuDataType } from '@/types/menuTypes'
import type { getDictionary } from '@/utils/getDictionary'

// Horizontal Menu Data (mismas entradas que el vertical pero sin secciones)
export const horizontalMenuData = (dictionary: Awaited<ReturnType<typeof getDictionary>>): HorizontalMenuDataType[] => {
  void dictionary

  return [
    {
      label: 'inicio',
      icon: 'ri-home-smile-line',
      href: '/inicio'
    },
    {
      label: 'IAM',
      icon: 'ri-shield-keyhole-line',
      children: [
        { label: 'Personas', href: '/iam/personas', icon: 'ri-user-3-line' },
        { label: 'Roles', href: '/iam/roles', icon: 'ri-shield-user-line' },
        { label: 'Permisos', href: '/iam/permisos', icon: 'ri-key-2-line' },
        { label: 'Cargos', href: '/iam/cargos', icon: 'ri-briefcase-3-line' }
      ]
    },
    {
      label: 'Legalizacion gastos y anticipos',
      icon: 'ri-file-list-2-line',
      children: [
        {
          label: 'Administración',
          icon: 'ri-settings-3-line',
          children: [
            { label: 'Conceptos', href: '/legalizacion-gastos-y-anticipos/administracion/conceptos' },
            { label: 'Cierre contable', href: '/legalizacion-gastos-y-anticipos/administracion/cierre-contable' },
            { label: 'Roles del usuario', href: '/legalizacion-gastos-y-anticipos/administracion/roles-del-usuario' }
          ]
        },
        {
          label: 'Solicitudes',
          icon: 'ri-file-edit-line',
          children: [
            { label: 'Anticipos', href: '/legalizacion-gastos-y-anticipos/solicitudes/anticipos' },
            { label: 'Reembolsos', href: '/legalizacion-gastos-y-anticipos/solicitudes/reembolsos' }
          ]
        },
        {
          label: 'Consultas',
          icon: 'ri-search-line',
          children: [
            { label: 'Proveedores', href: '/legalizacion-gastos-y-anticipos/consultas/proveedores' },
            { label: 'Presupuestos', href: '/legalizacion-gastos-y-anticipos/consultas/presupuestos' },
            { label: 'Anticipos', href: '/legalizacion-gastos-y-anticipos/consultas/anticipos' },
            { label: 'Reembolsos', href: '/legalizacion-gastos-y-anticipos/consultas/reembolsos' }
          ]
        }
      ]
    }
  ]
}

// Vertical Menu Data (incluye secciones si se desea agrupar; aquí simple lista)
export const verticalMenuData = (dictionary: Awaited<ReturnType<typeof getDictionary>>): VerticalMenuDataType[] => {
  void dictionary

  return [
    {
      label: 'inicio',
      icon: 'ri-home-smile-line',
      href: '/inicio'
    },
    {
      label: 'IAM',
      icon: 'ri-shield-keyhole-line',
      children: [
        { label: 'Personas', href: '/iam/personas', icon: 'ri-user-3-line' },
        { label: 'Roles', href: '/iam/roles', icon: 'ri-shield-user-line' },
        { label: 'Permisos', href: '/iam/permisos', icon: 'ri-key-2-line' },
        { label: 'Cargos', href: '/iam/cargos', icon: 'ri-briefcase-3-line' }
      ]
    },
    {
      label: 'Legalizacion gastos y anticipos',
      icon: 'ri-file-list-2-line',
      children: [
        {
          label: 'Administración',
          icon: 'ri-settings-3-line',
          children: [
            { label: 'Conceptos', href: '/legalizacion-gastos-y-anticipos/administracion/conceptos' },
            { label: 'Cierre contable', href: '/legalizacion-gastos-y-anticipos/administracion/cierre-contable' },
            { label: 'Roles del usuario', href: '/legalizacion-gastos-y-anticipos/administracion/roles-del-usuario' }
          ]
        },
        {
          label: 'Solicitudes',
          icon: 'ri-file-edit-line',
          children: [
            { label: 'Anticipos', href: '/legalizacion-gastos-y-anticipos/solicitudes/anticipos' },
            { label: 'Reembolsos', href: '/legalizacion-gastos-y-anticipos/solicitudes/reembolsos' }
          ]
        },
        {
          label: 'Consultas',
          icon: 'ri-search-line',
          children: [
            { label: 'Proveedores', href: '/legalizacion-gastos-y-anticipos/consultas/proveedores' },
            { label: 'Presupuestos', href: '/legalizacion-gastos-y-anticipos/consultas/presupuestos' },
            { label: 'Anticipos', href: '/legalizacion-gastos-y-anticipos/consultas/anticipos' },
            { label: 'Reembolsos', href: '/legalizacion-gastos-y-anticipos/consultas/reembolsos' }
          ]
        }
      ]
    }
  ]
}
