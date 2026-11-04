"use client";

import * as React from "react";
import Link from "next/link";
import {
  Banknote,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Receipt,
  Download,
  DollarSign,
  Calendar,
  CreditCard,
  Building,
  FileCheck,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DEMO_COMMISSIONS, DemoCommission } from "@/lib/data/demo-data";
import { formatMAD } from "@/lib/utils";

export function CommissionsClient() {
  const [commissions, setCommissions] = React.useState<DemoCommission[]>(DEMO_COMMISSIONS);
  const [selectedCommission, setSelectedCommission] = React.useState<DemoCommission | null>(null);
  const [paymentAmount, setPaymentAmount] = React.useState("");
  const [paymentMethod, setPaymentMethod] = React.useState<"transfer" | "cheque" | "cash">("transfer");
  const [payerName, setPayerName] = React.useState("");
  const [paymentRef, setPaymentRef] = React.useState("");
  const [isRecording, setIsRecording] = React.useState(false);
  const [notificationMsg, setNotificationMsg] = React.useState<string | null>(null);

  // Totals
  const totalAgreed = commissions.reduce((acc, c) => acc + c.totalAgreed, 0);
  const totalCollected = commissions.reduce((acc, c) => acc + c.totalCollected, 0);
  const totalOutstanding = commissions.reduce((acc, c) => acc + c.totalOutstanding, 0);

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCommission) return;

    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0) return;

    setIsRecording(true);

    setTimeout(() => {
      setCommissions((prev) =>
        prev.map((c) => {
          if (c.id === selectedCommission.id) {
            const newCollected = c.totalCollected + amount;
            const newOutstanding = Math.max(0, c.totalAgreed - newCollected);
            const newStatus =
              newOutstanding === 0
                ? ("COLLECTED" as const)
                : ("PARTIAL" as const);

            return {
              ...c,
              totalCollected: newCollected,
              totalOutstanding: newOutstanding,
              status: newStatus,
              payments: [
                ...c.payments,
                {
                  id: `pay-${Date.now()}`,
                  amount,
                  date: new Date().toISOString().split("T")[0],
                  method: paymentMethod,
                  payer: payerName || "Client",
                  ref: paymentRef || "REC-" + Date.now().toString().slice(-4),
                },
              ],
            };
          }
          return c;
        })
      );

      setIsRecording(false);
      setSelectedCommission(null);
      setPaymentAmount("");
      setPayerName("");
      setPaymentRef("");
      setNotificationMsg(`Encaissement de ${formatMAD(amount)} enregistré avec succès !`);
      setTimeout(() => setNotificationMsg(null), 4000);
    }, 400);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COLLECTED":
        return <Badge variant="success">Totalement Encaissé</Badge>;
      case "PARTIAL":
        return <Badge variant="warning">Acompte / Partiel</Badge>;
      case "EXPECTED":
        return <Badge variant="info">Attendu (Compromis)</Badge>;
      case "OVERDUE":
        return <Badge variant="danger">En retard de solde</Badge>;
      default:
        return <Badge variant="muted">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast alert */}
      {notificationMsg && (
        <div className="p-3.5 rounded-[var(--radius-sm)] bg-[var(--success-subtle)] border border-[var(--success)] text-xs text-[var(--success)] flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span className="font-semibold">{notificationMsg}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
            Livre des Commissions & Encaissements
          </h1>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            Suivi scrupuleux du cycle : Accordé → Facturé → Encaissé → Imposable (Moroccan MAD)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/finance">
            <Button variant="outline" size="sm">
              Trésorerie & Dépenses
            </Button>
          </Link>
        </div>
      </div>

      {/* 3 Large KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)]">
          <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider block">
            Commissions convenues
          </span>
          <span className="text-2xl font-bold text-[var(--foreground)] mt-1 block">
            {formatMAD(totalAgreed)}
          </span>
          <span className="text-[11px] text-[var(--muted)]">Montant contractuel brut</span>
        </div>

        <div className="p-4 rounded-[var(--radius)] border-l-4 border-l-[var(--success)] border border-[var(--border)] bg-[var(--surface)]">
          <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider block">
            RÉELLEMENT ENCAISSÉ
          </span>
          <span className="text-2xl font-bold text-[var(--success)] mt-1 block">
            {formatMAD(totalCollected)}
          </span>
          <span className="text-[11px] text-[var(--muted)]">Base du Chiffre d'Affaires fiscal (IR 1%)</span>
        </div>

        <div className="p-4 rounded-[var(--radius)] border-l-4 border-l-[var(--danger)] border border-[var(--border)] bg-[var(--surface)]">
          <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider block">
            RESTE À RECOUVRER (SOLDE)
          </span>
          <span className="text-2xl font-bold text-[var(--danger)] mt-1 block">
            {formatMAD(totalOutstanding)}
          </span>
          <span className="text-[11px] text-[var(--muted)]">Créances en cours de règlement</span>
        </div>
      </div>

      {/* Commission Ledger Table */}
      <Card>
        <CardHeader className="pb-3 border-b border-[var(--border)]">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Journal des Commissions par Affaire</CardTitle>
              <CardDescription>
                Ne confondez jamais une affaire signée avec un revenu perçu : chaque encaissement doit être justifié.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--background)] text-[var(--muted)]">
                  <th className="p-3.5 font-semibold">Affaire</th>
                  <th className="p-3.5 font-semibold">Bien concerné</th>
                  <th className="p-3.5 font-semibold">Montant accordé</th>
                  <th className="p-3.5 font-semibold">Déjà perçu</th>
                  <th className="p-3.5 font-semibold">Solde restant</th>
                  <th className="p-3.5 font-semibold">Statut</th>
                  <th className="p-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {commissions.map((item) => (
                  <tr key={item.id} className="hover:bg-[var(--border-subtle)] transition-colors">
                    <td className="p-3.5 font-mono font-bold text-[var(--accent)]">
                      {item.transactionRef}
                    </td>
                    <td className="p-3.5 font-semibold text-[var(--foreground)]">
                      {item.propertyTitle}
                    </td>
                    <td className="p-3.5 font-bold">{formatMAD(item.totalAgreed)}</td>
                    <td className="p-3.5 font-bold text-[var(--success)]">
                      {formatMAD(item.totalCollected)}
                    </td>
                    <td className="p-3.5 font-bold text-[var(--danger)]">
                      {item.totalOutstanding > 0 ? formatMAD(item.totalOutstanding) : "—"}
                    </td>
                    <td className="p-3.5">{getStatusBadge(item.status)}</td>
                    <td className="p-3.5 text-right">
                      {item.totalOutstanding > 0 ? (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => {
                            setSelectedCommission(item);
                            setPaymentAmount(item.totalOutstanding.toString());
                          }}
                        >
                          Encaisser solde
                        </Button>
                      ) : (
                        <span className="text-[11px] text-[var(--success)] font-semibold flex items-center justify-end gap-1">
                          <CheckCircle2 size={13} /> Soldé
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Record Payment Modal */}
      {selectedCommission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div>
                <h3 className="text-base font-bold text-[var(--foreground)]">
                  Enregistrer un Encaissement d'Honoraires
                </h3>
                <p className="text-xs text-[var(--muted)]">
                  Affaire {selectedCommission.transactionRef} • {selectedCommission.propertyTitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCommission(null)}
                className="text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div className="p-3 rounded-[var(--radius-sm)] bg-[var(--background)] text-xs flex justify-between">
                <span>Commission totale : <strong>{formatMAD(selectedCommission.totalAgreed)}</strong></span>
                <span>Déjà perçu : <strong className="text-[var(--success)]">{formatMAD(selectedCommission.totalCollected)}</strong></span>
                <span>Reste dû : <strong className="text-[var(--danger)]">{formatMAD(selectedCommission.totalOutstanding)}</strong></span>
              </div>

              <Input
                label="Montant encaissé (MAD) *"
                required
                type="number"
                max={selectedCommission.totalOutstanding}
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--foreground)]">
                    Mode de règlement *
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e: any) => setPaymentMethod(e.target.value)}
                    className="w-full h-9 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 text-xs"
                  >
                    <option value="transfer">Virement bancaire (Attijari, BCP, BMCE…)</option>
                    <option value="cheque">Chèque certifié</option>
                    <option value="cash">Espèces</option>
                  </select>
                </div>

                <Input
                  label="Émetteur / Payeur"
                  placeholder="Ex: Acquéreur / Notaire"
                  value={payerName}
                  onChange={(e) => setPayerName(e.target.value)}
                />
              </div>

              <Input
                label="Référence du paiement (N° Chèque / Réf Virement)"
                placeholder="Ex: VIR-84912 ou CHQ-00123"
                value={paymentRef}
                onChange={(e) => setPaymentRef(e.target.value)}
              />

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border)]">
                <Button type="button" variant="outline" onClick={() => setSelectedCommission(null)}>
                  Annuler
                </Button>
                <Button type="submit" isLoading={isRecording} leftIcon={<Receipt size={14} />}>
                  Confirmer l'encaissement
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
