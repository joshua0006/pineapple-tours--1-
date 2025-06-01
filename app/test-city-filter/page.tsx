"use client"

import { useCityProducts } from "@/hooks/use-city-products"
import { useRezdyProducts } from "@/hooks/use-rezdy"

export default function TestCityFilterPage() {
  const { products, cities, selectedCity, filteredProducts, loading, error } = useCityProducts()
  const { data: rawProducts, loading: rawLoading, error: rawError } = useRezdyProducts(10)

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">City Filter Test</h1>
      
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">useCityProducts Hook</h2>
          <div>
            <strong>Loading:</strong> {loading.toString()}
          </div>
          <div>
            <strong>Error:</strong> {error || 'None'}
          </div>
          <div>
            <strong>Total Products:</strong> {products.length}
          </div>
          <div>
            <strong>Cities:</strong> {cities.length} - {cities.join(', ')}
          </div>
          <div>
            <strong>Selected City:</strong> {selectedCity}
          </div>
          <div>
            <strong>Filtered Products:</strong> {filteredProducts.length}
          </div>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">useRezdyProducts Hook (Raw)</h2>
          <div>
            <strong>Loading:</strong> {rawLoading.toString()}
          </div>
          <div>
            <strong>Error:</strong> {rawError || 'None'}
          </div>
          <div>
            <strong>Raw Products:</strong> {rawProducts?.length || 0}
          </div>
          {rawProducts && rawProducts.length > 0 && (
            <div>
              <strong>First Product:</strong>
              <pre className="text-xs bg-gray-100 p-2 rounded">
                {JSON.stringify({
                  name: rawProducts[0].name,
                  productCode: rawProducts[0].productCode,
                  locationAddress: rawProducts[0].locationAddress
                }, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
      
      {filteredProducts.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Filtered Products:</h2>
          <div className="grid gap-4">
            {filteredProducts.slice(0, 3).map((product) => (
              <div key={product.productCode} className="border p-4 rounded">
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-sm text-gray-600">Code: {product.productCode}</p>
                <p className="text-sm">Location: {JSON.stringify(product.locationAddress)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 