const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

// Configuration
const REZDY_API_KEY = process.env.REZDY_API_KEY;
const REZDY_BASE_URL = "https://api.rezdy.com/v1";

// Default images to download if no Rezdy API key is available
const defaultImages = {
  hopOnHopOff: [
    {
      url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=300&fit=crop&crop=center",
      filename: "hop-on-hop-off-bus-1.jpg",
      alt: "Hop on Hop off Bus Tour",
    },
    {
      url: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=200&fit=crop&crop=center",
      filename: "hop-on-hop-off-landmarks-2.jpg",
      alt: "City landmarks and attractions",
    },
    {
      url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop&crop=center",
      filename: "hop-on-hop-off-attractions-3.jpg",
      alt: "Tourist attractions and sightseeing",
    },
    {
      url: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=300&fit=crop&crop=center",
      filename: "hop-on-hop-off-views-4.jpg",
      alt: "Scenic city views and tours",
    },
  ],
};

/**
 * Download an image from a URL and save it to the public directory
 */
async function downloadImage(imageUrl, filename, subfolder = "") {
  return new Promise((resolve, reject) => {
    try {
      // Create the directory if it doesn't exist
      const publicDir = subfolder
        ? path.join(process.cwd(), "public", subfolder)
        : path.join(process.cwd(), "public");

      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }

      const filePath = path.join(publicDir, filename);
      const file = fs.createWriteStream(filePath);

      // Choose http or https based on URL
      const client = imageUrl.startsWith("https:") ? https : http;

      console.log(`📥 Downloading: ${filename}...`);

      client
        .get(imageUrl, (response) => {
          if (response.statusCode !== 200) {
            reject(
              new Error(
                `Failed to download image: ${response.statusCode} ${response.statusMessage}`
              )
            );
            return;
          }

          response.pipe(file);

          file.on("finish", () => {
            file.close();
            console.log(`✅ Downloaded: ${filename}`);
            const publicPath = subfolder
              ? `/${subfolder}/${filename}`
              : `/${filename}`;
            resolve(publicPath);
          });

          file.on("error", (err) => {
            fs.unlink(filePath, () => {}); // Delete the file on error
            reject(err);
          });
        })
        .on("error", (err) => {
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
  const urlParts = url.split("?")[0]; // Remove query parameters
  const extension = path.extname(urlParts);
  return extension || ".jpg"; // Default to .jpg if no extension found
}

/**
 * Generate a safe filename from product name and image index
 */
function generateFilename(productName, imageIndex, originalUrl, prefix = "") {
  const safeName = productName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  const extension = getFileExtension(originalUrl);
  const finalPrefix = prefix ? `${prefix}-` : "";
  return `${finalPrefix}${safeName}-${imageIndex}${extension}`;
}

/**
 * Fetch products from Rezdy API
 */
async function fetchProducts() {
  if (!REZDY_API_KEY) {
    console.log("⚠️  No Rezdy API key found, will use default images");
    return null;
  }

  return new Promise((resolve, reject) => {
    const url = `${REZDY_BASE_URL}/products?apiKey=${REZDY_API_KEY}&limit=1000&offset=0`;

    console.log("🔍 Fetching products from Rezdy API...");

    https
      .get(url, (response) => {
        let data = "";

        response.on("data", (chunk) => {
          data += chunk;
        });

        response.on("end", () => {
          try {
            const jsonData = JSON.parse(data);
            const products = jsonData.products || jsonData.data || [];
            console.log(`✅ Fetched ${products.length} products from Rezdy`);
            resolve(products);
          } catch (error) {
            reject(error);
          }
        });
      })
      .on("error", (error) => {
        console.log(
          "⚠️  Failed to fetch from Rezdy API, will use default images"
        );
        resolve(null);
      });
  });
}

/**
 * Download Hop on Hop off images
 */
async function downloadHopOnHopOffImages(products) {
  console.log("\n🚌 Processing Hop on Hop off images...");
  const downloadedImages = [];

  if (products) {
    // Filter hop-on-hop-off products
    const hopOnHopOffProducts = products.filter(
      (product) =>
        product.name.toLowerCase().includes("hop on hop off") ||
        product.name.toLowerCase().includes("hop-on-hop-off") ||
        (product.shortDescription &&
          product.shortDescription.toLowerCase().includes("hop on hop off")) ||
        (product.description &&
          product.description.toLowerCase().includes("hop on hop off"))
    );

    console.log(
      `🎯 Found ${hopOnHopOffProducts.length} hop-on-hop-off products`
    );

    // Download images from products with images
    const productsWithImages = hopOnHopOffProducts.filter(
      (product) => product.images && product.images.length > 0
    );

    if (productsWithImages.length > 0) {
      console.log(`📸 Found ${productsWithImages.length} products with images`);

      // Download up to 4 images total
      let imageCount = 0;
      for (const product of productsWithImages) {
        if (imageCount >= 4) break;

        const imagesToDownload = product.images.slice(
          0,
          Math.min(2, 4 - imageCount)
        );

        for (let i = 0; i < imagesToDownload.length; i++) {
          const image = imagesToDownload[i];
          const filename = generateFilename(
            product.name,
            imageCount + 1,
            image.largeSizeUrl,
            "hop-on-hop-off"
          );

          try {
            const localPath = await downloadImage(
              image.largeSizeUrl,
              filename,
              "hop-on-hop-off"
            );
            downloadedImages.push({
              originalUrl: image.largeSizeUrl,
              localPath,
              filename,
              alt: image.caption || `${product.name} - Image ${imageCount + 1}`,
            });
            imageCount++;
          } catch (error) {
            console.error(`❌ Failed to download ${filename}:`, error.message);
          }
        }
      }
    }
  }

  // If we don't have enough images from Rezdy, download default images
  if (downloadedImages.length < 4) {
    console.log(
      `📥 Downloading ${
        4 - downloadedImages.length
      } default hop-on-hop-off images...`
    );

    const imagesToDownload = defaultImages.hopOnHopOff.slice(
      downloadedImages.length
    );

    for (const imageInfo of imagesToDownload) {
      try {
        const localPath = await downloadImage(
          imageInfo.url,
          imageInfo.filename,
          "hop-on-hop-off"
        );
        downloadedImages.push({
          originalUrl: imageInfo.url,
          localPath,
          filename: imageInfo.filename,
          alt: imageInfo.alt,
        });
      } catch (error) {
        console.error(
          `❌ Failed to download ${imageInfo.filename}:`,
          error.message
        );
      }
    }
  }

  return downloadedImages;
}

/**
 * Main function to download all section images
 */
async function downloadAllSectionImages() {
  try {
    console.log("🚀 Starting section images download...\n");

    // Fetch products from Rezdy (or null if no API key)
    const products = await fetchProducts();

    // Download Hop on Hop off images
    const hopOnHopOffImages = await downloadHopOnHopOffImages(products);

    // Save metadata
    const metadata = {
      hopOnHopOff: hopOnHopOffImages,
      downloadedAt: new Date().toISOString(),
    };

    // Save metadata to public directory
    const metadataPath = path.join(
      process.cwd(),
      "public",
      "section-images-metadata.json"
    );
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

    console.log("\n🎉 Download Summary:");
    console.log(`✅ Hop on Hop off images: ${hopOnHopOffImages.length}`);
    console.log(`💾 Metadata saved to: section-images-metadata.json`);

    return metadata;
  } catch (error) {
    console.error("❌ Error downloading section images:", error);
    return null;
  }
}

// Run the script
if (require.main === module) {
  downloadAllSectionImages()
    .then((metadata) => {
      if (metadata) {
        console.log(`\n✨ All section images downloaded successfully!`);
        console.log("\n📁 Files saved to:");
        console.log("   • /public/hop-on-hop-off/ (4 images)");
        console.log("   • /public/section-images-metadata.json (metadata)");
      }
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Script failed:", error);
      process.exit(1);
    });
}

module.exports = { downloadAllSectionImages };
