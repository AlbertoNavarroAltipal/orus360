// Generación dinámica desde el menú unificado
import { verticalMenuData } from '@/data/navigation/MenuData'
import type { VerticalMenuDataType } from '@/types/menuTypes'

type SearchData = {
  id: string
  name: string
  url: string
  excludeLang?: boolean
  icon: string
  section: string
  shortcut?: string
}

// Aplana el menú vertical y produce SearchData[]
const flattenMenuToSearch = (
  items: VerticalMenuDataType[],
  parentSection?: string,
  list: SearchData[] = [],
  idStart = 1
) => {
  let idCounter = idStart

  const walk = (nodes: VerticalMenuDataType[], currentSection?: string) => {
    nodes.forEach(node => {
      const label = String((node as any).label ?? '')
      const icon = (node as any).icon ?? ''
      const href = (node as any).href as string | undefined
      const children = (node as any).children as VerticalMenuDataType[] | undefined

      // Si el nodo es clickeable
      if (href) {
        list.push({
          id: String(idCounter++),
          name: label,
          url: href,
          excludeLang: false,
          icon,
          section: currentSection || label
        })
      }

      // Si tiene hijos, bajamos un nivel usando como sección el propio label
      if (Array.isArray(children) && children.length) {
        walk(children, label)
      }
    })
  }

  walk(items, parentSection)

  return list
}

// Nota: MenuData.tsx actualmente ignora el diccionario; pasamos undefined sin impacto.
const data: SearchData[] = flattenMenuToSearch(verticalMenuData(undefined as any))

export default data
