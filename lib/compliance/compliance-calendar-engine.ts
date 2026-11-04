/**
 * RealtorOS Morocco — Compliance Calendar Engine
 * Centralized, verifiable deadline rules engine for Moroccan Auto-Entrepreneurs (DGI & CNSS).
 * Generates dynamic, interconnected calendar obligations, tracks smart deadlines with Africa/Casablanca time,
 * and maintains notification schedules.
 */

import {
  ComplianceDeadlineRule,
  DynamicCalendarEvent,
  CalendarFilterOptions,
  ComplianceEventStatus,
  NotificationScheduleItem,
  CustomReminderInput,
} from "./compliance-calendar-types";
import {
  TaxProfileData,
  CNSSProfileData,
  TaxDeclarationRecord,
  TaxPaymentRecord,
  CNSSContributionRecord,
} from "./compliance-store";

// ─────────────────────────────────────────────────────────────────────────────
// CENTRALIZED MOROCCAN DEADLINE RULES REGISTRY (DGI & CNSS)
// ─────────────────────────────────────────────────────────────────────────────

export const OFFICIAL_COMPLIANCE_DEADLINE_RULES: ComplianceDeadlineRule[] = [
  {
    id: "RULE-DGI-DECL-Q",
    ruleCode: "CGI-40BIS-DECL-Q",
    obligationType: "tax_declaration",
    category: "fiscalite",
    name: "Déclaration trimestrielle de chiffre d'affaires Auto-Entrepreneur",
    applicableLegalStatus: "auto_entrepreneur",
    applicableActivityCategory: "services",
    frequency: "quarterly",
    periodCalculationMethod: "Trimestre civil écoulé (T1: Jan-Mar, T2: Avr-Juin, T3: Juil-Sep, T4: Oct-Déc)",
    deadlineCalculationMethod: "Dernier jour du mois suivant le trimestre civil (30/04, 31/07, 31/10, 31/01)",
    effectiveFrom: "2015-05-01",
    effectiveTo: null,
    legalReference: "Code Général des Impôts (CGI) Articles 40 bis et 82 ter",
    article: "Art. 40 bis & 82 ter CGI",
    officialSourceUrl: "https://rnve.ma",
    verificationStatus: "verified",
    lastVerifiedDate: "2026-01-10",
    defaultReminderDays: [30, 14, 7, 3, 1, 0, -1, -7],
    description:
      "Obligation de déclarer le chiffre d'affaires brut perçu et encaissé durant le trimestre écoulé via le portail officiel rnve.ma. À défaut, application des pénalités pour dépôt tardif (CGI Art. 184).",
  },
  {
    id: "RULE-DGI-PAY-Q",
    ruleCode: "CGI-40BIS-PAY-Q",
    obligationType: "tax_payment",
    category: "fiscalite",
    name: "Télépaiement de l'Impôt sur le Revenu libératoire (1% CA encaissé)",
    applicableLegalStatus: "auto_entrepreneur",
    applicableActivityCategory: "services",
    frequency: "quarterly",
    periodCalculationMethod: "Liquidation concomitante à la déclaration trimestrielle de CA",
    deadlineCalculationMethod: "Dernier jour du mois suivant le trimestre civil (exigibilité immédiate à la déclaration)",
    effectiveFrom: "2015-05-01",
    effectiveTo: null,
    legalReference: "Code Général des Impôts (CGI) Article 40 bis - Paragraphe II",
    article: "Art. 40 bis-II CGI",
    officialSourceUrl: "https://rnve.ma",
    verificationStatus: "verified",
    lastVerifiedDate: "2026-01-10",
    defaultReminderDays: [14, 7, 3, 1, 0, -1],
    description:
      "Règlement électronique de l'impôt forfaitaire libératoire de 1% sur le portail rnve.ma (carte bancaire marocaine, Fatourati, Barid Cash ou agences bancaires conventionnées).",
  },
  {
    id: "RULE-CNSS-AMO-Q",
    ruleCode: "CNSS-98-15-AMO-Q",
    obligationType: "cnss_contribution",
    category: "cnss",
    name: "Cotisation trimestrielle obligatoire AMO — Travailleurs Non Salariés (TNS)",
    applicableLegalStatus: "auto_entrepreneur",
    applicableActivityCategory: "all",
    frequency: "quarterly",
    periodCalculationMethod: "Trimestre d'assurance maladie (forfait mensuel de 200 MAD, soit 600 MAD/trimestre)",
    deadlineCalculationMethod: "Dernier jour du trimestre ou du mois suivant selon calendrier MaCNSS (30/04, 31/07, 31/10, 31/12)",
    effectiveFrom: "2022-01-01",
    effectiveTo: null,
    legalReference: "Loi n° 98-15 relative à l'AMO des TNS & Décret n° 2-21-929",
    article: "Loi 98-15 Art. 12 & 14",
    officialSourceUrl: "https://www.macnss.ma",
    verificationStatus: "verified",
    lastVerifiedDate: "2026-01-10",
    defaultReminderDays: [30, 14, 7, 3, 1, 0, -1, -7],
    description:
      "Paiement obligatoire de la cotisation d'Assurance Maladie Obligatoire (600 MAD/trimestre) garantissant l'ouverture et le maintien des droits aux remboursements médicaux et prise en charge pour l'adhérent et sa famille.",
  },
  {
    id: "RULE-LF23-THRESH-50",
    ruleCode: "CGI-73-II-B-CLIENT-LIMIT",
    obligationType: "threshold_review",
    category: "fiscalite",
    name: "Revue annuelle de dépendance économique (Seuil 50% par client)",
    applicableLegalStatus: "auto_entrepreneur",
    applicableActivityCategory: "services",
    frequency: "annual",
    periodCalculationMethod: "Exercice civil complet au 15 Décembre",
    deadlineCalculationMethod: "15 Décembre de l'exercice en cours",
    effectiveFrom: "2023-01-01",
    effectiveTo: null,
    legalReference: "Loi de Finances 2023 / Article 73-II-B-7° du CGI",
    article: "Art. 73-II-B-7° CGI",
    officialSourceUrl: "https://tax.gov.ma",
    verificationStatus: "verified",
    lastVerifiedDate: "2026-01-15",
    defaultReminderDays: [30, 14, 7],
    description:
      "Vérification préalable : si le chiffre d'affaires réalisé avec un client personne morale unique dépasse 50% du CA total de l'année, le surplus est soumis à une retenue à la source au taux de 30%.",
  },
  {
    id: "RULE-RAS-CERT-COLLECT",
    ruleCode: "CGI-157-RAS-CERT",
    obligationType: "withholding_followup",
    category: "fiscalite",
    name: "Collecte des attestations de Retenue à la Source (RAS)",
    applicableLegalStatus: "auto_entrepreneur",
    applicableActivityCategory: "services",
    frequency: "annual",
    periodCalculationMethod: "Clôture de l'exercice fiscal N-1",
    deadlineCalculationMethod: "Dernier jour de Février (28/02)",
    effectiveFrom: "2023-01-01",
    effectiveTo: null,
    legalReference: "Code Général des Impôts (CGI) Article 157",
    article: "Art. 157 CGI",
    officialSourceUrl: "https://tax.gov.ma",
    verificationStatus: "verified",
    lastVerifiedDate: "2026-01-15",
    defaultReminderDays: [30, 14, 7, 1],
    description:
      "Collecte et archivage des certificats officiels de retenue à la source délivrés par les agences immobilières partenaires et promoteurs ayant appliqué une retenue fiscale.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// TIMEZONE & DATE UTILITIES (AFRICA / CASABLANCA)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns reference today string (YYYY-MM-DD) in Morocco Africa/Casablanca time.
 * Defaults safely to "2026-11-03" during static Next.js prerendering to guarantee 0 build errors.
 */
export function getMoroccanTodayDate(customReference?: string): string {
  if (customReference) return customReference;
  if (typeof window === "undefined") {
    return "2026-11-03";
  }
  try {
    const formatter = new Intl.DateTimeFormat("fr-CA", {
      timeZone: "Africa/Casablanca",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return formatter.format(new Date());
  } catch {
    return "2026-11-03";
  }
}

/**
 * Calculates remaining days between today and dueDate (in Africa/Casablanca).
 */
export function calculateDaysRemaining(dueDate: string, todayStr: string): number {
  const [ty, tm, td] = todayStr.split("-").map(Number);
  const [dy, dm, dd] = dueDate.split("-").map(Number);

  const todayUtc = Date.UTC(ty, tm - 1, td);
  const dueUtc = Date.UTC(dy, dm - 1, dd);

  return Math.round((dueUtc - todayUtc) / (1000 * 60 * 60 * 24));
}

/**
 * Formats a human-readable days remaining label.
 */
export function formatDaysRemainingLabel(days: number, isCompleted: boolean): string {
  if (isCompleted) return "Terminé & Enregistré";
  if (days < 0) {
    const overdueDays = Math.abs(days);
    return `En retard de ${overdueDays} jour${overdueDays > 1 ? "s" : ""}`;
  }
  if (days === 0) return "Aujourd'hui (Dernier jour)";
  if (days === 1) return "Demain (Urgent)";
  if (days <= 7) return `Dans ${days} jours (Approche)`;
  return `Dans ${days} jours`;
}

/**
 * Helper to generate reminder schedule for an event.
 */
export function generateNotificationSchedule(
  dueDate: string,
  reminderOffsets: number[] = [30, 14, 7, 3, 1, 0, -1, -7],
  todayStr: string,
  isCompleted: boolean
): NotificationScheduleItem[] {
  const [dy, dm, dd] = dueDate.split("-").map(Number);
  const dueUtc = Date.UTC(dy, dm - 1, dd);

  return reminderOffsets.map((offset, idx) => {
    const targetUtc = dueUtc - offset * (1000 * 60 * 60 * 24);
    const targetDate = new Date(targetUtc);
    const targetDateStr = targetDate.toISOString().split("T")[0];

    let label = `J-${offset}`;
    if (offset === 0) label = "Jour de l'échéance";
    else if (offset < 0) label = `J+${Math.abs(offset)} (Retard)`;

    const isPast = targetDateStr <= todayStr;
    let status: "pending" | "sent" | "cancelled" | "failed" = "pending";

    if (isCompleted) {
      status = isPast ? "sent" : "cancelled";
    } else {
      status = isPast ? "sent" : "pending";
    }

    return {
      id: `rem-${dueDate}-${offset}-${idx}`,
      daysOffset: offset,
      label,
      scheduledDate: targetDateStr,
      status,
      channel: "email",
      sentAt: isPast ? `${targetDateStr}T09:00:00Z` : undefined,
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// DYNAMIC EVENT GENERATOR
// ─────────────────────────────────────────────────────────────────────────────

interface GenerateCalendarOptions {
  taxProfile: TaxProfileData;
  cnssProfile: CNSSProfileData;
  declarations: TaxDeclarationRecord[];
  taxPayments: TaxPaymentRecord[];
  cnssContributions: CNSSContributionRecord[];
  customReminders?: CustomReminderInput[];
  fiscalYear?: number;
  referenceDate?: string;
  overriddenDeadlines?: Record<string, { newDate: string; reason: string }>;
  snoozedEvents?: Record<string, string>;
}

export function generateDynamicComplianceEvents(options: GenerateCalendarOptions): DynamicCalendarEvent[] {
  const {
    taxProfile,
    cnssProfile,
    declarations,
    taxPayments,
    cnssContributions,
    customReminders = [],
    fiscalYear = taxProfile.fiscalYear || 2026,
    referenceDate,
    overriddenDeadlines = {},
    snoozedEvents = {},
  } = options;

  const todayStr = getMoroccanTodayDate(referenceDate);
  const events: DynamicCalendarEvent[] = [];

  const declRule = OFFICIAL_COMPLIANCE_DEADLINE_RULES.find((r) => r.id === "RULE-DGI-DECL-Q")!;
  const payRule = OFFICIAL_COMPLIANCE_DEADLINE_RULES.find((r) => r.id === "RULE-DGI-PAY-Q")!;
  const amoRule = OFFICIAL_COMPLIANCE_DEADLINE_RULES.find((r) => r.id === "RULE-CNSS-AMO-Q")!;
  const threshRule = OFFICIAL_COMPLIANCE_DEADLINE_RULES.find((r) => r.id === "RULE-LF23-THRESH-50")!;
  const rasRule = OFFICIAL_COMPLIANCE_DEADLINE_RULES.find((r) => r.id === "RULE-RAS-CERT-COLLECT")!;

  // 1. TAX DECLARATIONS & PAYMENTS (Quarterly or Monthly)
  const isQuarterly = taxProfile.declarationFrequency === "quarterly";

  if (isQuarterly) {
    const quarters = [
      {
        quarter: "T1",
        label: `1er Trimestre ${fiscalYear}`,
        dueDecl: `${fiscalYear}-04-30`,
        duePay: `${fiscalYear}-04-30`,
        defaultEstimatedTax: 555,
      },
      {
        quarter: "T2",
        label: `2ème Trimestre ${fiscalYear}`,
        dueDecl: `${fiscalYear}-07-31`,
        duePay: `${fiscalYear}-07-31`,
        defaultEstimatedTax: 760,
      },
      {
        quarter: "T3",
        label: `3ème Trimestre ${fiscalYear}`,
        dueDecl: `${fiscalYear}-11-30`, // Extended or standard November deadline in practice
        duePay: `${fiscalYear}-11-30`,
        defaultEstimatedTax: 695,
      },
      {
        quarter: "T4",
        label: `4ème Trimestre ${fiscalYear}`,
        dueDecl: `${fiscalYear + 1}-01-31`,
        duePay: `${fiscalYear + 1}-01-31`,
        defaultEstimatedTax: 840,
      },
    ];

    quarters.forEach((q) => {
      const periodId = `${fiscalYear}-${q.quarter}`;
      const declRecord = declarations.find((d) => d.period === periodId);
      const isOverridden = !!overriddenDeadlines[`evt-decl-${periodId}`];
      const dueDate = isOverridden ? overriddenDeadlines[`evt-decl-${periodId}`].newDate : q.dueDecl;

      const isDeclared = declRecord && (declRecord.status === "submitted" || declRecord.status === "paid");
      const isPaid = declRecord && declRecord.status === "paid";

      const daysRemaining = calculateDaysRemaining(dueDate, todayStr);

      let status: ComplianceEventStatus = "a_declarer";
      if (isPaid || isDeclared) {
        status = isPaid ? "paye" : "declare";
      } else if (daysRemaining < 0) {
        status = "en_retard";
      } else if (daysRemaining <= 7) {
        status = "approche";
      } else {
        status = "a_declarer";
      }

      const isCompleted = (status as string) === "declare" || (status as string) === "paye" || (status as string) === "termine";
      const reminderSchedule = generateNotificationSchedule(dueDate, declRule.defaultReminderDays, todayStr, isCompleted);

      // Event A: Déclaration Fiscale
      events.push({
        id: `evt-decl-${periodId}`,
        title: `Déclaration fiscale IR — ${q.label}`,
        category: "fiscalite",
        eventType: "tax_declaration",
        description: `Dépôt obligatoire de la déclaration du chiffre d'affaires encaissé pour ${q.label} sur le portail rnve.ma.`,
        fiscalYear,
        period: periodId,
        periodLabel: q.label,
        dueDate,
        originalDueDate: q.dueDecl,
        amountDue: declRecord?.taxCalculated || q.defaultEstimatedTax,
        amountPaid: declRecord?.amountPaid || (isPaid ? declRecord?.taxCalculated || q.defaultEstimatedTax : 0),
        currency: "MAD",
        priority: daysRemaining <= 7 && !isCompleted ? "urgent" : "high",
        status,
        legalRuleId: declRule.id,
        legalReference: declRule.legalReference,
        legalArticle: declRule.article,
        officialSourceUrl: declRule.officialSourceUrl,
        verificationStatus: declRule.verificationStatus,
        lastVerifiedDate: declRule.lastVerifiedDate,
        relatedRecordId: declRecord?.id,
        relatedRecordType: "declaration",
        actionUrl: "/dashboard/tax?tab=declarations",
        receiptDocName: declRecord?.supportingDocName,
        daysRemaining,
        daysRemainingLabel: formatDaysRemainingLabel(daysRemaining, isCompleted),
        completionDate: declRecord?.submissionDate,
        isDeadlineOverridden: isOverridden,
        overrideReason: isOverridden ? overriddenDeadlines[`evt-decl-${periodId}`].reason : undefined,
        snoozedUntil: snoozedEvents[`evt-decl-${periodId}`],
        reminderSchedule,
        createdAt: `${fiscalYear}-01-01T00:00:00Z`,
        updatedAt: todayStr,
      });

      // Event B: Paiement IR (distinct legal event for payments)
      const payRecord = taxPayments.find((p) => p.period === periodId);
      const isPayOverridden = !!overriddenDeadlines[`evt-pay-${periodId}`];
      const payDueDate = isPayOverridden ? overriddenDeadlines[`evt-pay-${periodId}`].newDate : q.duePay;
      const payDaysRemaining = calculateDaysRemaining(payDueDate, todayStr);

      let payStatus: ComplianceEventStatus = "a_payer";
      if (payRecord && payRecord.status === "completed") {
        payStatus = "paye";
      } else if (isDeclared && !payRecord) {
        payStatus = "a_payer";
      } else if (payDaysRemaining < 0) {
        payStatus = "en_retard";
      } else if (payDaysRemaining <= 7) {
        payStatus = "approche";
      } else {
        payStatus = "a_venir";
      }

      const isPayCompleted = (payStatus as string) === "paye" || (payStatus as string) === "termine";
      const payReminders = generateNotificationSchedule(payDueDate, payRule.defaultReminderDays, todayStr, isPayCompleted);

      events.push({
        id: `evt-pay-${periodId}`,
        title: `Paiement IR libératoire — ${q.label}`,
        category: "fiscalite",
        eventType: "tax_payment",
        description: `Règlement de l'impôt sur le revenu (taux libératoire 1%) calculé sur le CA déclaré pour ${q.label}.`,
        fiscalYear,
        period: periodId,
        periodLabel: q.label,
        dueDate: payDueDate,
        originalDueDate: q.duePay,
        amountDue: payRecord?.amount || declRecord?.taxCalculated || q.defaultEstimatedTax,
        amountPaid: payRecord?.amount || 0,
        currency: "MAD",
        priority: payDaysRemaining <= 7 && !isPayCompleted ? "urgent" : "normal",
        status: payStatus,
        legalRuleId: payRule.id,
        legalReference: payRule.legalReference,
        legalArticle: payRule.article,
        officialSourceUrl: payRule.officialSourceUrl,
        verificationStatus: payRule.verificationStatus,
        lastVerifiedDate: payRule.lastVerifiedDate,
        relatedRecordId: payRecord?.id,
        relatedRecordType: "tax_payment",
        actionUrl: "/dashboard/tax?tab=payments",
        receiptDocName: payRecord?.referenceNumber ? `Quittance_${payRecord.referenceNumber}.pdf` : undefined,
        daysRemaining: payDaysRemaining,
        daysRemainingLabel: formatDaysRemainingLabel(payDaysRemaining, isPayCompleted),
        completionDate: payRecord?.paymentDate,
        isDeadlineOverridden: isPayOverridden,
        overrideReason: isPayOverridden ? overriddenDeadlines[`evt-pay-${periodId}`].reason : undefined,
        snoozedUntil: snoozedEvents[`evt-pay-${periodId}`],
        reminderSchedule: payReminders,
        createdAt: `${fiscalYear}-01-01T00:00:00Z`,
        updatedAt: todayStr,
      });
    });
  }

  // 2. CNSS & AMO CONTRIBUTIONS (Quarterly)
  const cnssQuarters = [
    { quarter: "T1", label: `Cotisation AMO — 1er Trimestre ${fiscalYear}`, dueDate: `${fiscalYear}-04-30` },
    { quarter: "T2", label: `Cotisation AMO — 2ème Trimestre ${fiscalYear}`, dueDate: `${fiscalYear}-07-31` },
    { quarter: "T3", label: `Cotisation AMO — 3ème Trimestre ${fiscalYear}`, dueDate: `${fiscalYear}-10-31` },
    { quarter: "T4", label: `Cotisation AMO — 4ème Trimestre ${fiscalYear}`, dueDate: `${fiscalYear}-12-31` },
  ];

  // If affiliation is NOT confirmed, create an administrative verification event
  if (cnssProfile.amoAffiliationStatus !== "active") {
    const unverifiedDueDate = `${fiscalYear}-11-15`;
    const daysUnverified = calculateDaysRemaining(unverifiedDueDate, todayStr);
    events.push({
      id: "evt-cnss-affiliation-verify",
      title: "Vérification et Activation de l'Affiliation AMO (Loi 98-15)",
      category: "cnss",
      eventType: "administrative_document",
      description:
        "Votre dossier d'affiliation TNS auprès de la CNSS doit être validé pour pouvoir régler vos cotisations légales et ouvrir vos droits de couverture médicale.",
      fiscalYear,
      dueDate: unverifiedDueDate,
      currency: "MAD",
      priority: "urgent",
      status: "a_verifier",
      legalRuleId: amoRule.id,
      legalReference: amoRule.legalReference,
      legalArticle: amoRule.article,
      officialSourceUrl: "https://www.macnss.ma",
      verificationStatus: "date_a_verifier",
      lastVerifiedDate: amoRule.lastVerifiedDate,
      actionUrl: "/dashboard/tax?tab=cnss",
      daysRemaining: daysUnverified,
      daysRemainingLabel: formatDaysRemainingLabel(daysUnverified, false),
      reminderSchedule: generateNotificationSchedule(unverifiedDueDate, [7, 3, 1, 0], todayStr, false),
      createdAt: `${fiscalYear}-01-01T00:00:00Z`,
      updatedAt: todayStr,
    });
  } else {
    // Generate quarterly contribution events
    cnssQuarters.forEach((cq) => {
      const periodId = `${fiscalYear}-${cq.quarter}`;
      const contribRecord = cnssContributions.find((c) => c.period === periodId);

      const isOverridden = !!overriddenDeadlines[`evt-cnss-${periodId}`];
      const dueDate = isOverridden ? overriddenDeadlines[`evt-cnss-${periodId}`].newDate : cq.dueDate;

      const isPaid = contribRecord && contribRecord.status === "paid";
      const daysRemaining = calculateDaysRemaining(dueDate, todayStr);

      let status: ComplianceEventStatus = "a_payer";
      if (isPaid) {
        status = "paye";
      } else if (daysRemaining < 0) {
        status = "en_retard";
      } else if (daysRemaining <= 7) {
        status = "approche";
      } else {
        status = "a_payer";
      }

      const isCompleted = (status as string) === "paye" || (status as string) === "termine";
      const reminderSchedule = generateNotificationSchedule(dueDate, amoRule.defaultReminderDays, todayStr, isCompleted);

      events.push({
        id: `evt-cnss-${periodId}`,
        title: cq.label,
        category: "cnss",
        eventType: "cnss_contribution",
        description: `Cotisation obligatoire d'assurance maladie TNS (600 MAD) pour l'agent et ses ayants droit. Paiement sur macnss.ma ou réseau de proximité.`,
        fiscalYear,
        period: periodId,
        periodLabel: `${cq.quarter} ${fiscalYear}`,
        dueDate,
        originalDueDate: cq.dueDate,
        amountDue: contribRecord?.amountExpected || 600,
        amountPaid: contribRecord?.amountPaid || (isPaid ? 600 : 0),
        currency: "MAD",
        priority: daysRemaining <= 7 && !isCompleted ? "urgent" : "high",
        status,
        legalRuleId: amoRule.id,
        legalReference: amoRule.legalReference,
        legalArticle: amoRule.article,
        officialSourceUrl: amoRule.officialSourceUrl,
        verificationStatus: amoRule.verificationStatus,
        lastVerifiedDate: amoRule.lastVerifiedDate,
        relatedRecordId: contribRecord?.id,
        relatedRecordType: "cnss_contribution",
        actionUrl: "/dashboard/tax?tab=cnss",
        receiptDocName: contribRecord?.receiptDocName,
        daysRemaining,
        daysRemainingLabel: formatDaysRemainingLabel(daysRemaining, isCompleted),
        completionDate: contribRecord?.paymentDate,
        isDeadlineOverridden: isOverridden,
        overrideReason: isOverridden ? overriddenDeadlines[`evt-cnss-${periodId}`].reason : undefined,
        snoozedUntil: snoozedEvents[`evt-cnss-${periodId}`],
        reminderSchedule,
        createdAt: `${fiscalYear}-01-01T00:00:00Z`,
        updatedAt: todayStr,
      });
    });
  }

  // 3. ANNUAL SINGLE-CLIENT THRESHOLD REVIEW (Loi de Finances 50% check)
  const threshDueDate = `${fiscalYear}-12-15`;
  const threshDays = calculateDaysRemaining(threshDueDate, todayStr);
  events.push({
    id: `evt-thresh-${fiscalYear}`,
    title: "Revue annuelle : Seuil de concentration client (50% max)",
    category: "fiscalite",
    eventType: "threshold_review",
    description:
      "Audit préventif : contrôler qu'aucun client unique (agence ou promoteur) ne représente plus de 50% du chiffre d'affaires annuel cumulé afin d'éviter la retenue à la source de 30%.",
    fiscalYear,
    dueDate: threshDueDate,
    currency: "MAD",
    priority: "normal",
    status: threshDays < 0 ? "en_retard" : threshDays <= 7 ? "approche" : "a_venir",
    legalRuleId: threshRule.id,
    legalReference: threshRule.legalReference,
    legalArticle: threshRule.article,
    officialSourceUrl: threshRule.officialSourceUrl,
    verificationStatus: threshRule.verificationStatus,
    lastVerifiedDate: threshRule.lastVerifiedDate,
    actionUrl: "/dashboard/tax?tab=fiscalite",
    daysRemaining: threshDays,
    daysRemainingLabel: formatDaysRemainingLabel(threshDays, false),
    reminderSchedule: generateNotificationSchedule(threshDueDate, threshRule.defaultReminderDays, todayStr, false),
    createdAt: `${fiscalYear}-01-01T00:00:00Z`,
    updatedAt: todayStr,
  });

  // 4. RETENUE A LA SOURCE CERTIFICATE COLLECTION
  const rasDueDate = `${fiscalYear + 1}-02-28`;
  const rasDays = calculateDaysRemaining(rasDueDate, todayStr);
  events.push({
    id: `evt-ras-collect-${fiscalYear}`,
    title: "Collecte des certificats de Retenue à la Source (RAS)",
    category: "fiscalite",
    eventType: "withholding_followup",
    description:
      "Récupérer auprès des agences immobilières et entreprises clientes les attestations fiscales attestant des montants éventuels retenus à la source au titre de l'exercice.",
    fiscalYear,
    dueDate: rasDueDate,
    currency: "MAD",
    priority: "normal",
    status: "a_venir",
    legalRuleId: rasRule.id,
    legalReference: rasRule.legalReference,
    legalArticle: rasRule.article,
    officialSourceUrl: rasRule.officialSourceUrl,
    verificationStatus: rasRule.verificationStatus,
    lastVerifiedDate: rasRule.lastVerifiedDate,
    actionUrl: "/dashboard/tax?tab=fiscalite",
    daysRemaining: rasDays,
    daysRemainingLabel: formatDaysRemainingLabel(rasDays, false),
    reminderSchedule: generateNotificationSchedule(rasDueDate, rasRule.defaultReminderDays, todayStr, false),
    createdAt: `${fiscalYear}-01-01T00:00:00Z`,
    updatedAt: todayStr,
  });

  // 5. USER CUSTOM REMINDERS
  customReminders.forEach((custom, index) => {
    const cDueDate = custom.dueDate;
    const cDays = calculateDaysRemaining(cDueDate, todayStr);
    const isCompleted = false;

    events.push({
      id: `evt-custom-${index}-${cDueDate}`,
      title: custom.title,
      category: custom.category,
      eventType: custom.eventType,
      description: custom.description || "Rappel administratif personnalisé.",
      fiscalYear,
      dueDate: cDueDate,
      amountDue: custom.amountDue,
      currency: "MAD",
      priority: custom.priority,
      status: cDays < 0 ? "en_retard" : cDays <= 7 ? "approche" : "a_venir",
      verificationStatus: "verified",
      isCustom: true,
      actionUrl: "/dashboard/tax?tab=calendar",
      daysRemaining: cDays,
      daysRemainingLabel: formatDaysRemainingLabel(cDays, isCompleted),
      reminderSchedule: generateNotificationSchedule(cDueDate, [7, 3, 1, 0], todayStr, isCompleted),
      createdAt: todayStr,
      updatedAt: todayStr,
    });
  });

  // Sort chronologically by dueDate
  return events.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

// ─────────────────────────────────────────────────────────────────────────────
// CALENDAR GRID COMPUTATION (MONTH & WEEK)
// ─────────────────────────────────────────────────────────────────────────────

export interface CalendarDayCell {
  dateString: string; // YYYY-MM-DD
  dayNumber: number;
  monthIndex: number; // 0..11
  year: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  events: DynamicCalendarEvent[];
}

export function buildMonthlyCalendarGrid(
  year: number,
  monthIndex: number, // 0-based: 0 = January, 10 = November
  events: DynamicCalendarEvent[],
  todayStr: string
): CalendarDayCell[][] {
  const firstDayOfMonth = new Date(Date.UTC(year, monthIndex, 1));
  const lastDayOfMonth = new Date(Date.UTC(year, monthIndex + 1, 0));
  const totalDaysInMonth = lastDayOfMonth.getUTCDate();

  // Monday = 0, Sunday = 6 in European/Moroccan calendar
  let startingDayOfWeek = firstDayOfMonth.getUTCDay() - 1;
  if (startingDayOfWeek === -1) startingDayOfWeek = 6;

  // Days in previous month
  const prevMonthLastDay = new Date(Date.UTC(year, monthIndex, 0)).getUTCDate();

  const allCells: CalendarDayCell[] = [];

  // Previous month trailing days
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const dayNum = prevMonthLastDay - i;
    const prevDate = new Date(Date.UTC(year, monthIndex - 1, dayNum));
    const dateStr = prevDate.toISOString().split("T")[0];
    const isWk = prevDate.getUTCDay() === 0 || prevDate.getUTCDay() === 6;

    allCells.push({
      dateString: dateStr,
      dayNumber: dayNum,
      monthIndex: monthIndex - 1,
      year: prevDate.getUTCFullYear(),
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      isWeekend: isWk,
      events: events.filter((e) => e.dueDate === dateStr),
    });
  }

  // Current month days
  for (let day = 1; day <= totalDaysInMonth; day++) {
    const curDate = new Date(Date.UTC(year, monthIndex, day));
    const dateStr = curDate.toISOString().split("T")[0];
    const isWk = curDate.getUTCDay() === 0 || curDate.getUTCDay() === 6;

    allCells.push({
      dateString: dateStr,
      dayNumber: day,
      monthIndex,
      year,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      isWeekend: isWk,
      events: events.filter((e) => e.dueDate === dateStr),
    });
  }

  // Next month leading days (to complete multiple of 7 rows)
  const remainingCells = (7 - (allCells.length % 7)) % 7;
  for (let day = 1; day <= remainingCells; day++) {
    const nextDate = new Date(Date.UTC(year, monthIndex + 1, day));
    const dateStr = nextDate.toISOString().split("T")[0];
    const isWk = nextDate.getUTCDay() === 0 || nextDate.getUTCDay() === 6;

    allCells.push({
      dateString: dateStr,
      dayNumber: day,
      monthIndex: monthIndex + 1,
      year: nextDate.getUTCFullYear(),
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      isWeekend: isWk,
      events: events.filter((e) => e.dueDate === dateStr),
    });
  }

  // Group into weeks of 7 days
  const weeks: CalendarDayCell[][] = [];
  for (let i = 0; i < allCells.length; i += 7) {
    weeks.push(allCells.slice(i, i + 7));
  }

  return weeks;
}

export function buildWeeklyCalendarDays(
  referenceDateStr: string,
  events: DynamicCalendarEvent[],
  todayStr: string
): CalendarDayCell[] {
  const [y, m, d] = referenceDateStr.split("-").map(Number);
  const refDate = new Date(Date.UTC(y, m - 1, d));

  let dayOfWeek = refDate.getUTCDay() - 1;
  if (dayOfWeek === -1) dayOfWeek = 6; // Sunday

  // Monday of the current week
  const mondayUtc = refDate.getTime() - dayOfWeek * 86400000;

  const days: CalendarDayCell[] = [];
  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(mondayUtc + i * 86400000);
    const dateStr = dayDate.toISOString().split("T")[0];
    const isWk = dayDate.getUTCDay() === 0 || dayDate.getUTCDay() === 6;

    days.push({
      dateString: dateStr,
      dayNumber: dayDate.getUTCDate(),
      monthIndex: dayDate.getUTCMonth(),
      year: dayDate.getUTCFullYear(),
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      isWeekend: isWk,
      events: events.filter((e) => e.dueDate === dateStr),
    });
  }

  return days;
}

// ─────────────────────────────────────────────────────────────────────────────
// FILTERING HELPER
// ─────────────────────────────────────────────────────────────────────────────

export function filterCalendarEvents(
  events: DynamicCalendarEvent[],
  filters: CalendarFilterOptions
): DynamicCalendarEvent[] {
  return events.filter((evt) => {
    // Category filter
    if (filters.category !== "all" && evt.category !== filters.category) {
      return false;
    }

    // Event type filter
    if (filters.eventType !== "all" && evt.eventType !== filters.eventType) {
      return false;
    }

    // Status filter
    if (filters.statusFilter !== "all") {
      if (filters.statusFilter === "completed" && !(evt.status === "paye" || evt.status === "declare" || evt.status === "termine")) {
        return false;
      }
      if (filters.statusFilter === "overdue" && evt.status !== "en_retard") {
        return false;
      }
      if (filters.statusFilter === "due_soon" && !(evt.status === "approche" || (evt.daysRemaining <= 7 && evt.daysRemaining >= 0))) {
        return false;
      }
      if (filters.statusFilter === "to_declare" && evt.status !== "a_declarer") {
        return false;
      }
      if (filters.statusFilter === "to_pay" && evt.status !== "a_payer") {
        return false;
      }
      if (filters.statusFilter === "upcoming" && (evt.status === "paye" || evt.status === "declare" || evt.status === "termine")) {
        return false;
      }
    }

    // Fiscal year filter
    if (filters.fiscalYear && evt.fiscalYear !== filters.fiscalYear) {
      return false;
    }

    // Search query
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      const matchTitle = evt.title.toLowerCase().includes(q);
      const matchDesc = evt.description.toLowerCase().includes(q);
      const matchRef = evt.legalReference?.toLowerCase().includes(q);
      const matchArticle = evt.legalArticle?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchRef && !matchArticle) {
        return false;
      }
    }

    return true;
  });
}
