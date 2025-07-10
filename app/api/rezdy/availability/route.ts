import { NextRequest, NextResponse } from 'next/server';

const REZDY_BASE_URL = 'https://api.rezdy.com/v1';
const API_KEY = process.env.REZDY_API_KEY;

export async function GET(request: NextRequest) {
  try {
    if (!API_KEY) {
      return NextResponse.json(
        { error: 'Rezdy API key not configured' },
        { status: 500 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const productCode = searchParams.get('productCode');
    const startTime = searchParams.get('startTime');
    const endTime = searchParams.get('endTime');
    const participants = searchParams.get('participants');

    if (!productCode || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Missing required parameters: productCode, startTime, endTime' },
        { status: 400 }
      );
    }

    // Ensure dates are in the correct format for Rezdy API (YYYY-MM-DD)
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        throw new Error(`Invalid date format: ${dateStr}`);
      }
      return date.toISOString().split('T')[0];
    };

    const formattedStartTime = formatDate(startTime);
    const formattedEndTime = formatDate(endTime);

    let url = `${REZDY_BASE_URL}/availability?apiKey=${API_KEY}&productCode=${encodeURIComponent(productCode)}&startTime=${formattedStartTime}&endTime=${formattedEndTime}`;
    
    if (participants) {
      url += `&participants=${encodeURIComponent(participants)}`;
    }
    
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Rezdy API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();


    // Ensure the response has the expected structure
    const responseData = {
      availability: data.sessions ? [{ productCode, sessions: data.sessions }] : [],
      ...data
    };

    // Cache the availability data
    if (data.sessions && data.sessions.length > 0) {
          const { simpleCacheManager } = await import('@/lib/utils/simple-cache-manager');
    await simpleCacheManager.cacheAvailability(data.sessions, productCode);
    }

    return NextResponse.json(responseData, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to fetch availability from Rezdy',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 