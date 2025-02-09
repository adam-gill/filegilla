import axios from "axios";
import { showToast } from "./showToast";

interface checkPublicFileResponse {
  publicURL?: string;
  name?: string;
  exists: boolean;
}

export const checkShare = async (
  userId: string | undefined,
  etag: string | undefined,
  setShareName: ((value: string) => void) | undefined,
) => {
  console.log("checkShare called");
  if (userId && etag && setShareName) {
    console.log("checkShare run");
    
    try {
      const { data } = await axios.get<checkPublicFileResponse>(
        "/api/checkPublicFile",
        {
          params: {
            userId: userId,
            etag: etag,
          },
        }
      );

      if (data.name && data.publicURL) {
        setShareName(data.name);
      }
    } catch (error) {
      showToast("Error checking public share status :(", "", "destructive");
      console.log("Error checking public share status", error);
    }
  }
};
