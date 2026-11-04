import * as React from "react";
import { CommissionsClient } from "@/components/commissions/commissions-client";

export default function CommissionsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <CommissionsClient />
    </div>
  );
}
