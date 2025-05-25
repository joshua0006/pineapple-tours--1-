import { useState } from 'react'
import { ChevronDown, ChevronUp, FileText, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HtmlContent } from '@/components/ui/html-content'
import { cn } from '@/lib/utils'

interface DescriptionDisplayProps {
  title?: string
  description?: string
  shortDescription?: string
  className?: string
  showCard?: boolean
  maxLength?: number
  allowExpansion?: boolean
}

export function DescriptionDisplay({
  title = "Description",
  description,
  shortDescription,
  className,
  showCard = false,
  maxLength = 500,
  allowExpansion = true
}: DescriptionDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  // Determine which content to display
  const primaryContent = description || shortDescription
  const hasContent = Boolean(primaryContent?.trim())
  const hasLongContent = primaryContent && primaryContent.length > maxLength
  
  if (!hasContent || !primaryContent) {
    return (
      <Card className={cn("border-dashed", className)}>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            No description available
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Description content will be displayed here when available.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Check if content contains HTML
  const isHtmlContent = /<[^>]*>/g.test(primaryContent)
  
  const content = (
    <div className="space-y-4">
      {/* Content Display */}
      <div className="relative">
        {isHtmlContent ? (
          <HtmlContent 
            content={primaryContent}
            maxLength={!isExpanded && hasLongContent ? maxLength : undefined}
            className="text-base leading-relaxed"
          />
        ) : (
          <div className="text-base leading-relaxed text-muted-foreground">
            {!isExpanded && hasLongContent 
              ? `${primaryContent.substring(0, maxLength).trim()}...`
              : primaryContent
            }
          </div>
        )}
        
        {/* Fade overlay for long content */}
        {!isExpanded && hasLongContent && (
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent pointer-events-none" />
        )}
      </div>

      {/* Expand/Collapse Button */}
      {allowExpansion && hasLongContent && (
        <div className="flex justify-center pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
            aria-expanded={isExpanded}
            aria-controls="description-content"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                Read More
              </>
            )}
          </Button>
        </div>
      )}

    </div>
  )

  if (showCard) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2 text-yellow-500" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent id="description-content">
          {content}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={className}>
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <FileText className="h-6 w-6 mr-2 text-yellow-500" />
        {title}
      </h2>
      <div id="description-content">
        {content}
      </div>
    </div>
  )
} 