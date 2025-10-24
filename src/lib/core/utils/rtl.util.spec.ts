import { isRTL, RTL_LANGUAGES } from './rtl.util';

describe('rtl.util', () => {
  describe('RTL_LANGUAGES constant', () => {
    test('should be an array', () => {
      expect(Array.isArray(RTL_LANGUAGES)).toBe(true);
    });

    test('should contain Arabic (AR)', () => {
      expect(RTL_LANGUAGES).toContain('AR');
    });

    test('should have at least one language', () => {
      expect(RTL_LANGUAGES.length).toBeGreaterThan(0);
    });
  });

  describe('isRTL()', () => {
    describe('RTL Languages', () => {
      test('should return true for Arabic (AR)', () => {
        expect(isRTL('AR')).toBe(true);
      });

      test('should return true for Arabic (ar) - case insensitive', () => {
        expect(isRTL('ar')).toBe(true);
      });

      test('should return true for Arabic (Ar) - mixed case', () => {
        expect(isRTL('Ar')).toBe(true);
      });

      test('should return true for Arabic (aR) - mixed case', () => {
        expect(isRTL('aR')).toBe(true);
      });
    });

    describe('LTR Languages', () => {
      test('should return false for English (EN)', () => {
        expect(isRTL('EN')).toBe(false);
      });

      test('should return false for English (en)', () => {
        expect(isRTL('en')).toBe(false);
      });

      test('should return false for French (FR)', () => {
        expect(isRTL('FR')).toBe(false);
      });

      test('should return false for German (DE)', () => {
        expect(isRTL('DE')).toBe(false);
      });

      test('should return false for Spanish (ES)', () => {
        expect(isRTL('ES')).toBe(false);
      });

      test('should return false for Dutch (NL)', () => {
        expect(isRTL('NL')).toBe(false);
      });

      test('should return false for Italian (IT)', () => {
        expect(isRTL('IT')).toBe(false);
      });

      test('should return false for Portuguese (PT)', () => {
        expect(isRTL('PT')).toBe(false);
      });

      test('should return false for Russian (RU)', () => {
        expect(isRTL('RU')).toBe(false);
      });

      test('should return false for Chinese (ZH)', () => {
        expect(isRTL('ZH')).toBe(false);
      });
    });

    describe('Edge Cases', () => {
      test('should return false for undefined', () => {
        expect(isRTL(undefined)).toBe(false);
      });

      test('should return false for empty string', () => {
        expect(isRTL('')).toBe(false);
      });

      test('should return false for null (cast as undefined)', () => {
        expect(isRTL(null as unknown as undefined)).toBe(false);
      });

      test('should return false for invalid language code', () => {
        expect(isRTL('XX')).toBe(false);
      });

      test('should return false for numeric string', () => {
        expect(isRTL('123')).toBe(false);
      });

      test('should return false for special characters', () => {
        expect(isRTL('!@#')).toBe(false);
      });

      test('should handle whitespace in language code', () => {
        // Note: This returns false because ' AR ' !== 'AR'
        // This is expected behavior - language codes should be clean
        expect(isRTL(' AR ')).toBe(false);
      });
    });

    describe('Future RTL Languages Support', () => {
      test('should be extendable for future RTL languages', () => {
        // This test documents that we can easily add more RTL languages
        // Common RTL languages that could be added:
        // - HE (Hebrew)
        // - FA (Persian/Farsi)
        // - UR (Urdu)
        // - YI (Yiddish)

        // For now, only Arabic is supported
        expect(RTL_LANGUAGES).toEqual(['AR']);

        // When more languages are added, this test should be updated
        // Example future state:
        // expect(RTL_LANGUAGES).toContain('AR');
        // expect(RTL_LANGUAGES).toContain('HE');
        // expect(RTL_LANGUAGES).toContain('FA');
      });
    });
  });

  describe('Integration with Real-World Usage', () => {
    test('should work with ButtonTriggerSurvey language config', () => {
      // Simulating ButtonTriggerSurvey config
      const config = {
        language: 'AR',
        text: 'تعليقات',
      };

      const shouldApplyRTL = isRTL(config.language);
      expect(shouldApplyRTL).toBe(true);
    });

    test('should work with UrlBuilder language config', () => {
      // Simulating UrlBuilder config
      const urlConfig = {
        baseUrl: 'https://example.com',
        tenantId: 'test-tenant',
        touchPointId: 'test-touchpoint',
        language: 'EN',
      };

      const shouldApplyRTL = isRTL(urlConfig.language);
      expect(shouldApplyRTL).toBe(false);
    });

    test('should help determine text-direction CSS property', () => {
      const languages = ['AR', 'EN', 'FR', 'DE'];
      const directions = languages.map((lang) => (isRTL(lang) ? 'rtl' : 'ltr'));

      expect(directions).toEqual(['rtl', 'ltr', 'ltr', 'ltr']);
    });

    test('should help determine flex-direction for icon placement', () => {
      const arabicButton = {
        language: 'AR',
        hasIcon: true,
      };

      const englishButton = {
        language: 'EN',
        hasIcon: true,
      };

      const arabicFlexDirection = isRTL(arabicButton.language)
        ? 'row-reverse'
        : 'row';
      const englishFlexDirection = isRTL(englishButton.language)
        ? 'row-reverse'
        : 'row';

      expect(arabicFlexDirection).toBe('row-reverse');
      expect(englishFlexDirection).toBe('row');
    });
  });
});
