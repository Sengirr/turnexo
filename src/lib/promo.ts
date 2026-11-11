export const COMMUNITY_PROMO_CODES = [
  'comunidad',
  'anfitriones',
  'iva',
  'iva10',
  'whatsapp',
  'beta',
];

export function isCommunityPromoCode(code?: string | null): boolean {
  if (!code) return false;
  const normalized = code.trim().toLowerCase();
  return COMMUNITY_PROMO_CODES.some((validCode) => normalized.includes(validCode));
}

export function getStoredPromoCode(): string | null {
  try {
    // 1. Revisar URL params primero
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlCode = params.get('promo') || params.get('ref') || params.get('code');
      if (urlCode) {
        localStorage.setItem('turnexo_promo_code', urlCode.trim());
        return urlCode.trim();
      }
    }
    // 2. Revisar localStorage
    return localStorage.getItem('turnexo_promo_code') || null;
  } catch {
    return null;
  }
}
