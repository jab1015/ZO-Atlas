import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Sans } from "next/font/google";
import { PostHogProvider } from "@/lib/posthog";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-ibm-plex-sans",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Atlas — The Operating System for Inventors",
  description: "Your AI executive team, from first idea to launch and growth.",
  themeColor: "#0A1628",
  icons: process.env.NEXT_PUBLIC_BRAND_LOGO
    ? { icon: process.env.NEXT_PUBLIC_BRAND_LOGO }
    : undefined,
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} ${ibmPlexSans.variable} font-body antialiased`}>
        <ConvexAuthNextjsServerProvider shouldHandleCode={true}>
          <PostHogProvider>
            {children}
            <Toaster />
          </PostHogProvider>
        </ConvexAuthNextjsServerProvider>
      </body>
    </html>
  );
}
