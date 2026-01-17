import { marked, Renderer } from 'marked';

/**
 * Content segment types for rendering
 */
export type ContentSegment =
  | { type: 'html'; content: string }
  | { type: 'code'; code: string; language: string }
  | { type: 'diagram'; code: string };

/**
 * Custom renderer that doesn't render code blocks
 * (we handle them separately as Angular components)
 */
const renderer = new Renderer();

// Add IDs to headings for anchor links
renderer.heading = ({ text, depth }): string => {
  const id = text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
  return `<h${depth} id="${id}">${text}</h${depth}>`;
};

// Return placeholder for code blocks (we'll extract them separately)
renderer.code = ({ text, lang }): string => {
  const language = lang || 'plaintext';
  // Use a unique placeholder that we can split on
  // btoa works with UTF-8 via encodeURIComponent
  const encoded = btoa(encodeURIComponent(text));

  // Mermaid diagrams get a separate placeholder
  if (language === 'mermaid') {
    return `<!--DIAGRAM_BLOCK:${encoded}-->`;
  }

  return `<!--CODE_BLOCK:${language}:${encoded}-->`;
};

// Configure marked options
marked.setOptions({
  renderer,
  gfm: true,
  breaks: false,
});

/**
 * Parse Markdown content into segments (HTML, code blocks, and diagrams)
 * This allows rendering code blocks and diagrams as Angular components
 */
export function parseMarkdownToSegments(markdown: string): ContentSegment[] {
  if (!markdown) {
    return [];
  }

  const html = marked.parse(markdown) as string;
  const segments: ContentSegment[] = [];

  // Combined regex to match both CODE_BLOCK and DIAGRAM_BLOCK placeholders
  const blockRegex = /<!--(CODE_BLOCK|DIAGRAM_BLOCK):([^:>]+)(?::([^>]+))?-->/g;

  let lastIndex = 0;
  let match;

  while ((match = blockRegex.exec(html)) !== null) {
    // Add HTML content before this block
    const htmlContent = html.slice(lastIndex, match.index).trim();
    if (htmlContent) {
      segments.push({ type: 'html', content: htmlContent });
    }

    const blockType = match[1];

    try {
      if (blockType === 'DIAGRAM_BLOCK') {
        // Diagram block: <!--DIAGRAM_BLOCK:base64-->
        const codeBase64 = match[2];
        const code = decodeURIComponent(atob(codeBase64));
        segments.push({ type: 'diagram', code });
      } else {
        // Code block: <!--CODE_BLOCK:language:base64-->
        const language = match[2];
        const codeBase64 = match[3];
        const code = decodeURIComponent(atob(codeBase64));
        segments.push({ type: 'code', code, language });
      }
    } catch {
      // If base64 decode fails, skip this block
    }

    lastIndex = match.index + match[0].length;
  }

  // Add any remaining HTML content
  const remainingHtml = html.slice(lastIndex).trim();
  if (remainingHtml) {
    segments.push({ type: 'html', content: remainingHtml });
  }

  return segments;
}

/**
 * Parse Markdown content to HTML (legacy, for simple cases)
 * Note: Code blocks are rendered as simple HTML without syntax highlighting
 */
export function parseMarkdown(markdown: string): string {
  if (!markdown) {
    return '';
  }

  // Simple regex-based approach for legacy usage (search provider)
  // Replace code blocks with escaped HTML
  let processed = markdown;

  // Handle fenced code blocks
  processed = processed.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const language = lang || 'plaintext';
    return `<pre><code class="language-${language}">${escapeHtml(code.trim())}</code></pre>`;
  });

  // Handle inline code
  processed = processed.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Handle headers
  processed = processed.replace(/^#{6}\s+(.+)$/gm, '<h6>$1</h6>');
  processed = processed.replace(/^#{5}\s+(.+)$/gm, '<h5>$1</h5>');
  processed = processed.replace(/^#{4}\s+(.+)$/gm, '<h4>$1</h4>');
  processed = processed.replace(/^#{3}\s+(.+)$/gm, '<h3>$1</h3>');
  processed = processed.replace(/^#{2}\s+(.+)$/gm, '<h2>$1</h2>');
  processed = processed.replace(/^#{1}\s+(.+)$/gm, '<h1>$1</h1>');

  // Handle bold
  processed = processed.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // Handle italic
  processed = processed.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Handle links
  processed = processed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Handle paragraphs (basic)
  processed = processed.replace(/\n\n/g, '</p><p>');
  processed = `<p>${processed}</p>`;

  return processed;
}

/**
 * Extract plain text from Markdown (for search indexing)
 */
export function extractPlainText(markdown: string): string {
  if (!markdown) {
    return '';
  }
  let text = markdown;
  // Remove code blocks
  text = text.replace(/```[\s\S]*?```/g, '');
  // Remove inline code
  text = text.replace(/`[^`]+`/g, '');
  // Remove headers markers
  text = text.replace(/^#{1,6}\s+/gm, '');
  // Remove emphasis
  text = text.replace(/[*_]{1,2}([^*_]+)[*_]{1,2}/g, '$1');
  // Remove links but keep text
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  // Remove images
  text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, '');
  // Remove blockquotes
  text = text.replace(/^>\s+/gm, '');
  // Remove horizontal rules
  text = text.replace(/^[-*_]{3,}$/gm, '');
  // Normalize whitespace
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
