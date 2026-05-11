import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Frankly | Selection Blueprint',
  description: 'Precision-engineered audits for high-stakes applications.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-[#E2E8E4] selection:text-[#2D2D2D]">
        {children}
      </body>
    </html>
  )
}