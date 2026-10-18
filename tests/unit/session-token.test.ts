import { SignJWT, UnsecuredJWT } from 'jose';
import { beforeAll, describe, expect, it } from 'vitest';
import { verifySessionToken } from '@/lib/auth/session';

const SECRET = 'test-secret-for-unit-tests-only-32-chars';

function signToken(secret: string, expiresAt: string | number = '1h') {
  return new SignJWT({ email: 'admin@example.test' })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject('1')
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(new TextEncoder().encode(secret));
}

describe('verifySessionToken', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = SECRET;
  });

  it('повертає користувача для коректного токена', async () => {
    const token = await signToken(SECRET);
    await expect(verifySessionToken(token)).resolves.toEqual({
      userId: 1,
      email: 'admin@example.test',
    });
  });

  it('повертає null, якщо токена немає', async () => {
    await expect(verifySessionToken(undefined)).resolves.toBeNull();
  });

  it('відхиляє токен, підписаний іншим секретом', async () => {
    const token = await signToken('another-secret-another-secret-123');
    await expect(verifySessionToken(token)).resolves.toBeNull();
  });

  it('відхиляє змінений токен', async () => {
    const token = await signToken(SECRET);
    await expect(verifySessionToken(`${token}x`)).resolves.toBeNull();
  });

  it('відхиляє прострочений токен', async () => {
    const token = await signToken(SECRET, Math.floor(Date.now() / 1000) - 60);
    await expect(verifySessionToken(token)).resolves.toBeNull();
  });

  it('відхиляє непідписаний токен (alg: none)', async () => {
    const token = new UnsecuredJWT({ email: 'admin@example.test' }).setSubject('1').encode();
    await expect(verifySessionToken(token)).resolves.toBeNull();
  });
});
