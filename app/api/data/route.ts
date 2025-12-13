import { NextResponse } from 'next/server';
import { loadData } from '@/lib/data';

export async function GET() {
  const data = await loadData();
  return NextResponse.json(data);
}
