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
