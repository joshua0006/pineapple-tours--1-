"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Play, MapPin, Database } from "lucide-react"
import { runAllLocationTests, validateProductLocationData } from "@/lib/utils/location-test-utils"
import { useCityProducts } from "@/hooks/use-city-products"

export default function TestLocationPage() {
  const [testResults, setTestResults] = useState<string[]>([])
  const [validationStats, setValidationStats] = useState<any>(null)
  const { products, cities, loading, error } = useCityProducts()

  const runTests = () => {
    // Capture console output
    const originalLog = console.log
    const logs: string[] = []
    
    console.log = (...args) => {
      logs.push(args.join(' '))
      originalLog(...args)
    }

    try {
      runAllLocationTests()
      setTestResults(logs)
    } finally {
      console.log = originalLog
    }
  }

  const validateRealData = () => {
    if (products.length > 0) {
      const stats = validateProductLocationData(products)
      setValidationStats(stats)
    }
  }

  useEffect(() => {
    if (products.length > 0) {
      validateRealData()
    }
  }, [products])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Location Filtering Test Suite</h1>
          <p className="text-muted-foreground">
            Comprehensive testing of city-based product filtering functionality
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Test Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5 text-green-500" />
                Unit Tests
              </CardTitle>
              <CardDescription>
                Run comprehensive tests on location extraction and filtering logic
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={runTests} className="w-full mb-4">
                <Play className="mr-2 h-4 w-4" />
                Run All Tests
              </Button>
              
              {testResults.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Test Results:</h4>
                  <div className="bg-black text-green-400 p-4 rounded-md font-mono text-sm max-h-96 overflow-y-auto">
                    {testResults.map((log, index) => (
                      <div key={index} className="whitespace-pre-wrap">
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Real Data Validation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-500" />
                Real Data Validation
              </CardTitle>
              <CardDescription>
                Analyze actual product data from the Rezdy API
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Loading product data...</p>
                </div>
              )}

              {error && (
                <div className="text-center py-4">
                  <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <p className="text-sm text-red-600">Error loading data: {error}</p>
                </div>
              )}

              {validationStats && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{validationStats.total}</div>
                      <div className="text-sm text-blue-600">Total Products</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{validationStats.uniqueCities.size}</div>
                      <div className="text-sm text-green-600">Unique Cities</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">With Location Data:</span>
                      <Badge variant="outline">
                        {validationStats.withLocation} ({((validationStats.withLocation / validationStats.total) * 100).toFixed(1)}%)
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">With Valid City:</span>
                      <Badge variant="outline">
                        {validationStats.withValidCity} ({((validationStats.withValidCity / validationStats.total) * 100).toFixed(1)}%)
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">String Format:</span>
                      <Badge variant="secondary">{validationStats.withStringLocation}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Object Format:</span>
                      <Badge variant="secondary">{validationStats.withObjectLocation}</Badge>
                    </div>
                  </div>

                  <Button onClick={validateRealData} variant="outline" className="w-full">
                    <Database className="mr-2 h-4 w-4" />
                    Refresh Validation
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cities Overview */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-coral-500" />
                Available Cities
              </CardTitle>
              <CardDescription>
                Cities extracted from product location data
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-coral-500 mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Loading cities...</p>
                </div>
              )}

              {cities.length > 0 && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {cities.map((city) => (
                      <Badge key={city} variant="outline" className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {city}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    Total cities found: {cities.length}
                  </div>
                </div>
              )}

              {!loading && cities.length === 0 && (
                <div className="text-center py-4">
                  <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No cities found</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* API Test */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>API Integration Test</CardTitle>
              <CardDescription>
                Test the search API with city filtering parameters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Button
                  onClick={() => window.open('/api/search?city=Sydney', '_blank')}
                  variant="outline"
                  className="w-full"
                >
                  Test Sydney Filter
                </Button>
                <Button
                  onClick={() => window.open('/api/search?city=Melbourne&category=cultural', '_blank')}
                  variant="outline"
                  className="w-full"
                >
                  Test Melbourne + Cultural
                </Button>
                <Button
                  onClick={() => window.open('/api/search?location=Brisbane&priceRange=under-500', '_blank')}
                  variant="outline"
                  className="w-full"
                >
                  Test Brisbane + Price
                </Button>
              </div>
              
              <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                <h4 className="font-medium mb-2">Test URLs:</h4>
                <div className="space-y-1 text-sm font-mono">
                  <div>/api/search?city=Sydney</div>
                  <div>/api/search?city=Melbourne&category=cultural</div>
                  <div>/api/search?location=Brisbane&priceRange=under-500</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Search Page Test */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Search Page Integration</CardTitle>
              <CardDescription>
                Test the enhanced search page with city filtering
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Button
                  onClick={() => window.open('/search?city=Sydney', '_blank')}
                  className="w-full"
                >
                  Search Sydney Tours
                </Button>
                <Button
                  onClick={() => window.open('/search?city=Melbourne&category=adventure', '_blank')}
                  className="w-full"
                >
                  Melbourne Adventures
                </Button>
                <Button
                  onClick={() => window.open('/city-search', '_blank')}
                  className="w-full"
                >
                  City Search Demo
                </Button>
              </div>
              
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium mb-2">Features to Test:</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Dynamic city dropdown population</li>
                  <li>• Real-time product count updates</li>
                  <li>• URL parameter handling</li>
                  <li>• Filter combination and clearing</li>
                  <li>• Pagination with city filters</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 