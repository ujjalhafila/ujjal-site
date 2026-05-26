// Converts Notion markdown to HTML with clickable media placeholders.
// Images and videos are NOT rendered as iframes server-side;
// instead they become data-* elements that ProseContent.tsx hydrates into
// interactive cards with modal support.

function escAttr(s: string) { return s.replace(/"/g, "&quot;"); }

function ytId(url: string) {
  return url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1] || null;
}
function vimeoId(url: string) { return url.match(/vimeo\.com\/(\d+)/)?.[1] || null; }
function loomId(url: string) { return url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/)?.[1] || null; }
function isFigma(url: string) { return url.includes("figma.com"); }
function isDriveVideo(url: string) { return url.includes("drive.google.com") || url.includes("docs.google.com/file"); }
function isVideo(url: string) { return !!(ytId(url) || vimeoId(url) || loomId(url) || isDriveVideo(url)); }
function isImageUrl(url: string) { return /\.(png|jpg|jpeg|gif|webp|svg)(\?|$)/i.test(url) || url.includes("prod-files-secure") || url.includes("notion.so/image"); }

function videoThumb(url: string): string | null {
  const id = ytId(url);
  if (id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  // Loom provides a thumbnail via their API pattern
  const lo = loomId(url);
  if (lo) return `https://cdn.loom.com/sessions/thumbnails/${lo}/thumbnail.jpg`;
  return null; // Drive and Vimeo need auth — show play icon instead
}

function videoPlatform(url: string): string {
  if (ytId(url)) return "YouTube";
  if (loomId(url)) return "Loom";
  if (vimeoId(url)) return "Vimeo";
  if (isFigma(url)) return "Figma";
  if (isDriveVideo(url)) return "Google Drive";
  return "Video";
}

// Emits a server-rendered placeholder div.
// ProseContent.tsx picks these up by data-media-type and makes them interactive.
function mediaCard(url: string, alt = "", type: "image" | "video" | "figma") {
  const thumb = videoThumb(url) || "";
  const platform = type === "video" ? videoPlatform(url) : type === "figma" ? "Figma" : "";
  const driveNote = isDriveVideo(url) ? '<span class="media-drive-note">Opens in Google Drive</span>' : "";
  return `<div class="media-placeholder" data-media-type="${type}" data-src="${escAttr(url)}" data-alt="${escAttr(alt)}" data-thumb="${escAttr(thumb)}" data-platform="${escAttr(platform)}" tabindex="0" role="button" aria-label="Open ${alt || platform || "media"} in viewer">${
    type === "image"
      ? `<img src="${escAttr(url)}" alt="${escAttr(alt)}" loading="lazy" class="media-thumb-img"/><div class="media-zoom-badge">⊕ View</div>`
      : thumb
      ? `<img src="${escAttr(thumb)}" alt="${escAttr(platform)} preview" loading="lazy" class="media-thumb-img"/><div class="media-play-overlay"><div class="media-play-btn"><svg viewBox="0 0 24 24" width="20" height="20" fill="#c84b2f"><polygon points="6,3 20,12 6,21"/></svg></div><span class="media-platform-label">${platform}</span></div>`
      : `<div class="media-no-thumb"><div class="media-play-btn"><svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><polygon points="6,3 20,12 6,21"/></svg></div><span class="media-platform-label">${platform || "Video"}</span>${driveNote}</div>`
  }</div>`;
}

// ── Notion <columns> → side-by-side grid ────────────────────────────────────
function parseColumns(md: string): string {
  // Match the full <columns>...</columns> block (possibly multiline)
  return md.replace(/<columns>([\s\S]*?)<\/columns>/g, (_, inner) => {
    // Each <column>...</column> becomes one cell
    const cells = [...inner.matchAll(/<column>([\s\S]*?)<\/column>/g)];
    if (!cells.length) return inner;
    const count = cells.length;
    const cellsHtml = cells
      .map(([, content]) => {
        // Recursively convert cell content (it may contain media etc.)
        const cellHtml = markdownToHtml(content.trim());
        return `<div class="notion-col">${cellHtml}</div>`;
      })
      .join("");
    return `<div class="notion-columns notion-columns-${count}">${cellsHtml}</div>`;
  });
}

// ── Notion/GFM tables → styled HTML table ───────────────────────────────────
// Handles multiline cell content: Notion sometimes puts newlines inside cells.
// Strategy: collect all lines that start with | (table lines), join non-pipe
// continuation lines back into the preceding cell.
function parseTables(md: string): string {
  const lines = md.split("\n");
  const out: string[] = [];
  let tableLines: string[] = [];

  function flushTable() {
    if (tableLines.length < 3) { out.push(...tableLines); tableLines = []; return; }
    // Separate header, separator, body
    const rows: string[] = [];
    let current = "";
    for (const line of tableLines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("|")) {
        if (current) rows.push(current);
        current = trimmed;
      } else {
        // Continuation line — append to previous cell (replace newline with space)
        current += " " + trimmed;
      }
    }
    if (current) rows.push(current);

    const parseRow = (row: string) =>
      row.replace(/^\||\|$/g, "").split("|").map(c => c.trim());

    const header = rows[0];
    const sepIdx = rows.findIndex((r, i) => i > 0 && /^\|[-:| ]+\|$/.test(r));
    const bodyRows = rows.slice(sepIdx > 0 ? sepIdx + 1 : 2);

    const headerCells = parseRow(header);
    const colCount = headerCells.length;

    const thead = `<thead><tr>${headerCells.map(c => `<th>${c}</th>`).join("")}</tr></thead>`;
    const tbody = `<tbody>${bodyRows
      .filter(r => r.trim() && !/^\|[-:| ]+\|$/.test(r))
      .map(r => {
        const cells = parseRow(r);
        // Pad missing cells to match header column count
        while (cells.length < colCount) cells.push("");
        return `<tr>${cells.slice(0, colCount).map(c => `<td>${c}</td>`).join("")}</tr>`;
      })
      .join("")}</tbody>`;

    out.push(`<div class="notion-table-wrap"><table class="notion-table">${thead}${tbody}</table></div>`);
    tableLines = [];
  }

  let inTable = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    const isTableLine = trimmed.startsWith("|") && trimmed.endsWith("|");
    const isSep = /^\|[-:| ]+\|$/.test(trimmed);

    if (isTableLine || isSep) {
      inTable = true;
      tableLines.push(line);
    } else if (inTable && trimmed && !isTableLine) {
      // Check if next line is a table line (continuation scenario)
      const nextLine = lines[i + 1]?.trim() ?? "";
      if (nextLine.startsWith("|")) {
        // This is a continuation of the previous cell
        tableLines.push(line);
      } else {
        // End of table
        flushTable();
        inTable = false;
        out.push(line);
      }
    } else {
      if (inTable) { flushTable(); inTable = false; }
      out.push(line);
    }
  }
  if (inTable) flushTable();
  return out.join("\n");
}

export function markdownToHtml(md: string): string {
  if (!md) return "<p>Content coming soon.</p>";
  let html = md;

  // ── Handle columns first (before other parsing) ───────────────────────────
  html = parseColumns(html);

  // ── Handle tables ─────────────────────────────────────────────────────────
  html = parseTables(html);

  // ── Strip markdown image wrappers around video URLs ──────────────────────
  html = html.replace(/!\[([^\]]*)\]\((https?:\/\/[^)]+)\)/g, (_, alt, url) => {
    if (isVideo(url)) return mediaCard(url, alt, "video");
    if (isFigma(url)) return mediaCard(url, alt, "figma");
    return mediaCard(url, alt, "image");
  });

  // ── Bare video URLs ───────────────────────────────────────────────────────
  html = html.replace(
    /(^|[\s\n])(https?:\/\/(?:(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)[a-zA-Z0-9_-]{11}|(?:www\.)?loom\.com\/share\/[a-zA-Z0-9]+|(?:www\.)?vimeo\.com\/\d+)[^\s<"]*)/gm,
    (_, pre, url) => `${pre}${mediaCard(url, "", "video")}`
  );

  // ── Figma bare URLs ───────────────────────────────────────────────────────
  html = html.replace(
    /(^|[\s\n])(https?:\/\/(?:www\.)?figma\.com\/(?:file|proto|design)\/[^\s<"]+)/gm,
    (_, pre, url) => `${pre}${mediaCard(url, "Figma prototype", "figma")}`
  );

  // ── Notion S3 image URLs (bare) ───────────────────────────────────────────
  html = html.replace(
    /^(https?:\/\/prod-files[^\s]+|https?:\/\/[^\s]+notion[^\s]*\.(?:png|jpg|jpeg|gif|webp))(\s*)$/gm,
    (_, url) => mediaCard(url, "", "image")
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

  // ── Lists ─────────────────────────────────────────────────────────────────
  html = html.replace(/^[ \t]*[-*+] (.+)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>[\s\S]*?<\/li>\n?)+/g, m => `<ul>${m}</ul>`);
  html = html.replace(/^\d+\. (.+)$/gm, "<oli>$1</oli>");
  html = html.replace(/(<oli>[\s\S]*?<\/oli>\n?)+/g, m => `<ol>${m.replace(/<\/?oli>/g, t => t.replace("oli","li"))}</ol>`);

  // ── Links (after media patterns) ─────────────────────────────────────────
  // Video/Figma links in text → clickable media cards
  html = html.replace(
    /\[([^\]]+)\]\((https?:\/\/(?:(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)[a-zA-Z0-9_-]{11}|(?:www\.)?loom\.com\/share\/[a-zA-Z0-9]+|(?:www\.)?vimeo\.com\/\d+|(?:www\.)?figma\.com\/[^\s)]+)[^)]*)\)/g,
    (_, label, url) => {
      const type = isFigma(url) ? "figma" : "video";
      return mediaCard(url, label, type);
    }
  );
  // Button blocks from Notion: [button:Label](url) → styled button
  html = html.replace(
    /\[button:([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener" class="notion-btn">$1 ↗</a>'
  );
  // Regular links
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" class="prose-link">$1 ↗</a>');

  // ── Paragraphs ────────────────────────────────────────────────────────────
  const BLOCK = /^<(h[1-6]|ul|ol|li|blockquote|div|hr|iframe|pre|figure)/;
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
