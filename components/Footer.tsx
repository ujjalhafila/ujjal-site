import Link from "next/link";

function LinkedInIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zm2-5a2 2 0 110 4 2 2 0 010-4z"/></svg>; }
function GitHubIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"/></svg>; }
function MailIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>; }
function PhoneIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.68A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.09 6.09l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/></svg>; }

const S = { mono:"'DM Mono',monospace" };

export default function Footer() {
  return (
    <footer style={{ borderTop:"1px solid var(--border)", padding:"1.75rem 2rem", display:"flex", flexWrap:"wrap", gap:"1.25rem", alignItems:"center", justifyContent:"space-between" }}>
      <span style={{ fontFamily:S.mono, fontSize:"11px", color:"var(--muted)", letterSpacing:"0.06em" }}>
        © {new Date().getFullYear()} Ujjal Hafila
      </span>
      <div style={{ display:"flex", gap:"1rem", alignItems:"center", flexWrap:"wrap" }}>
        {[
          { href:"https://www.linkedin.com/in/ujjalhafila/", Icon:LinkedInIcon, label:"LinkedIn" },
          { href:"https://github.com/ujjalhafila", Icon:GitHubIcon, label:"GitHub" },
          { href:"mailto:ujjalhafila@gmail.com", Icon:MailIcon, label:"Email" },
          { href:"tel:+917086116844", Icon:PhoneIcon, label:"+91 70861 16844" },
        ].map(({href,Icon,label})=>(
          <a key={label} href={href} target={href.startsWith("http")?"_blank":undefined} rel="noopener" aria-label={label}
            style={{ color:"var(--muted)", display:"flex", alignItems:"center", gap:"0.35rem", fontFamily:S.mono, fontSize:"11px", textDecoration:"none", transition:"color 0.2s" }}>
            <Icon />{label}
          </a>
        ))}
      </div>
      <a href="#" style={{ fontFamily:S.mono, fontSize:"11px", color:"var(--muted)", textDecoration:"none", letterSpacing:"0.08em" }}>↑ Top</a>
    </footer>
  );
}
