const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Configuration
const REZDY_API_KEY = process.env.REZDY_API_KEY;
const REZDY_BASE_URL = 'https://api.rezdy.com/v1';

if (!REZDY_API_KEY) {
  console.error('❌ REZDY_API_KEY not found in environment variables');
  console.log('💡 Please set REZDY_API_KEY in your environment');
  process.exit(1);
}

/**
 * Download an image from a URL and save it to the public directory
 */
async function downloadImage(imageUrl, filename, subfolder = 'hop-on-hop-off') {
  return new Promise((resolve, reject) => {
    try {
      // Create the directory if it doesn't exist
      const publicDir = path.join(process.cwd(), 'public', subfolder);
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }

      const filePath = path.join(publicDir, filename);
      const file = fs.createWriteStream(filePath);

      // Choose http or https based on URL
      const client = imageUrl.startsWith('https:') ? https : http;

      client.get(imageUrl, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download image: ${response.statusCode} ${response.statusMessage}`));
          return;
        }

        response.pipe(file);

        file.on('finish', () => {
          file.close();
          console.log(`✅ Downloaded: ${filename}`);
          resolve(`/${subfolder}/${filename}`);
        });

        file.on('error', (err) => {
          fs.unlink(filePath, () => {}); // Delete the file on error
          reject(err);
        });
      }).on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Get file extension from URL
 */
function getFileExtension(url) {
  const urlParts = url.split('?')[0]; // Remove query parameters
  const extension = path.extname(urlParts);
  return extension || '.jpg'; // Default to .jpg if no extension found
}

/**
 * Generate a safe filename from product name and image index
 */
function generateFilename(productName, imageIndex, originalUrl) {
  const safeName = productName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  const extension = getFileExtension(originalUrl);
  return `${safeName}-${imageIndex}${extension}`;
}

/**
 * Fetch products from Rezdy API
 */
async function fetchProducts() {
  return new Promise((resolve, reject) => {
    const url = `${REZDY_BASE_URL}/products?apiKey=${REZDY_API_KEY}&limit=1000&offset=0`;
    
    https.get(url, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData.products || jsonData.data || []);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Main function to download hop-on-hop-off images
 */
async function downloadHopOnHopOffImages() {
  try {
    console.log('🔍 Fetching products from Rezdy API...');
    const products = await fetchProducts();
    console.log(`✅ Fetched ${products.length} products`);

    // Filter hop-on-hop-off products
    const hopOnHopOffProducts = products.filter(product => 
      product.name.toLowerCase().includes('hop on hop off') ||
      product.name.toLowerCase().includes('hop-on-hop-off') ||
      (product.shortDescription && product.shortDescription.toLowerCase().includes('hop on hop off')) ||
      (product.description && product.description.toLowerCase().includes('hop on hop off'))
    );

    console.log(`🎯 Found ${hopOnHopOffProducts.length} hop-on-hop-off products`);

    if (hopOnHopOffProducts.length === 0) {
      console.log('❌ No hop-on-hop-off products found');
      return [];
    }

    // Show the products we found
    console.log('\n📋 Hop-on-hop-off products found:');
    hopOnHopOffProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} (${product.images?.length || 0} images)`);
    });

    const downloadedImages = [];

    // Download images from the first few products (limit to avoid too many downloads)
    const productsToProcess = hopOnHopOffProducts.slice(0, 5);
    console.log(`\n📥 Processing ${productsToProcess.length} products for image download...`);

    for (const product of productsToProcess) {
      if (!product.images || product.images.length === 0) {
        console.log(`⚠️  No images found for: ${product.name}`);
        continue;
      }

      console.log(`\n🖼️  Processing images for: ${product.name}`);
      
      // Download up to 2 images per product
      const imagesToDownload = product.images.slice(0, 2);

      for (let i = 0; i < imagesToDownload.length; i++) {
        const image = imagesToDownload[i];
        const filename = generateFilename(product.name, i + 1, image.largeSizeUrl);
        
        try {
          const localPath = await downloadImage(image.largeSizeUrl, filename);
          
          downloadedImages.push({
            originalUrl: image.largeSizeUrl,
            localPath,
            filename,
            alt: image.caption || `${product.name} - Image ${i + 1}`
          });
        } catch (error) {
          console.error(`❌ Failed to download ${filename}:`, error.message);
        }
      }
    }

    console.log(`\n🎉 Successfully downloaded ${downloadedImages.length} images`);
    
    // Save the image metadata to a JSON file
    const metadataPath = path.join(process.cwd(), 'public', 'hop-on-hop-off', 'images-metadata.json');
    fs.writeFileSync(metadataPath, JSON.stringify(downloadedImages, null, 2));
    console.log('💾 Saved image metadata to images-metadata.json');

    return downloadedImages;

  } catch (error) {
    console.error('❌ Error downloading hop-on-hop-off images:', error);
    return [];
  }
}

// Run the script
if (require.main === module) {
  downloadHopOnHopOffImages()
    .then((images) => {
      console.log(`\n✨ Download complete! ${images.length} images ready to use.`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = { downloadHopOnHopOffImages }; 