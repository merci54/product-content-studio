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
