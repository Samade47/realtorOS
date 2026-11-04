import * as React from "react";
import { ContactsClient } from "@/components/crm/contacts-client";

export default function ContactsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <ContactsClient />
    </div>
  );
}
