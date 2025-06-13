"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import {
  MapPin,
  Clock,
  Users,
  Zap,
  ArrowRight,
  CheckCircle,
  Star,
  Bus,
  Calendar,
  DollarSign,
  Filter,
  X,
  Sparkles,
  Heart,
  Shield,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useRezdyProducts } from "@/hooks/use-rezdy";
import { RezdyProduct } from "@/lib/types/rezdy";
import { getPrimaryImageUrl } from "@/lib/utils/product-utils";

interface CustomTourModule {
  id: string;
  name: string;
  description: string;
  icon: any;
  basePrice: number;
  duration: string;
  highlights: string[];
  category: "transport" | "experience" | "activity" | "cultural";
  image: string;
}

const CUSTOM_MODULES: CustomTourModule[] = [
  {
    id: "hop-on-hop-off",
    name: "Hop-On Hop-Off Transport",
    description:
      "Unlimited day pass with flexible transport between destinations",
    icon: Bus,
    basePrice: 99,
    duration: "Full Day",
    category: "transport",
    image: "/hop-on-hop-off/hop-on-hop-off-bus-1.jpg",
    highlights: [
      "Unlimited stops",
      "Flexible timing",
      "Multiple routes",
      "All-day access",
    ],
  },
  {
    id: "winery-experience",
    name: "Winery & Distillery",
    description: "Self-guided tastings at premium wineries and distilleries",
    icon: Star,
    basePrice: 99,
    duration: "3-4 hours",
    category: "experience",
    image: "/cea291bc40ef4c8a8ac060ed77c6fd3cLuxury_Wine_Tour_lg.avif",
    highlights: [
      "Multiple venues",
      "Guided tastings",
      "Local produce",
      "Flexible schedule",
    ],
  },
  {
    id: "adventure-activities",
    name: "Adventure Activities",
    description: "Mix and match outdoor experiences and attractions",
    icon: Zap,
    basePrice: 159,
    duration: "2-6 hours",
    category: "activity",
    image: "/hop-on-hop-off/hop-on-hop-off-views-4.jpg",
    highlights: [
      "Rainforest walks",
      "Wildlife encounters",
      "Scenic viewpoints",
      "Photo opportunities",
    ],
  },
  {
    id: "cultural-experiences",
    name: "Cultural Experiences",
    description: "Aboriginal cultural centers and local heritage sites",
    icon: MapPin,
    basePrice: 138,
    duration: "2-3 hours",
    category: "cultural",
    image: "/hop-on-hop-off/hop-on-hop-off-landmarks-2.jpg",
    highlights: [
      "Cultural learning",
      "Traditional experiences",
      "Local guides",
      "Authentic stories",
    ],
  },
];

interface RegionConfig {
  id: string;
  name: string;
  description: string;
  baseTransportPrice: number;
  availableModules: string[];
  image: string;
  popularCombos: {
    name: string;
    modules: string[];
    totalPrice: number;
    savings: number;
  }[];
}

const REGIONS: RegionConfig[] = [
  {
    id: "tamborine-mountain",
    name: "Tamborine Mountain",
    description:
      "Explore wineries, rainforest walks, and scenic attractions at your own pace",
    baseTransportPrice: 99,
    image: "/private-tours/tamborine-mountain.avif",
    availableModules: [
      "hop-on-hop-off",
      "winery-experience",
      "adventure-activities",
    ],
    popularCombos: [
      {
        name: "Wine & Dine Explorer",
        modules: ["hop-on-hop-off", "winery-experience"],
        totalPrice: 165,
        savings: 33,
      },
      {
        name: "Complete Adventure",
        modules: [
          "hop-on-hop-off",
          "winery-experience",
          "adventure-activities",
        ],
        totalPrice: 299,
        savings: 58,
      },
    ],
  },
  {
    id: "gold-coast-hinterland",
    name: "Gold Coast Hinterland",
    description:
      "Discover hidden gems and natural wonders with flexible transport",
    baseTransportPrice: 99,
    image: "/private-tours/gold-coast.avif",
    availableModules: [
      "hop-on-hop-off",
      "adventure-activities",
      "cultural-experiences",
    ],
    popularCombos: [
      {
        name: "Nature & Culture",
        modules: ["hop-on-hop-off", "cultural-experiences"],
        totalPrice: 199,
        savings: 38,
      },
      {
        name: "Adventure Seeker",
        modules: ["hop-on-hop-off", "adventure-activities"],
        totalPrice: 219,
        savings: 39,
      },
    ],
  },
  {
    id: "northern-nsw",
    name: "Northern NSW",
    description:
      "Byron Bay, Nimbin, and coastal attractions with unlimited access",
    baseTransportPrice: 99,
    image: "/scenic-rim-landscape.jpg",
    availableModules: [
      "hop-on-hop-off",
      "cultural-experiences",
      "adventure-activities",
    ],
    popularCombos: [
      {
        name: "Coastal Explorer",
        modules: ["hop-on-hop-off", "adventure-activities"],
        totalPrice: 219,
        savings: 39,
      },
      {
        name: "Cultural Journey",
        modules: ["hop-on-hop-off", "cultural-experiences"],
        totalPrice: 199,
        savings: 38,
      },
    ],
  },
];

interface CustomToursExplorerProps {
  className?: string;
}

export function CustomToursExplorer({ className }: CustomToursExplorerProps) {
  const [activeRegion, setActiveRegion] = useState("tamborine-mountain");
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Fetch custom tour products
  const { data: products, loading, error } = useRezdyProducts(1000, 0);

  const customTourProducts = useMemo(() => {
    if (!products) return [];
    return products.filter((product) => {
      return product.productType === "CUSTOM" && product.status === "ACTIVE";
    });
  }, [products]);

  const currentRegion = REGIONS.find((r) => r.id === activeRegion);

  const filteredModules = useMemo(() => {
    let modules = CUSTOM_MODULES.filter((module) =>
      currentRegion?.availableModules.includes(module.id)
    );

    if (categoryFilter !== "all") {
      modules = modules.filter((module) => module.category === categoryFilter);
    }

    return modules;
  }, [currentRegion, categoryFilter]);

  const calculateTotal = () => {
    const moduleTotal = selectedModules.reduce((total, moduleId) => {
      const module = CUSTOM_MODULES.find((m) => m.id === moduleId);
      return total + (module?.basePrice || 0);
    }, 0);
    return moduleTotal;
  };

  const toggleModule = (moduleId: string) => {
    setSelectedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const clearSelection = () => {
    setSelectedModules([]);
  };

  const selectCombo = (modules: string[]) => {
    setSelectedModules(modules);
  };

  if (loading) {
    return (
      <section className={`py-16 bg-gray-50 ${className}`}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-8 w-64 mx-auto mb-4" />
            <Skeleton className="h-20 w-full max-w-4xl mx-auto" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`py-16 bg-gray-50 ${className}`}>
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Build Your Perfect Day Out
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Mix and match experiences with our flexible day-pass system.
            Unlimited transport, self-guided exploration, and the freedom to
            create your own adventure.
          </p>
        </div>

        {/* Main Content - 2 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Filters & Selection */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Region Selection */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-brand-accent" />
                  Select Region
                </h3>
                <Select value={activeRegion} onValueChange={setActiveRegion}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REGIONS.map((region) => (
                      <SelectItem key={region.id} value={region.id}>
                        {region.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Category Filter */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Filter className="h-5 w-5 text-brand-accent" />
                  Filter by Type
                </h3>
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="transport">Transport</SelectItem>
                    <SelectItem value="experience">Experiences</SelectItem>
                    <SelectItem value="activity">Activities</SelectItem>
                    <SelectItem value="cultural">Cultural</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Selected Modules Summary */}
              {selectedModules.length > 0 && (
                <Card className="border-brand-accent/20 bg-brand-accent/5">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-brand-accent" />
                        Your Selection
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearSelection}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        Clear all
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedModules.map((moduleId) => {
                      const module = CUSTOM_MODULES.find(
                        (m) => m.id === moduleId
                      );
                      return module ? (
                        <div
                          key={moduleId}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="font-medium">{module.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-brand-accent">
                              ${module.basePrice}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleModule(moduleId)}
                              className="h-6 w-6 p-0 hover:bg-red-100"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ) : null;
                    })}
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Total:</span>
                        <span className="text-2xl font-bold text-brand-accent">
                          ${calculateTotal()}
                        </span>
                      </div>
                      <Button className="w-full mt-3 bg-brand-accent hover:bg-brand-accent/90">
                        Book Now
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Popular Combos */}
              {currentRegion && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Star className="h-5 w-5 text-brand-accent" />
                    Popular Combos
                  </h3>
                  <div className="space-y-3">
                    {currentRegion.popularCombos.map((combo, index) => (
                      <Card
                        key={index}
                        className="cursor-pointer hover:shadow-md transition-shadow border-gray-200"
                        onClick={() => selectCombo(combo.modules)}
                      >
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-sm">
                                {combo.name}
                              </h4>
                              <Badge variant="secondary" className="text-xs">
                                Save ${combo.savings}
                              </Badge>
                            </div>
                            <div className="text-lg font-bold text-brand-accent">
                              ${combo.totalPrice}
                            </div>
                            <div className="text-xs text-gray-500">
                              {combo.modules.length} experiences included
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Content Area */}
          <div className="lg:col-span-3">
            {/* Region Description with Image */}
            {currentRegion && (
              <Card className="mb-8 border-0 shadow-sm overflow-hidden">
                <div className="relative h-48 w-full">
                  <Image
                    src={currentRegion.image}
                    alt={currentRegion.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 60vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-6 text-white">
                    <h3 className="text-2xl font-bold mb-2">
                      {currentRegion.name}
                    </h3>
                    <Badge
                      variant="secondary"
                      className="bg-white/20 text-white border-white/30"
                    >
                      Base Transport: ${currentRegion.baseTransportPrice}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-6">
                  <p className="text-gray-600">{currentRegion.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Available Modules */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">
                  Available Experiences
                </h3>
                <div className="text-sm text-gray-500">
                  {filteredModules.length}{" "}
                  {filteredModules.length === 1 ? "option" : "options"}{" "}
                  available
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filteredModules.map((module) => {
                  const isSelected = selectedModules.includes(module.id);
                  const IconComponent = module.icon;

                  return (
                    <Card
                      key={module.id}
                      className={`cursor-pointer transition-all duration-300 group overflow-hidden ${
                        isSelected
                          ? "ring-2 ring-brand-accent shadow-lg border-brand-accent/20"
                          : "hover:shadow-lg border-gray-200"
                      }`}
                      onClick={() => toggleModule(module.id)}
                    >
                      <div className="relative h-48 w-full">
                        <Image
                          src={module.image}
                          alt={module.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute top-3 right-3">
                          {isSelected && (
                            <div className="w-8 h-8 bg-brand-accent rounded-full flex items-center justify-center">
                              <CheckCircle className="h-5 w-5 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="absolute bottom-3 left-3">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              isSelected
                                ? "bg-brand-accent text-white"
                                : "bg-white/90 text-gray-700"
                            }`}
                          >
                            <IconComponent className="h-5 w-5" />
                          </div>
                        </div>
                      </div>

                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg group-hover:text-brand-accent transition-colors">
                          {module.name}
                        </CardTitle>
                        <CardDescription>{module.description}</CardDescription>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-brand-accent">
                            ${module.basePrice}
                          </span>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock className="h-4 w-4" />
                            {module.duration}
                          </div>
                        </div>

                        <div className="space-y-2">
                          {module.highlights.map((highlight, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 text-sm text-gray-600"
                            >
                              <CheckCircle className="h-3 w-3 text-brand-accent flex-shrink-0" />
                              {highlight}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Available Products */}
            {customTourProducts.length > 0 && (
              <div className="space-y-6 mt-12">
                <h3 className="text-2xl font-bold text-gray-900">
                  Pre-Built Custom Experiences
                </h3>

                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {customTourProducts.slice(0, 6).map((product) => {
                    const primaryImageUrl = getPrimaryImageUrl(product);

                    return (
                      <Card
                        key={product.productCode}
                        className="hover:shadow-lg transition-all duration-300 group border-gray-200 overflow-hidden"
                      >
                        <div className="relative h-48 w-full">
                          <Image
                            src={primaryImageUrl}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          <div className="absolute top-3 right-3">
                            <Badge
                              variant="secondary"
                              className="bg-purple-100 text-purple-800"
                            >
                              Custom Experience
                            </Badge>
                          </div>
                          {product.advertisedPrice && (
                            <div className="absolute bottom-3 right-3">
                              <div className="bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1">
                                <span className="text-lg font-bold text-brand-accent">
                                  ${product.advertisedPrice}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg line-clamp-2 group-hover:text-brand-accent transition-colors">
                            {product.name}
                          </CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-4">
                          {product.shortDescription && (
                            <p className="text-gray-600 text-sm line-clamp-3">
                              {product.shortDescription}
                            </p>
                          )}

                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            {product.quantityRequiredMin &&
                              product.quantityRequiredMax && (
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  <span>
                                    {product.quantityRequiredMin}-
                                    {product.quantityRequiredMax} guests
                                  </span>
                                </div>
                              )}
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>Flexible dates</span>
                            </div>
                          </div>

                          <Button className="w-full bg-brand-accent hover:bg-brand-accent/90 text-white">
                            View Details
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Benefits Section */}
        <Card className="mt-16 border-0 shadow-lg bg-gradient-to-r from-brand-primary to-brand-accent text-white">
          <CardContent className="text-center py-12">
            <h3 className="text-3xl font-bold mb-6">
              Why Choose Custom Self-Guided Tours?
            </h3>
            <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
              <div className="space-y-3">
                <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center">
                  <DollarSign className="h-8 w-8 text-yellow-300" />
                </div>
                <h4 className="text-xl font-semibold">Day-Pass Pricing</h4>
                <p className="text-white/90">
                  One price for unlimited access. No hidden fees, no per-stop
                  charges.
                </p>
              </div>
              <div className="space-y-3">
                <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center">
                  <Clock className="h-8 w-8 text-yellow-300" />
                </div>
                <h4 className="text-xl font-semibold">Complete Flexibility</h4>
                <p className="text-white/90">
                  Start when you want, stay as long as you like, explore at your
                  own pace.
                </p>
              </div>
              <div className="space-y-3">
                <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-yellow-300" />
                </div>
                <h4 className="text-xl font-semibold">Modular Experiences</h4>
                <p className="text-white/90">
                  Mix and match activities to create your perfect adventure.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
