import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    accessToken?: string
    user: {
      id: string
      firstName?: string | null
      lastName?: string | null
      username?: string | null
      email?: string | null
    }
  }
}