"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import {
  MapPin,
  Clock,
  Users,
  DollarSign,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Star,
  Bus,
  Calendar,
  Info,
  Sparkles,
  Heart,
  ChevronRight,
  Plus,
  Minus,
  Loader2,
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
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

import {
  useCustomTourProducts,
  DynamicRegion,
  DynamicExperience,
} from "@/hooks/use-custom-tour-products";
import { PricingCalculatorService } from "@/lib/services/pricing-calculator";
import { RezdyProduct } from "@/lib/types/rezdy";
import { getPrimaryImageUrl } from "@/lib/utils/product-utils";

// Step definitions
type BuilderStep = "region" | "experiences" | "customize" | "summary";

interface CustomTourSelection {
  region: DynamicRegion | null;
  experiences: DynamicExperience[];
  participants: number;
  date: string;
  specialRequests: string;
}

// Static data removed - now using dynamic Rezdy data

interface InteractiveCustomTourBuilderProps {
  className?: string;
}

export function InteractiveCustomTourBuilder({
  className,
}: InteractiveCustomTourBuilderProps) {
  const [currentStep, setCurrentStep] = useState<BuilderStep>("region");
  const [selection, setSelection] = useState<CustomTourSelection>({
    region: null,
    experiences: [],
    participants: 2,
    date: "",
    specialRequests: "",
  });

  // Fetch dynamic Rezdy products and regions
  const {
    availableRegions: dynamicRegions,
    availableExperiences,
    customProducts,
    loading,
    error,
    getExperiencesForRegion,
  } = useCustomTourProducts();

  // Debug logging
  console.log(
    "✅ Custom Tour Builder: Displaying",
    dynamicRegions.length,
    "regions from Rezdy data"
  );

  const steps: { id: BuilderStep; title: string; description: string }[] = [
    {
      id: "region",
      title: "Choose Region",
      description: "Select your destination",
    },
    {
      id: "experiences",
      title: "Add Experiences",
      description: "Pick your activities",
    },
    {
      id: "customize",
      title: "Customize",
      description: "Personalize your tour",
    },
    {
      id: "summary",
      title: "Review & Book",
      description: "Confirm your selection",
    },
  ];

  const currentStepIndex = steps.findIndex((step) => step.id === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const totalPrice = useMemo(() => {
    if (!selection.region || !selection.experiences.length) return 0;

    const pricingBreakdown = PricingCalculatorService.calculateTourPrice(
      selection.region,
      selection.experiences,
      {
        participants: selection.participants,
        date: selection.date,
        groupDiscount: selection.participants >= 8,
        seasonalPricing: true,
      }
    );

    return pricingBreakdown.totalPrice;
  }, [selection]);

  const regionExperiences = useMemo(() => {
    if (!selection.region) return [];

    // Get experiences from the hook - this now contains real Rezdy data
    return getExperiencesForRegion(selection.region.id);
  }, [selection.region, getExperiencesForRegion]);

  const handleRegionSelect = (region: DynamicRegion) => {
    const regionExps = getExperiencesForRegion(region.id);
    const transportExp = regionExps.find((exp) => exp.id === "hop-on-hop-off");

    setSelection((prev) => ({
      ...prev,
      region,
      experiences: transportExp ? [transportExp] : [], // Always include transport if available
    }));
    setCurrentStep("experiences");
  };

  const handleExperienceToggle = (experience: DynamicExperience) => {
    if (experience.id === "hop-on-hop-off") return; // Can't remove transport

    setSelection((prev) => ({
      ...prev,
      experiences: prev.experiences.some((exp) => exp.id === experience.id)
        ? prev.experiences.filter((exp) => exp.id !== experience.id)
        : [...prev.experiences, experience],
    }));
  };

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].id);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case "region":
        return selection.region !== null;
      case "experiences":
        return selection.experiences.length > 1; // More than just transport
      case "customize":
        return selection.participants > 0;
      default:
        return true;
    }
  };

  return (
    <div className={`max-w-6xl mx-auto ${className}`}>
      {/* Compact Progress Header */}
      <div className="mb-6 bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-gray-900">Build Your Tour</h2>
            <div className="text-lg font-bold text-brand-accent">
              ${totalPrice}
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {selection.participants}{" "}
            {selection.participants === 1 ? "person" : "people"} • Step{" "}
            {currentStepIndex + 1}/{steps.length}
          </div>
        </div>

        <Progress value={progress} className="mb-3" />

        <div className="flex items-center justify-between text-xs">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center ${
                index <= currentStepIndex
                  ? "text-brand-accent"
                  : "text-gray-400"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center mr-1 ${
                  index <= currentStepIndex
                    ? "bg-brand-accent text-white"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                {index < currentStepIndex ? (
                  <CheckCircle className="w-3 h-3" />
                ) : (
                  index + 1
                )}
              </div>
              <div className="hidden sm:block">
                <div className="font-medium">{step.title}</div>
              </div>
              {index < steps.length - 1 && (
                <ChevronRight className="w-3 h-3 mx-2 text-gray-300" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {/* Region Selection */}
        {currentStep === "region" && (
          <div className="p-4">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                Where would you like to explore?
              </h3>
              <p className="text-gray-600 text-sm">
                Choose your base destination for your custom tour adventure
              </p>
            </div>

            {loading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-brand-accent" />
                <span className="ml-2 text-gray-600">Loading regions...</span>
              </div>
            )}

            {error && (
              <Alert className="mb-4">
                <AlertDescription>
                  Unable to load tour regions. Please try again later.
                </AlertDescription>
              </Alert>
            )}

            <div className="grid md:grid-cols-3 gap-4">
              {dynamicRegions.map((region) => (
                <div
                  key={region.id}
                  className="group block cursor-pointer"
                  onClick={() => handleRegionSelect(region)}
                >
                  <div
                    className={`relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-brand-accent/20 h-full min-h-[280px] flex flex-col ${
                      selection.region?.id === region.id
                        ? "ring-2 ring-[#FF585D] shadow-lg scale-[1.02]"
                        : ""
                    }`}
                  >
                    {/* Background Image */}
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                      style={{
                        backgroundImage: `url(${region.image})`,
                      }}
                    />

                    {/* Dark overlay for better text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-accent/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Selection overlay */}
                    {selection.region?.id === region.id && (
                      <div className="absolute inset-0 bg-gradient-to-t from-[#FF585D]/30 via-[#FF585D]/10 to-transparent" />
                    )}

                    {/* Content */}
                    <div className="relative z-10 p-6 h-full flex flex-col">
                      {/* Price Badge */}
                      <div className="absolute top-4 right-4">
                        <div className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm font-semibold text-gray-800">
                          From ${region.basePrice}
                        </div>
                      </div>

                      {/* Selection Indicator */}
                      {selection.region?.id === region.id && (
                        <div className="absolute top-4 left-4">
                          <div className="w-8 h-8 bg-[#FF585D] rounded-full flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-white" />
                          </div>
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 flex flex-col justify-end">
                        <h4 className="text-2xl font-bold text-white mb-2 font-['Barlow'] drop-shadow-lg">
                          {region.name}
                        </h4>

                        <p className="text-sm text-white/90 font-['Work_Sans'] mb-3 drop-shadow-md">
                          {region.description}
                        </p>

                        <div className="text-xs text-white/80 font-['Work_Sans'] mb-3 drop-shadow-sm">
                          {region.travelTime}
                        </div>

                        {/* Highlights */}
                        <div className="flex flex-wrap gap-1 mb-3">
                          {region.highlights
                            .slice(0, 3)
                            .map((highlight: string, index: number) => (
                              <div
                                key={index}
                                className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white font-['Work_Sans']"
                              >
                                {highlight}
                              </div>
                            ))}
                        </div>

                        {/* Best For */}
                        <div className="flex flex-wrap gap-1">
                          {region.bestFor
                            .slice(0, 2)
                            .map((item: string, index: number) => (
                              <div
                                key={index}
                                className="px-2 py-1 bg-[#FF585D]/20 backdrop-blur-sm rounded-full text-xs text-white font-['Work_Sans']"
                              >
                                {item}
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Experience Selection */}
        {currentStep === "experiences" && selection.region && (
          <div className="p-4">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                What experiences interest you?
              </h3>
              <p className="text-gray-600 text-sm">
                Add activities to create your perfect day in{" "}
                {selection.region.name}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {regionExperiences.map((experience) => {
                const isSelected = selection.experiences.some(
                  (exp) => exp.id === experience.id
                );
                const isTransport = experience.id === "hop-on-hop-off";

                return (
                  <div
                    key={experience.id}
                    className="group block cursor-pointer"
                    onClick={() =>
                      !isTransport && handleExperienceToggle(experience)
                    }
                  >
                    <div
                      className={`relative overflow-hidden rounded-xl transition-all duration-300 h-full min-h-[240px] flex flex-col ${
                        isTransport
                          ? "ring-2 ring-[#FF585D] shadow-lg scale-[1.02]"
                          : isSelected
                          ? "ring-2 ring-[#FF585D] shadow-lg scale-[1.02] hover:scale-[1.02]"
                          : "hover:scale-[1.02] hover:shadow-xl hover:shadow-brand-accent/20"
                      }`}
                    >
                      {/* Background Image */}
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                        style={{
                          backgroundImage: `url(${experience.image})`,
                        }}
                      />

                      {/* Dark overlay for better text readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

                      {/* Hover overlay */}
                      <div
                        className={`absolute inset-0 bg-gradient-to-t via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                          isTransport
                            ? "from-[#FF585D]/20"
                            : "from-brand-accent/20"
                        }`}
                      />

                      {/* Selection overlay */}
                      {isSelected && !isTransport && (
                        <div className="absolute inset-0 bg-gradient-to-t from-[#FF585D]/30 via-[#FF585D]/10 to-transparent" />
                      )}

                      {isTransport && (
                        <div className="absolute inset-0 bg-gradient-to-t from-[#FF585D]/30 via-[#FF585D]/10 to-transparent" />
                      )}

                      {/* Content */}
                      <div className="relative z-10 p-4 h-full flex flex-col">
                        {/* Price Badge */}
                        <div className="absolute top-4 right-4">
                          {isTransport ? (
                            <div className="px-3 py-1 bg-[#FF585D] rounded-full text-sm font-semibold text-white">
                              Included
                            </div>
                          ) : (
                            <div className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm font-semibold text-gray-800">
                              +${experience.price}
                            </div>
                          )}
                        </div>

                        {/* Selection Indicator */}
                        <div className="absolute top-4 left-4">
                          {isSelected && !isTransport && (
                            <div className="w-8 h-8 bg-[#FF585D] rounded-full flex items-center justify-center">
                              <CheckCircle className="w-5 h-5 text-white" />
                            </div>
                          )}
                          {isTransport && (
                            <div className="w-8 h-8 bg-[#FF585D] rounded-full flex items-center justify-center">
                              <CheckCircle className="w-5 h-5 text-white" />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 flex flex-col justify-end">
                          <h4 className="text-lg font-bold text-white mb-2 font-['Barlow'] drop-shadow-lg">
                            {experience.name}
                          </h4>

                          <div className="flex items-center text-sm text-white/90 font-['Work_Sans'] mb-2 drop-shadow-sm">
                            <Clock className="w-3 h-3 mr-1" />
                            {experience.duration}
                          </div>

                          <p className="text-sm text-white/90 font-['Work_Sans'] mb-3 line-clamp-2 drop-shadow-md">
                            {experience.description}
                          </p>

                          {/* Highlights */}
                          <div className="flex flex-wrap gap-1">
                            {experience.highlights
                              .slice(0, 2)
                              .map((highlight: string, index: number) => (
                                <div
                                  key={index}
                                  className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white font-['Work_Sans']"
                                >
                                  {highlight}
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Customization */}
        {currentStep === "customize" && (
          <div className="p-4">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                Customize your experience
              </h3>
              <p className="text-gray-600 text-sm">
                Adjust the details to make this tour perfect for your group
              </p>
            </div>

            <div className="max-w-2xl mx-auto space-y-4">
              {/* Participants */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Users className="w-4 h-4 text-brand-accent" />
                    Number of Participants
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setSelection((prev) => ({
                          ...prev,
                          participants: Math.max(1, prev.participants - 1),
                        }))
                      }
                      disabled={selection.participants <= 1}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <div className="text-xl font-bold w-12 text-center">
                      {selection.participants}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setSelection((prev) => ({
                          ...prev,
                          participants: Math.min(20, prev.participants + 1),
                        }))
                      }
                      disabled={selection.participants >= 20}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="text-center text-xs text-gray-500 mt-1">
                    Maximum 20 participants per tour
                  </p>
                </CardContent>
              </Card>

              {/* Date Selection */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Calendar className="w-4 h-4 text-brand-accent" />
                    Preferred Date
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <input
                    type="date"
                    value={selection.date}
                    onChange={(e) =>
                      setSelection((prev) => ({
                        ...prev,
                        date: e.target.value,
                      }))
                    }
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent text-sm cursor-pointer"
                    style={{
                      colorScheme: "light",
                      WebkitAppearance: "none",
                      MozAppearance: "textfield",
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    We'll confirm availability and suggest alternatives if
                    needed
                  </p>
                </CardContent>
              </Card>

              {/* Special Requests */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Heart className="w-4 h-4 text-brand-accent" />
                    Special Requests
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <textarea
                    value={selection.specialRequests}
                    onChange={(e) =>
                      setSelection((prev) => ({
                        ...prev,
                        specialRequests: e.target.value,
                      }))
                    }
                    placeholder="Any dietary requirements, accessibility needs, or special occasions we should know about?"
                    rows={2}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent resize-none text-sm"
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Summary */}
        {currentStep === "summary" && (
          <div className="p-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Review your custom tour
              </h3>
              <p className="text-gray-600">
                Everything looks good? Let's make it happen!
              </p>
            </div>

            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
              {/* Tour Summary */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Tour Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-brand-accent" />
                      <div>
                        <div className="font-semibold">
                          {selection.region?.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {selection.region?.travelTime}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-brand-accent" />
                      <div>
                        <div className="font-semibold">
                          {selection.participants} Participants
                        </div>
                      </div>
                    </div>

                    {selection.date && (
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-brand-accent" />
                        <div>
                          <div className="font-semibold">
                            {new Date(selection.date).toLocaleDateString(
                              "en-AU",
                              {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Selected Experiences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selection.experiences.map((experience) => (
                      <div
                        key={experience.id}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <div className="font-medium">{experience.name}</div>
                          <div className="text-sm text-gray-500">
                            {experience.duration}
                          </div>
                        </div>
                        <div className="text-right">
                          {experience.id === "hop-on-hop-off" ? (
                            <Badge variant="secondary">Included</Badge>
                          ) : (
                            <div className="font-semibold">
                              ${experience.price}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Pricing & Booking */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Pricing Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>
                        Base transport ({selection.participants} people)
                      </span>
                      <span>
                        $
                        {(selection.region?.basePrice || 0) *
                          selection.participants}
                      </span>
                    </div>

                    {selection.experiences
                      .filter((exp) => exp.id !== "hop-on-hop-off")
                      .map((experience) => (
                        <div
                          key={experience.id}
                          className="flex justify-between"
                        >
                          <span>
                            {experience.name} ({selection.participants} people)
                          </span>
                          <span>
                            ${experience.price * selection.participants}
                          </span>
                        </div>
                      ))}

                    <Separator />

                    <div className="flex justify-between text-xl font-bold">
                      <span>Total</span>
                      <span className="text-brand-accent">${totalPrice}</span>
                    </div>

                    <p className="text-sm text-gray-500">
                      Final price confirmed upon booking. Includes all selected
                      experiences and transport.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <Button
                      size="lg"
                      className="w-full mb-4 bg-brand-accent hover:bg-brand-accent/90"
                    >
                      <Calendar className="w-5 h-5 mr-2" />
                      Book This Tour - ${totalPrice}
                    </Button>

                    <Button variant="outline" size="lg" className="w-full">
                      <Heart className="w-5 h-5 mr-2" />
                      Save & Get Quote
                    </Button>

                    <p className="text-xs text-gray-500 text-center mt-3">
                      Free cancellation up to 24 hours before your tour
                    </p>
                  </CardContent>
                </Card>

                {/* Real Rezdy Products */}
                {customProducts.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Similar Custom Tours
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {customProducts
                          .slice(0, 2)
                          .map((product: RezdyProduct) => (
                            <div
                              key={product.productCode}
                              className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50"
                            >
                              <div className="flex-1">
                                <div className="font-medium text-sm">
                                  {product.name}
                                </div>
                                <div className="text-xs text-gray-500 line-clamp-2">
                                  {product.shortDescription}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-brand-accent">
                                  ${product.advertisedPrice}
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="mt-1"
                                >
                                  View
                                </Button>
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="border-t bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStepIndex === 0}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>

            <div className="text-sm text-gray-500">
              Step {currentStepIndex + 1} of {steps.length}
            </div>

            {currentStep !== "summary" ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex items-center gap-2 bg-brand-accent hover:bg-brand-accent/90"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="w-4 h-4 mr-2" />
                Complete
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
