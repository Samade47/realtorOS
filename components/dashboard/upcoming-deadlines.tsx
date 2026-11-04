"use client";

import * as React from "react";
import { AlertCircle, Calendar, Shield, FileCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function UpcomingDeadlines() {
  const deadlines = [
    {
      title: "Mandat Malabata (TNG-2026-042)",
      category: "Mandat",
      dueDate: "28 Nov 2026",
      daysLeft: 25,
      type: "mandate",
      alert: "warning",
    },
    {
      title: "Déclaration IR Auto-Entrepreneur T3",
      category: "Fiscalité",
      dueDate: "30 Nov 2026",
      daysLeft: 27,
      type: "tax",
      alert: "urgent",
    },
    {
      title: "Compromis Duplex California",
      category: "Notaire",
      dueDate: "30 Nov 2026",
      daysLeft: 27,
      type: "contract",
      alert: "normal",
    },
    {
      title: "Cotisation trimestrielle CNSS / AMO",
      category: "Social",
      dueDate: "31 Déc 2026",
      daysLeft: 58,
      type: "cnss",
      alert: "normal",
    },
  ];

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle>Échéances & Conformité</CardTitle>
        <CardDescription>Obligations légales, mandats & contrats</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {deadlines.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between gap-3 rounded-[var(--radius-sm)] border border-[var(--border)] p-3 hover:bg-[var(--border-subtle)] transition-colors text-xs"
          >
            <div className="flex items-start gap-2.5 min-w-0">
              <div className="mt-0.5 shrink-0 text-[var(--accent)]">
                {item.type === "tax" && <Calendar size={15} className="text-[var(--warning)]" />}
                {item.type === "cnss" && <Shield size={15} className="text-[var(--success)]" />}
                {item.type === "mandate" && <AlertCircle size={15} className="text-[var(--danger)]" />}
                {item.type === "contract" && <FileCheck size={15} className="text-[var(--accent)]" />}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-[var(--foreground)] truncate">{item.title}</p>
                <p className="text-[11px] text-[var(--muted)]">
                  Échéance : <span className="font-medium text-[var(--foreground)]">{item.dueDate}</span>
                </p>
              </div>
            </div>

            <Badge
              variant={
                item.daysLeft <= 15
                  ? "danger"
                  : item.daysLeft <= 30
                  ? "warning"
                  : "muted"
              }
              className="shrink-0"
            >
              Dans {item.daysLeft}j
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
