"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ChevronRight,
  Bus,
  Gift,
  Clock,
  MapPin,
  Star,
  Calendar,
  CreditCard,
  BookOpen,
  MessageCircle,
} from "lucide-react";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { TestimonialCard } from "@/components/testimonial-card";
import { SearchForm } from "@/components/search-form";
import { CategoriesSection } from "@/components/categories-section";
import { HopOnHopOffImages } from "@/components/hop-on-hop-off-images";

import { BlogSection } from "@/components/blog-section";
import { ContactSection } from "@/components/contact-section";
import { TestimonialsSection } from "@/components/testimonials-section";

// Video Overlay Component with customizable options
interface VideoOverlayProps {
  opacity?: number; // 0-1
  fadeInDuration?: number; // in seconds
  position?: "bottom" | "top" | "full";
  height?: string; // CSS height value for partial overlays
  color?: string; // hex color
}

const VideoOverlay: React.FC<VideoOverlayProps> = ({
  opacity = 0.4,
  fadeInDuration = 2,
  position = "bottom",
  height = "40%",
  color = "#141312",
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger fade-in animation after component mounts
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const getPositionStyles = () => {
    switch (position) {
      case "top":
        return {
          top: 0,
          height: height,
          background: `linear-gradient(to bottom, ${color} 0%, transparent 100%)`,
        };
      case "full":
        return {
          top: 0,
          height: "100%",
          backgroundColor: color,
        };
      case "bottom":
      default:
        return {
          bottom: 0,
          height: height,
          background: `linear-gradient(to top, ${color} 0%, transparent 100%)`,
        };
    }
  };

  return (
    <div
      className="absolute left-0 right-0 z-20 pointer-events-none transition-opacity ease-in-out"
      style={{
        ...getPositionStyles(),
        opacity: isVisible ? opacity : 0,
        transitionDuration: `${fadeInDuration}s`,
      }}
    />
  );
};

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[90vh] flex flex-col">
        <div className="absolute inset-0 z-0">
          <div className="relative h-full w-full overflow-hidden">
            <iframe
              src="https://www.youtube.com/embed/R_QENYv8IVA?autoplay=1&mute=1&loop=1&playlist=R_QENYv8IVA&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1&hd=1&vq=hd1080&disablekb=1&fs=0&cc_load_policy=0&start=0&end=0"
              title="Tourism Background Video"
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 brightness-[0.6] pointer-events-none
                          sm:min-w-full sm:min-h-full sm:w-auto sm:h-auto
                          max-sm:w-[150%] max-sm:h-[150%] max-sm:min-w-[150%] max-sm:min-h-[150%]"
              style={{
                aspectRatio: "16/9",
              }}
              allow="autoplay; encrypted-media"
              allowFullScreen={false}
              frameBorder="0"
              tabIndex={-1}
            />
            {/* Dark overlay for better text readability */}
            <div className="absolute inset-0 bg-black/30"></div>

            {/* Customizable Video Overlay */}
            <VideoOverlay
              opacity={0.5}
              fadeInDuration={3}
              position="bottom"
              height="50%"
              color="#141312"
            />
          </div>
        </div>
        <div className="container relative z-10 flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="max-w-8xl w-full">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Left Side - Text Content */}
              <div className="space-y-4 sm:space-y-6 text-left">
                <p className="font-secondary text-sm sm:text-base font-medium text-brand-secondary/90 tracking-widest uppercase drop-shadow-lg">
                  WELCOME TO PINEAPPLE TOURS
                </p>
                <h1 className="font-primary text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-brand-secondary leading-tight drop-shadow-lg">
                  Make memories with friends,
                  <br />
                  make friends with wine!
                </h1>
              </div>

              {/* Right Side - Search Form */}
              <div className="w-full">
                <Card className="overflow-hidden border-none shadow-lg bg-white/60">
                  <CardContent className="p-0">
                    <SearchForm />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <CategoriesSection />

      {/* Hop on Hop off Section */}
      <section className="py-16 bg-gray-50">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-brand-accent/10 rounded-full flex items-center justify-center">
                  <Bus className="h-6 w-6 text-brand-accent" />
                </div>
                <h2 className="font-secondary text-3xl sm:text-4xl font-normal tracking-tight text-brand-text">
                  Hop on Hop off Tours
                </h2>
              </div>
              <p className="font-text text-lg text-muted-foreground leading-relaxed">
                Explore the city at your own pace with our flexible sightseeing
                buses. Jump on and off at any of our strategically located stops
                to discover attractions, landmarks, and hidden gems throughout
                the city.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-brand-accent" />
                  <span className="font-text text-sm">
                    Buses every 15-20 minutes
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-brand-accent" />
                  <span className="font-text text-sm">
                    Multiple themed routes
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Star className="h-5 w-5 text-brand-accent" />
                  <span className="font-text text-sm">
                    Air-conditioned buses
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-brand-accent" />
                  <span className="font-text text-sm">Valid for 24 hours</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/tours?category=hop-on-hop-off">
                  <Button
                    size="lg"
                    className="bg-brand-accent text-brand-secondary hover:bg-brand-accent/90"
                  >
                    <Bus className="mr-2 h-5 w-5" />
                    Explore Routes
                  </Button>
                </Link>
              </div>
            </div>

            {/* Images Grid */}
            <div className="relative">
              <HopOnHopOffImages />
              <div className="absolute -bottom-6 -right-6 bg-brand-accent text-brand-secondary p-4 rounded-xl shadow-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold">$99</div>
                  <div className="text-sm opacity-90">Starting from</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Compact CTA Card */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              {/* Background Image */}
              <div className="absolute inset-0 z-0">
                <Image
                  src="/cea291bc40ef4c8a8ac060ed77c6fd3cLuxury_Wine_Tour_lg.avif"
                  alt="Scenic tour destination views"
                  fill
                  className="object-cover object-center"
                  priority
                />
                {/* Enhanced gradient overlay for better text contrast */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              </div>

              {/* Content */}
              <div className="relative z-10 px-8 py-12 sm:px-12 sm:py-16">
                {/* Compact Heading with enhanced styling */}
                <h2 className="font-primary text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-secondary mb-4 drop-shadow-2xl shadow-2xl">
                  Start Your Adventure Today
                </h2>

                {/* Brief Description with better contrast */}
                <p className="font-text max-w-lg text-base sm:text-lg text-brand-secondary/95 mb-8 leading-relaxed drop-shadow-lg">
                  Book now and discover why we're the top-rated tour company
                  with over 10,000 happy customers.
                </p>

                {/* Single Primary CTA */}
                <div className="flex justify-start mb-6">
                  <Link href="/tours">
                    <Button
                      size="lg"
                      className="group bg-brand-accent text-brand-secondary hover:bg-brand-accent/90 font-semibold px-10 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-2 border-brand-accent/20 hover:border-brand-accent/40"
                    >
                      Explore Tours
                      <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Travel Blog Section */}
      <section className="py-16 bg-gray-100">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <BlogSection />
          </div>
        </div>
      </section>

      {/* Contact Us Section */}
      <section className="py-16 bg-white">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <ContactSection />
          </div>
        </div>
      </section>
    </>
  );
}

// Export BookingData type for use in other components
export interface BookingData {
  product: {
    code: string;
    name: string;
    hasPickupServices?: boolean;
    pickupServiceType?: string;
  };
  session: {
    id: string;
    startTime: string;
    endTime: string;
  };
  pickupLocation?: any;
  participants: number;
  pricing: {
    basePrice: number;
    sessionPrice: number;
    subtotal: number;
    taxAndFees: number;
    total: number;
  };
  timestamp: string;
}
