"use client";

import React from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Users,
  Mail,
  Phone,
  Calendar,
  Info,
  UserCheck,
  Edit3,
  Clock,
  Trash2,
} from "lucide-react";
import {
  StoredGuestDetails,
  GuestDetailsReusePopupProps,
} from "@/lib/types/guest-details";

interface GuestDetailsReusePopupExtendedProps extends Omit<GuestDetailsReusePopupProps, 'onUseStoredDetails'> {
  onUseStoredDetails: () => void;
  onClearStoredDetails?: () => void;
}

export function GuestDetailsReusePopup({
  isOpen,
  onClose,
  onUseStoredDetails,
  onEnterNewDetails,
  onClearStoredDetails,
  storedDetails,
}: GuestDetailsReusePopupExtendedProps) {
  if (!storedDetails) return null;

  const { contact, guests, metadata } = storedDetails;
  const storedDate = new Date(metadata.timestamp);
  const daysSinceStored = Math.floor((Date.now() - metadata.timestamp) / (24 * 60 * 60 * 1000));

  const handleUseStoredDetails = () => {
    onUseStoredDetails();
    onClose();
  };

  const handleEnterNewDetails = () => {
    onEnterNewDetails();
    onClose();
  };

  const handleClearAndContinue = () => {
    if (onClearStoredDetails) {
      onClearStoredDetails();
    }
    onEnterNewDetails();
    onClose();
  };

  // Group guests by type for display
  const guestSummary = guests.reduce((acc, guest) => {
    const type = guest.type.toLowerCase();
    if (!acc[type]) acc[type] = 0;
    acc[type]++;
    return acc;
  }, {} as Record<string, number>);

  const formatGuestType = (type: string): string => {
    switch (type) {
      case 'adult': return 'Adult';
      case 'child': return 'Child';
      case 'infant': return 'Infant';
      case 'senior': return 'Senior';
      case 'student': return 'Student';
      default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-4 sm:mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-brand-accent" />
            Use Previous Guest Details?
          </DialogTitle>
          <DialogDescription>
            We found guest details from your recent booking. Would you like to use them again?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Stored Guest Details Summary */}
          <Card className="bg-muted/30">
            <CardContent className="pt-4 space-y-3">
              {/* Contact Information */}
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Contact Information</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {contact.firstName} {contact.lastName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{contact.email}</span>
                  </div>
                  {contact.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{contact.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Guest Count Summary */}
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">
                  Guests ({metadata.guestCount} total)
                </h4>
                <div className="text-sm space-y-1">
                  {Object.entries(guestSummary).map(([type, count]) => (
                    <div key={type} className="flex justify-between">
                      <span>{formatGuestType(type)}s:</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Metadata */}
              <div className="pt-2 border-t text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  <span>
                    Last used {daysSinceStored === 0 ? 'today' : `${daysSinceStored} day${daysSinceStored === 1 ? '' : 's'} ago`}
                    {metadata.lastProductName && (
                      <span className="ml-1">for {metadata.lastProductName}</span>
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Warning for old data */}
          {daysSinceStored > 7 && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm">
                These details are {daysSinceStored} days old. Please verify they're still accurate before using.
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Primary Action: Use Stored Details */}
            <Button
              onClick={handleUseStoredDetails}
              className="w-full flex items-center gap-2 bg-brand-accent hover:bg-brand-accent/90"
            >
              <UserCheck className="h-4 w-4" />
              Use These Details
            </Button>

            {/* Secondary Action: Enter New Details */}
            <Button
              onClick={handleEnterNewDetails}
              variant="outline"
              className="w-full flex items-center gap-2"
            >
              <Edit3 className="h-4 w-4" />
              Enter New Details
            </Button>

            {/* Tertiary Action: Clear and Continue */}
            {onClearStoredDetails && (
              <Button
                onClick={handleClearAndContinue}
                variant="ghost"
                size="sm"
                className="w-full flex items-center gap-2 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
                Clear Saved Details & Continue
              </Button>
            )}
          </div>

          {/* Privacy Notice */}
          <div className="text-xs text-muted-foreground bg-muted/20 p-3 rounded-lg">
            <Info className="h-3 w-3 inline mr-1" />
            Your details are stored locally on your device and will be automatically removed after 30 days.
            We do not store this information on our servers.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Simplified version for cases where we just need a quick yes/no
 */
export function QuickGuestDetailsReuseDialog({
  isOpen,
  onClose,
  onConfirm,
  onCancel,
  guestCount,
  contactName,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  guestCount: number;
  contactName: string;
}) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleCancel = () => {
    onCancel();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-4 sm:mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center">Use Previous Details?</DialogTitle>
          <DialogDescription className="text-center">
            Use the same guest details as your last booking?
            <div className="mt-2 font-medium text-foreground">
              {contactName} + {guestCount} guest{guestCount === 1 ? '' : 's'}
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-3 mt-4">
          <Button
            onClick={handleConfirm}
            className="flex-1 bg-brand-accent hover:bg-brand-accent/90"
          >
            Yes, Use Same Details
          </Button>
          <Button
            onClick={handleCancel}
            variant="outline"
            className="flex-1"
          >
            Enter New Details
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}