// Moroccan Tax & CNSS/AMO Legal Rules Engine
// Versioned calculations, legal references, and validation algorithms

import { OFFICIAL_TAX_RULES, OFFICIAL_CNSS_RULES, TaxRuleVersion, CNSSRuleVersion } from "./compliance-store";

export interface CalculationAuditTrail {
  ruleId: string;
  ruleName: string;
  legalReference: string;
  article: string;
  officialSourceUrl: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  verificationStatus: string;
  inputTurnover: number;
  taxableBase: number;
  appliedRate: number;
  calculatedAmount: number;
  ceilingApplied: number;
  ceilingRemaining: number;
  percentageOfCeiling: number;
  singleClientWarning: boolean;
  notes: string;
  timestamp: string;
}

export interface TaxCalculationResult {
  grossTurnover: number;
  taxableBase: number;
  appliedRate: number;
  estimatedTax: number;
  taxPaid: number;
  taxRemainingDue: number;
  annualCeiling: number;
  ceilingRemaining: number;
  ceilingConsumedPct: number;
  effectiveRatePct: number;
  auditTrail: CalculationAuditTrail;
  disclaimer: string;
}

export interface CNSSCalculationResult {
  monthlyRate: number;
  quarterlyRate: number;
  contributionsDueThisYear: number;
  contributionsPaidThisYear: number;
  contributionsRemainingDue: number;
  coverageStatus: string;
  auditTrail: {
    ruleId: string;
    ruleName: string;
    legalReference: string;
    officialSourceUrl: string;
    verificationStatus: string;
    fixedQuarterlyAmount: number;
    hasPension: boolean;
    hasAMO: boolean;
    disclaimer: string;
  };
}

/**
 * Executes transparent Moroccan Auto-Entrepreneur Income Tax calculation
 * strictly conforming to Code Général des Impôts (CGI) Article 40 bis.
 */
export function calculateMoroccanTax(
  grossCollectedTurnover: number,
  taxPaidSoFar: number = 0,
  activityCategory: "services" | "commerce_industrie" | "artisanat" = "services",
  customRate?: number,
  customCeiling?: number
): TaxCalculationResult {
  // Find applicable versioned rule
  const rule = OFFICIAL_TAX_RULES.find((r) => r.activityCategory === activityCategory) || OFFICIAL_TAX_RULES[0];

  const rate = customRate !== undefined ? customRate : rule.rate;
  const ceiling = customCeiling !== undefined ? customCeiling : rule.annualCeilingMAD;

  // Taxable base is capped at legal ceiling
  const taxableBase = Math.min(grossCollectedTurnover, ceiling);
  const estimatedTax = Math.round(taxableBase * rate * 100) / 100;
  const taxRemainingDue = Math.max(0, Math.round((estimatedTax - taxPaidSoFar) * 100) / 100);

  const ceilingRemaining = Math.max(0, ceiling - grossCollectedTurnover);
  const ceilingConsumedPct = Math.min(100, (grossCollectedTurnover / ceiling) * 100);
  const effectiveRatePct = grossCollectedTurnover > 0 ? (estimatedTax / grossCollectedTurnover) * 100 : rate * 100;

  const auditTrail: CalculationAuditTrail = {
    ruleId: rule.id,
    ruleName: rule.name,
    legalReference: rule.legalReference,
    article: rule.article,
    officialSourceUrl: rule.officialSourceUrl,
    effectiveFrom: rule.effectiveFrom,
    effectiveTo: rule.effectiveTo,
    verificationStatus: rule.verificationStatus,
    inputTurnover: grossCollectedTurnover,
    taxableBase,
    appliedRate: rate,
    calculatedAmount: estimatedTax,
    ceilingApplied: ceiling,
    ceilingRemaining,
    percentageOfCeiling: ceilingConsumedPct,
    singleClientWarning: false,
    notes: rule.description,
    timestamp: typeof window !== "undefined" ? new Date().toISOString() : "2026-11-03T00:00:00.000Z",
  };

  return {
    grossTurnover: grossCollectedTurnover,
    taxableBase,
    appliedRate: rate,
    estimatedTax,
    taxPaid: taxPaidSoFar,
    taxRemainingDue,
    annualCeiling: ceiling,
    ceilingRemaining,
    ceilingConsumedPct,
    effectiveRatePct,
    auditTrail,
    disclaimer:
      "⚠️ ESTIMATION CALCULÉE SELON L'ARTICLE 40 BIS DU CODE GÉNÉRAL DES IMPÔTS (CGI MAROC). Ce montant constitue une évaluation prévisionnelle de l'IR libératoire (1% sur chiffre d'affaires encaissé pour prestations de services). Les déclarations officielles doivent être déposées et acquittées via le portail rnve.ma.",
  };
}

/**
 * Calculates CNSS & AMO social contributions for independent workers (TNS).
 */
export function calculateMoroccanCNSS(
  contributionsPaidThisYear: number = 1800,
  quartersExpected: number = 4,
  customQuarterlyAmount?: number
): CNSSCalculationResult {
  const rule = OFFICIAL_CNSS_RULES[0];
  const quarterlyRate = customQuarterlyAmount !== undefined ? customQuarterlyAmount : rule.quarterlyAmount;
  const monthlyRate = Math.round(quarterlyRate / 3);

  const contributionsDueThisYear = quarterlyRate * quartersExpected;
  const contributionsRemainingDue = Math.max(0, contributionsDueThisYear - contributionsPaidThisYear);

  return {
    monthlyRate,
    quarterlyRate,
    contributionsDueThisYear,
    contributionsPaidThisYear,
    contributionsRemainingDue,
    coverageStatus: contributionsRemainingDue === 0 ? "Couverture active & à jour" : "Cotisation trimestrielle en attente",
    auditTrail: {
      ruleId: rule.id,
      ruleName: rule.name,
      legalReference: rule.legalReference,
      officialSourceUrl: rule.officialSourceUrl,
      verificationStatus: rule.verificationStatus,
      fixedQuarterlyAmount: quarterlyRate,
      hasAMO: true,
      hasPension: false,
      disclaimer:
        "⚠️ CONFORMITÉ LOI 98-15 TNS : Le paiement de l'Assurance Maladie Obligatoire (AMO) est obligatoire pour les auto-entrepreneurs au Maroc (600 MAD/trimestre). Il ne confère pas automatiquement de droits à la retraite CNSS sauf souscription volontaire séparée (Loi 99-15).",
    },
  };
}

/**
 * Generates an automated email notification template for fiscal and social deadlines.
 */
export function generateComplianceEmailTemplate(
  type: "tax_declaration" | "tax_payment" | "cnss_due" | "ceiling_alert" | "withholding_missing",
  data: {
    recipientName: string;
    period?: string;
    deadline?: string;
    amount?: number;
    turnover?: number;
    ceilingConsumedPct?: number;
    payerName?: string;
  }
): { subject: string; htmlBody: string; textBody: string } {
  const formatMADText = (num?: number) => (num !== undefined ? `${num.toLocaleString("fr-MA")} MAD` : "N/A");

  switch (type) {
    case "tax_declaration":
      return {
        subject: `[RealtorOS Maroc] Rappel d'échéance : Déclaration Fiscale ${data.period || "Trimestrielle"} DGI`,
        htmlBody: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px; background: #ffffff;">
            <div style="margin-bottom: 20px;">
              <span style="background: #eff6ff; color: #1e40af; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: bold;">RealtorOS Maroc • Fiscalité DGI</span>
            </div>
            <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Rappel : Votre déclaration fiscale approche</h2>
            <p style="color: #475569; font-size: 14px; line-height: 1.6;">
              Bonjour <strong>${data.recipientName}</strong>,
            </p>
            <p style="color: #475569; font-size: 14px; line-height: 1.6;">
              Une échéance légale de déclaration de votre chiffre d'affaires d'auto-entrepreneur arrive à son terme pour la période <strong>${data.period}</strong>.
            </p>
            <div style="background: #f8fafc; border-left: 4px solid #1e40af; padding: 14px; margin: 18px 0; border-radius: 4px;">
              <p style="margin: 4px 0; font-size: 13px; color: #334155;"><strong>Période concernée :</strong> ${data.period}</p>
              <p style="margin: 4px 0; font-size: 13px; color: #334155;"><strong>Date limite impérative :</strong> <span style="color: #b91c1c; font-weight: bold;">${data.deadline}</span></p>
              <p style="margin: 4px 0; font-size: 13px; color: #334155;"><strong>IR Estimé à acquitter (1%) :</strong> ${formatMADText(data.amount)}</p>
            </div>
            <p style="color: #475569; font-size: 13px; line-height: 1.5;">
              Veuillez vous connecter à votre espace <strong>Fiscalité & Protection Sociale</strong> sur RealtorOS pour valider les encaissements réels et enregistrer votre récépissé de télépaiement DGI / RNVE.
            </p>
            <div style="margin-top: 24px;">
              <a href="http://localhost:3000/dashboard/tax?tab=declarations" style="background: #1e40af; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-size: 13px; font-weight: bold; display: inline-block;">Accéder à ma Déclaration</a>
            </div>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="color: #94a3b8; font-size: 11px;">Ce message est généré automatiquement par votre système de gestion d'activité RealtorOS Maroc (Tanger).</p>
          </div>
        `,
        textBody: `Bonjour ${data.recipientName},\n\nRappel : votre déclaration fiscale pour ${data.period} est attendue avant le ${data.deadline}.\nMontant IR estimé (1%) : ${formatMADText(data.amount)}.\n\nConsultez votre espace Fiscalité sur RealtorOS pour valider l'opération.`,
      };

    case "cnss_due":
      return {
        subject: `[RealtorOS Maroc] Rappel de Cotisation AMO / CNSS (${data.period})`,
        htmlBody: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px; background: #ffffff;">
            <div style="margin-bottom: 20px;">
              <span style="background: #f0fdf4; color: #16a34a; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: bold;">RealtorOS Maroc • Protection Sociale CNSS/AMO</span>
            </div>
            <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Cotisation AMO trimestrielle à acquitter</h2>
            <p style="color: #475569; font-size: 14px; line-height: 1.6;">
              Bonjour <strong>${data.recipientName}</strong>,
            </p>
            <p style="color: #475569; font-size: 14px; line-height: 1.6;">
              Votre cotisation obligatoire d'assurance maladie (AMO pour Travailleurs Non Salariés) pour le <strong>${data.period}</strong> doit être réglée auprès de la CNSS.
            </p>
            <div style="background: #f8fafc; border-left: 4px solid #16a34a; padding: 14px; margin: 18px 0; border-radius: 4px;">
              <p style="margin: 4px 0; font-size: 13px; color: #334155;"><strong>Montant de la cotisation :</strong> <strong>${formatMADText(data.amount || 600)}</strong></p>
              <p style="margin: 4px 0; font-size: 13px; color: #334155;"><strong>Échéance limite :</strong> ${data.deadline}</p>
              <p style="margin: 4px 0; font-size: 13px; color: #334155;"><strong>Bénéfice :</strong> Maintien de l'ouverture des droits aux soins de santé pour vous et vos ayants droit.</p>
            </div>
            <div style="margin-top: 24px;">
              <a href="https://www.macnss.ma" style="background: #16a34a; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-size: 13px; font-weight: bold; display: inline-block;">Payer sur le portail MaCNSS</a>
            </div>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="color: #94a3b8; font-size: 11px;">RealtorOS Maroc • Module CNSS & AMO</p>
          </div>
        `,
        textBody: `Bonjour ${data.recipientName},\n\nVotre cotisation AMO pour ${data.period} (${formatMADText(data.amount || 600)}) est exigible au plus tard le ${data.deadline}.\nRéglez votre cotisation sur www.macnss.ma pour maintenir vos droits aux prestations de santé.`,
      };

    case "ceiling_alert":
      return {
        subject: `[RealtorOS Maroc] Alerte Plafond de Chiffre d'Affaires (${data.ceilingConsumedPct?.toFixed(1)}% atteint)`,
        htmlBody: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px; background: #ffffff;">
            <div style="margin-bottom: 20px;">
              <span style="background: #fffbeb; color: #d97706; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: bold;">Alerte Plafond Légal</span>
            </div>
            <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Consommation du Plafond Auto-Entrepreneur</h2>
            <p style="color: #475569; font-size: 14px; line-height: 1.6;">
              Votre chiffre d'affaires annuel encaissé s'élève actuellement à <strong>${formatMADText(data.turnover)}</strong>, soit <strong>${data.ceilingConsumedPct?.toFixed(1)}%</strong> du plafond légal de 500 000 MAD.
            </p>
            <p style="color: #475569; font-size: 13px;">
              En cas de dépassement durant deux années consécutives, la législation fiscale marocaine impose la transition vers le statut de personne morale (SARL). Nous vous conseillons d'anticiper avec votre expert-comptable.
            </p>
          </div>
        `,
        textBody: `Alerte Plafond : Chiffre d'affaires à ${formatMADText(data.turnover)} (${data.ceilingConsumedPct?.toFixed(1)}% du plafond de 500 000 MAD).`,
      };

    default:
      return {
        subject: `[RealtorOS Maroc] Notification de Conformité Légale`,
        htmlBody: `<p>Notification de rappel légal pour votre activité à Tanger.</p>`,
        textBody: `Notification de rappel légal pour votre activité à Tanger.`,
      };
  }
}
