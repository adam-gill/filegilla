import axios from "axios";
import { showToast } from "./showToast";

export async function shareFileOp(
  userId: string,
  blobURL: string,
  shareName: string,
  operation: string,
  uuid: string
) {
  try {
    await axios.post("/api/shareFileOperation", {
      userId: userId,
      blobURL: blobURL,
      shareName: shareName,
      operation: operation,
      uuid: uuid,
    });

    showToast(
      `Successfully shared file at filegilla.com/s/${shareName}`,
      "",
      "good"
    );
  } catch (error: any) {
    if (error.status && error.status === 409) {
      showToast(
        `The name '${shareName}' is already in use.`,
        "Please choose another name.",
        "destructive"
      );
    } else {
      showToast("Error sharing file :(", "", "destructive");
    }
  }
}
