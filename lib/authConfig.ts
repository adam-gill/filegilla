import { NextAuthOptions, Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import { Profile as DefaultProfile } from "next-auth";

interface ExtendedProfile extends DefaultProfile {
  exp: number,
  nbf: number,
  ver: string,
  iss: string,
  sub: string,
  aud: string,
  iat: number,
  auth_time: number,
  idp: string,
  oid: string,
  extension_Username: string,
  extension_FirstName: string
  extension_LastName: string,
  emails: string[],
  tfp: string,
}

interface ExtendedSession extends Session {
  user: {
    id: string;
    username: string | null;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
  };
}

export const authConfig: NextAuthOptions = {
  providers: [
    {
      id: "azure-ad-b2c",
      name: "Azure AD B2C",
      type: "oauth",
      wellKnown: process.env.WELL_KNOWN!,
      authorization: { params: { scope: "openid profile email", prompt: "login" } },
      clientId: process.env.AZURE_AD_B2C_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_B2C_CLIENT_SECRET!,
      idToken: true,
      profile(profile: ExtendedProfile): Promise<any> {
        return Promise.resolve({
          id: profile.sub || profile.oid || "",
          username: profile.extension_Username || "",
          email: profile.emails?.[0] || "",
          firstName: profile.extension_FirstName || "",
          surname: profile.extension_LastName || "",
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
        token.username = (profile as ExtendedProfile).extension_Username;
        token.firstName = (profile as ExtendedProfile).extension_FirstName;
        token.lastName = (profile as ExtendedProfile).extension_LastName;
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
          username: token.username as string,
          email: token.email as string,
          firstName: token.firstName as string,
          lastName: token.lastName as string,
        },
      };
    },
  },
};
