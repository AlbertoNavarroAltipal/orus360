export type PrimaryColorConfig = {
  name?: string
  light?: string
  main: string
  dark?: string
}

// Primary color config object
const primaryColorConfig: PrimaryColorConfig[] = [
  {
    name: 'primary-1',
    light: '#005daa',
    main: '#005daa',
    dark: '#005daa'
  },
  {
    name: 'primary-2',
    light: '#a9d759ff',
    main: '#98CA3F',
    dark: '#a9e245ff'
  },
  {
    name: 'primary-3',
    light: '#F0718D',
    main: '#EB3D63',
    dark: '#AC2D48'
  },
  {
    name: 'primary-4',
    light: '#FFC25A',
    main: '#FFAB1D',
    dark: '#BA7D15'
  },
  {
    name: 'primary-5',
    light: '#bd5cf1ff',
    main: '#65228aff',
    dark: '#9331c8ff'
  }
]

export default primaryColorConfig
