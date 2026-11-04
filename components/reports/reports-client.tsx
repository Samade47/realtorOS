"use client";

import * as React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  BarChart3,
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  MapPin,
  Clock,
  Target,
  FileSpreadsheet,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DEMO_FINANCIAL_SUMMARY } from "@/lib/data/demo-data";
import { formatMAD } from "@/lib/utils";

export function ReportsClient() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const d = DEMO_FINANCIAL_SUMMARY;

  const neighborhoodData = [
    { name: "Malabata", value: 92500 },
    { name: "California", value: 72500 },
    { name: "Marshan", value: 45000 },
    { name: "Iberia", value: 35000 },
    { name: "Centre-ville", value: 26500 },
  ];

  const typeData = [
    { name: "Ventes Immobilières", value: 85, color: "var(--accent)" },
    { name: "Locations Longue Durée", value: 15, color: "var(--success)" },
  ];

  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Quartier,Volume Honoraires (MAD)\n" +
      neighborhoodData.map((e) => `"${e.name}",${e.value}`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "rapport_activite_realtoros_tanger_2026.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
            Analytique Commerciale & Rapports d'Activité
          </h1>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            Indicateurs clés de performance (KPIs) pour agent immobilier indépendant à Tanger
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={handleExportCSV} leftIcon={<FileSpreadsheet size={14} />}>
            Exporter les données (CSV)
          </Button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)]">
          <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider block">
            Honoraires moyens par vente
          </span>
          <span className="text-xl font-bold text-[var(--foreground)] mt-1 block">
            36 450 MAD
          </span>
          <span className="text-[11px] text-[var(--success)] font-medium">+8% vs N-1</span>
        </div>

        <div className="p-4 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)]">
          <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider block">
            Délai moyen de négociation
          </span>
          <span className="text-xl font-bold text-[var(--foreground)] mt-1 block">
            28 jours
          </span>
          <span className="text-[11px] text-[var(--muted)]">De la 1ère visite à l'offre</span>
        </div>

        <div className="p-4 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)]">
          <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider block">
            Quartier n°1 en chiffre d'affaires
          </span>
          <span className="text-xl font-bold text-[var(--accent)] mt-1 block">
            Malabata
          </span>
          <span className="text-[11px] text-[var(--muted)]">38% des honoraires collectés</span>
        </div>

        <div className="p-4 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)]">
          <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider block">
            Ratio conversion Mandat → Vente
          </span>
          <span className="text-xl font-bold text-[var(--success)] mt-1 block">
            68%
          </span>
          <span className="text-[11px] text-[var(--muted)]">Mandats exclusifs en priorité</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Revenue by Neighborhood */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Commissions Générées par Quartier (Tanger)</CardTitle>
            <CardDescription>Répartition géographique des honoraires encaissés (MAD)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[260px] w-full pt-4">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={neighborhoodData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" opacity={0.6} />
                    <XAxis type="number" tickFormatter={(v) => `${v / 1000}k`} tick={{ fontSize: 11, fill: "var(--muted)" }} />
                    <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--foreground)" }} />
                    <Tooltip
                      formatter={(val: any) => [formatMAD(val), "Honoraires"]}
                      contentStyle={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", borderRadius: "var(--radius-sm)", fontSize: "12px" }}
                    />
                    <Bar dataKey="value" fill="var(--accent)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-[var(--muted)]">Chargement…</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sales vs Rental Volume */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Part de Chiffre d'Affaires : Vente vs Location</CardTitle>
            <CardDescription>Orientation du modèle de revenus de l'activité</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[260px] w-full relative">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip
                      formatter={(val: any) => [`${val}%`, "Part de CA"]}
                      contentStyle={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", borderRadius: "var(--radius-sm)", fontSize: "12px" }}
                    />
                    <Pie
                      data={typeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {typeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-[var(--muted)]">Chargement…</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
