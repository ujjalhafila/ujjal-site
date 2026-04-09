export function markdownToHtml(md: string): string {
  if (!md) return "";
  let html = md;

  // YouTube embeds
  html = html.replace(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/g,
    '<div class="embed-video"><iframe src="https://www.youtube.com/embed/$1" allowfullscreen loading="lazy" title="YouTube video"></iframe></div>');

  // Loom embeds
  html = html.replace(/https?:\/\/www\.loom\.com\/share\/([a-zA-Z0-9]+)/g,
    '<div class="embed-video"><iframe src="https://www.loom.com/embed/$1" allowfullscreen loading="lazy" title="Loom video"></iframe></div>');

  // Figma embeds
  html = html.replace(/https?:\/\/(?:www\.)?figma\.com\/(file|proto|design)\/([^)\s"]+)/g,
    '<div class="embed-figma"><iframe src="https://www.figma.com/embed?embed_host=share&url=https://www.figma.com/$1/$2" allowfullscreen loading="lazy" title="Figma prototype"></iframe><a href="https://www.figma.com/$1/$2" target="_blank" rel="noopener" class="embed-link">Open in Figma ↗</a></div>');

  // Vimeo
  html = html.replace(/https?:\/\/vimeo\.com\/(\d+)/g,
    '<div class="embed-video"><iframe src="https://player.vimeo.com/video/$1" allowfullscreen loading="lazy" title="Vimeo video"></iframe></div>');

  // Images from notion (file URLs)
  html = html.replace(/!\[([^\]]*)\]\((https?:\/\/[^)]+)\)/g,
    '<figure class="embed-image"><img src="$2" alt="$1" loading="lazy"/><figcaption>$1</figcaption></figure>');

  // Headings
  html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Bold / italic / code
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Blockquote
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

  // HR
  html = html.replace(/^---$/gm, '<hr/>');

  // Lists
  html = html.replace(/^(\s*)-\s(.+)$/gm, '<li>$2</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/gs, '<ul>$&</ul>');
  html = html.replace(/^\d+\.\s(.+)$/gm, '<li>$1</li>');

  // Links
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

  // Paragraphs — wrap lines not already in block tags
  const lines = html.split('\n');
  const result: string[] = [];
  let inPara = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (inPara) { result.push('</p>'); inPara = false; }
      continue;
    }
    const isBlock = /^<(h[1-6]|ul|ol|li|blockquote|figure|div|hr|iframe)/.test(trimmed);
    if (isBlock) {
      if (inPara) { result.push('</p>'); inPara = false; }
      result.push(trimmed);
    } else {
      if (!inPara) { result.push('<p>'); inPara = true; }
      result.push(trimmed);
    }
  }
  if (inPara) result.push('</p>');
  return result.join('\n');
}
