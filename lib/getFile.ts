import axios from "axios";
import { showToast } from "./showToast";

export async function getFile(userId: string, fileName: string) {
  try {
    if (userId && fileName) {
      const response = await axios.get("/api/getFile", {
        params: {
          userId,
          fileName,
        },
      });
      return response.data;
    }
  } catch (error) {
    console.log("File fetch error: " + error);
    showToast("Failed to fetch file :(", "Please try again.", "destructive");
  }
}
