"use client";
import { useState, useEffect } from "react";

type Comment = { id: string; name: string; body: string; created_at: string; };
const S = { mono:"'DM Mono',monospace", sans:"'DM Sans',sans-serif" };

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" })
    + " · " + d.toLocaleTimeString("en-GB", { hour:"2-digit", minute:"2-digit" });
}

export default function Comments({ slug }: { slug: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/comments?slug=${encodeURIComponent(slug)}`)
      .then(r => r.json())
      .then(d => { setComments(d.comments || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !body.trim()) return;
    setSubmitting(true);
    try {
      const r = await fetch("/api/comments", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, name, body })
      });
      if (r.ok) {
        const d = await r.json();
        setComments(prev => [...prev, d.comment]);
        setName(""); setBody(""); setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
      }
    } finally { setSubmitting(false); }
  };

  return (
    <div style={{ borderTop:"1px solid var(--border)", marginTop:"4rem", paddingTop:"3rem" }}>
      <h3 style={{ fontFamily:S.sans, fontSize:"1.4rem", fontWeight:700, letterSpacing:"-0.01em", marginBottom:"2rem" }}>
        Discussion <span style={{ fontFamily:S.mono, fontSize:"12px", fontWeight:400, color:"var(--muted)", marginLeft:"0.5rem" }}>({comments.length})</span>
      </h3>

      <form onSubmit={submit} style={{ marginBottom:"3rem", display:"flex", flexDirection:"column", gap:"0.85rem" }}>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name"
          required maxLength={80}
          style={{ fontFamily:S.mono, fontSize:"13px", padding:"0.75rem 1rem", background:"var(--surface)", border:"1px solid var(--border)", color:"var(--ink)", outline:"none", width:"100%", maxWidth:"320px", borderRadius:"6px", transition:"border-color 0.2s" }}
          onFocus={e=>(e.target.style.borderColor="var(--accent)")}
          onBlur={e=>(e.target.style.borderColor="var(--border)")} />
        <textarea value={body} onChange={e=>setBody(e.target.value)} placeholder="Share your thoughts..."
          required maxLength={1000} rows={4}
          style={{ fontFamily:S.sans, fontSize:"14px", padding:"0.75rem 1rem", background:"var(--surface)", border:"1px solid var(--border)", color:"var(--ink)", outline:"none", resize:"vertical", lineHeight:1.6, borderRadius:"6px", transition:"border-color 0.2s" }}
          onFocus={e=>(e.target.style.borderColor="var(--accent)")}
          onBlur={e=>(e.target.style.borderColor="var(--border)")} />
        <button type="submit" disabled={submitting}
          style={{ fontFamily:S.mono, fontSize:"11px", letterSpacing:"0.1em", textTransform:"uppercase", padding:"0.75rem 1.75rem", background: submitted ? "#1a6b4a" : "var(--ink)", color:"var(--paper)", border:"none", cursor:submitting?"not-allowed":"pointer", width:"fit-content", opacity:submitting?0.6:1, transition:"background 0.3s, transform 0.15s, opacity 0.2s", borderRadius:"4px" }}
          onMouseEnter={e=>{ if(!submitting) (e.target as HTMLButtonElement).style.transform="translateY(-2px)"; }}
          onMouseLeave={e=>{ (e.target as HTMLButtonElement).style.transform=""; }}>
          {submitting ? "Posting..." : submitted ? "Posted ✓" : "Post comment →"}
        </button>
      </form>

      {loading ? (
        <p style={{ fontFamily:S.mono, fontSize:"12px", color:"var(--muted)" }}>Loading...</p>
      ) : comments.length === 0 ? (
        <p style={{ fontFamily:S.sans, fontStyle:"italic", color:"var(--muted)", fontSize:"15px" }}>Be the first to share a thought.</p>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
          {comments.map((c, i) => (
            <div key={c.id}
              className="comment-card"
              style={{ padding:"1.25rem 1.5rem", border:"1px solid var(--border)", background:"var(--surface)", borderRadius:"8px", animation:`fadeSlideIn 0.4s ease ${i * 0.05}s both` }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"0.6rem", gap:"1rem", flexWrap:"wrap" }}>
                <span style={{ fontFamily:S.mono, fontSize:"12px", fontWeight:500, color:"var(--ink)" }}>{c.name}</span>
                <span style={{ fontFamily:S.mono, fontSize:"10px", color:"var(--muted)", letterSpacing:"0.06em", flexShrink:0 }}>
                  {c.created_at ? formatDate(c.created_at) : "Just now"}
                </span>
              </div>
              <p style={{ fontSize:"14px", lineHeight:1.75, color:"var(--muted)", margin:0 }}>{c.body}</p>
            </div>
          ))}
        </div>
      )}
      <style>{`
        @keyframes fadeSlideIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }
        .comment-card { transition: border-color 0.2s; }
        .comment-card:hover { border-color: var(--accent); }
      `}</style>
    </div>
  );
}
