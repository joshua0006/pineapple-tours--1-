import { NextResponse } from "next/server";

// Static routes that should be included in sitemap
const staticRoutes = [
  "",
  "about",
  "tours",
  "private-tours",
  "hop-on-hop-off",
  "blog",
  "contact",
  "faq",
  "custom-tours",
  "work-with-us",
  "sustainable-tourism",
  "privacy-policy",
  "terms-and-conditions",
  "refund-and-exchange-policy",
  "accessibility",
  "companion-card",
  "allergies-and-dietary-requirements",
  "queensland-weather-info",
  "feedback",
];

// Category routes
const categoryRoutes = [
  "tours/category/winery-tours",
  "tours/category/brewery-tours",
  "tours/category/day-tours",
  "tours/category/corporate-tours",
  "tours/category/hens-party",
  "tours/category/bus-charter",
  "tours/category/barefoot-luxury",
];

export async function GET() {
  const baseUrl = "https://pineappletours.com";
  const currentDate = new Date().toISOString();

  // Generate XML for static routes
  const staticUrls = staticRoutes
    .map(
      (route) => `
    <url>
      <loc>${baseUrl}/${route}</loc>
      <lastmod>${currentDate}</lastmod>
      <changefreq>${route === "" ? "daily" : "weekly"}</changefreq>
      <priority>${route === "" ? "1.0" : "0.8"}</priority>
    </url>`
    )
    .join("");

  // Generate XML for category routes
  const categoryUrls = categoryRoutes
    .map(
      (route) => `
    <url>
      <loc>${baseUrl}/${route}</loc>
      <lastmod>${currentDate}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.7</priority>
    </url>`
    )
    .join("");

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticUrls}
  ${categoryUrls}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
