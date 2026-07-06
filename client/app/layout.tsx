import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import { SWRProvider } from '@/lib/swr-config'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'MedLembra',
  description: 'Gestão de medicamentos para idosos',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body>
        <SWRProvider>
          {children}
        </SWRProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
