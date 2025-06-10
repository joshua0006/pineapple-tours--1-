import { NextResponse } from 'next/server';
import { downloadGiftVoucherSectionImages, getExistingGiftVoucherSectionImages } from '@/lib/utils/gift-voucher-section-image-downloader';

export async function POST() {
  try {
    console.log('Starting gift voucher section image download...');
    const downloadedImages = await downloadGiftVoucherSectionImages();
    
    return NextResponse.json({
      success: true,
      message: `Successfully downloaded ${downloadedImages.length} images`,
      images: downloadedImages
    });
  } catch (error) {
    console.error('Error in download API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to download images',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const existingImages = getExistingGiftVoucherSectionImages();
    
    return NextResponse.json({
      success: true,
      images: existingImages,
      count: existingImages.length
    });
  } catch (error) {
    console.error('Error getting existing images:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get existing images',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 