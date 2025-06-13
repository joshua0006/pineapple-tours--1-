import { Metadata } from "next";
import { CustomToursExplorer } from "@/components/custom-tours-explorer";
import { PageHeader } from "@/components/page-header";
import { InteractiveCustomTourBuilder } from "@/components/interactive-custom-tour-builder";

export const metadata: Metadata = {
  title: "Custom Tours Explorer Demo | Pineapple Tours",
  description:
    "Interactive demo of the Custom Tours Explorer component featuring modular experiences, flexible pricing, and self-guided tour options.",
  keywords:
    "custom tours demo, modular experiences, self-guided tours, hop-on hop-off, interactive tour builder",
};

export default function CustomToursExplorerPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Custom Tour Builder
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Create your perfect tour experience with real-time data from our
            available tours. Select your destination, choose experiences, and
            customize your adventure.
          </p>
        </div>

        <InteractiveCustomTourBuilder />

        <div className="mt-12 text-center">
          <div className="bg-white rounded-lg shadow-sm border p-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div>
                <div className="w-8 h-8 bg-brand-accent text-white rounded-full flex items-center justify-center font-bold mb-3">
                  1
                </div>
                <h3 className="font-semibold mb-2">Choose Region</h3>
                <p className="text-sm text-gray-600">
                  Select from our available destinations based on real tour data
                </p>
              </div>
              <div>
                <div className="w-8 h-8 bg-brand-accent text-white rounded-full flex items-center justify-center font-bold mb-3">
                  2
                </div>
                <h3 className="font-semibold mb-2">Add Experiences</h3>
                <p className="text-sm text-gray-600">
                  Pick from categorized activities with real pricing and
                  availability
                </p>
              </div>
              <div>
                <div className="w-8 h-8 bg-brand-accent text-white rounded-full flex items-center justify-center font-bold mb-3">
                  3
                </div>
                <h3 className="font-semibold mb-2">Book & Enjoy</h3>
                <p className="text-sm text-gray-600">
                  Customize details and book your personalized tour experience
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
