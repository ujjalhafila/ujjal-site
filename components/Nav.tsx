import Link from "next/link";

export default function Nav() {
  return (
    <nav style={{
      position:"fixed",top:0,left:0,right:0,zIndex:100,
      display:"flex",alignItems:"center",justifyContent:"space-between",
      padding:"1.25rem 2.5rem",mixBlendMode:"multiply"
    }}>
      <Link href="/" style={{ fontFamily:"'DM Mono',monospace",fontSize:"13px",letterSpacing:"0.05em",color:"var(--ink)",textDecoration:"none" }}>
        UH / Portfolio
      </Link>
      <div style={{ display:"flex",gap:"2rem" }}>
        {[["Work","/work"],["Think","/think"]].map(([label,href])=>(
          <Link key={href} href={href} style={{
            fontFamily:"'DM Mono',monospace",fontSize:"12px",letterSpacing:"0.08em",
            color:"var(--muted)",textDecoration:"none",textTransform:"uppercase"
          }}>{label}</Link>
        ))}
      </div>
    </nav>
  );
}
