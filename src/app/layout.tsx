import type { Metadata } from "next"
import { Space_Grotesk } from "next/font/google"

import { TooltipProvider } from "@/components/ui/tooltip"

import "./globals.css"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin-ext"],
})

export const metadata: Metadata = {
  title: "Bruschettoria OS",
  description: "Фінансова та операційна система Bruschettoria",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="uk">
      <body className={`${spaceGrotesk.className} antialiased`}>
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  )
}
