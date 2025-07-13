"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Minus,
  UserCheck,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export interface GuestInfo {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  type: "ADULT" | "CHILD" | "INFANT";
  specialRequests?: string;
}

interface GuestManagerProps {
  guests: GuestInfo[];
  onGuestsChange: (guests: GuestInfo[]) => void;
  maxGuests?: number;
  minGuests?: number;
  requireAdult?: boolean;
  autoManageGuests?: boolean;
  className?: string;
}


export function GuestManager({
  guests,
  onGuestsChange,
  maxGuests = 10,
  minGuests = 1,
  requireAdult = true,
  autoManageGuests = false,
  className = "",
}: GuestManagerProps) {
  const [errors, setErrors] = useState<string[]>([]);

  const validateGuests = (guestList: GuestInfo[]): string[] => {
    const validationErrors: string[] = [];

    if (guestList.length < minGuests) {
      validationErrors.push(
        `At least ${minGuests} guest${minGuests > 1 ? "s" : ""} required`
      );
    }

    if (guestList.length > maxGuests) {
      validationErrors.push(`Maximum ${maxGuests} guests allowed`);
    }

    const adults = guestList.filter((g) => g.type === "ADULT").length;
    const hasMinors = guestList.some(
      (g) => g.type === "CHILD" || g.type === "INFANT"
    );

    if (requireAdult && adults === 0 && hasMinors) {
      validationErrors.push(
        "At least one adult is required when booking for children or infants"
      );
    }

    const incompleteGuests = guestList.filter(
      (g) => !g.firstName.trim() || !g.lastName.trim()
    );
    if (incompleteGuests.length > 0) {
      validationErrors.push(`Please complete information for all guests`);
    }

    return validationErrors;
  };

  const addGuest = () => {
    if (guests.length >= maxGuests) return;

    const newGuest: GuestInfo = {
      id: Date.now().toString(),
      firstName: "",
      lastName: "",
      age: 25,
      type: "ADULT",
    };

    const updatedGuests = [...guests, newGuest];
    onGuestsChange(updatedGuests);
    setErrors(validateGuests(updatedGuests));
  };

  const removeGuest = (id: string) => {
    if (guests.length <= minGuests) return;

    const updatedGuests = guests.filter((guest) => guest.id !== id);
    onGuestsChange(updatedGuests);
    setErrors(validateGuests(updatedGuests));
  };

  const updateGuest = (id: string, updates: Partial<GuestInfo>) => {
    const updatedGuests = guests.map((guest) => {
      if (guest.id === id) {
        const updatedGuest = { ...guest, ...updates };


        return updatedGuest;
      }
      return guest;
    });

    onGuestsChange(updatedGuests);
    setErrors(validateGuests(updatedGuests));
  };


  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Guest Information</h3>
        <div className="flex items-center gap-2">
          {!autoManageGuests && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addGuest}
              disabled={guests.length >= maxGuests}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Guest
            </Button>
          )}
        </div>
      </div>

      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {guests.map((guest, index) => (
          <Card key={guest.id} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-coral-500" />
                <span className="font-medium">Guest {index + 1}</span>
              </div>
              {!autoManageGuests && guests.length > minGuests && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeGuest(guest.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Minus className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`firstName-${guest.id}`}>First Name *</Label>
                <Input
                  id={`firstName-${guest.id}`}
                  value={guest.firstName}
                  onChange={(e) =>
                    updateGuest(guest.id, { firstName: e.target.value })
                  }
                  placeholder="Enter first name"
                  required
                  className={!guest.firstName.trim() ? "border-red-300" : ""}
                />
              </div>
              <div>
                <Label htmlFor={`lastName-${guest.id}`}>Last Name *</Label>
                <Input
                  id={`lastName-${guest.id}`}
                  value={guest.lastName}
                  onChange={(e) =>
                    updateGuest(guest.id, { lastName: e.target.value })
                  }
                  placeholder="Enter last name"
                  required
                  className={!guest.lastName.trim() ? "border-red-300" : ""}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Guest Summary */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-center">
            <div className="text-sm font-medium">
              Total: {guests.length} {guests.length === 1 ? "guest" : "guests"}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
