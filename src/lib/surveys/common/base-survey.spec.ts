import { BaseConfigValidator } from '../../core/base-classes/base.config-validator';
import { UrlBuilder } from '../../url-builder/url.builder';

import { BaseSurvey } from './base-survey';
import { BaseSurveyConfig } from './base-survey-config.interface';

// Concrete implementation for testing the abstract class
class TestSurvey extends BaseSurvey<BaseSurveyConfig> {
  public showCalled = false;
  public hideCalled = false;
  public destroyCalled = false;

  public show(): void {
    this.showCalled = true;
  }

  public hide(): void {
    this.hideCalled = true;
  }

  public destroy(): void {
    this.destroyCalled = true;
  }
}

describe('BaseSurvey', () => {
  let mockUrlBuilder: UrlBuilder;
  let mockValidator: BaseConfigValidator<BaseSurveyConfig>;
  let localStorageMock: {
    getItem: jest.Mock;
    setItem: jest.Mock;
    removeItem: jest.Mock;
    clear: jest.Mock;
    store: Record<string, string>;
  };

  beforeEach(() => {
    // Mock localStorage
    localStorageMock = (() => {
      let store: Record<string, string> = {};
      return {
        getItem: jest.fn((key: string) => store[key] || null),
        setItem: jest.fn((key: string, value: string) => {
          store[key] = value;
        }),
        removeItem: jest.fn((key: string) => {
          delete store[key];
        }),
        clear: jest.fn(() => {
          store = {};
        }),
        store,
      };
    })();

    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    // Create mock UrlBuilder
    mockUrlBuilder = {
      getUrlFactory: jest.fn().mockReturnValue({
        getUrlWithParams: jest
          .fn()
          .mockReturnValue('https://example.com/survey'),
        getSurveyIdentifier: jest.fn().mockReturnValue('test-survey-id'),
      }),
    } as unknown as UrlBuilder;

    // Create mock validator
    mockValidator = {
      validateAndThrowOnErrors: jest.fn(),
    } as unknown as BaseConfigValidator<BaseSurveyConfig>;
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  describe('A. Constructor Tests', () => {
    test('should initialize with UrlBuilder', () => {
      const config: BaseSurveyConfig = {};
      const survey = new TestSurvey(mockUrlBuilder, config, mockValidator);

      expect(survey).toBeDefined();
      expect(mockUrlBuilder.getUrlFactory).toHaveBeenCalled();
      expect(mockValidator.validateAndThrowOnErrors).toHaveBeenCalledWith(
        config,
      );
    });

    test('should initialize without UrlBuilder (for ButtonTriggerSurvey)', () => {
      const config: BaseSurveyConfig = {};
      const customId = 'custom-button-id';
      const survey = new TestSurvey(null, config, mockValidator, customId);

      expect(survey).toBeDefined();
      expect(mockUrlBuilder.getUrlFactory).not.toHaveBeenCalled();
      expect(mockValidator.validateAndThrowOnErrors).toHaveBeenCalledWith(
        config,
      );
    });

    test('should use custom quarantine identifier when provided', () => {
      const config: BaseSurveyConfig = {
        quarantineConfig: { period: 7 },
      };
      const customId = 'custom-quarantine-id';

      // Set quarantine for custom ID to test it's being used
      const quarantineKey = `hcSDK.SurveyQuarantineStart:${customId}`;
      localStorageMock.store[quarantineKey] = Date.now().toString();

      const survey = new TestSurvey(
        mockUrlBuilder,
        config,
        mockValidator,
        customId,
      );

      // Verify the custom ID is used by checking isQuarantined works with it
      expect(survey.isQuarantined()).toBe(true);

      // Clear and verify it uses the custom ID
      survey.clearQuarantine();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(quarantineKey);
    });

    test('should use survey identifier from UrlFactory when no custom ID', () => {
      const config: BaseSurveyConfig = {
        quarantineConfig: { period: 7 },
      };

      new TestSurvey(mockUrlBuilder, config, mockValidator);

      const urlFactory = mockUrlBuilder.getUrlFactory();
      expect(urlFactory.getSurveyIdentifier).toHaveBeenCalled();
    });

    test('should validate config on construction', () => {
      const config: BaseSurveyConfig = {
        quarantineConfig: { period: 7 },
      };

      new TestSurvey(mockUrlBuilder, config, mockValidator);

      expect(mockValidator.validateAndThrowOnErrors).toHaveBeenCalledWith(
        config,
      );
    });
  });

  describe('B. Abstract Methods Tests', () => {
    test('should require show() implementation', () => {
      const config: BaseSurveyConfig = {};
      const survey = new TestSurvey(mockUrlBuilder, config, mockValidator);

      survey.show();
      expect(survey.showCalled).toBe(true);
    });

    test('should require hide() implementation', () => {
      const config: BaseSurveyConfig = {};
      const survey = new TestSurvey(mockUrlBuilder, config, mockValidator);

      survey.hide();
      expect(survey.hideCalled).toBe(true);
    });

    test('should require destroy() implementation', () => {
      const config: BaseSurveyConfig = {};
      const survey = new TestSurvey(mockUrlBuilder, config, mockValidator);

      survey.destroy();
      expect(survey.destroyCalled).toBe(true);
    });
  });

  describe('C. Quarantine Methods Tests', () => {
    describe('isQuarantined()', () => {
      test('should return false when not under quarantine', () => {
        const config: BaseSurveyConfig = {
          quarantineConfig: { period: 7 },
        };
        const survey = new TestSurvey(mockUrlBuilder, config, mockValidator);

        // Clear quarantine
        localStorageMock.clear();

        expect(survey.isQuarantined()).toBe(false);
      });

      test('should return true when under quarantine', () => {
        const config: BaseSurveyConfig = {
          quarantineConfig: { period: 7 },
        };

        // Set quarantine in localStorage
        const quarantineKey = 'hcSDK.SurveyQuarantineStart:test-survey-id';
        localStorageMock.store[quarantineKey] = Date.now().toString();

        const survey = new TestSurvey(mockUrlBuilder, config, mockValidator);

        expect(survey.isQuarantined()).toBe(true);
      });

      test('should return false when quarantine period expired', () => {
        const config: BaseSurveyConfig = {
          quarantineConfig: { period: 7 },
        };

        // Set quarantine 8 days ago (expired for 7-day period)
        const quarantineKey = 'hcSDK.SurveyQuarantineStart:test-survey-id';
        const eightDaysAgo = Date.now() - 8 * 24 * 60 * 60 * 1000;
        localStorageMock.store[quarantineKey] = eightDaysAgo.toString();

        const survey = new TestSurvey(mockUrlBuilder, config, mockValidator);

        expect(survey.isQuarantined()).toBe(false);
      });
    });

    describe('getQuarantineStatus()', () => {
      test('should return status with isQuarantined false when not quarantined', () => {
        const config: BaseSurveyConfig = {
          quarantineConfig: { period: 7 },
        };
        localStorageMock.clear();

        const survey = new TestSurvey(mockUrlBuilder, config, mockValidator);

        const status = survey.getQuarantineStatus();
        expect(status.isQuarantined).toBe(false);
        expect(status.remainingDays).toBe(0);
      });

      test('should return status with isQuarantined true and remaining days', () => {
        const config: BaseSurveyConfig = {
          quarantineConfig: { period: 7 },
        };

        // Set quarantine 2 days ago (5 days remaining)
        const quarantineKey = 'hcSDK.SurveyQuarantineStart:test-survey-id';
        const twoDaysAgo = Date.now() - 2 * 24 * 60 * 60 * 1000;
        localStorageMock.store[quarantineKey] = twoDaysAgo.toString();

        const survey = new TestSurvey(mockUrlBuilder, config, mockValidator);

        const status = survey.getQuarantineStatus();
        expect(status.isQuarantined).toBe(true);
        expect(status.remainingDays).toBe(5);
      });

      test('should work with custom quarantine identifier', () => {
        const config: BaseSurveyConfig = {
          quarantineConfig: { period: 7 },
        };
        const customId = 'custom-button-id';

        // Set quarantine for custom ID
        const quarantineKey = `hcSDK.SurveyQuarantineStart:${customId}`;
        const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
        localStorageMock.store[quarantineKey] = threeDaysAgo.toString();

        const survey = new TestSurvey(null, config, mockValidator, customId);

        const status = survey.getQuarantineStatus();
        expect(status.isQuarantined).toBe(true);
        expect(status.remainingDays).toBe(4);
      });
    });

    describe('clearQuarantine()', () => {
      test('should clear quarantine', () => {
        const config: BaseSurveyConfig = {
          quarantineConfig: { period: 7 },
        };

        // Set quarantine
        const quarantineKey = 'hcSDK.SurveyQuarantineStart:test-survey-id';
        localStorageMock.store[quarantineKey] = Date.now().toString();

        const survey = new TestSurvey(mockUrlBuilder, config, mockValidator);

        expect(survey.isQuarantined()).toBe(true);

        survey.clearQuarantine();

        expect(survey.isQuarantined()).toBe(false);
      });

      test('should work when not quarantined', () => {
        const config: BaseSurveyConfig = {
          quarantineConfig: { period: 7 },
        };
        localStorageMock.clear();

        const survey = new TestSurvey(mockUrlBuilder, config, mockValidator);

        expect(() => survey.clearQuarantine()).not.toThrow();
        expect(survey.isQuarantined()).toBe(false);
      });

      test('should work with custom quarantine identifier', () => {
        const config: BaseSurveyConfig = {
          quarantineConfig: { period: 7 },
        };
        const customId = 'custom-button-id';

        // Set quarantine for custom ID
        const quarantineKey = `hcSDK.SurveyQuarantineStart:${customId}`;
        localStorageMock.store[quarantineKey] = Date.now().toString();

        const survey = new TestSurvey(null, config, mockValidator, customId);

        expect(survey.isQuarantined()).toBe(true);

        survey.clearQuarantine();

        expect(survey.isQuarantined()).toBe(false);
      });
    });
  });

  describe('D. Config Integration Tests', () => {
    test('should work with empty config', () => {
      const config: BaseSurveyConfig = {};

      const survey = new TestSurvey(mockUrlBuilder, config, mockValidator);

      expect(survey).toBeDefined();
      expect(survey.isQuarantined()).toBe(false);
    });

    test('should work with quarantine config only', () => {
      const config: BaseSurveyConfig = {
        quarantineConfig: { period: 14 },
      };

      const survey = new TestSurvey(mockUrlBuilder, config, mockValidator);

      expect(survey).toBeDefined();
    });

    test('should work with callbacks config only', () => {
      const config: BaseSurveyConfig = {
        callbacks: {
          onShow: jest.fn(),
          onHide: jest.fn(),
        },
      };

      const survey = new TestSurvey(mockUrlBuilder, config, mockValidator);

      expect(survey).toBeDefined();
    });

    test('should work with both quarantine and callbacks config', () => {
      const config: BaseSurveyConfig = {
        quarantineConfig: { period: 7 },
        callbacks: {
          onShow: jest.fn(),
          onHide: jest.fn(),
          onDestroy: jest.fn(),
        },
      };

      const survey = new TestSurvey(mockUrlBuilder, config, mockValidator);

      expect(survey).toBeDefined();
    });
  });
});
