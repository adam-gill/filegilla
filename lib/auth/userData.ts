import { headers } from "next/headers";
import { auth } from "./auth";

export const getUserData = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session?.user;
};

export const getInitials = (name: string): string => {
  const nameArray = name.split(" ");
  return nameArray[0].charAt(0) + nameArray[1].charAt(0);
};
