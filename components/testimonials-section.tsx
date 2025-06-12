import { Star } from "lucide-react";
import { TestimonialSlider } from "@/components/testimonial-slider";

const testimonials = [
  {
    name: "Jen",
    location: "Google",
    image: "/placeholder.svg",
    rating: 5,
    testimonial:
      "We had an amazing day tasting a lot of incredible wines at beautiful locations. Chris was a great host and very flexible throughout the day. Would definitely recommend Pineapple Tours.",
  },
  {
    name: "Geri Hammond",
    location: "Google",
    image: "/placeholder.svg",
    rating: 5,
    testimonial:
      "I haven't yet been on a tour with Pineapple, however over the past few weeks I have been back and forth with Peter regarding a booking. We were trying to accommodate a large number of people on a very specific date. Peter was very patient and bent over backwards to help me find a bus that would fit everyone. He genuinely cared about me as a customer and went out of his way to source us a bus. I can't wait to go on a Pineapple Tour and I would highly recommend this business",
  },
  {
    name: "Jess M",
    location: "Google",
    image: "/placeholder.svg",
    rating: 5,
    testimonial:
      "Had an amazing time on the full day wine tour!! They had a flexible schedule throughout, which was very refreshing and gave everyone a chance to get the most out of the day. From pickup till drop off, the team were helpful, friendly and very knowledgeable. Will definitely be booking another tour in the future!!",
  },
  {
    name: "Sarah K",
    location: "TripAdvisor",
    image: "/placeholder.svg",
    rating: 5,
    testimonial:
      "Absolutely fantastic experience! The tour guide was knowledgeable and entertaining. The wineries were beautiful and the wine was exceptional. Perfect day out with friends!",
  },
  {
    name: "Michael R",
    location: "Facebook",
    image: "/placeholder.svg",
    rating: 5,
    testimonial:
      "Best tour company in the region! Professional service, comfortable transport, and amazing locations. We've booked with them multiple times and they never disappoint.",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-16 bg-white">
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="font-secondary text-3xl sm:text-4xl font-normal tracking-tight text-brand-text mb-4">
              What Our Customers Say
            </h2>
            <p className="font-text text-lg text-muted-foreground max-w-3xl mx-auto">
              Pineapple Tours has been rated 5 Stars across all review
              platforms.
              <br />
              Here are some reviews from Google, Facebook and Tripadvisor.
            </p>
          </div>

          {/* Testimonials Slider */}
          <TestimonialSlider
            testimonials={testimonials}
            autoPlay={true}
            autoPlayInterval={6000}
          />
        </div>
      </div>
    </section>
  );
}
