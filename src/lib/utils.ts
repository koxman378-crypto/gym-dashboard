// Read and parse the gym_profile cookie (branch info)
export function getBranchInfoFromCookie(): any | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )gym_profile=([^;]*)/);
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match[1]));
  } catch {
    return null;
  }
}
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
