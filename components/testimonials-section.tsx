import { Star } from "lucide-react"
import { TestimonialCard } from "@/components/testimonial-card"

const testimonials = [
  {
    name: "Jen",
    location: "Google",
    image: "/placeholder.svg",
    rating: 5,
    testimonial: "We had an amazing day tasting a lot of incredible wines at beautiful locations. Chris was a great host and very flexible throughout the day. Would definitely recommend Pineapple Tours."
  },
  {
    name: "Geri Hammond",
    location: "Google", 
    image: "/placeholder.svg",
    rating: 5,
    testimonial: "I haven't yet been on a tour with Pineapple, however over the past few weeks I have been back and forth with Peter regarding a booking. We were trying to accommodate a large number of people on a very specific date. Peter was very patient and bent over backwards to help me find a bus that would fit everyone. He genuinely cared about me as a customer and went out of his way to source us a bus. I can't wait to go on a Pineapple Tour and I would highly recommend this business"
  },
  {
    name: "Jess M",
    location: "Google",
    image: "/placeholder.svg", 
    rating: 5,
    testimonial: "Had an amazing time on the full day wine tour!! They had a flexible schedule throughout, which was very refreshing and gave everyone a chance to get the most out of the day. From pickup till drop off, the team were helpful, friendly and very knowledgeable. Will definitely be booking another tour in the future!!"
  }
]

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
              Pineapple Tours has been rated 5 Stars across all review platforms.<br />
              Here are some reviews from Google, Facebook and Tripadvisor.
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard
                key={index}
                name={testimonial.name}
                location={testimonial.location}
                image={testimonial.image}
                rating={testimonial.rating}
                testimonial={testimonial.testimonial}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
} 