import { NextResponse } from 'next/server';
import { getPublishedProducts } from '@/lib/products';

export async function GET() {
  try {
    const products = await getPublishedProducts();
    return NextResponse.json(products);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
