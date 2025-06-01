"use client"

import React, { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, TrendingUp, Users, DollarSign, MapPin, Clock, Star, AlertCircle, CheckCircle, BarChart3, PieChart, Activity } from "lucide-react"
import { format, subDays, isAfter, isBefore } from "date-fns"
import { useRezdyProducts, useRezdyAvailability } from "@/hooks/use-rezdy"
import { RezdyProduct, RezdySession, RezdyBooking } from "@/lib/types/rezdy"
import { formatCurrency } from "@/lib/utils/pricing-utils"
import { cn } from "@/lib/utils"

interface BookingDashboardProps {
  className?: string
}

interface BookingAnalytics {
  totalBookings: number
  totalRevenue: number
  averageBookingValue: number
  conversionRate: number
  popularTimes: { time: string; bookings: number }[]
  topProducts: { product: RezdyProduct; bookings: number; revenue: number }[]
  guestDemographics: { adults: number; children: number; infants: number }
  seasonalTrends: { month: string; bookings: number; revenue: number }[]
}

interface AvailabilityInsights {
  totalSessions: number
  availableSeats: number
  bookedSeats: number
  occupancyRate: number
  peakDays: string[]
  lowDemandDays: string[]
}

export function BookingDashboard({ className }: BookingDashboardProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState("30d")
  const [selectedProduct, setSelectedProduct] = useState<string>("all")
  
  // Fetch data
  const { data: products, loading: productsLoading } = useRezdyProducts()
  
  // Calculate date range
  const getDateRange = () => {
    const end = new Date()
    let start = new Date()
    
    switch (selectedTimeRange) {
      case "7d":
        start = subDays(end, 7)
        break
      case "30d":
        start = subDays(end, 30)
        break
      case "90d":
        start = subDays(end, 90)
        break
      default:
        start = subDays(end, 30)
    }
    
    return { start, end }
  }

  // Mock booking data - in real implementation, this would come from API
  const mockBookings: RezdyBooking[] = useMemo(() => [
    {
      orderNumber: "BK001",
      customer: { firstName: "John", lastName: "Doe", email: "john@example.com", phone: "+1234567890" },
      items: [
        {
          productCode: "TOUR001",
          startTimeLocal: "2024-01-15T09:00:00",
          participants: [{ type: "ADULT", number: 2 }, { type: "CHILD", number: 1 }],
          amount: 267
        }
      ],
      totalAmount: 267,
      status: "CONFIRMED",
      createdDate: "2024-01-10T10:00:00Z"
    },
    {
      orderNumber: "BK002", 
      customer: { firstName: "Jane", lastName: "Smith", email: "jane@example.com", phone: "+1234567891" },
      items: [
        {
          productCode: "TOUR002",
          startTimeLocal: "2024-01-16T14:00:00",
          participants: [{ type: "ADULT", number: 4 }],
          amount: 356
        }
      ],
      totalAmount: 356,
      status: "CONFIRMED",
      createdDate: "2024-01-11T14:30:00Z"
    }
  ], [])

  // Calculate analytics
  const analytics = useMemo((): BookingAnalytics => {
    const { start, end } = getDateRange()
    
    // Filter bookings by date range and product
    const filteredBookings = mockBookings.filter(booking => {
      const bookingDate = new Date(booking.createdDate || '')
      const dateInRange = isAfter(bookingDate, start) && isBefore(bookingDate, end)
      
      if (selectedProduct === "all") return dateInRange
      
      return dateInRange && booking.items.some(item => item.productCode === selectedProduct)
    })

    const totalBookings = filteredBookings.length
    const totalRevenue = filteredBookings.reduce((sum, booking) => sum + booking.totalAmount, 0)
    const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0

    // Calculate guest demographics
    const guestDemographics = filteredBookings.reduce((acc, booking) => {
      booking.items.forEach(item => {
        item.participants.forEach(participant => {
          if (participant.type === "ADULT") acc.adults += participant.number
          else if (participant.type === "CHILD") acc.children += participant.number
          else if (participant.type === "INFANT") acc.infants += participant.number
        })
      })
      return acc
    }, { adults: 0, children: 0, infants: 0 })

    // Calculate popular times
    const timeSlots = filteredBookings.reduce((acc, booking) => {
      booking.items.forEach(item => {
        const hour = new Date(item.startTimeLocal).getHours()
        const timeSlot = `${hour}:00`
        acc[timeSlot] = (acc[timeSlot] || 0) + 1
      })
      return acc
    }, {} as Record<string, number>)

    const popularTimes = Object.entries(timeSlots)
      .map(([time, bookings]) => ({ time, bookings }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 5)

    // Calculate top products
    const productStats = filteredBookings.reduce((acc, booking) => {
      booking.items.forEach(item => {
        if (!acc[item.productCode]) {
          acc[item.productCode] = { bookings: 0, revenue: 0 }
        }
        acc[item.productCode].bookings += 1
        acc[item.productCode].revenue += item.amount
      })
      return acc
    }, {} as Record<string, { bookings: number; revenue: number }>)

    const topProducts = Object.entries(productStats)
      .map(([productCode, stats]) => {
        const product = products?.find(p => p.productCode === productCode)
        return product ? { product, ...stats } : null
      })
      .filter(Boolean)
      .sort((a, b) => b!.revenue - a!.revenue)
      .slice(0, 5) as { product: RezdyProduct; bookings: number; revenue: number }[]

    return {
      totalBookings,
      totalRevenue,
      averageBookingValue,
      conversionRate: 0.15, // Mock conversion rate
      popularTimes,
      topProducts,
      guestDemographics,
      seasonalTrends: [] // Mock seasonal trends
    }
  }, [mockBookings, selectedTimeRange, selectedProduct, products])

  // Calculate availability insights
  const availabilityInsights = useMemo((): AvailabilityInsights => {
    // Mock availability data - in real implementation, this would come from API
    return {
      totalSessions: 45,
      availableSeats: 320,
      bookedSeats: 180,
      occupancyRate: 0.56,
      peakDays: ["Saturday", "Sunday", "Friday"],
      lowDemandDays: ["Tuesday", "Wednesday"]
    }
  }, [])

  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Booking Dashboard</h2>
          <p className="text-muted-foreground">Real-time insights and analytics for your tour bookings</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedProduct} onValueChange={setSelectedProduct}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select product" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              {products?.map((product) => (
                <SelectItem key={product.productCode} value={product.productCode}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalBookings}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8%</span> from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Booking Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.averageBookingValue)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600">-3%</span> from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(analytics.conversionRate)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2%</span> from last period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Products */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Top Performing Products
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analytics.topProducts.map((item, index) => (
                  <div key={item.product.productCode} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{item.product.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.bookings} bookings
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{formatCurrency(item.revenue)}</div>
                      <div className="text-sm text-muted-foreground">revenue</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Guest Demographics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Guest Demographics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Adults</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full"
                          style={{ 
                            width: `${(analytics.guestDemographics.adults / (analytics.guestDemographics.adults + analytics.guestDemographics.children + analytics.guestDemographics.infants)) * 100}%` 
                          }}
                        />
                      </div>
                      <span className="font-medium">{analytics.guestDemographics.adults}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Children</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 rounded-full"
                          style={{ 
                            width: `${(analytics.guestDemographics.children / (analytics.guestDemographics.adults + analytics.guestDemographics.children + analytics.guestDemographics.infants)) * 100}%` 
                          }}
                        />
                      </div>
                      <span className="font-medium">{analytics.guestDemographics.children}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Infants</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-500 rounded-full"
                          style={{ 
                            width: `${(analytics.guestDemographics.infants / (analytics.guestDemographics.adults + analytics.guestDemographics.children + analytics.guestDemographics.infants)) * 100}%` 
                          }}
                        />
                      </div>
                      <span className="font-medium">{analytics.guestDemographics.infants}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Popular Times */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Popular Booking Times
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {analytics.popularTimes.map((timeSlot) => (
                  <div key={timeSlot.time} className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold">{timeSlot.time}</div>
                    <div className="text-sm text-muted-foreground">{timeSlot.bookings} bookings</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Availability Tab */}
        <TabsContent value="availability" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{availabilityInsights.totalSessions}</div>
                <p className="text-xs text-muted-foreground">Active sessions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available Seats</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{availabilityInsights.availableSeats}</div>
                <p className="text-xs text-muted-foreground">Seats remaining</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Booked Seats</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{availabilityInsights.bookedSeats}</div>
                <p className="text-xs text-muted-foreground">Seats sold</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPercentage(availabilityInsights.occupancyRate)}</div>
                <p className="text-xs text-muted-foreground">Average occupancy</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Peak Days */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Peak Demand Days
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {availabilityInsights.peakDays.map((day) => (
                  <div key={day} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="font-medium">{day}</span>
                    <Badge variant="default" className="bg-green-600">High Demand</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Low Demand Days */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  Low Demand Days
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {availabilityInsights.lowDemandDays.map((day) => (
                  <div key={day} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <span className="font-medium">{day}</span>
                    <Badge variant="outline" className="border-orange-600 text-orange-600">Low Demand</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Revenue Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Revenue chart would be displayed here
                  <br />
                  (Integration with charting library needed)
                </div>
              </CardContent>
            </Card>

            {/* Booking Patterns */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Booking Patterns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Booking patterns chart would be displayed here
                  <br />
                  (Integration with charting library needed)
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Optimization Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Optimization Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="font-medium text-blue-900">Increase Tuesday Bookings</div>
                  <div className="text-sm text-blue-700 mt-1">
                    Consider offering 15% discount on Tuesdays to boost low-demand day bookings
                  </div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="font-medium text-green-900">Optimize Peak Times</div>
                  <div className="text-sm text-green-700 mt-1">
                    Add more sessions during 10:00-12:00 time slot to capture high demand
                  </div>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="font-medium text-yellow-900">Family Packages</div>
                  <div className="text-sm text-yellow-700 mt-1">
                    Create family packages targeting the high adult+children booking pattern
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  Performance Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="font-medium text-red-900">Low Conversion Rate</div>
                  <div className="text-sm text-red-700 mt-1">
                    Conversion rate dropped 5% this week. Review pricing and availability.
                  </div>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="font-medium text-orange-900">Inventory Alert</div>
                  <div className="text-sm text-orange-700 mt-1">
                    Weekend sessions are 90% booked. Consider adding more capacity.
                  </div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="font-medium text-green-900">Revenue Growth</div>
                  <div className="text-sm text-green-700 mt-1">
                    Monthly revenue is up 12% compared to last month. Great job!
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 