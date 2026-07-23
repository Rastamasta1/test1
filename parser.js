/**
 * parseMarkdown: pure function, converts markdown string to HTML string.
 * Handles headings, bold, italic, inline code, code blocks, links, images,
 * unordered lists, ordered lists, blockquotes, horizontal rules, and paragraphs.
 */
export function parseMarkdown(md) {
  if (!md) return '';

  let html = md;

  // Normalize line endings
  html = html.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Fenced code blocks (``` ... ```)
  html = html.replace(/```([\s\S]*?)```/g, (_, code) => {
    return '<pre><code>' + escapeHtml(code.replace(/^\n/, '').replace(/\n$/, '')) + '</code></pre>';
  });

  // Split into lines for block-level processing
  const lines = html.split('\n');
  const result = [];
  let inList = null; // 'ul' or 'ol'
  let inBlockquote = false;
  let bqLines = [];

  function flushList() {
    if (inList) {
      result.push('</' + inList + '>');
      inList = null;
    }
  }

  function flushBlockquote() {
    if (inBlockquote) {
      result.push('<blockquote>' + parseMarkdown(bqLines.join('\n')) + '</blockquote>');
      inBlockquote = false;
      bqLines = [];
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip lines already wrapped in pre (from code block replacement)
    if (line.startsWith('<pre><code>') || line.startsWith('</code></pre>')) {
      flushList();
      flushBlockquote();
      result.push(line);
      continue;
    }

    // Horizontal rule
    if (/^(---|\*\*\*|___)\s*$/.test(line)) {
      flushList();
      flushBlockquote();
      result.push('<hr />');
      continue;
    }

    // Headings
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      flushList();
      flushBlockquote();
      const level = headingMatch[1].length;
      result.push('<h' + level + '>' + inlineMarkdown(headingMatch[2]) + '</h' + level + '>');
      continue;
    }

    // Blockquote
    const bqMatch = line.match(/^>\s?(.*)$/);
    if (bqMatch) {
      flushList();
      inBlockquote = true;
      bqLines.push(bqMatch[1]);
      continue;
    } else if (inBlockquote) {
      flushBlockquote();
    }

    // Unordered list
    const ulMatch = line.match(/^[*\-+]\s+(.+)$/);
    if (ulMatch) {
      if (inList === 'ol') flushList();
      if (!inList) { result.push('<ul>'); inList = 'ul'; }
      result.push('<li>' + inlineMarkdown(ulMatch[1]) + '</li>');
      continue;
    }

    // Ordered list
    const olMatch = line.match(/^\d+\.\s+(.+)$/);
    if (olMatch) {
      if (inList === 'ul') flushList();
      if (!inList) { result.push('<ol>'); inList = 'ol'; }
      result.push('<li>' + inlineMarkdown(olMatch[1]) + '</li>');
      continue;
    }

    // Blank line
    if (line.trim() === '') {
      flushList();
      flushBlockquote();
      result.push('');
      continue;
    }

    // Paragraph / default
    flushList();
    flushBlockquote();
    result.push('<p>' + inlineMarkdown(line) + '</p>');
  }

  flushList();
  flushBlockquote();

  return result.join('\n');
}

/**
 * inlineMarkdown: processes inline elements (bold, italic, code, links, images)
 */
function inlineMarkdown(text) {
  // Inline code
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Images before links (same syntax but with !)
  text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2" />');

  // Links
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Bold (** or __)
  text = text.replace(/(\*\*|__)(?=\S)(.+?)(?<=\S)\1/g, '<strong>$2</strong>');

  // Italic (* or _)
  text = text.replace(/(\*|_)(?=\S)(.+?)(?<=\S)\1/g, '<em>$2</em>');

  return text;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
