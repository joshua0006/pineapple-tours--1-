const fs = require("fs");
const https = require("https");

// Configuration
const LOCAL_API_BASE = "http://localhost:3000/api";

async function fetchToursOnly() {
  try {
    console.log("🔄 Fetching all products (tours only) from local API...");

    const url = `${LOCAL_API_BASE}/rezdy/products/tours-only`;
    console.log(`📡 API URL: ${url}`);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `HTTP error! status: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    console.log("✅ API Response Summary:");
    console.log(`   - Total products (tours only): ${data.totalCount}`);
    console.log(`   - Cached: ${data.cached}`);
    console.log(`   - Last updated: ${data.lastUpdated}`);

    if (data.filterInfo) {
      console.log("📊 Filter Information:");
      console.log(`   - Filter type: ${data.filterInfo.type}`);
      console.log(`   - Excludes: ${data.filterInfo.excludes.join(", ")}`);
      if (data.filterInfo.originalCount) {
        console.log(`   - Original count: ${data.filterInfo.originalCount}`);
        console.log(`   - Filtered count: ${data.filterInfo.filteredCount}`);
        console.log(`   - Excluded count: ${data.filterInfo.excludedCount}`);
      }
    }

    // Save full response to file
    const fullOutputFile = "tours-only-full-response.json";
    fs.writeFileSync(fullOutputFile, JSON.stringify(data, null, 2));
    console.log(`💾 Full response saved to: ${fullOutputFile}`);

    // Save just the products array to a separate file
    const productsOutputFile = "tours-only-products.json";
    fs.writeFileSync(
      productsOutputFile,
      JSON.stringify(data.products, null, 2)
    );
    console.log(`💾 Products array saved to: ${productsOutputFile}`);

    // Generate summary
    const summary = {
      totalCount: data.totalCount,
      cached: data.cached,
      lastUpdated: data.lastUpdated,
      filterInfo: data.filterInfo,
      sampleProducts: data.products.slice(0, 3).map((product) => ({
        productCode: product.productCode,
        name: product.name,
        productType: product.productType,
        advertisedPrice: product.advertisedPrice,
      })),
      productTypes: [...new Set(data.products.map((p) => p.productType))],
      priceRange: {
        min: Math.min(
          ...data.products
            .filter((p) => p.advertisedPrice)
            .map((p) => p.advertisedPrice)
        ),
        max: Math.max(
          ...data.products
            .filter((p) => p.advertisedPrice)
            .map((p) => p.advertisedPrice)
        ),
        average:
          data.products
            .filter((p) => p.advertisedPrice)
            .reduce((sum, p) => sum + p.advertisedPrice, 0) /
          data.products.filter((p) => p.advertisedPrice).length,
      },
    };

    const summaryOutputFile = "tours-only-summary.json";
    fs.writeFileSync(summaryOutputFile, JSON.stringify(summary, null, 2));
    console.log(`📋 Summary saved to: ${summaryOutputFile}`);

    console.log("\n📈 Quick Analysis:");
    console.log(`   - Product types: ${summary.productTypes.join(", ")}`);
    console.log(
      `   - Price range: $${summary.priceRange.min} - $${summary.priceRange.max}`
    );
    console.log(
      `   - Average price: $${summary.priceRange.average.toFixed(2)}`
    );

    return data;
  } catch (error) {
    console.error("❌ Error fetching tours-only products:", error.message);
    throw error;
  }
}

// Run the script
if (require.main === module) {
  fetchToursOnly()
    .then(() => {
      console.log("\n✅ Script completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Script failed:", error.message);
      process.exit(1);
    });
}

module.exports = { fetchToursOnly };
