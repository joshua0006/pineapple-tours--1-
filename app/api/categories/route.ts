import { NextResponse } from 'next/server'

// Mock data - in a real application, this would come from Rezdy API or database
const categories = [
  {
    id: '1',
    title: 'Adventure Tours',
    description: 'Thrilling experiences for adrenaline seekers including volcano hikes, zip-lining, and extreme sports.',
    image: '/placeholder.svg?height=300&width=400',
    tourCount: 24,
    slug: 'adventure'
  },
  {
    id: '2',
    title: 'Cultural Experiences',
    description: 'Immerse yourself in local traditions, history, and authentic cultural encounters.',
    image: '/placeholder.svg?height=300&width=400',
    tourCount: 18,
    slug: 'cultural'
  },
  {
    id: '3',
    title: 'Beach & Water Sports',
    description: 'Relax on pristine beaches or dive into exciting water activities and marine adventures.',
    image: '/placeholder.svg?height=300&width=400',
    tourCount: 32,
    slug: 'beach-water'
  },
  {
    id: '4',
    title: 'Family Friendly',
    description: 'Perfect tours for families with children, featuring safe and engaging activities for all ages.',
    image: '/placeholder.svg?height=300&width=400',
    tourCount: 15,
    slug: 'family'
  }
]

export async function GET() {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100))
    
    return NextResponse.json({
      success: true,
      data: categories
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
} 