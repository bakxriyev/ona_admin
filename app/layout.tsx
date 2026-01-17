import type React from "react"
// ... existing code ...
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"


export const metadata: Metadata = {
  title: "Clinic Admin - Health Management System",
  description: "Admin panel for clinic management",
  generator: "IT ZONE "
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
