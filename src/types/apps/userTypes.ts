// Type Imports
import type { ThemeColor } from '@core/types'

export type UsersType = {
  id: number

  // Rol/plan se usan en UI; pueden no existir en Cognito, por eso opcionales
  role?: string
  email: string
  status: 'active' | 'pending' | 'inactive' | string
  cognitoStatus?: string
  avatar?: string
  company?: string
  country?: string
  contact?: string
  emailVerified?: boolean
  phoneVerified?: boolean
  createdAt?: string
  fullName: string
  username: string
  currentPlan?: string
  avatarColor?: ThemeColor
}
