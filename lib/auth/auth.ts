import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { generateUsername } from "./generate-username";
import { prisma } from "@/lib/prisma";
import { jwt } from "better-auth/plugins";
import { createUserFolder } from "./actions";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
  user: {
    additionalFields: {
      username: {
        type: "string",
        unique: true,
        required: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          const extendedUser = user as typeof user & {
            username?: string | null;
          };
          if (!extendedUser.username && extendedUser.name) {
            const username = generateUsername(extendedUser.name);
            await prisma.user.update({
              where: { id: user.id },
              data: { username },
            });
          }
          await createUserFolder(user.id);
        },
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  plugins: [jwt()],
});