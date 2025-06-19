import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  generateBookingUrl,
  bookingButtonDefaults,
} from "@/lib/utils/booking-utils";
import { cn } from "@/lib/utils";

interface BookNowButtonProps {
  productCode: string;
  className?: string;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "ghost";
  children?: React.ReactNode;
  bookingParams?: {
    adults?: number;
    children?: number;
    infants?: number;
    sessionId?: string;
    extras?: any[];
  };
  disabled?: boolean;
}

export function BookNowButton({
  productCode,
  className,
  size = "default",
  variant = "default",
  children,
  bookingParams,
  disabled = false,
}: BookNowButtonProps) {
  const bookingUrl = generateBookingUrl(productCode, bookingParams);

  if (disabled) {
    return (
      <Button
        disabled
        size={size}
        variant={variant}
        className={cn(bookingButtonDefaults.className, className)}
      >
        {children || bookingButtonDefaults.text}
      </Button>
    );
  }

  return (
    <Link href={bookingUrl}>
      <Button
        size={size}
        variant={variant}
        className={cn(
          variant === "default" ? bookingButtonDefaults.className : "",
          className
        )}
      >
        {children || bookingButtonDefaults.text}
      </Button>
    </Link>
  );
}
