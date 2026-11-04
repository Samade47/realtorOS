/**
 * RealtorOS Morocco — Compliance Calendar Types & Specifications
 * Defines comprehensive models for Moroccan Auto-Entrepreneur tax & CNSS/AMO obligations,
 * verified legal rules, smart deadline tracking, and email notification schedules.
 */

export type CalendarCategory = "fiscalite" | "cnss" | "custom";

export type CalendarEventType =
  | "tax_declaration"
  | "tax_payment"
  | "cnss_contribution"
  | "threshold_review"
  | "withholding_followup"
  | "administrative_document"
  | "custom_reminder";

export type ComplianceEventStatus =
  | "a_venir"
  | "approche"
  | "a_payer"
  | "a_declarer"
  | "en_attente"
  | "partiellement_paye"
  | "declare"
  | "paye"
  | "en_retard"
  | "termine"
  | "a_verifier";

export type CalendarViewMode = "month" | "week" | "agenda";

export interface NotificationScheduleItem {
  id: string;
  daysOffset: number; // e.g. 30, 14, 7, 3, 1, 0, -1, -7
  label: string; // "J-30", "J-14", "J-7", "J-3", "J-1", "Jour de l'échéance", "J+1 (Retard)", "J+7 (Retard)"
  scheduledDate: string; // YYYY-MM-DD
  status: "pending" | "sent" | "cancelled" | "failed";
  channel: "email" | "in_app";
  sentAt?: string;
}

export interface ComplianceDeadlineRule {
  id: string;
  ruleCode: string;
  obligationType: CalendarEventType;
  category: CalendarCategory;
  name: string;
  applicableLegalStatus: "auto_entrepreneur" | "all";
  applicableActivityCategory: "services" | "commerce_industrie" | "artisanat" | "all";
  frequency: "quarterly" | "monthly" | "annual" | "event_based";
  periodCalculationMethod: string;
  deadlineCalculationMethod: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  legalReference: string;
  article: string;
  officialSourceUrl: string;
  verificationStatus: "verified" | "date_a_verifier";
  lastVerifiedDate: string;
  defaultReminderDays: number[];
  description: string;
}

export interface DynamicCalendarEvent {
  id: string;
  userId?: string;
  title: string;
  category: CalendarCategory;
  eventType: CalendarEventType;
  description: string;
  fiscalYear: number;
  period?: string; // e.g. "2026-T1", "2026-T3"
  periodLabel?: string; // e.g. "3ème Trimestre 2026"
  dueDate: string; // YYYY-MM-DD (Africa/Casablanca)
  amountDue?: number;
  amountPaid?: number;
  currency: string; // "MAD"
  priority: "urgent" | "high" | "normal" | "low";
  status: ComplianceEventStatus;
  legalRuleId?: string;
  legalReference?: string;
  legalArticle?: string;
  officialSourceUrl?: string;
  verificationStatus: "verified" | "date_a_verifier";
  lastVerifiedDate?: string;
  relatedRecordId?: string;
  relatedRecordType?: "declaration" | "tax_payment" | "cnss_contribution" | "withholding" | "custom";
  actionUrl?: string;
  receiptDocName?: string;
  receiptDocUrl?: string;
  daysRemaining: number;
  daysRemainingLabel: string;
  completionDate?: string;
  isCustom?: boolean;
  isDeadlineOverridden?: boolean;
  overrideReason?: string;
  originalDueDate?: string;
  snoozedUntil?: string;
  reminderSchedule: NotificationScheduleItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CalendarFilterOptions {
  category: "all" | CalendarCategory;
  eventType: "all" | CalendarEventType;
  statusFilter: "all" | "upcoming" | "completed" | "overdue" | "due_soon" | "to_pay" | "to_declare";
  fiscalYear: number;
  searchQuery: string;
}

export interface CustomReminderInput {
  title: string;
  category: CalendarCategory;
  eventType: CalendarEventType;
  description: string;
  dueDate: string;
  amountDue?: number;
  priority: "urgent" | "high" | "normal" | "low";
  notes?: string;
}
