import fs from 'fs';
import path from 'path';
import { RezdyProduct } from '@/lib/types/rezdy';

export interface DownloadedImage {
  originalUrl: string;
  localPath: string;
  filename: string;
  alt: string;
  productId?: string;
  productCode?: string;
  productName?: string;
  productPrice?: number;
  productDescription?: string;
}

/**
 * Download an image from a URL and save it to the public directory
 */
export async function downloadImage(
  imageUrl: string, 
  filename: string, 
  subfolder: string = 'hop-on-hop-off'
): Promise<string | null> {
  try {
    // Create the directory if it doesn't exist
    const publicDir = path.join(process.cwd(), 'public', subfolder);
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // Download the image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.error(`Failed to download image: ${response.status} ${response.statusText}`);
      return null;
    }

    const buffer = await response.arrayBuffer();
    const filePath = path.join(publicDir, filename);
    
    // Write the file
    fs.writeFileSync(filePath, Buffer.from(buffer));
    
    // Return the public path
    return `/${subfolder}/${filename}`;
  } catch (error) {
    console.error('Error downloading image:', error);
    return null;
  }
}

/**
 * Get file extension from URL
 */
function getFileExtension(url: string): string {
  const urlParts = url.split('?')[0]; // Remove query parameters
  const extension = path.extname(urlParts);
  return extension || '.jpg'; // Default to .jpg if no extension found
}

/**
 * Generate a safe filename from product name and image index
 */
function generateFilename(productName: string, imageIndex: number, originalUrl: string): string {
  const safeName = productName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  const extension = getFileExtension(originalUrl);
  return `${safeName}-${imageIndex}${extension}`;
}

/**
 * Download images from hop-on-hop-off products
 */
export async function downloadHopOnHopOffImages(): Promise<DownloadedImage[]> {
  try {
    // Fetch products from Rezdy API
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/rezdy/products?limit=1000`);
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }

    const data = await response.json();
    const products: RezdyProduct[] = data.products || data.data || [];

    // Filter hop-on-hop-off products
    const hopOnHopOffProducts = products.filter(product => 
      product.name.toLowerCase().includes('hop on hop off') ||
      product.name.toLowerCase().includes('hop-on-hop-off') ||
      product.shortDescription?.toLowerCase().includes('hop on hop off') ||
      product.description?.toLowerCase().includes('hop on hop off')
    );

    console.log(`Found ${hopOnHopOffProducts.length} hop-on-hop-off products`);

    const downloadedImages: DownloadedImage[] = [];

    // Download images from the first few products (limit to avoid too many downloads)
    const productsToProcess = hopOnHopOffProducts.slice(0, 5);

    for (const product of productsToProcess) {
      if (!product.images || product.images.length === 0) continue;

      // Download up to 2 images per product
      const imagesToDownload = product.images.slice(0, 2);

      for (let i = 0; i < imagesToDownload.length; i++) {
        const image = imagesToDownload[i];
        const filename = generateFilename(product.name, i + 1, image.largeSizeUrl);
        
        const localPath = await downloadImage(image.largeSizeUrl, filename);
        
        if (localPath) {
          downloadedImages.push({
            originalUrl: image.largeSizeUrl,
            localPath,
            filename,
            alt: image.caption || `${product.name} - Image ${i + 1}`,
            productId: product.productCode,
            productCode: product.productCode,
            productName: product.name,
            productPrice: product.advertisedPrice,
            productDescription: product.shortDescription || product.description
          });
        }
      }
    }

    console.log(`Downloaded ${downloadedImages.length} images`);
    return downloadedImages;

  } catch (error) {
    console.error('Error downloading hop-on-hop-off images:', error);
    return [];
  }
}

/**
 * Get existing downloaded images from the hop-on-hop-off directory
 */
export function getExistingHopOnHopOffImages(): DownloadedImage[] {
  try {
    const publicDir = path.join(process.cwd(), 'public', 'hop-on-hop-off');
    
    if (!fs.existsSync(publicDir)) {
      return [];
    }

    const files = fs.readdirSync(publicDir);
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|webp|gif)$/i.test(file)
    );

    return imageFiles.map((filename, index) => ({
      originalUrl: '',
      localPath: `/hop-on-hop-off/${filename}`,
      filename,
      alt: `Hop on Hop off Tour - Image ${index + 1}`
    }));

  } catch (error) {
    console.error('Error reading existing images:', error);
    return [];
  }
} 