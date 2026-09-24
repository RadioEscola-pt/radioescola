import { NextResponse } from 'next/server';
import { readStudyItems } from '@/lib/study-items';

export async function GET() {
  return NextResponse.json(readStudyItems());
}
