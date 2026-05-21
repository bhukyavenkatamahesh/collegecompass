import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import { SessionProvider } from '@/components/session-provider'
import './globals.css'
import './animations.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '900'],
  display: 'swap',
})

export const viewport: Viewport = {
  themeColor: '#f8fafc',
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: 'CollegeCompass — GATE & JEE Rank Predictor 2026 (Official Cutoffs)',
  description:
    'Enter your GATE 2026 score or JEE 2026 rank. Predict your M.Tech and B.Tech college chances using official JoSAA, CSAB, COAP and CCMT cutoffs — with category, home-state quota and gender-pool rules.',
  keywords: [
    'GATE college predictor',
    'JEE Main predictor',
    'JEE Advanced',
    'JoSAA 2026',
    'CSAB',
    'COAP',
    'CCMT',
    'NIT cutoff',
    'IIT M.Tech',
  ],
  openGraph: {
    title: 'CollegeCompass — GATE & JEE Rank Predictor 2026',
    description:
      'Enter your 2026 rank or score. Category, quota and gender-aware predictions for IITs, NITs, IIITs & GFTIs.',
    type: 'website',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'CollegeCompass — GATE & JEE Rank Predictor 2026',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CollegeCompass — GATE & JEE Rank Predictor 2026',
    description:
      'Enter your 2026 rank or score. Category, quota and gender-aware predictions for IITs, NITs, IIITs & GFTIs.',
    images: ['/og.png'],
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className} data-scroll-behavior="smooth">
      <body>
        <SessionProvider>{children}</SessionProvider>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      </body>
    </html>
  )
}
