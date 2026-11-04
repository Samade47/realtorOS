"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Menu,
  Search,
  Plus,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronDown,
  UserPlus,
  Building2,
  ArrowLeftRight,
  CheckSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Mock user & notifications — will come from real data later
// ---------------------------------------------------------------------------
const MOCK_USER = {
  name: "Badr El Mansouri",
  email: "badr@realtoros.ma",
};
const UNREAD_COUNT = 3;

// ---------------------------------------------------------------------------
// Quick-create options
// ---------------------------------------------------------------------------
const QUICK_CREATE_ITEMS = [
  { label: "Nouveau contact",      href: "/dashboard/contacts/new",     icon: UserPlus },
  { label: "Nouvelle propriété",   href: "/dashboard/properties/new",   icon: Building2 },
  { label: "Nouvelle transaction", href: "/dashboard/transactions/new", icon: ArrowLeftRight },
  { label: "Nouvelle tâche",       href: "/dashboard/calendar?new=task",icon: CheckSquare },
];

// ---------------------------------------------------------------------------
// Reusable dropdown hook
// ---------------------------------------------------------------------------
function useDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return { open, setOpen, ref };
}

// ---------------------------------------------------------------------------
// TopBar component
// ---------------------------------------------------------------------------
interface TopBarProps {
  pageTitle?: string;
  onMenuClick: () => void;
}

export function TopBar({ pageTitle, onMenuClick }: TopBarProps) {
  const quickCreate = useDropdown();
  const userMenu = useDropdown();

  return (
    <header
      className="flex h-[var(--topbar-height)] items-center gap-3 px-4 border-b border-[var(--border)] shrink-0"
      style={{ background: "var(--surface)" }}
    >
      {/* Mobile hamburger */}
      <button
        type="button"
        onClick={onMenuClick}
        className={cn(
          "lg:hidden flex items-center justify-center h-8 w-8 rounded-[var(--radius-sm)]",
          "text-[var(--muted)] hover:bg-[var(--border-subtle)] hover:text-[var(--foreground)] transition-colors"
        )}
        aria-label="Ouvrir le menu"
      >
        <Menu size={18} />
      </button>

      {/* Page title */}
      {pageTitle && (
        <h1 className="hidden sm:block text-sm font-semibold text-[var(--foreground)] truncate">
          {pageTitle}
        </h1>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Global search */}
      <button
        type="button"
        className={cn(
          "hidden sm:flex items-center gap-2 h-8 px-3 rounded-[var(--radius-sm)] border border-[var(--border)]",
          "text-xs text-[var(--muted)] hover:bg-[var(--border-subtle)] hover:text-[var(--foreground)] transition-colors",
          "min-w-[180px]"
        )}
        aria-label="Rechercher"
        onClick={() => {
          // TODO: open command palette
        }}
      >
        <Search size={13} className="shrink-0" />
        <span className="flex-1 text-left">Rechercher…</span>
        <kbd className="hidden md:inline-block text-[10px] text-[var(--muted)] bg-[var(--background)] border border-[var(--border)] px-1 rounded">
          ⌘K
        </kbd>
      </button>

      {/* Quick create */}
      <div className="relative" ref={quickCreate.ref}>
        <button
          type="button"
          onClick={() => quickCreate.setOpen((o) => !o)}
          className={cn(
            "flex items-center gap-1.5 h-8 px-2.5 rounded-[var(--radius-sm)] text-xs font-medium",
            "text-white transition-colors",
            "hover:opacity-90"
          )}
          style={{ background: "var(--accent)" }}
          aria-label="Créer"
          aria-expanded={quickCreate.open}
        >
          <Plus size={14} />
          <span className="hidden sm:inline">Créer</span>
          <ChevronDown
            size={12}
            className={cn("transition-transform duration-150", quickCreate.open && "rotate-180")}
          />
        </button>

        {quickCreate.open && (
          <div
            className={cn(
              "absolute right-0 top-full mt-1.5 w-52 rounded-[var(--radius)] border border-[var(--border)] shadow-lg z-50",
              "py-1 overflow-hidden"
            )}
            style={{ background: "var(--surface)" }}
          >
            {QUICK_CREATE_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => quickCreate.setOpen(false)}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 text-sm text-[var(--foreground)]",
                  "hover:bg-[var(--border-subtle)] transition-colors"
                )}
              >
                <item.icon size={14} className="text-[var(--muted)] shrink-0" />
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Notification bell */}
      <button
        type="button"
        className={cn(
          "relative flex items-center justify-center h-8 w-8 rounded-[var(--radius-sm)]",
          "text-[var(--muted)] hover:bg-[var(--border-subtle)] hover:text-[var(--foreground)] transition-colors"
        )}
        aria-label={`${UNREAD_COUNT} notifications non lues`}
      >
        <Bell size={16} />
        {UNREAD_COUNT > 0 && (
          <span
            className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white"
            style={{ background: "var(--danger)" }}
          >
            {UNREAD_COUNT > 9 ? "9+" : UNREAD_COUNT}
          </span>
        )}
      </button>

      {/* User avatar dropdown */}
      <div className="relative" ref={userMenu.ref}>
        <button
          type="button"
          onClick={() => userMenu.setOpen((o) => !o)}
          className={cn(
            "flex items-center justify-center h-8 w-8 rounded-full text-xs font-semibold text-white transition-opacity hover:opacity-80"
          )}
          style={{ background: "var(--accent)" }}
          aria-label="Menu utilisateur"
          aria-expanded={userMenu.open}
        >
          {getInitials(MOCK_USER.name)}
        </button>

        {userMenu.open && (
          <div
            className={cn(
              "absolute right-0 top-full mt-1.5 w-56 rounded-[var(--radius)] border border-[var(--border)] shadow-lg z-50",
              "py-1 overflow-hidden"
            )}
            style={{ background: "var(--surface)" }}
          >
            {/* User info header */}
            <div className="px-3 py-2.5 border-b border-[var(--border)]">
              <p className="text-sm font-medium text-[var(--foreground)] truncate">
                {MOCK_USER.name}
              </p>
              <p className="text-xs text-[var(--muted)] truncate">{MOCK_USER.email}</p>
            </div>

            <div className="py-1">
              <Link
                href="/dashboard/settings/profile"
                onClick={() => userMenu.setOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--border-subtle)] transition-colors"
              >
                <User size={14} className="text-[var(--muted)] shrink-0" />
                Profil
              </Link>
              <Link
                href="/dashboard/settings"
                onClick={() => userMenu.setOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--border-subtle)] transition-colors"
              >
                <Settings size={14} className="text-[var(--muted)] shrink-0" />
                Paramètres
              </Link>
            </div>

            <div className="border-t border-[var(--border)] py-1">
              <button
                type="button"
                onClick={() => {
                  userMenu.setOpen(false);
                  // TODO: sign out
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[var(--danger)] hover:bg-[var(--danger-subtle)] transition-colors"
              >
                <LogOut size={14} className="shrink-0" />
                Déconnexion
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
