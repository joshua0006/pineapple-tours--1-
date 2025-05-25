import { NextRequest, NextResponse } from 'next/server';

const REZDY_BASE_URL = 'https://api.rezdy.com/v1';
const API_KEY = process.env.REZDY_API_KEY;

export async function POST(request: NextRequest) {
  try {
    if (!API_KEY) {
      return NextResponse.json(
        { error: 'Rezdy API key not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.customer || !body.items || !body.totalAmount) {
      return NextResponse.json(
        { error: 'Missing required fields: customer, items, totalAmount' },
        { status: 400 }
      );
    }

    const url = `${REZDY_BASE_URL}/bookings?apiKey=${API_KEY}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Rezdy API error: ${response.status} ${response.statusText} - ${errorData}`);
    }

    const data = await response.json();

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating Rezdy booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking in Rezdy' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!API_KEY) {
      return NextResponse.json(
        { error: 'Rezdy API key not configured' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '50';
    const offset = searchParams.get('offset') || '0';

    const url = `${REZDY_BASE_URL}/bookings?apiKey=${API_KEY}&limit=${limit}&offset=${offset}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Rezdy API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error('Error fetching Rezdy bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings from Rezdy' },
      { status: 500 }
    );
  }
} 