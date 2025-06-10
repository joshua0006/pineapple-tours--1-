"use client"

import { useEffect, useState } from "react"
import { useRezdyGiftVouchers } from "@/hooks/use-rezdy"
import { RezdyProduct } from "@/lib/types/rezdy"

interface PopularVoucherPackagesProps {
  className?: string
}

export function PopularVoucherPackages({ className = "" }: PopularVoucherPackagesProps) {
  const { data: giftVouchers, loading, error } = useRezdyGiftVouchers({
    sortBy: 'popularity',
    sortOrder: 'desc',
    limit: 3
  })

  // Fallback data in case API fails
  const fallbackVouchers = [
    { price: 100, name: "Adventure Explorer", productCode: "fallback-1" },
    { price: 200, name: "Romantic Getaway", popular: true, productCode: "fallback-2" },
    { price: 150, name: "Family Fun", productCode: "fallback-3" }
  ]

  if (loading) {
    return (
      <div className={`bg-brand-accent/5 p-6 rounded-xl border border-brand-accent/20 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-secondary text-lg font-semibold text-brand-text">Popular Voucher Packages</h3>
        </div>
        <div className="grid sm:grid-cols-3 gap-4 text-center">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-4 rounded-lg shadow-sm animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Use Rezdy data if available, otherwise fallback
  const vouchersToDisplay = giftVouchers && giftVouchers.length >= 3 
    ? giftVouchers.slice(0, 3).map((voucher, index) => ({
        price: voucher.advertisedPrice || 0,
        name: voucher.name.replace(/\$\d+\s*Gift Voucher\s*-?\s*/i, '').trim() || `Package ${index + 1}`,
        popular: index === 1, // Mark middle one as popular
        productCode: voucher.productCode
      }))
    : fallbackVouchers

  return (
    <div className={`bg-brand-accent/5 p-6 rounded-xl border border-brand-accent/20 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-secondary text-lg font-semibold text-brand-text">Popular Voucher Packages</h3>
      </div>
      <div className="grid sm:grid-cols-3 gap-4 text-center">
        {vouchersToDisplay.map((voucher, index) => (
          <div 
            key={voucher.productCode || index} 
            className={`bg-white p-4 rounded-lg shadow-sm ${
              voucher.popular ? 'border-2 border-brand-accent' : ''
            }`}
          >
            <div className="text-xl font-bold text-brand-accent">
              ${voucher.price}
            </div>
            <div className="text-sm text-muted-foreground">
              {voucher.name}
            </div>
            {voucher.popular && (
              <div className="text-xs text-brand-accent font-semibold mt-1">
                Most Popular
              </div>
            )}
          </div>
        ))}
      </div>
      {error && (
        <div className="mt-2 text-xs text-muted-foreground text-center">
          Showing default packages (API unavailable)
        </div>
      )}
    </div>
  )
} 