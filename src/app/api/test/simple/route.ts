import { NextResponse } from 'next/server';

export function GET() {
  return NextResponse.json({
    message: 'Test endpoint working',
    timestamp: new Date().toISOString(),
  });
}

export function POST() {
  return NextResponse.json({
    success: true,
    message: 'POST request received',
    timestamp: new Date().toISOString(),
  });
}
