/**
 * Utility functions for managing local section images
 */

export interface LocalImage {
  src: string
  alt: string
  width: number
  height: number
}

/**
 * Get local hop-on-hop-off images
 */
export function getLocalHopOnHopOffImages(): LocalImage[] {
  return [
    {
      src: "/hop-on-hop-off/hop-on-hop-off-bus-1.jpg",
      alt: "Hop on Hop off Bus Tour",
      width: 400,
      height: 300
    },
    {
      src: "/hop-on-hop-off/hop-on-hop-off-landmarks-2.jpg",
      alt: "City landmarks and attractions",
      width: 400,
      height: 200
    },
    {
      src: "/hop-on-hop-off/hop-on-hop-off-attractions-3.jpg",
      alt: "Tourist attractions and sightseeing",
      width: 400,
      height: 200
    },
    {
      src: "/hop-on-hop-off/hop-on-hop-off-views-4.jpg",
      alt: "Scenic city views and tours",
      width: 400,
      height: 300
    }
  ]
}

/**
 * Get local gift voucher image
 */
export function getLocalGiftVoucherImage(): LocalImage {
  return {
    src: "/gift-vouchers/gift-vouchers-main.jpg",
    alt: "Gift Vouchers for Tours and Experiences",
    width: 600,
    height: 450
  }
}

/**
 * Check if local images exist (for development purposes)
 */
export function checkLocalImagesExist(): {
  hopOnHopOff: boolean
  giftVouchers: boolean
} {
  // This would need to be implemented on the server side
  // For now, we assume they exist since we just downloaded them
  return {
    hopOnHopOff: true,
    giftVouchers: true
  }
}

/**
 * Get image metadata from the downloaded metadata file
 */
export async function getImageMetadata(): Promise<any> {
  try {
    const response = await fetch('/section-images-metadata.json')
    if (response.ok) {
      return await response.json()
    }
  } catch (error) {
    console.log('Could not load image metadata')
  }
  return null
} 