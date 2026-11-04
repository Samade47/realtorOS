import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium leading-none shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--accent)] text-[var(--accent-foreground)]",
        success:
          "bg-[var(--success-subtle)] text-[var(--success)]",
        warning:
          "bg-[var(--warning-subtle)] text-[var(--warning)]",
        danger:
          "bg-[var(--danger-subtle)] text-[var(--danger)]",
        info:
          "bg-[var(--accent-subtle)] text-[var(--accent)]",
        outline:
          "border border-[var(--border)] bg-transparent text-[var(--muted)]",
        muted:
          "bg-[var(--border)] text-[var(--muted)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <span
          className="h-1.5 w-1.5 rounded-full bg-current"
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
