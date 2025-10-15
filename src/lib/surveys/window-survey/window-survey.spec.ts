import { CannotOpenWindowException } from '../../core/exceptions/cannot-open-window.exception';
import { UrlBuilder } from '../../url-builder/url.builder';

import { WindowSurvey } from './window-survey';
import { WindowSurveyConfig } from './window-survey-config.interface';

describe('WindowSurvey', () => {
  let mockUrlBuilder: UrlBuilder;
  let localStorageMock: {
    getItem: jest.Mock;
    setItem: jest.Mock;
    clear: jest.Mock;
    store: Record<string, string>;
  };
  let windowOpenSpy: jest.SpyInstance;
  let mockWindow: Window;

  beforeEach(() => {
    // Mock localStorage
    localStorageMock = (() => {
      let store: Record<string, string> = {};
      return {
        getItem: jest.fn((key: string) => store[key] || null),
        setItem: jest.fn((key: string, value: string) => {
          store[key] = value;
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

    // Mock window.open
    mockWindow = {
      close: jest.fn(),
    } as Partial<Window> as Window;

    windowOpenSpy = jest
      .spyOn(window, 'open')
      .mockReturnValue(mockWindow as Window | null);

    // Create mock UrlBuilder
    mockUrlBuilder = {
      getUrlFactory: jest.fn().mockReturnValue({
        getUrlWithParams: jest
          .fn()
          .mockReturnValue('https://example.com/survey?entry.test=value'),
        getSurveyIdentifier: jest.fn().mockReturnValue('test-survey-id'),
      }),
    } as unknown as UrlBuilder;
  });

  afterEach(() => {
    windowOpenSpy.mockRestore();
    localStorageMock.clear();
  });

  describe('A. Constructor & Validation Tests', () => {
    test('should create WindowSurvey with valid config', () => {
      const config: WindowSurveyConfig = {
        openOnCreation: false,
      };

      const survey = new WindowSurvey(mockUrlBuilder, config);

      expect(survey).toBeDefined();
    });

    test('should create WindowSurvey with empty config', () => {
      const config: WindowSurveyConfig = {};

      const survey = new WindowSurvey(mockUrlBuilder, config);

      expect(survey).toBeDefined();
    });

    test('should open window on creation when openOnCreation is true', () => {
      const config: WindowSurveyConfig = {
        openOnCreation: true,
      };

      new WindowSurvey(mockUrlBuilder, config);

      expect(windowOpenSpy).toHaveBeenCalled();
    });

    test('should not open window on creation when openOnCreation is false', () => {
      const config: WindowSurveyConfig = {
        openOnCreation: false,
      };

      new WindowSurvey(mockUrlBuilder, config);

      expect(windowOpenSpy).not.toHaveBeenCalled();
    });

    test('should not open window on creation when openOnCreation is undefined', () => {
      const config: WindowSurveyConfig = {};

      new WindowSurvey(mockUrlBuilder, config);

      expect(windowOpenSpy).not.toHaveBeenCalled();
    });

    test('should validate openOnCreation as boolean', () => {
      const config = {
        openOnCreation: 'true',
      } as unknown as WindowSurveyConfig;

      expect(() => new WindowSurvey(mockUrlBuilder, config)).toThrow();
    });

    test('should validate openNewWindow as boolean', () => {
      const config = {
        openNewWindow: 'true',
      } as unknown as WindowSurveyConfig;

      expect(() => new WindowSurvey(mockUrlBuilder, config)).toThrow();
    });
  });

  describe('B. Window Opening Tests', () => {
    test('should call window.open with correct URL', () => {
      const config: WindowSurveyConfig = {};

      const survey = new WindowSurvey(mockUrlBuilder, config);
      survey.open();

      expect(windowOpenSpy).toHaveBeenCalledWith(
        'https://example.com/survey?entry.test=value',
        '_blank',
      );
    });

    test('should open new tab when openNewWindow is false', () => {
      const config: WindowSurveyConfig = {
        openNewWindow: false,
      };

      const survey = new WindowSurvey(mockUrlBuilder, config);
      survey.open();

      expect(windowOpenSpy).toHaveBeenCalledWith(
        'https://example.com/survey?entry.test=value',
        '_blank',
      );
    });

    test('should open new window when openNewWindow is true', () => {
      const config: WindowSurveyConfig = {
        openNewWindow: true,
      };

      const survey = new WindowSurvey(mockUrlBuilder, config);
      survey.open();

      expect(windowOpenSpy).toHaveBeenCalledWith(
        'https://example.com/survey?entry.test=value',
        '_blank',
        'toolbar=0,location=0,menubar=0,height=800,width=700',
      );
    });

    test('should store window handle', () => {
      const config: WindowSurveyConfig = {};

      const survey = new WindowSurvey(mockUrlBuilder, config);
      survey.open();

      expect(survey.window).toBe(mockWindow);
    });

    test('should expose window handle via getter', () => {
      const config: WindowSurveyConfig = {};

      const survey = new WindowSurvey(mockUrlBuilder, config);

      expect(survey.window).toBeUndefined();

      survey.open();

      expect(survey.window).toBeDefined();
    });

    test('should handle multiple open calls', () => {
      const config: WindowSurveyConfig = {};

      const survey = new WindowSurvey(mockUrlBuilder, config);

      // Clear localStorage to avoid quarantine
      localStorageMock.clear();

      survey.open();
      expect(windowOpenSpy).toHaveBeenCalledTimes(1);

      // Clear localStorage again for second open
      localStorageMock.clear();

      survey.open();
      expect(windowOpenSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('C. Error Handling Tests', () => {
    test('should throw CannotOpenWindowException when window.open returns null', () => {
      windowOpenSpy.mockReturnValue(null);

      const config: WindowSurveyConfig = {};

      const survey = new WindowSurvey(mockUrlBuilder, config);

      expect(() => survey.open()).toThrow(CannotOpenWindowException);
    });

    test('should throw CannotOpenWindowException when window.open returns undefined', () => {
      windowOpenSpy.mockReturnValue(undefined as unknown as Window | null);

      const config: WindowSurveyConfig = {};

      const survey = new WindowSurvey(mockUrlBuilder, config);

      expect(() => survey.open()).toThrow(CannotOpenWindowException);
    });

    test('should include helpful message in exception', () => {
      windowOpenSpy.mockReturnValue(null);

      const config: WindowSurveyConfig = {};

      const survey = new WindowSurvey(mockUrlBuilder, config);

      expect(() => survey.open()).toThrow(
        '[Hello Customer SDK] Cannot open window - check Your browser!',
      );
    });
  });

  describe('D. Lifecycle Methods Tests', () => {
    test('should close window when close is called', () => {
      const config: WindowSurveyConfig = {};

      const survey = new WindowSurvey(mockUrlBuilder, config);
      survey.open();

      survey.close();

      expect(mockWindow.close).toHaveBeenCalled();
    });

    test('should handle close when window handle is null', () => {
      const config: WindowSurveyConfig = {};

      const survey = new WindowSurvey(mockUrlBuilder, config);

      // Should not throw
      expect(() => survey.close()).not.toThrow();
    });

    test('should handle close when window handle is undefined', () => {
      const config: WindowSurveyConfig = {
        openOnCreation: false,
      };

      const survey = new WindowSurvey(mockUrlBuilder, config);

      // Should not throw
      expect(() => survey.close()).not.toThrow();
    });
  });

  describe('E. Quarantine Integration Tests', () => {
    test('should not open window when under quarantine', () => {
      // Set quarantine in localStorage
      const quarantineKey = 'hcSDK.SurveyQuarantineStart:test-survey-id';
      localStorageMock.store[quarantineKey] = Date.now().toString();

      const config: WindowSurveyConfig = {
        quarantineConfig: { period: 7 },
      };

      const survey = new WindowSurvey(mockUrlBuilder, config);
      survey.open();

      expect(windowOpenSpy).not.toHaveBeenCalled();
    });

    test('should start quarantine when window is opened', () => {
      const config: WindowSurveyConfig = {
        quarantineConfig: { period: 7 },
      };

      const survey = new WindowSurvey(mockUrlBuilder, config);
      survey.open();

      expect(localStorageMock.setItem).toHaveBeenCalled();
      const setItemCalls = localStorageMock.setItem.mock.calls;
      const quarantineCall = setItemCalls.find((call) =>
        call[0].includes('hcSDK.SurveyQuarantineStart'),
      );
      expect(quarantineCall).toBeDefined();
    });

    test('should not start quarantine when popup is blocked', () => {
      windowOpenSpy.mockReturnValue(null);

      const config: WindowSurveyConfig = {
        quarantineConfig: { period: 7 },
      };

      const survey = new WindowSurvey(mockUrlBuilder, config);

      expect(() => survey.open()).toThrow(CannotOpenWindowException);

      // Quarantine should not be started
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });

    test('should work without quarantine config', () => {
      const config: WindowSurveyConfig = {};

      const survey = new WindowSurvey(mockUrlBuilder, config);
      survey.open();

      expect(windowOpenSpy).toHaveBeenCalled();
    });

    test('should open on creation when not under quarantine', () => {
      const config: WindowSurveyConfig = {
        openOnCreation: true,
        quarantineConfig: { period: 7 },
      };

      new WindowSurvey(mockUrlBuilder, config);

      expect(windowOpenSpy).toHaveBeenCalled();
    });

    test('should not open on creation when under quarantine', () => {
      // Set quarantine in localStorage
      const quarantineKey = 'hcSDK.SurveyQuarantineStart:test-survey-id';
      localStorageMock.store[quarantineKey] = Date.now().toString();

      const config: WindowSurveyConfig = {
        openOnCreation: true,
        quarantineConfig: { period: 7 },
      };

      new WindowSurvey(mockUrlBuilder, config);

      expect(windowOpenSpy).not.toHaveBeenCalled();
    });

    test('should respect quarantine period', () => {
      // Set quarantine that expired 8 days ago
      const quarantineKey = 'hcSDK.SurveyQuarantineStart:test-survey-id';
      const eightDaysAgo = Date.now() - 8 * 24 * 60 * 60 * 1000;
      localStorageMock.store[quarantineKey] = eightDaysAgo.toString();

      const config: WindowSurveyConfig = {
        quarantineConfig: { period: 7 },
      };

      const survey = new WindowSurvey(mockUrlBuilder, config);
      survey.open();

      // Should open because quarantine period (7 days) has passed
      expect(windowOpenSpy).toHaveBeenCalled();
    });
  });

  describe('F. URL Integration Tests', () => {
    test('should get URL from urlFactory when opening', () => {
      const config: WindowSurveyConfig = {};

      const survey = new WindowSurvey(mockUrlBuilder, config);
      survey.open();

      const urlFactory = mockUrlBuilder.getUrlFactory();
      expect(urlFactory.getUrlWithParams).toHaveBeenCalled();
    });

    test('should get survey identifier from urlFactory for quarantine', () => {
      const config: WindowSurveyConfig = {
        quarantineConfig: { period: 7 },
      };

      new WindowSurvey(mockUrlBuilder, config);

      const urlFactory = mockUrlBuilder.getUrlFactory();
      expect(urlFactory.getSurveyIdentifier).toHaveBeenCalled();
    });
  });
});
