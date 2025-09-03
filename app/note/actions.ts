"use server";


import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export const fetchNote = async (): Promise<{
  success: boolean;
  message: string;
  note?: string;
}> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return { success: false, message: "user is not authenticated." };
  }
  const userId = session.user.id;

  try {
    const response = await prisma.user.findFirst({
      where: {
        id: userId,
      },
      select: {
        note: true,
      },
    });

    const note = response?.note;

    if (note) {
      return {
        success: true,
        message: "successfully fetched user's note",
        note: note,
      };
    } else {
      return { success: false, message: "no user note found" };
    }
  } catch (error) {
    return {
      success: false,
      message: `unknown error fetching user note: ${error}`,
    };
  }
};


export const syncNote = async (noteData: string): Promise<{
  success: boolean;
  message: string;
}> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return { success: false, message: "user is not authenticated." };
  }
  const userId = session.user.id;

  try {
    const response = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        note: noteData
      }
    })

    if (response) {
      return {
        success: true,
        message: "successfully synced user's note",
      };
    } else {
      return { success: false, message: "failed to sync user's note" };
    }
  } catch (error) {
    return {
      success: false,
      message: `unknown error syncing user's note: ${error}`,
    };
  }
};
