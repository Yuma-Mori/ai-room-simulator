import { NextResponse } from 'next/server';
import { furnitureData } from '../../../data/furniture';

export async function GET() {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return NextResponse.json({
    success: true,
    data: furnitureData,
    total: furnitureData.length
  });
}