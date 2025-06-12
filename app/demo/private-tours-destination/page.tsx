import { PrivateToursDestination } from "@/components/private-tours-by-destination";
import { PageHeader } from "@/components/page-header";

export default function PrivateToursDestinationDemo() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Private Tours by Destination"
        subtitle="Demo of the private tours destination section with Rezdy data integration"
      />

      <PrivateToursDestination />
    </div>
  );
}
