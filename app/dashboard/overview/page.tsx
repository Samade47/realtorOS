"use client";

import * as React from "react";
import { PeriodSelector, PeriodType } from "@/components/dashboard/period-selector";
import { FinancialSummary } from "@/components/dashboard/financial-summary";
import { ActivityOverview } from "@/components/dashboard/activity-overview";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { TodaysPriorities } from "@/components/dashboard/todays-priorities";
import { CommissionStatusChart } from "@/components/dashboard/commission-status-chart";
import { UpcomingDeadlines } from "@/components/dashboard/upcoming-deadlines";
import { Info, Plus, FileSpreadsheet, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function OverviewPage() {
  const [period, setPeriod] = React.useState<PeriodType>("this_year");

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Demo Notice Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] shadow-xs">
        <div className="flex items-center gap-2.5 text-xs text-[var(--foreground)]">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--accent-subtle)] text-[var(--accent)] shrink-0">
            <Info size={14} />
          </div>
          <div>
            <span className="font-semibold">Espace Démo Actif — Tanger, Maroc</span>
            <span className="text-[var(--muted)] ml-1.5 hidden md:inline">
              Données réalistes pour agent auto-entrepreneur (transactions, commissions MAD, calculs IR 1% & cotisations AMO).
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/dashboard/settings">
            <Button variant="outline" size="sm">
              Configurer mon agence
            </Button>
          </Link>
        </div>
      </div>

      {/* Header with Title and Period Filter */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
            Vue d'ensemble
          </h1>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            Tableau de bord de pilotage d'activité • Tanger (GMT+1)
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <PeriodSelector currentPeriod={period} onChange={setPeriod} />
          <Link href="/dashboard/transactions/new">
            <Button size="sm" leftIcon={<Plus size={14} />}>
              Nouvelle affaire
            </Button>
          </Link>
        </div>
      </div>

      {/* 1. Financial KPI Cards */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            Indicateurs Financiers & Trésorerie (MAD)
          </h2>
          <span className="text-[11px] text-[var(--muted)]">Calculs libératoires à jour</span>
        </div>
        <FinancialSummary />
      </section>

      {/* 2. Operational Activity Row */}
      <section className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
          Activité Opérationnelle en cours
        </h2>
        <ActivityOverview />
      </section>

      {/* 3. Charts & Priorities Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 cols: Monthly Cash Flow Chart */}
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>

        {/* Right 1 col: Commission Breakdown */}
        <div className="lg:col-span-1">
          <CommissionStatusChart />
        </div>
      </div>

      {/* 4. Action Items & Deadlines Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Today's Priorities */}
        <TodaysPriorities />

        {/* Upcoming Compliance Deadlines */}
        <UpcomingDeadlines />
      </div>
    </div>
  );
}
