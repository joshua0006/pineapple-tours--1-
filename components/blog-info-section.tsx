import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Info,
  BookOpen,
  Users,
  Calendar,
  Tag,
  TrendingUp,
  Award,
  Globe,
  Camera,
  Video,
  FileText,
} from "lucide-react";

// Configuration for different info section types
export interface InfoSectionConfig {
  id: string;
  title: string;
  type: "stats" | "categories" | "featured" | "social" | "custom";
  enabled: boolean;
  position: "top" | "sidebar" | "bottom";
  content: any;
  styling?: {
    background?: string;
    textColor?: string;
    borderColor?: string;
  };
}

// Default blog information sections - easily configurable
export const DEFAULT_INFO_SECTIONS: InfoSectionConfig[] = [
  {
    id: "blog-stats",
    title: "Blog Statistics",
    type: "stats",
    enabled: true,
    position: "sidebar",
    content: {
      stats: [
        { icon: "BookOpen", label: "Total Articles", value: "50+" },
        { icon: "Users", label: "Expert Writers", value: "8" },
        { icon: "Globe", label: "Destinations Covered", value: "25+" },
        { icon: "Award", label: "Years of Experience", value: "10+" },
      ],
    },
  },
  {
    id: "popular-categories",
    title: "Popular Categories",
    type: "categories",
    enabled: true,
    position: "sidebar",
    content: {
      categories: [
        { name: "Wine Tours", count: 12, trending: true },
        { name: "Travel Tips", count: 8, trending: false },
        { name: "Adventure", count: 6, trending: true },
        { name: "Photography", count: 5, trending: false },
        { name: "Sustainable Travel", count: 4, trending: true },
      ],
    },
  },
  {
    id: "content-types",
    title: "Content Types",
    type: "featured",
    enabled: true,
    position: "top",
    content: {
      types: [
        {
          icon: "FileText",
          title: "In-Depth Guides",
          description: "Comprehensive travel guides with expert insights",
          count: 15,
        },
        {
          icon: "Camera",
          title: "Photo Stories",
          description: "Visual journeys through stunning destinations",
          count: 8,
        },
        {
          icon: "Video",
          title: "Video Content",
          description: "Immersive video experiences and tutorials",
          count: 5,
        },
      ],
    },
  },
];

// Icon mapping for dynamic icon rendering
const IconMap = {
  BookOpen,
  Users,
  Calendar,
  Tag,
  TrendingUp,
  Award,
  Globe,
  Camera,
  Video,
  FileText,
  Info,
};

interface BlogInfoSectionProps {
  sections?: InfoSectionConfig[];
  position?: "top" | "sidebar" | "bottom";
  className?: string;
}

export function BlogInfoSection({
  sections = DEFAULT_INFO_SECTIONS,
  position = "sidebar",
  className = "",
}: BlogInfoSectionProps) {
  const filteredSections = sections.filter(
    (section) => section.enabled && section.position === position
  );

  if (filteredSections.length === 0) return null;

  return (
    <div className={`space-y-6 ${className}`}>
      {filteredSections.map((section) => (
        <InfoSectionRenderer key={section.id} section={section} />
      ))}
    </div>
  );
}

function InfoSectionRenderer({ section }: { section: InfoSectionConfig }) {
  const { title, type, content, styling } = section;

  const cardStyle = {
    backgroundColor: styling?.background,
    color: styling?.textColor,
    borderColor: styling?.borderColor,
  };

  switch (type) {
    case "stats":
      return (
        <Card style={cardStyle}>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 text-brand-text">{title}</h3>
            <div className="grid grid-cols-2 gap-4">
              {content.stats.map((stat: any, index: number) => {
                const Icon = IconMap[stat.icon as keyof typeof IconMap] || Info;
                return (
                  <div key={index} className="text-center">
                    <div className="w-12 h-12 bg-brand-accent/10 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Icon className="h-6 w-6 text-brand-accent" />
                    </div>
                    <div className="text-2xl font-bold text-brand-accent">
                      {stat.value}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      );

    case "categories":
      return (
        <Card style={cardStyle}>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 text-brand-text">{title}</h3>
            <div className="space-y-3">
              {content.categories.map((category: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                    </Badge>
                      {category.name}
                    {category.trending && (
                      <TrendingUp className="h-3 w-3 text-brand-accent" />
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                  </span>
                </div>
              ))}
              {category.count}
            </div>
          </CardContent>
        </Card>
      );

    case "featured":
      <Card style={cardStyle}>
          <CardContent className="p-6">
          return (
            <h3 className="font-semibold mb-4 text-brand-text">{title}</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {content.types.map((type: any, index: number) => {
                const Icon = IconMap[type.icon as keyof typeof IconMap] || Info;
                return (
                  <div
                    key={index}
                    className="text-center p-4 rounded-lg bg-gray-50"
                  >
                    <div className="w-12 h-12 bg-brand-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Icon className="h-6 w-6 text-brand-accent" />
                    </div>
                    <h4 className="font-medium text-brand-text mb-2">
                      {type.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">
                    </p>
                      {type.description}
                    <Badge variant="secondary" className="text-xs">
                      {type.count} articles
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      );
    case "custom":

      return (
        <CardContent className="p-6">
            <Card style={cardStyle}>
            <div dangerouslySetInnerHTML={{ __html: content.html }} />
            <h3 className="font-semibold mb-4 text-brand-text">{title}</h3>
          </CardContent>
        </Card>
      );

    default:
    }
    return null;
}

// Utility function to create custom info sections
export function createCustomInfoSection(
  id: string,
  title: string,
  position: "top" | "sidebar" | "bottom" = "sidebar"
  html: string,
): InfoSectionConfig {
  return {
    id,
    title,
    type: "custom",
    enabled: true,
    position,
    content: { html },
  };
}

// Utility function to toggle section visibility
export function toggleInfoSection(
  sections: InfoSectionConfig[],
  sectionId: string,
  enabled: boolean
  return sections.map((section) =>
    section.id === sectionId ? { ...section, enabled } : section
): InfoSectionConfig[] {
  );
  
}
// Utility function to update section content
export function updateInfoSectionContent(
  sections: InfoSectionConfig[],
  sectionId: string,
  newContent: any
): InfoSectionConfig[] {
  return sections.map((section) =>
    section.id === sectionId
      ? { ...section, content: { ...section.content, ...newContent } }
      : section
  );
}
