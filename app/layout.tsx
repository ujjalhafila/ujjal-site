import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ujjal Hafila — Product Designer",
  description: "I design systems that think — asking why before building what.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
      </head>
      <body>
        <div className="cursor" id="cursor" />
        {children}
        <script dangerouslySetInnerHTML={{ __html: `
          const cur = document.getElementById('cursor');
          if (cur) {
            document.addEventListener('mousemove', e => { cur.style.left=e.clientX+'px'; cur.style.top=e.clientY+'px'; });
            document.querySelectorAll('a,button').forEach(el => {
              el.addEventListener('mouseenter', () => cur.classList.add('big'));
              el.addEventListener('mouseleave', () => cur.classList.remove('big'));
            });
          }
          const obs = new IntersectionObserver(es => es.forEach(e => { if(e.isIntersecting) e.target.classList.add('visible'); }), {threshold:0.1});
          document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
        `}} />
      </body>
    </html>
  );
}
