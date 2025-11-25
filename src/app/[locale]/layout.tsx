// src/app/[locale]/layout.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";

import { routing } from "@/i18n/routing";
import SessionProviderComponent from "@/app/components/SessionProviderComponent";
import Navigation from "@/app/components/Navigation";

import "@/app/globals.css";
import AppProviders from "../components/Providers/ReducProvider";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

// ✅ Generar rutas estáticas para cada locale soportado
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// ✅ Metadata (lo que tenías en RootLayout)
export const metadata: Metadata = {
  title: "AiRox Pro",
  description: "Tu planificador de entrenamiento inteligente para Hyrox.",
  manifest: "/manifest.json",
  icons: [
    {
      rel: "apple-touch-icon",
      sizes: "120x120",
      url: "/icons/apple-touch-icon-120x120.png",
    },
    { rel: "apple-touch-icon", url: "/icons/apple-touch-icon.png" },
  ],
  openGraph: {
    title: "AiRox Pro",
    description: "Tu planificador de entrenamiento inteligente para Hyrox.",
    url: "https://hyrox-pro.vercel.app/login",
    siteName: "AiRox Pro",
    images: [
      {
        url: "/icons/og-image.png",
        width: 1200,
        height: 630,
        alt: "AiRox Pro - Planificador Hyrox",
      },
    ],
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AiRox Pro",
    description: "Tu planificador de entrenamiento inteligente para Hyrox.",
    images: ["/icons/og-image.png"],
    creator: "@juan_suarez",
  },
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  // Si el locale no es válido -> 404
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Habilitar static rendering para este locale
  setRequestLocale(locale);

  return (
    <html lang={locale}>
      <head>
        {/* Etiquetas meta PWA adicionales */}
        <meta name="theme-color" content="#111828" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body>

        <SessionProviderComponent>
          <AppProviders>

          {/* Aquí, más adelante, podrás envolver con NextIntlClientProvider
              cuando carguemos los mensajes */}
          <Navigation />
          {children}
          </AppProviders>
        </SessionProviderComponent>
      </body>
    </html>
  );
}
