"use server";

import { prisma } from "@/lib/prisma";

export const editUsername = async (
  userId: string,
  oldUsername: string,
  newUsername: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const usernameMatches = await prisma.user.findMany({
      where: { username: newUsername },
    });

    if (usernameMatches.length > 0) {
      return {
        success: false,
        message: `username '${newUsername}' is already in use.`,
      };
    }

    await prisma.user.update({
      where: {
        id: userId,
        username: oldUsername,
      },
      data: {
        username: newUsername,
      },
    });

    return {
      success: true,
      message: `successfully changed username to ${newUsername}`,
    };
  } catch (error) {
    return { success: false, message: `failed to edit username: ${error}` };
  }
};


export const changeAvatar = async (userId: string) => {
    return userId
}

/*

TODO - make alert dialog for deleting files

*/
