"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
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
}

interface BookingPromptPopupProps {
  onStartBooking?: (data: BookingPromptData) => void;
  onDismiss?: () => void;
  className?: string;
} 

const INACTIVITY_TIMEOUT = 30000; // 30 seconds
const SESSION_STORAGE_KEY = "pineapple_tours_popup_shown";
const INITIAL_POPUP_DELAY = 30000; // 30 seconds delay on page load

// Session management utilities
const sessionManager = {
  isPopupShownInSession(): boolean {
    try {
      return sessionStorage.getItem(SESSION_STORAGE_KEY) === "true";
    } catch (error) {
      console.warn("SessionStorage not available:", error);
      return false;
    }
  },

  markPopupAsShown(): void {
    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, "true");
    } catch (error) {
      console.warn("Failed to save popup state:", error);
    }
  },

  isNewSession(): boolean {
    return !this.isPopupShownInSession();
  },
};

export function BookingPromptPopup({
  onStartBooking,
  onDismiss,
  className,
}: BookingPromptPopupProps) {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [groupSize, setGroupSize] = useState(2);
  const [bookingDate, setBookingDate] = useState<Date | undefined>(undefined);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [isTabVisible, setIsTabVisible] = useState(true);
  const [sessionChecked, setSessionChecked] = useState(false);

  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const initialPopupTimerRef = useRef<NodeJS.Timeout | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const hasShownPopupRef = useRef(false);
  const timerReasonRef = useRef<"inactivity" | "tab-out" | "initial" | null>(
    null
  );

  // Check if user is on a booking page
  const isOnBookingPage = pathname?.startsWith("/booking");

  // Clear all timers
  const clearAllTimers = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
    if (initialPopupTimerRef.current) {
      clearTimeout(initialPopupTimerRef.current);
      initialPopupTimerRef.current = null;
    }
    timerReasonRef.current = null;
  }, []);

  // Clear the inactivity timer
  const clearInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
    if (timerReasonRef.current !== "initial") {
      timerReasonRef.current = null;
    }
  }, []);

  // Start inactivity timer with specified reason
  const startInactivityTimer = useCallback(
    (reason: "inactivity" | "tab-out") => {
      clearInactivityTimer();

      // Don't start timer if popup already shown in session or user is on booking page
      if (sessionManager.isPopupShownInSession() || isOnBookingPage) {
        return;
      }

      timerReasonRef.current = reason;
      inactivityTimerRef.current = setTimeout(() => {
        // Only show popup if conditions are still met
        if (!sessionManager.isPopupShownInSession() && !isOnBookingPage) {
          // For tab-out scenario, only show if tab is still hidden
          if (reason === "tab-out" && isTabVisible) {
            return;
          }
          showPopup();
        }
      }, INACTIVITY_TIMEOUT);
    },
    [isTabVisible, isOnBookingPage]
  );

  // Start initial popup timer for new sessions
  const startInitialPopupTimer = useCallback(() => {
    // Don't show if popup already shown in session or user is on booking page
    if (sessionManager.isPopupShownInSession() || isOnBookingPage) {
      return;
    }

    timerReasonRef.current = "initial";
    initialPopupTimerRef.current = setTimeout(() => {
      // Double-check conditions before showing
      if (
        !sessionManager.isPopupShownInSession() &&
        !isOnBookingPage &&
        isTabVisible
      ) {
        showPopup();
      }
    }, INITIAL_POPUP_DELAY);
  }, [isOnBookingPage, isTabVisible]);

  // Reset inactivity timer (for user activity within tab)
  const resetInactivityTimer = useCallback(() => {
    // Only handle inactivity timer if tab is visible and not on booking page
    if (!isTabVisible || isOnBookingPage) return;

    clearInactivityTimer();

    // Don't start timer if popup is already visible or shown in session
    if (isVisible || sessionManager.isPopupShownInSession()) {
      return;
    }

    startInactivityTimer("inactivity");
  }, [
    isVisible,
    isTabVisible,
    startInactivityTimer,
    clearInactivityTimer,
    isOnBookingPage,
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
    // Don't show popup if user is on booking page or already shown in session
    if (isOnBookingPage || sessionManager.isPopupShownInSession()) {
      return;
    }

    // Mark popup as shown in this session
    sessionManager.markPopupAsShown();
    hasShownPopupRef.current = true;

    // Clear all timers since popup is now showing
    clearAllTimers();

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
  }, [isOnBookingPage, clearAllTimers]);

  // Hide popup with animation
  const hidePopup = useCallback(() => {
    setIsAnimating(false);

    // Wait for the closing animation to complete before hiding the component
    setTimeout(() => {
      setIsVisible(false);
    }, 300); // Match animation duration
  }, []);

  // Handle user activity events
  const handleUserActivity = useCallback(() => {
    if (!hasUserInteracted) {
      setHasUserInteracted(true);
    }
    // Only reset timer if tab is visible and not on booking page and not shown in session
    if (
      isTabVisible &&
      !isOnBookingPage &&
      !sessionManager.isPopupShownInSession()
    ) {
      resetInactivityTimer();
    }
  }, [hasUserInteracted, isTabVisible, resetInactivityTimer, isOnBookingPage]);

  // Handle popup dismissal
  const handleDismiss = useCallback(() => {
    clearAllTimers();
    hidePopup();
    onDismiss?.();
  }, [hidePopup, onDismiss, clearAllTimers]);

  // Handle start booking
  const handleStartBooking = useCallback(() => {
    const bookingData: BookingPromptData = {
      groupSize,
      bookingDate,
      hasInteracted: true,
    };

    clearAllTimers();
    hidePopup();
    onStartBooking?.(bookingData);
  }, [groupSize, bookingDate, hidePopup, onStartBooking, clearAllTimers]);

  // Handle escape key
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape" && isVisible) {
        handleDismiss();
      }
    },
    [isVisible, handleDismiss]
  );

  // Initialize session check and popup behavior
  useEffect(() => {
    if (sessionChecked) return;

    setSessionChecked(true);

    // Don't proceed if on booking page
    if (isOnBookingPage) {
      return;
    }

    // Check if this is a new session
    if (sessionManager.isNewSession()) {
      // Start initial popup timer for new session
      startInitialPopupTimer();
    }
  }, [sessionChecked, isOnBookingPage, startInitialPopupTimer]);

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

    return () => {
      // Cleanup all event listeners
      events.forEach((event) => {
        document.removeEventListener(event, handleUserActivity);
      });
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      // Clear any pending timers
      clearAllTimers();
    };
  }, [
    handleUserActivity,
    handleKeyDown,
    handleVisibilityChange,
    clearAllTimers,
  ]);

  // Effect to handle route changes - hide popup and clear timers when navigating to booking page
  useEffect(() => {
    if (isOnBookingPage) {
      // Clear any existing timers
      clearAllTimers();

      // Hide popup if currently visible
      if (isVisible) {
        handleDismiss();
      }
    }
  }, [isOnBookingPage, isVisible, clearAllTimers, handleDismiss]);

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

  // Don't render anything if user is on a booking page
  if (!isVisible || isOnBookingPage) return null;

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

          <CardHeader className="pt-6">
            <div className="flex items-center gap-3 ">
              <div className="flex items-center justify-center rounded-full">
                <Image
                  src="/pineapple-tour-logo.png"
                  alt="Pineapple Tours"
                  width={48}
                  height={48}
                  loading="lazy"
                  className="object-contain"
                />
              </div>
              <div>
                <CardTitle
                  id="booking-prompt-title"
                  className="text-lg font-semibold"
                >
                  Welcome to Pineapple Tours
                </CardTitle>
             
              </div>
            </div>

           
          </CardHeader>

          <CardContent className="space-y-6 pb-6">
            {/* Find a Tour Section */}
            <div className="space-y-4">
              <h3 className="text-red-600 font-semibold text-3xl">Find a Tour</h3>
              
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
            </div>

            {/* Choose a Preferred Date Section */}
            <div className="space-y-4">
             
              {/* Date Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Choose a Preferred Date
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

           
          </CardContent>
        </Card>
      </div>
    </>
  );
}
