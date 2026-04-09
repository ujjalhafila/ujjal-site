import Link from "next/link";
import Nav from "../../../components/Nav";
import Footer from "../../../components/Footer";
import Comments from "../../../components/Comments";
import ShareBar from "../../../components/ShareBar";
import { getThinkItem, getThinkItems } from "../../../lib/notion";
import { markdownToHtml } from "../../../lib/markdown";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const revalidate = 60;

const S = { serif:"'Playfair Display',Georgia,serif", mono:"'DM Mono',monospace" };
const TYPE_COLORS: Record<string,string> = {
  "Essay":"var(--accent)","Lab Experiment":"#1a6b4a","Concept Flow":"#1a3a7a","Quick Thought":"#7a5a1a"
};

export async function generateStaticParams() {
  const items = await getThinkItems();
  return items.map(i=>({slug:i.slug}));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const data = await getThinkItem(params.slug);
  if (!data) return { title: "Not found" };
  return { title: data.item.title, description: data.item.whyQuestion || data.item.title };
}

export default async function ThinkDetail({ params }: { params: { slug: string } }) {
  const data = await getThinkItem(params.slug);
  if (!data) notFound();
  const { item, markdown } = data;
  const color = TYPE_COLORS[item.type] || "var(--accent)";
  const html = markdownToHtml(markdown);

  return (
    <main>
      <Nav />
      <div style={{ paddingTop:"5rem" }}>

        {/* Header */}
        <div style={{ borderBottom:"1px solid var(--border)",padding:"3rem 2rem 2.5rem" }}>
          <div style={{ maxWidth:"760px",margin:"0 auto" }}>
            <Link href="/think" style={{ fontFamily:S.mono,fontSize:"11px",letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--muted)",textDecoration:"none",display:"inline-flex",alignItems:"center",gap:"0.4rem",marginBottom:"2rem" }}>
              ← Think Space
            </Link>
            <div style={{ display:"flex",alignItems:"center",gap:"0.75rem",marginBottom:"1.5rem",flexWrap:"wrap" }}>
              <span style={{ fontFamily:S.mono,fontSize:"10px",letterSpacing:"0.12em",textTransform:"uppercase",color,border:`1px solid ${color}`,padding:"0.2rem 0.75rem" }}>{item.type}</span>
              {item.tags.map(t=>(<span key={t} style={{ fontFamily:S.mono,fontSize:"10px",letterSpacing:"0.08em",textTransform:"uppercase",color:"var(--muted)",border:"1px solid var(--border)",padding:"0.2rem 0.6rem" }}>{t}</span>))}
              <span style={{ fontFamily:S.mono,fontSize:"11px",color:"var(--muted)" }}>
                {item.readTime}{item.publishedOn && ` · ${new Date(item.publishedOn).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"})}`}
              </span>
            </div>
            <h1 style={{ fontFamily:S.serif,fontSize:"clamp(2rem,5vw,3.5rem)",fontWeight:900,lineHeight:1.05,letterSpacing:"-0.03em",marginBottom:"1.5rem" }}>
              {item.title}
            </h1>
            {item.whyQuestion && (
              <div style={{ borderLeft:`3px solid ${color}`,paddingLeft:"1.5rem" }}>
                <p style={{ fontFamily:S.serif,fontStyle:"italic",fontSize:"1.2rem",lineHeight:1.65,color:"var(--ink)" }}>
                  "{item.whyQuestion}"
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Cover image */}
        {item.coverUrl && (
          <div style={{ width:"100%",maxHeight:"420px",overflow:"hidden",borderBottom:"1px solid var(--border)" }}>
            <img src={item.coverUrl} alt={item.title} style={{ width:"100%",height:"100%",objectFit:"cover" }} />
          </div>
        )}

        {/* Lab Experiment embed */}
        {item.type==="Lab Experiment" && item.experimentUrl && (
          <div style={{ borderBottom:"1px solid var(--border)" }}>
            <div style={{ padding:"1rem 2rem",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
              <div style={{ display:"flex",alignItems:"center",gap:"0.5rem" }}>
                <span style={{ width:"8px",height:"8px",borderRadius:"50%",background:"#1a6b4a",display:"inline-block",animation:"pulse 2s infinite" }}/>
                <span style={{ fontFamily:S.mono,fontSize:"11px",letterSpacing:"0.1em",textTransform:"uppercase",color:"#1a6b4a" }}>Live Experiment</span>
              </div>
              <a href={item.experimentUrl} target="_blank" rel="noopener" style={{ fontFamily:S.mono,fontSize:"11px",color:"var(--muted)",textDecoration:"none" }}>Open standalone ↗</a>
            </div>
            <iframe src={item.experimentUrl} style={{ width:"100%",height:"600px",border:"none",display:"block" }} title={item.title} />
            <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
          </div>
        )}

        {/* Concept Flow embed */}
        {item.type==="Concept Flow" && item.experimentUrl && (
          <div style={{ borderBottom:"1px solid var(--border)" }}>
            <div style={{ padding:"1rem 2rem",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
              <span style={{ fontFamily:S.mono,fontSize:"11px",letterSpacing:"0.1em",textTransform:"uppercase",color:"#1a3a7a" }}>Concept Flow</span>
              <a href={item.experimentUrl} target="_blank" rel="noopener" style={{ fontFamily:S.mono,fontSize:"11px",color:"var(--muted)",textDecoration:"none" }}>Open ↗</a>
            </div>
            <iframe
              src={item.experimentUrl.includes("figma.com") ?
                `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(item.experimentUrl)}` :
                item.experimentUrl}
              style={{ width:"100%",height:"600px",border:"none",display:"block" }}
              allowFullScreen title={item.title} />
          </div>
        )}

        {/* Body */}
        <div style={{ display:"grid",gridTemplateColumns:"180px 1fr",maxWidth:"1100px" }} className="think-body-grid">
          {/* Sidebar */}
          <div style={{ padding:"2.5rem 1.5rem",borderRight:"1px solid var(--border)" }} className="think-sidebar">
            <div style={{ fontFamily:S.mono,fontSize:"10px",letterSpacing:"0.12em",textTransform:"uppercase",color:"var(--muted)",marginBottom:"0.75rem" }}>Tags</div>
            {item.tags.map(t=>(<div key={t} style={{ fontFamily:S.mono,fontSize:"11px",color:"var(--ink)",marginBottom:"0.3rem" }}>{t}</div>))}
          </div>

          {/* Content */}
          <div style={{ padding:"3rem 2rem 4rem",maxWidth:"680px" }}>
            <ShareBar title={item.title} slug={item.slug} />
            {html ? (
              <div className="prose-ujjal" dangerouslySetInnerHTML={{ __html: html }} />
            ) : (
              <p style={{ fontFamily:S.serif,fontStyle:"italic",fontSize:"1.1rem",color:"var(--muted)" }}>
                Open this entry in Notion and write your content — it appears here automatically once published.
              </p>
            )}
            <Comments slug={item.slug} />
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 700px) {
          .think-body-grid { grid-template-columns: 1fr !important; }
          .think-sidebar { display: none; }
        }
      `}</style>

      <Footer />
    </main>
  );
}
