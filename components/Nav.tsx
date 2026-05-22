"use client";
import Link from "next/link";
import { useState } from "react";
import { ThemeToggle } from "./ThemeProvider";

function LinkedInIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zm2-5a2 2 0 110 4 2 2 0 010-4z"/></svg>; }
function GitHubIcon()   { return <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"/></svg>; }
function MailIcon()     { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>; }

const MONO = "'DM Mono', monospace";
const NAV_LINKS  = [["Work","/work"],["Think","/think"],["About","/about"]] as const;
const NAV_COLORS = ["#FF4D6D","#4DFFB4","#4D9FFF"] as const;
const SOCIALS = [
  { href:"https://www.linkedin.com/in/ujjalhafila/", Icon:LinkedInIcon, label:"LinkedIn" },
  { href:"https://github.com/ujjalhafila",           Icon:GitHubIcon,   label:"GitHub"   },
  { href:"mailto:ujjalhafila@gmail.com",             Icon:MailIcon,     label:"Email"    },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav style={{
        position:"fixed", top:0, left:0, right:0, zIndex:100,
        display:"flex", alignItems:"stretch", height:"52px",
        background:"var(--nav-bg)", borderBottom:"1px solid var(--rule)",
        backdropFilter:"blur(16px)", WebkitBackdropFilter:"blur(16px)",
      }}>
        {/* Logo */}
        <Link href="/" style={{
          display:"flex", alignItems:"center", padding:"0 24px",
          fontFamily:MONO, fontSize:"13px", color:"var(--ink)",
          borderRight:"1px solid var(--rule)", textDecoration:"none",
          letterSpacing:"0.3px", flexShrink:0,
        }}>
          Ujjal Hafila
        </Link>

        {/* Desktop nav links */}
        <div style={{ display:"flex", alignItems:"stretch" }} className="desktop-nav">
          {NAV_LINKS.map(([label, href], i) => (
            <Link key={href} href={href}
              className="nav-link"
              style={{
                display:"flex", alignItems:"center", padding:"0 20px",
                fontFamily:MONO, fontSize:"12px", color:"var(--ink2)",
                borderRight:"1px solid var(--rule)", textDecoration:"none",
                transition:"color 0.2s",
                /* override nav-link::after colour per index */
                ["--nl-color" as string]: NAV_COLORS[i],
              }}>
              {label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div style={{ marginLeft:"auto", display:"flex", alignItems:"stretch" }}>
          {/* Socials — desktop */}
          <div style={{ display:"flex", alignItems:"stretch" }} className="desktop-nav">
            {SOCIALS.map(({ href, Icon, label }) => (
              <a key={label} href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel="noopener" aria-label={label}
                style={{
                  display:"flex", alignItems:"center", padding:"0 16px",
                  color:"var(--ink3)", borderLeft:"1px solid var(--rule)",
                  textDecoration:"none", transition:"color 0.2s",
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--ink)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--ink3)"}>
                <Icon />
              </a>
            ))}
          </div>

          {/* Theme toggle */}
          <div style={{ display:"flex", alignItems:"center", borderLeft:"1px solid var(--rule)", padding:"0 16px" }}>
            <ThemeToggle />
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setOpen(o => !o)}
            className="mobile-menu-btn"
            style={{
              display:"none", alignItems:"center", justifyContent:"center",
              padding:"0 16px", background:"none", border:"none",
              borderLeft:"1px solid var(--rule)", color:"var(--ink)",
              cursor:"pointer", fontFamily:MONO, fontSize:"16px",
            }}
            aria-label="Menu">
            {open ? "✕" : "☰"}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div style={{
          position:"fixed", top:"52px", left:0, right:0, zIndex:99,
          background:"var(--bg)", borderBottom:"1px solid var(--rule)",
          animation:"fadeIn 0.15s ease",
        }}>
          {NAV_LINKS.map(([label, href]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              style={{
                display:"block", fontFamily:MONO, fontSize:"12px",
                letterSpacing:"1px", textTransform:"uppercase",
                color:"var(--ink2)", textDecoration:"none",
                padding:"14px 24px", borderBottom:"1px solid var(--rule)",
                transition:"color 0.2s, padding-left 0.2s",
              }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color="var(--ink)"; el.style.paddingLeft="32px"; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color="var(--ink2)"; el.style.paddingLeft="24px"; }}>
              {label}
            </Link>
          ))}
          <div style={{ display:"flex", gap:0, borderBottom:"1px solid var(--rule)" }}>
            {SOCIALS.map(({ href, Icon, label }) => (
              <a key={label} href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel="noopener" aria-label={label}
                style={{ display:"flex", alignItems:"center", padding:"14px 20px", color:"var(--ink3)", textDecoration:"none" }}>
                <Icon />
              </a>
            ))}
          </div>
        </div>
      )}

      <style>{`
        /* per-link underline colour */
        .nav-link::after { background: var(--nl-color, var(--ink)); }
        .nav-link:hover { color: var(--ink) !important; }
        @media (max-width: 768px) {
          .desktop-nav { display:none !important; }
          .mobile-menu-btn { display:flex !important; }
        }
      `}</style>
    </>
  );
}
