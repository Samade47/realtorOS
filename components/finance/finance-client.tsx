"use client";

import * as React from "react";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  Plus,
  Search,
  Fuel,
  Share2,
  Phone,
  Camera,
  Laptop,
  Building,
  CheckCircle2,
  FileSpreadsheet,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DEMO_EXPENSES, DemoExpense, DEMO_FINANCIAL_SUMMARY } from "@/lib/data/demo-data";
import { formatMAD } from "@/lib/utils";

export function FinanceClient() {
  const [expenses, setExpenses] = React.useState<DemoExpense[]>(DEMO_EXPENSES);
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [newExp, setNewExp] = React.useState({
    description: "",
    category: "FUEL" as DemoExpense["category"],
    amount: "",
    supplier: "",
    paymentMethod: "card" as DemoExpense["paymentMethod"],
    date: "2026-11-03",
  });

  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const totalIncome = DEMO_FINANCIAL_SUMMARY.commissionsCollectedYTD;
  const netCashFlow = totalIncome - totalExpenses;

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(newExp.amount);
    if (!amt || amt <= 0) return;

    setExpenses([
      {
        id: `exp-${Date.now()}`,
        date: newExp.date,
        category: newExp.category,
        description: newExp.description,
        amount: amt,
        supplier: newExp.supplier || "Fournisseur",
        paymentMethod: newExp.paymentMethod,
        deductible: false,
      },
      ...expenses,
    ]);

    setShowAddModal(false);
    setNewExp({
      description: "",
      category: "FUEL",
      amount: "",
      supplier: "",
      paymentMethod: "card",
      date: "2026-11-03",
    });
  };

  const getCategoryIcon = (cat: DemoExpense["category"]) => {
    switch (cat) {
      case "FUEL":
        return <Fuel size={14} className="text-[var(--warning)]" />;
      case "ADVERTISING":
        return <Share2 size={14} className="text-[var(--accent)]" />;
      case "PHONE":
        return <Phone size={14} className="text-[var(--success)]" />;
      case "PHOTOGRAPHY":
        return <Camera size={14} className="text-purple-500" />;
      case "SOFTWARE":
        return <Laptop size={14} className="text-blue-500" />;
      default:
        return <Building size={14} className="text-[var(--muted)]" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
            Gestion Financière & Dépenses Professionnelles
          </h1>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            Suivi des charges réelles de fonctionnement de l'agent immobilier indépendant
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setShowAddModal(true)} leftIcon={<Plus size={14} />}>
            Enregistrer une dépense
          </Button>
        </div>
      </div>

      {/* 3 Large KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)]">
          <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider block">
            Revenus encaissés (Total)
          </span>
          <span className="text-2xl font-bold text-[var(--success)] mt-1 block">
            {formatMAD(totalIncome)}
          </span>
          <span className="text-[11px] text-[var(--muted)]">Commissions effectivement perçues</span>
        </div>

        <div className="p-4 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)]">
          <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider block">
            Charges d'exploitation
          </span>
          <span className="text-2xl font-bold text-[var(--danger)] mt-1 block">
            {formatMAD(totalExpenses)}
          </span>
          <span className="text-[11px] text-[var(--muted)]">Déplacements, communication, logiciels</span>
        </div>

        <div className="p-4 rounded-[var(--radius)] border-l-4 border-l-[var(--accent)] border border-[var(--border)] bg-[var(--surface)]">
          <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider block">
            Flux de trésorerie net
          </span>
          <span className="text-2xl font-bold text-[var(--accent)] mt-1 block">
            {formatMAD(netCashFlow)}
          </span>
          <span className="text-[11px] text-[var(--muted)]">Solde réel disponible avant impôt</span>
        </div>
      </div>

      {/* Expenses Table */}
      <Card>
        <CardHeader className="pb-3 border-b border-[var(--border)]">
          <CardTitle>Journal des Frais & Dépenses d'Exploitation</CardTitle>
          <CardDescription>
            Note : Dans le régime de l'auto-entrepreneur au Maroc, l'impôt est calculé sur le Chiffre d'Affaires brut (1%) sans déduction des charges, mais ce suivi est capital pour piloter votre rentabilité réelle.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--background)] text-[var(--muted)]">
                  <th className="p-3.5 font-semibold">Date</th>
                  <th className="p-3.5 font-semibold">Poste de dépense</th>
                  <th className="p-3.5 font-semibold">Désignation</th>
                  <th className="p-3.5 font-semibold">Fournisseur</th>
                  <th className="p-3.5 font-semibold">Paiement</th>
                  <th className="p-3.5 font-semibold text-right">Montant TTC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {expenses.map((e) => (
                  <tr key={e.id} className="hover:bg-[var(--border-subtle)] transition-colors">
                    <td className="p-3.5 text-[var(--muted)]">{e.date}</td>
                    <td className="p-3.5">
                      <span className="flex items-center gap-1.5 font-medium">
                        {getCategoryIcon(e.category)}
                        <span className="capitalize">{e.category.toLowerCase()}</span>
                      </span>
                    </td>
                    <td className="p-3.5 font-semibold text-[var(--foreground)]">{e.description}</td>
                    <td className="p-3.5 text-[var(--muted)]">{e.supplier}</td>
                    <td className="p-3.5 capitalize text-[var(--muted)]">{e.paymentMethod}</td>
                    <td className="p-3.5 text-right font-bold text-[var(--danger)]">
                      -{formatMAD(e.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <h3 className="text-base font-bold text-[var(--foreground)]">
                Enregistrer une Charge Professionnelle
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-4">
              <Input
                label="Désignation de la dépense *"
                required
                placeholder="Ex: Plein carburant visites Malabata"
                value={newExp.description}
                onChange={(e) => setNewExp({ ...newExp, description: e.target.value })}
              />

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--foreground)]">
                    Catégorie *
                  </label>
                  <select
                    value={newExp.category}
                    onChange={(e: any) => setNewExp({ ...newExp, category: e.target.value })}
                    className="w-full h-9 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 text-xs"
                  >
                    <option value="FUEL">Carburant / Déplacements</option>
                    <option value="ADVERTISING">Publicité & Marketing</option>
                    <option value="PHONE">Téléphonie & Internet</option>
                    <option value="PHOTOGRAPHY">Shooting & Vidéo</option>
                    <option value="SOFTWARE">Abonnements logiciels</option>
                    <option value="CNSS_AMO">Cotisations CNSS / AMO</option>
                    <option value="OFFICE">Fournitures bureau</option>
                  </select>
                </div>

                <Input
                  label="Montant TTC (MAD) *"
                  required
                  type="number"
                  placeholder="Ex: 650"
                  value={newExp.amount}
                  onChange={(e) => setNewExp({ ...newExp, amount: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Fournisseur / Commerçant"
                  placeholder="Ex: TotalEnergies"
                  value={newExp.supplier}
                  onChange={(e) => setNewExp({ ...newExp, supplier: e.target.value })}
                />

                <Input
                  label="Date"
                  type="date"
                  value={newExp.date}
                  onChange={(e) => setNewExp({ ...newExp, date: e.target.value })}
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border)]">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                  Annuler
                </Button>
                <Button type="submit">Valider la dépense</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
