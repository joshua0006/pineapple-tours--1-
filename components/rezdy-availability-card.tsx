import { RezdySession, RezdyAddress } from "@/lib/types/rezdy";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users, DollarSign, MapPin } from "lucide-react";
import { format } from "date-fns";

interface RezdyAvailabilityCardProps {
  session: RezdySession;
  productName?: string;
  onBookSession?: (session: RezdySession) => void;
}

// Helper function to format address
const formatAddress = (address: string | RezdyAddress | undefined): string => {
  if (!address) return "";

  if (typeof address === "string") {
    return address;
  }

  // Handle address object
  const parts = [];
  if (address.addressLine) parts.push(address.addressLine);
  if (address.city) parts.push(address.city);
  if (address.state) parts.push(address.state);
  if (address.postCode) parts.push(address.postCode);

  return parts.join(", ");
};

export function RezdyAvailabilityCard({
  session,
  productName,
  onBookSession,
}: RezdyAvailabilityCardProps) {
  const startDate = new Date(session.startTimeLocal);
  const endDate = new Date(session.endTimeLocal);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {productName && (
              <CardTitle className="text-base font-medium text-muted-foreground mb-1">
                {productName}
              </CardTitle>
            )}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {format(startDate, "MMM dd, yyyy")}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  {format(startDate, "HH:mm")} - {format(endDate, "HH:mm")}
                </span>
              </div>
            </div>
          </div>

          {session.totalPrice && (
            <div className="flex items-center text-lg font-bold text-primary ml-2">
              <DollarSign className="h-4 w-4" />
              {session.totalPrice}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{session.seatsAvailable} seats available</span>
          </div>

          <Badge
            variant={session.seatsAvailable > 0 ? "default" : "destructive"}
            className="text-xs"
          >
            {session.seatsAvailable > 0 ? "Available" : "Sold Out"}
          </Badge>
        </div>

        {session.pickupLocations && session.pickupLocations.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-sm font-medium">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>Pickup Locations:</span>
            </div>
            <div className="space-y-1">
              {session.pickupLocations.map((pickup) => {
                const formattedAddress = formatAddress(pickup.address);
                return (
                  <div
                    key={pickup.id}
                    className="text-sm text-muted-foreground pl-5"
                  >
                    <div className="font-medium">{pickup.name}</div>
                    {formattedAddress && (
                      <div className="text-xs">{formattedAddress}</div>
                    )}
                    {pickup.pickupTime && (
                      <div className="text-xs">Pickup: {pickup.pickupTime}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-muted-foreground">
            Session ID: {session.id}
          </div>

          {session.seatsAvailable > 0 && onBookSession && (
            <Button
              size="sm"
              onClick={() => onBookSession(session)}
              className="ml-auto"
            >
              Book Now
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
