// OCR Integration/Mock Endpoint
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    
    // OCR processing logic will be implemented here
    // This will integrate with OCRService
    
    return NextResponse.json({ 
      extractedData: {
        amount: 0,
        date: '',
        vendor: '',
        description: ''
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'OCR processing failed' }, { status: 500 });
  }
}