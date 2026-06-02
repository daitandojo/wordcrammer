import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Outfit } from 'next/font/google'
import './globals.css'
import AuthSessionProvider from '@/components/session-provider'
import { ToastProvider } from '@/components/toast'
import { SoundProvider } from '@/components/sound-provider'
import { UserProvider } from '@/components/user-provider'
import Footer from '@/components/footer'
import { PageTransition } from '@/components/page-transition'
import MobileBottomNav from '@/components/mobile-bottom-nav'
import InstallPrompt from '@/components/install-prompt'
import ErrorBoundary from '@/components/error-boundary'
import OfflineBanner from '@/components/offline-banner'
import SwRegister from '@/components/sw-register'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
})

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'WordCrammer - Learn Languages with AI',
  description:
    'WordCrammer is a free AI-powered language learning app. Cram vocabulary in 20 languages with smart flash cards.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'WordCrammer',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    apple: '/icons/icon-192.svg',
  },
}

export const viewport: Viewport = {
  themeColor: '#0b1120',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable}`}>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
      </head>
      <body className="h-dvh overflow-hidden">
        <AuthSessionProvider>
          <UserProvider>
            <SoundProvider>
              <ToastProvider>
                <div className="h-dvh overflow-hidden">
                  <OfflineBanner />
                  <main className="h-dvh overflow-y-auto pb-16 md:pb-0">
                    <ErrorBoundary>
                      <PageTransition>{children}</PageTransition>
                    </ErrorBoundary>
                  </main>
                  <Footer />
                </div>
                <MobileBottomNav />
                <InstallPrompt />
              </ToastProvider>
            </SoundProvider>
          </UserProvider>
        </AuthSessionProvider>

        <SwRegister />
      </body>
    </html>
  )
}