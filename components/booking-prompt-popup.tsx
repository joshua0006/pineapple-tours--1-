"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Calendar as CalendarIcon,
  Users,
  X,
  Clock,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";
import { format, addDays } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface BookingPromptData {
  groupSize: number;
  bookingDate: Date | undefined;
  hasInteracted: boolean;
  permanentlyDismissed?: boolean;
}

interface BookingPromptPopupProps {
  onStartBooking?: (data: BookingPromptData) => void;
  onDismiss?: () => void;
  className?: string;
}

const INACTIVITY_TIMEOUT = 5000; // 1 minute
const STORAGE_KEY = "pineapple-tours-booking-prompt";

export function BookingPromptPopup({
  onStartBooking,
  onDismiss,
  className,
}: BookingPromptPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [groupSize, setGroupSize] = useState(2);
  const [bookingDate, setBookingDate] = useState<Date | undefined>(undefined);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [isTabVisible, setIsTabVisible] = useState(true);

  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const hasShownPopupRef = useRef(false);
  const timerReasonRef = useRef<"inactivity" | "tab-out" | null>(null);

  // Check if user has already interacted with the popup in this page load
  const checkPreviousInteraction = useCallback(() => {
    // Allow popup to show multiple times - only check if user has permanently dismissed it
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        // Only prevent if user explicitly dismissed (not just completed booking)
        return data.permanentlyDismissed === true;
      }
    } catch (error) {
      console.warn("Failed to check previous interaction:", error);
    }
    return false;
  }, []);

  // Store user interaction data
  const storeInteractionData = useCallback(
    (data: Partial<BookingPromptData>) => {
      try {
        const existing = sessionStorage.getItem(STORAGE_KEY);
        const currentData = existing ? JSON.parse(existing) : {};
        const updatedData = {
          ...currentData,
          ...data,
          timestamp: Date.now(),
          pageLoadId: Math.random().toString(36).substr(2, 9),
        };
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
      } catch (error) {
        console.warn("Failed to store booking prompt data:", error);
      }
    },
    []
  );

  // Clear the inactivity timer
  const clearInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
    timerReasonRef.current = null;
  }, []);

  // Start inactivity timer with specified reason
  const startInactivityTimer = useCallback(
    (reason: "inactivity" | "tab-out") => {
      clearInactivityTimer();

      // Don't start timer if popup already shown or user has interacted
      if (hasShownPopupRef.current || checkPreviousInteraction()) {
        return;
      }

      timerReasonRef.current = reason;
      inactivityTimerRef.current = setTimeout(() => {
        // Only show popup if conditions are still met
        if (!hasShownPopupRef.current && !checkPreviousInteraction()) {
          // For tab-out scenario, only show if tab is still hidden
          if (reason === "tab-out" && isTabVisible) {
            return;
          }
          showPopup();
        }
      }, INACTIVITY_TIMEOUT);
    },
    [checkPreviousInteraction, isTabVisible]
  );

  // Reset inactivity timer (for user activity within tab)
  const resetInactivityTimer = useCallback(() => {
    // Only handle inactivity timer if tab is visible
    if (!isTabVisible) return;

    clearInactivityTimer();

    // Don't start timer if popup is already visible or user has already interacted
    if (isVisible || hasShownPopupRef.current || checkPreviousInteraction()) {
      return;
    }

    startInactivityTimer("inactivity");
  }, [
    isVisible,
    isTabVisible,
    checkPreviousInteraction,
    startInactivityTimer,
    clearInactivityTimer,
  ]);

  // Handle tab visibility changes
  const handleVisibilityChange = useCallback(() => {
    const isCurrentlyVisible = !document.hidden;
    setIsTabVisible(isCurrentlyVisible);

    if (isCurrentlyVisible) {
      // Tab became visible (user returned)
      // Clear any pending tab-out timer
      if (timerReasonRef.current === "tab-out") {
        clearInactivityTimer();
      }
      // Restart inactivity timer for current tab activity
      resetInactivityTimer();
    } else {
      // Tab became hidden (user tabbed out)
      // Clear inactivity timer and start tab-out timer
      clearInactivityTimer();
      startInactivityTimer("tab-out");
    }
  }, [clearInactivityTimer, resetInactivityTimer, startInactivityTimer]);

  // Show popup with animation
  const showPopup = useCallback(() => {
    if (checkPreviousInteraction()) return;

    // Reset the flag to allow popup to show again after some time
    hasShownPopupRef.current = true;
    setIsVisible(true);
    setIsAnimating(true);

    // Focus management for accessibility
    setTimeout(() => {
      if (popupRef.current) {
        const firstFocusable = popupRef.current.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as HTMLElement;
        firstFocusable?.focus();
      }
    }, 100);
  }, [checkPreviousInteraction]);

  // Hide popup with animation
  const hidePopup = useCallback(() => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      // Reset the flag after 1 second to allow popup to show again
      setTimeout(() => {
        hasShownPopupRef.current = false;
      }, 1000);
    }, 300); // Match animation duration
  }, []);

  // Handle user activity events
  const handleUserActivity = useCallback(() => {
    if (!hasUserInteracted) {
      setHasUserInteracted(true);
    }
    // Only reset timer if tab is visible (user is actively in the tab)
    if (isTabVisible) {
      resetInactivityTimer();
    }
  }, [hasUserInteracted, isTabVisible, resetInactivityTimer]);

  // Handle popup dismissal
  const handleDismiss = useCallback(() => {
    storeInteractionData({ hasInteracted: true, permanentlyDismissed: true });
    clearInactivityTimer();
    hidePopup();
    onDismiss?.();
  }, [hidePopup, onDismiss, storeInteractionData, clearInactivityTimer]);

  // Handle start booking
  const handleStartBooking = useCallback(() => {
    const bookingData: BookingPromptData = {
      groupSize,
      bookingDate,
      hasInteracted: true,
    };

    storeInteractionData(bookingData);
    clearInactivityTimer();
    hidePopup();
    onStartBooking?.(bookingData);
  }, [
    groupSize,
    bookingDate,
    hidePopup,
    onStartBooking,
    storeInteractionData,
    clearInactivityTimer,
  ]);

  // Handle escape key
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape" && isVisible) {
        handleDismiss();
      }
    },
    [isVisible, handleDismiss]
  );

  // Set up event listeners for user activity and tab visibility
  useEffect(() => {
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    // Add user activity listeners
    events.forEach((event) => {
      document.addEventListener(event, handleUserActivity, { passive: true });
    });

    // Add keyboard and visibility listeners
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Initialize tab visibility state
    setIsTabVisible(!document.hidden);

    // Start initial timer only if tab is visible
    if (!document.hidden) {
      resetInactivityTimer();
    }

    return () => {
      // Cleanup all event listeners
      events.forEach((event) => {
        document.removeEventListener(event, handleUserActivity);
      });
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      // Clear any pending timers
      clearInactivityTimer();
    };
  }, [
    handleUserActivity,
    handleKeyDown,
    handleVisibilityChange,
    resetInactivityTimer,
    clearInactivityTimer,
  ]);

  // Trap focus within popup for accessibility
  const handleTabKey = useCallback((event: React.KeyboardEvent) => {
    if (event.key !== "Tab" || !popupRef.current) return;

    const focusableElements = popupRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    }
  }, []);

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300",
          isAnimating ? "opacity-100" : "opacity-0"
        )}
        onClick={handleDismiss}
        aria-hidden="true"
      />

      {/* Popup */}
      <div
        ref={popupRef}
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-out",
          isAnimating
            ? "scale-100 opacity-100 translate-y-[-50%]"
            : "scale-95 opacity-0 translate-y-[-45%]",
          "px-4 sm:px-0", // Responsive padding
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-prompt-title"
        aria-describedby="booking-prompt-description"
        onKeyDown={handleTabKey}
      >
        <Card className="relative shadow-2xl border-0 bg-white dark:bg-gray-900">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 z-10 h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={handleDismiss}
            aria-label="Close booking prompt"
          >
            <X className="h-4 w-4" />
          </Button>

          <CardHeader className="pb-4 pt-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center rounded-full">
                <Image
                  src="/pineapple-tour-logo.png"
                  alt="Pineapple Tours"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <div>
                <CardTitle
                  id="booking-prompt-title"
                  className="text-lg font-semibold"
                >
                  Ready to explore paradise?
                </CardTitle>
                <p
                  id="booking-prompt-description"
                  className="text-sm text-muted-foreground mt-1"
                >
                  Let's plan your perfect tropical getaway
                </p>
              </div>
            </div>

            {/* Subtle animation indicator */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Quick booking setup</span>
              <Badge variant="secondary" className="text-xs">
                2 min
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 pb-6">
            {/* Group Size Selection */}
            <div className="space-y-3">
              <Label
                htmlFor="group-size"
                className="text-sm font-medium flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                How many participants?
              </Label>
              <Select
                value={groupSize.toString()}
                onValueChange={(value) => setGroupSize(Number(value))}
              >
                <SelectTrigger id="group-size" className="w-full">
                  <SelectValue placeholder="Select group size" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? "participant" : "participants"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                When would you like to travel?
              </Label>
              <DatePicker
                date={bookingDate}
                onDateChange={setBookingDate}
                placeholder="Select your travel date"
                minDate={new Date()}
                maxDate={addDays(new Date(), 365)}
                className="w-full"
                id="booking-date"
              />
              {!bookingDate && (
                <p className="text-xs text-muted-foreground">
                  Don't worry, you can change this later
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-2">
              <Button
                onClick={handleStartBooking}
                className="w-full font-medium h-11 text-base"
                disabled={groupSize < 1}
              >
                <span className="flex items-center gap-2">
                  Start Booking
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Button>

              <Button
                variant="ghost"
                onClick={handleDismiss}
                className="w-full text-muted-foreground hover:text-foreground"
              >
                Continue browsing
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center justify-center gap-4 pt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-brand-green-accent" />
                Secure booking
              </span>
              <span className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-brand-accent" />
                Free cancellation
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
