import type { Metadata } from "next"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/providers/theme-provider"
import { AuthProvider } from "@/providers/auth-provider"
import { OrderProvider } from "@/context/OrderContext"

export const metadata: Metadata = {
  title: "WashLab - Campus Laundry Made Easy",
  description:
    "Wash. Dry. Fold. Done. Professional laundry service for campus life.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthProvider>
          <OrderProvider>
            <ThemeProvider
              attribute='class'
              defaultTheme='system'
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <Toaster />
            </ThemeProvider>
          </OrderProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
