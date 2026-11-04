"use client";

import * as React from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertTriangle,
  CheckCircle2,
  FileText,
  CreditCard,
  Plus,
  Filter,
  Search,
  ExternalLink,
  Send,
  Eye,
  CalendarDays,
  List,
  ShieldCheck,
  ShieldAlert,
  ArrowUpRight,
  Info,
  Edit2,
  Bell,
  Check,
  X,
  FileCheck,
} from "lucide-react";

import {
  DynamicCalendarEvent,
  CalendarFilterOptions,
  CalendarViewMode,
  CalendarCategory,
  CustomReminderInput,
} from "@/lib/compliance/compliance-calendar-types";
import {
  buildMonthlyCalendarGrid,
  buildWeeklyCalendarDays,
  filterCalendarEvents,
  getMoroccanTodayDate,
  calculateDaysRemaining,
  formatDaysRemainingLabel,
} from "@/lib/compliance/compliance-calendar-engine";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface DynamicComplianceCalendarProps {
  events: DynamicCalendarEvent[];
  fiscalYear: number;
  onEventClick?: (event: DynamicCalendarEvent) => void;
  onDeclareClick?: (period: string) => void;
  onPayClick?: (period: string, type: "tax" | "cnss") => void;
  onAddCustomReminder?: (reminder: CustomReminderInput) => void;
  onUpdateEventDeadline?: (eventId: string, newDate: string, reason: string) => void;
  onSnoozeEvent?: (eventId: string, days: number) => void;
  onMarkCompleted?: (eventId: string) => void;
  onTriggerEmailPreview?: (event: DynamicCalendarEvent) => void;
}

const MONTH_NAMES_FR = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

const WEEKDAY_NAMES_FR = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const WEEKDAY_SHORT_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export function DynamicComplianceCalendar({
  events,
  fiscalYear,
  onEventClick,
  onDeclareClick,
  onPayClick,
  onAddCustomReminder,
  onUpdateEventDeadline,
  onSnoozeEvent,
  onMarkCompleted,
  onTriggerEmailPreview,
}: DynamicComplianceCalendarProps) {
  // Safe reference today (avoids Next.js prerender error)
  const [todayStr] = React.useState<string>(() => getMoroccanTodayDate());

  // View state: Month / Week / Agenda
  const [viewMode, setViewMode] = React.useState<CalendarViewMode>("month");

  // Selected Date state for navigation
  const [currentYear, setCurrentYear] = React.useState<number>(fiscalYear);
  // Default to November (index 10) for current simulation date
  const [currentMonthIndex, setCurrentMonthIndex] = React.useState<number>(10);
  const [selectedWeekReferenceDate, setSelectedWeekReferenceDate] = React.useState<string>("2026-11-03");

  // Filters state
  const [filters, setFilters] = React.useState<CalendarFilterOptions>({
    category: "all",
    eventType: "all",
    statusFilter: "all",
    fiscalYear,
    searchQuery: "",
  });

  // Modals & Panels State
  const [selectedEvent, setSelectedEvent] = React.useState<DynamicCalendarEvent | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = React.useState<boolean>(false);
  const [isAddReminderOpen, setIsAddReminderOpen] = React.useState<boolean>(false);
  const [isEditDeadlineOpen, setIsEditDeadlineOpen] = React.useState<boolean>(false);
  const [isEmailPreviewOpen, setIsEmailPreviewOpen] = React.useState<boolean>(false);

  // Edit deadline form state
  const [editDateValue, setEditDateValue] = React.useState<string>("");
  const [editReasonValue, setEditReasonValue] = React.useState<string>("");

  // New Custom Reminder form state
  const [newReminderTitle, setNewReminderTitle] = React.useState<string>("");
  const [newReminderCategory, setNewReminderCategory] = React.useState<CalendarCategory>("fiscalite");
  const [newReminderDate, setNewReminderDate] = React.useState<string>(todayStr);
  const [newReminderAmount, setNewReminderAmount] = React.useState<string>("");
  const [newReminderPriority, setNewReminderPriority] = React.useState<"urgent" | "high" | "normal" | "low">("normal");
  const [newReminderDesc, setNewReminderDesc] = React.useState<string>("");

  // Filtered Events
  const filteredEvents = React.useMemo(() => {
    return filterCalendarEvents(events, filters);
  }, [events, filters]);

  // Calendar Grids
  const monthlyWeeks = React.useMemo(() => {
    return buildMonthlyCalendarGrid(currentYear, currentMonthIndex, filteredEvents, todayStr);
  }, [currentYear, currentMonthIndex, filteredEvents, todayStr]);

  const weeklyDays = React.useMemo(() => {
    return buildWeeklyCalendarDays(selectedWeekReferenceDate, filteredEvents, todayStr);
  }, [selectedWeekReferenceDate, filteredEvents, todayStr]);

  // Summary Metrics
  const summaryMetrics = React.useMemo(() => {
    const toDeclareCount = events.filter((e) => e.status === "a_declarer" || e.eventType === "tax_declaration" && e.status !== "declare" && e.status !== "paye").length;
    const toPayEvents = events.filter((e) => e.status === "a_payer" || e.status === "en_retard" || e.status === "approche");
    const toPayAmount = toPayEvents.reduce((acc, curr) => acc + (curr.amountDue || 0), 0);
    const overdueEvents = events.filter((e) => e.status === "en_retard");
    
    // Find next upcoming obligation
    const pendingSorted = events
      .filter((e) => e.status !== "paye" && e.status !== "declare" && e.status !== "termine")
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

    const nextUpcoming = pendingSorted[0] || null;

    return {
      toDeclareCount,
      toPayCount: toPayEvents.length,
      toPayAmount,
      overdueCount: overdueEvents.length,
      overdueEvents,
      nextUpcoming,
    };
  }, [events]);

  // Navigation handlers
  const handlePrevMonth = () => {
    if (currentMonthIndex === 0) {
      setCurrentMonthIndex(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonthIndex((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIndex === 11) {
      setCurrentMonthIndex(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonthIndex((m) => m + 1);
    }
  };

  const handleResetToday = () => {
    const [y, m] = todayStr.split("-").map(Number);
    setCurrentYear(y);
    setCurrentMonthIndex(m - 1);
    setSelectedWeekReferenceDate(todayStr);
  };

  const handlePrevWeek = () => {
    const [y, m, d] = selectedWeekReferenceDate.split("-").map(Number);
    const cur = new Date(Date.UTC(y, m - 1, d));
    const prev = new Date(cur.getTime() - 7 * 86400000);
    const prevStr = prev.toISOString().split("T")[0];
    setSelectedWeekReferenceDate(prevStr);
    setCurrentYear(prev.getUTCFullYear());
    setCurrentMonthIndex(prev.getUTCMonth());
  };

  const handleNextWeek = () => {
    const [y, m, d] = selectedWeekReferenceDate.split("-").map(Number);
    const cur = new Date(Date.UTC(y, m - 1, d));
    const next = new Date(cur.getTime() + 7 * 86400000);
    const nextStr = next.toISOString().split("T")[0];
    setSelectedWeekReferenceDate(nextStr);
    setCurrentYear(next.getUTCFullYear());
    setCurrentMonthIndex(next.getUTCMonth());
  };

  // Open Event Details
  const handleOpenEvent = (event: DynamicCalendarEvent) => {
    setSelectedEvent(event);
    setIsDetailsModalOpen(true);
    onEventClick?.(event);
  };

  // Submit new custom reminder
  const handleSubmitNewReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReminderTitle.trim()) return;

    const customItem: CustomReminderInput = {
      title: newReminderTitle.trim(),
      category: newReminderCategory,
      eventType: "custom_reminder",
      dueDate: newReminderDate,
      amountDue: newReminderAmount ? parseFloat(newReminderAmount) : undefined,
      priority: newReminderPriority,
      description: newReminderDesc.trim(),
    };

    onAddCustomReminder?.(customItem);
    setIsAddReminderOpen(false);

    // Reset fields
    setNewReminderTitle("");
    setNewReminderDesc("");
    setNewReminderAmount("");
  };

  // Submit edit deadline
  const handleSubmitEditDeadline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent || !editDateValue || !editReasonValue.trim()) return;

    onUpdateEventDeadline?.(selectedEvent.id, editDateValue, editReasonValue.trim());
    setIsEditDeadlineOpen(false);
    setIsDetailsModalOpen(false);
  };

  // Format Dirhams
  const formatMAD = (amount?: number) => {
    if (amount === undefined || amount === null) return "—";
    return `${amount.toLocaleString("fr-MA")} MAD`;
  };

  // Helper styles for categories and statuses
  const getCategoryBadgeClass = (category: CalendarCategory) => {
    switch (category) {
      case "fiscalite":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800";
      case "cnss":
        return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800";
      case "custom":
        return "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700";
    }
  };

  const getStatusBadge = (status: string, daysRemaining: number) => {
    switch (status) {
      case "paye":
      case "termine":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
            <Check size={10} /> Payé
          </span>
        );
      case "declare":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-300 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
            <FileCheck size={10} /> Déclaré
          </span>
        );
      case "en_retard":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-700 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-800">
            <AlertTriangle size={10} /> En retard
          </span>
        );
      case "approche":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800">
            <Clock size={10} /> Approche (J-{daysRemaining})
          </span>
        );
      case "a_verifier":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800">
            <ShieldAlert size={10} /> Date à vérifier
          </span>
        );
      case "a_declarer":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-700 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
            À déclarer
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-slate-300 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800">
            À venir
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. TOP SUMMARY CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: À déclarer */}
        <Card className="border-[var(--border)] shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-[var(--muted)] font-medium">À déclarer (DGI)</p>
              <h4 className="text-xl font-bold text-[var(--foreground)] mt-0.5">
                {summaryMetrics.toDeclareCount} {summaryMetrics.toDeclareCount > 1 ? "obligations" : "obligation"}
              </h4>
              <p className="text-[11px] text-[var(--muted)] mt-1">Déclaration trimestrielle de CA</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
              <FileText size={20} />
            </div>
          </CardContent>
        </Card>

        {/* Card 2: À payer */}
        <Card className="border-[var(--border)] shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-[var(--muted)] font-medium">À payer (Impôt & AMO)</p>
              <h4 className="text-xl font-bold text-[var(--foreground)] mt-0.5">
                {formatMAD(summaryMetrics.toPayAmount)}
              </h4>
              <p className="text-[11px] text-[var(--muted)] mt-1">
                {summaryMetrics.toPayCount} paiement{summaryMetrics.toPayCount > 1 ? "s" : ""} en attente
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
              <CreditCard size={20} />
            </div>
          </CardContent>
        </Card>

        {/* Card 3: En retard */}
        <Card className="border-[var(--border)] shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-[var(--muted)] font-medium">En retard</p>
              <h4
                className={`text-xl font-bold mt-0.5 ${
                  summaryMetrics.overdueCount > 0 ? "text-rose-600 dark:text-rose-400" : "text-[var(--foreground)]"
                }`}
              >
                {summaryMetrics.overdueCount} échéance{summaryMetrics.overdueCount > 1 ? "s" : ""}
              </h4>
              <p className="text-[11px] text-[var(--muted)] mt-1">
                {summaryMetrics.overdueCount > 0 ? "Pénalités applicables" : "Aucun retard enregistré"}
              </p>
            </div>
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] ${
                summaryMetrics.overdueCount > 0
                  ? "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                  : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
              }`}
            >
              {summaryMetrics.overdueCount > 0 ? <AlertTriangle size={20} /> : <CheckCircle2 size={20} />}
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Prochaine échéance */}
        <Card className="border-[var(--border)] shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <p className="text-xs text-[var(--muted)] font-medium">Prochaine échéance</p>
              <h4 className="text-sm font-bold text-[var(--foreground)] truncate mt-0.5" title={summaryMetrics.nextUpcoming?.title}>
                {summaryMetrics.nextUpcoming ? summaryMetrics.nextUpcoming.dueDate : "Aucune"}
              </h4>
              <p className="text-[11px] font-medium text-amber-600 dark:text-amber-400 mt-1 truncate">
                {summaryMetrics.nextUpcoming ? summaryMetrics.nextUpcoming.daysRemainingLabel : "À jour"}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 shrink-0">
              <Clock size={20} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ========================================================================= */}
      {/* 2. CALENDAR HEADER & CONTROLS */}
      {/* ========================================================================= */}
      <Card className="border-[var(--border)] shadow-xs">
        <CardHeader className="p-4 border-b border-[var(--border)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="text-[var(--accent)]" size={18} />
                <CardTitle className="text-base font-bold text-[var(--foreground)]">Calendrier Fiscal & Social</CardTitle>
                <Badge variant="outline" className="text-[11px]">
                  Règles DGI & CNSS {currentYear}
                </Badge>
              </div>
              <CardDescription className="text-xs text-[var(--muted)] mt-0.5">
                Suivez vos déclarations fiscales, paiements d'impôts et cotisations CNSS/AMO.
              </CardDescription>
            </div>

            {/* View Switcher & Action Button */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-[var(--background)] border border-[var(--border)] rounded-[var(--radius-md)] p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setViewMode("month")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] transition-colors ${
                    viewMode === "month"
                      ? "bg-[var(--surface)] text-[var(--foreground)] font-semibold shadow-2xs"
                      : "text-[var(--muted)] hover:text-[var(--foreground)]"
                  }`}
                >
                  <CalendarDays size={13} />
                  <span>Mois</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("week")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] transition-colors ${
                    viewMode === "week"
                      ? "bg-[var(--surface)] text-[var(--foreground)] font-semibold shadow-2xs"
                      : "text-[var(--muted)] hover:text-[var(--foreground)]"
                  }`}
                >
                  <CalendarIcon size={13} />
                  <span>Semaine</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("agenda")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] transition-colors ${
                    viewMode === "agenda"
                      ? "bg-[var(--surface)] text-[var(--foreground)] font-semibold shadow-2xs"
                      : "text-[var(--muted)] hover:text-[var(--foreground)]"
                  }`}
                >
                  <List size={13} />
                  <span>Planning</span>
                </button>
              </div>

              <Button
                size="sm"
                variant="default"
                onClick={() => setIsAddReminderOpen(true)}
                leftIcon={<Plus size={14} />}
                className="text-xs"
              >
                Nouveau rappel
              </Button>
            </div>
          </div>

          {/* Month / Period Navigation Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 mt-3 border-t border-[var(--border)]">
            <div className="flex items-center gap-2">
              {viewMode === "week" ? (
                <>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" onClick={handlePrevWeek} className="h-8 w-8 p-0">
                      <ChevronLeft size={16} />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={handleNextWeek} className="h-8 w-8 p-0">
                      <ChevronRight size={16} />
                    </Button>
                  </div>
                  <span className="text-sm font-bold text-[var(--foreground)]">
                    Semaine du {selectedWeekReferenceDate}
                  </span>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" onClick={handlePrevMonth} className="h-8 w-8 p-0">
                      <ChevronLeft size={16} />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={handleNextMonth} className="h-8 w-8 p-0">
                      <ChevronRight size={16} />
                    </Button>
                  </div>
                  <span className="text-base font-bold text-[var(--foreground)]">
                    {MONTH_NAMES_FR[currentMonthIndex]} {currentYear}
                  </span>
                </>
              )}

              <Button size="sm" variant="outline" onClick={handleResetToday} className="text-xs h-7 ml-2">
                Aujourd'hui
              </Button>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 text-xs">
              <span className="text-[var(--muted)] font-medium flex items-center gap-1">
                <Filter size={12} /> Filtres:
              </span>
              {[
                { id: "all", label: "Toutes" },
                { id: "fiscalite", label: "🏛️ Fiscalité (DGI)" },
                { id: "cnss", label: "🛡️ CNSS & AMO" },
                { id: "custom", label: "📌 Personnalisés" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFilters((prev) => ({ ...prev, category: cat.id as any }))}
                  className={`px-2.5 py-1 rounded-[var(--radius-sm)] border text-[11px] whitespace-nowrap transition-colors ${
                    filters.category === cat.id
                      ? "bg-[var(--accent)] text-white border-[var(--accent)] font-semibold"
                      : "bg-[var(--surface)] text-[var(--muted)] border-[var(--border)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {cat.label}
                </button>
              ))}

              <div className="h-4 w-px bg-[var(--border)] mx-1" />

              <select
                value={filters.statusFilter}
                onChange={(e) => setFilters((prev) => ({ ...prev, statusFilter: e.target.value as any }))}
                className="bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] text-[11px] rounded-[var(--radius-sm)] px-2 py-1 outline-hidden"
              >
                <option value="all">Tous les statuts</option>
                <option value="to_declare">À déclarer</option>
                <option value="to_pay">À payer</option>
                <option value="due_soon">Approche (J-7)</option>
                <option value="overdue">En retard</option>
                <option value="completed">Payé & Terminé</option>
              </select>
            </div>
          </div>
        </CardHeader>

        {/* ========================================================================= */}
        {/* 3. CALENDAR VIEWS (MONTH / WEEK / AGENDA) */}
        {/* ========================================================================= */}
        <CardContent className="p-0">
          {/* VIEW A: MONTHLY VIEW */}
          {viewMode === "month" && (
            <div>
              {/* Day header (Mon-Sun) */}
              <div className="grid grid-cols-7 border-b border-[var(--border)] bg-[var(--background)] text-center text-xs font-semibold text-[var(--muted)]">
                {WEEKDAY_NAMES_FR.map((name, i) => (
                  <div key={name} className="py-2.5 border-r last:border-r-0 border-[var(--border)]">
                    <span className="hidden sm:inline">{name}</span>
                    <span className="sm:hidden">{WEEKDAY_SHORT_FR[i]}</span>
                  </div>
                ))}
              </div>

              {/* Month Grid */}
              <div className="divide-y divide-[var(--border)]">
                {monthlyWeeks.map((week, weekIdx) => (
                  <div key={weekIdx} className="grid grid-cols-7 divide-x divide-[var(--border)] min-h-[105px]">
                    {week.map((cell) => {
                      const isSelectedMonth = cell.isCurrentMonth;
                      return (
                        <div
                          key={cell.dateString}
                          className={`p-1.5 flex flex-col justify-between transition-colors ${
                            !isSelectedMonth ? "bg-[var(--background)]/40 text-[var(--muted)]/50" : "bg-[var(--surface)]"
                          } ${cell.isToday ? "ring-2 ring-[var(--accent)] ring-inset" : ""}`}
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-xs font-medium inline-flex items-center justify-center h-5 w-5 rounded-full ${
                                cell.isToday
                                  ? "bg-[var(--accent)] text-white font-bold"
                                  : isSelectedMonth
                                  ? "text-[var(--foreground)]"
                                  : "text-[var(--muted)]"
                              }`}
                            >
                              {cell.dayNumber}
                            </span>
                            {cell.events.length > 0 && (
                              <span className="text-[10px] text-[var(--muted)] font-bold">
                                {cell.events.length}
                              </span>
                            )}
                          </div>

                          {/* Event chips */}
                          <div className="space-y-1 mt-1 flex-1 overflow-y-auto max-h-[80px]">
                            {cell.events.map((evt) => {
                              const isCompleted = evt.status === "paye" || evt.status === "declare" || evt.status === "termine";
                              const isOverdue = evt.status === "en_retard";
                              return (
                                <button
                                  key={evt.id}
                                  type="button"
                                  onClick={() => handleOpenEvent(evt)}
                                  className={`w-full text-left p-1 rounded-[var(--radius-xs)] text-[10px] leading-tight border transition-transform hover:scale-[1.02] flex flex-col gap-0.5 ${getCategoryBadgeClass(
                                    evt.category
                                  )} ${isOverdue ? "border-rose-400 dark:border-rose-700 bg-rose-50/80" : ""}`}
                                >
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="font-semibold truncate">
                                      {evt.category === "fiscalite" ? "🏛️ " : evt.category === "cnss" ? "🛡️ " : "📌 "}
                                      {evt.periodLabel || evt.title}
                                    </span>
                                    {isCompleted && <Check size={10} className="text-emerald-600 shrink-0" />}
                                  </div>
                                  {evt.amountDue && (
                                    <span className="font-bold text-[9px] text-[var(--foreground)]">
                                      {formatMAD(evt.amountDue)}
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW B: WEEKLY VIEW */}
          {viewMode === "week" && (
            <div className="divide-y divide-[var(--border)]">
              <div className="grid grid-cols-1 md:grid-cols-7 divide-y md:divide-y-0 md:divide-x divide-[var(--border)] min-h-[420px]">
                {weeklyDays.map((day, idx) => {
                  return (
                    <div key={day.dateString} className="p-3 bg-[var(--surface)] flex flex-col">
                      <div className="pb-2 border-b border-[var(--border)] mb-3 flex md:flex-col items-center justify-between md:items-start">
                        <span className="text-xs text-[var(--muted)] font-semibold">{WEEKDAY_NAMES_FR[idx]}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className={`text-sm font-bold inline-flex items-center justify-center h-6 w-6 rounded-full ${
                              day.isToday ? "bg-[var(--accent)] text-white" : "text-[var(--foreground)]"
                            }`}
                          >
                            {day.dayNumber}
                          </span>
                          <span className="text-xs text-[var(--muted)] md:hidden">{day.dateString}</span>
                        </div>
                      </div>

                      {/* Day events */}
                      <div className="space-y-2 flex-1">
                        {day.events.length === 0 ? (
                          <div className="h-full flex items-center justify-center text-center p-3 text-[11px] text-[var(--muted)]">
                            Aucune obligation
                          </div>
                        ) : (
                          day.events.map((evt) => (
                            <div
                              key={evt.id}
                              onClick={() => handleOpenEvent(evt)}
                              className={`p-2.5 rounded-[var(--radius-sm)] border text-xs cursor-pointer hover:shadow-xs transition-shadow ${getCategoryBadgeClass(
                                evt.category
                              )}`}
                            >
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <span className="font-bold text-[11px] text-[var(--foreground)] truncate">
                                  {evt.title}
                                </span>
                                {getStatusBadge(evt.status, evt.daysRemaining)}
                              </div>
                              <p className="text-[11px] text-[var(--muted)] line-clamp-2 mb-2">{evt.description}</p>
                              <div className="flex items-center justify-between text-[11px] font-semibold pt-1 border-t border-[var(--border)]/50">
                                <span>{evt.amountDue ? formatMAD(evt.amountDue) : "Administratif"}</span>
                                <span className="text-[var(--accent)] hover:underline flex items-center gap-0.5">
                                  Gérer <ArrowUpRight size={11} />
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW C: AGENDA VIEW */}
          {viewMode === "agenda" && (
            <div className="divide-y divide-[var(--border)]">
              {filteredEvents.length === 0 ? (
                <div className="p-8 text-center text-sm text-[var(--muted)]">
                  Aucune obligation ne correspond aux filtres sélectionnés.
                </div>
              ) : (
                filteredEvents.map((evt) => {
                  const isCompleted = evt.status === "paye" || evt.status === "declare" || evt.status === "termine";
                  return (
                    <div
                      key={evt.id}
                      className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs hover:bg-[var(--background)]/50 transition-colors"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] shrink-0 ${
                            evt.category === "fiscalite"
                              ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                              : evt.category === "cnss"
                              ? "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300"
                              : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                          }`}
                        >
                          {evt.category === "fiscalite" ? (
                            <FileText size={18} />
                          ) : evt.category === "cnss" ? (
                            <ShieldCheck size={18} />
                          ) : (
                            <CalendarIcon size={18} />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-sm text-[var(--foreground)]">{evt.title}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getCategoryBadgeClass(evt.category)}`}>
                              {evt.category === "fiscalite" ? "DGI" : evt.category === "cnss" ? "CNSS AMO" : "Rappel"}
                            </span>
                            {getStatusBadge(evt.status, evt.daysRemaining)}
                          </div>
                          <p className="text-[var(--muted)] mt-1">{evt.description}</p>
                          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[11px] text-[var(--muted)]">
                            <span className="flex items-center gap-1 font-semibold text-[var(--foreground)]">
                              <CalendarIcon size={12} /> Échéance: {evt.dueDate}
                            </span>
                            <span>•</span>
                            <span className={evt.daysRemaining < 0 && !isCompleted ? "text-rose-600 font-bold" : ""}>
                              {evt.daysRemainingLabel}
                            </span>
                            {evt.legalArticle && (
                              <>
                                <span>•</span>
                                <span className="text-[var(--accent)]">{evt.legalArticle}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 md:self-center">
                        {evt.amountDue && (
                          <div className="text-right mr-2">
                            <span className="text-sm font-bold text-[var(--foreground)] block">
                              {formatMAD(evt.amountDue)}
                            </span>
                            <span className="text-[10px] text-[var(--muted)]">Montant exigible</span>
                          </div>
                        )}

                        <Button size="sm" variant="outline" onClick={() => handleOpenEvent(evt)} className="text-xs">
                          <Eye size={12} className="mr-1" /> Détails
                        </Button>

                        {evt.eventType === "tax_declaration" && evt.status !== "declare" && evt.status !== "paye" && (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => onDeclareClick?.(evt.period || "2026-T3")}
                            className="text-xs"
                          >
                            Déclarer
                          </Button>
                        )}

                        {(evt.eventType === "tax_payment" || evt.eventType === "cnss_contribution") &&
                          evt.status !== "paye" && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => onPayClick?.(evt.period || "2026-T3", evt.category === "fiscalite" ? "tax" : "cnss")}
                              className="text-xs"
                            >
                              Payer
                            </Button>
                          )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* 4. OVERDUE OBLIGATIONS ALERT SECTION (IF ANY) */}
      {/* ========================================================================= */}
      {summaryMetrics.overdueCount > 0 && (
        <Card className="border-rose-300 bg-rose-50/40 dark:bg-rose-950/20 dark:border-rose-900 shadow-xs">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300">
              <AlertTriangle size={18} />
              <CardTitle className="text-sm font-bold">Échéances en retard — Action requise immédiate</CardTitle>
            </div>
            <CardDescription className="text-xs text-rose-800 dark:text-rose-400">
              Des majorations de retard (CGI Art. 184 / Décret CNSS) peuvent s'appliquer si ces obligations ne sont pas
              régularisées.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-1 divide-y divide-rose-200 dark:divide-rose-900">
            {summaryMetrics.overdueEvents.map((ov) => (
              <div key={ov.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-[var(--foreground)]">{ov.title}</span>
                  <p className="text-[11px] text-rose-700 dark:text-rose-400">
                    Date limite dépassée ({ov.dueDate}) — {ov.daysRemainingLabel}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {ov.amountDue && <span className="font-bold">{formatMAD(ov.amountDue)}</span>}
                  <Button size="sm" variant="destructive" onClick={() => handleOpenEvent(ov)} className="text-xs">
                    Régulariser
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* 5. PROCHAINES ÉCHÉANCES (CHRONOLOGICAL NEXT 5-10 OBLIGATIONS) */}
      {/* ========================================================================= */}
      <Card className="border-[var(--border)] shadow-xs">
        <CardHeader className="p-4 pb-2 border-b border-[var(--border)]">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-[var(--foreground)]">Prochaines échéances</CardTitle>
              <CardDescription className="text-xs text-[var(--muted)]">
                Chronologie des 6 prochaines obligations fiscales et sociales prévues
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs">
              Automatique & Vérifié
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-[var(--border)] text-xs">
          {events.slice(0, 6).map((evt) => {
            const isCompleted = evt.status === "paye" || evt.status === "declare" || evt.status === "termine";
            return (
              <div key={evt.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-[var(--background)]/40 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] shrink-0 ${
                      evt.category === "fiscalite" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"
                    }`}
                  >
                    {evt.category === "fiscalite" ? <FileText size={16} /> : <ShieldCheck size={16} />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-[var(--foreground)] truncate">{evt.title}</span>
                      {getStatusBadge(evt.status, evt.daysRemaining)}
                    </div>
                    <p className="text-[11px] text-[var(--muted)]">
                      Échéance: {evt.dueDate} • {evt.daysRemainingLabel}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {evt.amountDue && <span className="font-bold text-xs">{formatMAD(evt.amountDue)}</span>}
                  <Button size="sm" variant="outline" onClick={() => handleOpenEvent(evt)} className="text-xs h-7 px-2">
                    Gérer
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* 6. MODAL: EVENT DETAILS & AUDIT TRAIL */}
      {/* ========================================================================= */}
      {isDetailsModalOpen && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-xs">
            {/* Header */}
            <div className="p-4 border-b border-[var(--border)] flex items-start justify-between bg-[var(--background)]/50">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getCategoryBadgeClass(selectedEvent.category)}`}>
                    {selectedEvent.category === "fiscalite" ? "🏛️ Fiscalité DGI" : selectedEvent.category === "cnss" ? "🛡️ CNSS & AMO" : "📌 Personnalisé"}
                  </span>
                  {getStatusBadge(selectedEvent.status, selectedEvent.daysRemaining)}
                </div>
                <h3 className="text-base font-bold text-[var(--foreground)]">{selectedEvent.title}</h3>
                <p className="text-[11px] text-[var(--muted)] mt-0.5">
                  Exercice {selectedEvent.fiscalYear} • Période: {selectedEvent.periodLabel || selectedEvent.dueDate}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsDetailsModalOpen(false)}
                className="text-[var(--muted)] hover:text-[var(--foreground)] p-1 rounded-sm"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 space-y-4 overflow-y-auto">
              {/* Financial & Deadline Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[var(--background)] p-3 rounded-[var(--radius-md)] border border-[var(--border)]">
                <div>
                  <span className="text-[10px] text-[var(--muted)] block">Date limite</span>
                  <span className="font-bold text-xs text-[var(--foreground)]">{selectedEvent.dueDate}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--muted)] block">Compte à rebours</span>
                  <span className={`font-bold text-xs ${selectedEvent.daysRemaining < 0 ? "text-rose-600" : "text-amber-600"}`}>
                    {selectedEvent.daysRemainingLabel}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--muted)] block">Montant exigible</span>
                  <span className="font-bold text-xs text-[var(--foreground)]">
                    {selectedEvent.amountDue ? formatMAD(selectedEvent.amountDue) : "Non applicable"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--muted)] block">Montant réglé</span>
                  <span className="font-bold text-xs text-emerald-600">
                    {formatMAD(selectedEvent.amountPaid || 0)}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-semibold text-xs text-[var(--foreground)] mb-1">Description de l'obligation</h4>
                <p className="text-[var(--muted)] leading-relaxed">{selectedEvent.description}</p>
              </div>

              {/* Legal Reference & Verification Status */}
              <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-[var(--radius-md)] border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                    <ShieldCheck size={14} className="text-[var(--accent)]" />
                    Fondement Légal & Réglementation Marocaine
                  </span>
                  <Badge variant={selectedEvent.verificationStatus === "verified" ? "success" : "warning"} className="text-[10px]">
                    {selectedEvent.verificationStatus === "verified" ? "Vérifié (Textes officiels)" : "Date à vérifier"}
                  </Badge>
                </div>
                <p className="text-[11px] text-[var(--muted)]">
                  <span className="font-semibold text-[var(--foreground)]">Texte applicable :</span> {selectedEvent.legalReference || "Législation marocaine"} ({selectedEvent.legalArticle || "Art. CGI / CNSS"})
                </p>
                {selectedEvent.officialSourceUrl && (
                  <a
                    href={selectedEvent.officialSourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-[var(--accent)] hover:underline font-semibold"
                  >
                    Consulter la source officielle ({selectedEvent.officialSourceUrl}) <ExternalLink size={11} />
                  </a>
                )}
                {selectedEvent.isDeadlineOverridden && (
                  <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded text-[11px] text-amber-800 dark:text-amber-300">
                    <strong>Échéance modifiée manuellement :</strong> {selectedEvent.overrideReason} (Date d'origine : {selectedEvent.originalDueDate})
                  </div>
                )}
              </div>

              {/* Connected Records & Documents */}
              {selectedEvent.receiptDocName && (
                <div className="flex items-center justify-between p-2.5 bg-[var(--background)] rounded-[var(--radius-md)] border border-[var(--border)]">
                  <div className="flex items-center gap-2">
                    <FileCheck size={16} className="text-emerald-600" />
                    <div>
                      <span className="font-semibold block">{selectedEvent.receiptDocName}</span>
                      <span className="text-[10px] text-[var(--muted)]">Quittance officielle attachée</span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="text-xs h-7">
                    Visualiser
                  </Button>
                </div>
              )}

              {/* Scheduled Email Reminders Timeline */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-xs text-[var(--foreground)] flex items-center gap-1.5">
                    <Bell size={13} className="text-[var(--accent)]" />
                    Calendrier des Rappels Automatiques (Resend Email)
                  </h4>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setIsEmailPreviewOpen(true);
                      onTriggerEmailPreview?.(selectedEvent);
                    }}
                    className="text-xs h-6 text-[var(--accent)]"
                  >
                    Aperçu email
                  </Button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {selectedEvent.reminderSchedule.map((rem) => (
                    <div
                      key={rem.id}
                      className={`p-2 rounded border text-[11px] ${
                        rem.status === "sent"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                          : rem.status === "cancelled"
                          ? "bg-zinc-100 text-zinc-400 border-zinc-200 line-through dark:bg-zinc-900 dark:border-zinc-800"
                          : "bg-[var(--surface)] text-[var(--foreground)] border-[var(--border)]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold">{rem.label}</span>
                        {rem.status === "sent" ? (
                          <Check size={11} className="text-emerald-600" />
                        ) : (
                          <Clock size={11} className="text-[var(--muted)]" />
                        )}
                      </div>
                      <span className="text-[10px] text-[var(--muted)] block mt-0.5">{rem.scheduledDate}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-[var(--border)] bg-[var(--background)]/50 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditDateValue(selectedEvent.dueDate);
                    setEditReasonValue(selectedEvent.overrideReason || "");
                    setIsEditDeadlineOpen(true);
                  }}
                  leftIcon={<Edit2 size={12} />}
                  className="text-xs"
                >
                  Modifier date
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onSnoozeEvent?.(selectedEvent.id, 7)}
                  className="text-xs"
                >
                  Reporter (7 jours)
                </Button>
              </div>

              <div className="flex items-center gap-2">
                {selectedEvent.status !== "paye" && selectedEvent.status !== "termine" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onMarkCompleted?.(selectedEvent.id)}
                    leftIcon={<Check size={12} />}
                    className="text-xs"
                  >
                    Marquer terminé
                  </Button>
                )}

                {selectedEvent.eventType === "tax_declaration" && (
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => {
                      setIsDetailsModalOpen(false);
                      onDeclareClick?.(selectedEvent.period || "2026-T3");
                    }}
                    className="text-xs"
                  >
                    Créer la déclaration (rnve.ma)
                  </Button>
                )}

                {(selectedEvent.eventType === "tax_payment" || selectedEvent.eventType === "cnss_contribution") && (
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => {
                      setIsDetailsModalOpen(false);
                      onPayClick?.(selectedEvent.period || "2026-T3", selectedEvent.category === "fiscalite" ? "tax" : "cnss");
                    }}
                    className="text-xs"
                  >
                    Enregistrer le paiement
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. MODAL: CREATE CUSTOM REMINDER */}
      {/* ========================================================================= */}
      {isAddReminderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] shadow-xl w-full max-w-md overflow-hidden text-xs">
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[var(--foreground)]">Nouveau rappel de conformité</h3>
                <p className="text-[11px] text-[var(--muted)]">Programmer une échéance administrative ou fiscale personnalisée</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddReminderOpen(false)}
                className="text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmitNewReminder} className="p-4 space-y-3">
              <div>
                <label className="font-semibold block mb-1">Titre de l'obligation</label>
                <Input
                  value={newReminderTitle}
                  onChange={(e) => setNewReminderTitle(e.target.value)}
                  placeholder="Ex: Renouvellement assurance RC Pro, Quittance loyer bureau..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Catégorie</label>
                  <select
                    value={newReminderCategory}
                    onChange={(e) => setNewReminderCategory(e.target.value as any)}
                    className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-md)] px-2.5 py-1.5 text-xs text-[var(--foreground)]"
                  >
                    <option value="fiscalite">Fiscalité (DGI)</option>
                    <option value="cnss">CNSS & AMO</option>
                    <option value="custom">Administratif / Autre</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1">Date d'échéance</label>
                  <Input
                    type="date"
                    value={newReminderDate}
                    onChange={(e) => setNewReminderDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Montant estimé (MAD)</label>
                  <Input
                    type="number"
                    value={newReminderAmount}
                    onChange={(e) => setNewReminderAmount(e.target.value)}
                    placeholder="Ex: 1200"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Priorité</label>
                  <select
                    value={newReminderPriority}
                    onChange={(e) => setNewReminderPriority(e.target.value as any)}
                    className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-md)] px-2.5 py-1.5 text-xs text-[var(--foreground)]"
                  >
                    <option value="normal">Normale</option>
                    <option value="high">Haute</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Notes / Instructions</label>
                <textarea
                  value={newReminderDesc}
                  onChange={(e) => setNewReminderDesc(e.target.value)}
                  rows={2}
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-md)] p-2 text-xs text-[var(--foreground)]"
                  placeholder="Détails complémentaires, documents à fournir..."
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[var(--border)]">
                <Button size="sm" variant="outline" type="button" onClick={() => setIsAddReminderOpen(false)}>
                  Annuler
                </Button>
                <Button size="sm" variant="default" type="submit">
                  Enregistrer le rappel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. MODAL: EDIT DEADLINE (WITH AUDIT REASON) */}
      {/* ========================================================================= */}
      {isEditDeadlineOpen && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] shadow-xl w-full max-w-md overflow-hidden text-xs">
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[var(--foreground)]">Modifier la date d'échéance</h3>
                <p className="text-[11px] text-[var(--muted)]">{selectedEvent.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditDeadlineOpen(false)}
                className="text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmitEditDeadline} className="p-4 space-y-3">
              <div>
                <label className="font-semibold block mb-1">Nouvelle date limite</label>
                <Input
                  type="date"
                  value={editDateValue}
                  onChange={(e) => setEditDateValue(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">
                  Motif de la modification <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={editReasonValue}
                  onChange={(e) => setEditReasonValue(e.target.value)}
                  rows={3}
                  required
                  placeholder="Ex: Prorogation officielle annoncée par communiqué de la DGI / Décalage accordé..."
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-md)] p-2 text-xs text-[var(--foreground)]"
                />
                <span className="text-[10px] text-[var(--muted)] block mt-1">
                  Obligatoire : garantit la traçabilité de l'audit fiscal.
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[var(--border)]">
                <Button size="sm" variant="outline" type="button" onClick={() => setIsEditDeadlineOpen(false)}>
                  Annuler
                </Button>
                <Button size="sm" variant="default" type="submit">
                  Sauvegarder
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. MODAL: RESEND EMAIL PREVIEW */}
      {/* ========================================================================= */}
      {isEmailPreviewOpen && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] shadow-xl w-full max-w-lg overflow-hidden text-xs">
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--background)]/60">
              <div className="flex items-center gap-2">
                <Send size={16} className="text-[var(--accent)]" />
                <h3 className="text-sm font-bold text-[var(--foreground)]">Aperçu Email Automatisé (Resend)</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEmailPreviewOpen(false)}
                className="text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="bg-[var(--background)] p-2.5 rounded border border-[var(--border)] space-y-1 text-[11px]">
                <p>
                  <strong className="text-[var(--muted)]">De :</strong> notifications@realtoros.ma (via Resend)
                </p>
                <p>
                  <strong className="text-[var(--muted)]">À :</strong> agent@realtoros.ma
                </p>
                <p>
                  <strong className="text-[var(--muted)]">Objet :</strong> Rappel — Échéance de{" "}
                  {selectedEvent.category === "fiscalite" ? "déclaration fiscale" : "cotisation AMO"} (
                  {selectedEvent.periodLabel || selectedEvent.dueDate})
                </p>
              </div>

              {/* Rendered Email Body */}
              <div className="border border-[var(--border)] rounded-[var(--radius-md)] p-4 bg-white dark:bg-zinc-950 font-sans space-y-3">
                <div className="border-b pb-2 flex items-center justify-between">
                  <span className="font-bold text-sm text-[var(--foreground)]">RealtorOS Morocco</span>
                  <Badge variant="outline" className="text-[10px]">Alerte Conformité</Badge>
                </div>
                <p className="text-xs text-zinc-700 dark:text-zinc-300">
                  Bonjour,
                </p>
                <p className="text-xs text-zinc-700 dark:text-zinc-300">
                  {selectedEvent.category === "fiscalite"
                    ? "Votre déclaration fiscale approche de sa date limite légale."
                    : "Une cotisation AMO obligatoire approche de son échéance."}
                </p>
                <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded border text-xs space-y-1">
                  <p><strong>Type :</strong> {selectedEvent.title}</p>
                  <p><strong>Période :</strong> {selectedEvent.periodLabel || "2026"}</p>
                  <p><strong>Date limite :</strong> {selectedEvent.dueDate}</p>
                  <p><strong>Montant estimé :</strong> {selectedEvent.amountDue ? formatMAD(selectedEvent.amountDue) : "N/A"}</p>
                  <p><strong>Statut :</strong> {selectedEvent.status}</p>
                  <p><strong>Réf. Légale :</strong> {selectedEvent.legalReference || "CGI Maroc"}</p>
                </div>
                <p className="text-[11px] text-zinc-500">
                  Consultez votre espace RealtorOS pour vérifier les informations et effectuer les démarches nécessaires sur{" "}
                  {selectedEvent.officialSourceUrl || "les portails officiels"}.
                </p>
              </div>
            </div>

            <div className="p-3 border-t border-[var(--border)] bg-[var(--background)] flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => setIsEmailPreviewOpen(false)}>
                Fermer
              </Button>
              <Button
                size="sm"
                variant="default"
                onClick={() => {
                  alert("Simulation Resend : Email de rappel envoyé avec succès !");
                  setIsEmailPreviewOpen(false);
                }}
                leftIcon={<Send size={12} />}
              >
                Envoyer un email de test
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
