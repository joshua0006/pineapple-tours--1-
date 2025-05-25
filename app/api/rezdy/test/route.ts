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

    console.log('Testing Rezdy API connection...');
    
    // First test: Get products to see if API key works
    const productsUrl = `${REZDY_BASE_URL}/products?apiKey=${API_KEY}&limit=1`;
    console.log('Testing products endpoint:', productsUrl);
    
    const productsResponse = await fetch(productsUrl);
    console.log('Products response status:', productsResponse.status);
    
    if (!productsResponse.ok) {
      const errorText = await productsResponse.text();
      console.error('Products API error:', errorText);
      return NextResponse.json({
        error: 'Products API test failed',
        status: productsResponse.status,
        details: errorText
      }, { status: 500 });
    }
    
    const productsData = await productsResponse.json();
    console.log('Products response:', JSON.stringify(productsData, null, 2));
    
    // If we have products, test availability for the first one
    if (productsData.products && productsData.products.length > 0) {
      const firstProduct = productsData.products[0];
      const startTime = new Date().toISOString();
      const endTime = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days from now
      
      const availabilityUrl = `${REZDY_BASE_URL}/availability?apiKey=${API_KEY}&productCode=${firstProduct.productCode}&startTime=${startTime}&endTime=${endTime}`;
      console.log('Testing availability endpoint:', availabilityUrl);
      
      const availabilityResponse = await fetch(availabilityUrl);
      console.log('Availability response status:', availabilityResponse.status);
      
      const availabilityData = await availabilityResponse.json();
      console.log('Availability response:', JSON.stringify(availabilityData, null, 2));
      
      return NextResponse.json({
        success: true,
        productsTest: {
          status: productsResponse.status,
          productCount: productsData.products.length,
          firstProduct: firstProduct.productCode
        },
        availabilityTest: {
          status: availabilityResponse.status,
          data: availabilityData
        }
      });
    }
    
    return NextResponse.json({
      success: true,
      productsTest: {
        status: productsResponse.status,
        productCount: productsData.products ? productsData.products.length : 0,
        data: productsData
      }
    });

  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json(
      { error: 'Test failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 