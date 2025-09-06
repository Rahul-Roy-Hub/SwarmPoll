import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import "@rainbow-me/rainbowkit/styles.css"
import { Providers } from "./providers"
import { Navbar } from "@/components/navbar"

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: "SwarmPoll - Social Prediction Game",
  description: "Predict what others will choose and win rewards from the collective wisdom",
  generator: "v0.app",
  icons: {
    icon: "/swarmpoll-logo.png",
    apple: "/swarmpoll-logo.png",
  },
  keywords: ["prediction markets", "social prediction", "blockchain", "staking", "rewards", "crowd wisdom"],
  authors: [{ name: "SwarmPoll Team" }],
  openGraph: {
    title: "SwarmPoll - Social Prediction Game",
    description: "Predict what others will choose and win rewards from the collective wisdom",
    type: "website",
    images: ["/swarmpoll-logo.png"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <Providers>
          <div className="min-h-screen bg-background">
            <Navbar />
            <main className="relative">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  )
}
