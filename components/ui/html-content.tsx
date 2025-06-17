import { useMemo } from "react";
import DOMPurify from "isomorphic-dompurify";
import { cn } from "@/lib/utils";
import { decodeHtmlEntities } from "@/lib/utils/html-entities";

interface HtmlContentProps {
  content: string;
  className?: string;
  maxLength?: number;
  showReadMore?: boolean;
}

export function HtmlContent({
  content,
  className,
  maxLength,
  showReadMore = false,
}: HtmlContentProps) {
  const sanitizedContent = useMemo(() => {
    if (!content) return "";

    // First decode HTML entities
    const decodedContent = decodeHtmlEntities(content);

    // Configure DOMPurify to allow safe HTML tags
    const cleanContent = DOMPurify.sanitize(decodedContent, {
      ALLOWED_TAGS: [
        "p",
        "br",
        "strong",
        "b",
        "em",
        "i",
        "u",
        "ul",
        "ol",
        "li",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "blockquote",
        "a",
        "span",
      ],
      ALLOWED_ATTR: ["href", "target", "rel", "class"],
      ALLOW_DATA_ATTR: false,
    });

    // Truncate if maxLength is specified
    if (maxLength && cleanContent.length > maxLength) {
      const truncated = cleanContent.substring(0, maxLength);
      const lastSpace = truncated.lastIndexOf(" ");
      return lastSpace > 0
        ? truncated.substring(0, lastSpace) + "..."
        : truncated + "...";
    }

    return cleanContent;
  }, [content, maxLength]);

  if (!sanitizedContent) {
    return null;
  }

  return (
    <div
      className={cn(
        "prose prose-gray max-w-none",
        "prose-headings:text-foreground prose-headings:font-semibold",
        "prose-p:text-muted-foreground prose-p:leading-relaxed",
        "prose-strong:text-foreground prose-strong:font-semibold",
        "prose-a:text-coral-600 prose-a:no-underline hover:prose-a:underline",
        "prose-ul:text-muted-foreground prose-ol:text-muted-foreground",
        "prose-li:text-muted-foreground",
        "prose-blockquote:border-l-coral-500 prose-blockquote:text-muted-foreground",
        className
      )}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      role="region"
      aria-label="Tour description content"
    />
  );
}
