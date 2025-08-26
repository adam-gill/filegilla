import { FolderItem } from "@/app/u/types";

export const formatBytes = (bytes: number | undefined): string => {
  if (bytes === undefined || bytes === null || isNaN(bytes)) {
    return "";
  }

  if (bytes === 0) {
    return "0 Bytes";
  }

  const k = 1024;
  const units = ["Bytes", "KB", "MB", "GB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const unitIndex = i >= units.length ? units.length - 1 : i;

  const decimals = unitIndex === 0 ? 0 : 1;

  const value = (bytes / Math.pow(k, unitIndex)).toFixed(decimals);

  return `${value} ${units[unitIndex]}`;
};

export const sortItems = (items: FolderItem[]): FolderItem[] => {
  const sorted = items.sort((a, b) => {
    if (a.type === b.type) {
      return 0;
    }
    return a.type === "folder" ? -1 : 1;
  });
  return sorted;
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

export const getInitials = (name: string): string => {
  const nameArray = name.split(" ");

  if (!nameArray || nameArray.length === 0) {
    return "";
  } else if (nameArray.length === 1) {
    return name.slice(0, 1);
  } else {
    return nameArray[0].charAt(0) + nameArray[1].charAt(0);
  }
};

export const sortContents = (contents: FolderItem[]): FolderItem[] => {
  if (contents && contents.length > 0) {
    const initialContents = contents.sort((a, b) => {
      if (a.type === b.type) {
        return 0;
      }
      return a.type === "folder" ? -1 : 1;
    });

    return initialContents;
  } else {
    return [];
  }
};
