"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeftRight,
  Plus,
  Search,
  Filter,
  DollarSign,
  ChevronRight,
  User,
  Building,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileText,
  BadgePercent,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/search-input";
import { DEMO_TRANSACTIONS, DemoTransaction } from "@/lib/data/demo-data";
import { formatMAD } from "@/lib/utils";

export function TransactionsClient() {
  const [transactions, setTransactions] = React.useState<DemoTransaction[]>(DEMO_TRANSACTIONS);
  const [search, setSearch] = React.useState("");
  const [viewMode, setViewMode] = React.useState<"pipeline" | "table">("pipeline");
  const [selectedType, setSelectedType] = React.useState<string>("ALL");

  const filtered = React.useMemo(() => {
    return transactions.filter((t) => {
      const matchSearch =
        t.reference.toLowerCase().includes(search.toLowerCase()) ||
        t.propertyTitle.toLowerCase().includes(search.toLowerCase()) ||
        t.clientName.toLowerCase().includes(search.toLowerCase()) ||
        t.sellerName.toLowerCase().includes(search.toLowerCase());

      const matchType = selectedType === "ALL" || t.type === selectedType;

      return matchSearch && matchType;
    });
  }, [transactions, search, selectedType]);

  // Total volume in pipeline
  const totalVolume = filtered.reduce((acc, t) => acc + t.value, 0);
  const totalAgreedCommission = filtered.reduce((acc, t) => acc + t.agreedCommission, 0);

  // Pipeline stages
  const STAGES = [
    { key: "LEAD", label: "Prospection", count: 0 },
    { key: "QUALIFIED", label: "Visite effectuée", count: 0 },
    { key: "OFFER_SUBMITTED", label: "Offre soumise", count: 0 },
    { key: "NEGOTIATION", label: "Négociation", count: 0 },
    { key: "CONTRACT_SIGNED", label: "Compromis notarié", count: 0 },
    { key: "COMPLETED", label: "Acte signé & Payé", count: 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
            Pipeline des Transactions
          </h1>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            Suivi des dossiers de vente et de location de la première offre jusqu'à l'acte authentique
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/commissions">
            <Button variant="outline" size="sm" leftIcon={<BadgePercent size={14} />}>
              Livre des commissions
            </Button>
          </Link>
          <Link href="/dashboard/transactions/new">
            <Button size="sm" leftIcon={<Plus size={14} />}>
              Nouvelle affaire
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)]">
          <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider block">
            Volume en cours
          </span>
          <span className="text-xl font-bold text-[var(--foreground)] mt-1 block">
            {formatMAD(totalVolume)}
          </span>
          <span className="text-[11px] text-[var(--muted)]">{filtered.length} dossiers actifs</span>
        </div>

        <div className="p-4 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)]">
          <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider block">
            Honoraires convenus estimés
          </span>
          <span className="text-xl font-bold text-[var(--accent)] mt-1 block">
            {formatMAD(totalAgreedCommission)}
          </span>
          <span className="text-[11px] text-[var(--muted)]">Calculé selon barème mandat</span>
        </div>

        <div className="p-4 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)]">
          <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider block">
            Taux de concrétisation
          </span>
          <span className="text-xl font-bold text-[var(--success)] mt-1 block">
            78.5%
          </span>
          <span className="text-[11px] text-[var(--muted)]">Compromis menés à terme</span>
        </div>
      </div>

      {/* Filter and View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="max-w-md w-full">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Rechercher par référence, bien, acquéreur…"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 p-1 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] text-xs">
            {["ALL", "SALE", "RENTAL"].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-2.5 py-1 rounded-[var(--radius-sm)] font-medium transition-colors ${
                  selectedType === t
                    ? "bg-[var(--accent)] text-white"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {t === "ALL" ? "Tous" : t === "SALE" ? "Ventes" : "Locations"}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 p-1 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] text-xs">
            <button
              onClick={() => setViewMode("pipeline")}
              className={`px-2.5 py-1 rounded-[var(--radius-sm)] font-medium transition-colors ${
                viewMode === "pipeline"
                  ? "bg-[var(--accent)] text-white"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              Pipeline (Kanban)
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-2.5 py-1 rounded-[var(--radius-sm)] font-medium transition-colors ${
                viewMode === "table"
                  ? "bg-[var(--accent)] text-white"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              Tableau
            </button>
          </div>
        </div>
      </div>

      {/* Pipeline View (Kanban) */}
      {viewMode === "pipeline" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 overflow-x-auto pb-4">
          {STAGES.map((stg) => {
            const stageItems = filtered.filter((t) => t.status === stg.key);

            return (
              <div
                key={stg.key}
                className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)]/70 p-3 min-w-[240px] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[var(--border)]">
                    <span className="text-xs font-bold text-[var(--foreground)] truncate">
                      {stg.label}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[var(--border)] text-[var(--muted)]">
                      {stageItems.length}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {stageItems.length === 0 ? (
                      <div className="py-8 text-center text-[11px] text-[var(--muted)] italic">
                        Aucun dossier
                      </div>
                    ) : (
                      stageItems.map((item) => (
                        <div
                          key={item.id}
                          className="p-3 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] shadow-2xs space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] font-bold text-[var(--accent)]">
                              {item.reference}
                            </span>
                            <Badge variant={item.type === "SALE" ? "default" : "info"}>
                              {item.type === "SALE" ? "Vente" : "Location"}
                            </Badge>
                          </div>

                          <p className="font-semibold text-[var(--foreground)] line-clamp-2">
                            {item.propertyTitle}
                          </p>

                          <div className="space-y-0.5 text-[11px] text-[var(--muted)]">
                            <p>👤 Client : <span className="font-medium text-[var(--foreground)]">{item.clientName}</span></p>
                            <p>🏠 Vendeur : <span className="font-medium text-[var(--foreground)]">{item.sellerName}</span></p>
                          </div>

                          <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-[var(--muted)] block">Commission</span>
                              <span className="font-bold text-[var(--accent)]">
                                {formatMAD(item.agreedCommission)}
                              </span>
                            </div>
                            <span className="text-[10px] text-[var(--muted)]">
                              Prix : {formatMAD(item.value, true)}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--background)] text-[var(--muted)]">
                  <th className="p-3 font-semibold">Référence</th>
                  <th className="p-3 font-semibold">Bien immobilier</th>
                  <th className="p-3 font-semibold">Acquéreur / Locataire</th>
                  <th className="p-3 font-semibold">Vendeur</th>
                  <th className="p-3 font-semibold">Prix convenu</th>
                  <th className="p-3 font-semibold">Honoraires convenus</th>
                  <th className="p-3 font-semibold">Stade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-[var(--border-subtle)] transition-colors">
                    <td className="p-3 font-mono font-bold text-[var(--accent)]">{t.reference}</td>
                    <td className="p-3 font-semibold text-[var(--foreground)]">{t.propertyTitle}</td>
                    <td className="p-3">{t.clientName}</td>
                    <td className="p-3 text-[var(--muted)]">{t.sellerName}</td>
                    <td className="p-3 font-bold">{formatMAD(t.value)}</td>
                    <td className="p-3 font-bold text-[var(--accent)]">{formatMAD(t.agreedCommission)}</td>
                    <td className="p-3">
                      <Badge variant="muted">{t.stageName}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
