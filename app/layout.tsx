import './globals.css'

export const metadata = {
  title: 'Omega - Spine · Kernels · Policies',
  description: 'Safety-first decision kernels, policy packs, verified artifacts, and drift-lock regression',
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
