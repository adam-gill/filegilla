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
      return a.name.localeCompare(b.name);
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
      // First, sort by type (folders before files)
      if (a.type !== b.type) {
        return a.type === "folder" ? -1 : 1;
      }
      
      return a.name.localeCompare(b.name);
    });

    return initialContents;
  } else {
    return [];
  }
};

export const validateItemName = (name: string, type: string): string => {
  if (!name.trim()) {
    return "";
  }

  // Check for invalid characters
  const invalidChars = /[<>:"/\\|?*\x00-\x1f]/;
  if (invalidChars.test(name)) {
    return `${type} name cannot contain: < > : " / \\ | ? * or control characters`;
  }

  // Check for leading/trailing dots
  if (name.startsWith(" ") || name.endsWith(" ")) {
    return `${type} name cannot start or end with spaces`;
  }

  // Check for consecutive spaces
  if (name.includes("  ")) {
    return `${type} name cannot contain consecutive spaces`;
  }

  if (name.length > 255) {
    return `${type} name cannot exceed 255 characters`;
  }

  return "";
};

export const getFileExtension = (fileName: string): string => {

  if (!fileName.includes(".")) {
    return ""
  }

  return "." + fileName.toLowerCase().split(".").pop();
};

export const removeFileExtension = (name: string | undefined): string => {
  if (!name) {
    return "";
  }

  const lastDotIndex = name.lastIndexOf(".");

  if (lastDotIndex <= 0 || lastDotIndex === name.length - 1) {
    return name;
  }

  return name.substring(0, lastDotIndex);
};

export const randomId = (length?: number): string => {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const len = length ?? 10;
  let result = "";

  for (let i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
};

export const addCopyToFileName = (itemName: string): string => {
  return `${removeFileExtension(itemName)} copy${getFileExtension(itemName)}`;
};

export const deepEqual = (a: any, b: any) =>  {
  if (a === b) return true;

  if (a == null || b == null) return false;

  if (typeof a !== 'object' || typeof b !== 'object') return false;

  if (Array.isArray(a) !== Array.isArray(b)) return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!keysB.includes(key) || !deepEqual(a[key], b[key])) {
      return false;
    }
  }

  return true;
}

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const createFullPreviewUrl = (bucketName: string, previewKey?: string): string | undefined => {
    if (!previewKey) {
        return undefined;
    }
    return `https://${bucketName}.s3.us-east-1.amazonaws.com/${previewKey}`;
}

export const viewsText = (views: number): string => {
    if (views === 1) {
        return "1 view";
    } else {
        return `${views} views`;
    }
}