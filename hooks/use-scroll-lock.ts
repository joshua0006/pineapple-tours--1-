import { useEffect } from 'react'

interface UseScrollLockOptions {
  enabled?: boolean
  allowScrollInside?: string[] // CSS selectors for elements that should allow scrolling
}

export function useScrollLock(options: UseScrollLockOptions = {}) {
  const { enabled = true, allowScrollInside = ['.modal-content'] } = options

  useEffect(() => {
    if (!enabled) return

    // Store original styles
    const originalOverflow = document.body.style.overflow
    const originalPaddingRight = document.body.style.paddingRight
    const originalPosition = document.body.style.position
    const originalTop = document.body.style.top
    const originalLeft = document.body.style.left
    const originalRight = document.body.style.right
    const originalBottom = document.body.style.bottom
    const originalWidth = document.body.style.width
    const originalHeight = document.body.style.height
    
    // Get current scroll position
    const scrollY = window.scrollY
    const scrollX = window.scrollX
    
    // Get scrollbar width to prevent layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    
    // Apply scroll lock
    document.body.style.overflow = 'hidden'
    document.body.style.paddingRight = `${scrollbarWidth}px`
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.left = `-${scrollX}px`
    document.body.style.width = '100%'
    document.body.style.height = '100%'
    
    // Add class for additional styling
    document.body.classList.add('scroll-lock')
    
    // Prevent touch scrolling on mobile devices
    const preventTouchMove = (e: TouchEvent) => {
      // Allow scrolling within specified elements
      let target = e.target as Element
      while (target && target !== document.body) {
        // Check if target is within an allowed scrolling area
        for (const selector of allowScrollInside) {
          if (target.matches?.(selector) || target.closest?.(selector)) {
            return
          }
        }
        
        // Check if element is scrollable
        if (target.scrollHeight > target.clientHeight || 
            target.scrollWidth > target.clientWidth) {
          return
        }
        
        target = target.parentElement as Element
      }
      
      // Prevent default touch behavior
      e.preventDefault()
    }
    
    // Add touch event listener with passive: false to allow preventDefault
    document.addEventListener('touchmove', preventTouchMove, { passive: false })
    
    // Prevent wheel scrolling
    const preventWheel = (e: WheelEvent) => {
      let target = e.target as Element
      while (target && target !== document.body) {
        for (const selector of allowScrollInside) {
          if (target.matches?.(selector) || target.closest?.(selector)) {
            return
          }
        }
        target = target.parentElement as Element
      }
      e.preventDefault()
    }
    
    document.addEventListener('wheel', preventWheel, { passive: false })
    
    // Cleanup function
    return () => {
      // Restore original styles
      document.body.style.overflow = originalOverflow
      document.body.style.paddingRight = originalPaddingRight
      document.body.style.position = originalPosition
      document.body.style.top = originalTop
      document.body.style.left = originalLeft
      document.body.style.right = originalRight
      document.body.style.bottom = originalBottom
      document.body.style.width = originalWidth
      document.body.style.height = originalHeight
      
      // Remove class
      document.body.classList.remove('scroll-lock')
      
      // Remove event listeners
      document.removeEventListener('touchmove', preventTouchMove)
      document.removeEventListener('wheel', preventWheel)
      
      // Restore scroll position
      window.scrollTo(scrollX, scrollY)
    }
  }, [enabled, allowScrollInside])
} 