"use client";

import * as React from "react";
import Link from "next/link";
import {
  Calculator,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  ExternalLink,
  FileCheck,
  Building,
  Info,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DEMO_FINANCIAL_SUMMARY } from "@/lib/data/demo-data";
import { AUTO_ENTREPRENEUR_RULES } from "@/lib/tax-engine/moroccan-tax-rules";
import { formatMAD } from "@/lib/utils";

export function TaxClient() {
  const d = DEMO_FINANCIAL_SUMMARY;
  const currentRule = AUTO_ENTREPRENEUR_RULES[0];

  const ceilingPct = Math.min(100, (d.turnoverCollectedYTD / d.turnoverCeilingMAD) * 100);

  return (
    <div className="space-y-6">
      {/* Official Disclaimer Banner */}
      <div className="p-4 rounded-[var(--radius)] border border-[var(--warning)]/40 bg-[var(--warning-subtle)] text-xs text-[var(--foreground)] space-y-1">
        <div className="flex items-center gap-2 font-bold text-[var(--warning)]">
          <AlertTriangle size={15} />
          <span>ESTIMATIONS FISCALES & SOCIALES MAROCAINES — À TITRE INFORMATIF</span>
        </div>
        <p className="text-[var(--muted)] leading-relaxed">
          Les règles ci-dessous sont basées sur le statut d'auto-entrepreneur au Maroc (Loi de Finances / CGI art. 40bis). Les calculs d'IR sont établis sur la base du chiffre d'affaires effectivement encaissé (1% libératoire pour les prestations de services) dans la limite du plafond de 500 000 MAD. Pour valider vos déclarations officielles, connectez-vous sur les portails agréés (rnve.ma et cnss.ma) ou consultez un expert-comptable.
        </p>
      </div>

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
            Fiscalité Marocaine & Obligations Sociales (AMO/CNSS)
          </h1>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            Régime : Auto-Entrepreneur • Activité : Services / Prestations Immobilières • Ville : Tanger
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a href="https://www.rnve.ma" target="_blank" rel="noreferrer">
            <Button variant="outline" size="sm" rightIcon={<ExternalLink size={13} />}>
              Portail Auto-Entrepreneur
            </Button>
          </a>
          <a href="https://www.cnss.ma" target="_blank" rel="noreferrer">
            <Button variant="outline" size="sm" rightIcon={<ExternalLink size={13} />}>
              Portail CNSS
            </Button>
          </a>
        </div>
      </div>

      {/* Ceiling & Turnover Meter */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Suivi du Plafond Annuel Auto-Entrepreneur</CardTitle>
              <CardDescription>
                Plafond légal : 500 000 MAD / an de Chiffre d'Affaires encaissé (Services)
              </CardDescription>
            </div>
            <Badge variant={ceilingPct > 80 ? "warning" : "success"}>
              {ceilingPct.toFixed(1)}% consommé
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="w-full bg-[var(--border)] rounded-full h-3 overflow-hidden">
            <div
              className="bg-[var(--accent)] h-full transition-all duration-300"
              style={{ width: `${ceilingPct}%` }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
            <div className="p-3 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)]">
              <span className="text-[var(--muted)] block">Chiffre d'Affaires Encaissé (2026)</span>
              <span className="text-lg font-bold text-[var(--foreground)] mt-0.5 block">
                {formatMAD(d.turnoverCollectedYTD)}
              </span>
              <span className="text-[10px] text-[var(--success)]">Seulement les sommes perçues</span>
            </div>

            <div className="p-3 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)]">
              <span className="text-[var(--muted)] block">Marge restante sur le plafond</span>
              <span className="text-lg font-bold text-[var(--accent)] mt-0.5 block">
                {formatMAD(d.turnoverCeilingRemaining)}
              </span>
              <span className="text-[10px] text-[var(--muted)]">Avant passage obligatoire en SARL</span>
            </div>

            <div className="p-3 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)]">
              <span className="text-[var(--muted)] block">IR Total Estimé (Taux 1%)</span>
              <span className="text-lg font-bold text-[var(--foreground)] mt-0.5 block">
                {formatMAD(d.estimatedIRYTD)}
              </span>
              <span className="text-[10px] text-[var(--muted)]">Dont {formatMAD(d.taxPaidYTD)} déjà réglé</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Two columns: Tax Declarations Calendar + CNSS/AMO Social Coverage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Tax Declarations Schedule */}
        <Card>
          <CardHeader className="pb-3 border-b border-[var(--border)]">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Calendrier des Déclarations Trimestrielles</CardTitle>
                <CardDescription>Échéances fiscales DGI (Direction Générale des Impôts)</CardDescription>
              </div>
              <Badge variant="outline">Année 2026</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-4 text-xs">
            {[
              {
                period: "1er Trimestre (T1 2026)",
                dates: "Janvier - Mars",
                deadline: "30 Avril 2026",
                declaredCA: 55500,
                irPaid: 555,
                status: "PAID",
              },
              {
                period: "2ème Trimestre (T2 2026)",
                dates: "Avril - Juin",
                deadline: "31 Juillet 2026",
                declaredCA: 76000,
                irPaid: 760,
                status: "PAID",
              },
              {
                period: "3ème Trimestre (T3 2026)",
                dates: "Juillet - Septembre",
                deadline: "30 Novembre 2026",
                declaredCA: 69500,
                irPaid: 695,
                status: "PENDING",
              },
              {
                period: "4ème Trimestre (T4 2026)",
                dates: "Octobre - Décembre",
                deadline: "31 Janvier 2027",
                declaredCA: 17750,
                irPaid: 177.5,
                status: "FUTURE",
              },
            ].map((trim, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)]"
              >
                <div>
                  <p className="font-bold text-[var(--foreground)]">{trim.period}</p>
                  <p className="text-[11px] text-[var(--muted)]">
                    Échéance légale : <span className="font-semibold">{trim.deadline}</span>
                  </p>
                  <p className="text-[11px] text-[var(--muted)] mt-1">
                    CA encaissé : {formatMAD(trim.declaredCA)} → IR dû :{" "}
                    <strong className="text-[var(--foreground)]">{formatMAD(trim.irPaid)}</strong>
                  </p>
                </div>
                <div>
                  {trim.status === "PAID" ? (
                    <Badge variant="success">Déclaré & Payé</Badge>
                  ) : trim.status === "PENDING" ? (
                    <Badge variant="warning">À déclarer (30 Nov)</Badge>
                  ) : (
                    <Badge variant="muted">Période en cours</Badge>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* CNSS & AMO Social Protection */}
        <Card>
          <CardHeader className="pb-3 border-b border-[var(--border)]">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Protection Sociale : CNSS & AMO</CardTitle>
                <CardDescription>Couverture médicale obligatoire pour travailleurs indépendants</CardDescription>
              </div>
              <Badge variant="success">Affiliation Active</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-4 text-xs">
            {/* Warning on distinction */}
            <div className="p-3 rounded-[var(--radius-sm)] bg-[var(--accent-subtle)]/50 border border-[var(--accent)]/30 text-[11px] text-[var(--foreground)] space-y-1">
              <span className="font-bold block text-[var(--accent)]">
                Distinction Importante : AMO vs Retraite
              </span>
              <p className="text-[var(--muted)]">
                L'adhésion au régime des TNS (Travailleurs Non Salariés) vous garantit la couverture médicale universelle (AMO). En revanche, pour valider des trimestres de retraite CNSS, une souscription complémentaire volontaire au régime de retraite de la CNSS est requise.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-2.5 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)]">
                <span className="text-[var(--muted)] block">N° Immatriculation CNSS</span>
                <span className="font-mono font-bold text-[var(--foreground)]">984120938</span>
              </div>
              <div className="p-2.5 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)]">
                <span className="text-[var(--muted)] block">Fréquence de paiement</span>
                <span className="font-bold text-[var(--foreground)]">Trimestrielle</span>
              </div>
            </div>

            <div className="p-3 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] flex items-center justify-between">
              <div>
                <span className="font-bold text-[var(--foreground)] block">Cotisation AMO Trimestrielle</span>
                <span className="text-[11px] text-[var(--muted)]">Prochaine échéance : 31 Décembre 2026</span>
              </div>
              <span className="text-base font-bold text-[var(--success)]">600 MAD</span>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-[var(--muted)]">
                Statut des cotisations : <strong className="text-[var(--success)]">À jour (Aucun arriéré)</strong>
              </span>
              <a href="https://www.macnss.ma" target="_blank" rel="noreferrer">
                <Button size="sm" variant="outline" rightIcon={<ExternalLink size={12} />}>
                  Télécharger attestation AMO
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Single Client Concentration Warning Check */}
      <Card>
        <CardHeader className="pb-3 border-b border-[var(--border)]">
          <CardTitle>Contrôle de Concentration Clientèle (Recommandation Fiscale)</CardTitle>
          <CardDescription>
            Si plus de 50% de vos honoraires proviennent d'une seule agence ou donneur d'ordre, vérifiez que la relation ne risque pas d'être requalifiée en salariat déguisé.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 text-xs">
          <div className="p-3 rounded-[var(--radius-sm)] bg-[var(--border-subtle)] border border-[var(--border)] flex items-center justify-between">
            <div>
              <span className="font-bold text-[var(--foreground)] block">
                Client Principal : Karim El Idrissi (Acquéreur & Investisseur)
              </span>
              <span className="text-[11px] text-[var(--muted)]">
                Part dans le chiffre d'affaires 2026 : <strong>16.5%</strong> (36 250 MAD / 218 750 MAD)
              </span>
            </div>
            <Badge variant="success">Seuil respecté (&lt; 50%)</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
