import * as React from "react";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number; // percentage change
    isPositive?: boolean;
    label?: string;
  };
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  variant?: "default" | "accent" | "success" | "warning" | "danger";
  className?: string;
}

export function StatCard({
  label,
  value,
  subtitle,
  trend,
  icon,
  badge,
  variant = "default",
  className,
}: StatCardProps) {
  const borderVariants = {
    default: "border-[var(--border)]",
    accent: "border-l-4 border-l-[var(--accent)] border-[var(--border)]",
    success: "border-l-4 border-l-[var(--success)] border-[var(--border)]",
    warning: "border-l-4 border-l-[var(--warning)] border-[var(--border)]",
    danger: "border-l-4 border-l-[var(--danger)] border-[var(--border)]",
  };

  return (
    <div
      className={cn(
        "rounded-[var(--radius)] border bg-[var(--surface)] p-5 transition-shadow hover:shadow-xs",
        borderVariants[variant],
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-[var(--muted)] truncate uppercase tracking-wider">
            {label}
          </span>
          {badge}
        </div>
        {icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--border-subtle)] text-[var(--muted)] shrink-0">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
          {value}
        </span>
      </div>

      {(subtitle || trend) && (
        <div className="mt-2 flex items-center gap-2 text-xs">
          {trend && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 font-medium",
                trend.value > 0
                  ? "text-[var(--success)]"
                  : trend.value < 0
                  ? "text-[var(--danger)]"
                  : "text-[var(--muted)]"
              )}
            >
              {trend.value > 0 ? (
                <ArrowUpRight size={14} />
              ) : trend.value < 0 ? (
                <ArrowDownRight size={14} />
              ) : (
                <Minus size={14} />
              )}
              {trend.value > 0 ? "+" : ""}
              {trend.value}%
            </span>
          )}
          {subtitle && (
            <span className="text-[var(--muted)] truncate">{subtitle}</span>
          )}
        </div>
      )}
    </div>
  );
}
