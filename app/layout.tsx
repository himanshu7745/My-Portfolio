import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter, JetBrains_Mono } from "next/font/google";
import { profile } from "@/data/portfolio";
import { themeBootScript } from "@/lib/themes";
import "./globals.css";

const display = Bricolage_Grotesque({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-display" });
const sans = Inter({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-mono" });

const description =
  "Himanshu Mishra: software developer (backend & Android), Keycloak contributor, LeetCode Knight and Codeforces Specialist. B.E. IT at UIET, Panjab University.";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: `${profile.name} — ${profile.role}`,
  description,
  openGraph: {
    title: `${profile.name} — ${profile.role}`,
    description,
    images: [profile.avatar],
    type: "website",
  },
  twitter: { card: "summary", title: profile.name, description },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#121311",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="graphite" className={`${display.variable} ${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
