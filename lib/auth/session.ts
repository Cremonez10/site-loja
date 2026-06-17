// utilitário edge-safe para criação e verificação de sessão admin
export const ADMIN_SESSION_COOKIE = 'admin_session';

type SessionPayload = {
  adminId: string;
  email: string;
  role: string;
  exp: number; // unix seconds
};

function utf8ToUint8(str: string) {
  return new TextEncoder().encode(str);
}

function uint8ToBase64Url(bytes: Uint8Array) {
  // prefer Buffer quando disponível (Node), fallback para btoa
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  const b64 = typeof btoa !== 'undefined' ? btoa(binary) : '';
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToUint8(base64url: string) {
  const b64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4));
  const normalized = b64 + pad;

  if (typeof Buffer !== 'undefined') {
    return Uint8Array.from(Buffer.from(normalized, 'base64'));
  }

  const binary = typeof atob !== 'undefined' ? atob(normalized) : '';
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function getKey(secret: string) {
  const keyData = utf8ToUint8(secret);
  return await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

export async function signSession(payload: Omit<SessionPayload, 'exp'>) {
  const secret = process.env.ADMIN_AUTH_SECRET;
  if (!secret) throw new Error('ADMIN_AUTH_SECRET is not set');

  const exp = Math.floor(Date.now() / 1000) + 8 * 60 * 60; // 8 horas
  const full: SessionPayload = { ...payload, exp };
  const json = JSON.stringify(full);
  const payloadBytes = utf8ToUint8(json);

  const key = await getKey(secret);
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, payloadBytes));

  const payloadB64 = uint8ToBase64Url(payloadBytes);
  const sigB64 = uint8ToBase64Url(sig);

  return `${payloadB64}.${sigB64}`;
}

export async function verifySession(token?: string) {
  try {
    if (!token) return null;
    const secret = process.env.ADMIN_AUTH_SECRET;
    if (!secret) return null;

    const parts = token.split('.');
    if (parts.length !== 2) return null;

    const [payloadB64, sigB64] = parts;
    const payloadBytes = base64UrlToUint8(payloadB64);
    const sigBytes = base64UrlToUint8(sigB64);

    const key = await getKey(secret);
    const verified = await crypto.subtle.verify('HMAC', key, sigBytes, payloadBytes);
    if (!verified) return null;

    const json = new TextDecoder().decode(payloadBytes);
    const data = JSON.parse(json) as SessionPayload;

    if (!data || typeof data.exp !== 'number') return null;
    const now = Math.floor(Date.now() / 1000);
    if (data.exp < now) return null;

    return data;
  } catch (err) {
    return null;
  }
}
