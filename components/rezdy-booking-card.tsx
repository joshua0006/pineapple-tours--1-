import { RezdyBooking } from '@/lib/types/rezdy';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Phone, Calendar, DollarSign, Users } from 'lucide-react';
import { format, isValid } from 'date-fns';

interface RezdyBookingCardProps {
  booking: RezdyBooking;
  onViewDetails?: (booking: RezdyBooking) => void;
}

// Helper function to safely format dates
const formatSafeDate = (dateString: string | undefined | null, formatString: string): string => {
  if (!dateString) return 'Invalid date';
  
  const date = new Date(dateString);
  if (!isValid(date)) return 'Invalid date';
  
  return format(date, formatString);
};

export function RezdyBookingCard({ booking, onViewDetails }: RezdyBookingCardProps) {
  const createdDate = booking.createdDate ? new Date(booking.createdDate) : null;
  const modifiedDate = booking.modifiedDate ? new Date(booking.modifiedDate) : null;

  const getStatusVariant = (status?: string) => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED':
        return 'default';
      case 'CANCELLED':
        return 'destructive';
      case 'PENDING':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onViewDetails?.(booking)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold">
              {booking.orderNumber ? `Order #${booking.orderNumber}` : 'Booking'}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              {booking.status && (
                <Badge variant={getStatusVariant(booking.status)} className="text-xs">
                  {booking.status}
                </Badge>
              )}
              {createdDate && isValid(createdDate) && (
                <span className="text-sm text-muted-foreground">
                  {format(createdDate, 'MMM dd, yyyy')}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center text-lg font-bold text-primary ml-2">
            <DollarSign className="h-4 w-4" />
            {booking.totalAmount}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Customer Information */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-1">
            <User className="h-4 w-4" />
            Customer Details
          </h4>
          <div className="space-y-1 text-sm text-muted-foreground pl-5">
            <div className="font-medium">
              {booking.customer.firstName} {booking.customer.lastName}
            </div>
            {booking.customer.email && (
              <div className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {booking.customer.email}
              </div>
            )}
            {booking.customer.phone && (
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {booking.customer.phone}
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Booking Items */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Booking Items</h4>
          <div className="space-y-3">
            {booking.items.map((item, index) => {
              const totalParticipants = item.participants.reduce((sum, p) => sum + p.number, 0);
              
              return (
                <div key={index} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{item.productCode}</div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatSafeDate(item.startTimeLocal, 'MMM dd, yyyy HH:mm')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {totalParticipants} participants
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-medium">
                      ${item.amount}
                    </div>
                  </div>
                  
                  {/* Participants breakdown */}
                  <div className="flex flex-wrap gap-2">
                    {item.participants.map((participant, pIndex) => (
                      <Badge key={pIndex} variant="outline" className="text-xs">
                        {participant.type}: {participant.number}
                      </Badge>
                    ))}
                  </div>
                  
                  {item.pickupId && (
                    <div className="text-xs text-muted-foreground">
                      Pickup ID: {item.pickupId}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Information */}
        {booking.paymentOption && (
          <>
            <Separator />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Payment Method:</span>
              <Badge variant="outline" className="text-xs">
                {booking.paymentOption}
              </Badge>
            </div>
          </>
        )}

        {/* Timestamps */}
        {(createdDate || modifiedDate) && (
          <>
            <Separator />
            <div className="space-y-1 text-xs text-muted-foreground">
              {createdDate && isValid(createdDate) && (
                <div>Created: {format(createdDate, 'MMM dd, yyyy HH:mm')}</div>
              )}
              {modifiedDate && isValid(modifiedDate) && (
                <div>Modified: {format(modifiedDate, 'MMM dd, yyyy HH:mm')}</div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
} 