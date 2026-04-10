import Link from "next/link";
import Nav from "../components/Nav";

const S = { sans:"'DM Sans',sans-serif", mono:"'DM Mono',monospace" };

export default function NotFound() {
  return (
    <main style={{ minHeight:"100vh", display:"flex", flexDirection:"column" }}>
      <Nav />
      <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", padding:"6rem 2.5rem", textAlign:"center" }}>
        <div style={{ fontFamily:S.sans, fontSize:"clamp(6rem,15vw,12rem)", fontWeight:900, lineHeight:1, color:"transparent", WebkitTextStroke:"1px rgba(15,14,13,0.15)", marginBottom:"2rem", userSelect:"none" }}>
          404
        </div>
        <h1 style={{ fontFamily:S.sans, fontSize:"clamp(1.5rem,3vw,2.5rem)", fontWeight:700, letterSpacing:"-0.02em", marginBottom:"1rem" }}>
          Nothing here — yet.
        </h1>
        <p style={{ fontSize:"15px", color:"var(--muted)", maxWidth:"36ch", lineHeight:1.7, marginBottom:"2.5rem" }}>
          This page doesn't exist, or the content hasn't been published in Notion yet.
        </p>
        <Link href="/" style={{ display:"inline-flex", alignItems:"center", gap:"0.5rem", padding:"0.85rem 1.75rem", background:"var(--ink)", color:"var(--paper)", fontFamily:S.mono, fontSize:"12px", letterSpacing:"0.08em", textTransform:"uppercase", textDecoration:"none" }}>
          ← Back home
        </Link>
      </div>
    </main>
  );
}
