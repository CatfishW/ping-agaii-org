const STORAGE_KEY = 'pingConsentHandoff';
const MAX_AGE_MS = 60 * 60 * 1000;

const normalizeConsent = (consent = {}) => ({
  terms_accepted: !!consent.terms_accepted,
  privacy_accepted: !!consent.privacy_accepted,
  data_collection_accepted: !!consent.data_collection_accepted,
  cookie_accepted: !!consent.cookie_accepted
});

export const saveConsentHandoff = (consent) => {
  const normalized = normalizeConsent(consent);
  if (!normalized.terms_accepted || !normalized.privacy_accepted || !normalized.data_collection_accepted) {
    return false;
  }

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...normalized,
      accepted_at: Date.now()
    }));
    return true;
  } catch (error) {
    return false;
  }
};

export const readConsentHandoff = () => {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored);
    const acceptedAt = Number(parsed?.accepted_at || 0);
    const normalized = normalizeConsent(parsed);
    const isFresh = acceptedAt > 0 && Date.now() - acceptedAt <= MAX_AGE_MS;
    const hasRequiredConsent = normalized.terms_accepted
      && normalized.privacy_accepted
      && normalized.data_collection_accepted;

    if (!isFresh || !hasRequiredConsent) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return normalized;
  } catch (error) {
    return null;
  }
};

export const hasAnonymousConsent = () => {
  try {
    const stored = localStorage.getItem('anonymousConsent');
    if (!stored) return false;
    if (stored === 'true') return true;

    const parsed = JSON.parse(stored);
    return !!parsed?.terms_accepted
      && !!parsed?.privacy_accepted
      && !!parsed?.data_collection_accepted;
  } catch (error) {
    return false;
  }
};
