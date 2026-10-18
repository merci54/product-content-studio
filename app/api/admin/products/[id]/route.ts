import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth/session';
import { getProductById, updateProduct } from '@/lib/products';
import { productUpdateSchema } from '@/lib/validation/product';

type Props = {
  params: Promise<{ id: string }>;
};

function parseId(id: string) {
  const productId = Number(id);
  return Number.isInteger(productId) && productId > 0 ? productId : null;
}

export async function GET(request: Request, { params }: Props) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const productId = parseId(id);
    const product = productId ? await getProductById(productId) : null;

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: Props) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const productId = parseId(id);
    if (!productId) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const body = await request.json().catch(() => null);
    const parsed = productUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: z.flattenError(parsed.error) },
        { status: 400 }
      );
    }

    const product = await updateProduct(productId, parsed.data);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
