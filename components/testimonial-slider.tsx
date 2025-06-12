"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TestimonialCard } from "@/components/testimonial-card";
import { Button } from "@/components/ui/button";

interface Testimonial {
  name: string;
  location: string;
  image: string;
  rating: number;
  testimonial: string;
}

interface TestimonialSliderProps {
  testimonials: Testimonial[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export function TestimonialSlider({
  testimonials,
  autoPlay = true,
  autoPlayInterval = 5000,
}: TestimonialSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay) return;

    const interval = setInterval(() => {
      nextSlide();
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [currentIndex, autoPlay, autoPlayInterval]);

  const nextSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const prevSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Main slider container */}
      <div className="relative overflow-hidden rounded-lg">
        <div
          className="flex transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {testimonials.map((testimonial, index) => (
            <div key={index} className="w-full flex-shrink-0 px-4">
              <TestimonialCard
                name={testimonial.name}
                location={testimonial.location}
                image={testimonial.image}
                rating={testimonial.rating}
                testimonial={testimonial.testimonial}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation arrows */}
      <Button
        variant="outline"
        size="icon"
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white/90 hover:bg-white border-amber-200 hover:border-amber-300 shadow-lg"
        onClick={prevSlide}
        disabled={isTransitioning}
      >
        <ChevronLeft className="h-4 w-4 text-amber-600" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white/90 hover:bg-white border-amber-200 hover:border-amber-300 shadow-lg"
        onClick={nextSlide}
        disabled={isTransitioning}
      >
        <ChevronRight className="h-4 w-4 text-amber-600" />
      </Button>

      {/* Dot indicators */}
      <div className="flex justify-center space-x-2 mt-8">
        {testimonials.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-200 ${
              index === currentIndex
                ? "bg-amber-500 scale-110"
                : "bg-amber-200 hover:bg-amber-300"
            }`}
            onClick={() => goToSlide(index)}
            disabled={isTransitioning}
          />
        ))}
      </div>

      {/* Progress indicator */}
      <div className="mt-4 text-center">
        <span className="text-sm text-muted-foreground font-['Work_Sans']">
          {currentIndex + 1} of {testimonials.length}
        </span>
      </div>
    </div>
  );
}
