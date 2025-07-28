import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getInitials = (name: string): string => {
  const nameArray = name.split(" ");
  return nameArray[0].charAt(0) + nameArray[1].charAt(0);
};
