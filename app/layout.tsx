import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Nasi Ayam Haji Ali',
  description: 'Sistem Tempahan Meja Profesional',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ms">
      <body>{children}</body>
    </html>
  )
}
