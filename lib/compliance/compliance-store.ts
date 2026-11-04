// Comprehensive Moroccan Compliance Store (Fiscalité & Protection Sociale)
// Versioned rules engine, turnover tracking, declarations, withholding, CNSS/AMO, calendar & notifications

export interface TaxRuleVersion {
  id: string;
  name: string;
  legalReference: string;
  article: string;
  officialSourceUrl: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  applicableLegalStatus: "auto_entrepreneur" | "sarl" | "personne_physique";
  activityCategory: "services" | "commerce_industrie" | "artisanat" | "all";
  rate: number; // e.g., 0.01 = 1%
  annualCeilingMAD: number; // e.g., 500,000 MAD for services or 200,000 MAD for sales
  singleClientThresholdPct: number; // 0.50 = 50%
  calculationMethod: "flat_rate_on_turnover" | "progressive";
  description: string;
  lastReviewedDate: string;
  verificationStatus: "verified" | "needs_review" | "outdated" | "superseded" | "manually_configured";
  reviewerNotes: string;
}

export interface CNSSRuleVersion {
  id: string;
  name: string;
  legalReference: string;
  article: string;
  officialSourceUrl: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  contributionType: "AMO" | "CNSS_PENSION" | "CNSS_TOTAL";
  applicableTo: "auto_entrepreneur" | "independent_worker";
  fixedMonthlyAmount: number; // e.g., 200 MAD/month for auto-entrepreneur service bracket
  quarterlyAmount: number; // 600 MAD/quarter
  gracePeriodDays: number;
  description: string;
  lastReviewedDate: string;
  verificationStatus: "verified" | "needs_review" | "manually_configured";
  reviewerNotes: string;
}

export interface TaxProfileData {
  fullName: string;
  aeNumber: string;
  ice: string;
  ifNumber: string;
  patente: string;
  registeredActivity: string;
  activityCategory: "services" | "commerce_industrie" | "artisanat";
  taxRegime: string;
  applicableIRRate: number;
  annualCeilingMAD: number;
  declarationFrequency: "quarterly" | "monthly";
  fiscalYear: number;
  taxAuthorityOffice: string; // e.g. "Direction Régionale des Impôts de Tanger"
  paymentMethod: "telepaiement_bancaire" | "rnve_direct" | "especes_tresorerie";
  verificationStatus: "verified" | "pending_review" | "outdated";
  lastVerifiedDate: string;
}

export interface CNSSProfileData {
  cnssNumber: string;
  affiliationNumber: string;
  amoAffiliationStatus: "active" | "inactive" | "pending_verification";
  affiliationDate: string;
  professionalCategory: string; // e.g. "Agences immobilières et administration de biens"
  contributionBracket: string; // e.g. "Catégorie Services TNS - Coefficient SMIG 1.0"
  monthlyAmount: number;
  quarterlyAmount: number;
  paymentFrequency: "quarterly" | "monthly";
  hasAMO: boolean;
  hasPension: boolean;
  dependantsCount: number;
  currentCoverageStatus: "couvert_a_jour" | "arrieres_suspension" | "dossier_incomplet";
  lastVerificationDate: string;
  portalUrl: string;
}

export interface TaxDeclarationRecord {
  id: string;
  fiscalYear: number;
  period: string; // "2026-T1", "2026-T2", "2026-T3", "2026-T4"
  periodLabel: string;
  turnoverDeclared: number;
  taxRate: number;
  taxCalculated: number;
  amountPaid: number;
  submissionDate?: string;
  paymentDate?: string;
  dueDate: string;
  referenceNumber?: string;
  receiptNumber?: string;
  status: "not_started" | "draft" | "ready_to_submit" | "submitted" | "payment_pending" | "partially_paid" | "paid" | "overdue";
  supportingDocName?: string;
  notes?: string;
}

export interface TaxPaymentRecord {
  id: string;
  declarationId?: string;
  period: string;
  amount: number;
  paymentDate: string;
  paymentMethod: "telepaiement" | "virement" | "carte_bancaire" | "tresorerie";
  referenceNumber: string;
  receiptDocUrl?: string;
  notes?: string;
  status: "completed" | "pending_clearance";
}

export interface WithholdingRecord {
  id: string;
  payerName: string;
  payerICE?: string;
  payerType: "agence_immobiliere" | "entreprise_client" | "promoteur" | "particulier";
  transactionRef: string;
  grossAmount: number;
  withheldAmount: number;
  netReceived: number;
  date: string;
  legalBasis: string;
  certificateDocUrl?: string;
  certificateStatus: "received_verified" | "missing_followup_required" | "pending";
  fiscalYear: number;
  notes?: string;
}

export interface CNSSContributionRecord {
  id: string;
  period: string; // e.g. "2026-T1"
  periodLabel: string;
  dueDate: string;
  amountExpected: number;
  amountPaid: number;
  paymentDate?: string;
  paymentMethod?: "debit_bancaire" | "virement" | "macnss_online";
  referenceNumber?: string;
  receiptDocName?: string;
  status: "upcoming" | "due" | "partially_paid" | "paid" | "overdue" | "under_verification";
  notes?: string;
}

export interface ComplianceCalendarEvent {
  id: string;
  title: string;
  category: "tax_declaration" | "tax_payment" | "cnss_contribution" | "threshold_review" | "withholding_followup" | "administrative_document";
  description: string;
  dueDate: string;
  amountDue?: number;
  priority: "urgent" | "high" | "normal" | "low";
  status: "pending" | "completed" | "overdue" | "due_soon";
  actionUrl: string;
  relatedRecordId?: string;
}

export interface ComplianceNotification {
  id: string;
  title: string;
  category: "tax" | "cnss" | "threshold" | "document";
  message: string;
  dueDate?: string;
  amount?: number;
  priority: "urgent" | "high" | "normal";
  read: boolean;
  actionUrl: string;
  createdAt: string;
  emailSent?: boolean;
}

export interface ComplianceDocument {
  id: string;
  name: string;
  category: "tax_declaration" | "tax_receipt" | "withholding_cert" | "rnve_registration" | "cnss_affiliation" | "amo_attestation" | "cnss_receipt";
  module: "fiscalite" | "cnss";
  period?: string;
  fileSize: string;
  uploadDate: string;
  expiryDate?: string;
  status: "valid" | "expiring_soon" | "expired" | "pending_review";
  notes?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// OFFICIAL MOROCCAN LEGAL RULES ENGINE (DGI & CNSS VERSIONED REGISTRY)
// ─────────────────────────────────────────────────────────────────────────────

export const OFFICIAL_TAX_RULES: TaxRuleVersion[] = [
  {
    id: "morocco-cgi-40bis-services-2024",
    name: "IR Libératoire Auto-Entrepreneur — Services & Prestations Immobilières",
    legalReference: "Code Général des Impôts (CGI) Article 40 bis / Loi de Finances 2023-2024",
    article: "Art. 40 bis CGI",
    officialSourceUrl: "https://www.tax.gov.ma",
    effectiveFrom: "2023-01-01",
    effectiveTo: null,
    applicableLegalStatus: "auto_entrepreneur",
    activityCategory: "services",
    rate: 0.01, // 1%
    annualCeilingMAD: 500000, // 500 000 MAD
    singleClientThresholdPct: 0.50, // 50% single client alert
    calculationMethod: "flat_rate_on_turnover",
    description: "Taux forfaitaire libératoire de 1% liquidé sur le montant brut du chiffre d'affaires effectivement perçu et encaissé. Plafond d'éligibilité légale de 500 000 MAD par an.",
    lastReviewedDate: "2026-01-05",
    verificationStatus: "verified",
    reviewerNotes: "Vérifié conforme aux dispositions du CGI 2024 applicable aux auto-entrepreneurs prestataires de services.",
  },
  {
    id: "morocco-cgi-40bis-commercial-2024",
    name: "IR Libératoire Auto-Entrepreneur — Activités Commerciales & Industrielles",
    legalReference: "Code Général des Impôts (CGI) Article 40 bis",
    article: "Art. 40 bis CGI",
    officialSourceUrl: "https://www.tax.gov.ma",
    effectiveFrom: "2023-01-01",
    effectiveTo: null,
    applicableLegalStatus: "auto_entrepreneur",
    activityCategory: "commerce_industrie",
    rate: 0.005, // 0.5%
    annualCeilingMAD: 200000,
    singleClientThresholdPct: 0.50,
    calculationMethod: "flat_rate_on_turnover",
    description: "Taux forfaitaire libératoire de 0.5% pour activités commerciales, industrielles et artisanales (plafond 200 000 MAD).",
    lastReviewedDate: "2026-01-05",
    verificationStatus: "verified",
    reviewerNotes: "Prêt pour les agents diversifiant dans l'achat/revente direct de mobilier.",
  },
];

export const OFFICIAL_CNSS_RULES: CNSSRuleVersion[] = [
  {
    id: "cnss-amo-tns-services-2024",
    name: "AMO Travailleurs Non-Salariés (TNS) — Auto-Entrepreneurs Prestations Immobilières",
    legalReference: "Dahir n° 1-17-15 portant promulgation de la loi n° 98-15 & Décret d'application n° 2-21-929",
    article: "Loi 98-15 relative au régime AMO pour les TNS",
    officialSourceUrl: "https://www.macnss.ma",
    effectiveFrom: "2022-01-01",
    effectiveTo: null,
    contributionType: "AMO",
    applicableTo: "auto_entrepreneur",
    fixedMonthlyAmount: 200, // 200 MAD/month
    quarterlyAmount: 600, // 600 MAD/quarter
    gracePeriodDays: 30,
    description: "Assurance Maladie Obligatoire (AMO) pour les indépendants. Cotisation forfaitaire trimestrielle de 600 MAD garantissant la couverture maladie pour l'assuré et ses ayants droit.",
    lastReviewedDate: "2026-01-10",
    verificationStatus: "verified",
    reviewerNotes: "Attention : Ce versement ouvre droit exclusivement à l'AMO et n'ouvre pas automatiquement de points de pension retraite CNSS sans adhésion complémentaire.",
  },
  {
    id: "cnss-retraite-volontaire-tns",
    name: "Régime Complémentaire de Retraite TNS (Facultatif)",
    legalReference: "Loi n° 99-15 instituant un régime de pensions pour les catégories des professionnels et travailleurs indépendants",
    article: "Loi 99-15",
    officialSourceUrl: "https://www.cnss.ma",
    effectiveFrom: "2023-01-01",
    effectiveTo: null,
    contributionType: "CNSS_PENSION",
    applicableTo: "independent_worker",
    fixedMonthlyAmount: 400,
    quarterlyAmount: 1200,
    gracePeriodDays: 30,
    description: "Cotisation volontaire au régime de retraite des indépendants. Nécessite une demande d'adhésion expresse auprès de votre agence CNSS.",
    lastReviewedDate: "2026-01-10",
    verificationStatus: "needs_review",
    reviewerNotes: "Statut non activé par défaut. Doit faire l'objet d'un accord individuel avec la CNSS.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// INITIAL COMPLIANCE DATA (TANGIER AUTO-ENTREPRENEUR PROFILE)
// ─────────────────────────────────────────────────────────────────────────────

export const INITIAL_TAX_PROFILE: TaxProfileData = {
  fullName: "Badr El Mansouri",
  aeNumber: "AE-2023-094182",
  ice: "002941882000034",
  ifNumber: "51294812",
  patente: "50481290",
  registeredActivity: "Agences immobilières et administration de biens immobiliers",
  activityCategory: "services",
  taxRegime: "Auto-entrepreneur (Régime fiscal libératoire 1% sur CA encaissé)",
  applicableIRRate: 0.01,
  annualCeilingMAD: 500000,
  declarationFrequency: "quarterly",
  fiscalYear: 2026,
  taxAuthorityOffice: "Direction Régionale des Impôts de Tanger — Centre Administratif Pasteur",
  paymentMethod: "telepaiement_bancaire",
  verificationStatus: "verified",
  lastVerifiedDate: "2026-01-15",
};

export const INITIAL_CNSS_PROFILE: CNSSProfileData = {
  cnssNumber: "984120938",
  affiliationNumber: "TNS-TNG-8841290",
  amoAffiliationStatus: "active",
  affiliationDate: "2023-03-01",
  professionalCategory: "Agences immobilières et intermédiation",
  contributionBracket: "Prestations TNS Barème Standard",
  monthlyAmount: 200,
  quarterlyAmount: 600,
  paymentFrequency: "quarterly",
  hasAMO: true,
  hasPension: false,
  dependantsCount: 2, // Conjoint + 1 enfant
  currentCoverageStatus: "couvert_a_jour",
  lastVerificationDate: "2026-10-01",
  portalUrl: "https://www.macnss.ma",
};

export const INITIAL_TAX_DECLARATIONS: TaxDeclarationRecord[] = [
  {
    id: "decl-2026-t1",
    fiscalYear: 2026,
    period: "2026-T1",
    periodLabel: "1er Trimestre 2026 (Jan - Mar)",
    turnoverDeclared: 55500,
    taxRate: 0.01,
    taxCalculated: 555,
    amountPaid: 555,
    submissionDate: "2026-04-22",
    paymentDate: "2026-04-22",
    dueDate: "2026-04-30",
    referenceNumber: "DGI-TNG-2026-09412",
    receiptNumber: "REC-RNVE-44819",
    status: "paid",
    supportingDocName: "Declaration_T1_2026_RNVE_Signee.pdf",
    notes: "Déclaré et payé via le portail RNVE Attijariwafa télépaiement.",
  },
  {
    id: "decl-2026-t2",
    fiscalYear: 2026,
    period: "2026-T2",
    periodLabel: "2ème Trimestre 2026 (Avr - Juin)",
    turnoverDeclared: 76000,
    taxRate: 0.01,
    taxCalculated: 760,
    amountPaid: 760,
    submissionDate: "2026-07-28",
    paymentDate: "2026-07-28",
    dueDate: "2026-07-31",
    referenceNumber: "DGI-TNG-2026-15980",
    receiptNumber: "REC-RNVE-59102",
    status: "paid",
    supportingDocName: "Declaration_T2_2026_Quittance.pdf",
    notes: "Honoraires vente Marshan et location meublée.",
  },
  {
    id: "decl-2026-t3",
    fiscalYear: 2026,
    period: "2026-T3",
    periodLabel: "3ème Trimestre 2026 (Juil - Sep)",
    turnoverDeclared: 69500,
    taxRate: 0.01,
    taxCalculated: 695,
    amountPaid: 0,
    dueDate: "2026-11-30",
    status: "ready_to_submit",
    notes: "CA calculé à partir des encaissements réels juillet, août, septembre. Échéance : 30 novembre 2026.",
  },
  {
    id: "decl-2026-t4",
    fiscalYear: 2026,
    period: "2026-T4",
    periodLabel: "4ème Trimestre 2026 (Oct - Déc)",
    turnoverDeclared: 17750, // Octobre perçu
    taxRate: 0.01,
    taxCalculated: 177.5,
    amountPaid: 0,
    dueDate: "2027-01-31",
    status: "draft",
    notes: "Période en cours. Seuls les 17 500 MAD d'octobre sont pour l'instant comptabilisés.",
  },
];

export const INITIAL_TAX_PAYMENTS: TaxPaymentRecord[] = [
  {
    id: "pay-tax-1",
    declarationId: "decl-2026-t1",
    period: "2026-T1",
    amount: 555,
    paymentDate: "2026-04-22",
    paymentMethod: "telepaiement",
    referenceNumber: "VIR-DGI-441298",
    receiptDocUrl: "Quittance_Paiement_T1_2026.pdf",
    notes: "Prélèvement bancaire direct RNVE.",
    status: "completed",
  },
  {
    id: "pay-tax-2",
    declarationId: "decl-2026-t2",
    period: "2026-T2",
    amount: 760,
    paymentDate: "2026-07-28",
    paymentMethod: "telepaiement",
    referenceNumber: "VIR-DGI-889140",
    receiptDocUrl: "Quittance_Paiement_T2_2026.pdf",
    notes: "Paiement en ligne validé.",
    status: "completed",
  },
];

export const INITIAL_WITHHOLDING_RECORDS: WithholdingRecord[] = [
  {
    id: "wth-1",
    payerName: "Tanger Immo Prestige SARL",
    payerICE: "001889412000088",
    payerType: "agence_immobiliere",
    transactionRef: "TRX-2026-012 (Iberia)",
    grossAmount: 17500,
    withheldAmount: 0, // Inter-cabinet payment paid in full
    netReceived: 17500,
    date: "2026-10-22",
    legalBasis: "Partage d'honoraires inter-cabinet avec agence titulaire de patente",
    certificateStatus: "received_verified",
    fiscalYear: 2026,
    notes: "Facture d'honoraires sans retenue à la source, l'agent auto-entrepreneur déclarant directement l'IR libératoire.",
  },
  {
    id: "wth-2",
    payerName: "Société Foncière Détroit SARL",
    payerICE: "002441982000012",
    payerType: "entreprise_client",
    transactionRef: "TRX-2026-004 (Bureaux Place de France)",
    grossAmount: 25000,
    withheldAmount: 0,
    netReceived: 25000,
    date: "2026-05-14",
    legalBasis: "Honoraires de recherche d'acquéreur",
    certificateStatus: "received_verified",
    fiscalYear: 2026,
    notes: "Attestation de règlement remise par le cabinet comptable de la société.",
  },
];

export const INITIAL_CNSS_CONTRIBUTIONS: CNSSContributionRecord[] = [
  {
    id: "cnss-2026-t1",
    period: "2026-T1",
    periodLabel: "1er Trimestre 2026",
    dueDate: "2026-03-31",
    amountExpected: 600,
    amountPaid: 600,
    paymentDate: "2026-03-29",
    paymentMethod: "macnss_online",
    referenceNumber: "CNSS-T1-994182",
    receiptDocName: "Quittance_Cotisation_AMO_T1_2026.pdf",
    status: "paid",
    notes: "Paiement en ligne sur macnss.ma par carte bancaire.",
  },
  {
    id: "cnss-2026-t2",
    period: "2026-T2",
    periodLabel: "2ème Trimestre 2026",
    dueDate: "2026-06-30",
    amountExpected: 600,
    amountPaid: 600,
    paymentDate: "2026-06-25",
    paymentMethod: "macnss_online",
    referenceNumber: "CNSS-T2-114092",
    receiptDocName: "Quittance_Cotisation_AMO_T2_2026.pdf",
    status: "paid",
    notes: "Paiement régulier, droits AMO reconduits.",
  },
  {
    id: "cnss-2026-t3",
    period: "2026-T3",
    periodLabel: "3ème Trimestre 2026",
    dueDate: "2026-09-30",
    amountExpected: 600,
    amountPaid: 600,
    paymentDate: "2026-09-28",
    paymentMethod: "debit_bancaire",
    referenceNumber: "CNSS-T3-771940",
    receiptDocName: "Quittance_Cotisation_AMO_T3_2026.pdf",
    status: "paid",
    notes: "Prélèvement bancaire automatique.",
  },
  {
    id: "cnss-2026-t4",
    period: "2026-T4",
    periodLabel: "4ème Trimestre 2026",
    dueDate: "2026-12-31",
    amountExpected: 600,
    amountPaid: 0,
    status: "upcoming",
    notes: "Échéance au 31 décembre 2026. Couvre les mois d'octobre, novembre et décembre.",
  },
];

export const INITIAL_COMPLIANCE_EVENTS: ComplianceCalendarEvent[] = [
  {
    id: "evt-tax-t3",
    title: "Déclaration fiscale IR Trimestre 3 (2026)",
    category: "tax_declaration",
    description: "Déclaration du chiffre d'affaires encaissé au T3 (69 500 MAD) sur le portail rnve.ma. IR dû : 695 MAD.",
    dueDate: "2026-11-30",
    amountDue: 695,
    priority: "urgent",
    status: "due_soon",
    actionUrl: "/dashboard/tax?tab=declarations",
    relatedRecordId: "decl-2026-t3",
  },
  {
    id: "evt-cnss-t4",
    title: "Cotisation trimestrielle AMO (T4 2026)",
    category: "cnss_contribution",
    description: "Paiement de la cotisation obligatoire d'assurance maladie TNS auprès de la CNSS (600 MAD).",
    dueDate: "2026-12-31",
    amountDue: 600,
    priority: "high",
    status: "pending",
    actionUrl: "/dashboard/tax?tab=cnss",
    relatedRecordId: "cnss-2026-t4",
  },
  {
    id: "evt-thresh-check",
    title: "Vérification du Seuil de Concentration Client",
    category: "threshold_review",
    description: "Revue annuelle : s'assurer qu'aucun client unique ne dépasse 50% du chiffre d'affaires cumulé.",
    dueDate: "2026-12-15",
    priority: "normal",
    status: "pending",
    actionUrl: "/dashboard/tax?tab=turnover",
  },
  {
    id: "evt-tax-t4",
    title: "Déclaration fiscale IR Trimestre 4 (2026)",
    category: "tax_declaration",
    description: "Déclaration trimestrielle finale de l'exercice 2026.",
    dueDate: "2027-01-31",
    priority: "normal",
    status: "pending",
    actionUrl: "/dashboard/tax?tab=declarations",
    relatedRecordId: "decl-2026-t4",
  },
];

export const INITIAL_COMPLIANCE_NOTIFICATIONS: ComplianceNotification[] = [
  {
    id: "notif-1",
    title: "Échéance fiscale T3 dans 27 jours",
    category: "tax",
    message: "Votre déclaration de chiffre d'affaires du 3ème trimestre 2026 (69 500 MAD encaissés) doit être transmise avant le 30 novembre 2026.",
    dueDate: "2026-11-30",
    amount: 695,
    priority: "urgent",
    read: false,
    actionUrl: "/dashboard/tax?tab=declarations",
    createdAt: "2026-11-01T08:00:00Z",
    emailSent: true,
  },
  {
    id: "notif-2",
    title: "Plafond Auto-Entrepreneur sous contrôle",
    category: "threshold",
    message: "Vous avez consommé 43.8% de votre plafond annuel (218 750 MAD encaissés sur 500 000 MAD autorisés). Marge restante : 281 250 MAD.",
    priority: "normal",
    read: false,
    actionUrl: "/dashboard/tax?tab=turnover",
    createdAt: "2026-11-02T10:00:00Z",
    emailSent: false,
  },
  {
    id: "notif-3",
    title: "Attestation AMO à jour",
    category: "cnss",
    message: "Vos cotisations du 3ème trimestre sont enregistrées. Votre attestation de droits AMO est valide.",
    priority: "normal",
    read: true,
    actionUrl: "/dashboard/tax?tab=cnss",
    createdAt: "2026-10-02T14:30:00Z",
    emailSent: true,
  },
];

export const INITIAL_COMPLIANCE_DOCUMENTS: ComplianceDocument[] = [
  {
    id: "cdoc-1",
    name: "Declaration_T1_2026_RNVE_Signee.pdf",
    category: "tax_declaration",
    module: "fiscalite",
    period: "2026-T1",
    fileSize: "680 Ko",
    uploadDate: "2026-04-22",
    status: "valid",
    notes: "Déclaration officielle DGI T1 2026",
  },
  {
    id: "cdoc-2",
    name: "Quittance_Paiement_T1_2026.pdf",
    category: "tax_receipt",
    module: "fiscalite",
    period: "2026-T1",
    fileSize: "410 Ko",
    uploadDate: "2026-04-22",
    status: "valid",
    notes: "Reçu de télépaiement bancaire 555 MAD",
  },
  {
    id: "cdoc-3",
    name: "Declaration_T2_2026_Quittance.pdf",
    category: "tax_declaration",
    module: "fiscalite",
    period: "2026-T2",
    fileSize: "720 Ko",
    uploadDate: "2026-07-28",
    status: "valid",
    notes: "Déclaration et quittance T2 2026 (760 MAD)",
  },
  {
    id: "cdoc-4",
    name: "Attestation_Inscription_AutoEntrepreneur_RNVE.pdf",
    category: "rnve_registration",
    module: "fiscalite",
    fileSize: "1.2 Mo",
    uploadDate: "2023-02-15",
    status: "valid",
    notes: "Carte et certificat officiel auto-entrepreneur",
  },
  {
    id: "cdoc-5",
    name: "Quittance_Cotisation_AMO_T3_2026.pdf",
    category: "cnss_receipt",
    module: "cnss",
    period: "2026-T3",
    fileSize: "530 Ko",
    uploadDate: "2026-09-28",
    status: "valid",
    notes: "Reçu CNSS paiement 600 MAD T3 2026",
  },
  {
    id: "cdoc-6",
    name: "Attestation_Droits_AMO_TNS_2026.pdf",
    category: "amo_attestation",
    module: "cnss",
    fileSize: "890 Ko",
    uploadDate: "2026-10-01",
    expiryDate: "2026-12-31",
    status: "valid",
    notes: "Attestation officielle de couverture médicale pour ayants droit",
  },
];
