import { getFileExtension } from "../helpers";

export const createPrivateS3Key = (
  userId: string,
  location: string[],
  itemName?: string,
  isFolder?: boolean
): string => {
  const parts = ["private", userId, ...location];

  if (itemName) {
    parts.push(itemName);
  }

  const cleanPath = parts.filter((part) => part.trim() !== "").join("/");

  if (isFolder) {
    return cleanPath.endsWith("/") ? cleanPath : cleanPath + "/";
  } else {
    return cleanPath.endsWith("/") ? cleanPath.slice(0, -1) : cleanPath;
  }
};

export const createPublicS3Key = (
  itemName: string,
  shareName: string,
  itemType: string
) => {
  const basePath = "shares/";

  if (itemType === "file") {
    const fileExtension = getFileExtension(itemName);
    const publicItemName = shareName + fileExtension;

    return basePath + publicItemName;
  } else {
    return basePath + shareName + "/";
  }
};
