"use client"

import { useState } from "react"
import { SearchForm } from "@/components/search-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, Users, MapPin, Database, CheckCircle, AlertCircle } from "lucide-react"

export default function SearchFormDemo() {
  const [searchResults, setSearchResults] = useState<any>(null)
  const [selectedLocation, setSelectedLocation] = useState<string>('')
  const [locationProducts, setLocationProducts] = useState<any[]>([])

  const handleSearch = (searchData: any) => {
    setSearchResults(searchData)
  }

  const handleLocationChange = (location: string, products: any[]) => {
    setSelectedLocation(location)
    setLocationProducts(products)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Enhanced Search Form Demo
        </h1>
        <p className="text-lg text-gray-600 mb-4">
          Showcasing Rezdy data management integration with simplified search inputs
        </p>
        
        <div className="flex flex-wrap gap-2 mb-6">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Database className="w-3 h-3" />
            Rezdy Integration
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Data Validation
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            Smart Caching
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            Dynamic Locations
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Search Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Search Form
              </CardTitle>
              <CardDescription>
                Simplified search with three key inputs: Participants, Tour Date, and Pick up Location
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SearchForm 
                onSearch={handleSearch}
                showRedirect={false}
                onLocationChange={handleLocationChange}
              />
            </CardContent>
          </Card>

          {/* Features Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Rezdy Integration Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Real-time Data</h4>
                    <p className="text-sm text-gray-600">Live product data from Rezdy API</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Data Validation</h4>
                    <p className="text-sm text-gray-600">Automated cleaning and validation</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Smart Caching</h4>
                    <p className="text-sm text-gray-600">Multi-level caching with TTL</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Error Handling</h4>
                    <p className="text-sm text-gray-600">Graceful error recovery</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results and Analytics */}
        <div className="space-y-6">
          {/* Search Results */}
          {searchResults && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Search Results
                </CardTitle>
                <CardDescription>
                  Data captured from the search form
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Participants</label>
                      <p className="text-lg">{searchResults.participants}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Tour Date</label>
                      <p className="text-lg">{searchResults.tourDate || 'Not selected'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Pick up Location</label>
                    <p className="text-lg">{searchResults.location || 'All Locations'}</p>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="font-medium text-gray-700">Available Products</label>
                      <p>{searchResults.products?.length || 0}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">Total Products</label>
                      <p>{searchResults.totalProducts || 0}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Data Quality</label>
                    <Badge 
                      variant={searchResults.dataQuality === 'good' ? 'default' : 'destructive'}
                      className="ml-2"
                    >
                      {searchResults.dataQuality}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Location Analytics */}
          {selectedLocation && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Location Analytics
                </CardTitle>
                <CardDescription>
                  Data for selected pickup location
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Selected Location</label>
                    <p className="text-lg">{selectedLocation === 'all' ? 'All Locations' : selectedLocation}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Available Tours</label>
                    <p className="text-2xl font-bold text-accent">{locationProducts.length}</p>
                  </div>
                  
                  {locationProducts.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Sample Tours</label>
                      <div className="space-y-2">
                        {locationProducts.slice(0, 3).map((product, index) => (
                          <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                            <p className="font-medium">{product.name || `Tour ${index + 1}`}</p>
                            {product.advertisedPrice && (
                              <p className="text-gray-600">${product.advertisedPrice}</p>
                            )}
                          </div>
                        ))}
                        {locationProducts.length > 3 && (
                          <p className="text-sm text-gray-500">
                            +{locationProducts.length - 3} more tours available
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Technical Details */}
          <Card>
            <CardHeader>
              <CardTitle>Technical Implementation</CardTitle>
              <CardDescription>
                Key features of the Rezdy data management system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Data Management Pipeline</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Real-time data fetching from Rezdy API</li>
                    <li>• Zod schema validation and error handling</li>
                    <li>• Automated data cleaning and normalization</li>
                    <li>• Multi-level caching with smart invalidation</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Search Capabilities</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Dynamic location extraction from products</li>
                    <li>• Real-time filtering and segmentation</li>
                    <li>• Participant capacity validation</li>
                    <li>• Date-based availability checking</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Performance Features</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• LRU/FIFO/TTL cache eviction policies</li>
                    <li>• Optimized query performance</li>
                    <li>• Error recovery and graceful degradation</li>
                    <li>• Real-time quality metrics</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Documentation Links */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Documentation</CardTitle>
          <CardDescription>
            Learn more about the implementation and strategies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Implementation Guide</h4>
              <p className="text-sm text-gray-600 mb-3">
                Comprehensive documentation of all implemented features and components.
              </p>
              <Badge variant="outline">DATA_MANAGEMENT_IMPLEMENTATION.md</Badge>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Strategy Documentation</h4>
              <p className="text-sm text-gray-600 mb-3">
                Detailed strategies for organizing and managing Rezdy data effectively.
              </p>
              <Badge variant="outline">REZDY_DATA_MANAGEMENT_STRATEGIES.md</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 