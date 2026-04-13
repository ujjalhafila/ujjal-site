import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "../components/ThemeProvider";
import { Analytics } from '@vercel/analytics/next';
import { Playfair_Display, DM_Mono, DM_Sans } from "next/font/google";

// Self-hosted via next/font — zero render-blocking, served from Vercel's CDN
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700", "900"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-sans",
  display: "swap",
});

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
    <html lang="en" suppressHydrationWarning
      className={`${playfair.variable} ${dmMono.variable} ${dmSans.variable}`}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <script dangerouslySetInnerHTML={{ __html: `(function(){var t=localStorage.getItem('uh-theme')||'auto';var d=document.documentElement;d.setAttribute('data-theme',t);if(t==='dark')d.classList.add('dark');else if(t==='light')d.classList.remove('dark');else if(window.matchMedia('(prefers-color-scheme: dark)').matches)d.classList.add('dark');})();` }} />
      </head>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <Analytics />
        <script dangerouslySetInnerHTML={{ __html: `
var obs=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)e.target.classList.add('visible');});},{threshold:0.08});
document.querySelectorAll('.reveal').forEach(function(el){obs.observe(el);});
        `}} />
      </body>
    </html>
  );
}
