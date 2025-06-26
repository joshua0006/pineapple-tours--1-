"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useBookingPrompt } from "@/hooks/use-booking-prompt";

export default function BookingPopupDemoPage() {
  const [countdown, setCountdown] = useState<number>(60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const { promptData, hasPromptData } = useBookingPrompt();

  // Handle demo timer
  useEffect(() => {
    if (!isRunning) return;

    if (countdown === 0) {
      setIsRunning(false);
      return;
    }

    const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown, isRunning]);

  const startDemo = () => {
    sessionStorage.removeItem("pineapple-tours-booking-prompt");
    setCountdown(60);
    setIsRunning(true);
  };

  const resetDemo = () => {
    sessionStorage.removeItem("pineapple-tours-booking-prompt");
    setCountdown(60);
    setIsRunning(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 py-10">
      <div className="container mx-auto px-4 max-w-3xl space-y-8">
        <h1 className="text-4xl font-bold text-center">Booking Popup Demo</h1>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Demo Controls</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-center gap-4">
            <Button onClick={startDemo} disabled={isRunning}>
              {isRunning ? "Demo running…" : "Start 60s Demo"}
            </Button>
            <Button variant="outline" onClick={resetDemo}>
              Reset
            </Button>
            {isRunning && (
              <Badge variant="default">Popup in {countdown}s</Badge>
            )}
          </CardContent>
        </Card>

        {/* Booking data preview */}
        {hasPromptData && (
          <Card>
            <CardHeader>
              <CardTitle>Collected Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-700">
              <p>
                <span className="font-medium">Participants:</span>{" "}
                {promptData?.groupSize}
              </p>
              <p>
                <span className="font-medium">Travel date:</span>{" "}
                {promptData?.bookingDate
                  ? format(promptData.bookingDate, "MMM dd, yyyy")
                  : "–"}
              </p>
              <p>
                <span className="font-medium">Has interacted:</span>{" "}
                {promptData?.hasInteracted ? "Yes" : "No"}
              </p>
            </CardContent>
          </Card>
        )}

        <p className="text-center text-sm text-gray-600">
          Keep the tab inactive for 60&nbsp;seconds or switch to another tab to
          trigger the popup.
        </p>
      </div>
    </div>
  );
}
