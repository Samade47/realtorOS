"use client";

import * as React from "react";
import Link from "next/link";
import {
  PhoneCall,
  Eye,
  FileText,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DEMO_TASKS } from "@/lib/data/demo-data";
import { cn } from "@/lib/utils";

export function TodaysPriorities() {
  const [tasks, setTasks] = React.useState(DEMO_TASKS);

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "COMMISSION":
        return <AlertCircle size={15} className="text-[var(--danger)]" />;
      case "PROPERTY_VISIT":
        return <Eye size={15} className="text-[var(--accent)]" />;
      case "FOLLOW_UP":
        return <PhoneCall size={15} className="text-[var(--success)]" />;
      case "TAX":
      case "CNSS":
        return <Calendar size={15} className="text-[var(--warning)]" />;
      default:
        return <FileText size={15} className="text-[var(--muted)]" />;
    }
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case "URGENT":
        return <Badge variant="danger">Urgent</Badge>;
      case "HIGH":
        return <Badge variant="warning">Important</Badge>;
      default:
        return <Badge variant="muted">Normal</Badge>;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle>Priorités d'aujourd'hui</CardTitle>
          <CardDescription>
            {tasks.filter((t) => !t.completed).length} actions immédiates requises
          </CardDescription>
        </div>
        <Link href="/dashboard/calendar">
          <Button variant="ghost" size="sm" rightIcon={<ArrowRight size={14} />}>
            Tout voir
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {tasks.slice(0, 5).map((task) => (
          <div
            key={task.id}
            className={cn(
              "flex items-start gap-3 rounded-[var(--radius-sm)] border p-3 transition-all",
              task.completed
                ? "bg-[var(--border-subtle)] border-transparent opacity-60"
                : "bg-[var(--surface)] border-[var(--border)] hover:border-[var(--accent)]"
            )}
          >
            <button
              type="button"
              onClick={() => toggleTask(task.id)}
              className="mt-0.5 text-[var(--muted)] hover:text-[var(--accent)] transition-colors shrink-0"
            >
              {task.completed ? (
                <CheckCircle2 size={18} className="text-[var(--success)]" />
              ) : (
                <div className="h-4 w-4 rounded border border-[var(--border)] hover:border-[var(--accent)]" />
              )}
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={cn(
                    "text-xs font-semibold text-[var(--foreground)]",
                    task.completed && "line-through text-[var(--muted)]"
                  )}
                >
                  {task.title}
                </span>
                {getPriorityBadge(task.priority)}
              </div>

              {task.description && (
                <p className="mt-1 text-xs text-[var(--muted)] line-clamp-2">
                  {task.description}
                </p>
              )}

              <div className="mt-2 flex items-center gap-3 text-[11px] text-[var(--muted)]">
                {task.dueTime && (
                  <span className="flex items-center gap-1 font-medium text-[var(--foreground)]">
                    <Clock size={12} />
                    {task.dueTime}
                  </span>
                )}
                {task.relatedContact && (
                  <span className="text-[var(--accent)] font-medium">
                    👤 {task.relatedContact}
                  </span>
                )}
                {task.relatedProperty && (
                  <span className="truncate">
                    🏠 {task.relatedProperty}
                  </span>
                )}
              </div>
            </div>

            <div className="shrink-0">{getIcon(task.type)}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
