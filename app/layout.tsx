import '@/app/styles/globals.css'
import type { Metadata } from 'next'

const siteUrl = process.env.SITE_URL || 'http://127.0.0.1:3001'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'OMEGA — Human-led cognitive infrastructure',
  description: 'Clarity, reasoning, and simplification for complex technical domains — without autonomy, persuasion, or decision substitution.',
  openGraph: {
    title: 'OMEGA — Human-led cognitive infrastructure',
    description: 'Clarity, reasoning, and simplification for complex technical domains — without autonomy, persuasion, or decision substitution.',
    url: siteUrl,
    type: 'website',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'OMEGA — Human-led cognitive infrastructure',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OMEGA — Human-led cognitive infrastructure',
    description: 'Clarity, reasoning, and simplification for complex technical domains — without autonomy, persuasion, or decision substitution.',
    images: ['/og.png'],
  },
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
