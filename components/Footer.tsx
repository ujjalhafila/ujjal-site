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
      <a href="#" className="footer-link" style={{
        display:"flex", alignItems:"center",
        fontFamily:"'DM Mono',monospace", fontSize:"11px",
        textDecoration:"none", padding:"0 24px",
        borderLeft:"1px solid var(--rule)",
      }}>
        ↑ Top
      </a>
      <style>{`
        .footer-link { color: var(--ink3); transition: color 0.2s; }
        .footer-link:hover { color: var(--ink); }
      `}</style>
    </footer>
  );
}
