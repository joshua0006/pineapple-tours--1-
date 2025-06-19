import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Home, Search } from "lucide-react";

export default function BookingNotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-gray-900">
            Booking Not Found
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-gray-600">
            <p className="mb-4">
              The tour you're trying to book couldn't be found. This might happen if:
            </p>
            <ul className="text-sm text-left space-y-2 bg-gray-50 p-4 rounded-lg">
              <li>• The tour is no longer available</li>
              <li>• The product code in the URL is incorrect</li>
              <li>• The tour has been moved or updated</li>
              <li>• There's a temporary issue with our booking system</li>
            </ul>
          </div>
          
          <div className="flex flex-col gap-3">
            <Link href="/tours">
              <Button className="w-full">
                <Search className="w-4 h-4 mr-2" />
                Browse All Tours
              </Button>
            </Link>
            
            <Link href="/">
              <Button variant="outline" className="w-full">
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            
            <Link href="/test-booking-debug">
              <Button variant="ghost" className="w-full text-sm">
                Debug Booking System
              </Button>
            </Link>
          </div>
          
          <div className="pt-4 border-t text-center">
            <p className="text-sm text-gray-500">
              Need help? <Link href="/contact" className="text-brand-accent hover:underline">Contact us</Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 