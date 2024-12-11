import axios from "axios";
import { showToast } from "./showToast";

export async function renameFile(
  userId: string,
  oldFileName: string,
  newFileName: string,
  loadFiles?: () => Promise<void>
) {
  try {
    if (userId && oldFileName && newFileName) {
      await axios.put("/api/renameFile", {
        userId: userId,
        oldFileName: oldFileName,
        newFileName: newFileName,
      });
      if (loadFiles) loadFiles();

      showToast(
        `Successfully renamed file to ${newFileName}!`,
        "",
        "good"
      );
    }
  } catch (error) {
    console.log("Renaming file error: " + error);
    showToast(
      `Error renaming ${oldFileName} :(`,
      "Please try again.",
      "destructive"
    );
  }
}
