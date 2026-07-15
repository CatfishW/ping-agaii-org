import {
  hasAnonymousConsent,
  readConsentHandoff,
  saveConsentHandoff
} from './ConsentHandoff';

describe('ConsentHandoff', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('round-trips a complete, recent consent', () => {
    jest.spyOn(Date, 'now').mockReturnValue(10_000);

    expect(saveConsentHandoff({
      terms_accepted: true,
      privacy_accepted: true,
      data_collection_accepted: true,
      cookie_accepted: false
    })).toBe(true);

    expect(readConsentHandoff()).toEqual({
      terms_accepted: true,
      privacy_accepted: true,
      data_collection_accepted: true,
      cookie_accepted: false
    });
  });

  test('rejects incomplete or expired consent', () => {
    expect(saveConsentHandoff({ terms_accepted: true })).toBe(false);

    sessionStorage.setItem('pingConsentHandoff', JSON.stringify({
      terms_accepted: true,
      privacy_accepted: true,
      data_collection_accepted: true,
      accepted_at: 1
    }));
    jest.spyOn(Date, 'now').mockReturnValue(3_700_002);

    expect(readConsentHandoff()).toBeNull();
    expect(sessionStorage.getItem('pingConsentHandoff')).toBeNull();
  });

  test('requires every mandatory anonymous consent flag', () => {
    localStorage.setItem('anonymousConsent', JSON.stringify({
      terms_accepted: true,
      privacy_accepted: true,
      data_collection_accepted: false
    }));
    expect(hasAnonymousConsent()).toBe(false);

    localStorage.setItem('anonymousConsent', JSON.stringify({
      terms_accepted: true,
      privacy_accepted: true,
      data_collection_accepted: true
    }));
    expect(hasAnonymousConsent()).toBe(true);
  });
});
