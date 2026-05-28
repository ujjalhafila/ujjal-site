import Link from "next/link";
import Nav from "../../../components/Nav";
import Footer from "../../../components/Footer";
import Comments from "../../../components/Comments";
import ShareBar from "../../../components/ShareBar";
import ProseContent from "../../../components/ProseContent";
import ThinkHeader from "../../../components/ThinkHeader";
import { getThinkItem, getThinkItems } from "../../../lib/notion";
import { markdownToHtml } from "../../../lib/markdown";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const revalidate = 60;

const S = { sans:"'DM Sans',sans-serif", mono:"'DM Mono',monospace" };
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
      <div style={{ paddingTop:"52px", animation:"fadeUp 0.5s ease" }}>

        {/* Header — client component owns ref + sticky-title logic */}
        <ThinkHeader
          title={item.title}
          type={item.type}
          typeColor={color}
          tags={item.tags}
          readTime={item.readTime}
          publishedOn={item.publishedOn}
          whyQuestion={item.whyQuestion}
        />

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

        {/* Body — centred reading column, no TOC */}
        <div className="think-body-outer">
          <div className="think-body-inner">
            <ShareBar title={item.title} slug={item.slug} />
            {html ? (
              <ProseContent html={html} />
            ) : (
              <p style={{ fontFamily:S.sans, fontStyle:"italic", fontSize:"15px", color:"var(--ink3)", lineHeight:1.85 }}>
                Open this entry in Notion and write your content — it appears here automatically once published.
              </p>
            )}
            <Comments slug={item.slug} />
          </div>
        </div>
      </div>

      <style>{`
        .think-body-outer { width:100%; padding:0 2rem; }
        .think-body-inner { max-width:760px; margin:2.5rem auto 5rem; }
        @media (max-width:600px) { .think-body-outer { padding:0 1.25rem; } }
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
      `}</style>

      <Footer />
    </main>
  );
}
