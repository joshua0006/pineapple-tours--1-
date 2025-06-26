"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Clock,
  Users,
  Calendar,
  MousePointer,
  Smartphone,
  Monitor,
  Eye,
  CheckCircle,
  AlertCircle,
  Info,
  Heart,
  ArrowRight,
  Search,
  ExternalLink,
} from "lucide-react";
import { useBookingPrompt } from "@/hooks/use-booking-prompt";
import { format } from "date-fns";

export default function BookingPromptDemoPage() {
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [isActive, setIsActive] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const { promptData, hasPromptData } = useBookingPrompt();

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((time) => {
          if (time <= 1) {
            setHasTriggered(true);
            setIsActive(false);
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeRemaining]);

  const startDemo = () => {
    setTimeRemaining(30);
    setIsActive(true);
    setHasTriggered(false);
    // Clear any existing session storage
    sessionStorage.removeItem("pineapple-tours-booking-prompt");
  };

  const resetDemo = () => {
    setTimeRemaining(30);
    setIsActive(false);
    setHasTriggered(false);
    sessionStorage.removeItem("pineapple-tours-booking-prompt");
  };

  const testDataTransfer = () => {
    // Simulate booking prompt data
    const testData = {
      groupSize: 4,
      bookingDate: new Date("2024-12-25"),
      hasInteracted: true,
    };

    // Store test data
    sessionStorage.setItem(
      "pineapple-tours-booking-prompt",
      JSON.stringify({
        ...testData,
        bookingDate: testData.bookingDate.toISOString(),
      })
    );

    // Navigate to tours with parameters
    const searchParams = new URLSearchParams();
    searchParams.set("participants", testData.groupSize.toString());
    searchParams.set("checkIn", format(testData.bookingDate, "yyyy-MM-dd"));
    searchParams.set("checkOut", format(new Date("2024-12-26"), "yyyy-MM-dd"));
    searchParams.set("sortBy", "relevance");

    window.open(`/tours?${searchParams.toString()}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Booking Prompt Demo
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience our intelligent booking prompt that appears after 30
            seconds of user inactivity, designed to capture user intent and
            streamline the booking process.
          </p>
        </div>

        {/* Demo Controls */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Demo Controls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-4">
                <Button onClick={startDemo} disabled={isActive}>
                  {isActive ? "Demo Running..." : "Start 30s Demo"}
                </Button>
                <Button onClick={resetDemo} variant="outline">
                  Reset Demo
                </Button>
                <Button
                  onClick={testDataTransfer}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Search className="h-4 w-4" />
                  Test Data Transfer
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>

              <div className="flex items-center gap-4">
                {isActive && (
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-sm font-medium">
                      Popup in {timeRemaining}s
                    </span>
                  </div>
                )}

                {hasTriggered && (
                  <Badge variant="default" className="bg-brand-green-accent">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Popup Triggered!
                  </Badge>
                )}
              </div>
            </div>

            {isActive && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center text-sm text-blue-800">
                  <Info className="h-4 w-4 mr-2" />
                  <span>
                    Stay inactive (don't click, scroll, or move your mouse) to
                    see the popup appear.
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Current Booking Data */}
        {hasPromptData && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Current Booking Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium">Participants</p>
                    <p className="text-sm text-gray-600">
                      {promptData?.groupSize} people
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">Travel Date</p>
                    <p className="text-sm text-gray-600">
                      {promptData?.bookingDate
                        ? format(promptData.bookingDate, "MMM dd, yyyy")
                        : "Not selected"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="font-medium">Status</p>
                    <p className="text-sm text-gray-600">
                      {promptData?.hasInteracted
                        ? "Interacted"
                        : "Not interacted"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center text-sm text-green-800">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span className="font-medium">Data successfully stored!</span>
                  <span className="ml-2">
                    This data will be used to pre-fill search forms.
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Features */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  Key Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">30-Second Trigger</h4>
                    <p className="text-sm text-gray-600">
                      Appears after 30 seconds of user inactivity to capture
                      browsing intent
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Group Size Input</h4>
                    <p className="text-sm text-gray-600">
                      Collects the number of participants for personalized
                      recommendations
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-purple-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Date Selection</h4>
                    <p className="text-sm text-gray-600">
                      Captures preferred travel dates with an intuitive date
                      picker
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <ArrowRight className="h-5 w-5 text-orange-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Seamless Integration</h4>
                    <p className="text-sm text-gray-600">
                      Pre-fills search forms and guides users to relevant tours
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-indigo-500" />
                  User Experience
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Non-intrusive timing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Easily dismissible</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Smooth animations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Mobile responsive</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Accessibility compliant</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Session persistence</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Technical Details */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5 text-blue-500" />
                  Data Transfer Flow
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">1. Popup Interaction</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    User selects group size and travel date in the popup
                  </p>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">2. Data Storage</h4>
                  <p className="text-sm text-gray-600">
                    Data is stored in sessionStorage with key:
                    <code className="bg-gray-100 px-1 rounded text-xs ml-1">
                      pineapple-tours-booking-prompt
                    </code>
                  </p>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">3. URL Parameters</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Navigation to tours page includes:
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>
                      • <code>participants</code> - Number of participants
                    </li>
                    <li>
                      • <code>checkIn</code> - Travel start date
                    </li>
                    <li>
                      • <code>checkOut</code> - Travel end date
                    </li>
                    <li>
                      • <code>sortBy</code> - Relevance sorting
                    </li>
                  </ul>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">4. Tours Integration</h4>
                  <p className="text-sm text-gray-600">
                    Tours page reads URL parameters and booking prompt data to:
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1 mt-2">
                    <li>• Pre-fill search filters</li>
                    <li>• Show visual indicators</li>
                    <li>• Filter products by availability</li>
                    <li>• Display personalized messaging</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-green-500" />
                  API Integration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Availability Checking</h4>
                    <p className="text-sm text-gray-600">
                      The tours page uses the participants parameter to filter
                      and display available tours for the selected group size.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Product Filtering</h4>
                    <p className="text-sm text-gray-600">
                      Products are filtered based on:
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1 mt-2">
                      <li>• Date availability for selected dates</li>
                      <li>• Capacity for number of participants</li>
                      <li>• Location and category preferences</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MousePointer className="h-5 w-5 text-purple-500" />
              How to Test
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <h4 className="font-medium mb-2">Start Demo</h4>
                <p className="text-sm text-gray-600">
                  Click "Start 30s Demo" to begin the inactivity timer
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-orange-600 font-bold">2</span>
                </div>
                <h4 className="font-medium mb-2">Stay Inactive</h4>
                <p className="text-sm text-gray-600">
                  Don't move your mouse, click, scroll, or press keys for 30
                  seconds
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-600 font-bold">3</span>
                </div>
                <h4 className="font-medium mb-2">Interact with Popup</h4>
                <p className="text-sm text-gray-600">
                  Select travelers and date, then click "Start Booking"
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-purple-600 font-bold">4</span>
                </div>
                <h4 className="font-medium mb-2">Verify Transfer</h4>
                <p className="text-sm text-gray-600">
                  Check that tours page shows pre-filled data and filtered
                  results
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Note */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800 mb-1">
                Testing Notes
              </h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>
                  • Use "Test Data Transfer" button to quickly test the tours
                  integration
                </li>
                <li>
                  • The booking prompt is active on all pages of the website
                </li>
                <li>
                  • If you've already interacted with it, open a new incognito
                  window to see it again
                </li>
                <li>
                  • Check that the tours page shows personalized headers and
                  filters
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
