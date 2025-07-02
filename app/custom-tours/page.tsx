"use client";

import { InteractiveCustomTourBuilder } from "@/components/interactive-custom-tour-builder";
import { PageHeader } from "@/components/page-header";
import { ContactSection } from "@/components/contact-section";
import { Calendar, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CustomToursPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen">
      {/* Standard Header */}
      <PageHeader
        title="Custom Self-Guided Tours"
        subtitle="Design your own adventure with flexible hop-on hop-off services, modular experiences, and day-pass pricing. Mix and match experiences with unlimited transport - one price, endless possibilities."
        primaryAction={{
          label: "Start Building Now",
          icon: Calendar,
          onClick: () => {
            // Scroll to the builder section
            const builderSection = document.getElementById("tour-builder");
            if (builderSection) {
              builderSection.scrollIntoView({ behavior: "smooth" });
            }
          },
        }}
        secondaryAction={{
          label: "Get Custom Quote",
          onClick: () => {
            // Navigate to contact page
            window.location.href = "/contact";
          },
        }}
        backButton={{
          label: "Back to Tours",
          icon: ArrowLeft,
          onClick: () => router.push("/tours"),
        }}
      />

      {/* Main Interactive Builder Section */}
      <section id="tour-builder" className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Build Your Custom Tour
            </h2>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              Use our interactive builder to create the perfect day out. See
              real-time pricing and availability as you build your experience.
            </p>
          </div>

          <InteractiveCustomTourBuilder />
        </div>
      </section>

      <ContactSection />
    </div>
  );
}
