import * as React from "react";
import { TransactionsClient } from "@/components/transactions/transactions-client";

export default function TransactionsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <TransactionsClient />
    </div>
  );
}
