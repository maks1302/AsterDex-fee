import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Aster DEX fees Calculator',
    template: '%s | Aster DEX',
  },
  description: 'Calculate your trading savings with Aster DEX',
  applicationName: 'Aster DEX',
  keywords: [
    'Aster DEX',
    'DEX',
    'calculator',
    'crypto',
    'trading',
    'fees',
    'savings',
  ],
  authors: [{ name: 'Aster DEX' }],
  creator: 'Aster DEX',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Aster DEX fees Calculator',
    description: 'Calculate your trading savings with Aster DEX',
    url: '/',
    siteName: 'Aster DEX',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Aster DEX fees Calculator',
    description: 'Calculate your trading savings with Aster DEX',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/icon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
