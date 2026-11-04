"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

// ─── List ─────────────────────────────────────────────────────────────────────
const TabsList = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex items-center gap-1 border-b border-[var(--border)] w-full",
      className
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

// ─── Trigger ─────────────────────────────────────────────────────────────────
const TabsTrigger = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "relative inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium",
      "text-[var(--muted)] outline-none transition-colors cursor-pointer",
      "hover:text-[var(--foreground)]",
      "data-[state=active]:text-[var(--accent)]",
      // Active underline
      "after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-0.5",
      "after:rounded-full after:bg-transparent",
      "data-[state=active]:after:bg-[var(--accent)]",
      "focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:rounded-sm",
      "disabled:pointer-events-none disabled:opacity-50",
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

// ─── Content ─────────────────────────────────────────────────────────────────
const TabsContent = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-4 outline-none",
      "focus-visible:outline-2 focus-visible:outline-[var(--accent)]",
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
