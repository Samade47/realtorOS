"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, Save, Calculator } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DEMO_CONTACTS, DEMO_PROPERTIES } from "@/lib/data/demo-data";
import { formatMAD } from "@/lib/utils";

export default function NewTransactionPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const [formData, setFormData] = React.useState({
    type: "SALE",
    propertyId: DEMO_PROPERTIES[0].id,
    buyerId: DEMO_CONTACTS[0].id,
    sellerId: DEMO_CONTACTS[1].id,
    transactionValue: "1850000",
    commissionRate: "2.5", // 2.5%
    commissionPayer: "both", // 50% buyer, 50% seller
    agentSharePct: "100", // 100% or 50% if inter-agency
    notes: "",
  });

  const numVal = parseFloat(formData.transactionValue) || 0;
  const numRate = parseFloat(formData.commissionRate) || 0;
  const calculatedTotalCommission = (numVal * numRate) / 100;
  const agentShare = (calculatedTotalCommission * (parseFloat(formData.agentSharePct) || 100)) / 100;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard/transactions");
      }, 1200);
    }, 600);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/transactions">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={14} />}>
            Retour aux transactions
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Initier une Transaction & Calculer les Honoraires</CardTitle>
          <CardDescription>
            Associez un acquéreur, un vendeur et un bien sous mandat. Les honoraires prévisionnels sont calculés en temps réel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="p-8 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--success-subtle)] text-[var(--success)]">
                <Check size={24} />
              </div>
              <h3 className="text-base font-semibold text-[var(--foreground)]">
                Affaire enregistrée et intégrée au pipeline !
              </h3>
              <p className="text-xs text-[var(--muted)]">Redirection vers le pipeline…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Type and Property */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--foreground)]">
                    Type d'opération *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full h-9 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 text-sm"
                  >
                    <option value="SALE">Vente immobilière (Compromis notarié)</option>
                    <option value="RENTAL">Bail d'habitation ou commercial</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--foreground)]">
                    Bien concerné du portefeuille *
                  </label>
                  <select
                    value={formData.propertyId}
                    onChange={(e) => {
                      const prop = DEMO_PROPERTIES.find((p) => p.id === e.target.value);
                      setFormData({
                        ...formData,
                        propertyId: e.target.value,
                        transactionValue: prop ? prop.price.toString() : formData.transactionValue,
                      });
                    }}
                    className="w-full h-9 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 text-sm"
                  >
                    {DEMO_PROPERTIES.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.reference} — {p.title} ({formatMAD(p.price)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Parties */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--foreground)]">
                    Acquéreur / Preneur *
                  </label>
                  <select
                    value={formData.buyerId}
                    onChange={(e) => setFormData({ ...formData, buyerId: e.target.value })}
                    className="w-full h-9 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 text-sm"
                  >
                    {DEMO_CONTACTS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.fullName} ({c.contactType}) — {c.phone}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--foreground)]">
                    Vendeur / Propriétaire bailleur *
                  </label>
                  <select
                    value={formData.sellerId}
                    onChange={(e) => setFormData({ ...formData, sellerId: e.target.value })}
                    className="w-full h-9 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 text-sm"
                  >
                    {DEMO_CONTACTS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.fullName} ({c.contactType}) — {c.phone}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Financial Calculation Box */}
              <div className="rounded-[var(--radius-sm)] border border-[var(--border)] p-4 bg-[var(--background)] space-y-4">
                <div className="flex items-center gap-2">
                  <Calculator size={15} className="text-[var(--accent)]" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
                    Simulateur d'Honoraires & Partage Agence (MAD)
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Prix net vendeur ou convenu (MAD) *"
                    required
                    value={formData.transactionValue}
                    onChange={(e) => setFormData({ ...formData, transactionValue: e.target.value })}
                  />

                  <Input
                    label="Taux de commission total (%) *"
                    required
                    value={formData.commissionRate}
                    onChange={(e) => setFormData({ ...formData, commissionRate: e.target.value })}
                  />

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--foreground)]">
                      Charge de la commission
                    </label>
                    <select
                      value={formData.commissionPayer}
                      onChange={(e) => setFormData({ ...formData, commissionPayer: e.target.value })}
                      className="w-full h-9 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 text-sm"
                    >
                      <option value="both">Partagée 50/50 (Acquéreur & Vendeur)</option>
                      <option value="buyer">100% à la charge de l'acquéreur</option>
                      <option value="seller">100% à la charge du vendeur</option>
                    </select>
                  </div>
                </div>

                {/* Live Output Banner */}
                <div className="p-3.5 rounded-[var(--radius-sm)] bg-[var(--surface)] border border-[var(--accent)]/40 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[var(--muted)] block">Honoraires d'agence prévisionnels totaux :</span>
                    <span className="text-base font-bold text-[var(--foreground)]">
                      {formatMAD(calculatedTotalCommission)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[var(--muted)] block">Part nette revenant à l'agent :</span>
                    <span className="text-base font-bold text-[var(--accent)]">
                      {formatMAD(agentShare)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--foreground)]">
                  Conditions particulières du compromis
                </label>
                <textarea
                  rows={2}
                  placeholder="Date de signature chez le notaire, clause suspensive de prêt, séquestre…"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] p-2.5 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              {/* Submit */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <Link href="/dashboard/transactions">
                  <Button type="button" variant="outline">
                    Annuler
                  </Button>
                </Link>
                <Button type="submit" isLoading={isSubmitting} leftIcon={<Save size={14} />}>
                  Créer l'affaire
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
