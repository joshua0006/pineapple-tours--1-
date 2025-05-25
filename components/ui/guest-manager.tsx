"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Minus, User, Baby, UserCheck, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export interface GuestInfo {
  id: string
  firstName: string
  lastName: string
  age: number
  type: 'ADULT' | 'CHILD' | 'INFANT'
  specialRequests?: string
}

interface GuestManagerProps {
  guests: GuestInfo[]
  onGuestsChange: (guests: GuestInfo[]) => void
  maxGuests?: number
  minGuests?: number
  requireAdult?: boolean
  className?: string
}

const GUEST_TYPES = {
  ADULT: { label: 'Adult', minAge: 18, icon: User, color: 'bg-blue-100 text-blue-800' },
  CHILD: { label: 'Child', minAge: 3, maxAge: 17, icon: User, color: 'bg-green-100 text-green-800' },
  INFANT: { label: 'Infant', maxAge: 2, icon: Baby, color: 'bg-purple-100 text-purple-800' }
}

const AGE_RANGES = [
  { value: '0', label: 'Under 1 year' },
  { value: '1', label: '1 year' },
  { value: '2', label: '2 years' },
  { value: '3', label: '3 years' },
  { value: '4', label: '4 years' },
  { value: '5', label: '5 years' },
  { value: '6', label: '6 years' },
  { value: '7', label: '7 years' },
  { value: '8', label: '8 years' },
  { value: '9', label: '9 years' },
  { value: '10', label: '10 years' },
  { value: '11', label: '11 years' },
  { value: '12', label: '12 years' },
  { value: '13', label: '13 years' },
  { value: '14', label: '14 years' },
  { value: '15', label: '15 years' },
  { value: '16', label: '16 years' },
  { value: '17', label: '17 years' },
  { value: '18', label: '18+ years (Adult)' }
]

function getGuestType(age: number): 'ADULT' | 'CHILD' | 'INFANT' {
  if (age <= GUEST_TYPES.INFANT.maxAge!) return 'INFANT'
  if (age <= GUEST_TYPES.CHILD.maxAge!) return 'CHILD'
  return 'ADULT'
}

export function GuestManager({ 
  guests, 
  onGuestsChange, 
  maxGuests = 10, 
  minGuests = 1,
  requireAdult = true,
  className = "" 
}: GuestManagerProps) {
  const [errors, setErrors] = useState<string[]>([])

  const validateGuests = (guestList: GuestInfo[]): string[] => {
    const validationErrors: string[] = []
    
    if (guestList.length < minGuests) {
      validationErrors.push(`At least ${minGuests} guest${minGuests > 1 ? 's' : ''} required`)
    }
    
    if (guestList.length > maxGuests) {
      validationErrors.push(`Maximum ${maxGuests} guests allowed`)
    }
    
    const adults = guestList.filter(g => g.type === 'ADULT').length
    const hasMinors = guestList.some(g => g.type === 'CHILD' || g.type === 'INFANT')
    
    if (requireAdult && adults === 0 && hasMinors) {
      validationErrors.push('At least one adult is required when booking for children or infants')
    }
    
    const incompleteGuests = guestList.filter(g => !g.firstName.trim() || !g.lastName.trim())
    if (incompleteGuests.length > 0) {
      validationErrors.push(`Please complete information for all guests`)
    }
    
    return validationErrors
  }

  const addGuest = () => {
    if (guests.length >= maxGuests) return
    
    const newGuest: GuestInfo = {
      id: Date.now().toString(),
      firstName: '',
      lastName: '',
      age: 25,
      type: 'ADULT'
    }
    
    const updatedGuests = [...guests, newGuest]
    onGuestsChange(updatedGuests)
    setErrors(validateGuests(updatedGuests))
  }

  const removeGuest = (id: string) => {
    if (guests.length <= minGuests) return
    
    const updatedGuests = guests.filter(guest => guest.id !== id)
    onGuestsChange(updatedGuests)
    setErrors(validateGuests(updatedGuests))
  }

  const updateGuest = (id: string, updates: Partial<GuestInfo>) => {
    const updatedGuests = guests.map(guest => {
      if (guest.id === id) {
        const updatedGuest = { ...guest, ...updates }
        
        // Auto-update type based on age if age is being updated
        if ('age' in updates && typeof updates.age === 'number') {
          updatedGuest.type = getGuestType(updates.age)
        }
        
        return updatedGuest
      }
      return guest
    })
    
    onGuestsChange(updatedGuests)
    setErrors(validateGuests(updatedGuests))
  }

  const guestCounts = guests.reduce((counts, guest) => {
    counts[guest.type.toLowerCase() as keyof typeof counts]++
    return counts
  }, { adult: 0, child: 0, infant: 0 })

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Guest Information</h3>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addGuest}
            disabled={guests.length >= maxGuests}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Guest
          </Button>
          <span className="text-sm text-muted-foreground">
            {guests.length}/{maxGuests}
          </span>
        </div>
      </div>

      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {guests.map((guest, index) => (
          <Card key={guest.id} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-yellow-500" />
                <span className="font-medium">Guest {index + 1}</span>
                <Badge variant="outline" className={`text-xs ${GUEST_TYPES[guest.type].color}`}>
                  {GUEST_TYPES[guest.type].label}
                </Badge>
              </div>
              {guests.length > minGuests && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeGuest(guest.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Minus className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor={`firstName-${guest.id}`}>First Name *</Label>
                <Input
                  id={`firstName-${guest.id}`}
                  value={guest.firstName}
                  onChange={(e) => updateGuest(guest.id, { firstName: e.target.value })}
                  placeholder="Enter first name"
                  required
                  className={!guest.firstName.trim() ? 'border-red-300' : ''}
                />
              </div>
              <div>
                <Label htmlFor={`lastName-${guest.id}`}>Last Name *</Label>
                <Input
                  id={`lastName-${guest.id}`}
                  value={guest.lastName}
                  onChange={(e) => updateGuest(guest.id, { lastName: e.target.value })}
                  placeholder="Enter last name"
                  required
                  className={!guest.lastName.trim() ? 'border-red-300' : ''}
                />
              </div>
              <div>
                <Label htmlFor={`age-${guest.id}`}>Age *</Label>
                <Select 
                  value={guest.age.toString()} 
                  onValueChange={(value) => updateGuest(guest.id, { age: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select age" />
                  </SelectTrigger>
                  <SelectContent>
                    {AGE_RANGES.map((range) => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Guest Summary */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {guestCounts.adult > 0 && (
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span className="text-sm">{guestCounts.adult} Adult{guestCounts.adult > 1 ? 's' : ''}</span>
                </div>
              )}
              {guestCounts.child > 0 && (
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span className="text-sm">{guestCounts.child} Child{guestCounts.child > 1 ? 'ren' : ''}</span>
                </div>
              )}
              {guestCounts.infant > 0 && (
                <div className="flex items-center gap-1">
                  <Baby className="h-4 w-4" />
                  <span className="text-sm">{guestCounts.infant} Infant{guestCounts.infant > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
            <div className="text-sm font-medium">
              Total: {guests.length} {guests.length === 1 ? 'guest' : 'guests'}
            </div>
          </div>
          
          {/* Age-based pricing info */}
          <div className="mt-3 pt-3 border-t border-blue-300">
            <div className="text-xs text-blue-700 space-y-1">
              <div>• Adults (18+): Full price</div>
              <div>• Children (3-17): 25% discount</div>
              <div>• Infants (0-2): Free</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 