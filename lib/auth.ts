import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { authConfig } from "@/lib/auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize(credentials) {
        const username = process.env.AUTH_USERNAME
        const password = process.env.AUTH_PASSWORD

        if (!username || !password) return null

        if (
          credentials?.username === username &&
          credentials?.password === password
        ) {
          return {
            id: "shared-user",
            name: username,
          }
        }

        return null
      },
    }),
  ],
})
