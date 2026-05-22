import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "../components/ThemeProvider";
import GlowProvider from "../components/GlowProvider";

export const metadata: Metadata = {
  title: { default: "Ujjal Hafila — Product Designer", template: "%s | Ujjal Hafila" },
  description: "Product designer who starts with Why. Building at the intersection of strategy, interaction design, and AI.",
  icons: [
    { rel: "icon", url: "/favicon.svg", type: "image/svg+xml" },
    { rel: "shortcut icon", url: "/favicon.svg" },
    { rel: "apple-touch-icon", url: "/favicon.svg" },
    { rel: "icon", url: "/favicon.ico", type: "image/x-icon", sizes: "16x16" },
  ],
  openGraph: {
    title: "Ujjal Hafila - Product Designer",
    description: "Case studies, essays, and experiments.",
    url: "https://ujjalhafila.com",
    type: "website",
  },
  twitter: { card: "summary", title: "Ujjal Hafila - Product Designer", description: "Case studies, essays, and experiments." },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,700;0,900;1,700;1,900&display=swap" rel="stylesheet" />
        {/* Init theme before paint — also sets html.light/html.dark for new token system */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){var t=localStorage.getItem('uh-theme')||'auto';var d=document.documentElement;d.setAttribute('data-theme',t);if(t==='dark'){d.classList.add('dark');}else if(t==='light'){d.classList.add('light');}else{var mq=window.matchMedia('(prefers-color-scheme: dark)');if(mq.matches)d.classList.add('dark');else d.classList.add('light');}})();` }} />
      </head>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
        {/* GlowProvider: attaches mousemove glow tracker on every page, survives client-side navigation */}
        <GlowProvider />
      </body>
    </html>
  );
}
