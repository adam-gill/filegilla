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
