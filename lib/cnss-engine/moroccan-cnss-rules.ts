// CNSS/AMO Rules Engine for Morocco
// Auto-entrepreneur / Travailleur Indépendant
// IMPORTANT: All amounts are ESTIMATES. Verify with CNSS portal.

export interface CNSSRule {
  id: string;
  name: string;
  legalReference: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  contributionType: "AMO" | "CNSS_PENSION" | "CNSS_PRESTATION_FAMILIALE" | "CNSS_TOTAL";
  applicableTo: "auto_entrepreneur" | "employee" | "employer";
  rate: number; // as decimal
  minimumContribution: number | null; // MAD per period
  maximumBasis: number | null; // MAD per month (plafond)
  frequency: "monthly" | "quarterly" | "annual";
  description: string;
  lastVerified: string;
  verificationStatus: "verified" | "unverified" | "pending_review";
  notes: string;
  portalUrl: string;
}

// NOTE: Rates must be verified with CNSS annually
// Source: www.cnss.ma
export const CNSS_AMO_RULES: CNSSRule[] = [
  {
    id: "amo-independant-2024",
    name: "AMO — Travailleur Non-Salarié (TNS)",
    legalReference: "Loi 65-00 relative à l'AMO, telle que modifiée",
    effectiveFrom: "2022-01-01",
    effectiveTo: null,
    contributionType: "AMO",
    applicableTo: "auto_entrepreneur",
    rate: 0.0, // TNS rate varies — must be configured by user after consulting CNSS
    minimumContribution: null,
    maximumBasis: null,
    frequency: "quarterly",
    description:
      "Assurance Maladie Obligatoire pour les travailleurs non-salariés. Le taux et la base de calcul dépendent du régime choisi et de la situation personnelle.",
    lastVerified: "2024-01-01",
    verificationStatus: "unverified",
    notes:
      "ESTIMATION UNIQUEMENT. Les modalités d'adhésion AMO pour auto-entrepreneurs sont en évolution. Consultez directement le site www.cnss.ma ou votre agence CNSS locale pour connaître votre situation exacte.",
    portalUrl: "https://www.cnss.ma",
  },
];

export interface CNSSEstimate {
  period: string;
  contributionBasis: number;
  amoContribution: number;
  cnssContribution: number;
  totalContribution: number;
  appliedRules: CNSSRule[];
  disclaimer: string;
  calculatedAt: string;
  requiresManualVerification: boolean;
}

/**
 * CNSS/AMO estimate for auto-entrepreneurs.
 * Because rates and eligibility vary widely and change frequently,
 * this function returns a placeholder that requires user configuration.
 */
export function calculateCNSSEstimate(
  userConfiguredContribution: number,
  period: string
): CNSSEstimate {
  return {
    period,
    contributionBasis: 0,
    amoContribution: userConfiguredContribution,
    cnssContribution: 0,
    totalContribution: userConfiguredContribution,
    appliedRules: CNSS_AMO_RULES,
    disclaimer:
      "⚠️ ESTIMATION BASÉE SUR LA CONFIGURATION UTILISATEUR. Les cotisations CNSS/AMO pour auto-entrepreneurs varient selon la situation personnelle, le régime choisi et les évolutions législatives. Consultez www.cnss.ma ou votre agence CNSS pour connaître vos obligations exactes.",
    calculatedAt: new Date().toISOString(),
    requiresManualVerification: true,
  };
}

export function getNextCNSSDeadline(
  frequency: "monthly" | "quarterly",
  referenceDate = new Date()
): Date {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();

  if (frequency === "monthly") {
    return new Date(year, month + 1, 31);
  } else {
    const quarter = Math.floor(month / 3);
    const nextQuarterMonth = (quarter + 1) * 3;
    return new Date(
      nextQuarterMonth > 11 ? year + 1 : year,
      nextQuarterMonth % 12 + 1,
      0
    );
  }
}
