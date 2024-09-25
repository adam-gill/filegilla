import { NextAuthOptions, Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import { Profile as DefaultProfile } from "next-auth";

interface ExtendedProfile extends DefaultProfile {
  oid?: string;
  emails?: string[] ; // Azure AD B2C often provides emails as an array
  given_name?: string;
  family_name?: string;
}

interface ExtendedSession extends Session {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    givenName: string | null;
    surname: string | null;
  };
}

export const authConfig: NextAuthOptions = {
  providers: [
    {
      id: "azure-ad-b2c",
      name: "Azure AD B2C",
      type: "oauth",
      wellKnown: process.env.WELL_KNOWN!,
      authorization: { params: { scope: "openid profile email" } },
      clientId: process.env.AZURE_AD_B2C_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_B2C_CLIENT_SECRET!,
      idToken: true,
      profile(profile: ExtendedProfile): Promise<any> {
        return Promise.resolve({
          id: profile.sub || profile.oid || "",
          name: profile.name || "",
          email: profile.emails?.[0] || "",
          givenName: profile.given_name || "",
          surname: profile.family_name || "",
        });
      },
    },
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account, profile, user }) {
      if (account && profile) {
        token.accessToken = account.access_token;
        token.objectId = (profile as ExtendedProfile).oid;
        token.givenName = (profile as ExtendedProfile).given_name;
        token.surname = (profile as ExtendedProfile).family_name;
        token.email = user.email; // Use the email from the user object
      }
      return token;
    },
    async session({
      session,
      token,
    }: {
      session: Session;
      token: JWT;
    }): Promise<ExtendedSession> {
      return {
        ...session,
        accessToken: token.accessToken as string,
        user: {
          ...session.user,
          id: token.sub || "",
          name: token.name as string,
          email: token.email as string,
          givenName: token.givenName as string,
          surname: token.surname as string,
        },
      };
    },
  },
};
