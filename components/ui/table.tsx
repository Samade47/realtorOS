import * as React from "react";
import { cn } from "@/lib/utils";

// ─── Table ────────────────────────────────────────────────────────────────────
function Table({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-auto">
      <table
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────
function TableHeader({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn("border-b border-[var(--border)]", className)}
      {...props}
    />
  );
}

// ─── Body ─────────────────────────────────────────────────────────────────────
function TableBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function TableFooter({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tfoot
      className={cn(
        "border-t border-[var(--border)] bg-[var(--border-subtle)] font-medium",
        className
      )}
      {...props}
    />
  );
}

// ─── Row ─────────────────────────────────────────────────────────────────────
function TableRow({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        "border-b border-[var(--border)] transition-colors",
        "hover:bg-[var(--accent-subtle)]/40",
        "data-[selected=true]:bg-[var(--accent-subtle)]",
        className
      )}
      {...props}
    />
  );
}

// ─── Head ─────────────────────────────────────────────────────────────────────
function TableHead({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "h-10 px-4 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wider",
        "whitespace-nowrap",
        className
      )}
      {...props}
    />
  );
}

// ─── Cell ─────────────────────────────────────────────────────────────────────
function TableCell({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn("px-4 py-3 align-middle text-[var(--foreground)]", className)}
      {...props}
    />
  );
}

// ─── Caption ──────────────────────────────────────────────────────────────────
function TableCaption({ className, ...props }: React.HTMLAttributes<HTMLTableCaptionElement>) {
  return (
    <caption
      className={cn("mt-4 text-sm text-[var(--muted)]", className)}
      {...props}
    />
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
};
