"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/authConfig";

export async function saveNote(user_id: string, note_data: string) {
  const session = await getServerSession(authConfig);
  if (!session || !session.user?.id || session.user.id !== user_id) {
    return { success: false, message: "Unauthorized" };
  }
  try {
    await prisma.users.update({
      where: { user_id },
      data: { note_data },
    });
    return { success: true, message: "Note saved successfully" };
  } catch (error) {
    console.error("Error saving note:", error);
    return { success: false, message: "Failed to save note" };
  }
}

export async function loadNote(user_id: string) {
  const session = await getServerSession(authConfig);
  if (!session || !session.user?.id || session.user.id !== user_id) {
    return { success: false, message: "Unauthorized" };
  }
  try {
    const user = await prisma.users.findUnique({
      where: { user_id },
      select: { note_data: true },
    });
    if (!user) {
      return { success: false, message: "User not found" };
    }
    return { success: true, note_data: user.note_data || "" };
  } catch (error) {
    console.error("Error loading note:", error);
    return { success: false, message: "Failed to load note" };
  }
}
