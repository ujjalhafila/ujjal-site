import Link from "next/link";

export default function Footer() {
  return (
    <footer style={{
      display:"flex",alignItems:"center",justifyContent:"space-between",
      padding:"1.5rem 2.5rem",borderTop:"1px solid var(--border)"
    }}>
      <span style={{ fontFamily:"'DM Mono',monospace",fontSize:"11px",letterSpacing:"0.08em",color:"var(--muted)" }}>
        © {new Date().getFullYear()} Ujjal Hafila. All work is original.
      </span>
      <a href="#" style={{ fontFamily:"'DM Mono',monospace",fontSize:"11px",letterSpacing:"0.08em",textTransform:"uppercase",color:"var(--muted)",textDecoration:"none" }}>
        Back to top ↑
      </a>
    </footer>
  );
}
