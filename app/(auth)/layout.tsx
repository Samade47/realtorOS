import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Authentification',
    template: '%s — RealtorOS',
  },
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 50%, #f0f7ff 100%)' }}>
      {children}
    </div>
  )
}
