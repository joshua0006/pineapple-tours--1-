"use client";

import { useState, useMemo } from "react";
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

// Enhanced guest interface that supports dynamic price options
export interface GuestInfo {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  type: "ADULT" | "CHILD" | "INFANT" | "SENIOR" | "STUDENT" | "CONCESSION" | "FAMILY" | "GROUP" | "QUANTITY" | "CUSTOM";
  priceOptionId?: number;
  priceOptionLabel?: string;
  specialRequests?: string;
  // Additional fields for enhanced bookings
  certificationLevel?: string;
  certificationNumber?: string;
  certificationAgency?: string;
  barcode?: string;
  customFieldValues?: Record<string, string>;
}

// Type for dynamic guest type mapping based on price options
export interface GuestTypeMapping {
  priceOptionId: number;
  priceOptionLabel: string;
  guestType: GuestInfo['type'];
  defaultAge: number;
  ageRange?: { min: number; max: number };
  requiresCertification?: boolean;
  customFields?: string[];
  description?: string;
}

// Interface for price option configuration
export interface PriceOptionConfig {
  id: number;
  label: string;
  price: number;
  seatsUsed: number;
  mappedGuestType: GuestInfo['type'];
  description?: string;
  ageRange?: { min: number; max: number };
  requiresCertification?: boolean;
  customValidation?: (guest: GuestInfo) => string | null;
}

interface GuestManagerProps {
  guests: GuestInfo[];
  onGuestsChange: (guests: GuestInfo[]) => void;
  maxGuests?: number;
  minGuests?: number;
  requireAdult?: boolean;
  autoManageGuests?: boolean;
  className?: string;
  // Enhanced props for dynamic pricing support
  priceOptionConfigs?: PriceOptionConfig[];
  guestCounts?: Record<string, number>;
  enableDynamicTypes?: boolean;
  customValidation?: (guests: GuestInfo[]) => string[];
}


export function GuestManager({
  guests,
  onGuestsChange,
  maxGuests = 10,
  minGuests = 1,
  requireAdult = true,
  autoManageGuests = false,
  className = "",
  priceOptionConfigs = [],
  guestCounts = {},
  enableDynamicTypes = false,
  customValidation,
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

    // Enhanced adult requirement validation
    const adults = guestList.filter((g) => 
      g.type === "ADULT" || g.type === "SENIOR" || g.type === "STUDENT" || g.type === "CONCESSION"
    ).length;
    const hasMinors = guestList.some(
      (g) => g.type === "CHILD" || g.type === "INFANT"
    );

    if (requireAdult && adults === 0 && hasMinors) {
      validationErrors.push(
        "At least one adult is required when booking for children or infants"
      );
    }

    // Basic field completion validation
    const incompleteGuests = guestList.filter(
      (g) => !g.firstName.trim() || !g.lastName.trim()
    );
    if (incompleteGuests.length > 0) {
      validationErrors.push(`Please complete information for all guests`);
    }

    // Price option specific validation
    if (priceOptionConfigs && enableDynamicTypes) {
      guestList.forEach((guest, index) => {
        const config = priceOptionConfigs.find(c => c.id === guest.priceOptionId);
        if (config) {
          // Age range validation
          if (config.ageRange) {
            if (guest.age < config.ageRange.min || guest.age > config.ageRange.max) {
              validationErrors.push(
                `Guest ${index + 1}: Age must be between ${config.ageRange.min} and ${config.ageRange.max} for ${config.label}`
              );
            }
          }
          
          // Certification validation
          if (config.requiresCertification && !guest.certificationLevel) {
            validationErrors.push(
              `Guest ${index + 1}: Certification is required for ${config.label}`
            );
          }
          
          // Custom validation
          if (config.customValidation) {
            const customError = config.customValidation(guest);
            if (customError) {
              validationErrors.push(`Guest ${index + 1}: ${customError}`);
            }
          }
        }
      });
    }

    // Run custom validation if provided
    if (customValidation) {
      const customErrors = customValidation(guestList);
      validationErrors.push(...customErrors);
    }

    return validationErrors;
  };

  const addGuest = (guestType?: GuestInfo['type'], priceOptionConfig?: PriceOptionConfig) => {
    if (guests.length >= maxGuests) return;

    // Only allow adding guests for single seat price options (seatsUsed = 1)
    if (priceOptionConfig && priceOptionConfig.seatsUsed > 1) {
      console.warn("Cannot add individual guests to multi-seat price options");
      return;
    }

    // Determine guest type based on price option config or default
    const finalGuestType = guestType || priceOptionConfig?.mappedGuestType || "ADULT";
    const defaultAge = priceOptionConfig?.ageRange?.min || 
                      (finalGuestType === "CHILD" ? 10 : 
                       finalGuestType === "INFANT" ? 1 : 
                       finalGuestType === "SENIOR" ? 65 : 25);

    const newGuest: GuestInfo = {
      id: Date.now().toString(),
      firstName: "",
      lastName: "",
      age: defaultAge,
      type: finalGuestType,
      priceOptionId: priceOptionConfig?.id,
      priceOptionLabel: priceOptionConfig?.label,
      customFieldValues: {},
    };

    const updatedGuests = [...guests, newGuest];
    onGuestsChange(updatedGuests);
    setErrors(validateGuests(updatedGuests));
  };

  const removeGuest = (id: string) => {
    if (guests.length <= minGuests) return;

    const guestToRemove = guests.find(g => g.id === id);
    if (guestToRemove) {
      const config = priceOptionConfigs.find(c => c.id === guestToRemove.priceOptionId);
      
      // Only allow removing guests from single seat price options (seatsUsed = 1)
      if (config && config.seatsUsed > 1) {
        console.warn("Cannot remove individual guests from multi-seat price options");
        return;
      }
      
      // For single seat options, ensure we don't remove the last guest of that type if there's only one
      const guestsOfSameType = guests.filter(g => g.priceOptionId === guestToRemove.priceOptionId);
      if (guestsOfSameType.length <= 1) {
        console.warn("Cannot remove the last guest of this type");
        return;
      }
    }

    const updatedGuests = guests.filter((guest) => guest.id !== id);
    onGuestsChange(updatedGuests);
    setErrors(validateGuests(updatedGuests));
  };

  const updateGuest = (id: string, updates: Partial<GuestInfo>) => {
    const updatedGuests = guests.map((guest) => {
      if (guest.id === id) {
        const updatedGuest = { ...guest, ...updates };
        
        // Auto-update age and certification requirements when price option changes
        if (updates.priceOptionId && priceOptionConfigs.length > 0) {
          const config = priceOptionConfigs.find(c => c.id === updates.priceOptionId);
          if (config) {
            updatedGuest.priceOptionLabel = config.label;
            updatedGuest.type = config.mappedGuestType;
            
            // Set default age if within range
            if (config.ageRange && (updatedGuest.age < config.ageRange.min || updatedGuest.age > config.ageRange.max)) {
              updatedGuest.age = config.ageRange.min;
            }
          }
        }

        return updatedGuest;
      }
      return guest;
    });

    onGuestsChange(updatedGuests);
    setErrors(validateGuests(updatedGuests));
  };


  // Group guests by seatsUsed to determine display type
  const groupedGuests = useMemo(() => {
    const singleSeatGuests: GuestInfo[] = [];
    const multiSeatGroups: { [key: number]: GuestInfo[] } = {};
    
    guests.forEach(guest => {
      const config = priceOptionConfigs.find(c => c.id === guest.priceOptionId);
      const seatsUsed = config?.seatsUsed || 1;
      
      if (seatsUsed === 1) {
        singleSeatGuests.push(guest);
      } else {
        if (!multiSeatGroups[config!.id]) {
          multiSeatGroups[config!.id] = [];
        }
        multiSeatGroups[config!.id].push(guest);
      }
    });
    
    return { singleSeatGuests, multiSeatGroups };
  }, [guests, priceOptionConfigs]);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Guest Information</h3>
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

      <div className="space-y-6">
        {/* Single Seat Guests (seatsUsed = 1) with +/- controls */}
        {groupedGuests.singleSeatGuests.length > 0 && (
          <div className="space-y-4">
            {groupedGuests.singleSeatGuests.map((guest, index) => {
              const config = priceOptionConfigs.find(c => c.id === guest.priceOptionId);
              const guestsOfSameType = groupedGuests.singleSeatGuests.filter(g => g.priceOptionId === guest.priceOptionId);
              const isFirstOfType = guestsOfSameType[0].id === guest.id;
              
              return (
                <Card key={guest.id} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-coral-500" />
                      <span className="font-medium">
                        Guest #{index + 1}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {!autoManageGuests && config && isFirstOfType && (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addGuest(config.mappedGuestType, config)}
                            className="flex items-center gap-1 h-8 px-2"
                            title={`Add another ${config.label}`}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          {guestsOfSameType.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeGuest(guest.id)}
                              className="flex items-center gap-1 h-8 px-2 text-red-500 hover:text-red-700"
                              title={`Remove ${config.label}`}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                          )}
                        </>
                      )}
                    </div>
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
                  
                  {/* Certification fields for guests that require it */}
                  {priceOptionConfigs?.find(c => c.id === guest.priceOptionId)?.requiresCertification && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Certification Required</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <Label htmlFor={`certLevel-${guest.id}`}>Level *</Label>
                          <Input
                            id={`certLevel-${guest.id}`}
                            value={guest.certificationLevel || ""}
                            onChange={(e) =>
                              updateGuest(guest.id, { certificationLevel: e.target.value })
                            }
                            placeholder="e.g., Open Water"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor={`certNumber-${guest.id}`}>Number *</Label>
                          <Input
                            id={`certNumber-${guest.id}`}
                            value={guest.certificationNumber || ""}
                            onChange={(e) =>
                              updateGuest(guest.id, { certificationNumber: e.target.value })
                            }
                            placeholder="Certification number"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor={`certAgency-${guest.id}`}>Agency *</Label>
                          <Input
                            id={`certAgency-${guest.id}`}
                            value={guest.certificationAgency || ""}
                            onChange={(e) =>
                              updateGuest(guest.id, { certificationAgency: e.target.value })
                            }
                            placeholder="e.g., PADI, SSI"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {/* Multi-Seat Groups (seatsUsed > 1) without +/- controls */}
        {Object.entries(groupedGuests.multiSeatGroups).map(([configId, groupGuests]) => {
          const config = priceOptionConfigs.find(c => c.id === parseInt(configId));
          if (!config || groupGuests.length === 0) return null;
          
          return (
            <div key={configId} className="space-y-4">
              <h4 className="text-md font-medium text-muted-foreground">
                {config.label} (Group Package - {config.seatsUsed} seats)
              </h4>
              <Card className="p-4 border-2 border-dashed border-muted-foreground/30 hover:border-muted-foreground/50 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-coral-500" />
                    <span className="font-medium">{config.label}</span>
                    <span className="text-sm text-muted-foreground">({groupGuests.length} guests)</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {groupGuests.map((guest, guestIndex) => (
                    <div key={guest.id} className="border rounded-lg p-3 bg-muted/20">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                      
                      {/* Certification fields for group guests that require it */}
                      {config.requiresCertification && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <h5 className="font-medium text-blue-900 mb-2 text-sm">Certification Required</h5>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <Label htmlFor={`certLevel-${guest.id}`}>Level *</Label>
                              <Input
                                id={`certLevel-${guest.id}`}
                                value={guest.certificationLevel || ""}
                                onChange={(e) =>
                                  updateGuest(guest.id, { certificationLevel: e.target.value })
                                }
                                placeholder="e.g., Open Water"
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor={`certNumber-${guest.id}`}>Number *</Label>
                              <Input
                                id={`certNumber-${guest.id}`}
                                value={guest.certificationNumber || ""}
                                onChange={(e) =>
                                  updateGuest(guest.id, { certificationNumber: e.target.value })
                                }
                                placeholder="Certification number"
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor={`certAgency-${guest.id}`}>Agency *</Label>
                              <Input
                                id={`certAgency-${guest.id}`}
                                value={guest.certificationAgency || ""}
                                onChange={(e) =>
                                  updateGuest(guest.id, { certificationAgency: e.target.value })
                                }
                                placeholder="e.g., PADI, SSI"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Guest Summary */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-center">
              <div className="text-sm font-medium">
                Total: {guests.length} {guests.length === 1 ? "guest" : "guests"}
              </div>
            </div>
            
            {/* Show breakdown by price option if dynamic types enabled */}
            {enableDynamicTypes && priceOptionConfigs.length > 0 && (
              <div className="text-xs text-muted-foreground">
                {priceOptionConfigs.map(config => {
                  const count = guests.filter(g => g.priceOptionId === config.id).length;
                  if (count === 0) return null;
                  return (
                    <div key={config.id} className="flex justify-between">
                      <span>{config.label}:</span>
                      <span>{count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
