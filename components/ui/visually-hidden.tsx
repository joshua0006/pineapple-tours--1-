import * as React from "react"
import { cn } from "@/lib/utils"

interface VisuallyHiddenProps extends React.HTMLAttributes<HTMLSpanElement> {}

/**
 * VisuallyHidden component for accessibility
 * 
 * This component hides content visually while keeping it accessible to screen readers.
 * It's useful for providing additional context or labels that are needed for accessibility
 * but would be redundant or cluttering for sighted users.
 * 
 * @example
 * <VisuallyHidden>Additional context for screen readers</VisuallyHidden>
 * 
 * @example
 * <button>
 *   <Icon />
 *   <VisuallyHidden>Close dialog</VisuallyHidden>
 * </button>
 */
export const VisuallyHidden = React.forwardRef<
  HTMLSpanElement,
  VisuallyHiddenProps
>(({ className, ...props }, ref) => {
  return (
    <span
      ref={ref}
      className={cn(
        // Visually hidden but accessible to screen readers
        "absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0",
        className
      )}
      {...props}
    />
  )
})

VisuallyHidden.displayName = "VisuallyHidden" 