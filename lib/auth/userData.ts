"use server";

import { headers } from "next/headers";
import { auth } from "./auth";

export const getUserData = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session?.user;
};