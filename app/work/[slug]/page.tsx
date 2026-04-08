import Link from "next/link";
import Nav from "../../../components/Nav";
import Footer from "../../../components/Footer";
import { getWorkItem, getWorkItems } from "../../../lib/notion";
import { notFound } from "next/navigation";

export const revalidate = 60;

const S = { serif:"'Playfair Display',Georgia,serif", mono:"'DM Mono',monospace" };

export async function generateStaticParams() {
  const items = await getWorkItems();
  return items.map(i => ({ slug: i.slug }));
}

export default async function WorkDetail({ params }: { params: { slug: string } }) {
  const data = await getWorkItem(params.slug);
  if (!data) notFound();
  const { item, markdown } = data;

  return (
    <main>
      <Nav />
      <div style={{ paddingTop: "6rem" }}>
        {/* Header */}
        <div style={{ padding:"3rem 2.5rem 2.5rem", borderBottom:"1px solid var(--border)", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"3rem" }}>
          <div>
            <Link href="/work" style={{ fontFamily:S.mono, fontSize:"11px", letterSpacing:"0.12em", textTransform:"uppercase", color:"var(--muted)", textDecoration:"none", display:"inline-flex", alignItems:"center", gap:"0.5rem", marginBottom:"2rem" }}>
              ← Work
            </Link>
            {item.type && (
              <div style={{ fontFamily:S.mono, fontSize:"10px", letterSpacing:"0.12em", textTransform:"uppercase", color:"var(--accent)", border:"1px solid var(--accent)", padding:"0.2rem 0.75rem", display:"inline-block", marginBottom:"1.5rem" }}>
                {item.type}
              </div>
            )}
            <h1 style={{ fontFamily:S.serif, fontSize:"clamp(2rem,5vw,3.5rem)", fontWeight:900, lineHeight:1.05, letterSpacing:"-0.03em", marginBottom:"1.5rem" }}>
              {item.title}
            </h1>
            {item.description && (
              <p style={{ fontSize:"16px", lineHeight:1.8, color:"var(--muted)", maxWidth:"50ch" }}>{item.description}</p>
            )}
          </div>
          <div style={{ display:"flex", flexDirection:"column", justifyContent:"flex-end", gap:"1rem" }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1px", background:"var(--border)", border:"1px solid var(--border)" }}>
              {[
                ["Status", item.status],
                ["When", item.when ? new Date(item.when).getFullYear().toString() : "—"],
                ["Where", item.where || "—"],
                ["Type", item.type || "—"],
              ].map(([label, val]) => (
                <div key={label} style={{ background:"var(--paper)", padding:"0.85rem 1rem" }}>
                  <div style={{ fontFamily:S.mono, fontSize:"10px", letterSpacing:"0.1em", textTransform:"uppercase", color:"var(--muted)", marginBottom:"0.35rem" }}>{label}</div>
                  <div style={{ fontFamily:S.mono, fontSize:"13px", color:"var(--ink)" }}>{val}</div>
                </div>
              ))}
            </div>
            <div style={{ display:"flex", gap:"0.5rem", flexWrap:"wrap" }}>
              {item.tags.map(t => (
                <span key={t} style={{ fontFamily:S.mono, fontSize:"10px", letterSpacing:"0.1em", textTransform:"uppercase", color:"var(--muted)", border:"1px solid var(--border)", padding:"0.2rem 0.6rem" }}>{t}</span>
              ))}
            </div>
            {item.url && (
              <a href={item.url} target="_blank" rel="noopener" style={{ display:"inline-flex", alignItems:"center", gap:"0.5rem", fontFamily:S.mono, fontSize:"12px", letterSpacing:"0.08em", textTransform:"uppercase", color:"var(--accent)", textDecoration:"none", borderBottom:"1px solid var(--accent)", paddingBottom:"2px", width:"fit-content" }}>
                View project ↗
              </a>
            )}
          </div>
        </div>

        {/* Thumbnail */}
        {item.thumbnailUrl && (
          <div style={{ width:"100%", height:"400px", overflow:"hidden", borderBottom:"1px solid var(--border)" }}>
            <img src={item.thumbnailUrl} alt={item.title} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
          </div>
        )}

        {/* Content */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr", borderBottom:"1px solid var(--border)" }}>
          <div style={{ padding:"3rem 2rem", borderRight:"1px solid var(--border)" }}>
            {item.videoDemo && (
              <div style={{ marginBottom:"2rem" }}>
                <div style={{ fontFamily:S.mono, fontSize:"10px", letterSpacing:"0.12em", textTransform:"uppercase", color:"var(--muted)", marginBottom:"0.75rem" }}>Video Demo</div>
                <a href={item.videoDemo} target="_blank" rel="noopener" style={{ fontFamily:S.mono, fontSize:"12px", color:"var(--accent)", textDecoration:"none" }}>Watch demo ↗</a>
              </div>
            )}
          </div>
          <div style={{ padding:"3rem 2.5rem" }}>
            {markdown ? (
              <div className="prose-ujjal" dangerouslySetInnerHTML={{ __html: markdownToHtml(markdown) }} />
            ) : (
              <p style={{ fontFamily:S.serif, fontStyle:"italic", fontSize:"1.1rem", color:"var(--muted)" }}>
                Open this project in Notion to add case study content — it will appear here automatically.
              </p>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}

function markdownToHtml(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')

    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hbulia])(.+)$/gm, (match) => match.trim() ? match : '')
    .replace(/<\/p><p>/g, '</p>\n<p>');
}
