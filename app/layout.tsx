import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import { ServiceWorkerRegistration } from '@/components/sw-registration'
import { ThemeInitializer } from '@/components/theme-initializer'
import { PlayerProvider } from '@/context/player-context'
import { PersistentYouTubePlayer } from '@/components/persistent-player'
import './globals.css'

export const metadata: Metadata = {
  title: 'Music Bar',
  description: 'ระบบจัดการเพลงและขอเพลงสำหรับร้าน',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Music Bar',
  },
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#111426',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="th" className="dark bg-background">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;500;600;700;800&family=Poppins:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        {/* Allow autoplay in background for iOS */}
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="font-sans antialiased min-h-screen">
        <PlayerProvider>
          <PersistentYouTubePlayer />
          <ThemeInitializer />
          <ServiceWorkerRegistration />
          {children}
        </PlayerProvider>
        <Toaster
          position="top-center"
          richColors
          theme="dark"
          toastOptions={{
            style: {
              background: '#111426',
              border: '1px solid rgb(106 92 255 / 0.28)',
            }
          }}
        />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
