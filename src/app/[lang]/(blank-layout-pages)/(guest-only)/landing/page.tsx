// Next Imports
import type { Metadata } from 'next'

// Component Imports
import Landing from '@views/Landing'

export const metadata: Metadata = {
  title: 'Login',
  description: 'Login to your account'
}

const LoginPage = async () => {
  return <Landing />
}

export default LoginPage
