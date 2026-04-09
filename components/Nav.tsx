"use client";
import Link from "next/link";
import { useState } from "react";
import { ThemeToggle } from "./ThemeProvider";

const S = { mono:"'DM Mono',monospace" };

function LinkedInIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zm2-5a2 2 0 110 4 2 2 0 010-4z"/></svg>;
}
function GitHubIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"/></svg>;
}
function MailIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
}

export default function Nav() {
  const [open, setOpen] = useState(false);
  const links = [["Work","/work"],["Think","/think"],["Achievements","/achievements"]];
  const socials = [
    { href:"https://www.linkedin.com/in/ujjalhafila/", Icon:LinkedInIcon, label:"LinkedIn" },
    { href:"https://github.com/ujjalhafila", Icon:GitHubIcon, label:"GitHub" },
    { href:"mailto:ujjalhafila@gmail.com", Icon:MailIcon, label:"Email" },
  ];

  return (
    <>
      <nav style={{ position:"fixed",top:0,left:0,right:0,zIndex:100, display:"flex",alignItems:"center",justifyContent:"space-between", padding:"1rem 2rem", backdropFilter:"blur(12px)", background:"var(--nav-bg)", borderBottom:"1px solid var(--border)", gap:"1rem" }}>
        <Link href="/" style={{ fontFamily:S.mono,fontSize:"13px",letterSpacing:"0.05em",color:"var(--ink)",textDecoration:"none",fontWeight:500 }}>
          UH<span style={{ color:"var(--accent)" }}>.</span>
        </Link>

        {/* Desktop nav */}
        <div style={{ display:"flex",alignItems:"center",gap:"1.5rem",flex:1,justifyContent:"center" }} className="desktop-nav">
          {links.map(([label,href])=>(
            <Link key={href} href={href} style={{ fontFamily:S.mono,fontSize:"11px",letterSpacing:"0.1em",color:"var(--muted)",textDecoration:"none",textTransform:"uppercase",transition:"color 0.2s" }}>
              {label}
            </Link>
          ))}
        </div>

        <div style={{ display:"flex",alignItems:"center",gap:"0.75rem" }}>
          {/* Social icons */}
          <div style={{ display:"flex",alignItems:"center",gap:"0.5rem" }} className="desktop-nav">
            {socials.map(({href,Icon,label})=>(
              <a key={label} href={href} target={href.startsWith("http")?"_blank":undefined} rel="noopener" aria-label={label}
                style={{ color:"var(--muted)",display:"flex",alignItems:"center",transition:"color 0.2s",padding:"4px" }}>
                <Icon />
              </a>
            ))}
          </div>
          <ThemeToggle />
          {/* Hamburger */}
          <button onClick={()=>setOpen(o=>!o)} className="mobile-menu-btn"
            style={{ background:"none",border:"none",cursor:"pointer",color:"var(--ink)",padding:"4px",display:"none" }}
            aria-label="Menu">
            {open ? "✕" : "☰"}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div style={{ position:"fixed",top:"57px",left:0,right:0,zIndex:99, background:"var(--paper)",borderBottom:"1px solid var(--border)",padding:"1rem 2rem",display:"flex",flexDirection:"column",gap:"1rem" }}
          className="mobile-menu">
          {links.map(([label,href])=>(
            <Link key={href} href={href} onClick={()=>setOpen(false)}
              style={{ fontFamily:S.mono,fontSize:"13px",letterSpacing:"0.1em",color:"var(--ink)",textDecoration:"none",textTransform:"uppercase",padding:"0.5rem 0",borderBottom:"1px solid var(--border)" }}>
              {label}
            </Link>
          ))}
          <div style={{ display:"flex",gap:"1rem",paddingTop:"0.5rem" }}>
            {socials.map(({href,Icon,label})=>(
              <a key={label} href={href} target={href.startsWith("http")?"_blank":undefined} rel="noopener" aria-label={label}
                style={{ color:"var(--muted)",display:"flex",alignItems:"center" }}>
                <Icon />
              </a>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}
