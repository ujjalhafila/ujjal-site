import Link from "next/link";
import Nav from "../../../components/Nav";
import Footer from "../../../components/Footer";
import { getThinkItem, getThinkItems } from "../../../lib/notion";
import { notFound } from "next/navigation";

export const revalidate = 60;

const S = { serif:"'Playfair Display',Georgia,serif", mono:"'DM Mono',monospace" };

const TYPE_COLORS: Record<string, string> = {
  "Essay": "var(--accent)",
  "Lab Experiment": "#1a6b4a",
  "Concept Flow": "#1a3a7a",
  "Quick Thought": "#7a5a1a",
};

export async function generateStaticParams() {
  const items = await getThinkItems();
  return items.map(i => ({ slug: i.slug }));
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
    .replace(/\n\n/g, '</p><p>');
}

export default async function ThinkDetail({ params }: { params: { slug: string } }) {
  const data = await getThinkItem(params.slug);
  if (!data) notFound();
  const { item, markdown } = data;
  const color = TYPE_COLORS[item.type] || "var(--accent)";

  return (
    <main>
      <Nav />
      <div style={{ paddingTop:"6rem" }}>

        {/* Header */}
        <div style={{ borderBottom:"1px solid var(--border)" }}>
          <div style={{ padding:"3rem 2.5rem 2.5rem", maxWidth:"860px" }}>
            <Link href="/think" style={{ fontFamily:S.mono, fontSize:"11px", letterSpacing:"0.12em", textTransform:"uppercase", color:"var(--muted)", textDecoration:"none", display:"inline-flex", alignItems:"center", gap:"0.5rem", marginBottom:"2rem" }}>
              ← Think Space
            </Link>
            <div style={{ display:"flex", alignItems:"center", gap:"1rem", marginBottom:"2rem", flexWrap:"wrap" }}>
              <span style={{ fontFamily:S.mono, fontSize:"10px", letterSpacing:"0.12em", textTransform:"uppercase", color, border:`1px solid ${color}`, padding:"0.2rem 0.75rem" }}>
                {item.type}
              </span>
              {item.tags.map(t => (
                <span key={t} style={{ fontFamily:S.mono, fontSize:"10px", letterSpacing:"0.08em", textTransform:"uppercase", color:"var(--muted)", border:"1px solid var(--border)", padding:"0.2rem 0.6rem" }}>{t}</span>
              ))}
              <span style={{ fontFamily:S.mono, fontSize:"11px", color:"var(--muted)" }}>
                {item.readTime}
                {item.publishedOn && ` · ${new Date(item.publishedOn).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"})}`}
              </span>
            </div>
            <h1 style={{ fontFamily:S.serif, fontSize:"clamp(2.25rem,5vw,3.75rem)", fontWeight:900, lineHeight:1.05, letterSpacing:"-0.03em", marginBottom:"1.75rem" }}>
              {item.title}
            </h1>
            {item.whyQuestion && (
              <div style={{ borderLeft:`3px solid ${color}`, paddingLeft:"1.5rem" }}>
                <p style={{ fontFamily:S.serif, fontStyle:"italic", fontSize:"1.2rem", lineHeight:1.65, color:"var(--ink)" }}>
                  "{item.whyQuestion}"
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Cover image */}
        {item.coverUrl && (
          <div style={{ width:"100%", height:"380px", overflow:"hidden", borderBottom:"1px solid var(--border)" }}>
            <img src={item.coverUrl} alt={item.title} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
          </div>
        )}

        {/* Lab Experiment embed */}
        {item.type === "Lab Experiment" && item.experimentUrl && (
          <div style={{ borderBottom:"1px solid var(--border)", background:"rgba(15,14,13,0.02)" }}>
            <div style={{ padding:"1.25rem 2.5rem", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"0.75rem" }}>
                <span style={{ display:"block", width:"8px", height:"8px", borderRadius:"50%", background:"#1a6b4a", animation:"pulse 2s infinite" }} />
                <span style={{ fontFamily:S.mono, fontSize:"11px", letterSpacing:"0.1em", textTransform:"uppercase", color:"#1a6b4a" }}>Live Experiment</span>
              </div>
              <a href={item.experimentUrl} target="_blank" rel="noopener" style={{ fontFamily:S.mono, fontSize:"11px", color:"var(--muted)", textDecoration:"none", letterSpacing:"0.08em" }}>
                Open standalone ↗
              </a>
            </div>
            <iframe
              src={item.experimentUrl}
              style={{ width:"100%", height:"600px", border:"none", display:"block" }}
              title={`Live experiment: ${item.title}`}
            />
            <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
          </div>
        )}

        {/* Concept Flow embed (Figma) */}
        {item.type === "Concept Flow" && item.experimentUrl && (
          <div style={{ borderBottom:"1px solid var(--border)" }}>
            <div style={{ padding:"1.25rem 2.5rem", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <span style={{ fontFamily:S.mono, fontSize:"11px", letterSpacing:"0.1em", textTransform:"uppercase", color:"#1a3a7a" }}>Concept Flow</span>
              <a href={item.experimentUrl} target="_blank" rel="noopener" style={{ fontFamily:S.mono, fontSize:"11px", color:"var(--muted)", textDecoration:"none" }}>Open in Figma ↗</a>
            </div>
            <iframe
              src={item.experimentUrl.replace("figma.com/file","figma.com/embed?embed_host=share&url=https://figma.com/file").replace("figma.com/proto","figma.com/embed?embed_host=share&url=https://figma.com/proto")}
              style={{ width:"100%", height:"600px", border:"none", display:"block" }}
              allowFullScreen
              title={`Concept flow: ${item.title}`}
            />
          </div>
        )}

        {/* Body content */}
        <div style={{ display:"grid", gridTemplateColumns:"200px 1fr", gap:"0" }}>
          {/* Sidebar */}
          <div style={{ padding:"3rem 2rem", borderRight:"1px solid var(--border)", position:"sticky", top:"5rem", alignSelf:"start" }}>
            <div style={{ fontFamily:S.mono, fontSize:"10px", letterSpacing:"0.12em", textTransform:"uppercase", color:"var(--muted)", marginBottom:"1rem" }}>Tags</div>
            <div style={{ display:"flex", flexDirection:"column", gap:"0.4rem" }}>
              {item.tags.map(t => (
                <span key={t} style={{ fontFamily:S.mono, fontSize:"11px", color:"var(--ink)" }}>{t}</span>
              ))}
            </div>
          </div>

          {/* Main content */}
          <div style={{ padding:"3rem 2.5rem 5rem", maxWidth:"720px" }}>
            {markdown ? (
              <div className="prose-ujjal" dangerouslySetInnerHTML={{ __html: markdownToHtml(markdown) }} />
            ) : (
              <p style={{ fontFamily:S.serif, fontStyle:"italic", fontSize:"1.1rem", color:"var(--muted)" }}>
                Open this entry in Notion and write your content — it will appear here automatically once published.
              </p>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
