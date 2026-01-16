import { marked, Renderer } from 'marked';

/**
 * Content segment types for rendering
 */
export type ContentSegment =
  | { type: 'html'; content: string }
  | { type: 'code'; code: string; language: string };

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
  return `<!--CODE_BLOCK:${language}:${encoded}-->`;
};

// Configure marked options
marked.setOptions({
  renderer,
  gfm: true,
  breaks: false,
});

/**
 * Parse Markdown content into segments (HTML and code blocks)
 * This allows rendering code blocks as Angular components
 */
export function parseMarkdownToSegments(markdown: string): ContentSegment[] {
  if (!markdown) {
    return [];
  }

  const html = marked.parse(markdown) as string;
  const segments: ContentSegment[] = [];

  // Split by code block placeholders
  const parts = html.split(/<!--CODE_BLOCK:([^:]+):([^-]+)-->/);

  for (let i = 0; i < parts.length; i++) {
    if (i % 3 === 0) {
      // Regular HTML content
      const content = parts[i].trim();
      if (content) {
        segments.push({ type: 'html', content });
      }
    } else if (i % 3 === 1) {
      // Language (next part will be code)
      const language = parts[i];
      const codeBase64 = parts[i + 1];
      try {
        const code = decodeURIComponent(atob(codeBase64));
        segments.push({ type: 'code', code, language });
      } catch {
        // If base64 decode fails, skip this block
      }
      i++; // Skip the code part since we processed it
    }
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
