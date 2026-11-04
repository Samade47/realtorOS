'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2, Building2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const loginSchema = z.object({
  email: z.string().email({ message: "Adresse e-mail invalide" }),
  password: z.string().min(1, { message: "Mot de passe requis" }),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(values: LoginFormValues) {
    setServerError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    })

    if (error) {
      if (error.message.toLowerCase().includes('invalid')) {
        setServerError("E-mail ou mot de passe incorrect. Veuillez réessayer.")
      } else if (error.message.toLowerCase().includes('confirmed')) {
        setServerError("Votre e-mail n'a pas encore été confirmé. Vérifiez votre boîte de réception.")
      } else {
        setServerError("Une erreur est survenue. Veuillez réessayer.")
      }
      return
    }

    router.push('/dashboard/overview')
    router.refresh()
  }

  return (
    <div
      className="w-full max-w-md rounded-2xl shadow-xl p-8 sm:p-10"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
          style={{ background: 'var(--accent)' }}
        >
          <Building2 className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>
          RealtorOS
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
          Gérez votre activité immobilière au Maroc
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {/* Server error */}
        {serverError && (
          <div
            className="text-sm px-4 py-3 rounded-lg"
            style={{ background: 'var(--danger-subtle)', color: 'var(--danger)', border: '1px solid #fecaca' }}
          >
            {serverError}
          </div>
        )}

        {/* Email */}
        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="text-sm font-medium"
            style={{ color: 'var(--foreground)' }}
          >
            Adresse e-mail
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="vous@exemple.com"
            {...register('email')}
            className={cn(
              'w-full px-3.5 py-2.5 rounded-lg text-sm transition-colors outline-none',
              'focus:ring-2'
            )}
            style={{
              background: 'var(--background)',
              border: `1px solid ${errors.email ? 'var(--danger)' : 'var(--border)'}`,
              color: 'var(--foreground)',
            }}
          />
          {errors.email && (
            <p className="text-xs" style={{ color: 'var(--danger)' }}>
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-sm font-medium"
              style={{ color: 'var(--foreground)' }}
            >
              Mot de passe
            </label>
            <Link
              href="/forgot-password"
              className="text-xs hover:underline"
              style={{ color: 'var(--accent)' }}
            >
              Mot de passe oublié ?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              {...register('password')}
              className="w-full px-3.5 py-2.5 pr-10 rounded-lg text-sm transition-colors outline-none"
              style={{
                background: 'var(--background)',
                border: `1px solid ${errors.password ? 'var(--danger)' : 'var(--border)'}`,
                color: 'var(--foreground)',
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded"
              style={{ color: 'var(--muted)' }}
              aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs" style={{ color: 'var(--danger)' }}>
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-opacity disabled:opacity-60"
          style={{
            background: 'var(--accent)',
            color: 'var(--accent-foreground)',
          }}
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {isSubmitting ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>

      {/* Footer */}
      <p className="mt-6 text-center text-sm" style={{ color: 'var(--muted)' }}>
        Pas encore de compte ?{' '}
        <Link
          href="/register"
          className="font-medium hover:underline"
          style={{ color: 'var(--accent)' }}
        >
          Créer un compte
        </Link>
      </p>
    </div>
  )
}
