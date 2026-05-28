"use client";
export default function Footer() {
  return (
    <footer style={{
      borderTop:"1px solid var(--rule)",
      display:"flex", alignItems:"stretch",
      justifyContent:"space-between",
    }}>
      <span style={{
        fontFamily:"'DM Mono',monospace", fontSize:"11px", color:"var(--ink3)",
        padding:"14px 24px", display:"flex", alignItems:"center",
      }}>
        © {new Date().getFullYear()} Ujjal Hafila
      </span>
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="footer-link"
        style={{
          display:"flex", alignItems:"center", gap:"6px",
          fontFamily:"'DM Mono',monospace", fontSize:"11px",
          background:"none", border:"none", cursor:"pointer",
          padding:"0 24px", borderLeft:"1px solid var(--rule)",
        }}
        aria-label="Scroll to top"
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg>
        Top
      </button>
      <style>{`
        .footer-link { color: var(--ink3); transition: color 0.2s; }
        .footer-link:hover { color: var(--ink); }
      `}</style>
    </footer>
  );
}
