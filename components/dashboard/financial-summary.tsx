"use client";

import * as React from "react";
import { formatMAD } from "@/lib/utils";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import {
  Banknote,
  Clock,
  AlertTriangle,
  TrendingDown,
  Sparkles,
  Calculator,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { DEMO_FINANCIAL_SUMMARY } from "@/lib/data/demo-data";

export function FinancialSummary() {
  const data = DEMO_FINANCIAL_SUMMARY;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* 1. Commissions perçues */}
      <StatCard
        label="Commissions perçues"
        value={formatMAD(data.commissionsCollectedYTD)}
        subtitle="Encaissé cette année"
        trend={{ value: 14.2, isPositive: true }}
        icon={<Banknote size={16} className="text-[var(--success)]" />}
        variant="success"
      />

      {/* 2. Commissions attendues (Pipeline) */}
      <StatCard
        label="Commissions attendues"
        value={formatMAD(data.commissionsExpected)}
        subtitle="Pipeline en négociation"
        badge={<Badge variant="info">Pipeline</Badge>}
        icon={<Clock size={16} className="text-[var(--accent)]" />}
        variant="accent"
      />

      {/* 3. Commissions en attente de solde */}
      <StatCard
        label="Commissions en souffrance"
        value={formatMAD(data.commissionsPendingCollection)}
        subtitle={`Dont ${formatMAD(data.commissionsOverdue)} en retard`}
        trend={{ value: -5.0, isPositive: false }}
        badge={<Badge variant="warning">À relancer</Badge>}
        icon={<AlertTriangle size={16} className="text-[var(--warning)]" />}
        variant="warning"
      />

      {/* 4. Solde disponible net */}
      <StatCard
        label="Solde disponible"
        value={formatMAD(data.availableCash)}
        subtitle="Trésorerie estimée"
        icon={<Wallet size={16} className="text-[var(--accent)]" />}
        variant="default"
      />

      {/* 5. Dépenses d'exploitation */}
      <StatCard
        label="Frais professionnels"
        value={formatMAD(data.totalExpensesYTD)}
        subtitle="Carburant, comm., abonnements"
        icon={<TrendingDown size={16} className="text-[var(--muted)]" />}
        variant="default"
      />

      {/* 6. Bénéfice net estimé */}
      <StatCard
        label="Bénéfice net estimé"
        value={formatMAD(data.netProfitYTD)}
        subtitle="Encaissements - Dépenses"
        badge={<Badge variant="success">Marge 87%</Badge>}
        icon={<Sparkles size={16} className="text-[var(--success)]" />}
        variant="success"
      />

      {/* 7. IR Auto-Entrepreneur (ESTIMATION 1%) */}
      <StatCard
        label="IR Estimé (1% CA)"
        value={formatMAD(data.estimatedIRYTD)}
        subtitle="Base : 218 750 MAD encaissés"
        badge={<Badge variant="outline">Estimation</Badge>}
        icon={<Calculator size={16} className="text-[var(--accent)]" />}
        variant="default"
      />

      {/* 8. CNSS / AMO */}
      <StatCard
        label="Obligation CNSS / AMO"
        value={`${data.cnssQuarterlyAmount} MAD / trim`}
        subtitle="Prochaine échéance : 31 Déc"
        badge={<Badge variant="success">À jour</Badge>}
        icon={<ShieldCheck size={16} className="text-[var(--success)]" />}
        variant="default"
      />
    </div>
  );
}
