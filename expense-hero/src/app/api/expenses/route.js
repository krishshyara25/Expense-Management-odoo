// GET: History, POST: Submit Expense
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // Get expense history logic will be implemented here
    return NextResponse.json({ expenses: [] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    // Submit expense logic will be implemented here
    return NextResponse.json({ message: 'Expense submitted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit expense' }, { status: 500 });
  }
}