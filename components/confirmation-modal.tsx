"use client"

import { CheckCircle, Calendar, MapPin, Users, Clock, DollarSign } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { BookingData } from "@/app/page"

interface ConfirmationModalProps {
  booking: BookingData
  onClose: () => void
}

export function ConfirmationModal({ booking, onClose }: ConfirmationModalProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <DialogTitle className="text-2xl font-bold text-green-600">
            Booking Confirmed!
          </DialogTitle>
          <DialogDescription className="text-base">
            Your tour has been successfully booked. You'll receive a confirmation email shortly.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Booking Reference */}
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Booking Reference</p>
                <p className="text-lg font-mono font-bold">{booking.session.id.toUpperCase()}</p>
              </div>
            </CardContent>
          </Card>

          {/* Tour Details */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Tour Details</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-coral-500 mt-0.5" />
                  <div>
                    <p className="font-medium">{booking.product.name}</p>
                    <p className="text-sm text-muted-foreground">Product Code: {booking.product.code}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-coral-500" />
                  <div>
                    <p className="font-medium">{formatDate(booking.session.startTime)}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatTime(booking.session.startTime)} - {formatTime(booking.session.endTime)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-coral-500" />
                  <div>
                    <p className="font-medium">{booking.participants} {booking.participants === 1 ? 'Participant' : 'Participants'}</p>
                  </div>
                </div>

                {booking.pickupLocation && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-coral-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Pickup Location</p>
                      <p className="text-sm text-muted-foreground">
                        {typeof booking.pickupLocation === 'string' 
                          ? booking.pickupLocation 
                          : booking.pickupLocation.name || 'Pickup included'
                        }
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pricing Breakdown */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Pricing Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Tour Price ({booking.participants} participants)</span>
                  <span>{formatPrice(booking.pricing.sessionPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes & Fees</span>
                  <span>{formatPrice(booking.pricing.taxAndFees)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-coral-600">{formatPrice(booking.pricing.total)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Important Information */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-3 text-blue-800">Important Information</h3>
              <div className="space-y-2 text-sm text-blue-700">
                <p>• A confirmation email has been sent to your email address</p>
                <p>• Please arrive 15 minutes before your tour start time</p>
                <p>• Free cancellation up to 24 hours before your tour</p>
                <p>• Contact us if you need to make any changes to your booking</p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={onClose}
              className="flex-1 bg-coral-500 hover:bg-coral-600"
            >
              Continue Browsing
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.print()}
              className="flex-1"
            >
              Print Confirmation
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 