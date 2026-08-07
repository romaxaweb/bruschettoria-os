import type { Metadata, Viewport } from "next"
import { Space_Grotesk } from "next/font/google"
import "./globals.css"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin-ext"],
})

export const metadata: Metadata = {
  title: "Bruschettoria OS",
  description: "Фінансова та операційна система Bruschettoria",

  applicationName: "Bruschettoria OS",

  appleWebApp: {
    capable: true,
    title: "Bruschettoria OS",
    statusBarStyle: "black-translucent",
  },

  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0b0908",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="uk"
      className="bg-[#0b0908]"
      suppressHydrationWarning
    >
      <body
        className={`${spaceGrotesk.className} min-h-[100dvh] bg-[#0b0908] antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
