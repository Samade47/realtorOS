"use client";

import * as React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { formatMAD } from "@/lib/utils";

export function CommissionStatusChart() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const data = [
    { name: "Perçues (YTD)", value: 218750, color: "var(--success)" },
    { name: "Attendues (Compromis)", value: 72500, color: "var(--accent)" },
    { name: "En négociation", value: 52750, color: "#8b5cf6" },
    { name: "En retard / Relance", value: 10000, color: "var(--danger)" },
  ];

  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      const pct = ((item.value / total) * 100).toFixed(1);
      return (
        <div className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] p-2 shadow-md text-xs">
          <p className="font-semibold text-[var(--foreground)]">{item.name}</p>
          <p className="font-bold text-[var(--accent)]">{formatMAD(item.value)} ({pct}%)</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle>Répartition des commissions</CardTitle>
        <CardDescription>Volume total engagé : {formatMAD(total)}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[210px] w-full relative">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomTooltip />} />
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-[var(--muted)]">
              Chargement…
            </div>
          )}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xs text-[var(--muted)]">Total volume</span>
            <span className="text-sm font-bold text-[var(--foreground)]">{formatMAD(total, true)}</span>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          {data.map((item) => (
            <div key={item.name} className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="truncate text-[var(--muted)]">{item.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
