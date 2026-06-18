export const AGE_GATE_COOKIE = 'age_confirmed';

export function hasAgeConfirmationFromCookieHeader(cookieHeader: string | null): boolean {
  if (!cookieHeader || typeof cookieHeader !== 'string') {
    return false;
  }

  const cookies = cookieHeader.split(';');
  for (const cookie of cookies) {
    const [rawName, rawValue] = cookie.split('=');
    if (!rawName || typeof rawValue === 'undefined') continue;

    const name = rawName.trim();
    const value = rawValue.trim().toLowerCase();
    if (name === AGE_GATE_COOKIE && (value === '1' || value === 'true')) {
      return true;
    }
  }

  return false;
}
