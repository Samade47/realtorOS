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
  Legend,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { DEMO_MONTHLY_REVENUE } from "@/lib/data/demo-data";
import { formatMAD } from "@/lib/utils";

export function RevenueChart() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] p-2.5 shadow-md text-xs">
          <p className="font-semibold text-[var(--foreground)] mb-1">{label} 2026</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} className="flex items-center gap-2" style={{ color: entry.color }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="font-medium text-[var(--muted)]">{entry.name}:</span>
              <span className="font-bold text-[var(--foreground)]">{formatMAD(entry.value)}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Flux de trésorerie mensuel</CardTitle>
          <CardDescription>Commissions perçues vs attendues vs dépenses d'exploitation (MAD)</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full pt-4">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DEMO_MONTHLY_REVENUE} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.6} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--muted)" }} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val / 1000}k`}
                  tick={{ fontSize: 11, fill: "var(--muted)" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: "12px", fontSize: "11px" }}
                  formatter={(value) => <span className="text-[var(--foreground)]">{value}</span>}
                />
                <Bar dataKey="collected" name="Commissions perçues" fill="var(--success)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expected" name="Commissions attendues" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Frais réels" fill="var(--danger)" radius={[4, 4, 0, 0]} opacity={0.7} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-[var(--muted)]">
              Chargement du graphique…
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
