import Link from "next/link";
import Nav from "../../../components/Nav";
import Footer from "../../../components/Footer";
import { getWorkItem, getWorkItems } from "../../../lib/notion";
import { markdownToHtml } from "../../../lib/markdown";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const revalidate = 60;
const S = { serif:"'Playfair Display',Georgia,serif", mono:"'DM Mono',monospace" };

export async function generateStaticParams() {
  const items = await getWorkItems();
  return items.map(i => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const data = await getWorkItem(params.slug);
  if (!data) return { title: "Not found" };
  return { title: data.item.title, description: data.item.description };
}

function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

function getVimeoId(url: string): string | null {
  const m = url.match(/vimeo\.com\/(\d+)/);
  return m ? m[1] : null;
}

function getLoomId(url: string): string | null {
  const m = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/);
  return m ? m[1] : null;
}

function VideoEmbed({ url, label }: { url: string; label: string }) {
  const ytId = getYouTubeId(url);
  const vimeoId = getVimeoId(url);
  const loomId = getLoomId(url);

  const embedUrl = ytId
    ? `https://www.youtube.com/embed/${ytId}`
    : vimeoId
    ? `https://player.vimeo.com/video/${vimeoId}`
    : loomId
    ? `https://www.loom.com/embed/${loomId}`
    : null;

  const thumbUrl = ytId
    ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
    : null;

  return (
    <div style={{ marginBottom: "2rem" }}>
      <div style={{ fontFamily:S.mono, fontSize:"10px", letterSpacing:"0.12em", textTransform:"uppercase", color:"var(--muted)", marginBottom:"0.75rem" }}>{label}</div>
      {embedUrl ? (
        <div style={{ position:"relative", paddingBottom:"56.25%", height:0, overflow:"hidden", border:"1px solid var(--border)", background:"var(--ink)" }}>
          <iframe
            src={embedUrl}
            style={{ position:"absolute", top:0, left:0, width:"100%", height:"100%", border:"none" }}
            allowFullScreen
            loading="lazy"
            title={label}
          />
        </div>
      ) : thumbUrl ? (
        <a href={url} target="_blank" rel="noopener" style={{ display:"block", position:"relative", textDecoration:"none" }}>
          <img src={thumbUrl} alt={label} style={{ width:"100%", height:"auto", display:"block", border:"1px solid var(--border)" }} loading="lazy"/>
          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.35)" }}>
            <div style={{ width:56, height:56, borderRadius:"50%", background:"rgba(255,255,255,0.95)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#c84b2f"><polygon points="5,3 19,12 5,21"/></svg>
            </div>
          </div>
        </a>
      ) : (
        <a href={url} target="_blank" rel="noopener"
          style={{ display:"inline-flex", alignItems:"center", gap:"0.5rem", fontFamily:S.mono, fontSize:"12px", letterSpacing:"0.08em", color:"var(--accent)", textDecoration:"none", borderBottom:"1px solid var(--accent)", paddingBottom:"2px" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
          Watch video ↗
        </a>
      )}
    </div>
  );
}

export default async function WorkDetail({ params }: { params: { slug: string } }) {
  const data = await getWorkItem(params.slug);
  if (!data) notFound();
  const { item, markdown } = data;
  const html = markdownToHtml(markdown);

  return (
    <main>
      <Nav />
      <div style={{ paddingTop:"5rem" }}>

        {/* Header */}
        <div style={{ padding:"3rem 2rem 2.5rem", borderBottom:"1px solid var(--border)" }}>
          <Link href="/work" style={{ fontFamily:S.mono, fontSize:"11px", letterSpacing:"0.1em", textTransform:"uppercase", color:"var(--muted)", textDecoration:"none", display:"inline-flex", alignItems:"center", gap:"0.4rem", marginBottom:"2rem" }}>
            ← Work
          </Link>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"3rem", alignItems:"start" }} className="work-detail-header">
            <div>
              {item.type && (
                <div style={{ fontFamily:S.mono, fontSize:"10px", letterSpacing:"0.12em", textTransform:"uppercase", color:"var(--accent)", border:"1px solid var(--accent)", padding:"0.2rem 0.75rem", display:"inline-block", marginBottom:"1.25rem" }}>
                  {item.type}
                </div>
              )}
              <h1 style={{ fontFamily:S.serif, fontSize:"clamp(1.8rem,5vw,3.25rem)", fontWeight:900, lineHeight:1.05, letterSpacing:"-0.03em", marginBottom:"1.25rem" }}>
                {item.title}
              </h1>
              {item.description && (
                <p style={{ fontSize:"16px", lineHeight:1.8, color:"var(--muted)" }}>{item.description}</p>
              )}
            </div>
            <div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1px", background:"var(--border)", border:"1px solid var(--border)", marginBottom:"1rem" }}>
                {[["Status",item.status],["Year",item.when?new Date(item.when).getFullYear().toString():"—"],["Where",item.where||"—"],["Type",item.type||"—"]].map(([l,v])=>(
                  <div key={l} style={{ background:"var(--paper)", padding:"0.75rem 1rem" }}>
                    <div style={{ fontFamily:S.mono, fontSize:"10px", letterSpacing:"0.1em", textTransform:"uppercase", color:"var(--muted)", marginBottom:"0.3rem" }}>{l}</div>
                    <div style={{ fontFamily:S.mono, fontSize:"13px", color:"var(--ink)" }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ display:"flex", gap:"0.4rem", flexWrap:"wrap" }}>
                {item.tags.map(t=>(<span key={t} style={{ fontFamily:S.mono, fontSize:"9px", letterSpacing:"0.1em", textTransform:"uppercase", color:"var(--muted)", border:"1px solid var(--border)", padding:"0.2rem 0.5rem" }}>{t}</span>))}
              </div>
              {item.url && (
                <a href={item.url} target="_blank" rel="noopener" style={{ display:"inline-flex", alignItems:"center", gap:"0.4rem", fontFamily:S.mono, fontSize:"12px", letterSpacing:"0.08em", textTransform:"uppercase", color:"var(--accent)", textDecoration:"none", borderBottom:"1px solid var(--accent)", paddingBottom:"2px", marginTop:"1rem" }}>
                  View project ↗
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Thumbnail */}
        {item.thumbnailUrl && (
          <div style={{ width:"100%", maxHeight:"420px", overflow:"hidden", borderBottom:"1px solid var(--border)" }}>
            <img src={item.thumbnailUrl} alt={item.title} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
          </div>
        )}

        {/* Video Demo — embedded, not a bare link */}
        {item.videoDemo && (
          <div style={{ maxWidth:"780px", margin:"0 auto", padding:"2.5rem 2rem 0" }}>
            <VideoEmbed url={item.videoDemo} label="Video Demo" />
          </div>
        )}

        {/* Main content — full width, centred, no blank sidebar */}
        <div style={{ maxWidth:"780px", margin:"0 auto", padding:"2.5rem 2rem 5rem" }}>
          {html ? (
            <div className="prose-ujjal" dangerouslySetInnerHTML={{ __html: html }} />
          ) : (
            <p style={{ fontFamily:S.serif, fontStyle:"italic", fontSize:"1.1rem", color:"var(--muted)" }}>
              Open this project in Notion and add your case study content — it appears here automatically.
            </p>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 700px) {
          .work-detail-header { grid-template-columns: 1fr !important; gap: 1.5rem !important; }
        }
      `}</style>
      <Footer />
    </main>
  );
}
