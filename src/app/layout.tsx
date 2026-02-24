import { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../styles/globals.css'
import { AuthProvider } from '@/components/providers/AuthProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TakuraBid - Digital Freight Marketplace',
  description: 'Connecting clients with trusted truck drivers through transparent bidding and secure payments',
  keywords: ['freight', 'logistics', 'transport', 'Zimbabwe', 'trucks', 'shipping'],
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
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}