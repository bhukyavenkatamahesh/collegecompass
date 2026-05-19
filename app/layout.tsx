import type { Metadata, Viewport } from 'next'
import './globals.css'

export const viewport: Viewport = {
  themeColor: '#faf8f5',
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: 'CollegeCompass — GATE & JEE College Predictor (Official 2025 Cutoffs)',
  description:
    'Predict your M.Tech (GATE) and B.Tech (JEE Main/Advanced) college chances using official 2025 JoSAA, CSAB, COAP and CCMT cutoffs — with category, home-state quota and gender-pool rules.',
  keywords: ['GATE college predictor', 'JEE Main predictor', 'JEE Advanced', 'JoSAA 2025', 'CSAB', 'COAP', 'CCMT', 'NIT cutoff', 'IIT M.Tech'],
  openGraph: {
    title: 'CollegeCompass — GATE & JEE College Predictor',
    description: 'Real 2025 cutoff data. Category, quota and gender-aware predictions for IITs, NITs, IIITs & GFTIs.',
    type: 'website',
  },
  robots: { index: true, follow: true },
}



export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="anonymous" />
        <link href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
        <script src="https://checkout.razorpay.com/v1/checkout.js" async />
      </body>
    </html>
  )
}
