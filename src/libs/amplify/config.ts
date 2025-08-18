import { Amplify } from 'aws-amplify'

// We configure Amplify Auth using values from amplify_outputs.json
// This module should only run on the client; but configuration is safe on server too.

let configured = false

export const configureAmplify = () => {
  if (configured) return

  // We can also import the json but to keep bundle small we read from env if present
  const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID
  const userPoolWebClientId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID
  const region = process.env.NEXT_PUBLIC_AWS_REGION

  // Fallback: try to load from amplify_outputs.json at build time
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const outputs = (() => {
    try {
      // Using require ensures it's bundled statically
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      return require('../../../amplify_outputs.json') as any
    } catch {
      return null
    }
  })()

  const cfg = {
    Auth: {
      Cognito: {
        userPoolId: userPoolId || outputs?.auth?.user_pool_id,
        userPoolClientId: userPoolWebClientId || outputs?.auth?.user_pool_client_id,
        loginWith: {
          username: false,
          email: true,
          phone: false
        },
        passwordFormat: {
          minLength: outputs?.auth?.password_policy?.min_length ?? 8,
          requireLowercase: outputs?.auth?.password_policy?.require_lowercase ?? true,
          requireNumbers: outputs?.auth?.password_policy?.require_numbers ?? true,
          requireSymbols: outputs?.auth?.password_policy?.require_symbols ?? true,
          requireUppercase: outputs?.auth?.password_policy?.require_uppercase ?? true
        },
        region: region || outputs?.auth?.aws_region
      }
    }
  }

  Amplify.configure(cfg)
  configured = true
}
