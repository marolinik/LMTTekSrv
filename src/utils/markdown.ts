/**
 * Converts markdown text to HTML with basic formatting support
 * Supports: headers, bold, italic, links, lists, code blocks, inline code
 */
export function markdownToHtml(markdown: string): string {
  let html = markdown;

  // Code blocks (must come before inline code)
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_match, lang, code) => {
    return `<pre><code class="language-${lang || 'text'}">${escapeHtml(code.trim())}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Bold
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // Unordered lists
  html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

  // Ordered lists
  html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>');

  // Line breaks
  html = html.replace(/\n\n/g, '</p><p>');
  html = html.replace(/\n/g, '<br>');

  // Wrap in paragraph if not already wrapped
  if (!html.startsWith('<')) {
    html = '<p>' + html + '</p>';
  }

  return html;
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}
