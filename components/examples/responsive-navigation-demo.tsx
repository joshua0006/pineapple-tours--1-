"use client"

import { useState } from "react"
import { Monitor, Tablet, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SiteHeader } from "@/components/site-header"

export function ResponsiveNavigationDemo() {
  const [selectedDevice, setSelectedDevice] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')

  const deviceSpecs = {
    mobile: {
      width: '375px',
      height: '667px',
      name: 'Mobile',
      icon: <Smartphone className="w-4 h-4" />,
      features: [
        'Hamburger menu with slide-out navigation',
        'Touch-friendly 48px minimum touch targets',
        'Staggered animation entrance effects',
        'Full-screen overlay navigation',
        'Contact info prominently displayed',
        'Large CTA button'
      ]
    },
    tablet: {
      width: '768px',
      height: '1024px',
      name: 'Tablet',
      icon: <Tablet className="w-4 h-4" />,
      features: [
        'Condensed navigation with "More" dropdown',
        'First 3 navigation items visible',
        'Hover-activated dropdown menu',
        'Abbreviated "Book" button',
        'Optimized spacing for touch',
        'Balanced layout design'
      ]
    },
    desktop: {
      width: '1200px',
      height: '800px',
      name: 'Desktop',
      icon: <Monitor className="w-4 h-4" />,
      features: [
        'Full horizontal navigation layout',
        'All navigation items visible',
        'Complete contact information',
        'Full "Book Now" button',
        'Hover effects with animations',
        'Comprehensive action bar'
      ]
    }
  }

  const currentDevice = deviceSpecs[selectedDevice]

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Responsive Navigation Demo
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Experience how the Pineapple Tours navigation adapts seamlessly across different screen sizes
            and devices, providing optimal user experience everywhere.
          </p>
        </div>

        {/* Device Selector */}
        <div className="flex justify-center gap-4">
          {Object.entries(deviceSpecs).map(([key, device]) => (
            <Button
              key={key}
              variant={selectedDevice === key ? "default" : "outline"}
              onClick={() => setSelectedDevice(key as any)}
              className="flex items-center gap-2"
            >
              {device.icon}
              {device.name}
            </Button>
          ))}
        </div>

        {/* Demo Container */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Device Preview */}
          <div className="flex-1 flex justify-center">
            <div className="relative">
              {/* Device Frame */}
              <div 
                className="bg-gray-800 rounded-lg p-4 shadow-2xl transition-all duration-500"
                style={{
                  width: selectedDevice === 'mobile' ? '395px' : 
                         selectedDevice === 'tablet' ? '788px' : '1220px',
                  height: selectedDevice === 'mobile' ? '687px' : 
                          selectedDevice === 'tablet' ? '1044px' : '820px'
                }}
              >
                {/* Screen */}
                <div 
                  className="bg-white dark:bg-gray-900 rounded overflow-hidden shadow-inner transition-all duration-500"
                  style={{
                    width: currentDevice.width,
                    height: currentDevice.height,
                    transform: selectedDevice === 'mobile' ? 'scale(0.8)' : 
                               selectedDevice === 'tablet' ? 'scale(0.6)' : 'scale(0.5)',
                    transformOrigin: 'top left'
                  }}
                >
                  {/* Navigation Preview */}
                  <div className="h-full overflow-hidden">
                    <SiteHeader />
                    <div className="p-6 space-y-4">
                      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2" />
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                          <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Device Label */}
              <Badge 
                variant="secondary" 
                className="absolute -bottom-2 left-1/2 transform -translate-x-1/2"
              >
                {currentDevice.name} View
              </Badge>
            </div>
          </div>

          {/* Features Panel */}
          <div className="w-full lg:w-96">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {currentDevice.icon}
                  {currentDevice.name} Features
                </CardTitle>
                <CardDescription>
                  Key responsive navigation features for {currentDevice.name.toLowerCase()} devices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {currentDevice.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Technical Specs */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Technical Specifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Breakpoint:</span>
                  <span className="text-sm font-medium">
                    {selectedDevice === 'mobile' ? '< 768px' : 
                     selectedDevice === 'tablet' ? '768px - 1024px' : '≥ 1024px'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Touch Targets:</span>
                  <span className="text-sm font-medium">
                    {selectedDevice === 'mobile' ? '≥ 48px' : 
                     selectedDevice === 'tablet' ? '≥ 44px' : '≥ 40px'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Navigation Type:</span>
                  <span className="text-sm font-medium">
                    {selectedDevice === 'mobile' ? 'Overlay Menu' : 
                     selectedDevice === 'tablet' ? 'Condensed + Dropdown' : 'Full Horizontal'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Animations:</span>
                  <span className="text-sm font-medium">
                    {selectedDevice === 'mobile' ? 'Staggered Entrance' : 
                     selectedDevice === 'tablet' ? 'Hover Transitions' : 'Underline Effects'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Instructions */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>How to Test</CardTitle>
            <CardDescription>
              Try these interactions to experience the responsive navigation in action
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  Mobile Testing
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Tap the hamburger menu</li>
                  <li>• Scroll through menu items</li>
                  <li>• Try the theme toggle</li>
                  <li>• Test the Book button</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Tablet className="w-4 h-4" />
                  Tablet Testing
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Hover over "More" button</li>
                  <li>• Navigate with touch/mouse</li>
                  <li>• Test responsive layout</li>
                  <li>• Check dropdown behavior</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Monitor className="w-4 h-4" />
                  Desktop Testing
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Hover over navigation items</li>
                  <li>• Use keyboard navigation</li>
                  <li>• Test focus indicators</li>
                  <li>• Try all interactive elements</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 