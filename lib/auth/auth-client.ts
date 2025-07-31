import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from "./auth";

const baseURL = process.env.BETTER_AUTH_URL!;

export const authClient = createAuthClient({
  baseURL: baseURL,
  plugins: [inferAdditionalFields<typeof auth>()],
});
