import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "../components/ThemeProvider";

export const metadata: Metadata = {
  title: { default: "Ujjal Hafila — Product Designer", template: "%s | Ujjal Hafila" },
  description: "Product designer who starts with Why. Building at the intersection of strategy, interaction design, and AI.",
  icons: [
    { rel: "icon", url: "/favicon.svg", type: "image/svg+xml" },
    { rel: "shortcut icon", url: "/favicon.svg" },
    { rel: "apple-touch-icon", url: "/favicon.svg" },
  ],
  openGraph: {
    title: "Ujjal Hafila — Product Designer",
    description: "Product designer who starts with Why.",
    url: "https://ujjalhafila.com",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{ __html: `(function(){var t=localStorage.getItem('uh-theme')||'auto';var d=document.documentElement;d.setAttribute('data-theme',t);if(t==='dark')d.classList.add('dark');else if(t==='light')d.classList.remove('dark');else if(window.matchMedia('(prefers-color-scheme: dark)').matches)d.classList.add('dark');})();` }} />
      </head>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <script dangerouslySetInnerHTML={{ __html: `
var obs=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)e.target.classList.add('visible');});},{threshold:0.08});
document.querySelectorAll('.reveal').forEach(function(el){obs.observe(el);});
        `}} />
      </body>
    </html>
  );
}
