import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin', 'cyrillic'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'VoicePost — посты в вашем стиле',
  description: 'AI-сервис, который пишет посты так, как пишете вы',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className="dark">
      <body className={`${inter.variable} font-sans bg-canvas text-text-primary antialiased`}>
        {children}
      </body>
    </html>
  )
}
