import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "../components/ThemeProvider";

export const metadata: Metadata = {
  title: { default: "Ujjal Hafila — Product Designer", template: "%s | Ujjal Hafila" },
  description: "Product designer who starts with Why. Building at the intersection of strategy, interaction design, and AI.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: {
    title: "Ujjal Hafila — Product Designer",
    description: "Product designer who starts with Why.",
    url: "https://ujjal-site.vercel.app",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            var t=localStorage.getItem('uh-theme')||'auto';
            var d=document.documentElement;
            d.setAttribute('data-theme',t);
            if(t==='dark') d.classList.add('dark');
            else if(t==='light') d.classList.remove('dark');
            else if(window.matchMedia('(prefers-color-scheme: dark)').matches) d.classList.add('dark');
          })();
        `}} />
      </head>
      <body>
        <ThemeProvider>
          <div className="cursor" id="cursor" />
          {children}
        </ThemeProvider>
        <script dangerouslySetInnerHTML={{ __html: `
          var cur=document.getElementById('cursor');
          if(window.matchMedia('(pointer:fine)').matches && cur){
            document.body.classList.add('has-cursor');
            document.addEventListener('mousemove',function(e){cur.style.left=e.clientX+'px';cur.style.top=e.clientY+'px';});
            document.querySelectorAll('a,button').forEach(function(el){
              el.addEventListener('mouseenter',function(){cur.classList.add('big');});
              el.addEventListener('mouseleave',function(){cur.classList.remove('big');});
            });
          }
          var obs=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)e.target.classList.add('visible');});},{threshold:0.08});
          document.querySelectorAll('.reveal').forEach(function(el){obs.observe(el);});
        `}} />
      </body>
    </html>
  );
}
