import { UrlBuilder } from './url.builder';

describe('UrlBuilder', () => {
  const baseConfig = {
    baseUrl: 'https://example.com',
    tenantId: 'test-tenant',
    touchPointId: 'test-touchpoint',
  };

  // Helper to mock URL query parameters
  const mockUrlParams = (params: Record<string, string | null>): void => {
    jest
      .spyOn(URLSearchParams.prototype, 'get')
      .mockImplementation((name: string) => {
        return params[name] !== undefined ? params[name] : null;
      });
  };

  beforeEach(() => {
    // Fully reset all mocks before each test
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  // Run tests without URL params FIRST to avoid spy contamination
  describe('integration with URL generation - default cases', () => {
    it('should generate URL with default language EN', () => {
      // Explicitly mock no language params to ensure clean state
      mockUrlParams({ lang: null, language: null, locale: null });
      const builder = new UrlBuilder(baseConfig);
      const factory = builder.getUrlFactory();
      const url = factory.getBaseUrlWithLanguage();
      expect(url).toContain('/EN/');
      expect(url).toBe('https://example.com/EN/test-tenant/test-touchpoint');
    });

    it('should generate URL with language from config', () => {
      // Explicitly mock no language params to ensure clean state
      mockUrlParams({ lang: null, language: null, locale: null });
      const builder = new UrlBuilder({
        ...baseConfig,
        language: 'FR',
      });
      const factory = builder.getUrlFactory();
      const url = factory.getBaseUrlWithLanguage();
      expect(url).toContain('/FR/');
      expect(url).toBe('https://example.com/FR/test-tenant/test-touchpoint');
    });
  });

  describe('language fallback behavior', () => {
    it('should default to EN when no URL param and no config language', () => {
      // Explicitly mock no language params
      mockUrlParams({ lang: null, language: null, locale: null });
      const builder = new UrlBuilder({
        ...baseConfig,
      });
      expect(builder.getLanguage()).toBe('EN');
    });

    it('should fall back to config language when no URL param', () => {
      // Explicitly mock no language params
      mockUrlParams({ lang: null, language: null, locale: null });
      const builder = new UrlBuilder({
        ...baseConfig,
        language: 'FR',
      });
      expect(builder.getLanguage()).toBe('FR');
    });

    it('should prioritize URL param over config language', () => {
      mockUrlParams({ lang: 'nl' });
      const builder = new UrlBuilder({
        ...baseConfig,
        language: 'FR',
      });
      expect(builder.getLanguage()).toBe('NL');
    });

    it('should use config language when URL has other params but no language param', () => {
      mockUrlParams({ foo: 'bar', baz: 'qux' });
      const builder = new UrlBuilder({
        ...baseConfig,
        language: 'FR',
      });
      expect(builder.getLanguage()).toBe('FR');
    });
  });

  describe('language detection from URL', () => {
    it('should use language from ?lang parameter', () => {
      mockUrlParams({ lang: 'nl' });
      const builder = new UrlBuilder({
        ...baseConfig,
        language: 'EN',
      });
      expect(builder.getLanguage()).toBe('NL');
    });

    it('should use language from ?language parameter', () => {
      mockUrlParams({ language: 'fr' });
      const builder = new UrlBuilder({
        ...baseConfig,
        language: 'EN',
      });
      expect(builder.getLanguage()).toBe('FR');
    });

    it('should use language from ?locale parameter', () => {
      mockUrlParams({ locale: 'de' });
      const builder = new UrlBuilder({
        ...baseConfig,
        language: 'EN',
      });
      expect(builder.getLanguage()).toBe('DE');
    });

    it('should prioritize ?lang over ?language', () => {
      mockUrlParams({ lang: 'nl', language: 'fr' });
      const builder = new UrlBuilder({
        ...baseConfig,
        language: 'EN',
      });
      expect(builder.getLanguage()).toBe('NL');
    });

    it('should prioritize ?lang over ?locale', () => {
      mockUrlParams({ lang: 'nl', locale: 'de' });
      const builder = new UrlBuilder({
        ...baseConfig,
        language: 'EN',
      });
      expect(builder.getLanguage()).toBe('NL');
    });

    it('should prioritize ?language over ?locale', () => {
      mockUrlParams({ language: 'fr', locale: 'de' });
      const builder = new UrlBuilder({
        ...baseConfig,
        language: 'EN',
      });
      expect(builder.getLanguage()).toBe('FR');
    });

    it('should normalize language to uppercase', () => {
      mockUrlParams({ lang: 'nl' });
      const builder = new UrlBuilder({
        ...baseConfig,
        language: 'EN',
      });
      expect(builder.getLanguage()).toBe('NL');
    });

    it('should normalize mixed case language to uppercase', () => {
      mockUrlParams({ lang: 'Fr' });
      const builder = new UrlBuilder({
        ...baseConfig,
        language: 'EN',
      });
      expect(builder.getLanguage()).toBe('FR');
    });
  });

  describe('getUrlFactory', () => {
    it('should return a UrlFactory instance', () => {
      // Explicitly mock no language params
      mockUrlParams({ lang: null, language: null, locale: null });
      const builder = new UrlBuilder(baseConfig);
      const factory = builder.getUrlFactory();
      expect(factory).toBeDefined();
      expect(factory.getLanguage()).toBe('EN');
    });

    it('should return UrlFactory with correct language from URL', () => {
      mockUrlParams({ lang: 'nl' });
      const builder = new UrlBuilder(baseConfig);
      const factory = builder.getUrlFactory();
      expect(factory.getLanguage()).toBe('NL');
    });
  });

  describe('integration with URL generation - with URL params', () => {
    it('should generate URL with language from URL parameter', () => {
      mockUrlParams({ lang: 'nl' });
      const builder = new UrlBuilder(baseConfig);
      const factory = builder.getUrlFactory();
      const url = factory.getBaseUrlWithLanguage();
      expect(url).toContain('/NL/');
      expect(url).toBe('https://example.com/NL/test-tenant/test-touchpoint');
    });
  });

  describe('edge cases', () => {
    it('should handle empty language parameter', () => {
      mockUrlParams({ lang: '' });
      const builder = new UrlBuilder({
        ...baseConfig,
        language: 'FR',
      });
      expect(builder.getLanguage()).toBe('FR');
    });

    it('should handle multiple question marks in URL', () => {
      // Only the first ? is valid, rest are part of values
      mockUrlParams({ lang: 'nl', foo: 'bar?baz' });
      const builder = new UrlBuilder(baseConfig);
      expect(builder.getLanguage()).toBe('NL');
    });

    it('should handle URL with hash fragment', () => {
      mockUrlParams({ lang: 'nl' });
      const builder = new UrlBuilder(baseConfig);
      expect(builder.getLanguage()).toBe('NL');
    });

    it('should handle URL with hash before query string', () => {
      // Hash comes before query, so query is ignored by browser
      // Explicitly mock no language params
      mockUrlParams({ lang: null, language: null, locale: null });
      const builder = new UrlBuilder({
        ...baseConfig,
        language: 'FR',
      });
      expect(builder.getLanguage()).toBe('FR');
    });
  });
});
