"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import {
  LayoutDashboard,
  Users,
  Building2,
  ArrowLeftRight,
  Banknote,
  TrendingUp,
  Calculator,
  Calendar,
  FolderOpen,
  BarChart3,
  Settings,
  Home,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Nav item type
// ---------------------------------------------------------------------------
interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Vue d'ensemble", href: "/dashboard/overview", icon: LayoutDashboard },
  { label: "Contacts",        href: "/dashboard/contacts",     icon: Users },
  { label: "Propriétés",      href: "/dashboard/properties",   icon: Building2 },
  { label: "Carte & Marché",  href: "/dashboard/map",          icon: MapPin },
  { label: "Transactions",    href: "/dashboard/transactions", icon: ArrowLeftRight },
  { label: "Commissions",     href: "/dashboard/commissions",  icon: Banknote },
  { label: "Finance",         href: "/dashboard/finance",      icon: TrendingUp },
  { label: "Fiscalité & CNSS",href: "/dashboard/tax",          icon: Calculator },
  { label: "Calendrier",      href: "/dashboard/calendar",     icon: Calendar },
  { label: "Documents",       href: "/dashboard/documents",    icon: FolderOpen },
  { label: "Rapports",        href: "/dashboard/reports",      icon: BarChart3 },
  { label: "Paramètres",      href: "/dashboard/settings",     icon: Settings },
];

// ---------------------------------------------------------------------------
// Mock user — will come from auth session in a real integration
// ---------------------------------------------------------------------------
const MOCK_USER = {
  name: "Badr El Mansouri",
  email: "badr@realtoros.ma",
};

// ---------------------------------------------------------------------------
// NavLink — isolated client component so usePathname only suspends its subtree
// ---------------------------------------------------------------------------
function NavLink({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const isActive =
    pathname === item.href || pathname.startsWith(item.href + "/");

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2 text-sm font-medium transition-all duration-150",
        isActive
          ? "bg-[var(--accent-subtle)] text-[var(--accent)]"
          : "text-[var(--muted)] hover:bg-[var(--border-subtle)] hover:text-[var(--foreground)]"
      )}
    >
      <item.icon
        size={16}
        className={cn(
          "shrink-0",
          isActive ? "text-[var(--accent)]" : "text-[var(--muted)]"
        )}
      />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// SidebarContent — the actual sidebar content (needs Suspense for usePathname)
// ---------------------------------------------------------------------------
function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col" onClick={onNavigate}>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-[var(--border)]">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] shrink-0"
          style={{ background: "var(--accent)" }}
        >
          <Home size={15} className="text-white" />
        </div>
        <div className="min-w-0">
          <span className="block text-sm font-bold text-[var(--foreground)] leading-tight">
            RealtorOS
          </span>
          <span className="block text-[11px] text-[var(--muted)] leading-tight">
            Maroc
          </span>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        <Suspense
          fallback={
            <div className="space-y-0.5">
              {NAV_ITEMS.map((item) => (
                <div
                  key={item.href}
                  className="h-9 rounded-[var(--radius-sm)] bg-[var(--border-subtle)] animate-pulse"
                />
              ))}
            </div>
          }
        >
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </Suspense>
      </nav>

      {/* User profile */}
      <div className="border-t border-[var(--border)] px-3 py-3">
        <Link
          href="/dashboard/settings/profile"
          className={cn(
            "flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 text-sm",
            "hover:bg-[var(--border-subtle)] transition-colors"
          )}
        >
          {/* Avatar */}
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
            style={{ background: "var(--accent)" }}
          >
            {getInitials(MOCK_USER.name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[var(--foreground)]">
              {MOCK_USER.name}
            </p>
            <p className="truncate text-[11px] text-[var(--muted)]">
              {MOCK_USER.email}
            </p>
          </div>
          <Settings size={14} className="shrink-0 text-[var(--muted)]" />
        </Link>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Desktop Sidebar — always visible on lg+
// ---------------------------------------------------------------------------
export function Sidebar() {
  return (
    <aside
      className="hidden lg:flex flex-col fixed inset-y-0 left-0 z-30 w-[var(--sidebar-width)] border-r border-[var(--border)]"
      style={{ background: "var(--surface)" }}
    >
      <SidebarContent />
    </aside>
  );
}

// ---------------------------------------------------------------------------
// Mobile Drawer Sidebar
// ---------------------------------------------------------------------------
interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-200 lg:hidden",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col w-[var(--sidebar-width)] border-r border-[var(--border)] shadow-xl transition-transform duration-300 ease-in-out lg:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ background: "var(--surface)" }}
      >
        <SidebarContent onNavigate={onClose} />
      </aside>
    </>
  );
}
