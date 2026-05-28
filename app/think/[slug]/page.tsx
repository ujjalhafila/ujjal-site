import Link from "next/link";
import Nav from "../../../components/Nav";
import Footer from "../../../components/Footer";
import Comments from "../../../components/Comments";
import ShareBar from "../../../components/ShareBar";
import ProseContent from "../../../components/ProseContent";
import TableOfContents from "../../../components/TableOfContents";
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

        {/* Sticky reading title — appears as header scrolls away */}
        <div className="think-sticky-title" aria-hidden="true">
          <span style={{ fontFamily:S.mono, fontSize:"11px", letterSpacing:"0.08em", color:"var(--ink3)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", maxWidth:"60vw" }}>
            {item.title}
          </span>
        </div>

        {/* Header */}
        <div className="think-main-header" style={{ borderBottom:"1px solid var(--border)",padding:"3rem 2rem 2.5rem" }}>
          <div style={{ maxWidth:"760px",margin:"0 auto" }}>
            <Link href="/think" style={{ fontFamily:S.mono,fontSize:"11px",letterSpacing:"0.1em",textTransform:"uppercase",textDecoration:"none",display:"inline-flex",alignItems:"center",gap:"0.4rem",marginBottom:"2rem" }} className="sec-link-hover">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
              Think Space
            </Link>
            <div style={{ display:"flex",alignItems:"center",gap:"0.75rem",marginBottom:"1.5rem",flexWrap:"wrap" }}>
              <span style={{ fontFamily:S.mono,fontSize:"10px",letterSpacing:"0.12em",textTransform:"uppercase",color,border:`1px solid ${color}`,padding:"0.2rem 0.75rem" }}>{item.type}</span>
              {item.tags.map(t=>(<span key={t} style={{ fontFamily:S.mono,fontSize:"10px",letterSpacing:"0.08em",textTransform:"uppercase",color:"var(--muted)",border:"1px solid var(--border)",padding:"0.2rem 0.6rem" }}>{t}</span>))}
              <span style={{ fontFamily:S.mono,fontSize:"11px",color:"var(--muted)" }}>
                {item.readTime}{item.publishedOn && ` · ${new Date(item.publishedOn).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"})}`}
              </span>
            </div>
            <h1 style={{ fontFamily:S.sans,fontSize:"clamp(2rem,5vw,3.5rem)",fontWeight:400,lineHeight:1.05,letterSpacing:"-0.03em",marginBottom:"1.5rem" }}>
              {item.title}
            </h1>
            {item.whyQuestion && (
              <div style={{ borderLeft:`3px solid ${color}`,paddingLeft:"1.5rem" }}>
                <p style={{ fontFamily:S.sans,fontStyle:"italic",fontSize:"1.2rem",lineHeight:1.65,color:"var(--ink)" }}>
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
        <div className="think-body-outer">
          {/* Mobile TOC pills */}
          <div className="think-toc-mobile">
            {html && <TableOfContents html={html} />}
          </div>

          {/* Centred reading column */}
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
        /* Outer wrapper: full-width, provides horizontal padding */
        .think-body-outer {
          width: 100%;
          padding: 0 2rem;
        }
        /* Centred reading column — wider for comfortable reading */
        .think-body-inner {
          max-width: 760px;
          margin: 2.5rem auto 5rem;
        }

        /* Sticky title strip — fixed below nav, hidden until header scrolls away */
        .think-sticky-title {
          position: fixed;
          top: 52px; left: 0; right: 0;
          z-index: 80;
          height: 36px;
          background: var(--nav-bg);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--rule);
          display: flex;
          align-items: center;
          padding: 0 2rem;
          opacity: 0;
          transform: translateY(-4px);
          transition: opacity 0.2s ease, transform 0.2s ease;
          pointer-events: none;
        }
        .think-sticky-title.visible {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }
        /* Push content down to account for sticky strip when visible */
        .think-body-outer { padding-top: 0; }

        /* Mobile TOC pills — only visible on small screens */
        .think-toc-mobile { display: none; }
        @media (max-width: 900px) {
          .think-toc-mobile {
            display: block;
            position: sticky; top: 88px; z-index: 50;
            background: var(--nav-bg); backdrop-filter: blur(12px);
            border-bottom: 1px solid var(--rule);
            margin: 0 -2rem;
          }
          .think-toc-mobile .toc-sidebar { display: none !important; }
          .think-toc-mobile .toc-pills   { display: block !important; border-bottom: none; }
        }
        @media (max-width: 600px) {
          .think-body-outer { padding: 0 1.25rem; }
        }
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
      `}</style>

      {/* JS: show sticky title once the main header scrolls out of view */}
      <script dangerouslySetInnerHTML={{ __html: `
        (function(){
          var header = document.querySelector('.think-main-header');
          var sticky = document.querySelector('.think-sticky-title');
          if (!header || !sticky) return;
          var obs = new IntersectionObserver(function(entries){
            entries.forEach(function(e){
              sticky.classList.toggle('visible', !e.isIntersecting);
            });
          }, { threshold: 0, rootMargin: '-52px 0px 0px 0px' });
          obs.observe(header);
        })();
      `}} />

      <Footer />
    </main>
  );
}
