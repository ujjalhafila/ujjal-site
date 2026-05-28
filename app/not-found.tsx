import Link from "next/link";
import Nav from "../components/Nav";
import Footer from "../components/Footer";

const S = { serif:"'Playfair Display',Georgia,serif", sans:"'DM Sans',sans-serif", mono:"'DM Mono',monospace" };

export default function NotFound() {
  return (
    <main style={{ minHeight:"100vh", display:"flex", flexDirection:"column" }}>
      <Nav />
      <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", padding:"6rem 2.5rem", textAlign:"center" }}>

        {/* Outlined 404 */}
        <div style={{
          fontFamily: S.serif,
          fontSize: "clamp(6rem,18vw,14rem)",
          fontWeight: 900,
          lineHeight: 1,
          color: "transparent",
          WebkitTextStroke: "1px rgba(15,14,13,0.12)",
          // @ts-expect-error non-prefixed for completeness
          textStroke: "1px rgba(15,14,13,0.12)",
          marginBottom: "2rem",
          userSelect: "none",
          letterSpacing: "-0.04em",
          animation: "fadeIn 0.6s ease both",
        }}>
          404
        </div>

        <div style={{ animation:"fadeUp 0.6s ease 0.1s both" }}>
          <div style={{ fontFamily:S.mono, fontSize:"11px", letterSpacing:"0.15em", textTransform:"uppercase", color:"var(--accent)", marginBottom:"1.25rem", display:"flex", alignItems:"center", justifyContent:"center", gap:"0.75rem" }}>
            <span style={{ width:"24px", height:"1px", background:"var(--accent)", display:"block" }}/>
            Page not found
          </div>
          <h1 style={{ fontFamily:S.serif, fontSize:"clamp(1.5rem,3vw,2.5rem)", fontWeight:700, letterSpacing:"-0.02em", marginBottom:"1rem", lineHeight:1.2 }}>
            Nothing here — <em style={{ fontStyle:"italic", color:"var(--accent)" }}>yet.</em>
          </h1>
          <p style={{ fontFamily:S.sans, fontSize:"15px", color:"var(--muted)", maxWidth:"36ch", lineHeight:1.7, marginBottom:"2.5rem" }}>
            This page doesn't exist, or the content hasn't been published in Notion yet.
          </p>
          <Link href="/" className="btn-primary" style={{ display:"inline-flex", alignItems:"center", gap:"0.5rem" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
            Back home
          </Link>
        </div>
      </div>
      <Footer />
    </main>
  );
}
