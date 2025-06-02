import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { BookingPromptWrapper } from "@/components/booking-prompt-wrapper"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Pineapple Tours - Tropical Vacation Specialists",
  description:
    "Discover paradise with Pineapple Tours. We specialize in creating unforgettable tropical vacation experiences in Hawaii, the Caribbean, Fiji, and beyond.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
          <BookingPromptWrapper />
        </ThemeProvider>
      </body>
    </html>
  )
}
