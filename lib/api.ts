import { Furniture } from '@/types/furniture';
import { NextRequest } from 'next/server';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  total?: number;
}

export async function fetchFurnitureList(req?: NextRequest): Promise<ApiResponse<Furniture[]>> {
  try {
    const response = await fetch('/api/furniture');
    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch furniture list'
    };
  }
}

export async function fetchFurnitureById(id: string): Promise<ApiResponse<Furniture>> {
  try {
    const baseUrl = typeof window === 'undefined' ? 'http://localhost:3000' : '';
    const response = await fetch(`${baseUrl}/api/furniture/${id}`);
    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch furniture details'
    };
  }
}
