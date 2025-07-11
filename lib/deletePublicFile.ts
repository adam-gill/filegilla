import axios from "axios";
import { showToast } from "./showToast";

// interface deletePublicFileRequest {
//   name: string;
//   etag: string;
// }

export async function deletePublicFile(name: string, etag: string,) {
  try {

    await axios.delete("/api/deletePublicFile", {
      data: { name: name, etag: etag },
    });

    showToast(`Successfully deleted public file '${name}'`, "", "good");


  } catch (_error: any) {
    console.log("Error deleting public file.", _error);
    showToast(`Failed to delete public file '${name}'`, "Please try again.", "destructive");
  }
}
