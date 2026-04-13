"use client";
import { useState, useEffect } from "react";

type Comment = { id: string; name: string; body: string; createdAt: string; };
const S = { mono:"'DM Mono',monospace", serif:"'Playfair Display',Georgia,serif" };

export default function Comments({ slug }: { slug: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/comments?slug=${encodeURIComponent(slug)}`)
      .then(r => r.json()).then(d => { setComments(d.comments || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !body.trim()) return;
    setSubmitting(true);
    try {
      const r = await fetch("/api/comments", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({slug,name,body}) });
      if (r.ok) {
        const d = await r.json();
        setComments(prev => [...prev, d.comment]);
        setName(""); setBody(""); setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
      }
    } finally { setSubmitting(false); }
  };

  return (
    <div style={{ borderTop:"1px solid var(--border)",marginTop:"4rem",paddingTop:"3rem" }}>
      <h3 style={{ fontFamily:S.serif,fontSize:"1.5rem",fontWeight:700,letterSpacing:"-0.01em",marginBottom:"2rem" }}>
        Discussion ({comments.length})
      </h3>

      {/* Comment form */}
      <form onSubmit={submit} style={{ marginBottom:"3rem",display:"flex",flexDirection:"column",gap:"1rem" }}>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name"
          required maxLength={80}
          style={{ fontFamily:S.mono,fontSize:"13px",padding:"0.75rem 1rem",background:"var(--surface)",border:"1px solid var(--border)",color:"var(--ink)",outline:"none",width:"100%",maxWidth:"320px" }} />
        <textarea value={body} onChange={e=>setBody(e.target.value)} placeholder="Share your thoughts..."
          required maxLength={1000} rows={4}
          style={{ fontFamily:"'DM Sans',sans-serif",fontSize:"14px",padding:"0.75rem 1rem",background:"var(--surface)",border:"1px solid var(--border)",color:"var(--ink)",outline:"none",resize:"vertical",lineHeight:1.6 }} />
        <button type="submit" disabled={submitting}
          style={{ fontFamily:S.mono,fontSize:"11px",letterSpacing:"0.1em",textTransform:"uppercase",padding:"0.7rem 1.5rem",background:"var(--ink)",color:"var(--paper)",border:"none",cursor:submitting?"not-allowed":"pointer",width:"fit-content",opacity:submitting?0.6:1,transition:"opacity 0.2s" }}>
          {submitting ? "Posting..." : submitted ? "Posted ✓" : "Post comment"}
        </button>
      </form>

      {/* Comments list */}
      {loading ? (
        <p style={{ fontFamily:S.mono,fontSize:"12px",color:"var(--muted)" }}>Loading...</p>
      ) : comments.length === 0 ? (
        <p style={{ fontFamily:S.serif,fontStyle:"italic",color:"var(--muted)" }}>Be the first to share a thought.</p>
      ) : (
        <div style={{ display:"flex",flexDirection:"column",gap:"1.5rem" }}>
          {comments.map(c => (
            <div key={c.id} style={{ padding:"1.25rem",border:"1px solid var(--border)",background:"var(--surface)" }}>
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"0.5rem" }}>
                <span style={{ fontFamily:S.mono,fontSize:"12px",fontWeight:500,color:"var(--ink)" }}>{c.name}</span>
                <span style={{ fontFamily:S.mono,fontSize:"10px",color:"var(--muted)",letterSpacing:"0.06em" }}>
                  {new Date(c.createdAt).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}{" · "}{new Date(c.createdAt).toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})}
                </span>
              </div>
              <p style={{ fontSize:"14px",lineHeight:1.7,color:"var(--muted)",margin:0 }}>{c.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
