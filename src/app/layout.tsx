
import "./globals.css";
import SessionProviderComponent from "./components/SessionProviderComponent";
import { Metadata } from "next";
import Navigation from "./components/Navigation";


export const metadata: Metadata = {
  title: 'AiRox Pro',
  description: 'Tu planificador de entrenamiento inteligente para Hyrox.',
  manifest: '/manifest.json',
  icons: [
    { rel: 'apple-touch-icon', sizes: '120x120', url: '/icons/apple-touch-icon-120x120.png' },
    { rel: 'apple-touch-icon', url: '/icons/apple-touch-icon.png' },
  ],
  openGraph: {
    title: 'AiRox Pro',
    description: 'Tu planificador de entrenamiento inteligente para Hyrox.',
    url: 'https://hyrox-pro.vercel.app/login', // ✅ Pon tu URL pública
    siteName: 'AiRox Pro',
    images: [
      {
        url: '/icons/og-image.png', // ✅ Pon una imagen optimizada (1200x630)
        width: 1200,
        height: 630,
        alt: 'AiRox Pro - Planificador Hyrox',
      },
    ],
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AiRox Pro',
    description: 'Tu planificador de entrenamiento inteligente para Hyrox.',
    images: ['/icons/og-image.png'], // ✅ Mismo logo o imagen hero
    creator: '@juan_suarez', // Opcional
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        {/* Etiquetas meta para PWA que no van en el objeto metadata */}
        <meta name="theme-color" content="#111828" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body
      >
        <SessionProviderComponent>

          {children}
          {/* Aquí puedes agregar el componente de navegación si lo necesitas */}
          <Navigation />
        </SessionProviderComponent>
      </body>
    </html>
  );
}
