"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRezdyCategories, useRezdyCategoryProducts } from "@/hooks/use-rezdy";
import { rezdyCategoryService } from "@/lib/services/hybrid-category-service";
import { RezdyCategory, RezdyCategoryProduct } from "@/lib/types/rezdy";
import { REZDY_TOUR_CATEGORIES, RezdyTourCategory } from "@/lib/constants/categories";

interface CategoryBrowserProps {
  onCategorySelect?: (categoryId: string | number) => void;
}

export function CategoryBrowser({ onCategorySelect }: CategoryBrowserProps) {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [categoryData, setCategoryData] = useState<any>(null);

  const { data: rezdyCategories, loading: rezdyLoading } = useRezdyCategories();
  const { data: categoryProducts, loading: productsLoading } = useRezdyCategoryProducts(
    selectedCategory
  );

  useEffect(() => {
    const initializeRezdyService = async () => {
      await rezdyCategoryService.initialize();
      if (selectedCategory) {
        const data = await rezdyCategoryService.getRezdyCategoryData(selectedCategory);
        setCategoryData(data);
      }
    };

    initializeRezdyService();
  }, [selectedCategory]);

  const handleCategorySelect = (categoryId: number) => {
    setSelectedCategory(categoryId);
    onCategorySelect?.(categoryId);
  };

  const renderRezdyCategories = () => {
    if (rezdyLoading) {
      return <div>Loading Rezdy categories...</div>;
    }

    if (!rezdyCategories || rezdyCategories.length === 0) {
      return <div>No Rezdy categories found.</div>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rezdyCategories.map((category) => (
          <Card 
            key={category.id} 
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedCategory === category.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => handleCategorySelect(category.id)}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {category.title}
                <Badge variant="default">
                  ID: {category.id}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">{category.description}</p>
              <Badge variant="outline" className="text-xs">
                {category.categoryGroup}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };


  const renderCategoryDetails = () => {
    if (!categoryData) {
      return <div>Select a category to see details</div>;
    }

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{categoryData.category.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {categoryData.stats.productCount}
                </div>
                <div className="text-sm text-gray-600">Total Products</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {categoryData.category.id}
                </div>
                <div className="text-sm text-gray-600">Rezdy Category ID</div>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600">{categoryData.category.description}</p>
              <Badge variant="outline" className="mt-2">
                {categoryData.category.categoryGroup}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {categoryData.products.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Products ({categoryData.products.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {categoryData.products.slice(0, 10).map((product: any) => (
                  <div key={product.productCode} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-600">{product.productCode}</div>
                    </div>
                    <div className="text-sm">
                      ${product.advertisedPrice || 'N/A'}
                    </div>
                  </div>
                ))}
                {categoryData.products.length > 10 && (
                  <div className="text-sm text-gray-500 text-center py-2">
                    ... and {categoryData.products.length - 10} more
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderProductDetails = () => {
    if (productsLoading) {
      return <div>Loading products...</div>;
    }

    if (!categoryProducts || categoryProducts.length === 0) {
      return <div>No products found for this category.</div>;
    }

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Products ({categoryProducts.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categoryProducts.map((product) => (
            <Card key={product.productCode}>
              <CardHeader>
                <CardTitle className="text-base">{product.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm">
                    <strong>Code:</strong> {product.productCode}
                  </div>
                  {product.advertisedPrice && (
                    <div className="text-sm">
                      <strong>Price:</strong> ${product.advertisedPrice}
                    </div>
                  )}
                  {product.shortDescription && (
                    <p className="text-sm text-gray-600">{product.shortDescription}</p>
                  )}
                  <Badge variant="outline">{product.productType}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Rezdy Category Browser</h2>
        <Button 
          onClick={() => rezdyCategoryService.refreshCache()} 
          variant="outline"
          size="sm"
        >
          Refresh Cache
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Categories</h3>
          {renderRezdyCategories()}
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-4">Details</h3>
          {renderCategoryDetails()}
        </div>
      </div>

      {selectedCategory && (
        <div className="mt-6">
          {renderProductDetails()}
        </div>
      )}
    </div>
  );
}