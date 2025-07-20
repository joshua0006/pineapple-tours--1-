"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GuestManager, GuestInfo, PriceOptionConfig } from "@/components/ui/guest-manager";
import { RezdyPriceOption } from "@/lib/types/rezdy";
import { createPriceOptionConfigs, generateGuestInstancesFromCounts, validateGuestDistribution } from "@/lib/utils/guest-type-mapping";
import { validateBookingDataForDynamicPricing } from "@/lib/utils/dynamic-pricing-validation";
import { BookingFormData } from "@/lib/utils/booking-transform";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, CheckCircle, AlertCircle } from "lucide-react";

/**
 * Demo component showcasing dynamic pricing with all 4 priceOption patterns
 */
export function DynamicPricingDemo() {
  const [currentPattern, setCurrentPattern] = useState<'standard' | 'quantity' | 'group' | 'multi-tier'>('standard');
  const [guests, setGuests] = useState<GuestInfo[]>([]);
  const [guestCounts, setGuestCounts] = useState<Record<string, number>>({});

  // Pattern A - Standard Age Groups (Adult/Child/Infant/Senior)
  const standardPriceOptions: RezdyPriceOption[] = [
    { price: 99, label: "Adult", id: 35390817, seatsUsed: 1 },
    { price: 49.5, label: "Child", id: 35390818, seatsUsed: 1 },
    { price: 0, label: "Infant", id: 35390820, seatsUsed: 1 },
    { price: 95, label: "Senior", id: 35390819, seatsUsed: 1 }
  ];

  // Pattern B - Generic Quantity Pricing
  const quantityPriceOptions: RezdyPriceOption[] = [
    { price: 1995, label: "Quantity", id: 24626145, seatsUsed: 1 }
  ];

  // Pattern C - Multiple Quantity Tiers
  const multiTierPriceOptions: RezdyPriceOption[] = [
    { price: 400, label: "Standard", id: 46682233, seatsUsed: 1 },
    { price: 350, label: "Group Rate", id: 46682234, seatsUsed: 1 }
  ];

  // Pattern D - Group/Private Pricing
  const groupPriceOptions: RezdyPriceOption[] = [
    { price: 850, label: "Private Tour", id: 37928007, seatsUsed: 1 }
  ];

  const getCurrentPriceOptions = (): RezdyPriceOption[] => {
    switch (currentPattern) {
      case 'standard': return standardPriceOptions;
      case 'quantity': return quantityPriceOptions;
      case 'multi-tier': return multiTierPriceOptions;
      case 'group': return groupPriceOptions;
      default: return standardPriceOptions;
    }
  };

  const priceOptions = getCurrentPriceOptions();
  const configs = createPriceOptionConfigs(priceOptions);

  // Initialize guest counts when pattern changes
  React.useEffect(() => {
    const newGuestCounts: Record<string, number> = {};
    priceOptions.forEach(option => {
      newGuestCounts[option.label] = 0;
    });
    
    // Set default values
    if (currentPattern === 'standard') {
      newGuestCounts['Adult'] = 2;
      newGuestCounts['Child'] = 1;
    } else if (currentPattern === 'quantity') {
      newGuestCounts['Quantity'] = 3;
    } else if (currentPattern === 'multi-tier') {
      newGuestCounts['Standard'] = 2;
      newGuestCounts['Group Rate'] = 1;
    } else if (currentPattern === 'group') {
      newGuestCounts['Private Tour'] = 1;
    }
    
    setGuestCounts(newGuestCounts);
    
    // Generate guests
    const generatedGuests = generateGuestInstancesFromCounts(newGuestCounts, configs);
    setGuests(generatedGuests);
  }, [currentPattern]);

  // Validation
  const mockProduct = {
    productCode: 'DEMO-001',
    name: 'Demo Product',
    priceOptions,
    quantityRequiredMin: 1,
    quantityRequiredMax: 10
  };

  const validation = validateGuestDistribution(guestCounts, priceOptions, {
    min: mockProduct.quantityRequiredMin,
    max: mockProduct.quantityRequiredMax
  });

  const mockBookingData: BookingFormData = {
    product: { code: 'DEMO-001', name: 'Demo Product' },
    session: { id: 'demo-session', startTime: new Date().toISOString(), endTime: new Date().toISOString() },
    guests,
    contact: { firstName: 'John', lastName: 'Doe', email: 'john@example.com', phone: '123-456-7890' },
    pricing: { basePrice: 0, sessionPrice: 0, subtotal: 0, taxAndFees: 0, total: 0 },
    guestCounts
  };

  const bookingValidation = validateBookingDataForDynamicPricing(mockBookingData, mockProduct as any);

  const calculateTotal = () => {
    return Object.entries(guestCounts).reduce((total, [label, count]) => {
      const option = priceOptions.find(opt => opt.label === label);
      return total + (option ? option.price * count : 0);
    }, 0);
  };

  const updateGuestCount = (label: string, delta: number) => {
    setGuestCounts(prev => {
      const newCounts = { ...prev };
      newCounts[label] = Math.max(0, (prev[label] || 0) + delta);
      return newCounts;
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Dynamic Pricing Demo</h1>
        <p className="text-muted-foreground">
          Demonstration of dynamic guest details based on Rezdy priceOptions patterns
        </p>
      </div>

      {/* Pattern Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Price Option Pattern</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant={currentPattern === 'standard' ? 'default' : 'outline'}
              onClick={() => setCurrentPattern('standard')}
              className="h-auto p-4 flex flex-col items-start"
            >
              <div className="font-semibold">Pattern A</div>
              <div className="text-sm text-left">Standard Age Groups</div>
              <div className="text-xs text-muted-foreground">Adult/Child/Infant/Senior</div>
            </Button>
            
            <Button
              variant={currentPattern === 'quantity' ? 'default' : 'outline'}
              onClick={() => setCurrentPattern('quantity')}
              className="h-auto p-4 flex flex-col items-start"
            >
              <div className="font-semibold">Pattern B</div>
              <div className="text-sm text-left">Generic Quantity</div>
              <div className="text-xs text-muted-foreground">Per person pricing</div>
            </Button>
            
            <Button
              variant={currentPattern === 'multi-tier' ? 'default' : 'outline'}
              onClick={() => setCurrentPattern('multi-tier')}
              className="h-auto p-4 flex flex-col items-start"
            >
              <div className="font-semibold">Pattern C</div>
              <div className="text-sm text-left">Multiple Tiers</div>
              <div className="text-xs text-muted-foreground">Different price levels</div>
            </Button>
            
            <Button
              variant={currentPattern === 'group' ? 'default' : 'outline'}
              onClick={() => setCurrentPattern('group')}
              className="h-auto p-4 flex flex-col items-start"
            >
              <div className="font-semibold">Pattern D</div>
              <div className="text-sm text-left">Group/Private</div>
              <div className="text-xs text-muted-foreground">Fixed group pricing</div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Price Options */}
      <Card>
        <CardHeader>
          <CardTitle>Price Options for Current Pattern</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {priceOptions.map(option => (
              <div key={option.id} className="p-4 border rounded-lg">
                <div className="font-semibold">{option.label}</div>
                <div className="text-lg text-green-600">${option.price}</div>
                <div className="text-sm text-muted-foreground">
                  Seats used: {option.seatsUsed}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateGuestCount(option.label, -1)}
                    disabled={(guestCounts[option.label] || 0) <= 0}
                  >
                    -
                  </Button>
                  <span className="w-8 text-center font-medium">
                    {guestCounts[option.label] || 0}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateGuestCount(option.label, 1)}
                  >
                    +
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <div className="text-lg font-semibold">
              Total: ${calculateTotal().toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground">
              Total guests: {Object.values(guestCounts).reduce((sum, count) => sum + count, 0)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validation Results */}
      <Card>
        <CardHeader>
          <CardTitle>Validation Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {validation.isValid ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Guest count validation passed
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside">
                  {validation.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {bookingValidation.warnings.length > 0 && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium mb-1">Warnings:</div>
                <ul className="list-disc list-inside">
                  {bookingValidation.warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {bookingValidation.suggestions.length > 0 && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium mb-1">Suggestions:</div>
                <ul className="list-disc list-inside">
                  {bookingValidation.suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Guest Manager */}
      <Card>
        <CardHeader>
          <CardTitle>Dynamic Guest Management</CardTitle>
          <p className="text-muted-foreground">
            Guest details automatically adapt to the selected price options
          </p>
        </CardHeader>
        <CardContent>
          <GuestManager
            guests={guests}
            onGuestsChange={setGuests}
            priceOptionConfigs={configs}
            enableDynamicTypes={true}
            autoManageGuests={false}
            customValidation={(guestList) => {
              const errors: string[] = [];
              
              // Check that guest counts match expected counts
              Object.entries(guestCounts).forEach(([optionLabel, expectedCount]) => {
                const actualCount = guestList.filter(g => g.priceOptionLabel === optionLabel).length;
                if (actualCount !== expectedCount) {
                  errors.push(`Expected ${expectedCount} guests for ${optionLabel}, but found ${actualCount}`);
                }
              });
              
              return errors;
            }}
          />
        </CardContent>
      </Card>

      {/* Pattern Information */}
      <Card>
        <CardHeader>
          <CardTitle>Current Pattern Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currentPattern === 'standard' && (
              <div>
                <h4 className="font-semibold">Pattern A: Standard Age Groups</h4>
                <p className="text-sm text-muted-foreground">
                  This is the most common pattern with separate pricing for adults, children, infants, and seniors.
                  Each guest type has specific age ranges and validation rules.
                </p>
                <ul className="text-sm mt-2 space-y-1">
                  <li>• Adult (18+): $99</li>
                  <li>• Child (3-17): $49.50</li>
                  <li>• Infant (0-2): Free</li>
                  <li>• Senior (65+): $95</li>
                </ul>
              </div>
            )}
            
            {currentPattern === 'quantity' && (
              <div>
                <h4 className="font-semibold">Pattern B: Generic Quantity Pricing</h4>
                <p className="text-sm text-muted-foreground">
                  Simple per-person pricing without age-based distinctions. Common for activities where
                  age doesn't affect the experience or cost.
                </p>
                <ul className="text-sm mt-2 space-y-1">
                  <li>• Per person: $1,995</li>
                </ul>
              </div>
            )}
            
            {currentPattern === 'multi-tier' && (
              <div>
                <h4 className="font-semibold">Pattern C: Multiple Quantity Tiers</h4>
                <p className="text-sm text-muted-foreground">
                  Different pricing tiers based on service level, group size, or booking conditions.
                  Allows for flexible pricing strategies.
                </p>
                <ul className="text-sm mt-2 space-y-1">
                  <li>• Standard rate: $400</li>
                  <li>• Group rate: $350 (discounted)</li>
                </ul>
              </div>
            )}
            
            {currentPattern === 'group' && (
              <div>
                <h4 className="font-semibold">Pattern D: Group/Private Pricing</h4>
                <p className="text-sm text-muted-foreground">
                  Fixed pricing for entire groups or private experiences. Often used for exclusive
                  tours or experiences with a set price regardless of group size.
                </p>
                <ul className="text-sm mt-2 space-y-1">
                  <li>• Private tour: $850 (total price)</li>
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}