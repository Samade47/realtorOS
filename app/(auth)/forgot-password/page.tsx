"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Home, CheckCircle2, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const schema = z.object({
  email: z.string().email({ message: "Adresse e-mail valide requise" }),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(values: FormValues) {
    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
    });
    setSubmitted(true);
  }

  return (
    <div
      className="w-full max-w-md rounded-2xl shadow-xl p-8 sm:p-10"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <div className="flex flex-col items-center mb-6">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl mb-4"
          style={{ background: "var(--accent)" }}
        >
          <Home size={22} className="text-white" />
        </div>
        <h1 className="text-xl font-bold text-[var(--foreground)]">Réinitialisation du mot de passe</h1>
        <p className="text-xs text-[var(--muted)] text-center mt-1">
          Saisissez votre e-mail pour recevoir les instructions
        </p>
      </div>

      {submitted ? (
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--success-subtle)] text-[var(--success)]">
            <CheckCircle2 size={24} />
          </div>
          <p className="text-xs text-[var(--muted)]">
            Si un compte correspond à cette adresse, vous recevrez un e-mail de réinitialisation sous peu.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent)] hover:underline"
          >
            <ArrowLeft size={14} /> Retour à la connexion
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">
              Adresse e-mail
            </label>
            <input
              {...register("email")}
              type="email"
              placeholder="agent@realtoros.ma"
              className="w-full h-10 px-3.5 rounded-lg text-sm bg-[var(--surface)] border border-[var(--border)] focus:outline-none focus:border-[var(--accent)]"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-[var(--danger)]">{errors.email.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-10 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "var(--accent)" }}
          >
            Envoyer le lien de réinitialisation
          </button>

          <div className="text-center pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              <ArrowLeft size={13} /> Retour à la connexion
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
