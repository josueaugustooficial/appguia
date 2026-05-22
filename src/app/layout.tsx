import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Farol — O guia que sua família precisava",
  description: "App de apoio para pais e mães de crianças com processamento sensorial intenso. Modo SOS, rotinas visuais, diário de comportamentos e muito mais.",
  keywords: ["autismo", "TEA", "processamento sensorial", "meltdown", "rotinas visuais", "passaporte sensorial"],
  authors: [{ name: "A7 Creative" }],
  creator: "A7 Creative",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Farol",
  },
  openGraph: {
    title: "Farol — O guia que sua família precisava",
    description: "App de apoio para pais de crianças com processamento sensorial intenso.",
    url: "https://guia.a7creative.com.br",
    siteName: "Farol App",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Farol App",
    description: "O guia que sua família precisava.",
  },
};

export const viewport: Viewport = {
  themeColor: "#F59E0B",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,700;0,9..144,900;1,9..144,700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap"
          rel="stylesheet"
        />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
