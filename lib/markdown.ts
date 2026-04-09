export function markdownToHtml(md: string): string {
  if (!md) return "<p>Content coming soon.</p>";
  let html = md;

  // ── Video embeds ──────────────────────────────────────────────────────────

  // YouTube: both watch?v= and youtu.be/ and embed/ forms
  html = html.replace(
    /(?:!\[.*?\]\()?https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})[^\s)"]*/g,
    (_, id) => `<div class="embed-video"><iframe src="https://www.youtube.com/embed/${id}" allowfullscreen loading="lazy" title="Video"></iframe></div>`
  );

  // Loom
  html = html.replace(
    /(?:!\[.*?\]\()?https?:\/\/(?:www\.)?loom\.com\/share\/([a-zA-Z0-9]+)[^\s)""]*/g,
    (_, id) => `<div class="embed-video"><iframe src="https://www.loom.com/embed/${id}" allowfullscreen loading="lazy" title="Loom video"></iframe></div>`
  );

  // Vimeo
  html = html.replace(
    /(?:!\[.*?\]\()?https?:\/\/(?:www\.)?vimeo\.com\/(\d+)[^\s)""]*/g,
    (_, id) => `<div class="embed-video"><iframe src="https://player.vimeo.com/video/${id}" allowfullscreen loading="lazy" title="Vimeo video"></iframe></div>`
  );

  // ── Figma embeds ──────────────────────────────────────────────────────────
  html = html.replace(
    /(?:!\[.*?\]\()?https?:\/\/(?:www\.)?figma\.com\/(file|proto|design)\/([^)\s"'\n]+)/g,
    (_, type, rest) => {
      const raw = `https://www.figma.com/${type}/${rest}`.split(")")[0].split(" ")[0];
      const embedUrl = `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(raw)}`;
      return `<div class="embed-figma"><iframe src="${embedUrl}" allowfullscreen loading="lazy" title="Figma prototype"></iframe><a href="${raw}" target="_blank" rel="noopener" class="embed-link">Open in Figma ↗</a></div>`;
    }
  );

  // ── Image markdown (must come AFTER video/embed patterns) ─────────────────
  html = html.replace(
    /!\[([^\]]*)\]\((https?:\/\/[^)]+)\)/g,
    (_, alt, src) => `<figure class="embed-image"><img src="${src}" alt="${alt}" loading="lazy"/>${alt ? `<figcaption>${alt}</figcaption>` : ""}</figure>`
  );

  // ── Notion-style image blocks (bare URLs that are images) ─────────────────
  html = html.replace(
    /^(https?:\/\/[^\s]+\.(?:png|jpg|jpeg|gif|webp|svg))(\s*)$/gm,
    (_, src) => `<figure class="embed-image"><img src="${src}" alt="" loading="lazy"/></figure>`
  );

  // ── Notion S3/file URLs wrapped in markdown image syntax ──────────────────
  // Notion often outputs: ![](https://prod-files-secure.s3...)
  html = html.replace(
    /!\[\]\((https?:\/\/prod-files[^)]+)\)/g,
    (_, src) => `<figure class="embed-image"><img src="${src}" alt="" loading="lazy"/></figure>`
  );

  // ── Text formatting ───────────────────────────────────────────────────────
  html = html.replace(/^#### (.+)$/gm, "<h4>$1</h4>");
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(/`([^`\n]+)`/g, "<code>$1</code>");
  html = html.replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>");
  html = html.replace(/^---+$/gm, "<hr/>");

  // Lists
  html = html.replace(/^[ \t]*[-*+] (.+)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>[\s\S]*?<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`);
  html = html.replace(/^\d+\. (.+)$/gm, "<oli>$1</oli>");
  html = html.replace(/(<oli>[\s\S]*?<\/oli>\n?)+/g, (m) => `<ol>${m.replace(/<\/?oli>/g, (t) => t.replace("oli", "li"))}</ol>`);

  // Links (after embed patterns so URLs aren't double-processed)
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

  // Paragraphs
  const BLOCK = /^<(h[1-6]|ul|ol|li|blockquote|figure|div|hr|iframe|pre)/;
  const lines = html.split("\n");
  const out: string[] = [];
  let inP = false;
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      if (inP) { out.push("</p>"); inP = false; }
      continue;
    }
    if (BLOCK.test(line.trim())) {
      if (inP) { out.push("</p>"); inP = false; }
      out.push(line);
    } else {
      if (!inP) { out.push("<p>"); inP = true; }
      out.push(line);
    }
  }
  if (inP) out.push("</p>");
  return out.join("\n");
}
