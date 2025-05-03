import { type Metadata } from 'next'
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'AirLog',
  description: 'Track your flights',
  icons: {
    icon: '/airplane.png'
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <header className="flex justify-end items-center p-4 gap-4 h-16">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="rounded-md px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-500 hover:scale-105 transition-all">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="rounded-md px-4 py-2 text-sm font-medium bg-white text-blue-600 border border-blue-600 hover:bg-blue-100 hover:scale-105 hover:border-blue-500 transition-all">
                  Sign Up
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}