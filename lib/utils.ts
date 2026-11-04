import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility to merge class names (clsx + tailwind-merge)
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// Format currency in MAD
export function formatMAD(amount: number, compact = false): string {
  if (compact) {
    if (Math.abs(amount) >= 1_000_000) {
      return `${(amount / 1_000_000).toFixed(1)}M MAD`;
    }
    if (Math.abs(amount) >= 1_000) {
      return `${(amount / 1_000).toFixed(0)}K MAD`;
    }
  }
  return new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: "MAD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format date in French
export function formatDate(date: string | Date, opts?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("fr-MA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...opts,
  }).format(d);
}

// Format relative time
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor(diffMs / (1000 * 60));

  if (diffMins < 1) return "à l'instant";
  if (diffMins < 60) return `il y a ${diffMins}min`;
  if (diffHours < 24) return `il y a ${diffHours}h`;
  if (diffDays === 1) return "hier";
  if (diffDays < 7) return `il y a ${diffDays}j`;
  if (diffDays < 30) return `il y a ${Math.floor(diffDays / 7)} sem`;
  return formatDate(d);
}

// Get initials from name
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// Generate a unique ID
export function generateId(prefix = ""): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 6);
  return prefix ? `${prefix}-${ts}${rand}` : `${ts}${rand}`;
}

// Truncate text
export function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return `${text.slice(0, maxLen)}…`;
}

// Status color mapping
export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    // Contact / Lead
    new: "text-blue-600 bg-blue-50",
    active: "text-green-600 bg-green-50",
    qualified: "text-violet-600 bg-violet-50",
    inactive: "text-gray-500 bg-gray-100",
    lost: "text-red-600 bg-red-50",
    // Property
    available: "text-green-600 bg-green-50",
    reserved: "text-amber-600 bg-amber-50",
    sold: "text-gray-500 bg-gray-100",
    rented: "text-gray-500 bg-gray-100",
    withdrawn: "text-red-600 bg-red-50",
    // Commission
    expected: "text-blue-600 bg-blue-50",
    partial: "text-amber-600 bg-amber-50",
    collected: "text-green-600 bg-green-50",
    overdue: "text-red-600 bg-red-50",
    disputed: "text-red-700 bg-red-100",
    // Transaction
    completed: "text-green-600 bg-green-50",
    negotiation: "text-violet-600 bg-violet-50",
    // General
    pending: "text-amber-600 bg-amber-50",
    verified: "text-green-600 bg-green-50",
  };
  return map[status.toLowerCase()] ?? "text-gray-600 bg-gray-100";
}

// Percentage change
export function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

// Format percentage
export function formatPct(value: number, decimals = 1): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(decimals)}%`;
}

// Days until a date
export function daysUntil(date: string | Date): number {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

// Is date overdue?
export function isOverdue(date: string | Date): boolean {
  return daysUntil(date) < 0;
}
