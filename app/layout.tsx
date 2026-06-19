import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Saldo — Gestione finanziaria personale',
  description: 'Traccia entrate, uscite e budget in modo semplice e sicuro.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-paper text-ink font-body antialiased">{children}</body>
    </html>
  )
}
