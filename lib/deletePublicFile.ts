import axios from "axios";
import { NextResponse } from "next/server";
import { showToast } from "./showToast";

interface deletePublicFileRequest {
  name: string;
  etag: string;
}

export async function deletePublicFile(name: string, etag: string,) {
  try {

    await axios.delete("/api/deletePublicFile", {
      data: { name: name, etag: etag },
    });

    showToast(`Successfully deleted public file '${name}'`, "", "good");


  } catch (error: any) {
    console.log("Error deleting public file.");
    showToast(`Failed to delete public file '${name}'`, "Please try again.", "destructive");
  }
}
