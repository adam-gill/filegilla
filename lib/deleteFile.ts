import axios from "axios";
import { showToast } from "./showToast";

export async function deleteFile(fileName: string, userId: string, loadFiles: () => Promise<void>) {
    try {
      if (userId && fileName) {
        await axios.delete("/api/deleteFile", {
          data: {
            userId: userId,
            blobName: fileName,
          },
        });
        loadFiles();

        showToast(`Successfully deleted ${fileName}!`, "", "good");
      }
    } catch (error) {
      console.log("File deletion error: " + error);
    }
  };