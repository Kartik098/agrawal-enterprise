import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AuthProvider } from '@/components/auth/auth-provider'

export const metadata: Metadata = {
  title: 'Agrawal Enterprise — Everyday essentials',
  description: 'Agrawal Enterprise commerce storefront and operations console for everyday essentials.',
}
export const viewport: Viewport = { colorScheme: 'light', themeColor: '#3b82c4' }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className="bg-background"><body><AuthProvider>{children}</AuthProvider>{process.env.NODE_ENV === 'production' && <Analytics />}</body></html>
}

