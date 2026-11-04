import * as React from "react";
import { CalendarClient } from "@/components/calendar/calendar-client";

export default function CalendarPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <CalendarClient />
    </div>
  );
}
