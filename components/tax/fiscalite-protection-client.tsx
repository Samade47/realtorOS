"use client";

import * as React from "react";
import {
  Calculator,
  Shield,
  Calendar,
  Bell,
  FileText,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  Info,
  Building,
  User,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Download,
  Upload,
  Receipt,
  FileCheck,
  Percent,
  Sliders,
  Send,
  Eye,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";
import {
  INITIAL_TAX_PROFILE,
  INITIAL_CNSS_PROFILE,
  INITIAL_TAX_DECLARATIONS,
  INITIAL_TAX_PAYMENTS,
  INITIAL_WITHHOLDING_RECORDS,
  INITIAL_CNSS_CONTRIBUTIONS,
  INITIAL_COMPLIANCE_EVENTS,
  INITIAL_COMPLIANCE_NOTIFICATIONS,
  INITIAL_COMPLIANCE_DOCUMENTS,
  OFFICIAL_TAX_RULES,
  OFFICIAL_CNSS_RULES,
  TaxProfileData,
  CNSSProfileData,
  TaxDeclarationRecord,
  TaxPaymentRecord,
  WithholdingRecord,
  CNSSContributionRecord,
  ComplianceCalendarEvent,
  ComplianceNotification,
  ComplianceDocument,
} from "@/lib/compliance/compliance-store";
import {
  calculateMoroccanTax,
  calculateMoroccanCNSS,
  generateComplianceEmailTemplate,
} from "@/lib/compliance/tax-engine";
import { DynamicComplianceCalendar } from "@/components/compliance-calendar/dynamic-compliance-calendar";
import { generateDynamicComplianceEvents } from "@/lib/compliance/compliance-calendar-engine";
import { CustomReminderInput, DynamicCalendarEvent } from "@/lib/compliance/compliance-calendar-types";
import { DEMO_COMMISSIONS, DEMO_FINANCIAL_SUMMARY } from "@/lib/data/demo-data";
import { formatMAD } from "@/lib/utils";

export function FiscaliteProtectionClient() {
  // Main Tab Navigation
  const [activeTab, setActiveTab] = React.useState<
    "overview" | "fiscalite" | "cnss" | "calendar" | "notifications" | "analytics" | "documents" | "settings"
  >("overview");

  // Sub-tab Navigation for Fiscalité
  const [fiscaliteSubTab, setFiscaliteSubTab] = React.useState<
    "dashboard" | "turnover" | "calculator" | "declarations" | "withholding" | "payments" | "rules"
  >("dashboard");

  // Sub-tab Navigation for CNSS (including Calendar)
  const [cnssSubTab, setCnssSubTab] = React.useState<
    "dashboard" | "calendar" | "profile" | "calculator" | "contributions" | "amo_info" | "rules"
  >("dashboard");

  // Core State
  const [taxProfile, setTaxProfile] = React.useState<TaxProfileData>(INITIAL_TAX_PROFILE);
  const [cnssProfile, setCnssProfile] = React.useState<CNSSProfileData>(INITIAL_CNSS_PROFILE);
  const [declarations, setDeclarations] = React.useState<TaxDeclarationRecord[]>(INITIAL_TAX_DECLARATIONS);
  const [taxPayments, setTaxPayments] = React.useState<TaxPaymentRecord[]>(INITIAL_TAX_PAYMENTS);
  const [withholdings, setWithholdings] = React.useState<WithholdingRecord[]>(INITIAL_WITHHOLDING_RECORDS);
  const [contributions, setContributions] = React.useState<CNSSContributionRecord[]>(INITIAL_CNSS_CONTRIBUTIONS);
  const [calendarEvents, setCalendarEvents] = React.useState<ComplianceCalendarEvent[]>(INITIAL_COMPLIANCE_EVENTS);
  const [notifications, setNotifications] = React.useState<ComplianceNotification[]>(INITIAL_COMPLIANCE_NOTIFICATIONS);
  const [documents, setDocuments] = React.useState<ComplianceDocument[]>(INITIAL_COMPLIANCE_DOCUMENTS);

  // Custom Reminders & Calendar Overrides State
  const [customReminders, setCustomReminders] = React.useState<CustomReminderInput[]>([]);
  const [overriddenDeadlines, setOverriddenDeadlines] = React.useState<Record<string, { newDate: string; reason: string }>>({});
  const [snoozedEvents, setSnoozedEvents] = React.useState<Record<string, string>>({});

  // Dynamic Calendar Events Engine (always synchronized with live declarations, contributions & payments)
  const dynamicCalendarEvents = React.useMemo(() => {
    return generateDynamicComplianceEvents({
      taxProfile,
      cnssProfile,
      declarations,
      taxPayments,
      cnssContributions: contributions,
      customReminders,
      fiscalYear: taxProfile.fiscalYear,
      overriddenDeadlines,
      snoozedEvents,
    });
  }, [taxProfile, cnssProfile, declarations, taxPayments, contributions, customReminders, overriddenDeadlines, snoozedEvents]);

  // Success alert message toast
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  // Modals state
  const [showDeclModal, setShowDeclModal] = React.useState(false);
  const [showTaxPayModal, setShowTaxPayModal] = React.useState(false);
  const [showCNSSPayModal, setShowCNSSPayModal] = React.useState(false);
  const [showWithholdingModal, setShowWithholdingModal] = React.useState(false);
  const [showEmailSimModal, setShowEmailSimModal] = React.useState(false);
  const [emailSimulationData, setEmailSimulationData] = React.useState<any>(null);

  // Dynamic simulation inputs
  const [simTurnover, setSimTurnover] = React.useState<string>("218750");
  const [simActivity, setSimActivity] = React.useState<"services" | "commerce_industrie">("services");
  const [simCustomRate, setSimCustomRate] = React.useState<string>("0.01");

  // Dynamic Form states
  const [newDeclForm, setNewDeclForm] = React.useState({
    period: "2026-T3",
    periodLabel: "3ème Trimestre 2026 (Juil - Sep)",
    turnoverDeclared: "69500",
    dueDate: "2026-11-30",
    notes: "",
  });

  const [newTaxPayForm, setNewTaxPayForm] = React.useState({
    period: "2026-T3",
    amount: "695",
    paymentDate: "2026-11-03",
    paymentMethod: "telepaiement" as const,
    referenceNumber: "DGI-REC-2026-8891",
    notes: "",
  });

  const [newCNSSPayForm, setNewCNSSPayForm] = React.useState({
    period: "2026-T4",
    amount: "600",
    paymentDate: "2026-11-03",
    paymentMethod: "macnss_online" as const,
    referenceNumber: "CNSS-TNG-2026-4412",
    receiptDocName: "Quittance_CNSS_T4_2026.pdf",
    notes: "",
  });

  const [newWithholdingForm, setNewWithholdingForm] = React.useState({
    payerName: "",
    payerICE: "",
    payerType: "agence_immobiliere" as const,
    transactionRef: "TRX-2026-018",
    grossAmount: "",
    withheldAmount: "0",
    date: "2026-11-03",
    legalBasis: "Partage d'honoraires sans RAS auto-entrepreneur",
    certificateStatus: "received_verified" as const,
    notes: "",
  });

  // Calculate Aggregates
  const totalTurnoverCollected = DEMO_FINANCIAL_SUMMARY.commissionsCollectedYTD; // 218 750 MAD
  const totalTaxPaid = taxPayments.reduce((acc, p) => acc + p.amount, 0); // 1315 MAD
  const taxCalc = calculateMoroccanTax(
    totalTurnoverCollected,
    totalTaxPaid,
    taxProfile.activityCategory,
    taxProfile.applicableIRRate,
    taxProfile.annualCeilingMAD
  );

  const totalCNSSPaid = contributions.filter((c) => c.status === "paid").reduce((acc, c) => acc + c.amountPaid, 0); // 1800 MAD
  const cnssCalc = calculateMoroccanCNSS(totalCNSSPaid, 4, cnssProfile.quarterlyAmount);

  // Toast trigger helper
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Handler: Save New Declaration
  const handleSaveDeclaration = (e: React.FormEvent) => {
    e.preventDefault();
    const turnover = parseFloat(newDeclForm.turnoverDeclared) || 0;
    const rate = taxProfile.applicableIRRate;
    const taxCalcAmount = Math.round(turnover * rate * 100) / 100;

    const newDecl: TaxDeclarationRecord = {
      id: `decl-${Date.now()}`,
      fiscalYear: taxProfile.fiscalYear,
      period: newDeclForm.period,
      periodLabel: newDeclForm.periodLabel,
      turnoverDeclared: turnover,
      taxRate: rate,
      taxCalculated: taxCalcAmount,
      amountPaid: 0,
      dueDate: newDeclForm.dueDate,
      status: "ready_to_submit",
      notes: newDeclForm.notes,
    };

    setDeclarations([newDecl, ...declarations]);
    setShowDeclModal(false);
    triggerToast(`Déclaration pour ${newDecl.periodLabel} enregistrée. Montant calculé : ${formatMAD(taxCalcAmount)}.`);
  };

  // Handler: Record Tax Payment
  const handleRecordTaxPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(newTaxPayForm.amount) || 0;
    if (amt <= 0) return;

    const newPayment: TaxPaymentRecord = {
      id: `pay-tax-${Date.now()}`,
      period: newTaxPayForm.period,
      amount: amt,
      paymentDate: newTaxPayForm.paymentDate,
      paymentMethod: newTaxPayForm.paymentMethod,
      referenceNumber: newTaxPayForm.referenceNumber,
      notes: newTaxPayForm.notes,
      status: "completed",
    };

    setTaxPayments([newPayment, ...taxPayments]);

    // Update associated declaration status
    setDeclarations((prev) =>
      prev.map((d) => {
        if (d.period === newTaxPayForm.period) {
          return {
            ...d,
            amountPaid: d.amountPaid + amt,
            paymentDate: newTaxPayForm.paymentDate,
            receiptNumber: newTaxPayForm.referenceNumber,
            status: "paid",
          };
        }
        return d;
      })
    );

    // Update calendar event if present
    setCalendarEvents((prev) =>
      prev.map((evt) => (evt.category === "tax_declaration" && evt.dueDate === "2026-11-30" ? { ...evt, status: "completed" } : evt))
    );

    setShowTaxPayModal(false);
    triggerToast(`Quittance de paiement d'IR (${formatMAD(amt)}) enregistrée. Statut DGI mis à jour !`);
  };

  // Handler: Record CNSS Payment
  const handleRecordCNSSPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(newCNSSPayForm.amount) || 0;
    if (amt <= 0) return;

    setContributions((prev) =>
      prev.map((c) => {
        if (c.period === newCNSSPayForm.period) {
          return {
            ...c,
            amountPaid: amt,
            paymentDate: newCNSSPayForm.paymentDate,
            paymentMethod: newCNSSPayForm.paymentMethod,
            referenceNumber: newCNSSPayForm.referenceNumber,
            receiptDocName: newCNSSPayForm.receiptDocName,
            status: "paid",
          };
        }
        return c;
      })
    );

    // Update calendar
    setCalendarEvents((prev) =>
      prev.map((evt) => (evt.category === "cnss_contribution" && evt.dueDate === "2026-12-31" ? { ...evt, status: "completed" } : evt))
    );

    setShowCNSSPayModal(false);
    triggerToast(`Paiement de cotisation AMO (${formatMAD(amt)}) validé sur le portail MaCNSS.`);
  };

  // Handler: Record Withholding
  const handleSaveWithholding = (e: React.FormEvent) => {
    e.preventDefault();
    const gross = parseFloat(newWithholdingForm.grossAmount) || 0;
    const withheld = parseFloat(newWithholdingForm.withheldAmount) || 0;

    const newRecord: WithholdingRecord = {
      id: `wth-${Date.now()}`,
      payerName: newWithholdingForm.payerName,
      payerICE: newWithholdingForm.payerICE,
      payerType: newWithholdingForm.payerType,
      transactionRef: newWithholdingForm.transactionRef,
      grossAmount: gross,
      withheldAmount: withheld,
      netReceived: gross - withheld,
      date: newWithholdingForm.date,
      legalBasis: newWithholdingForm.legalBasis,
      certificateStatus: newWithholdingForm.certificateStatus,
      fiscalYear: taxProfile.fiscalYear,
      notes: newWithholdingForm.notes,
    };

    setWithholdings([newRecord, ...withholdings]);
    setShowWithholdingModal(false);
    triggerToast(`Opération avec ${newRecord.payerName} consignée dans le registre des retenues.`);
  };

  // Handler: Send / Preview Automated Email
  const triggerEmailSimulation = (type: "tax_declaration" | "cnss_due" | "ceiling_alert") => {
    let email;
    if (type === "tax_declaration") {
      email = generateComplianceEmailTemplate("tax_declaration", {
        recipientName: taxProfile.fullName,
        period: "3ème Trimestre 2026 (T3)",
        deadline: "30 Novembre 2026",
        amount: 695,
      });
    } else if (type === "cnss_due") {
      email = generateComplianceEmailTemplate("cnss_due", {
        recipientName: taxProfile.fullName,
        period: "4ème Trimestre 2026 (T4)",
        deadline: "31 Décembre 2026",
        amount: 600,
      });
    } else {
      email = generateComplianceEmailTemplate("ceiling_alert", {
        recipientName: taxProfile.fullName,
        turnover: totalTurnoverCollected,
        ceilingConsumedPct: taxCalc.ceilingConsumedPct,
      });
    }

    setEmailSimulationData(email);
    setShowEmailSimModal(true);
  };

  // Single client concentration analysis from demo commissions
  const clientTurnoverMap: Record<string, { total: number; transactions: number; payerType: string }> = {
    "Karim El Idrissi (Acquéreur & Investisseur)": { total: 36250, transactions: 2, payerType: "Particulier Investisseur" },
    "Tanger Immo Prestige SARL (Agence partenaire)": { total: 17500, transactions: 1, payerType: "Agence Immobilière" },
    "Samir Kadiri (Vendeur)": { total: 15000, transactions: 1, payerType: "Particulier Vendeur" },
    "Société Foncière Détroit SARL": { total: 25000, transactions: 1, payerType: "Personne Morale" },
    "Autres clients particuliers cumulés": { total: 125000, transactions: 5, payerType: "Divers Acquéreurs" },
  };

  // Monthly turnover chart dataset
  const turnoverHistoryData = [
    { period: "Jan 26", turnover: 15000, taxDue: 150, amo: 200 },
    { period: "Fév 26", turnover: 22500, taxDue: 225, amo: 200 },
    { period: "Mar 26", turnover: 18000, taxDue: 180, amo: 200 },
    { period: "Avr 26", turnover: 32000, taxDue: 320, amo: 200 },
    { period: "Mai 26", turnover: 25000, taxDue: 250, amo: 200 },
    { period: "Juin 26", turnover: 19000, taxDue: 190, amo: 200 },
    { period: "Juil 26", turnover: 28500, taxDue: 285, amo: 200 },
    { period: "Août 26", turnover: 12000, taxDue: 120, amo: 200 },
    { period: "Sep 26", turnover: 29000, taxDue: 290, amo: 200 },
    { period: "Oct 26", turnover: 17750, taxDue: 177.5, amo: 200 },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3.5 rounded-[var(--radius-sm)] bg-[var(--success-subtle)] border border-[var(--success)] text-xs text-[var(--success)] flex items-center gap-2 shadow-sm animate-in fade-in duration-200">
          <CheckCircle2 size={16} className="shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
              Fiscalité & Protection Sociale
            </h1>
            <Badge variant="outline" className="border-[var(--accent)] text-[var(--accent)]">
              Maroc • CGI Art. 40 bis & Loi 98-15
            </Badge>
          </div>
          <p className="text-xs text-[var(--muted)] mt-1">
            Système d'aide à la conformité pour agent immobilier indépendant • Auto-Entrepreneur Tanger (MAD)
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Send size={13} />}
            onClick={() => triggerEmailSimulation("tax_declaration")}
          >
            Tester Notification Email
          </Button>

          <Button
            size="sm"
            variant="default"
            leftIcon={<Plus size={14} />}
            onClick={() => setShowDeclModal(true)}
          >
            Nouvelle déclaration
          </Button>
        </div>
      </div>

      {/* Primary Section Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] text-xs overflow-x-auto">
        {[
          { id: "overview", label: "Vue d'ensemble Conformité", icon: Shield },
          { id: "fiscalite", label: "Fiscalité (Impôt & Recettes)", icon: Calculator },
          { id: "cnss", label: "CNSS & Couverture AMO", icon: HeartPulseIcon },
          { id: "calendar", label: "Calendrier des Échéances", icon: Calendar },
          { id: "notifications", label: "Centre de Notifications", icon: Bell },
          { id: "analytics", label: "Analytique & Graphiques", icon: TrendingUp },
          { id: "documents", label: "Justificatifs & Quittances", icon: FileText },
          { id: "settings", label: "Paramètres & Barèmes", icon: Sliders },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-[var(--radius-sm)] font-medium transition-all shrink-0 ${
              activeTab === tab.id
                ? "bg-[var(--accent)] text-white shadow-xs"
                : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--border-subtle)]"
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW (SHARED COMPLIANCE DASHBOARD) */}
      {/* ========================================================================= */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Important Legal Banner */}
          <div className="p-4 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-subtle)] text-[var(--accent)] shrink-0">
                <Info size={16} />
              </div>
              <div>
                <p className="font-semibold text-[var(--foreground)]">
                  Statut de Conformité Fiscale & Sociale de l'Exercice {taxProfile.fiscalYear}
                </p>
                <p className="text-[var(--muted)] mt-0.5">
                  Prestations de services immobiliers • Taux d'IR libératoire : 1% sur encaissements • AMO trimestrielle : 600 MAD
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a href="https://www.rnve.ma" target="_blank" rel="noreferrer">
                <Button size="sm" variant="outline" rightIcon={<ExternalLink size={12} />}>
                  Portail DGI RNVE
                </Button>
              </a>
              <a href="https://www.macnss.ma" target="_blank" rel="noreferrer">
                <Button size="sm" variant="outline" rightIcon={<ExternalLink size={12} />}>
                  Portail MaCNSS
                </Button>
              </a>
            </div>
          </div>

          {/* 6 Top Summary KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {/* Fiscalité: Tax Paid vs Due */}
            <div className="p-4 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] space-y-2">
              <div className="flex items-center justify-between text-xs text-[var(--muted)]">
                <span className="font-semibold uppercase tracking-wider">Impôt sur le Revenu (IR 1%)</span>
                <Badge variant="outline">Estimé</Badge>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-[var(--foreground)]">
                  {formatMAD(taxCalc.estimatedTax)}
                </span>
                <span className="text-xs text-[var(--success)] font-medium">
                  {formatMAD(taxCalc.taxPaid)} acquitté
                </span>
              </div>
              <div className="text-[11px] text-[var(--muted)] flex items-center justify-between pt-1 border-t border-[var(--border)]">
                <span>Reste prévisionnel dû :</span>
                <span className="font-bold text-[var(--accent)]">{formatMAD(taxCalc.taxRemainingDue)}</span>
              </div>
            </div>

            {/* Fiscalité: Annual Ceiling */}
            <div className="p-4 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] space-y-2">
              <div className="flex items-center justify-between text-xs text-[var(--muted)]">
                <span className="font-semibold uppercase tracking-wider">Plafond Chiffre d'Affaires</span>
                <Badge variant={taxCalc.ceilingConsumedPct > 80 ? "warning" : "success"}>
                  {taxCalc.ceilingConsumedPct.toFixed(1)}%
                </Badge>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-[var(--foreground)]">
                  {formatMAD(taxCalc.grossTurnover)}
                </span>
                <span className="text-xs text-[var(--muted)]">/ 500 000 MAD</span>
              </div>
              <div className="text-[11px] text-[var(--muted)] flex items-center justify-between pt-1 border-t border-[var(--border)]">
                <span>Marge légale restante :</span>
                <span className="font-bold text-[var(--success)]">{formatMAD(taxCalc.ceilingRemaining)}</span>
              </div>
            </div>

            {/* Next Declaration Deadline */}
            <div className="p-4 rounded-[var(--radius)] border-l-4 border-l-[var(--warning)] border border-[var(--border)] bg-[var(--surface)] space-y-2">
              <div className="flex items-center justify-between text-xs text-[var(--muted)]">
                <span className="font-semibold uppercase tracking-wider">Prochaine Échéance Fiscale</span>
                <Badge variant="warning">30 Nov 2026</Badge>
              </div>
              <div className="text-sm font-bold text-[var(--foreground)]">
                Déclaration Trimestre 3 (T3)
              </div>
              <p className="text-xs text-[var(--muted)]">
                Chiffre d'affaires T3 : <strong>69 500 MAD</strong> → IR calculé : <strong>695 MAD</strong>
              </p>
              <div className="pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-xs h-7"
                  onClick={() => setShowTaxPayModal(true)}
                >
                  Enregistrer le télépaiement DGI
                </Button>
              </div>
            </div>

            {/* CNSS: Contributions */}
            <div className="p-4 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] space-y-2">
              <div className="flex items-center justify-between text-xs text-[var(--muted)]">
                <span className="font-semibold uppercase tracking-wider">Cotisations AMO (TNS)</span>
                <Badge variant="success">À jour</Badge>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-[var(--success)]">
                  {formatMAD(cnssCalc.contributionsPaidThisYear)}
                </span>
                <span className="text-xs text-[var(--muted)]">/ {formatMAD(cnssCalc.contributionsDueThisYear)} an</span>
              </div>
              <div className="text-[11px] text-[var(--muted)] flex items-center justify-between pt-1 border-t border-[var(--border)]">
                <span>Solde T4 exigible fin décembre :</span>
                <span className="font-bold text-[var(--foreground)]">{formatMAD(cnssCalc.contributionsRemainingDue)}</span>
              </div>
            </div>

            {/* AMO Coverage Status */}
            <div className="p-4 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] space-y-2">
              <div className="flex items-center justify-between text-xs text-[var(--muted)]">
                <span className="font-semibold uppercase tracking-wider">Couverture Médicale AMO</span>
                <Badge variant="success">Active</Badge>
              </div>
              <div className="text-sm font-bold text-[var(--foreground)]">
                Assuré + 2 Ayants droit
              </div>
              <p className="text-xs text-[var(--muted)]">
                N° CNSS : <strong>{cnssProfile.cnssNumber}</strong> • Tiers-payant & pharmacie ouverts.
              </p>
              <div className="pt-1 flex items-center justify-between text-[11px] text-[var(--muted)]">
                <span>Dernière quittance : T3 validé</span>
                <span className="text-[var(--success)] font-medium">Aucun arriéré</span>
              </div>
            </div>

            {/* Single Client Risk Tracker */}
            <div className="p-4 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] space-y-2">
              <div className="flex items-center justify-between text-xs text-[var(--muted)]">
                <span className="font-semibold uppercase tracking-wider">Concentration Clientèle</span>
                <Badge variant="success">Conforme (&lt;50%)</Badge>
              </div>
              <div className="text-sm font-bold text-[var(--foreground)]">
                Client max : 16.5% du CA
              </div>
              <p className="text-xs text-[var(--muted)]">
                Karim El Idrissi (36 250 MAD). Aucun risque de dépendance économique fiscale.
              </p>
              <div className="pt-1 text-[11px] text-[var(--muted)]">
                Seuil d'alerte DGI : 50% sur un même donneur d'ordre
              </div>
            </div>
          </div>

          {/* Priority Action Center */}
          <Card>
            <CardHeader className="pb-3 border-b border-[var(--border)]">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle size={16} className="text-[var(--warning)]" />
                    Centre d'Actions Requises (Conformité Immédiate)
                  </CardTitle>
                  <CardDescription>
                    Obligations administratives, déclaratives et financières à traiter
                  </CardDescription>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--accent-subtle)] text-[var(--accent)]">
                  {dynamicCalendarEvents.filter((e) => e.status !== "paye" && e.status !== "declare" && e.status !== "termine").length} en attente
                </span>
              </div>
            </CardHeader>
            <CardContent className="divide-y divide-[var(--border)] p-0">
              {dynamicCalendarEvents.slice(0, 5).map((evt) => {
                const isCompleted = evt.status === "paye" || evt.status === "declare" || evt.status === "termine";
                return (
                <div
                  key={evt.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-[var(--border-subtle)] transition-colors text-xs"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="mt-0.5 shrink-0">
                      {isCompleted ? (
                        <CheckCircle2 size={16} className="text-[var(--success)]" />
                      ) : evt.priority === "urgent" ? (
                        <AlertTriangle size={16} className="text-[var(--danger)]" />
                      ) : (
                        <Clock size={16} className="text-[var(--warning)]" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-[var(--foreground)]">{evt.title}</span>
                        <Badge variant={isCompleted ? "success" : evt.priority === "urgent" ? "danger" : "warning"}>
                          {isCompleted ? "Réalisé" : `Échéance : ${evt.dueDate}`}
                        </Badge>
                        <span className="text-[11px] text-[var(--muted)] font-medium">({evt.daysRemainingLabel})</span>
                      </div>
                      <p className="text-[var(--muted)] mt-0.5 leading-relaxed">{evt.description}</p>
                      {evt.legalReference && (
                        <p className="text-[10px] text-[var(--accent)] mt-0.5">
                          {evt.legalReference} ({evt.legalArticle})
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {evt.amountDue && (
                      <span className="font-bold text-[var(--foreground)] text-xs mr-2">
                        {formatMAD(evt.amountDue)}
                      </span>
                    )}
                    {evt.eventType === "tax_declaration" && !isCompleted && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => {
                          setNewDeclForm((prev) => ({ ...prev, period: evt.period || "2026-T3" }));
                          setShowDeclModal(true);
                        }}
                      >
                        Déclarer
                      </Button>
                    )}
                    {evt.eventType === "tax_payment" && !isCompleted && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => {
                          setNewTaxPayForm((prev) => ({ ...prev, period: evt.period || "2026-T3" }));
                          setShowTaxPayModal(true);
                        }}
                      >
                        Payer l'IR
                      </Button>
                    )}
                    {evt.eventType === "cnss_contribution" && !isCompleted && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setNewCNSSPayForm((prev) => ({ ...prev, period: evt.period || "2026-T4" }));
                          setShowCNSSPayModal(true);
                        }}
                      >
                        Régler AMO
                      </Button>
                    )}
                    {evt.eventType === "threshold_review" && (
                      <Button size="sm" variant="ghost" onClick={() => { setActiveTab("fiscalite"); setFiscaliteSubTab("turnover"); }}>
                        Examiner
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
            </CardContent>
          </Card>

          {/* Quick Dual Graph: Turnover Growth vs Cumulative Tax & CNSS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Chiffre d'Affaires Mensuel Encaissé (2026)</CardTitle>
                <CardDescription className="text-xs">Base de calcul de l'IR libératoire au taux de 1%</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[240px] w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={turnoverHistoryData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.6} />
                      <XAxis dataKey="period" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "var(--muted)" }} />
                      <YAxis tickLine={false} axisLine={false} tickFormatter={(val) => `${val / 1000}k`} tick={{ fontSize: 10, fill: "var(--muted)" }} />
                      <Tooltip formatter={(val: any) => [formatMAD(val), "CA perçu"]} />
                      <Bar dataKey="turnover" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Évolution des Charges Fiscales & Sociales (MAD)</CardTitle>
                <CardDescription className="text-xs">Cotisations AMO trimestrielles vs IR libératoire</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[240px] w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={turnoverHistoryData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.6} />
                      <XAxis dataKey="period" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "var(--muted)" }} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "var(--muted)" }} />
                      <Tooltip formatter={(val: any) => [formatMAD(val)]} />
                      <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "5px" }} />
                      <Line type="monotone" dataKey="taxDue" name="IR 1% calculé" stroke="var(--accent)" strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="amo" name="Part AMO mensuelle" stroke="var(--success)" strokeWidth={2} strokeDasharray="3 3" dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: FISCALITÉ (INCOME TAX, TURNOVER, DECLARATIONS, WITHHOLDING) */}
      {/* ========================================================================= */}
      {activeTab === "fiscalite" && (
        <div className="space-y-6">
          {/* Sub Navigation */}
          <div className="flex items-center gap-1 border-b border-[var(--border)] pb-2 overflow-x-auto text-xs font-medium">
            {[
              { id: "dashboard", label: "Tableau de Bord Fiscal" },
              { id: "turnover", label: "Suivi du Chiffre d'Affaires & Clients" },
              { id: "calculator", label: "Simulateur Transparent d'IR" },
              { id: "declarations", label: "Registre des Déclarations" },
              { id: "withholding", label: "Retenues à la Source (RAS)" },
              { id: "payments", label: "Historique des Règlements DGI" },
              { id: "rules", label: "Règles Légales Versionnées" },
            ].map((sub) => (
              <button
                key={sub.id}
                onClick={() => setFiscaliteSubTab(sub.id as any)}
                className={`px-3 py-1.5 rounded-[var(--radius-sm)] transition-colors whitespace-nowrap ${
                  fiscaliteSubTab === sub.id
                    ? "bg-[var(--border-subtle)] text-[var(--accent)] font-bold border border-[var(--border)]"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>

          {/* SubTab 2.1: Tax Dashboard */}
          {fiscaliteSubTab === "dashboard" && (
            <div className="space-y-6">
              {/* Profile Card */}
              <Card>
                <CardHeader className="pb-3 border-b border-[var(--border)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm">Fiche Signalétique Fiscale de l'Agent</CardTitle>
                      <CardDescription className="text-xs">
                        Données d'enregistrement officiel auprès de la Direction Générale des Impôts (DGI)
                      </CardDescription>
                    </div>
                    <Badge variant="success">Vérifié & Conforme</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-2.5 rounded-[var(--radius-sm)] bg-[var(--background)] border border-[var(--border)]">
                      <span className="text-[var(--muted)] block">N° Auto-Entrepreneur (RNVE)</span>
                      <span className="font-mono font-bold text-[var(--foreground)]">{taxProfile.aeNumber}</span>
                    </div>
                    <div className="p-2.5 rounded-[var(--radius-sm)] bg-[var(--background)] border border-[var(--border)]">
                      <span className="text-[var(--muted)] block">Identifiant Fiscal (IF)</span>
                      <span className="font-mono font-bold text-[var(--foreground)]">{taxProfile.ifNumber}</span>
                    </div>
                    <div className="p-2.5 rounded-[var(--radius-sm)] bg-[var(--background)] border border-[var(--border)]">
                      <span className="text-[var(--muted)] block">ICE (Identifiant Entreprise)</span>
                      <span className="font-mono font-bold text-[var(--foreground)]">{taxProfile.ice}</span>
                    </div>
                    <div className="p-2.5 rounded-[var(--radius-sm)] bg-[var(--background)] border border-[var(--border)]">
                      <span className="text-[var(--muted)] block">Taxe Professionnelle (Patente)</span>
                      <span className="font-mono font-bold text-[var(--foreground)]">{taxProfile.patente}</span>
                    </div>
                  </div>

                  <div className="mt-3 p-3 rounded-[var(--radius-sm)] bg-[var(--border-subtle)] text-xs text-[var(--foreground)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <span className="font-bold">Centre des Impôts de rattachement : </span>
                      <span>{taxProfile.taxAuthorityOffice}</span>
                    </div>
                    <span className="text-[var(--muted)] text-[11px]">
                      Dernière vérification annuelle : {taxProfile.lastVerifiedDate}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Ceiling Progress Meter */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm">Consommation du Plafond de Recettes ({taxProfile.fiscalYear})</CardTitle>
                      <CardDescription className="text-xs">
                        Plafond annuel de 500 000 MAD applicable aux prestations de services
                      </CardDescription>
                    </div>
                    <span className="text-xs font-bold text-[var(--accent)]">
                      {taxCalc.ceilingConsumedPct.toFixed(1)}% atteint
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="w-full bg-[var(--border)] rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-[var(--accent)] h-full transition-all duration-300"
                      style={{ width: `${taxCalc.ceilingConsumedPct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--muted)]">
                      Encaissé : <strong className="text-[var(--foreground)]">{formatMAD(taxCalc.grossTurnover)}</strong>
                    </span>
                    <span className="text-[var(--muted)]">
                      Marge restante : <strong className="text-[var(--success)]">{formatMAD(taxCalc.ceilingRemaining)}</strong>
                    </span>
                    <span className="text-[var(--muted)]">
                      Plafond légal : <strong>{formatMAD(taxCalc.annualCeiling)}</strong>
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* SubTab 2.2: Turnover Tracking */}
          {fiscaliteSubTab === "turnover" && (
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-3 border-b border-[var(--border)]">
                  <CardTitle className="text-sm">Chiffre d'Affaires par Donneur d'Ordre & Seuil de Concentration</CardTitle>
                  <CardDescription className="text-xs">
                    Surveillance du seuil de 50% par client pour préserver l'indépendance de statut (Recommandation Fiscale DGI)
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-[var(--border)] bg-[var(--background)] text-[var(--muted)]">
                          <th className="p-3.5 font-semibold">Client / Agence Partenaire</th>
                          <th className="p-3.5 font-semibold">Type de Donneur d'Ordre</th>
                          <th className="p-3.5 font-semibold">Transactions</th>
                          <th className="p-3.5 font-semibold">Total Honoraires Perçus</th>
                          <th className="p-3.5 font-semibold">Part dans le CA Annuel</th>
                          <th className="p-3.5 font-semibold">Statut Risque</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border)]">
                        {Object.entries(clientTurnoverMap).map(([client, info]) => {
                          const pct = (info.total / totalTurnoverCollected) * 100;
                          const isWarning = pct >= 50;

                          return (
                            <tr key={client} className="hover:bg-[var(--border-subtle)] transition-colors">
                              <td className="p-3.5 font-semibold text-[var(--foreground)]">{client}</td>
                              <td className="p-3.5 text-[var(--muted)]">{info.payerType}</td>
                              <td className="p-3.5 font-mono">{info.transactions}</td>
                              <td className="p-3.5 font-bold text-[var(--foreground)]">{formatMAD(info.total)}</td>
                              <td className="p-3.5">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold">{pct.toFixed(1)}%</span>
                                  <div className="w-16 bg-[var(--border)] h-1.5 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full ${isWarning ? "bg-[var(--danger)]" : "bg-[var(--accent)]"}`}
                                      style={{ width: `${Math.min(100, pct)}%` }}
                                    />
                                  </div>
                                </div>
                              </td>
                              <td className="p-3.5">
                                <Badge variant={isWarning ? "danger" : "success"}>
                                  {isWarning ? "Vigilance (>50%)" : "Conforme"}
                                </Badge>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* SubTab 2.3: Transparent Tax Calculator */}
          {fiscaliteSubTab === "calculator" && (
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-3 border-b border-[var(--border)]">
                  <CardTitle className="text-sm">Simulateur & Moteur de Calcul d'IR Libératoire</CardTitle>
                  <CardDescription className="text-xs">
                    Traçabilité complète des formules, des références légales du CGI et des taux effectifs
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Input
                      label="Chiffre d'Affaires Brut Encaissé (MAD)"
                      type="number"
                      value={simTurnover}
                      onChange={(e) => setSimTurnover(e.target.value)}
                    />
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[var(--foreground)]">
                        Catégorie d'Activité
                      </label>
                      <select
                        value={simActivity}
                        onChange={(e: any) => setSimActivity(e.target.value)}
                        className="w-full h-9 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 text-xs"
                      >
                        <option value="services">Services / Agences Immobilières (1%)</option>
                        <option value="commerce_industrie">Activités Commerciales / Vente (0.5%)</option>
                      </select>
                    </div>
                    <Input
                      label="Taux applicable simulé"
                      value={simCustomRate}
                      onChange={(e) => setSimCustomRate(e.target.value)}
                    />
                  </div>

                  {/* Calculation Result Breakdown Card */}
                  {(() => {
                    const parsedVal = parseFloat(simTurnover) || 0;
                    const parsedRate = parseFloat(simCustomRate) || 0.01;
                    const result = calculateMoroccanTax(parsedVal, 0, simActivity, parsedRate);

                    return (
                      <div className="p-4 rounded-[var(--radius)] bg-[var(--background)] border border-[var(--border)] space-y-4 text-xs">
                        <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
                          <span className="font-bold text-sm text-[var(--foreground)]">
                            Résultat de la Décomposition Légale
                          </span>
                          <Badge variant="outline">{result.auditTrail.article}</Badge>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div>
                            <span className="text-[var(--muted)] block">Recettes Brutes :</span>
                            <span className="font-bold text-sm text-[var(--foreground)]">{formatMAD(result.grossTurnover)}</span>
                          </div>
                          <div>
                            <span className="text-[var(--muted)] block">Base Imposable Retenue :</span>
                            <span className="font-bold text-sm text-[var(--foreground)]">{formatMAD(result.taxableBase)}</span>
                          </div>
                          <div>
                            <span className="text-[var(--muted)] block">Taux Liquidé :</span>
                            <span className="font-bold text-sm text-[var(--accent)]">{(result.appliedRate * 100).toFixed(2)}%</span>
                          </div>
                          <div>
                            <span className="text-[var(--muted)] block">Montant IR Estimé :</span>
                            <span className="font-bold text-base text-[var(--accent)]">{formatMAD(result.estimatedTax)}</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-[var(--border)] text-[11px] text-[var(--muted)] space-y-1">
                          <p><strong>Référence officielle :</strong> {result.auditTrail.legalReference}</p>
                          <p><strong>Formule appliquée :</strong> MIN(Chiffre d'Affaires Encaissé, {formatMAD(result.annualCeiling)}) × {(result.appliedRate * 100).toFixed(2)}%</p>
                          <p className="text-[var(--warning)] font-medium">{result.disclaimer}</p>
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </div>
          )}

          {/* SubTab 2.4: Declarations Register */}
          {fiscaliteSubTab === "declarations" && (
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-3 border-b border-[var(--border)] flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-sm">Registre des Déclarations Trimestrielles</CardTitle>
                    <CardDescription className="text-xs">
                      Suivi des bordereaux télé-déclarés auprès de l'administration fiscale
                    </CardDescription>
                  </div>
                  <Button size="sm" onClick={() => setShowDeclModal(true)} leftIcon={<Plus size={13} />}>
                    Créer une déclaration
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-[var(--border)] bg-[var(--background)] text-[var(--muted)]">
                          <th className="p-3.5 font-semibold">Période</th>
                          <th className="p-3.5 font-semibold">Recettes déclarées</th>
                          <th className="p-3.5 font-semibold">Taux</th>
                          <th className="p-3.5 font-semibold">IR Liquidé</th>
                          <th className="p-3.5 font-semibold">Montant payé</th>
                          <th className="p-3.5 font-semibold">Échéance</th>
                          <th className="p-3.5 font-semibold">Statut</th>
                          <th className="p-3.5 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border)]">
                        {declarations.map((decl) => (
                          <tr key={decl.id} className="hover:bg-[var(--border-subtle)] transition-colors">
                            <td className="p-3.5 font-semibold text-[var(--foreground)]">{decl.periodLabel}</td>
                            <td className="p-3.5 font-bold">{formatMAD(decl.turnoverDeclared)}</td>
                            <td className="p-3.5 font-mono">{(decl.taxRate * 100).toFixed(1)}%</td>
                            <td className="p-3.5 font-bold text-[var(--accent)]">{formatMAD(decl.taxCalculated)}</td>
                            <td className="p-3.5 font-bold text-[var(--success)]">{formatMAD(decl.amountPaid)}</td>
                            <td className="p-3.5 text-[var(--muted)]">{decl.dueDate}</td>
                            <td className="p-3.5">
                              <Badge variant={decl.status === "paid" ? "success" : decl.status === "ready_to_submit" ? "warning" : "muted"}>
                                {decl.status === "paid" ? "Payé & Quittancé" : decl.status === "ready_to_submit" ? "Prêt à payer" : "Brouillon"}
                              </Badge>
                            </td>
                            <td className="p-3.5 text-right">
                              {decl.status !== "paid" ? (
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => {
                                    setNewTaxPayForm({
                                      ...newTaxPayForm,
                                      period: decl.period,
                                      amount: decl.taxCalculated.toString(),
                                    });
                                    setShowTaxPayModal(true);
                                  }}
                                >
                                  Enregistrer quittance
                                </Button>
                              ) : (
                                <span className="text-[11px] text-[var(--muted)] font-mono">{decl.referenceNumber || "Réf DGI"}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* SubTab 2.5: Withholding Tax Register */}
          {fiscaliteSubTab === "withholding" && (
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-3 border-b border-[var(--border)] flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-sm">Registre des Retenues à la Source (RAS)</CardTitle>
                    <CardDescription className="text-xs">
                      Enregistrement des éventuelles retenues opérées par les personnes morales clientes
                    </CardDescription>
                  </div>
                  <Button size="sm" onClick={() => setShowWithholdingModal(true)} leftIcon={<Plus size={13} />}>
                    Ajouter une opération
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-[var(--border)] bg-[var(--background)] text-[var(--muted)]">
                          <th className="p-3.5 font-semibold">Organisme / Payer</th>
                          <th className="p-3.5 font-semibold">Affaire liée</th>
                          <th className="p-3.5 font-semibold">Montant Brut</th>
                          <th className="p-3.5 font-semibold">Montant Retenu</th>
                          <th className="p-3.5 font-semibold">Net Reçu</th>
                          <th className="p-3.5 font-semibold">Date</th>
                          <th className="p-3.5 font-semibold">Certificat</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border)]">
                        {withholdings.map((w) => (
                          <tr key={w.id} className="hover:bg-[var(--border-subtle)] transition-colors">
                            <td className="p-3.5 font-semibold text-[var(--foreground)]">{w.payerName}</td>
                            <td className="p-3.5 text-[var(--muted)]">{w.transactionRef}</td>
                            <td className="p-3.5 font-bold">{formatMAD(w.grossAmount)}</td>
                            <td className="p-3.5 font-bold text-[var(--danger)]">{formatMAD(w.withheldAmount)}</td>
                            <td className="p-3.5 font-bold text-[var(--success)]">{formatMAD(w.netReceived)}</td>
                            <td className="p-3.5 text-[var(--muted)]">{w.date}</td>
                            <td className="p-3.5">
                              <Badge variant={w.certificateStatus === "received_verified" ? "success" : "warning"}>
                                {w.certificateStatus === "received_verified" ? "Certifié" : "En attente"}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* SubTab 2.6: Tax Payments Ledger */}
          {fiscaliteSubTab === "payments" && (
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-3 border-b border-[var(--border)]">
                  <CardTitle className="text-sm">Livre Journal des Quittances & Règlements d'Impôt</CardTitle>
                  <CardDescription className="text-xs">
                    Traçabilité de tous les paiements d'IR transférés au Trésor Général du Royaume (TGR / DGI)
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-[var(--border)] bg-[var(--background)] text-[var(--muted)]">
                          <th className="p-3.5 font-semibold">Identifiant</th>
                          <th className="p-3.5 font-semibold">Trimestre</th>
                          <th className="p-3.5 font-semibold">Montant Acquitté</th>
                          <th className="p-3.5 font-semibold">Date de Télépaiement</th>
                          <th className="p-3.5 font-semibold">Mode de Règlement</th>
                          <th className="p-3.5 font-semibold">N° de Quittance / Référence</th>
                          <th className="p-3.5 font-semibold">Statut</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border)]">
                        {taxPayments.map((p) => (
                          <tr key={p.id} className="hover:bg-[var(--border-subtle)] transition-colors">
                            <td className="p-3.5 font-mono text-[11px] text-[var(--muted)]">{p.id}</td>
                            <td className="p-3.5 font-semibold">{p.period}</td>
                            <td className="p-3.5 font-bold text-[var(--success)]">{formatMAD(p.amount)}</td>
                            <td className="p-3.5 text-[var(--muted)]">{p.paymentDate}</td>
                            <td className="p-3.5 capitalize">{p.paymentMethod}</td>
                            <td className="p-3.5 font-mono text-[11px] text-[var(--foreground)]">{p.referenceNumber}</td>
                            <td className="p-3.5"><Badge variant="success">Validé TGR</Badge></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* SubTab 2.7: Legal Rules Engine Registry */}
          {fiscaliteSubTab === "rules" && (
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3 border-b border-[var(--border)]">
                  <CardTitle className="text-sm">Référentiel des Textes Fiscaux Officiels (Versionnés)</CardTitle>
                  <CardDescription className="text-xs">
                    Règles juridiques actives utilisées par le moteur de calcul de RealtorOS
                  </CardDescription>
                </CardHeader>
                <CardContent className="divide-y divide-[var(--border)] p-0">
                  {OFFICIAL_TAX_RULES.map((rule) => (
                    <div key={rule.id} className="p-4 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-[var(--foreground)]">{rule.name}</span>
                        <Badge variant={rule.verificationStatus === "verified" ? "success" : "warning"}>
                          {rule.verificationStatus}
                        </Badge>
                      </div>
                      <p className="text-[var(--muted)]">{rule.description}</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] text-[var(--muted)]">
                        <div><strong>Réf :</strong> {rule.legalReference}</div>
                        <div><strong>Taux :</strong> {(rule.rate * 100).toFixed(2)}%</div>
                        <div><strong>Plafond :</strong> {formatMAD(rule.annualCeilingMAD)}</div>
                        <div><strong>Prise d'effet :</strong> {rule.effectiveFrom}</div>
                      </div>
                      <div className="pt-1 flex items-center justify-between text-[11px]">
                        <span className="text-[var(--muted)] italic">Note : {rule.reviewerNotes}</span>
                        <a href={rule.officialSourceUrl} target="_blank" rel="noreferrer" className="text-[var(--accent)] hover:underline inline-flex items-center gap-1">
                          Consulter CGI <ExternalLink size={11} />
                        </a>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CNSS & AMO SOCIAL PROTECTION */}
      {/* ========================================================================= */}
      {activeTab === "cnss" && (
        <div className="space-y-6">
          {/* Sub Navigation */}
          <div className="flex items-center gap-1 border-b border-[var(--border)] pb-2 overflow-x-auto text-xs font-medium">
            {[
              { id: "dashboard", label: "Tableau de Bord Protection Sociale" },
              { id: "calendar", label: "Calendrier Fiscal & Social" },
              { id: "profile", label: "Profil d'Affiliation & Ayants Droit" },
              { id: "calculator", label: "Calculateur de Cotisations TNS" },
              { id: "contributions", label: "Livre des Cotisations Trimestrielles" },
              { id: "amo_info", label: "AMO vs Retraite (Guide Pratique)" },
              { id: "rules", label: "Décrets & Règles CNSS" },
            ].map((sub) => (
              <button
                key={sub.id}
                onClick={() => setCnssSubTab(sub.id as any)}
                className={`px-3 py-1.5 rounded-[var(--radius-sm)] transition-colors whitespace-nowrap ${
                  cnssSubTab === sub.id
                    ? "bg-[var(--border-subtle)] text-[var(--accent)] font-bold border border-[var(--border)]"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>

          {/* CNSS Calendar Subtab */}
          {cnssSubTab === "calendar" && (
            <DynamicComplianceCalendar
              events={dynamicCalendarEvents}
              fiscalYear={taxProfile.fiscalYear}
              onDeclareClick={(period) => {
                setNewDeclForm((prev) => ({ ...prev, period }));
                setShowDeclModal(true);
              }}
              onPayClick={(period, type) => {
                if (type === "tax") {
                  setNewTaxPayForm((prev) => ({ ...prev, period }));
                  setShowTaxPayModal(true);
                } else {
                  setNewCNSSPayForm((prev) => ({ ...prev, period }));
                  setShowCNSSPayModal(true);
                }
              }}
              onAddCustomReminder={(rem) => {
                setCustomReminders((prev) => [rem, ...prev]);
                triggerToast(`Rappel "${rem.title}" ajouté au calendrier fiscal & social.`);
              }}
              onUpdateEventDeadline={(eventId, newDate, reason) => {
                setOverriddenDeadlines((prev) => ({ ...prev, [eventId]: { newDate, reason } }));
                triggerToast(`Échéance mise à jour pour le ${newDate} (Motif : ${reason}).`);
              }}
              onSnoozeEvent={(eventId, days) => {
                setSnoozedEvents((prev) => ({ ...prev, [eventId]: "snoozed" }));
                triggerToast(`Rappel reporté de ${days} jours.`);
              }}
              onMarkCompleted={(eventId) => {
                triggerToast(`Obligation marquée comme terminée.`);
              }}
              onTriggerEmailPreview={(evt) => {
                triggerEmailSimulation(evt.category === "fiscalite" ? "tax_declaration" : "cnss_due");
              }}
            />
          )}

          {/* CNSS Dashboard */}
          {cnssSubTab === "dashboard" && (
            <div className="space-y-6">
              {/* Profile Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 space-y-2">
                  <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider block">
                    Statut de Couverture AMO
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-[var(--success)]">Couvert & À Jour</span>
                    <Badge variant="success">Actif</Badge>
                  </div>
                  <p className="text-xs text-[var(--muted)]">
                    Immatriculation : <strong className="font-mono text-[var(--foreground)]">{cnssProfile.cnssNumber}</strong>
                  </p>
                </Card>

                <Card className="p-4 space-y-2">
                  <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider block">
                    Cotisations Acquittées (2026)
                  </span>
                  <div className="text-xl font-bold text-[var(--foreground)]">
                    {formatMAD(cnssCalc.contributionsPaidThisYear)}
                  </div>
                  <p className="text-xs text-[var(--muted)]">
                    3 trimestres réglés (T1, T2, T3) • Reste T4 : {formatMAD(cnssCalc.contributionsRemainingDue)}
                  </p>
                </Card>

                <Card className="p-4 space-y-2">
                  <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider block">
                    Ayants Droit Rattachés
                  </span>
                  <div className="text-xl font-bold text-[var(--accent)]">
                    {cnssProfile.dependantsCount} Personnes
                  </div>
                  <p className="text-xs text-[var(--muted)]">
                    Conjoint et enfant scolarisé bénéficiaires des prestations médicales
                  </p>
                </Card>
              </div>

              {/* Dynamic Calendar Shortcut Banner */}
              <div className="p-4 rounded-[var(--radius)] bg-purple-50/70 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-purple-600 text-white shrink-0">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[var(--foreground)] text-sm">
                      Calendrier Fiscal & Social Dynamique
                    </h4>
                    <p className="text-[var(--muted)] mt-0.5">
                      Visualisez l'échéancier complet de vos déclarations IR, cotisations AMO Loi 98-15 et rappels automatisés.
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => setCnssSubTab("calendar")}
                  className="shrink-0 text-xs"
                >
                  Ouvrir le calendrier
                </Button>
              </div>

              {/* Distinction Banner */}
              <div className="p-4 rounded-[var(--radius)] bg-[var(--surface)] border border-[var(--border)] space-y-2 text-xs">
                <h4 className="font-bold text-[var(--foreground)] flex items-center gap-2">
                  <Info size={15} className="text-[var(--accent)]" />
                  Rappel Légal : Pourquoi l'AMO ne crée pas de Retraite automatique ?
                </h4>
                <p className="text-[var(--muted)] leading-relaxed">
                  Au Maroc, pour les travailleurs non salariés (TNS et auto-entrepreneurs), la cotisation trimestrielle de 600 MAD relève de la <strong>Loi 98-15</strong> instituant l'Assurance Maladie Obligatoire. Elle finance la prise en charge des soins et hospitalisations. Les droits à la retraite relèvent de la <strong>Loi 99-15</strong> et nécessitent une démarche volontaire d'adhésion au régime de pension complémentaire.
                </p>
              </div>

              {/* Contributions Ledger preview */}
              <Card>
                <CardHeader className="pb-3 border-b border-[var(--border)] flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-sm">Cotisations Trimestrielles d'Assurance Maladie</CardTitle>
                    <CardDescription className="text-xs">Historique des échéances de l'exercice en cours</CardDescription>
                  </div>
                  <Button size="sm" onClick={() => setShowCNSSPayModal(true)} leftIcon={<Plus size={13} />}>
                    Enregistrer quittance AMO
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-[var(--border)] bg-[var(--background)] text-[var(--muted)]">
                          <th className="p-3.5 font-semibold">Période</th>
                          <th className="p-3.5 font-semibold">Montant exigible</th>
                          <th className="p-3.5 font-semibold">Montant acquitté</th>
                          <th className="p-3.5 font-semibold">Date de règlement</th>
                          <th className="p-3.5 font-semibold">Mode</th>
                          <th className="p-3.5 font-semibold">N° Référence</th>
                          <th className="p-3.5 font-semibold">Statut</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border)]">
                        {contributions.map((c) => (
                          <tr key={c.id} className="hover:bg-[var(--border-subtle)] transition-colors">
                            <td className="p-3.5 font-semibold">{c.periodLabel}</td>
                            <td className="p-3.5 font-bold">{formatMAD(c.amountExpected)}</td>
                            <td className="p-3.5 font-bold text-[var(--success)]">{formatMAD(c.amountPaid)}</td>
                            <td className="p-3.5 text-[var(--muted)]">{c.paymentDate || "—"}</td>
                            <td className="p-3.5 capitalize">{c.paymentMethod || "—"}</td>
                            <td className="p-3.5 font-mono text-[11px]">{c.referenceNumber || "En attente"}</td>
                            <td className="p-3.5">
                              <Badge variant={c.status === "paid" ? "success" : "warning"}>
                                {c.status === "paid" ? "Quittancé" : "Échéance 31 Déc"}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* CNSS Affiliation Profile */}
          {cnssSubTab === "profile" && (
            <Card>
              <CardHeader className="pb-3 border-b border-[var(--border)]">
                <CardTitle className="text-sm">Dossier d'Affiliation Professionnelle CNSS</CardTitle>
                <CardDescription className="text-xs">Informations administratives de votre compte Travailleur Non-Salarié</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)]">
                    <span className="text-[var(--muted)] block">N° Immatriculation CNSS</span>
                    <span className="font-mono font-bold text-sm">{cnssProfile.cnssNumber}</span>
                  </div>
                  <div className="p-3 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)]">
                    <span className="text-[var(--muted)] block">N° Dossier Affiliation TNS</span>
                    <span className="font-mono font-bold text-sm">{cnssProfile.affiliationNumber}</span>
                  </div>
                  <div className="p-3 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)]">
                    <span className="text-[var(--muted)] block">Date d'effet d'affiliation</span>
                    <span className="font-bold text-sm">{cnssProfile.affiliationDate}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)]">
                    <span className="text-[var(--muted)] block">Catégorie Professionnelle</span>
                    <span className="font-bold">{cnssProfile.professionalCategory}</span>
                  </div>
                  <div className="p-3 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)]">
                    <span className="text-[var(--muted)] block">Barème de Cotisation</span>
                    <span className="font-bold">{cnssProfile.contributionBracket}</span>
                  </div>
                </div>

                <div className="p-3 rounded-[var(--radius-sm)] bg-[var(--border-subtle)] flex items-center justify-between">
                  <span>Portail officiel de gestion des droits médicaux :</span>
                  <a href={cnssProfile.portalUrl} target="_blank" rel="noreferrer">
                    <Button size="sm" variant="outline" rightIcon={<ExternalLink size={12} />}>
                      Ouvrir MaCNSS.ma
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          )}

          {/* SubTab 3.5: AMO vs Retraite Info */}
          {cnssSubTab === "amo_info" && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Guide de la Protection Sociale au Maroc (Auto-Entrepreneurs)</CardTitle>
                  <CardDescription className="text-xs">Comprendre vos droits et obligations légales en tant que professionnel indépendant</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-[var(--radius)] border border-[var(--success)]/40 bg-[var(--success-subtle)] space-y-2">
                      <div className="flex items-center gap-2 font-bold text-[var(--success)] text-sm">
                        <CheckCircle2 size={16} />
                        Assurance Maladie Obligatoire (AMO)
                      </div>
                      <p className="text-[var(--foreground)] leading-relaxed">
                        Obligatoire en vertu de la loi 98-15. Donne droit au remboursement des consultations, examens, médicaments et à la prise en charge à 100% des affections de longue durée (ALD/ALC).
                      </p>
                      <ul className="list-disc list-inside text-[var(--muted)] space-y-1 pt-1">
                        <li>Couvre l'agent et ses ayants droit déclarés.</li>
                        <li>Montant fixe : 600 MAD par trimestre.</li>
                        <li>Quittance obligatoire pour renouveler la carte de séjour ou démarches de crédit.</li>
                      </ul>
                    </div>

                    <div className="p-4 rounded-[var(--radius)] border border-[var(--warning)]/40 bg-[var(--warning-subtle)] space-y-2">
                      <div className="flex items-center gap-2 font-bold text-[var(--warning)] text-sm">
                        <AlertTriangle size={16} />
                        Régime de Retraite des TNS (Facultatif)
                      </div>
                      <p className="text-[var(--foreground)] leading-relaxed">
                        Le statut d'auto-entrepreneur au Maroc n'inclut pas automatiquement de cotisation retraite. Pour acquérir des points de pension, vous devez effectuer une démarche séparée.
                      </p>
                      <ul className="list-disc list-inside text-[var(--muted)] space-y-1 pt-1">
                        <li>Régime institué par la loi 99-15.</li>
                        <li>Souscription volontaire auprès de la CNSS ou plan épargne retraite privé (CIMR, banques).</li>
                        <li>Ne modifie pas votre taux d'IR libératoire.</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: COMPLIANCE CALENDAR */}
      {/* ========================================================================= */}
      {activeTab === "calendar" && (
        <DynamicComplianceCalendar
          events={dynamicCalendarEvents}
          fiscalYear={taxProfile.fiscalYear}
          onDeclareClick={(period) => {
            setNewDeclForm((prev) => ({ ...prev, period }));
            setShowDeclModal(true);
          }}
          onPayClick={(period, type) => {
            if (type === "tax") {
              setNewTaxPayForm((prev) => ({ ...prev, period }));
              setShowTaxPayModal(true);
            } else {
              setNewCNSSPayForm((prev) => ({ ...prev, period }));
              setShowCNSSPayModal(true);
            }
          }}
          onAddCustomReminder={(rem) => {
            setCustomReminders((prev) => [rem, ...prev]);
            triggerToast(`Rappel "${rem.title}" ajouté au calendrier fiscal & social.`);
          }}
          onUpdateEventDeadline={(eventId, newDate, reason) => {
            setOverriddenDeadlines((prev) => ({ ...prev, [eventId]: { newDate, reason } }));
            triggerToast(`Échéance mise à jour pour le ${newDate} (Motif : ${reason}).`);
          }}
          onSnoozeEvent={(eventId, days) => {
            setSnoozedEvents((prev) => ({ ...prev, [eventId]: "snoozed" }));
            triggerToast(`Rappel reporté de ${days} jours.`);
          }}
          onMarkCompleted={(eventId) => {
            triggerToast(`Obligation marquée comme terminée.`);
          }}
          onTriggerEmailPreview={(evt) => {
            triggerEmailSimulation(evt.category === "fiscalite" ? "tax_declaration" : "cnss_due");
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* TAB 5: NOTIFICATIONS CENTER */}
      {/* ========================================================================= */}
      {activeTab === "notifications" && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3 border-b border-[var(--border)] flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm">Centre des Notifications & Alertes Automatisées</CardTitle>
                <CardDescription className="text-xs">Rappels programmés, alertes de plafonds et suivis par email</CardDescription>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))}
              >
                Tout marquer comme lu
              </Button>
            </CardHeader>
            <CardContent className="divide-y divide-[var(--border)] p-0">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 flex items-start justify-between gap-4 transition-colors text-xs ${
                    notif.read ? "bg-[var(--surface)] opacity-70" : "bg-[var(--accent-subtle)]/20"
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="mt-0.5 shrink-0 text-[var(--accent)]">
                      <Bell size={16} />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-[var(--foreground)]">{notif.title}</span>
                        <Badge variant={notif.priority === "urgent" ? "danger" : "default"}>
                          {notif.priority}
                        </Badge>
                        {notif.emailSent && <span className="text-[10px] text-[var(--muted)]">✉️ Email envoyé</span>}
                      </div>
                      <p className="text-[var(--muted)] leading-relaxed">{notif.message}</p>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n)))}
                  >
                    Marquer lu
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: ANALYTICS & CHARTS */}
      {/* ========================================================================= */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Répartition du Chiffre d'Affaires par Trimestre</CardTitle>
                <CardDescription className="text-xs">Volume trimestriel déclaré et liquidé</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { period: "T1 2026", turnover: 55500, tax: 555 },
                        { period: "T2 2026", turnover: 76000, tax: 760 },
                        { period: "T3 2026", turnover: 69500, tax: 695 },
                        { period: "T4 2026 (En cours)", turnover: 17750, tax: 177.5 },
                      ]}
                      margin={{ top: 5, right: 10, left: -15, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.6} />
                      <XAxis dataKey="period" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "var(--muted)" }} />
                      <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} tick={{ fontSize: 10, fill: "var(--muted)" }} />
                      <Tooltip formatter={(v: any) => [formatMAD(v)]} />
                      <Legend wrapperStyle={{ fontSize: "11px" }} />
                      <Bar dataKey="turnover" name="Chiffre d'Affaires (MAD)" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="tax" name="IR Libératoire (1%)" fill="var(--success)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Poids des Charges d'Impôt vs Couverture Sociale</CardTitle>
                <CardDescription className="text-xs">Répartition annuelle globale (MAD)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip formatter={(val: any) => [formatMAD(val)]} />
                      <Pie
                        data={[
                          { name: "IR Libératoire (1%)", value: 2187.5, color: "var(--accent)" },
                          { name: "Cotisations AMO (CNSS)", value: 2400, color: "var(--success)" },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        <Cell fill="var(--accent)" />
                        <Cell fill="var(--success)" />
                      </Pie>
                      <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: DOCUMENTS VAULT */}
      {/* ========================================================================= */}
      {activeTab === "documents" && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3 border-b border-[var(--border)] flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm">Dossier Juridique & Quittances Fiscales / Sociales</CardTitle>
                <CardDescription className="text-xs">Pièces justificatives requises en cas de vérification de l'administration</CardDescription>
              </div>
              <label>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      const f = e.target.files[0];
                      setDocuments([
                        {
                          id: `cdoc-${Date.now()}`,
                          name: f.name,
                          category: "tax_declaration",
                          module: "fiscalite",
                          fileSize: `${(f.size / 1024).toFixed(0)} Ko`,
                          uploadDate: new Date().toISOString().split("T")[0],
                          status: "valid",
                          notes: "Téléversé par l'agent",
                        },
                        ...documents,
                      ]);
                      triggerToast(`Document "${f.name}" archivé.`);
                    }
                  }}
                />
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] bg-[var(--accent)] text-white text-xs font-semibold cursor-pointer hover:opacity-90 transition-opacity">
                  <Upload size={13} />
                  Téléverser une quittance
                </span>
              </label>
            </CardHeader>
            <CardContent className="divide-y divide-[var(--border)] p-0">
              {documents.map((doc) => (
                <div key={doc.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--accent-subtle)] text-[var(--accent)] shrink-0">
                      <FileCheck size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-[var(--foreground)] truncate">{doc.name}</p>
                      <p className="text-[11px] text-[var(--muted)]">
                        {doc.fileSize} • Ajouté le {doc.uploadDate} • {doc.notes}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={doc.status === "valid" ? "success" : "warning"}>{doc.status}</Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => alert(`Téléchargement de la pièce officielle : ${doc.name}`)}
                      leftIcon={<Download size={12} />}
                    >
                      Ouvrir
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 8: SETTINGS & PARAMÈTRES */}
      {/* ========================================================================= */}
      {activeTab === "settings" && (
        <Card>
          <CardHeader className="pb-3 border-b border-[var(--border)]">
            <CardTitle className="text-sm">Configuration Fiscale & Sociale de l'Agent</CardTitle>
            <CardDescription className="text-xs">Personnalisez vos paramètres pour adapter les calculs à votre situation exacte</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nom & Prénom de l'exploitant"
                value={taxProfile.fullName}
                onChange={(e) => setTaxProfile({ ...taxProfile, fullName: e.target.value })}
              />
              <Input
                label="N° Auto-Entrepreneur (RNVE)"
                value={taxProfile.aeNumber}
                onChange={(e) => setTaxProfile({ ...taxProfile, aeNumber: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Taux applicable IR libératoire"
                value={taxProfile.applicableIRRate.toString()}
                onChange={(e) => setTaxProfile({ ...taxProfile, applicableIRRate: parseFloat(e.target.value) || 0.01 })}
              />
              <Input
                label="Plafond annuel autorisé (MAD)"
                value={taxProfile.annualCeilingMAD.toString()}
                onChange={(e) => setTaxProfile({ ...taxProfile, annualCeilingMAD: parseFloat(e.target.value) || 500000 })}
              />
              <Input
                label="Cotisation Trimestrielle AMO (MAD)"
                value={cnssProfile.quarterlyAmount.toString()}
                onChange={(e) => setCnssProfile({ ...cnssProfile, quarterlyAmount: parseFloat(e.target.value) || 600 })}
              />
            </div>

            <div className="flex justify-end pt-3 border-t border-[var(--border)]">
              <Button size="sm" onClick={() => triggerToast("Paramètres fiscaux & sociaux enregistrés avec succès !")}>
                Enregistrer les paramètres
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: NOUVELLE DÉCLARATION */}
      {/* ========================================================================= */}
      {showDeclModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
              <h3 className="text-sm font-bold text-[var(--foreground)]">Créer une Déclaration Fiscale Trimestrielle</h3>
              <button onClick={() => setShowDeclModal(false)} className="text-[var(--muted)] hover:text-[var(--foreground)]">✕</button>
            </div>

            <form onSubmit={handleSaveDeclaration} className="space-y-4">
              <Input
                label="Période (Code)"
                value={newDeclForm.period}
                onChange={(e) => setNewDeclForm({ ...newDeclForm, period: e.target.value })}
              />
              <Input
                label="Libellé de la période"
                value={newDeclForm.periodLabel}
                onChange={(e) => setNewDeclForm({ ...newDeclForm, periodLabel: e.target.value })}
              />
              <Input
                label="Recettes Brutes Encaissées (MAD) *"
                type="number"
                required
                value={newDeclForm.turnoverDeclared}
                onChange={(e) => setNewDeclForm({ ...newDeclForm, turnoverDeclared: e.target.value })}
              />
              <Input
                label="Date Limite de Dépôt"
                type="date"
                value={newDeclForm.dueDate}
                onChange={(e) => setNewDeclForm({ ...newDeclForm, dueDate: e.target.value })}
              />
              <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border)]">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowDeclModal(false)}>Annuler</Button>
                <Button type="submit" size="sm">Calculer & Enregistrer</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: PAIEMENT D'IMPÔT (DGI) */}
      {/* ========================================================================= */}
      {showTaxPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
              <h3 className="text-sm font-bold text-[var(--foreground)]">Enregistrer un Télépaiement d'IR (DGI)</h3>
              <button onClick={() => setShowTaxPayModal(false)} className="text-[var(--muted)] hover:text-[var(--foreground)]">✕</button>
            </div>

            <form onSubmit={handleRecordTaxPayment} className="space-y-4">
              <Input
                label="Trimestre concerné"
                value={newTaxPayForm.period}
                onChange={(e) => setNewTaxPayForm({ ...newTaxPayForm, period: e.target.value })}
              />
              <Input
                label="Montant réglé (MAD) *"
                type="number"
                required
                value={newTaxPayForm.amount}
                onChange={(e) => setNewTaxPayForm({ ...newTaxPayForm, amount: e.target.value })}
              />
              <Input
                label="Date du paiement"
                type="date"
                value={newTaxPayForm.paymentDate}
                onChange={(e) => setNewTaxPayForm({ ...newTaxPayForm, paymentDate: e.target.value })}
              />
              <Input
                label="N° de Récépissé ou Référence bancaire"
                value={newTaxPayForm.referenceNumber}
                onChange={(e) => setNewTaxPayForm({ ...newTaxPayForm, referenceNumber: e.target.value })}
              />
              <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border)]">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowTaxPayModal(false)}>Annuler</Button>
                <Button type="submit" size="sm">Valider la quittance</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: PAIEMENT COTISATION CNSS */}
      {/* ========================================================================= */}
      {showCNSSPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
              <h3 className="text-sm font-bold text-[var(--foreground)]">Enregistrer un Règlement de Cotisation AMO</h3>
              <button onClick={() => setShowCNSSPayModal(false)} className="text-[var(--muted)] hover:text-[var(--foreground)]">✕</button>
            </div>

            <form onSubmit={handleRecordCNSSPayment} className="space-y-4">
              <Input
                label="Trimestre"
                value={newCNSSPayForm.period}
                onChange={(e) => setNewCNSSPayForm({ ...newCNSSPayForm, period: e.target.value })}
              />
              <Input
                label="Montant de la cotisation (MAD)"
                type="number"
                value={newCNSSPayForm.amount}
                onChange={(e) => setNewCNSSPayForm({ ...newCNSSPayForm, amount: e.target.value })}
              />
              <Input
                label="Référence de Quittance MaCNSS"
                value={newCNSSPayForm.referenceNumber}
                onChange={(e) => setNewCNSSPayForm({ ...newCNSSPayForm, referenceNumber: e.target.value })}
              />
              <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border)]">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowCNSSPayModal(false)}>Annuler</Button>
                <Button type="submit" size="sm">Confirmer paiement AMO</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: RETENUE À LA SOURCE */}
      {/* ========================================================================= */}
      {showWithholdingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
              <h3 className="text-sm font-bold text-[var(--foreground)]">Enregistrer une Opération avec Retenue (RAS)</h3>
              <button onClick={() => setShowWithholdingModal(false)} className="text-[var(--muted)] hover:text-[var(--foreground)]">✕</button>
            </div>

            <form onSubmit={handleSaveWithholding} className="space-y-4">
              <Input
                label="Nom du Donneur d'Ordre / Payer *"
                required
                placeholder="Ex: Société Immobilière Détroit"
                value={newWithholdingForm.payerName}
                onChange={(e) => setNewWithholdingForm({ ...newWithholdingForm, payerName: e.target.value })}
              />
              <Input
                label="N° ICE du Client"
                placeholder="002..."
                value={newWithholdingForm.payerICE}
                onChange={(e) => setNewWithholdingForm({ ...newWithholdingForm, payerICE: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Montant Brut (MAD) *"
                  type="number"
                  required
                  value={newWithholdingForm.grossAmount}
                  onChange={(e) => setNewWithholdingForm({ ...newWithholdingForm, grossAmount: e.target.value })}
                />
                <Input
                  label="Retenue à la source (MAD)"
                  type="number"
                  value={newWithholdingForm.withheldAmount}
                  onChange={(e) => setNewWithholdingForm({ ...newWithholdingForm, withheldAmount: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border)]">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowWithholdingModal(false)}>Annuler</Button>
                <Button type="submit" size="sm">Consigner l'opération</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: EMAIL REMINDER SIMULATOR (RESEND PREVIEW) */}
      {/* ========================================================================= */}
      {showEmailSimModal && emailSimulationData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
              <div>
                <h3 className="text-sm font-bold text-[var(--foreground)]">Aperçu du Courriel Automatisé (Service Resend)</h3>
                <p className="text-[11px] text-[var(--muted)]">Objet : {emailSimulationData.subject}</p>
              </div>
              <button onClick={() => setShowEmailSimModal(false)} className="text-[var(--muted)] hover:text-[var(--foreground)]">✕</button>
            </div>

            <div className="p-4 rounded-[var(--radius-sm)] border border-[var(--border)] bg-white text-black">
              <div dangerouslySetInnerHTML={{ __html: emailSimulationData.htmlBody }} />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
              <span className="text-[11px] text-[var(--muted)]">
                Email expéditeur configuré : <strong>notifications@realtor-os.ma</strong>
              </span>
              <Button
                size="sm"
                onClick={() => {
                  setShowEmailSimModal(false);
                  triggerToast("Simulation d'envoi d'email réussie via Resend API !");
                }}
              >
                Confirmer l'envoi test
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Icon helper
function HeartPulseIcon(props: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size || 16}
      height={props.size || 16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}
