"use client";

import * as React from "react";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  Plus,
  CheckCircle2,
  Clock,
  Eye,
  PhoneCall,
  FileText,
  AlertCircle,
  Shield,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DEMO_TASKS, DemoTask } from "@/lib/data/demo-data";

export function CalendarClient() {
  const [tasks, setTasks] = React.useState<DemoTask[]>(DEMO_TASKS);
  const [selectedFilter, setSelectedFilter] = React.useState<string>("ALL");
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [newTask, setNewTask] = React.useState({
    title: "",
    type: "FOLLOW_UP" as DemoTask["type"],
    priority: "HIGH" as DemoTask["priority"],
    dueDate: "2026-11-03",
    dueTime: "10:00",
    relatedContact: "",
    description: "",
  });

  const toggleComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title) return;

    setTasks([
      {
        id: `task-${Date.now()}`,
        title: newTask.title,
        type: newTask.type,
        priority: newTask.priority,
        dueDate: newTask.dueDate,
        dueTime: newTask.dueTime,
        completed: false,
        relatedContact: newTask.relatedContact || undefined,
        description: newTask.description || undefined,
      },
      ...tasks,
    ]);

    setShowAddModal(false);
    setNewTask({
      title: "",
      type: "FOLLOW_UP",
      priority: "HIGH",
      dueDate: "2026-11-03",
      dueTime: "10:00",
      relatedContact: "",
      description: "",
    });
  };

  const filteredTasks = tasks.filter((t) => {
    if (selectedFilter === "PENDING") return !t.completed;
    if (selectedFilter === "COMPLETED") return t.completed;
    if (selectedFilter !== "ALL") return t.type === selectedFilter;
    return true;
  });

  const getTaskIcon = (type: DemoTask["type"]) => {
    switch (type) {
      case "COMMISSION":
        return <AlertCircle size={15} className="text-[var(--danger)]" />;
      case "PROPERTY_VISIT":
        return <Eye size={15} className="text-[var(--accent)]" />;
      case "FOLLOW_UP":
        return <PhoneCall size={15} className="text-[var(--success)]" />;
      case "TAX":
      case "CNSS":
        return <CalendarIcon size={15} className="text-[var(--warning)]" />;
      default:
        return <FileText size={15} className="text-[var(--muted)]" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
            Calendrier & Tâches Quotidiennes
          </h1>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            Planning des visites de biens, relances clients, signatures notariées et échéances légales
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setShowAddModal(true)} leftIcon={<Plus size={14} />}>
            Nouvelle tâche
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] text-xs overflow-x-auto">
        {[
          { label: "Toutes les tâches", val: "ALL" },
          { label: "À faire", val: "PENDING" },
          { label: "Visites de biens", val: "PROPERTY_VISIT" },
          { label: "Relances clients", val: "FOLLOW_UP" },
          { label: "Échéances légales", val: "TAX" },
          { label: "Terminées", val: "COMPLETED" },
        ].map((tab) => (
          <button
            key={tab.val}
            onClick={() => setSelectedFilter(tab.val)}
            className={`px-3 py-1.5 rounded-[var(--radius-sm)] font-medium transition-colors shrink-0 ${
              selectedFilter === tab.val
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tasks List Card */}
      <Card>
        <CardHeader className="pb-3 border-b border-[var(--border)]">
          <div className="flex items-center justify-between">
            <CardTitle>Liste des Actions & Rendez-vous</CardTitle>
            <span className="text-xs text-[var(--muted)]">
              {filteredTasks.length} action(s) affichée(s)
            </span>
          </div>
        </CardHeader>
        <CardContent className="divide-y divide-[var(--border)] p-0">
          {filteredTasks.length === 0 ? (
            <div className="p-8 text-center text-xs text-[var(--muted)]">
              Aucune tâche ne correspond à ce filtre.
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 flex items-start justify-between gap-4 transition-colors ${
                  task.completed ? "bg-[var(--background)] opacity-60" : "hover:bg-[var(--border-subtle)]"
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => toggleComplete(task.id)}
                    className="mt-0.5 text-[var(--muted)] hover:text-[var(--accent)] transition-colors shrink-0"
                  >
                    {task.completed ? (
                      <CheckCircle2 size={18} className="text-[var(--success)]" />
                    ) : (
                      <div className="h-4 w-4 rounded border border-[var(--border)] hover:border-[var(--accent)]" />
                    )}
                  </button>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-sm font-semibold text-[var(--foreground)] ${
                          task.completed && "line-through text-[var(--muted)]"
                        }`}
                      >
                        {task.title}
                      </span>
                      <Badge
                        variant={
                          task.priority === "URGENT"
                            ? "danger"
                            : task.priority === "HIGH"
                            ? "warning"
                            : "muted"
                        }
                      >
                        {task.priority}
                      </Badge>
                    </div>

                    {task.description && (
                      <p className="text-xs text-[var(--muted)] leading-relaxed">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-[11px] text-[var(--muted)] pt-1 flex-wrap">
                      <span className="flex items-center gap-1 font-medium text-[var(--foreground)]">
                        <CalendarIcon size={12} />
                        {task.dueDate} {task.dueTime && `à ${task.dueTime}`}
                      </span>
                      {task.relatedContact && (
                        <span className="text-[var(--accent)] font-medium">
                          👤 {task.relatedContact}
                        </span>
                      )}
                      {task.relatedProperty && (
                        <span>🏠 {task.relatedProperty}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="shrink-0">{getTaskIcon(task.type)}</div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <h3 className="text-base font-bold text-[var(--foreground)]">
                Planifier une Action ou un Rendez-vous
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <Input
                label="Objet de l'action *"
                required
                placeholder="Ex: Visite appartement Marshan avec M. Tazi"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              />

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--foreground)]">
                    Type d'action *
                  </label>
                  <select
                    value={newTask.type}
                    onChange={(e: any) => setNewTask({ ...newTask, type: e.target.value })}
                    className="w-full h-9 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 text-xs"
                  >
                    <option value="PROPERTY_VISIT">Visite de bien</option>
                    <option value="FOLLOW_UP">Relance client</option>
                    <option value="MEETING">Rendez-vous notaire / agence</option>
                    <option value="COMMISSION">Relance règlement honoraires</option>
                    <option value="TAX">Déclaration fiscale</option>
                    <option value="CNSS">Cotisation CNSS</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--foreground)]">
                    Priorité
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={(e: any) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full h-9 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 text-xs"
                  >
                    <option value="HIGH">Importante</option>
                    <option value="URGENT">Urgente</option>
                    <option value="MEDIUM">Normale</option>
                    <option value="LOW">Basse</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Date de réalisation *"
                  type="date"
                  required
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                />
                <Input
                  label="Heure"
                  type="time"
                  value={newTask.dueTime}
                  onChange={(e) => setNewTask({ ...newTask, dueTime: e.target.value })}
                />
              </div>

              <Input
                label="Contact concerné (optionnel)"
                placeholder="Ex: Amine Tazi"
                value={newTask.relatedContact}
                onChange={(e) => setNewTask({ ...newTask, relatedContact: e.target.value })}
              />

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--foreground)]">
                  Notes préparatoires
                </label>
                <textarea
                  rows={2}
                  placeholder="Points à aborder, documents à apporter, clés à récupérer…"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] p-2 text-xs text-[var(--foreground)]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border)]">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                  Annuler
                </Button>
                <Button type="submit">Enregistrer l'action</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
