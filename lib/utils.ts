import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Placeholder legible para campos nullable del contrato de API (FR-012). */
export function formatNullable(value: string | number | null | undefined): string {
  return value === null || value === undefined || value === "" ? "—" : String(value)
}
