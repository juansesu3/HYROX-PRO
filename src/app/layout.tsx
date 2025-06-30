
import "./globals.css";
import SessionProviderComponent from "./components/SessionProviderComponent";
import { Metadata } from "next";


export const metadata: Metadata = {
  title: 'AiRox Pro',
  description: 'Tu planificador de entrenamiento inteligente para Hyrox.',
  manifest: '/manifest.json', // ¡LÍNEA AÑADIDA!
  icons: [
    { rel: 'apple-touch-icon', sizes: '120x120', url: '/icons/apple-touch-icon-120x120.png' },
    { rel: 'apple-touch-icon', url: '/icons/apple-touch-icon.png' }
  ],
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
        </SessionProviderComponent>
      </body>
    </html>
  );
}
