// Third-party Imports
import GoogleProvider from 'next-auth/providers/google'
import CognitoProvider from 'next-auth/providers/cognito'
import type { NextAuthOptions } from 'next-auth'

export const authOptions: NextAuthOptions = {
  // ** Configure one or more authentication providers
  // ** Please refer to https://next-auth.js.org/configuration/options#providers for more `providers` options
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
    }),

    CognitoProvider({
      clientId: process.env.COGNITO_CLIENT_ID as string,
      clientSecret: process.env.COGNITO_CLIENT_SECRET as string,
      issuer: process.env.COGNITO_ISSUER as string,
      authorization: {
        params: {
          scope: 'openid email profile',
          lang: 'es'
        }
      },
      checks: ['pkce', 'state'],
      client: { token_endpoint_auth_method: 'none' } // cliente público
    })

    // ** ...add more providers here
  ],

  // ** Please refer to https://next-auth.js.org/configuration/options#session for more `session` options
  session: {
    /*
     * Choose how you want to save the user session.
     * The default is `jwt`, an encrypted JWT (JWE) stored in the session cookie.
     * If you use an `adapter` however, NextAuth default it to `database` instead.
     * You can still force a JWT session by explicitly defining `jwt`.
     * When using `database`, the session cookie will only contain a `sessionToken` value,
     * which is used to look up the session in the database.
     * If you use a custom credentials provider, user accounts will not be persisted in a database by NextAuth.js (even if one is configured).
     * The option to use JSON Web Tokens for session tokens must be enabled to use a custom credentials provider.
     */
    strategy: 'jwt',

    // ** Seconds - How long until an idle session expires and is no longer valid
    maxAge: 30 * 24 * 60 * 60 // ** 30 days
  },

  // ** Please refer to https://next-auth.js.org/configuration/options#pages for more `pages` options
  pages: {
    signIn: '/login'
  },

  // ** Please refer to https://next-auth.js.org/configuration/options#callbacks for more `callbacks` options
  callbacks: {
    /*
     * While using `jwt` as a strategy, `jwt()` callback will be called before
     * the `session()` callback. So we have to add custom parameters in `token`
     * via `jwt()` callback to make them accessible in the `session()` callback
     */
    async jwt({ token, user, account, profile }) {
      if (user) {
        // Mantener nombre personalizado
        token.name = user.name
      }

      // En el primer login con Cognito, `account` y `profile` vienen poblados
      if (account && profile) {
        // Tokens y expiración (no los expondremos al cliente por seguridad a menos que lo solicites)
        token.access_token = (account as any).access_token
        token.id_token = (account as any).id_token
        token.expires_at = (account as any).expires_at

        // Claims comunes de Cognito disponibles en `profile`
        // Tipos flexibles para evitar romper si faltan
        const p: any = profile

        if (typeof p?.email_verified !== 'undefined') token.email_verified = p.email_verified
        if (typeof p?.phone_number !== 'undefined') token.phone_number = p.phone_number
        if (Array.isArray(p?.['cognito:groups'])) token.cognito_groups = p['cognito:groups']
        if (typeof p?.preferred_username !== 'undefined') token.preferred_username = p.preferred_username
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        // Sincronizar campos útiles y seguros en el objeto de sesión del cliente
        session.user.name = token.name

        // Mapeos adicionales
        session.user.emailVerified = token.email_verified
        session.user.phoneNumber = token.phone_number
        session.user.cognitoGroups = token.cognito_groups
        session.user.preferredUsername = token.preferred_username
      }

      return session
    }
  }
}
