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
        patchConfig: jest.fn(),
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
        '[Hello Customer SDK] Failed to open survey window. ' +
          'This is usually caused by a popup blocker. ' +
          'Please allow popups for this site to view the survey.',
      );
    });
  });

  describe('D. Popup Blocker Detection', () => {
    test('should detect popup blocker and throw helpful error', () => {
      windowOpenSpy.mockReturnValue(null);

      const config: WindowSurveyConfig = {};
      const survey = new WindowSurvey(mockUrlBuilder, config);

      expect(() => survey.open()).toThrow(
        '[Hello Customer SDK] Failed to open survey window. ' +
          'This is usually caused by a popup blocker. ' +
          'Please allow popups for this site to view the survey.',
      );
    });

    test('should call onError callback with popup blocker error', () => {
      windowOpenSpy.mockReturnValue(null);

      const onError = jest.fn();
      const config: WindowSurveyConfig = {
        callbacks: { onError },
      };

      const survey = new WindowSurvey(mockUrlBuilder, config);

      expect(() => survey.open()).toThrow(CannotOpenWindowException);
      expect(onError).toHaveBeenCalled();
      expect(onError).toHaveBeenCalledWith(
        expect.any(CannotOpenWindowException),
      );
    });

    test('should include troubleshooting hint in error message', () => {
      windowOpenSpy.mockReturnValue(null);

      const config: WindowSurveyConfig = {};
      const survey = new WindowSurvey(mockUrlBuilder, config);

      try {
        survey.open();
        fail('Expected CannotOpenWindowException to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(CannotOpenWindowException);
        const errorMessage = (error as CannotOpenWindowException).message;
        expect(errorMessage).toContain('popup blocker');
        expect(errorMessage).toContain('allow popups for this site');
      }
    });
  });

  describe('E. Lifecycle Methods Tests', () => {
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

  describe('F. Quarantine Integration Tests', () => {
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

  describe('G. URL Integration Tests', () => {
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

  describe('H. Destroy Method Tests', () => {
    test('should have destroy method', () => {
      const config: WindowSurveyConfig = {};

      const survey = new WindowSurvey(mockUrlBuilder, config);

      expect(survey.destroy).toBeDefined();
      expect(typeof survey.destroy).toBe('function');
    });

    test('should close window when destroyed', () => {
      const config: WindowSurveyConfig = {};

      const survey = new WindowSurvey(mockUrlBuilder, config);
      survey.open();

      survey.destroy();

      expect(mockWindow.close).toHaveBeenCalled();
    });

    test('should not throw error when destroy called on unopened survey', () => {
      const config: WindowSurveyConfig = {};

      const survey = new WindowSurvey(mockUrlBuilder, config);

      expect(() => survey.destroy()).not.toThrow();
    });

    test('should not throw error when destroy called twice', () => {
      const config: WindowSurveyConfig = {};

      const survey = new WindowSurvey(mockUrlBuilder, config);
      survey.open();

      survey.destroy();

      expect(() => survey.destroy()).not.toThrow();
    });
  });

  describe('I. Lifecycle Callbacks Tests', () => {
    test('should call onShow when window is opened', () => {
      const onShow = jest.fn();
      const config: WindowSurveyConfig = {
        callbacks: { onShow },
      };

      const survey = new WindowSurvey(mockUrlBuilder, config);
      survey.open();

      expect(onShow).toHaveBeenCalled();
    });

    test('should call onClose when window is closed', () => {
      const onClose = jest.fn();
      const config: WindowSurveyConfig = {
        callbacks: { onClose },
      };

      const survey = new WindowSurvey(mockUrlBuilder, config);
      survey.open();
      survey.close();

      expect(onClose).toHaveBeenCalled();
    });

    test('should call onDestroy when survey is destroyed', () => {
      const onDestroy = jest.fn();
      const config: WindowSurveyConfig = {
        callbacks: { onDestroy },
      };

      const survey = new WindowSurvey(mockUrlBuilder, config);
      survey.open();
      survey.destroy();

      expect(onDestroy).toHaveBeenCalled();
    });

    test('should call onError when popup is blocked', () => {
      windowOpenSpy.mockReturnValue(null);

      const onError = jest.fn();
      const config: WindowSurveyConfig = {
        callbacks: { onError },
      };

      const survey = new WindowSurvey(mockUrlBuilder, config);

      expect(() => survey.open()).toThrow(CannotOpenWindowException);
      expect(onError).toHaveBeenCalled();
      expect(onError).toHaveBeenCalledWith(
        expect.any(CannotOpenWindowException),
      );
    });

    test('should call onQuarantineBlocked when blocked by quarantine', () => {
      // Set quarantine to 2 days ago (5 days remaining for 7-day period)
      const quarantineKey = 'hcSDK.SurveyQuarantineStart:test-survey-id';
      const twoDaysAgo = Date.now() - 2 * 24 * 60 * 60 * 1000;
      localStorageMock.store[quarantineKey] = twoDaysAgo.toString();

      const onQuarantineBlocked = jest.fn();
      const config: WindowSurveyConfig = {
        quarantineConfig: { period: 7 },
        callbacks: { onQuarantineBlocked },
      };

      const survey = new WindowSurvey(mockUrlBuilder, config);
      survey.open();

      expect(onQuarantineBlocked).toHaveBeenCalled();
      expect(onQuarantineBlocked).toHaveBeenCalledWith(5);
    });

    test('should not throw if callbacks are not provided', () => {
      const config: WindowSurveyConfig = {};

      const survey = new WindowSurvey(mockUrlBuilder, config);

      expect(() => {
        survey.open();
        survey.close();
        survey.destroy();
      }).not.toThrow();
    });

    test('should handle destroy calling both onClose and onDestroy', () => {
      const onClose = jest.fn();
      const onDestroy = jest.fn();
      const config: WindowSurveyConfig = {
        callbacks: { onClose, onDestroy },
      };

      const survey = new WindowSurvey(mockUrlBuilder, config);
      survey.open();
      survey.destroy();

      // destroy() calls close() internally, so both should be called
      expect(onClose).toHaveBeenCalled();
      expect(onDestroy).toHaveBeenCalled();
    });
  });

  describe('J. Dynamic URL Updates Tests', () => {
    test('should update URL config for next open()', () => {
      const config: WindowSurveyConfig = {
        openOnCreation: false,
      };

      const survey = new WindowSurvey(mockUrlBuilder, config);
      const urlFactory = mockUrlBuilder.getUrlFactory();

      const patchConfigSpy = jest.spyOn(urlFactory, 'patchConfig');

      survey.updateUrlConfig({
        extra: { source: 'email' },
      });

      expect(patchConfigSpy).toHaveBeenCalledWith({
        extra: { source: 'email' },
      });
    });

    test('should use updated URL when opening window', () => {
      const config: WindowSurveyConfig = {
        openOnCreation: false,
      };

      const survey = new WindowSurvey(mockUrlBuilder, config);
      const urlFactory = mockUrlBuilder.getUrlFactory();

      const newUrl =
        'https://example.com/survey?entry.test=value&entry.source=email';
      (urlFactory.getUrlWithParams as jest.Mock).mockReturnValue(newUrl);

      survey.updateUrlConfig({ extra: { source: 'email' } });
      survey.open();

      expect(windowOpenSpy).toHaveBeenCalledWith(newUrl, '_blank');
    });

    test('should have updateAndReload but warn when called (no reload method)', () => {
      const config: WindowSurveyConfig = {
        openOnCreation: false,
      };

      const survey = new WindowSurvey(mockUrlBuilder, config);
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      // updateAndReload exists but logs warning for WindowSurvey (no reload method)
      survey.updateAndReload({ extra: { test: 'value' } });

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[Hello Customer SDK] updateAndReload not supported for this survey type (no reload method)',
      );

      consoleWarnSpy.mockRestore();
    });

    test('should work with multiple sequential config updates', () => {
      const config: WindowSurveyConfig = {
        openOnCreation: false,
      };

      const survey = new WindowSurvey(mockUrlBuilder, config);
      const urlFactory = mockUrlBuilder.getUrlFactory();

      const patchConfigSpy = jest.spyOn(urlFactory, 'patchConfig');

      survey.updateUrlConfig({ extra: { step: '1' } });
      survey.updateUrlConfig({ extra: { step: '2' } });
      survey.updateUrlConfig({ language: 'FR' });

      expect(patchConfigSpy).toHaveBeenCalledTimes(3);
      expect(patchConfigSpy).toHaveBeenNthCalledWith(1, {
        extra: { step: '1' },
      });
      expect(patchConfigSpy).toHaveBeenNthCalledWith(2, {
        extra: { step: '2' },
      });
      expect(patchConfigSpy).toHaveBeenNthCalledWith(3, { language: 'FR' });
    });
  });
});
