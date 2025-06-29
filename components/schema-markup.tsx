import Script from "next/script";

interface OrganizationSchemaProps {
  name?: string;
  url?: string;
  logo?: string;
  description?: string;
}

export function OrganizationSchema({
  name = "Pineapple Tours",
  url = "https://pineappletours.com",
  logo = "https://pineappletours.com/pineapple-tour-logo.png",
  description = "Queensland's premier tour company specializing in wine tours, brewery tours, and day trips in Gold Coast, Brisbane & Scenic Rim.",
}: OrganizationSchemaProps) {
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: name,
    url: url,
    logo: logo,
    description: description,
    address: {
      "@type": "PostalAddress",
      addressCountry: "AU",
      addressRegion: "Queensland",
    },
    areaServed: [
      {
        "@type": "City",
        name: "Gold Coast",
      },
      {
        "@type": "City",
        name: "Brisbane",
      },
      {
        "@type": "Place",
        name: "Scenic Rim",
      },
    ],
    serviceType: [
      "Wine Tours",
      "Brewery Tours",
      "Day Tours",
      "Private Tours",
      "Hop-on Hop-off Tours",
    ],
  };

  return (
    <Script
      id="organization-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(organizationData),
      }}
    />
  );
}

interface TourProductSchemaProps {
  name: string;
  description: string;
  image: string;
  price: number;
  currency?: string;
  duration?: string;
  location?: string;
}

export function TourProductSchema({
  name,
  description,
  image,
  price,
  currency = "AUD",
  duration,
  location,
}: TourProductSchemaProps) {
  const tourData = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: name,
    description: description,
    image: image,
    offers: {
      "@type": "Offer",
      price: price,
      priceCurrency: currency,
      availability: "https://schema.org/InStock",
      validFrom: new Date().toISOString(),
    },
    provider: {
      "@type": "TravelAgency",
      name: "Pineapple Tours",
      url: "https://pineappletours.com",
    },
    ...(duration && { duration: duration }),
    ...(location && { location: { "@type": "Place", name: location } }),
  };

  return (
    <Script
      id="tour-product-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(tourData),
      }}
    />
  );
}

interface BreadcrumbSchemaProps {
  items: Array<{
    name: string;
    url: string;
  }>;
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <Script
      id="breadcrumb-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(breadcrumbData),
      }}
    />
  );
}
