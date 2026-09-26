import { SerwistProvider } from "@serwist/turbopack/react";
import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { OfflineBanner } from "./_components/offline-banner";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  style: ["normal", "italic"],
  axes: ["opsz"],
  display: "swap",
});
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });

const TITLE = "Cardápio · Divino Fogão São Leopoldo";
const DESCRIPTION =
  "Cardápio digital do Divino Fogão – Comida da Fazenda, no Bourbon Shopping São Leopoldo: porções, parmegianas, pratos, bebidas e promoções.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? "http://localhost:3000"),
  title: TITLE,
  description: DESCRIPTION,
  applicationName: "Divino Fogão",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Divino Fogão" },
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Divino Fogão · Cardápio",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#6b1d22",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${fraunces.variable} ${manrope.variable}`}>
      <body className="min-h-dvh bg-bg font-sans text-ink antialiased">
        <SerwistProvider
          swUrl="/serwist/sw.js"
          disable={process.env.NODE_ENV === "development"}
          cacheOnNavigation
          reloadOnOnline={false}
        >
          {children}
          <OfflineBanner />
        </SerwistProvider>
      </body>
    </html>
  );
}
