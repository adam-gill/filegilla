import React, { JSX } from "react";
import { FC } from "react";
import {
  GrDocumentText,
  GrDocumentPdf,
  GrDocumentWord,
  GrDocumentImage,
  GrDocumentVideo,
  GrDocumentZip,
} from "react-icons/gr";
import { showToast } from "./showToast";

const getFileIcon = (name: string): FC => {
  const lastPeriodIndex = name.lastIndexOf(".");
  if (lastPeriodIndex === -1) return GrDocumentText;

  const fileExtension = name.slice(lastPeriodIndex + 1).toLowerCase();

  switch (fileExtension) {
    case "pdf":
      return GrDocumentPdf;
    case "doc":
    case "docx":
      return GrDocumentWord;
    case "png":
    case "jpg":
    case "jpeg":
      return GrDocumentImage;
    case "mov":
    case "mp4":
    case "webm":
      return GrDocumentVideo;
    case "zip":
    case "xz":
    case "gz":
      return GrDocumentZip;
    default:
      return GrDocumentText;
  }
};

// Alternative version that returns the JSX directly
export const getFileIconJSX = (name: string): JSX.Element => {
  const Icon = getFileIcon(name);
  return React.createElement(Icon);
};

export function cleanName(name: string): string {
  if (name.length > 17) {
    name = name.slice(0, 16) + "...";
  }

  return name;
}

export function convertSize(size: number) {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

  if (size === 0) return "0 Byte";

  const i = Math.floor(Math.log(size) / Math.log(1024));
  return Math.round(size / Math.pow(1024, i)) + " " + sizes[i];
}

export function cleanDate(dateString: string): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    year: "2-digit",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };

  return date.toLocaleDateString(undefined, options);
}

export async function handleDownload(blobUrl: string, name: string) {
  try {
    const response = await fetch(blobUrl, {
      method: "GET",
      mode: "cors",
      credentials: "omit",
      headers: {
        Accept: "*/*",
      },
    });
    if (!response.ok) throw new Error("Download failed");

    const blob = await response.blob();

    const blobDownloadUrl = window.URL.createObjectURL(blob);
    name = decodeURIComponent(name);

    const link = document.createElement("a");
    link.href = blobDownloadUrl;
    link.download = name;
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobDownloadUrl);
    showToast(`Successfully downloaded ${name}`, "", "good");
  } catch (error) {
    console.error("Download error:", error);
    showToast(`Failed to download ${name} :(`, "", "destructive");
  } finally {
  }
}

export function ag_uuid() {
  
  const numbers = "0123456789";
  const lowerCase = "abcdefghijklmnopqrstuvwxyz";
  const upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const allChars = numbers + lowerCase + upperCase;

  // Create Uint32Array for true randomness using crypto
  const randomValues = new Uint32Array(24);
  crypto.getRandomValues(randomValues);

  // Generate the random string
  return Array.from(randomValues)
    .map((val) => allChars[val % allChars.length])
    .join("");
}

export function extractFileExtension(fullFileName: string): string {
  const lastDotIndex = fullFileName.lastIndexOf(".");
  if (lastDotIndex === -1) return "";
  return fullFileName.slice(lastDotIndex);
};

export function stripToken(fullURL: string): string {
  return fullURL.split("?")[0];
};

export function stripFileExtension(file: string): string {
  const lastDotIndex = file.lastIndexOf('.');
  if (lastDotIndex === -1) return file;
  return file.slice(0, lastDotIndex);
}
