// Moroccan Tax Rules Engine
// All rates and thresholds are stored here and versioned.
// IMPORTANT: Always label outputs as ESTIMATES. Consult a tax professional.

export interface TaxRule {
  id: string;
  name: string;
  legalReference: string;
  effectiveFrom: string; // ISO date
  effectiveTo: string | null; // null = still in effect
  activityCategory: string[];
  rate: number; // decimal, e.g. 0.01 = 1%
  threshold: number | null; // MAD, annual turnover ceiling
  calculationMethod: "flat_rate_on_turnover" | "progressive" | "withholding";
  description: string;
  lastVerified: string; // ISO date
  verificationStatus: "verified" | "unverified" | "expired" | "pending_review";
  notes: string;
}

export interface TaxBracket {
  from: number;
  to: number | null;
  rate: number;
}

// Auto-entrepreneur IR rates (as of 2024 Finance Law - MUST be verified annually)
// Source: Direction Générale des Impôts (DGI) Morocco
export const AUTO_ENTREPRENEUR_RULES: TaxRule[] = [
  {
    id: "ae-ir-services-2023",
    name: "IR Auto-Entrepreneur — Prestations de services",
    legalReference: "Loi de Finances 2023 / Code Général des Impôts Art. 40bis",
    effectiveFrom: "2023-01-01",
    effectiveTo: null,
    activityCategory: ["services", "agence_immobiliere"],
    rate: 0.01, // 1% libératoire on turnover
    threshold: 500000, // MAD annual turnover ceiling
    calculationMethod: "flat_rate_on_turnover",
    description:
      "Taux IR libératoire de 1% appliqué au chiffre d'affaires brut encaissé. Plafond annuel de 500 000 MAD. Déclaration mensuelle ou trimestrielle.",
    lastVerified: "2024-01-01",
    verificationStatus: "verified",
    notes:
      "ESTIMATION UNIQUEMENT. Ce taux doit être confirmé auprès de la DGI ou d'un expert-comptable. Les règles fiscales marocaines peuvent changer annuellement.",
  },
];

// Single-client threshold (concentration of turnover)
// If >50% of turnover from one client, specific rules may apply
export const SINGLE_CLIENT_THRESHOLD_PCT = 0.5; // 50%

// Annual turnover ceiling for auto-entrepreneur (services)
export const AE_TURNOVER_CEILING_SERVICES = 500_000; // MAD

// Declaration frequencies
export type DeclarationFrequency = "monthly" | "quarterly";

export interface TaxEstimate {
  grossTurnover: number;
  applicableRate: number;
  estimatedTax: number;
  appliedRule: TaxRule;
  ceilingRemaining: number;
  isNearCeiling: boolean;
  isOverCeiling: boolean;
  disclaimer: string;
  calculatedAt: string;
}

/**
 * Calculate estimated auto-entrepreneur IR tax.
 * OUTPUT IS AN ESTIMATE — not a legal declaration.
 */
export function calculateAutoEntrepreneurIR(
  grossTurnoverCollected: number,
  activityCategory = "services",
  taxYear = new Date().getFullYear()
): TaxEstimate {
  const now = new Date().toISOString();
  
  // Find applicable rule
  const applicableRule = AUTO_ENTREPRENEUR_RULES.find((rule) => {
    const from = new Date(rule.effectiveFrom);
    const to = rule.effectiveTo ? new Date(rule.effectiveTo) : null;
    const yearStart = new Date(`${taxYear}-01-01`);
    return (
      from <= yearStart &&
      (!to || to >= yearStart) &&
      rule.activityCategory.includes(activityCategory)
    );
  });

  if (!applicableRule) {
    throw new Error(
      `Aucune règle fiscale trouvée pour la catégorie "${activityCategory}" en ${taxYear}. Consultez un expert-comptable.`
    );
  }

  const ceiling = applicableRule.threshold ?? AE_TURNOVER_CEILING_SERVICES;
  const taxableAmount = Math.min(grossTurnoverCollected, ceiling);
  const estimatedTax = taxableAmount * applicableRule.rate;
  const ceilingRemaining = Math.max(0, ceiling - grossTurnoverCollected);
  const isNearCeiling = ceilingRemaining < ceiling * 0.1;
  const isOverCeiling = grossTurnoverCollected > ceiling;

  return {
    grossTurnover: grossTurnoverCollected,
    applicableRate: applicableRule.rate,
    estimatedTax,
    appliedRule: applicableRule,
    ceilingRemaining,
    isNearCeiling,
    isOverCeiling,
    disclaimer:
      "⚠️ ESTIMATION UNIQUEMENT. Ce calcul est basé sur les règles connues et ne constitue pas une déclaration fiscale officielle. Consultez un expert-comptable agréé pour votre situation spécifique.",
    calculatedAt: now,
  };
}

/**
 * Calculate declaration deadlines based on frequency.
 * Monthly: due by the 31st of the following month.
 * Quarterly: due by the 31st of the month following the quarter.
 */
export function getNextDeclarationDeadline(
  frequency: DeclarationFrequency,
  referenceDate = new Date()
): { period: string; dueDate: Date; periodLabel: string } {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth(); // 0-indexed

  if (frequency === "monthly") {
    // Next month's declaration
    const nextMonth = month + 1;
    const nextYear = nextMonth > 11 ? year + 1 : year;
    const adjustedMonth = nextMonth % 12;
    const dueDate = new Date(nextYear, adjustedMonth + 1, 0); // last day of next month
    return {
      period: `${year}-${String(month + 1).padStart(2, "0")}`,
      dueDate,
      periodLabel: new Date(year, month).toLocaleDateString("fr-MA", {
        month: "long",
        year: "numeric",
      }),
    };
  } else {
    // Quarterly
    const quarter = Math.floor(month / 3);
    const nextQuarterStart = (quarter + 1) * 3;
    const nextYear = nextQuarterStart > 11 ? year + 1 : year;
    const adjustedStart = nextQuarterStart % 12;
    const dueDate = new Date(nextYear, adjustedStart + 1, 0);
    const quarterLabels = ["T1", "T2", "T3", "T4"];
    return {
      period: `${year}-Q${quarter + 1}`,
      dueDate,
      periodLabel: `${quarterLabels[quarter]} ${year}`,
    };
  }
}

/**
 * Check single-client concentration.
 */
export function checkSingleClientConcentration(
  totalTurnover: number,
  clientTurnover: Record<string, number>
): Array<{ clientId: string; amount: number; pct: number; exceedsThreshold: boolean }> {
  if (totalTurnover === 0) return [];
  return Object.entries(clientTurnover).map(([clientId, amount]) => {
    const pct = amount / totalTurnover;
    return {
      clientId,
      amount,
      pct,
      exceedsThreshold: pct > SINGLE_CLIENT_THRESHOLD_PCT,
    };
  });
}
