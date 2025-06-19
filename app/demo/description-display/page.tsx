"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DescriptionDisplay } from "@/components/ui/description-display";
import { TourInfoTable } from "@/components/ui/tour-info-table";
import { HtmlContent } from "@/components/ui/html-content";
import { MapPin, Users, Calendar, Star } from "lucide-react";

export default function DescriptionDisplayDemo() {
  // Sample HTML content
  const htmlDescription = `
    <h3>Experience the Ultimate Adventure</h3>
    <p>Join us for an <strong>unforgettable journey</strong> through some of the most breathtaking landscapes on Earth. Our expert guides will take you on a <em>carefully curated adventure</em> that combines:</p>
    <ul>
      <li>Stunning natural scenery and wildlife viewing</li>
      <li>Cultural immersion with local communities</li>
      <li>Professional photography opportunities</li>
      <li>Sustainable tourism practices</li>
    </ul>
    <p>This tour is perfect for <strong>adventure seekers</strong> and <strong>nature lovers</strong> alike. Whether you're an experienced traveler or embarking on your first major adventure, our team ensures a safe and memorable experience.</p>
    <blockquote>
      "This was the trip of a lifetime! The guides were knowledgeable and the scenery was absolutely breathtaking." - Previous Guest
    </blockquote>
    <p>Book now and create memories that will last forever!</p>
  `;

  const plainTextDescription = `
    Discover the hidden gems of our beautiful region on this comprehensive full-day tour. 
    We'll visit ancient landmarks, sample local cuisine, and learn about the rich cultural heritage 
    that makes this tour so special. Our small group sizes ensure personalized attention 
    and the flexibility to adapt the itinerary based on your interests and the day's conditions.
    
    This tour includes transportation, professional guide services, entrance fees to all attractions, 
    and a traditional lunch at a local restaurant. We provide all necessary equipment and safety gear, 
    so you can focus on enjoying the experience.
  `;

  const shortDescription = "A brief overview of this amazing tour experience.";

  // Sample tour info items
  const tourInfoItems = [
    {
      label: "Duration",
      value: "8 hours",
      icon: <Calendar className="h-4 w-4" />,
      type: "text" as const,
    },
    {
      label: "Group Size",
      value: "4-12 people",
      icon: <Users className="h-4 w-4" />,
      type: "text" as const,
    },
    {
      label: "Location",
      value: "Scenic Mountain Region",
      icon: <MapPin className="h-4 w-4" />,
      type: "text" as const,
    },
    {
      label: "Rating",
      value: "4.9/5",
      icon: <Star className="h-4 w-4" />,
      type: "badge" as const,
      highlight: true,
    },
    {
      label: "Price",
      value: "$299",
      type: "price" as const,
      highlight: true,
    },
    {
      label: "Status",
      value: "ACTIVE",
      type: "status" as const,
    },
  ];

  return (
    <div>
      <div className="container py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">
            Description Display Components Demo
          </h1>
          <p className="text-lg text-muted-foreground">
            Showcasing enhanced description display with HTML content support,
            accessibility features, and responsive design.
          </p>
        </div>

        <div className="space-y-12">
          {/* HTML Content Display */}
          <section>
            <h2 className="text-2xl font-bold mb-6">HTML Content Display</h2>
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>With Expansion (HTML Content)</CardTitle>
                </CardHeader>
                <CardContent>
                  <DescriptionDisplay
                    title="Adventure Tour Description"
                    description={htmlDescription}
                    maxLength={300}
                    allowExpansion={true}
                    showCard={false}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Direct HTML Rendering</CardTitle>
                </CardHeader>
                <CardContent>
                  <HtmlContent
                    content={htmlDescription}
                    maxLength={200}
                    className="text-sm"
                  />
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Plain Text Display */}
          <section>
            <h2 className="text-2xl font-bold mb-6">
              Plain Text Content Display
            </h2>
            <div className="grid gap-6 lg:grid-cols-2">
              <DescriptionDisplay
                title="Cultural Heritage Tour"
                description={plainTextDescription}
                maxLength={200}
                allowExpansion={true}
                showCard={true}
              />

              <DescriptionDisplay
                title="Short Description Example"
                description={shortDescription}
                showCard={true}
              />
            </div>
          </section>

          {/* Combined Description Types */}
          <section>
            <h2 className="text-2xl font-bold mb-6">
              Combined Description Types
            </h2>
            <DescriptionDisplay
              title="Tour with Both Descriptions"
              description={htmlDescription}
              shortDescription="Quick summary: An amazing adventure tour with stunning views and cultural experiences."
              maxLength={400}
              allowExpansion={true}
              showCard={true}
            />
          </section>

          {/* Tour Information Table */}
          <section>
            <h2 className="text-2xl font-bold mb-6">
              Tour Information Display
            </h2>
            <div className="grid gap-6 lg:grid-cols-2">
              <TourInfoTable
                title="Tour Details (2 Columns)"
                items={tourInfoItems}
                columns={2}
                showCard={true}
              />

              <TourInfoTable
                title="Tour Details (1 Column)"
                items={tourInfoItems.slice(0, 4)}
                columns={1}
                showCard={true}
              />
            </div>
          </section>

          {/* No Content State */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Empty State Display</h2>
            <div className="max-w-md">
              <DescriptionDisplay
                title="No Description Available"
                description=""
                showCard={true}
              />
            </div>
          </section>

          {/* Accessibility Features */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Accessibility Features</h2>
            <Card>
              <CardHeader>
                <CardTitle>Accessibility Highlights</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>
                    • <strong>ARIA labels:</strong> Proper labeling for screen
                    readers
                  </li>
                  <li>
                    • <strong>Semantic HTML:</strong> Correct heading hierarchy
                    and structure
                  </li>
                  <li>
                    • <strong>Keyboard navigation:</strong> All interactive
                    elements are keyboard accessible
                  </li>
                  <li>
                    • <strong>Focus management:</strong> Clear focus indicators
                    and logical tab order
                  </li>
                  <li>
                    • <strong>Content sanitization:</strong> Safe HTML rendering
                    with DOMPurify
                  </li>
                  <li>
                    • <strong>Responsive design:</strong> Optimized for all
                    screen sizes
                  </li>
                  <li>
                    • <strong>High contrast:</strong> Sufficient color contrast
                    ratios
                  </li>
                  <li>
                    • <strong>Text scaling:</strong> Content remains readable
                    when text is enlarged
                  </li>
                </ul>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
