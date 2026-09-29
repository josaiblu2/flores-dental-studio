import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import type { AstroCookies } from 'astro';

export const SESSION_COOKIE = 'flores_admin_session';
export const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours

const TOKEN_VERSION = 'v1';
const MIN_SECRET_LENGTH = 32;

interface AdminConfig {
  password: string;
  secret: string;
}

// Returns null when the panel is not safely configured: no defaults, the panel stays locked.
export function getAdminConfig(): AdminConfig | null {
  const password = import.meta.env.ADMIN_PASSWORD;
  const secret = import.meta.env.ADMIN_SESSION_SECRET;

  if (!password || !secret || secret.length < MIN_SECRET_LENGTH) {
    return null;
  }
  return { password, secret };
}

const sha256 = (value: string) => createHash('sha256').update(value).digest();

const sign = (payload: string, secret: string) =>
  createHmac('sha256', secret).update(payload).digest('base64url');

// Constant-time comparison; hashing first makes both buffers the same length.
export function verifyPassword(candidate: string, expected: string): boolean {
  return timingSafeEqual(sha256(candidate), sha256(expected));
}

export function createSessionToken(secret: string): string {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const nonce = randomBytes(16).toString('base64url');
  const payload = `${TOKEN_VERSION}.${expiresAt}.${nonce}`;
  return `${payload}.${sign(payload, secret)}`;
}

export function verifySessionToken(token: string | undefined, secret: string): boolean {
  if (!token) return false;

  const parts = token.split('.');
  if (parts.length !== 4 || parts[0] !== TOKEN_VERSION) return false;

  const [version, expiresAtRaw, nonce, signature] = parts;
  const payload = `${version}.${expiresAtRaw}.${nonce}`;

  const expected = Buffer.from(sign(payload, secret));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
    return false;
  }

  const expiresAt = Number(expiresAtRaw);
  return Number.isInteger(expiresAt) && expiresAt > Math.floor(Date.now() / 1000);
}

export function isAdmin(cookies: AstroCookies): boolean {
  const config = getAdminConfig();
  if (!config) return false;
  return verifySessionToken(cookies.get(SESSION_COOKIE)?.value, config.secret);
}
