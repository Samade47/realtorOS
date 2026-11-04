import * as React from "react";
import { FiscaliteProtectionClient } from "@/components/tax/fiscalite-protection-client";

export const metadata = {
  title: "Fiscalité & Protection Sociale (CNSS/AMO) — RealtorOS Maroc",
  description: "Gestion complète de la conformité fiscale (IR 1%), du plafond annuel et des cotisations AMO pour auto-entrepreneur au Maroc.",
};

export default function FiscaliteProtectionPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <FiscaliteProtectionClient />
    </div>
  );
}
