"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeProvider";

function LinkedInIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zm2-5a2 2 0 110 4 2 2 0 010-4z"/></svg>; }
function GitHubIcon()   { return <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"/></svg>; }
function MailIcon()     { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>; }

const MONO = "'DM Mono', monospace";
const NAV_LINKS = [
  { label: "Work",  href: "/work",  tip: "Case studies and shipped projects" },
  { label: "Think", href: "/think", tip: "Essays, experiments and concepts"   },
  { label: "About", href: "/about", tip: "Background, focus areas and contact" },
] as const;
const NAV_COLORS = ["#FF4D6D", "#4DFFB4", "#4D9FFF"] as const;
const SOCIALS = [
  { href: "https://www.linkedin.com/in/ujjalhafila/", Icon: LinkedInIcon, label: "LinkedIn",           tip: "View LinkedIn profile"  },
  { href: "https://github.com/ujjalhafila",           Icon: GitHubIcon,   label: "GitHub",             tip: "View GitHub profile"    },
  { href: "mailto:ujjalhafila@gmail.com",             Icon: MailIcon,     label: "Email",              tip: "Send an email"          },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <nav style={{
        position:"fixed", top:0, left:0, right:0, zIndex:100,
        display:"flex", alignItems:"stretch", height:"52px",
        background:"var(--nav-bg)", borderBottom:"1px solid var(--rule)",
        backdropFilter:"blur(16px)", WebkitBackdropFilter:"blur(16px)",
      }}>
        {/* Home */}
        <Link href="/"
          aria-label="Home"
          data-tip="Home"
          style={{
            display:"flex", alignItems:"center", justifyContent:"center",
            padding:"0 16px",
            borderRight:"1px solid var(--rule)", textDecoration:"none",
            color:"var(--ink3)", flexShrink:0, width:"52px",
            transition:"color 0.2s",
          }}
          className="nav-home-link nav-tip"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"/>
            <polyline points="9,21 9,12 15,12 15,21"/>
          </svg>
        </Link>

        {/* Desktop nav links */}
        <div style={{ display:"flex", alignItems:"stretch" }} className="desktop-nav">
          {NAV_LINKS.map(({ label, href, tip }, i) => {
            const isActive = pathname === href || pathname.startsWith(String(href) + "/");
            return (
              <Link key={href} href={href}
                aria-label={`${label} — ${tip}`}
                data-tip={tip}
                className="nav-link nav-tip"
                style={{
                  display:"flex", alignItems:"center", padding:"0 20px",
                  fontFamily:MONO, fontSize:"12px",
                  color: isActive ? "var(--ink)" : "var(--ink2)",
                  borderRight:"1px solid var(--rule)", textDecoration:"none",
                  transition:"color 0.2s",
                  ["--nl-color" as string]: NAV_COLORS[i],
                }}>
                {label}
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div style={{ marginLeft:"auto", display:"flex", alignItems:"stretch" }}>
          {/* Socials — desktop */}
          <div style={{ display:"flex", alignItems:"stretch" }} className="desktop-nav">
            {SOCIALS.map(({ href, Icon, label, tip }) => (
              <a key={label} href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel="noopener"
                aria-label={tip}
                data-tip={tip}
                className="nav-tip"
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
          <div
            style={{ display:"flex", alignItems:"center", borderLeft:"1px solid var(--rule)", padding:"0 16px" }}
          >
            <ThemeToggle />
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setOpen(o => !o)}
            className="mobile-menu-btn nav-tip"
            aria-label={open ? "Close menu" : "Open navigation menu"}
            aria-expanded={open}
            data-tip={open ? "Close menu" : "Open navigation menu"}
            style={{
              display:"none", alignItems:"center", justifyContent:"center",
              padding:"0 16px", background:"none", border:"none",
              borderLeft:"1px solid var(--rule)", color:"var(--ink)",
              cursor:"pointer",
            }}>
            {open
              ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            }
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
          {NAV_LINKS.map(({ label, href }) => {
            const isActive = pathname === href || pathname.startsWith(String(href) + "/");
            return (
              <Link key={href} href={href} onClick={() => setOpen(false)}
                style={{
                  display:"block", fontFamily:MONO, fontSize:"12px",
                  letterSpacing:"1px", textTransform:"uppercase",
                  color: isActive ? "var(--ink)" : "var(--ink2)",
                  textDecoration:"none",
                  padding:"14px 24px", borderBottom:"1px solid var(--rule)",
                  transition:"color 0.2s, padding-left 0.2s",
                }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color="var(--ink)"; el.style.paddingLeft="32px"; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color=isActive?"var(--ink)":"var(--ink2)"; el.style.paddingLeft="24px"; }}>
                {label}
              </Link>
            );
          })}
          <div style={{ display:"flex", gap:0, borderBottom:"1px solid var(--rule)" }}>
            {SOCIALS.map(({ href, Icon, label, tip }) => (
              <a key={label} href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel="noopener"
                aria-label={tip}
                title={tip}
                style={{ display:"flex", alignItems:"center", padding:"14px 20px", color:"var(--ink3)", textDecoration:"none" }}>
                <Icon />
              </a>
            ))}
          </div>
        </div>
      )}

      <style>{`
        /* Per-link underline colour */
        .nav-home-link:hover { color: var(--ink) !important; }
        .nav-link::after { background: var(--nl-color, var(--ink)); }
        .nav-link:hover { color: var(--ink) !important; }

        @media (max-width: 768px) {
          .desktop-nav { display:none !important; }
          .mobile-menu-btn { display:flex !important; }
          /* No tooltips on touch */
          .nav-tip::after,
          .nav-tip::before,
          .nav-link.nav-tip::after,
          .nav-link.nav-tip::before { opacity: 0 !important; pointer-events: none; }
        }

        /* ── Custom tooltip ─────────────────────────────────────────────
           .nav-tip uses ::after for the bubble + ::before for the notch.
           Exception: .nav-link already uses ::after for the underline bar
           (defined in globals.css). For nav-links we flip the assignment:
           ::before = tooltip bubble, ::after = underline (globals wins).
        ──────────────────────────────────────────────────────────────── */
        .nav-tip { position: relative; }

        /* ── Default: tooltip bubble on ::after (home, socials, theme, hamburger) */
        .nav-tip:not(.nav-link)::after {
          content: attr(data-tip);
          position: absolute;
          top: calc(100% + 10px);
          left: 50%;
          transform: translateX(-50%) translateY(-4px);
          background: var(--ink);
          color: var(--bg);
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.08em;
          white-space: nowrap;
          padding: 5px 10px;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.15s ease 0s, transform 0.15s ease 0s;
          z-index: 9999;
        }
        /* Arrow notch on ::before */
        .nav-tip:not(.nav-link)::before {
          content: '';
          position: absolute;
          top: calc(100% + 5px);
          left: 50%;
          transform: translateX(-50%) translateY(-4px);
          border: 4px solid transparent;
          border-bottom-color: var(--ink);
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.15s ease 0s, transform 0.15s ease 0s;
          z-index: 9999;
        }
        /* Show after 600ms */
        .nav-tip:not(.nav-link):hover::after,
        .nav-tip:not(.nav-link):hover::before {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
          transition-delay: 0.6s;
        }

        /* ── Nav links: ::after = underline (globals); use a pseudo-wrapper via outline trick.
           We can't use ::after (taken) or ::before (would break layout).
           Solution: use a <span data-tip> child rendered via React inside the link,
           but that needs HTML changes. Simplest pure-CSS: use outline + clip-path tooltip
           via ::before positioned BELOW the underline baseline.
           Since ::before is available on .nav-link, use it for the bubble. */
        .nav-link.nav-tip::before {
          content: attr(data-tip);
          position: absolute;
          top: calc(100% + 10px); /* below the nav bar bottom edge */
          left: 50%;
          transform: translateX(-50%) translateY(-4px);
          background: var(--ink);
          color: var(--bg);
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.08em;
          white-space: nowrap;
          padding: 5px 10px;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.15s ease 0s, transform 0.15s ease 0s;
          z-index: 9999;
          /* Override any nav-link::before that may exist */
          border: none;
          height: auto; width: auto;
          border-radius: 0;
          background-clip: unset;
          -webkit-background-clip: unset;
        }
        /* No notch arrow for nav links (::after is taken by underline) */
        .nav-link.nav-tip:hover::before {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
          transition-delay: 0.6s;
        }
        /* Ensure underline ::after still works normally */
        .nav-link.nav-tip::after {
          content: '';
          /* Inherits position:absolute, bottom:0 etc from globals.css .nav-link::after */
        }

        /* Home icon: left-align tooltip so it doesn't go off-screen */
        .nav-home-link.nav-tip::after {
          left: 0;
          transform: translateX(0) translateY(-4px);
        }
        .nav-home-link.nav-tip::before {
          left: 16px;
          transform: translateX(0) translateY(-4px);
        }
        .nav-home-link.nav-tip:hover::after {
          transform: translateX(0) translateY(0);
          transition-delay: 0.6s;
        }
        .nav-home-link.nav-tip:hover::before {
          transform: translateX(0) translateY(0);
          transition-delay: 0.6s;
        }
      `}</style>
    </>
  );
}
