import * as React from "react";
import { DocumentsClient } from "@/components/documents/documents-client";

export default function DocumentsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <DocumentsClient />
    </div>
  );
}
