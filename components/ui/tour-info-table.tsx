import { ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface TourInfoItem {
  label: string
  value: ReactNode
  icon?: ReactNode
  highlight?: boolean
  type?: 'text' | 'badge' | 'price' | 'status'
}

interface TourInfoTableProps {
  title?: string
  items: TourInfoItem[]
  className?: string
  columns?: 1 | 2 | 3
  showCard?: boolean
}

export function TourInfoTable({
  title = "Tour Information",
  items,
  className,
  columns = 2,
  showCard = true
}: TourInfoTableProps) {
  const renderValue = (item: TourInfoItem) => {
    switch (item.type) {
      case 'badge':
        return (
          <Badge 
            variant={item.highlight ? 'default' : 'secondary'}
            className={item.highlight ? 'bg-coral-500 text-white hover:bg-coral-600' : ''}
          >
            {item.value}
          </Badge>
        )
      case 'price':
        return (
          <span className="text-lg font-bold text-foreground">
            {item.value}
          </span>
        )
      case 'status':
        return (
          <Badge 
            variant={item.value === 'ACTIVE' || item.value === 'Available' ? 'default' : 'secondary'}
            className={item.value === 'ACTIVE' || item.value === 'Available' 
              ? 'bg-green-500 text-white hover:bg-green-600' 
              : 'bg-gray-500 text-white'
            }
          >
            {item.value}
          </Badge>
        )
      default:
        return (
          <span className={cn(
            "text-foreground",
            item.highlight && "font-semibold"
          )}>
            {item.value}
          </span>
        )
    }
  }

  const tableContent = (
    <div 
      className={cn(
        "grid gap-4",
        columns === 1 && "grid-cols-1",
        columns === 2 && "grid-cols-1 sm:grid-cols-2",
        columns === 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      )}
    >
      {items.map((item, index) => (
        <div 
          key={index}
          className={cn(
            "flex items-center justify-between p-3 rounded-lg border bg-card",
            item.highlight && "border-yellow-200 bg-yellow-50"
          )}
        >
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            {item.icon && (
              <div className="flex-shrink-0 text-coral-500">
                {item.icon}
              </div>
            )}
            <span className="text-sm font-medium text-muted-foreground truncate">
              {item.label}
            </span>
          </div>
          <div className="flex-shrink-0 ml-2">
            {renderValue(item)}
          </div>
        </div>
      ))}
    </div>
  )

  if (showCard) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          {tableContent}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={className}>
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      {tableContent}
    </div>
  )
}

// Utility function to create tour info items
export function createTourInfoItems(product: any): TourInfoItem[] {
  const items: TourInfoItem[] = []

  if (product.productCode) {
    items.push({
      label: 'Product Code',
      value: product.productCode,
      type: 'text'
    })
  }

  if (product.status) {
    items.push({
      label: 'Status',
      value: product.status,
      type: 'status'
    })
  }

  if (product.advertisedPrice) {
    items.push({
      label: 'Starting Price',
      value: `$${product.advertisedPrice.toFixed(0)}`,
      type: 'price',
      highlight: true
    })
  }

  if (product.quantityRequiredMin || product.quantityRequiredMax) {
    const min = product.quantityRequiredMin || 1
    const max = product.quantityRequiredMax || 'unlimited'
    items.push({
      label: 'Group Size',
      value: `${min} - ${max} people`,
      type: 'text'
    })
  }

  if (product.productType) {
    items.push({
      label: 'Tour Type',
      value: product.productType,
      type: 'badge'
    })
  }

  if (product.categories && product.categories.length > 0) {
    items.push({
      label: 'Categories',
      value: product.categories.join(', '),
      type: 'text'
    })
  }

  return items
} 