"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
  wrapperClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      prefixIcon,
      suffixIcon,
      id,
      wrapperClassName,
      ...props
    },
    ref
  ) => {
    const inputId = id ?? React.useId();

    return (
      <div className={cn("flex flex-col gap-1.5", wrapperClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[var(--foreground)]"
          >
            {label}
            {props.required && (
              <span className="ml-0.5 text-[var(--danger)]" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}
        <div className="relative flex items-center">
          {prefixIcon && (
            <span className="pointer-events-none absolute left-3 flex items-center text-[var(--muted)]">
              {prefixIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full h-9 rounded-[var(--radius-sm)] border border-[var(--border)]",
              "bg-[var(--surface)] text-sm text-[var(--foreground)]",
              "px-3 placeholder:text-[var(--muted-foreground)]",
              "focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "transition-colors",
              prefixIcon && "pl-9",
              suffixIcon && "pr-9",
              error &&
                "border-[var(--danger)] focus:ring-[var(--danger)]",
              className
            )}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            {...props}
          />
          {suffixIcon && (
            <span className="pointer-events-none absolute right-3 flex items-center text-[var(--muted)]">
              {suffixIcon}
            </span>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="text-xs text-[var(--danger)]" role="alert">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={`${inputId}-helper`} className="text-xs text-[var(--muted)]">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
