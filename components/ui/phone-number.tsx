"use client";

import { useState } from "react";
import { Phone, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { formatPhoneNumber, getCallablePhoneNumber } from "@/lib/utils/phone";

interface PhoneNumberProps {
  phoneNumber: string;
  variant?: "desktop" | "mobile";
  className?: string;
  showIcon?: boolean;
  showCopyIcon?: boolean;
  enableCall?: boolean;
}

export function PhoneNumber({
  phoneNumber,
  variant = "desktop",
  className,
  showIcon = true,
  showCopyIcon = true,
  enableCall = true,
}: PhoneNumberProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const formattedNumber = formatPhoneNumber(phoneNumber);
  const callableNumber = getCallablePhoneNumber(phoneNumber);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(phoneNumber);
      setCopied(true);
      toast({
        title: "Phone number copied!",
        description: `${phoneNumber} has been copied to your clipboard.`,
      });

      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try copying the number manually.",
        variant: "destructive",
      });
    }
  };

  if (variant === "desktop") {
    return (
      <button
        onClick={copyToClipboard}
        className={cn(
          "flex items-center gap-2.5 px-3 py-2 bg-accent/30 rounded-lg border border-border/50 hover:bg-accent/50 transition-all duration-200 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2",
          className
        )}
        title="Click to copy phone number"
      >
        {showIcon && (
          <Phone
            className="h-4 w-4 text-primary animate-pulse"
            aria-hidden="true"
          />
        )}
        <span className="font-semibold text-sm tracking-wide">
          {formattedNumber}
        </span>
        {showCopyIcon && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {copied ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <Copy className="h-3 w-3 text-muted-foreground" />
            )}
          </div>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={copyToClipboard}
      className={cn(
        "flex items-center gap-3 p-4 bg-background/50 rounded-xl border hover:bg-accent/50 transition-all duration-200 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 w-full",
        className
      )}
      title="Click to copy phone number"
    >
      {showIcon && (
        <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
          <Phone className="h-5 w-5 text-primary" aria-hidden="true" />
        </div>
      )}
      <div className="flex-1 min-w-0 text-left">
        <p className="text-sm font-semibold text-foreground">Call us anytime</p>
        <p className="text-sm text-muted-foreground truncate">
          {formattedNumber}
        </p>
        {enableCall && (
          <a
            href={`tel:${callableNumber}`}
            className="text-xs text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            Tap to call
          </a>
        )}
      </div>
      {showCopyIcon && (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      )}
    </button>
  );
}
