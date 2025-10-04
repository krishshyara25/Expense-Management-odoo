import { parseUserFromRequest } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    await dbConnect();
    
    // Verify authentication
    const authUser = parseUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get the uploaded file
    const formData = await request.formData();
    const receiptImage = formData.get('receiptImage') || formData.get('file');

    if (!receiptImage) {
      return NextResponse.json(
        { success: false, error: 'No receipt image provided' },
        { status: 400 }
      );
    }

    // TODO: Implement actual OCR processing in Phase 2
    // For now, return mock data to enable testing of the workflow
    // This will be replaced with actual OCR service integration (Tesseract.js or Cloud OCR)
    
    const mockOCRResult = {
      amount: '25.99',
      currency: 'USD',
      date: new Date().toISOString().split('T')[0],
      description: 'Restaurant meal - Receipt processed',
      category: 'Food & Dining'
    };

    return NextResponse.json({
      success: true,
      message: 'OCR processing completed (mock data for Phase 1)',
      data: mockOCRResult,
      extractedData: mockOCRResult // Backward compatibility
    });

  } catch (error) {
    console.error('OCR processing error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process receipt' },
      { status: 500 }
    );
  }
}