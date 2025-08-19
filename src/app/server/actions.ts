/**
 * ! The server actions below are used to fetch the static data from the fake-db. If you're using an ORM
 * ! (Object-Relational Mapping) or a database, you can swap the code below with your own database queries.
 */

'use server'

// External Imports
import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  type UserType as CognitoUser
} from '@aws-sdk/client-cognito-identity-provider'

// Data Imports
import { db as eCommerceData } from '@/fake-db/apps/ecommerce'
import { db as academyData } from '@/fake-db/apps/academy'
import { db as vehicleData } from '@/fake-db/apps/logistics'
import { db as invoiceData } from '@/fake-db/apps/invoice'
import { db as userData } from '@/fake-db/apps/userList'
import { db as permissionData } from '@/fake-db/apps/permissions'
import { db as profileData } from '@/fake-db/pages/userProfile'
import { db as faqData } from '@/fake-db/pages/faq'
import { db as pricingData } from '@/fake-db/pages/pricing'
import { db as statisticsData } from '@/fake-db/pages/widgetExamples'

// Type Imports
import type { UsersType } from '@/types/apps/userTypes'

export const getEcommerceData = async () => {
  return eCommerceData
}

export const getAcademyData = async () => {
  return academyData
}

export const getLogisticsData = async () => {
  return vehicleData
}

export const getInvoiceData = async () => {
  return invoiceData
}

export const getUserData = async () => {
  try {
    const list = await getCognitoUsers()

    // Si trae algo, úsalo
    if (Array.isArray(list) && list.length > 0) return list
  } catch {
    // ignore y usamos fake-db
  }

  return userData
}

// Lista usuarios desde AWS Cognito y los adapta al UsersType utilizado por la UI
export async function getCognitoUsers(): Promise<UsersType[]> {
  // Resolver configuración desde variables de entorno o amplify_outputs.json
  const region = process.env.AWS_REGION || process.env.NEXT_PUBLIC_AWS_REGION
  let userPoolId = process.env.COGNITO_USER_POOL_ID || process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID

  if (!region || !userPoolId) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const outputs = require('../../../amplify_outputs.json')

      userPoolId = userPoolId || outputs?.auth?.user_pool_id
    } catch {
      // ignore
    }
  }

  if (!region || !userPoolId) {
    // Fallback a data local si no hay config; evita romper la página en dev
    return userData
  }

  const client = new CognitoIdentityProviderClient({ region })
  const cmd = new ListUsersCommand({ UserPoolId: userPoolId, Limit: 60 })
  const resp = await client.send(cmd)

  const mapUser = (u: CognitoUser, idx: number): UsersType => {
    const attrs: Record<string, string> = {}

    ;(u.Attributes || []).forEach(a => {
      if (a?.Name && typeof a.Value !== 'undefined' && a.Value !== null) attrs[a.Name] = String(a.Value)
    })

    const fullName =
      attrs.name || `${attrs.given_name || ''} ${attrs.family_name || ''}`.trim() || u.Username || 'Usuario'
    const email = attrs.email || ''
    const picture = attrs.picture || ''

    // Valores dummy para campos que no tenemos en Cognito pero la UI espera
    const role = 'subscriber'
    const currentPlan = 'basic'
    const status = (attrs.email_verified === 'true' ? 'active' : 'pending') as UsersType['status']

    return {
      id: idx + 1,
      fullName,
      company: attrs.profile || '',
      role,
      username: attrs.preferred_username || u.Username || email || fullName,
      country: attrs.zoneinfo || '',
      contact: attrs.phone_number || '',
      email,
      currentPlan,
      status,
      avatar: picture,
      avatarColor: 'primary'
    }
  }

  const list = (resp.Users || []).map(mapUser)

  return list
}

export const getPermissionsData = async () => {
  return permissionData
}

export const getProfileData = async () => {
  return profileData
}

export const getFaqData = async () => {
  return faqData
}

export const getPricingData = async () => {
  return pricingData
}

export const getStatisticsData = async () => {
  return statisticsData
}
