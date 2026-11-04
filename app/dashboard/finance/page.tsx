import * as React from "react";
import { FinanceClient } from "@/components/finance/finance-client";

export default function FinancePage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <FinanceClient />
    </div>
  );
}
