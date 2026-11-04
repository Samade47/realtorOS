import * as React from "react";
import { FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  className?: string;
}

export function EmptyState({
  icon = <FolderOpen size={32} className="text-[var(--muted)]" />,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-[var(--radius)] border border-dashed border-[var(--border)] p-12 text-center",
        className
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--border-subtle)]">
        {icon}
      </div>
      <h3 className="mt-4 text-sm font-semibold text-[var(--foreground)]">{title}</h3>
      {description && (
        <p className="mt-1 text-xs text-[var(--muted)] max-w-sm">{description}</p>
      )}
      {action && (
        <div className="mt-6">
          <Button
            size="sm"
            onClick={action.onClick}
            leftIcon={action.icon}
          >
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
}
