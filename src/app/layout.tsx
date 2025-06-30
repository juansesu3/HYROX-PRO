import type { Metadata } from "next";

import "./globals.css";
import SessionProviderComponent from "./components/SessionProviderComponent";
import Head from "next/head";




export const metadata: Metadata = {
  title: "AiRox Pro App",
  description: "Tu planificador de entrenamiento inteligente para Hyrox.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
     <Head>
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* PWA Theme Color */}
        <meta name="theme-color" content="#111828" />

        {/* iOS Support */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />

        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" sizes="120x120" href="/icons/apple-touch-icon-120x120.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/apple-touch-icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon-180x180.png" />

        {/* Fallback Icon */}
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />

        {/* Android Icons (provided via manifest) */}
      </Head>
      <body
      >
        <SessionProviderComponent>
      
        {children}
        </SessionProviderComponent>
      </body>
    </html>
  );
}
