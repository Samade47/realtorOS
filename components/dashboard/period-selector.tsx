"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Calendar } from "lucide-react";

export type PeriodType = "this_month" | "last_month" | "this_quarter" | "this_year" | "custom";

interface PeriodSelectorProps {
  currentPeriod: PeriodType;
  onChange: (period: PeriodType) => void;
}

export function PeriodSelector({ currentPeriod, onChange }: PeriodSelectorProps) {
  const options: { label: string; value: PeriodType }[] = [
    { label: "Ce mois", value: "this_month" },
    { label: "Mois dernier", value: "last_month" },
    { label: "Ce trimestre", value: "this_quarter" },
    { label: "Cette année (2026)", value: "this_year" },
    { label: "Personnalisé", value: "custom" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] text-xs">
      <div className="flex items-center gap-1.5 px-2 text-[var(--muted)] font-medium">
        <Calendar size={13} />
        <span className="hidden sm:inline">Période :</span>
      </div>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "px-2.5 py-1 rounded-[var(--radius-sm)] font-medium transition-all duration-150 select-none",
            currentPeriod === opt.value
              ? "bg-[var(--accent)] text-white shadow-xs"
              : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--border-subtle)]"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
