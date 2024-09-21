import { NextAuthOptions, Session } from "next-auth";
import { JWT } from "next-auth/jwt";

export const authConfig: NextAuthOptions = {
  providers: [
    {
      id: "azure-ad-b2c",
      name: "Azure AD B2C",
      type: "oauth",
      wellKnown: `https://auth.filegilla.com/auth.filegilla.com/B2C_1_defaultFlow/v2.0/.well-known/openid-configuration`,
      authorization: { params: { scope: "openid profile email" } },
      clientId: process.env.AZURE_AD_B2C_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_B2C_CLIENT_SECRET!,
      idToken: true,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
        };
      },
    },
  ],
  secret: process.env.NEXTAUTH_SECRET,
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      session.accessToken = token.accessToken as string;
      return session;
    },
  },
};
