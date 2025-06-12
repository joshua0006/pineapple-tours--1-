import { PrivateToursDestination } from "@/components/private-tours-by-destination";
import { PageHeader } from "@/components/page-header";
import { ContactSection } from "@/components/contact-section";

export default function PrivateToursPage() {
  return (
    <div className="min-h-screen">
      <PageHeader
        title="Private Tours"
        subtitle="Personalized experiences crafted just for you across Queensland's most beautiful destinations"
        variant="default"
      />

      <PrivateToursDestination />

      <ContactSection />
    </div>
  );
}
