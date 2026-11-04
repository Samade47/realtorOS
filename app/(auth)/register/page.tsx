"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, Home } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const registerSchema = z
  .object({
    fullName: z.string().min(2, { message: "Le nom complet est requis" }),
    email: z.string().email({ message: "Adresse e-mail invalide" }),
    password: z.string().min(8, { message: "Au moins 8 caractères requis" }),
    confirmPassword: z.string().min(1, { message: "Confirmez votre mot de passe" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(values: RegisterFormValues) {
    setServerError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          full_name: values.fullName,
        },
      },
    });

    if (error) {
      setServerError(error.message || "Erreur lors de la création du compte.");
      return;
    }

    router.push("/dashboard/overview");
  }

  return (
    <div
      className="w-full max-w-md rounded-2xl shadow-xl p-8 sm:p-10"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <div className="flex flex-col items-center mb-8">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl mb-4"
          style={{ background: "var(--accent)" }}
        >
          <Home size={22} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">
          RealtorOS Maroc
        </h1>
        <p className="text-sm text-[var(--muted)] text-center mt-1">
          Créez votre compte agent immobilier
        </p>
      </div>

      {serverError && (
        <div
          className="mb-6 p-3.5 rounded-lg text-xs font-medium"
          style={{
            background: "var(--danger-subtle)",
            color: "var(--danger)",
            border: "1px solid var(--danger)",
          }}
        >
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">
            Nom & Prénom
          </label>
          <input
            {...register("fullName")}
            placeholder="Ex: Badr El Mansouri"
            className="w-full h-10 px-3.5 rounded-lg text-sm bg-[var(--surface)] border border-[var(--border)] focus:outline-none focus:border-[var(--accent)]"
          />
          {errors.fullName && (
            <p className="mt-1 text-xs text-[var(--danger)]">{errors.fullName.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">
            Adresse e-mail professionnelle
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

        <div>
          <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">
            Mot de passe
          </label>
          <div className="relative">
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="w-full h-10 px-3.5 pr-10 rounded-lg text-sm bg-[var(--surface)] border border-[var(--border)] focus:outline-none focus:border-[var(--accent)]"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-2.5 text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-[var(--danger)]">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">
            Confirmer le mot de passe
          </label>
          <input
            {...register("confirmPassword")}
            type="password"
            placeholder="••••••••"
            className="w-full h-10 px-3.5 rounded-lg text-sm bg-[var(--surface)] border border-[var(--border)] focus:outline-none focus:border-[var(--accent)]"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-[var(--danger)]">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-10 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 mt-2 flex items-center justify-center gap-2"
          style={{ background: "var(--accent)" }}
        >
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          Créer mon compte
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-[var(--muted)]">
        Déjà un compte ?{" "}
        <Link href="/login" className="font-semibold text-[var(--accent)] hover:underline">
          Se connecter
        </Link>
      </div>
    </div>
  );
}
