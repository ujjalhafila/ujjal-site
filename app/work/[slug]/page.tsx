import Link from "next/link";
import Nav from "../../../components/Nav";
import Footer from "../../../components/Footer";
import WorkGallery from "../../../components/WorkGallery";
import ProseContent from "../../../components/ProseContent";
import TableOfContents from "../../../components/TableOfContents";
import { getWorkItem, getWorkItems } from "../../../lib/notion";
import { markdownToHtml } from "../../../lib/markdown";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const revalidate = 60;
const S = { sans:"'DM Sans',sans-serif", mono:"'DM Mono',monospace" };

export async function generateStaticParams() {
  const items = await getWorkItems();
  return items.map(i => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const data = await getWorkItem(params.slug);
  if (!data) return { title: "Not found" };
  return { title: data.item.title, description: data.item.description };
}

export default async function WorkDetail({ params }: { params: { slug: string } }) {
  const data = await getWorkItem(params.slug);
  if (!data) notFound();
  const { item, markdown } = data;
  const html = markdownToHtml(markdown);

  return (
    <main style={{ background:"var(--bg)", color:"var(--ink)" }}>
      <Nav />
      <div style={{ paddingTop:"52px" }}>

        {/* Header */}
        <div style={{ padding:"3rem 2rem 2.5rem", borderBottom:"1px solid var(--rule)" }}>
          <Link href="/work" style={{ fontFamily:S.mono, fontSize:"11px", letterSpacing:"0.1em", textTransform:"uppercase", textDecoration:"none", display:"inline-flex", alignItems:"center", gap:"0.4rem", marginBottom:"2rem" }}
            className="sec-link-hover">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
            Work
          </Link>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"3rem", alignItems:"start" }} className="work-detail-header">
            <div>
              {item.type && (
                <div style={{ fontFamily:S.mono, fontSize:"10px", letterSpacing:"0.12em", textTransform:"uppercase", color:"var(--accent)", border:"1px solid var(--accent)", padding:"0.2rem 0.75rem", display:"inline-block", marginBottom:"1.25rem" }}>
                  {item.type}
                </div>
              )}
              <h1 style={{ fontFamily:S.sans, fontSize:"clamp(1.8rem,5vw,3.25rem)", fontWeight:600, lineHeight:1.05, letterSpacing:"-0.03em", marginBottom:"1.25rem" }}>
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
                    <div style={{ fontFamily:S.mono, fontSize:"10px", letterSpacing:"0.1em", textTransform:"uppercase", color:"var(--ink3)", marginBottom:"0.3rem" }}>{l}</div>
                    <div style={{ fontFamily:S.mono, fontSize:"13px", color:"var(--ink)" }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ display:"flex", gap:"0.4rem", flexWrap:"wrap" }}>
                {item.tags.map(t=>(<span key={t} style={{ fontFamily:S.mono, fontSize:"9px", letterSpacing:"0.1em", textTransform:"uppercase", color:"var(--ink3)", border:"1px solid var(--rule)", padding:"0.2rem 0.5rem" }}>{t}</span>))}
              </div>
              {item.url && (
                <a href={item.url} target="_blank" rel="noopener" className="project-ext-link" style={{ display:"inline-flex", alignItems:"center", gap:"0.4rem", fontFamily:S.mono, fontSize:"12px", letterSpacing:"0.08em", textTransform:"uppercase", textDecoration:"none", marginTop:"1rem" }}>
                  View project
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7"/><path d="M7 7h10v10"/></svg>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Gallery */}
        {(item.thumbnailUrl || item.videoDemo) && (
          <div style={{ maxWidth:"900px", margin:"0 auto", padding:"2.5rem 2rem 0" }}>
            <WorkGallery thumbnailUrl={item.thumbnailUrl} videoDemo={item.videoDemo} title={item.title} />
          </div>
        )}

        {/* Mobile TOC */}
        {html && <div className="toc-mobile-strip"><TableOfContents html={html} /></div>}

        {/* Content + desktop TOC sidebar */}
        <div className="work-content-layout">
          <aside className="work-toc-aside" aria-label="Page sections">
            {html && <TableOfContents html={html} />}
          </aside>
          <div style={{ minWidth:0, padding:"2rem 2rem 5rem" }}>
            {html ? (
              <ProseContent html={html} />
            ) : (
              <p style={{ fontFamily:S.sans, fontStyle:"italic", fontSize:"1.1rem", color:"var(--muted)" }}>
                Open this project in Notion and add your case study content — it appears here automatically.
              </p>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 700px) {
          .work-detail-header { grid-template-columns: 1fr !important; gap: 1.5rem !important; }
        }
        .work-content-layout {
          display: grid;
          grid-template-columns: 210px 1fr;
          max-width: 1140px;
          margin: 0 auto;
          align-items: start;
        }
        .work-toc-aside {
          position: sticky; top: 56px;
          padding: 2.5rem 1rem 2rem 2rem;
          max-height: calc(100vh - 60px); overflow-y: auto; scrollbar-width: none;
        }
        .work-toc-aside::-webkit-scrollbar { display: none; }
        .work-toc-aside .toc-sidebar { display: block; }
        .work-toc-aside .toc-pills   { display: none !important; }
        .toc-mobile-strip {
          display: none; position: sticky; top: 52px; z-index: 50;
          background: var(--nav-bg); backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--rule);
        }
        .toc-mobile-strip .toc-sidebar { display: none !important; }
        .toc-mobile-strip .toc-pills   { display: block !important; border-bottom: none; }
        .toc-sidebar { display: none; }
        .toc-pills   { display: none; }
        @media (max-width: 900px) {
          .work-content-layout { grid-template-columns: 1fr; }
          .work-toc-aside      { display: none !important; }
          .toc-mobile-strip    { display: block; }
        }
      `}</style>

      <Footer />
    </main>
  );
}
