/**
 * Comprehensive HTML entity decoder for WordPress content
 * Handles both common HTML entities and WordPress-specific patterns
 */
export function decodeHtmlEntities(text: string): string {
  if (!text) return text;

  try {
    // Create a temporary DOM element to decode HTML entities (client-side)
    if (typeof window !== "undefined") {
      const textarea = document.createElement("textarea");
      textarea.innerHTML = text
        .replace(/\[&hellip;\]/g, "…")
        .replace(/\[…\]/g, "…");
      return textarea.value;
    }

    // Fallback for server-side rendering or when DOM is not available
    return text
      .replace(/&nbsp;/g, " ")
      .replace(/&hellip;/g, "…")
      .replace(/\[&hellip;\]/g, "…")
      .replace(/\[…\]/g, "…")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#8217;/g, "'")
      .replace(/&#8216;/g, "'")
      .replace(/&#8220;/g, "\u201C") // Left double quote
      .replace(/&#8221;/g, "\u201D") // Right double quote
      .replace(/&#8211;/g, "–") // En dash
      .replace(/&#8212;/g, "—") // Em dash
      .replace(/&#039;/g, "'")
      .replace(/&rsquo;/g, "'")
      .replace(/&lsquo;/g, "'")
      .replace(/&rdquo;/g, "\u201D")
      .replace(/&ldquo;/g, "\u201C")
      .replace(/&ndash;/g, "–")
      .replace(/&mdash;/g, "—")
      .replace(/&apos;/g, "'")
      .replace(/&#x27;/g, "'")
      .replace(/&#x2F;/g, "/")
      .replace(/&#x60;/g, "`")
      .replace(/&#x3D;/g, "=");
  } catch {
    // Final fallback for any errors
    return text
      .replace(/&nbsp;/g, " ")
      .replace(/&hellip;/g, "…")
      .replace(/\[&hellip;\]/g, "…")
      .replace(/\[…\]/g, "…")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#8217;/g, "'")
      .replace(/&#8216;/g, "'")
      .replace(/&#8220;/g, "\u201C")
      .replace(/&#8221;/g, "\u201D")
      .replace(/&#8211;/g, "–")
      .replace(/&#8212;/g, "—")
      .replace(/&#039;/g, "'")
      .replace(/&rsquo;/g, "'")
      .replace(/&lsquo;/g, "'")
      .replace(/&rdquo;/g, "\u201D")
      .replace(/&ldquo;/g, "\u201C")
      .replace(/&ndash;/g, "–")
      .replace(/&mdash;/g, "—")
      .replace(/&apos;/g, "'")
      .replace(/&#x27;/g, "'")
      .replace(/&#x2F;/g, "/")
      .replace(/&#x60;/g, "`")
      .replace(/&#x3D;/g, "=");
  }
}

/**
 * Strips HTML tags from text while preserving entities
 */
export function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

/**
 * Combines HTML tag stripping and entity decoding
 */
export function cleanHtmlText(html: string): string {
  return decodeHtmlEntities(stripHtmlTags(html));
}
