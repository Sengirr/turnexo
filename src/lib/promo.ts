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

export function getUrlPromoCode(): string | null {
  try {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlCode = params.get('promo') || params.get('ref') || params.get('code');
      if (urlCode && urlCode.trim()) {
        return urlCode.trim();
      }
    }
    return null;
  } catch {
    return null;
  }
}

export function getStoredPromoCode(): string | null {
  try {
    // 1. Revisar URL params primero
    const urlCode = getUrlPromoCode();
    if (urlCode) {
      localStorage.setItem('turnexo_promo_code', urlCode);
      return urlCode;
    }
    // 2. Si entramos a la portada sin parámetros, limpiar la promo guardada para que no contamine la navegación normal
    if (typeof window !== 'undefined' && (window.location.pathname === '/' || window.location.pathname === '') && !window.location.search) {
      localStorage.removeItem('turnexo_promo_code');
      return null;
    }
    return localStorage.getItem('turnexo_promo_code') || null;
  } catch {
    return null;
  }
}
