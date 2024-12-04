import type { Metadata } from "next";
import { Quicksand, Overpass } from 'next/font/google';
import "./globals.css";
import AuthGuard from './components/AuthGuard';
import './sw'

const quicksand = Quicksand({
 subsets: ['latin'],
 weight: ['300', '400', '500', '600', '700'],
 variable: '--font-quicksand',
});

const overpass = Overpass({
 subsets: ['latin'],
 weight: ['300', '400', '500', '600', '700'],
 variable: '--font-overpass',
});

export const metadata: Metadata = {
 title: "Kielinuppu",
 description: "Sovellus ammattilaisille",
 manifest: '/manifest.json',
};

export const viewport = {
 themeColor: '#e9f1f3',
 width: 'device-width',
 initialScale: 1,
 maximumScale: 1,
 appleWebApp: {
   capable: true,
   statusBarStyle: 'default',
   title: 'Kielinuppu',
 },
};

export default function RootLayout({
 children,
}: Readonly<{
 children: React.ReactNode;
}>) {
 return (
   <html lang="fi">
     <head>
  <link rel="manifest" href="/manifest.json" />
  <meta name="theme-color" content="#e9f1f3" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  <meta name="apple-mobile-web-app-title" content="Kielinuppu" />
</head>
     <body className={`${quicksand.variable} ${overpass.variable}`}>
       <AuthGuard>
         {children}
       </AuthGuard>
     </body>
   </html>
 );
}