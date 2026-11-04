"use client";

import * as React from "react";
import { Users, UserPlus, Building2, Eye, Handshake, CheckCircle2, Percent } from "lucide-react";
import { DEMO_FINANCIAL_SUMMARY } from "@/lib/data/demo-data";

export function ActivityOverview() {
  const d = DEMO_FINANCIAL_SUMMARY;

  const stats = [
    { label: "Contacts actifs", value: d.activeContacts, icon: Users, sub: "Dans le carnet" },
    { label: "Nouveaux leads", value: `+${d.newLeadsThisMonth}`, icon: UserPlus, sub: "Ce mois-ci" },
    { label: "Propriétés actives", value: d.activeProperties, icon: Building2, sub: "À Tanger" },
    { label: "Visites prévues", value: d.scheduledVisits, icon: Eye, sub: "Semaine en cours" },
    { label: "Négociations", value: d.activeNegotiations, icon: Handshake, sub: "Offres en cours" },
    { label: "Ventes conclues", value: d.transactionsCompletedYTD, icon: CheckCircle2, sub: "Depuis janv." },
    { label: "Taux conversion", value: `${d.conversionRate}%`, icon: Percent, sub: "Leads → Actes" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
      {stats.map((item) => (
        <div
          key={item.label}
          className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] p-3 text-center transition-all hover:border-[var(--accent)]"
        >
          <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-[var(--border-subtle)] text-[var(--accent)]">
            <item.icon size={14} />
          </div>
          <div className="mt-2 text-base font-bold text-[var(--foreground)] leading-none">
            {item.value}
          </div>
          <div className="mt-1 text-[11px] font-medium text-[var(--foreground)] truncate">
            {item.label}
          </div>
          <div className="text-[10px] text-[var(--muted)] truncate">{item.sub}</div>
        </div>
      ))}
    </div>
  );
}
