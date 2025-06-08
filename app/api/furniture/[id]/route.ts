import { NextResponse } from 'next/server';
import { furnitureData } from '../../../../data/furniture';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const furniture = furnitureData.find(item => item.id === params.id);
  
  if (!furniture) {
    return NextResponse.json(
      { success: false, error: 'Furniture not found' },
      { status: 404 }
    );
  }
  
  return NextResponse.json({
    success: true,
    data: furniture
  });
}
