import { Metadata } from "next";
import { RezdyProduct } from "@/lib/types/rezdy";

export function generateTourMetadata(product: RezdyProduct): Metadata {
  const title = `${product.name} - Queensland Wine Tours | Pineapple Tours`;
  const description =
    product.shortDescription ||
    `Experience ${product.name} with Pineapple Tours. Premium wine tours and experiences in Queensland. Book online today!`;

  return {
    title,
    description,
    keywords: [
      product.name.toLowerCase(),
      "wine tour",
      "queensland tours",
      "gold coast tours",
      "brisbane tours",
      "scenic rim tours",
    ],
    openGraph: {
      title,
      description,
      type: "website",
      images: product.images?.length
        ? [
            {
              url: product.images[0].largeSizeUrl || product.images[0].itemUrl,
              width: 1200,
              height: 630,
              alt: `${product.name} - Pineapple Tours`,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: product.images?.length
        ? [product.images[0].largeSizeUrl || product.images[0].itemUrl]
        : undefined,
    },
  };
}

export function generateBlogMetadata(
  title: string,
  excerpt: string,
  slug: string,
  featuredImage?: string
): Metadata {
  const metaTitle = `${title} | Pineapple Tours Blog`;
  const metaDescription =
    excerpt ||
    `Read about ${title} on the Pineapple Tours blog. Discover Queensland wine tours, travel tips, and local insights.`;

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: [
      "queensland travel",
      "wine tours",
      "travel blog",
      "gold coast",
      "brisbane",
      "scenic rim",
    ],
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      type: "article",
      url: `https://pineappletours.com/blog/${slug}`,
      images: featuredImage
        ? [
            {
              url: featuredImage,
              width: 1200,
              height: 630,
              alt: title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: metaDescription,
      images: featuredImage ? [featuredImage] : undefined,
    },
  };
}

export function generateCategoryMetadata(categorySlug: string): Metadata {
  const categoryNames: Record<string, string> = {
    "winery-tours": "Winery Tours",
    "brewery-tours": "Brewery Tours",
    "day-tours": "Day Tours",
    "corporate-tours": "Corporate Tours",
    "hens-party": "Hens Party Tours",
    "bus-charter": "Bus Charter",
    "barefoot-luxury": "Barefoot Luxury Tours",
  };

  const categoryName = categoryNames[categorySlug] || "Tours";
  const title = `${categoryName} - Queensland Wine & Brewery Tours | Pineapple Tours`;
  const description = `Discover our ${categoryName.toLowerCase()} in Queensland. Premium wine tours, brewery experiences, and day trips in Gold Coast, Brisbane & Scenic Rim.`;

  return {
    title,
    description,
    keywords: [
      categorySlug.replace("-", " "),
      "queensland tours",
      "wine tours",
      "brewery tours",
      "gold coast",
      "brisbane",
      "scenic rim",
    ],
    openGraph: {
      title,
      description,
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}
