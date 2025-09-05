import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'QueryWing - AI Website Assistant',
  description: 'AI website assistant that answers from your content, captures leads, and hands off to your team.',
  keywords: ['AI chatbot', 'website assistant', 'lead generation', 'customer support'],
  authors: [{ name: 'QueryWing Team' }],
  creator: 'QueryWing',
  publisher: 'QueryWing',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://querywing.com',
    title: 'QueryWing - AI Website Assistant',
    description: 'AI website assistant that answers from your content, captures leads, and hands off to your team.',
    siteName: 'QueryWing',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QueryWing - AI Website Assistant',
    description: 'AI website assistant that answers from your content, captures leads, and hands off to your team.',
    creator: '@querywing',
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>

      </body>
    </html>
  )
}
