import type { ProductUpdate } from '@/lib/validation/product';
import { nextServer } from './api';

export type LoginData = {
  email: string;
  password: string;
};

export const login = async (data: LoginData) => {
  const res = await nextServer.post<{ email: string }>('/auth/login', data);
  return res.data;
};

export const logout = async () => {
  await nextServer.post('/auth/logout');
};

export const updateProduct = async (id: number, data: ProductUpdate) => {
  const res = await nextServer.patch<ProductUpdate>(`/admin/products/${id}`, data);
  return res.data;
};
