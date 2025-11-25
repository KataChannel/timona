/**
 * Simple HTML Beautifier
 * Formats HTML code with proper indentation and line breaks
 */

export function beautifyHtml(html: string): string {
  if (!html || html.trim() === '') return '';

  let formatted = html;
  let indent = 0;
  const tab = '  '; // 2 spaces
  
  // Self-closing tags
  const selfClosing = ['br', 'hr', 'img', 'input', 'meta', 'link', 'area', 'base', 'col', 'embed', 'param', 'source', 'track', 'wbr'];
  
  // Inline elements that should not force line breaks
  const inline = ['span', 'a', 'strong', 'em', 'b', 'i', 'u', 'code', 'small', 'sub', 'sup'];
  
  // Step 1: Add newlines between tags
  formatted = formatted
    .replace(/>\s*</g, '>\n<')
    .trim();
  
  // Step 2: Split into lines
  const lines = formatted.split('\n');
  const result: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Closing tag - decrease indent before adding line
    if (line.startsWith('</')) {
      indent = Math.max(0, indent - 1);
      result.push(tab.repeat(indent) + line);
      continue;
    }
    
    // Self-closing tag or inline element
    const tagMatch = line.match(/<(\w+)(?:\s|>)/);
    const tagName = tagMatch ? tagMatch[1] : '';
    const isSelfClosing = line.endsWith('/>') || selfClosing.includes(tagName);
    const isInline = inline.includes(tagName);
    
    // Add current line with current indent
    result.push(tab.repeat(indent) + line);
    
    // Opening tag - increase indent after adding line (but not for self-closing or inline)
    if (line.startsWith('<') && !line.startsWith('</') && !isSelfClosing && !isInline) {
      // Check if tag is immediately closed on same line
      const openTag = line.match(/<(\w+)/)?.[1];
      if (openTag && !line.includes(`</${openTag}>`)) {
        indent++;
      }
    }
  }
  
  return result.join('\n');
}

/**
 * Minify HTML by removing unnecessary whitespace
 */
export function minifyHtml(html: string): string {
  return html
    .replace(/\n\s*/g, '') // Remove newlines and indentation
    .replace(/\s{2,}/g, ' ') // Replace multiple spaces with single space
    .replace(/>\s+</g, '><') // Remove spaces between tags
    .trim();
}

/**
 * Add syntax highlighting to HTML code
 * Returns HTML string with span elements for highlighting
 */
export function highlightHtml(html: string): string {
  return html
    // Tags
    .replace(/(&lt;\/?)(\w+)((?:\s+\w+(?:=(?:"[^"]*"|'[^']*'|[^\s>]+))?)*\s*\/?)(&gt;)/g, 
      '<span class="text-blue-600">$1</span><span class="text-purple-600 font-semibold">$2</span><span class="text-green-600">$3</span><span class="text-blue-600">$4</span>')
    // Attributes
    .replace(/(\w+)(=)("[^"]*"|'[^']*')/g, 
      '<span class="text-amber-600">$1</span><span class="text-gray-500">$2</span><span class="text-emerald-600">$3</span>')
    // Text content between tags (preserve it)
    .replace(/>([^<]+)</g, (match, text) => {
      return `><span class="text-gray-700">${text}</span><`;
    });
}

/**
 * Escape HTML for display
 */
export function escapeHtml(html: string): string {
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
