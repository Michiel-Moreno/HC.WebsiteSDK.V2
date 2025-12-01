import { InvalidQuerySelectorException } from '../../core/exceptions/invalid-query-selector.exception';
import { StyledElementFactory } from '../../core/factories/styled-element.factory';
import { UrlBuilder } from '../../url-builder/url.builder';

import { InlineSurvey } from './inline-survey';
import { InlineSurveyConfig } from './inline-survey-config.interface';

describe('InlineSurvey', () => {
  let mockUrlBuilder: UrlBuilder;
  let localStorageMock: {
    getItem: jest.Mock;
    setItem: jest.Mock;
    clear: jest.Mock;
    store: Record<string, string>;
  };

  beforeEach(() => {
    // Clean up DOM
    document.body.innerHTML = '';

    // Clear style cache to prevent CSS accumulation between tests
    StyledElementFactory.clearStyleCache();

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

    // Create mock UrlBuilder
    mockUrlBuilder = {
      getUrlFactory: jest.fn().mockReturnValue({
        getUrlWithParams: jest
          .fn()
          .mockReturnValue('https://example.com/survey?entry.test=value'),
        getSurveyIdentifier: jest.fn().mockReturnValue('test-survey-id'),
        patchConfig: jest.fn(),
        getBaseUrlWithLanguage: jest
          .fn()
          .mockReturnValue('https://example.com/EN/tenant-id/touchpoint-id'),
      }),
    } as unknown as UrlBuilder;
  });

  afterEach(() => {
    document.body.innerHTML = '';
    localStorageMock.clear();
    StyledElementFactory.clearStyleCache();
  });

  describe('A. Constructor & Validation Tests', () => {
    test('should create InlineSurvey with valid config', () => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
      };

      const survey = new InlineSurvey(mockUrlBuilder, config);

      expect(survey).toBeDefined();
      expect(survey.iFrame).toBeDefined();
    });

    test('should throw InvalidQuerySelectorException when selector not found', () => {
      const config: InlineSurveyConfig = {
        elementSelector: '#nonexistent',
      };

      expect(() => new InlineSurvey(mockUrlBuilder, config)).toThrow(
        InvalidQuerySelectorException,
      );
    });

    test('should throw error when elementSelector is missing', () => {
      const config = {} as InlineSurveyConfig;

      // Create container to avoid query selector error
      const container = document.createElement('div');
      container.id = 'test';
      document.body.appendChild(container);

      expect(() => new InlineSurvey(mockUrlBuilder, config)).toThrow();
    });

    test('should validate iFrameCssClasses as array', () => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      const config = {
        elementSelector: '#survey-container',
        iFrameCssClasses: 'not-an-array',
      } as unknown as InlineSurveyConfig;

      expect(() => new InlineSurvey(mockUrlBuilder, config)).toThrow();
    });
  });

  describe('B. DOM Creation Tests', () => {
    test('should create iframe element and insert into DOM', () => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
      };

      const survey = new InlineSurvey(mockUrlBuilder, config);

      expect(survey.iFrame).toBeDefined();
      expect(survey.iFrame.tagName).toBe('IFRAME');
      expect(container.contains(survey.iFrame)).toBe(true);
    });

    test('should apply fillContainer styles when enabled', () => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
        fillContainer: true,
      };

      const survey = new InlineSurvey(mockUrlBuilder, config);

      expect(survey.iFrame.style.height).toBe('100%');
      expect(survey.iFrame.style.width).toBe('100%');
    });

    test('should not apply fillContainer styles when disabled', () => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
        fillContainer: false,
      };

      const survey = new InlineSurvey(mockUrlBuilder, config);

      expect(survey.iFrame.style.height).toBe('');
      expect(survey.iFrame.style.width).toBe('');
    });

    test('should apply custom CSS classes to iframe', () => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
        iFrameCssClasses: ['custom-class-1', 'custom-class-2'],
      };

      const survey = new InlineSurvey(mockUrlBuilder, config);

      expect(survey.iFrame.classList.contains('custom-class-1')).toBe(true);
      expect(survey.iFrame.classList.contains('custom-class-2')).toBe(true);
    });

    test('should apply custom inline styles to iframe', () => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
        iFrameInlineStylesRules: {
          border: '2px solid red',
          backgroundColor: 'blue',
        } as Partial<CSSStyleDeclaration>,
      };

      const survey = new InlineSurvey(mockUrlBuilder, config);

      expect(survey.iFrame.style.border).toBe('2px solid red');
      expect(survey.iFrame.style.backgroundColor).toBe('blue');
    });

    test('should set iframe src from urlFactory', () => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
      };

      const survey = new InlineSurvey(mockUrlBuilder, config);

      expect(survey.iFrame.src).toBe(
        'https://example.com/survey?entry.test=value',
      );
    });
  });

  describe('C. Lifecycle Methods Tests', () => {
    test('should show iframe by setting display to empty string', () => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
      };

      const survey = new InlineSurvey(mockUrlBuilder, config);

      // First hide it
      survey.hide();
      expect(survey.iFrame.style.display).toBe('none');

      // Then show it
      survey.show();
      expect(survey.iFrame.style.display).toBe('');
    });

    test('should hide iframe by setting display to none', () => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
      };

      const survey = new InlineSurvey(mockUrlBuilder, config);

      survey.hide();

      expect(survey.iFrame.style.display).toBe('none');
    });

    test('should reload iframe by updating src', () => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
      };

      const survey = new InlineSurvey(mockUrlBuilder, config);

      // Update the mock to return a different URL
      const urlFactory = mockUrlBuilder.getUrlFactory();
      (urlFactory.getUrlWithParams as jest.Mock).mockReturnValue(
        'https://example.com/new-survey',
      );

      survey.reload();

      expect(survey.iFrame.src).toBe('https://example.com/new-survey');
    });

    test('should remove iframe from DOM when destroy is called', () => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
      };

      const survey = new InlineSurvey(mockUrlBuilder, config);

      expect(container.contains(survey.iFrame)).toBe(true);

      survey.destroy();

      expect(container.contains(survey.iFrame)).toBe(false);
    });

    test('should handle destroy when iframe has no parent', () => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
      };

      const survey = new InlineSurvey(mockUrlBuilder, config);

      // Remove iframe manually first
      container.removeChild(survey.iFrame);

      // Should not throw error
      expect(() => survey.destroy()).not.toThrow();
    });
  });

  describe('D. Quarantine Integration Tests', () => {
    test('should hide survey if under quarantine on creation', () => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      // Set quarantine in localStorage
      const quarantineKey = 'hcSDK.SurveyQuarantineStart:test-survey-id';
      localStorageMock.store[quarantineKey] = Date.now().toString();

      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
        quarantineConfig: { period: 7 },
      };

      const survey = new InlineSurvey(mockUrlBuilder, config);

      expect(survey.iFrame.style.display).toBe('none');
    });

    test('should start quarantine when not under quarantine', () => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
        quarantineConfig: { period: 7 },
      };

      new InlineSurvey(mockUrlBuilder, config);

      expect(localStorageMock.setItem).toHaveBeenCalled();
      const setItemCalls = localStorageMock.setItem.mock.calls;
      const quarantineCall = setItemCalls.find((call) =>
        call[0].includes('hcSDK.SurveyQuarantineStart'),
      );
      expect(quarantineCall).toBeDefined();
    });

    test('should not show survey when under quarantine', () => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      // Set quarantine in localStorage
      const quarantineKey = 'hcSDK.SurveyQuarantineStart:test-survey-id';
      localStorageMock.store[quarantineKey] = Date.now().toString();

      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
        quarantineConfig: { period: 7 },
      };

      const survey = new InlineSurvey(mockUrlBuilder, config);

      survey.show();

      // Should remain hidden
      expect(survey.iFrame.style.display).toBe('none');
    });

    test('should show survey when not under quarantine', () => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
        quarantineConfig: { period: 7 },
      };

      const survey = new InlineSurvey(mockUrlBuilder, config);

      // Hide it first
      survey.hide();
      expect(survey.iFrame.style.display).toBe('none');

      // Clear localStorage to simulate quarantine ended
      localStorageMock.clear();

      survey.show();

      expect(survey.iFrame.style.display).toBe('');
    });

    test('should work without quarantine config', () => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
      };

      const survey = new InlineSurvey(mockUrlBuilder, config);

      expect(survey).toBeDefined();
      survey.show();
      expect(survey.iFrame.style.display).toBe('');
    });
  });

  describe('E. URL Integration Tests', () => {
    test('should get URL from urlFactory on creation', () => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
      };

      new InlineSurvey(mockUrlBuilder, config);

      const urlFactory = mockUrlBuilder.getUrlFactory();
      expect(urlFactory.getUrlWithParams).toHaveBeenCalled();
    });

    test('should get survey identifier from urlFactory for quarantine', () => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
        quarantineConfig: { period: 7 },
      };

      new InlineSurvey(mockUrlBuilder, config);

      const urlFactory = mockUrlBuilder.getUrlFactory();
      expect(urlFactory.getSurveyIdentifier).toHaveBeenCalled();
    });

    test('should expose iFrame getter', () => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
      };

      const survey = new InlineSurvey(mockUrlBuilder, config);

      expect(survey.iFrame).toBeDefined();
      expect(survey.iFrame.tagName).toBe('IFRAME');
    });
  });

  describe('F. Lifecycle Callbacks Tests', () => {
    test('should call onShow when survey is shown', () => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      const onShow = jest.fn();
      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
        callbacks: { onShow },
      };

      const survey = new InlineSurvey(mockUrlBuilder, config);

      // Hide first, then show to trigger callback
      survey.hide();
      localStorageMock.clear();
      survey.show();

      expect(onShow).toHaveBeenCalled();
    });

    test('should call onHide when survey is hidden', () => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      const onHide = jest.fn();
      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
        callbacks: { onHide },
      };

      const survey = new InlineSurvey(mockUrlBuilder, config);
      survey.hide();

      expect(onHide).toHaveBeenCalled();
    });

    test('should call onDestroy when survey is destroyed', () => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      const onDestroy = jest.fn();
      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
        callbacks: { onDestroy },
      };

      const survey = new InlineSurvey(mockUrlBuilder, config);
      survey.destroy();

      expect(onDestroy).toHaveBeenCalled();
    });

    test('should call onLoad when iframe loads', (done) => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      const onLoad = jest.fn((iframe) => {
        expect(iframe).toBeDefined();
        expect(iframe.tagName).toBe('IFRAME');
        done();
      });

      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
        callbacks: { onLoad },
      };

      const survey = new InlineSurvey(mockUrlBuilder, config);

      // Trigger load event
      const loadEvent = new Event('load');
      survey.iFrame.dispatchEvent(loadEvent);
    });

    test('should call onError when iframe fails to load', () => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      const onError = jest.fn();
      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
        callbacks: { onError },
      };

      const survey = new InlineSurvey(mockUrlBuilder, config);

      // Trigger error event
      const errorEvent = new Event('error');
      survey.iFrame.dispatchEvent(errorEvent);

      expect(onError).toHaveBeenCalled();
      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });

    test('should call onQuarantineBlocked when blocked by quarantine', () => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      // Set quarantine to 2 days ago (5 days remaining for 7-day period)
      const quarantineKey = 'hcSDK.SurveyQuarantineStart:test-survey-id';
      const twoDaysAgo = Date.now() - 2 * 24 * 60 * 60 * 1000;
      localStorageMock.store[quarantineKey] = twoDaysAgo.toString();

      const onQuarantineBlocked = jest.fn();
      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
        quarantineConfig: { period: 7 },
        callbacks: { onQuarantineBlocked },
      };

      const survey = new InlineSurvey(mockUrlBuilder, config);
      survey.show();

      expect(onQuarantineBlocked).toHaveBeenCalled();
      expect(onQuarantineBlocked).toHaveBeenCalledWith(5);
    });

    test('should not throw if callbacks are not provided', () => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
      };

      const survey = new InlineSurvey(mockUrlBuilder, config);

      expect(() => {
        survey.show();
        survey.hide();
        survey.destroy();
      }).not.toThrow();
    });

    test('should handle multiple callbacks being called', () => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      const onShow = jest.fn();
      const onHide = jest.fn();
      const onDestroy = jest.fn();

      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
        callbacks: { onShow, onHide, onDestroy },
      };

      const survey = new InlineSurvey(mockUrlBuilder, config);

      survey.hide();
      localStorageMock.clear();
      survey.show();
      survey.hide();
      survey.destroy();

      expect(onShow).toHaveBeenCalledTimes(1);
      expect(onHide).toHaveBeenCalledTimes(2);
      expect(onDestroy).toHaveBeenCalledTimes(1);
    });
  });

  describe('G. Dynamic URL Updates Tests', () => {
    test('should update URL config without recreating survey', () => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
      };

      const survey = new InlineSurvey(mockUrlBuilder, config);
      const urlFactory = mockUrlBuilder.getUrlFactory();

      // Mock patchConfig
      const patchConfigSpy = jest.spyOn(urlFactory, 'patchConfig');

      survey.updateUrlConfig({
        extra: { newData: 'test' },
      });

      expect(patchConfigSpy).toHaveBeenCalledWith({
        extra: { newData: 'test' },
      });
    });

    test('should update and reload with updateAndReload', () => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
      };

      const survey = new InlineSurvey(mockUrlBuilder, config);
      const urlFactory = mockUrlBuilder.getUrlFactory();

      const newUrl =
        'https://example.com/survey?entry.test=value&entry.userId=123';

      (urlFactory.getUrlWithParams as jest.Mock).mockReturnValue(newUrl);

      survey.updateAndReload({
        extra: { userId: '123' },
      });

      expect(survey.iFrame.src).toBe(newUrl);
    });

    test('should merge nested extra config correctly', () => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
      };

      const survey = new InlineSurvey(mockUrlBuilder, config);
      const urlFactory = mockUrlBuilder.getUrlFactory();

      const patchConfigSpy = jest.spyOn(urlFactory, 'patchConfig');

      survey.updateUrlConfig({
        extra: {
          respondent: { id: '123', email: 'user@example.com' },
          metadata: { source: 'web' },
        },
      });

      expect(patchConfigSpy).toHaveBeenCalledWith({
        extra: {
          respondent: { id: '123', email: 'user@example.com' },
          metadata: { source: 'web' },
        },
      });
    });

    test('should call patchConfig and reload separately', () => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
      };

      const survey = new InlineSurvey(mockUrlBuilder, config);
      const urlFactory = mockUrlBuilder.getUrlFactory();

      const patchConfigSpy = jest.spyOn(urlFactory, 'patchConfig');
      const getUrlWithParamsSpy = jest.spyOn(urlFactory, 'getUrlWithParams');

      const newUrl = 'https://example.com/survey?entry.language=FR';
      (getUrlWithParamsSpy as jest.Mock).mockReturnValue(newUrl);

      survey.updateAndReload({
        language: 'FR',
      });

      expect(patchConfigSpy).toHaveBeenCalledWith({ language: 'FR' });
      expect(getUrlWithParamsSpy).toHaveBeenCalled();
      expect(survey.iFrame.src).toBe(newUrl);
    });

    test('should work with multiple sequential updates', () => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
      };

      const survey = new InlineSurvey(mockUrlBuilder, config);
      const urlFactory = mockUrlBuilder.getUrlFactory();

      const patchConfigSpy = jest.spyOn(urlFactory, 'patchConfig');

      survey.updateUrlConfig({ extra: { step: '1' } });
      survey.updateUrlConfig({ extra: { step: '2' } });
      survey.updateUrlConfig({ extra: { step: '3' } });

      expect(patchConfigSpy).toHaveBeenCalledTimes(3);
      expect(patchConfigSpy).toHaveBeenNthCalledWith(1, {
        extra: { step: '1' },
      });
      expect(patchConfigSpy).toHaveBeenNthCalledWith(2, {
        extra: { step: '2' },
      });
      expect(patchConfigSpy).toHaveBeenNthCalledWith(3, {
        extra: { step: '3' },
      });
    });
  });

  describe('H. PostMessage Communication Tests', () => {
    describe('sendMessage', () => {
      test('should send message to iframe', () => {
        const container = document.createElement('div');
        container.id = 'survey-container';
        document.body.appendChild(container);

        const config: InlineSurveyConfig = {
          elementSelector: '#survey-container',
        };

        const survey = new InlineSurvey(mockUrlBuilder, config);
        const postMessageSpy = jest.fn();

        // Mock contentWindow
        Object.defineProperty(survey.iFrame, 'contentWindow', {
          value: { postMessage: postMessageSpy },
          writable: true,
          configurable: true,
        });

        survey.sendMessage({ type: 'test' });

        expect(postMessageSpy).toHaveBeenCalledWith(
          { type: 'test' },
          'https://example.com/EN/tenant-id/touchpoint-id',
        );
      });

      test('should send message with custom target origin', () => {
        const container = document.createElement('div');
        container.id = 'survey-container';
        document.body.appendChild(container);

        const config: InlineSurveyConfig = {
          elementSelector: '#survey-container',
        };

        const survey = new InlineSurvey(mockUrlBuilder, config);
        const postMessageSpy = jest.fn();

        Object.defineProperty(survey.iFrame, 'contentWindow', {
          value: { postMessage: postMessageSpy },
          writable: true,
          configurable: true,
        });

        survey.sendMessage({ type: 'test' }, 'https://custom.com');

        expect(postMessageSpy).toHaveBeenCalledWith(
          { type: 'test' },
          'https://custom.com',
        );
      });

      test('should throw if iframe not ready', () => {
        const container = document.createElement('div');
        container.id = 'survey-container';
        document.body.appendChild(container);

        const config: InlineSurveyConfig = {
          elementSelector: '#survey-container',
        };

        const survey = new InlineSurvey(mockUrlBuilder, config);

        Object.defineProperty(survey.iFrame, 'contentWindow', {
          value: null,
          writable: true,
          configurable: true,
        });

        expect(() => survey.sendMessage({ type: 'test' })).toThrow(
          'Iframe not ready',
        );
      });
    });

    describe('onMessage', () => {
      test('should receive messages from iframe', () => {
        const container = document.createElement('div');
        container.id = 'survey-container';
        document.body.appendChild(container);

        const config: InlineSurveyConfig = {
          elementSelector: '#survey-container',
        };

        const survey = new InlineSurvey(mockUrlBuilder, config);
        const callback = jest.fn();

        survey.onMessage(callback);

        // Simulate message from iframe
        const event = new MessageEvent('message', {
          data: { type: 'survey_completed' },
          origin: 'https://example.com',
        });
        window.dispatchEvent(event);

        expect(callback).toHaveBeenCalledWith({ type: 'survey_completed' });
      });

      test('should reject messages from wrong origin', () => {
        const container = document.createElement('div');
        container.id = 'survey-container';
        document.body.appendChild(container);

        const config: InlineSurveyConfig = {
          elementSelector: '#survey-container',
        };

        const survey = new InlineSurvey(mockUrlBuilder, config);
        const callback = jest.fn();
        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

        survey.onMessage(callback);

        // Message from wrong origin
        const event = new MessageEvent('message', {
          data: { type: 'malicious' },
          origin: 'https://evil.com',
        });
        window.dispatchEvent(event);

        expect(callback).not.toHaveBeenCalled();
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('unexpected origin'),
        );

        consoleWarnSpy.mockRestore();
      });

      test('should clean up listeners when cleanup function called', () => {
        const container = document.createElement('div');
        container.id = 'survey-container';
        document.body.appendChild(container);

        const config: InlineSurveyConfig = {
          elementSelector: '#survey-container',
        };

        const survey = new InlineSurvey(mockUrlBuilder, config);
        const callback = jest.fn();

        const cleanup = survey.onMessage(callback);
        cleanup();

        // Message after cleanup
        const event = new MessageEvent('message', {
          data: { type: 'test' },
          origin: 'https://example.com',
        });
        window.dispatchEvent(event);

        expect(callback).not.toHaveBeenCalled();
      });

      test('should clean up listeners on destroy', () => {
        const container = document.createElement('div');
        container.id = 'survey-container';
        document.body.appendChild(container);

        const config: InlineSurveyConfig = {
          elementSelector: '#survey-container',
        };

        const survey = new InlineSurvey(mockUrlBuilder, config);
        const callback = jest.fn();

        survey.onMessage(callback);
        survey.destroy();

        // Message after destroy
        const event = new MessageEvent('message', {
          data: { type: 'test' },
          origin: 'https://example.com',
        });
        window.dispatchEvent(event);

        expect(callback).not.toHaveBeenCalled();
      });

      test('should handle multiple messages', () => {
        const container = document.createElement('div');
        container.id = 'survey-container';
        document.body.appendChild(container);

        const config: InlineSurveyConfig = {
          elementSelector: '#survey-container',
        };

        const survey = new InlineSurvey(mockUrlBuilder, config);
        const callback = jest.fn();

        survey.onMessage(callback);

        // Send multiple messages
        const event1 = new MessageEvent('message', {
          data: { type: 'message1' },
          origin: 'https://example.com',
        });
        const event2 = new MessageEvent('message', {
          data: { type: 'message2' },
          origin: 'https://example.com',
        });

        window.dispatchEvent(event1);
        window.dispatchEvent(event2);

        expect(callback).toHaveBeenCalledTimes(2);
        expect(callback).toHaveBeenNthCalledWith(1, { type: 'message1' });
        expect(callback).toHaveBeenNthCalledWith(2, { type: 'message2' });
      });
    });
  });

  describe('I. DOM Removal Detection Tests', () => {
    test('should trigger onDestroy when iframe removed from DOM', (done) => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      const onDestroy = jest.fn(() => {
        expect(onDestroy).toHaveBeenCalledTimes(1);
        done();
      });

      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
        callbacks: { onDestroy },
      };

      const survey = new InlineSurvey(mockUrlBuilder, config);

      // Remove iframe directly from container
      setTimeout(() => {
        container.removeChild(survey.iFrame);
      }, 10);
    });

    test('should trigger onDestroy when container removed from DOM', (done) => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      const onDestroy = jest.fn(() => {
        expect(onDestroy).toHaveBeenCalledTimes(1);
        done();
      });

      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
        callbacks: { onDestroy },
      };

      new InlineSurvey(mockUrlBuilder, config);

      // Remove entire container from DOM
      setTimeout(() => {
        document.body.removeChild(container);
      }, 10);
    });

    test('should not trigger onDestroy twice if manually destroyed then removed', () => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      const onDestroy = jest.fn();
      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
        callbacks: { onDestroy },
      };

      const survey = new InlineSurvey(mockUrlBuilder, config);

      // Manually destroy first
      survey.destroy();
      expect(onDestroy).toHaveBeenCalledTimes(1);

      // Try to remove from DOM (should not trigger callback again)
      if (container.contains(survey.iFrame)) {
        container.removeChild(survey.iFrame);
      }

      // Wait a bit to ensure no additional callbacks
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(onDestroy).toHaveBeenCalledTimes(1);
          resolve();
        }, 50);
      });
    });

    test('should clean up observer on manual destroy', () => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      const onDestroy = jest.fn();
      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
        callbacks: { onDestroy },
      };

      const survey = new InlineSurvey(mockUrlBuilder, config);

      // Manually destroy
      survey.destroy();

      expect(onDestroy).toHaveBeenCalledTimes(1);

      // Verify observer is cleaned up by checking domRemovalCleanup is undefined
      expect(survey['domRemovalCleanup']).toBeUndefined();
    });

    test('should handle rapid create/destroy without memory leaks', () => {
      const containers: HTMLDivElement[] = [];

      // Create and destroy 100 surveys
      for (let i = 0; i < 100; i++) {
        const container = document.createElement('div');
        container.id = `survey-container-${i}`;
        document.body.appendChild(container);
        containers.push(container);

        const onDestroy = jest.fn();
        const config: InlineSurveyConfig = {
          elementSelector: `#survey-container-${i}`,
          callbacks: { onDestroy },
        };

        const survey = new InlineSurvey(mockUrlBuilder, config);

        // Immediately destroy
        survey.destroy();

        expect(onDestroy).toHaveBeenCalledTimes(1);
        expect(survey['domRemovalCleanup']).toBeUndefined();
      }

      // Clean up containers
      containers.forEach((container) => {
        if (document.body.contains(container)) {
          document.body.removeChild(container);
        }
      });

      // Verify all cleaned up
      expect(document.body.children.length).toBe(0);
    });
  });

  describe('J. Auto-Height Tests', () => {
    test('should set up auto-height listener when autoHeight is enabled', () => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
        autoHeight: true,
      };

      const survey = new InlineSurvey(mockUrlBuilder, config);

      // Send a resize message
      const event = new MessageEvent('message', {
        data: { type: 'hc:resize', height: 500 },
        origin: 'https://example.com',
      });
      window.dispatchEvent(event);

      expect(survey.iFrame.style.height).toBe('500px');
    });

    test('should not set up auto-height listener when autoHeight is disabled', () => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
        autoHeight: false,
      };

      const survey = new InlineSurvey(mockUrlBuilder, config);

      // Send a resize message
      const event = new MessageEvent('message', {
        data: { type: 'hc:resize', height: 500 },
        origin: 'https://example.com',
      });
      window.dispatchEvent(event);

      // Height should not be set
      expect(survey.iFrame.style.height).toBe('');
    });

    test('should ignore messages with wrong type', () => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
        autoHeight: true,
      };

      const survey = new InlineSurvey(mockUrlBuilder, config);

      // Send a message with wrong type
      const event = new MessageEvent('message', {
        data: { type: 'other:resize', height: 500 },
        origin: 'https://example.com',
      });
      window.dispatchEvent(event);

      // Height should not be set
      expect(survey.iFrame.style.height).toBe('');
    });

    test('should ignore messages without height property', () => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
        autoHeight: true,
      };

      const survey = new InlineSurvey(mockUrlBuilder, config);

      // Send a message without height
      const event = new MessageEvent('message', {
        data: { type: 'hc:resize' },
        origin: 'https://example.com',
      });
      window.dispatchEvent(event);

      // Height should not be set
      expect(survey.iFrame.style.height).toBe('');
    });

    test('should ignore messages with non-numeric height', () => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
        autoHeight: true,
      };

      const survey = new InlineSurvey(mockUrlBuilder, config);

      // Send a message with string height
      const event = new MessageEvent('message', {
        data: { type: 'hc:resize', height: '500px' },
        origin: 'https://example.com',
      });
      window.dispatchEvent(event);

      // Height should not be set
      expect(survey.iFrame.style.height).toBe('');
    });

    test('should apply minHeight constraint', () => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
        autoHeight: true,
        minHeight: 400,
      };

      const survey = new InlineSurvey(mockUrlBuilder, config);

      // Send a resize message with height below minHeight
      const event = new MessageEvent('message', {
        data: { type: 'hc:resize', height: 200 },
        origin: 'https://example.com',
      });
      window.dispatchEvent(event);

      // Should be clamped to minHeight
      expect(survey.iFrame.style.height).toBe('400px');
    });

    test('should apply maxHeight constraint', () => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
        autoHeight: true,
        maxHeight: 600,
      };

      const survey = new InlineSurvey(mockUrlBuilder, config);

      // Send a resize message with height above maxHeight
      const event = new MessageEvent('message', {
        data: { type: 'hc:resize', height: 1000 },
        origin: 'https://example.com',
      });
      window.dispatchEvent(event);

      // Should be clamped to maxHeight
      expect(survey.iFrame.style.height).toBe('600px');
    });

    test('should apply both minHeight and maxHeight constraints', () => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
        autoHeight: true,
        minHeight: 300,
        maxHeight: 800,
      };

      const survey = new InlineSurvey(mockUrlBuilder, config);

      // Test below minHeight
      const event1 = new MessageEvent('message', {
        data: { type: 'hc:resize', height: 100 },
        origin: 'https://example.com',
      });
      window.dispatchEvent(event1);
      expect(survey.iFrame.style.height).toBe('300px');

      // Test above maxHeight
      const event2 = new MessageEvent('message', {
        data: { type: 'hc:resize', height: 1200 },
        origin: 'https://example.com',
      });
      window.dispatchEvent(event2);
      expect(survey.iFrame.style.height).toBe('800px');

      // Test within range
      const event3 = new MessageEvent('message', {
        data: { type: 'hc:resize', height: 500 },
        origin: 'https://example.com',
      });
      window.dispatchEvent(event3);
      expect(survey.iFrame.style.height).toBe('500px');
    });

    test('should allow height exactly at minHeight', () => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
        autoHeight: true,
        minHeight: 400,
      };

      const survey = new InlineSurvey(mockUrlBuilder, config);

      const event = new MessageEvent('message', {
        data: { type: 'hc:resize', height: 400 },
        origin: 'https://example.com',
      });
      window.dispatchEvent(event);

      expect(survey.iFrame.style.height).toBe('400px');
    });

    test('should allow height exactly at maxHeight', () => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
        autoHeight: true,
        maxHeight: 800,
      };

      const survey = new InlineSurvey(mockUrlBuilder, config);

      const event = new MessageEvent('message', {
        data: { type: 'hc:resize', height: 800 },
        origin: 'https://example.com',
      });
      window.dispatchEvent(event);

      expect(survey.iFrame.style.height).toBe('800px');
    });

    test('should clean up auto-height listener on destroy', () => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
        autoHeight: true,
      };

      const survey = new InlineSurvey(mockUrlBuilder, config);

      // First verify auto-height works
      const event1 = new MessageEvent('message', {
        data: { type: 'hc:resize', height: 500 },
        origin: 'https://example.com',
      });
      window.dispatchEvent(event1);
      expect(survey.iFrame.style.height).toBe('500px');

      // Now destroy the survey
      survey.destroy();

      // Create a new container and survey to check no cross-talk
      const container2 = document.createElement('div');
      container2.id = 'survey-container-2';
      document.body.appendChild(container2);

      const survey2 = new InlineSurvey(mockUrlBuilder, {
        elementSelector: '#survey-container-2',
        autoHeight: false,
      });

      // Send another resize message - should not affect destroyed survey
      const event2 = new MessageEvent('message', {
        data: { type: 'hc:resize', height: 700 },
        origin: 'https://example.com',
      });
      window.dispatchEvent(event2);

      // survey2 doesn't have autoHeight, so its height should be empty
      expect(survey2.iFrame.style.height).toBe('');

      survey2.destroy();
    });

    test('should handle multiple resize messages', () => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
        autoHeight: true,
      };

      const survey = new InlineSurvey(mockUrlBuilder, config);

      // Send multiple resize messages
      const heights = [300, 450, 600, 350, 800];

      heights.forEach((height) => {
        const event = new MessageEvent('message', {
          data: { type: 'hc:resize', height },
          origin: 'https://example.com',
        });
        window.dispatchEvent(event);
        expect(survey.iFrame.style.height).toBe(`${height}px`);
      });
    });

    test('should reject resize messages from wrong origin', () => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
        autoHeight: true,
      };

      const survey = new InlineSurvey(mockUrlBuilder, config);

      // Send a resize message from wrong origin
      const event = new MessageEvent('message', {
        data: { type: 'hc:resize', height: 500 },
        origin: 'https://malicious.com',
      });
      window.dispatchEvent(event);

      // Height should not be set - message silently rejected for security
      expect(survey.iFrame.style.height).toBe('');
    });
  });

  describe('K. Survey Status Detection Tests', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('should call onSurveyStatus with ready when survey sends ready message', () => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      const onSurveyStatus = jest.fn();
      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
        callbacks: { onSurveyStatus },
      };

      new InlineSurvey(mockUrlBuilder, config);

      // Send a status message
      const event = new MessageEvent('message', {
        data: { type: 'hc:status', status: 'ready' },
        origin: 'https://example.com',
      });
      window.dispatchEvent(event);

      expect(onSurveyStatus).toHaveBeenCalledWith({
        status: 'ready',
        reason: undefined,
        message: undefined,
      });
    });

    test('should call onSurveyStatus with unavailable when survey is deactivated', () => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      const onSurveyStatus = jest.fn();
      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
        callbacks: { onSurveyStatus },
      };

      new InlineSurvey(mockUrlBuilder, config);

      // Send an unavailable status message
      const event = new MessageEvent('message', {
        data: {
          type: 'hc:status',
          status: 'unavailable',
          reason: 'deactivated',
          message: 'This survey has been deactivated',
        },
        origin: 'https://example.com',
      });
      window.dispatchEvent(event);

      expect(onSurveyStatus).toHaveBeenCalledWith({
        status: 'unavailable',
        reason: 'deactivated',
        message: 'This survey has been deactivated',
      });
    });

    test('should call onSurveyStatus with timeout if no message received within timeout', () => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      const onSurveyStatus = jest.fn();
      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
        statusTimeout: 5000,
        callbacks: { onSurveyStatus },
      };

      new InlineSurvey(mockUrlBuilder, config);

      // Fast-forward time to trigger timeout
      jest.advanceTimersByTime(5000);

      expect(onSurveyStatus).toHaveBeenCalledWith({
        status: 'timeout',
        reason: 'no_response',
        message: 'Survey did not respond within timeout period',
      });
    });

    test('should use default 10 second timeout', () => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      const onSurveyStatus = jest.fn();
      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
        callbacks: { onSurveyStatus },
      };

      new InlineSurvey(mockUrlBuilder, config);

      // Should not trigger after 9 seconds
      jest.advanceTimersByTime(9000);
      expect(onSurveyStatus).not.toHaveBeenCalled();

      // Should trigger after 10 seconds
      jest.advanceTimersByTime(1000);
      expect(onSurveyStatus).toHaveBeenCalledWith({
        status: 'timeout',
        reason: 'no_response',
        message: 'Survey did not respond within timeout period',
      });
    });

    test('should not trigger timeout callback if status received in time', () => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      const onSurveyStatus = jest.fn();
      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
        statusTimeout: 5000,
        callbacks: { onSurveyStatus },
      };

      new InlineSurvey(mockUrlBuilder, config);

      // Advance time partially
      jest.advanceTimersByTime(3000);

      // Send a status message before timeout
      const event = new MessageEvent('message', {
        data: { type: 'hc:status', status: 'ready' },
        origin: 'https://example.com',
      });
      window.dispatchEvent(event);

      expect(onSurveyStatus).toHaveBeenCalledWith({
        status: 'ready',
        reason: undefined,
        message: undefined,
      });
      expect(onSurveyStatus).toHaveBeenCalledTimes(1);

      // Advance past the timeout
      jest.advanceTimersByTime(3000);

      // Should still only have one call (the ready one, not timeout)
      expect(onSurveyStatus).toHaveBeenCalledTimes(1);
    });

    test('should clear timeout on destroy', () => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      const onSurveyStatus = jest.fn();
      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
        statusTimeout: 5000,
        callbacks: { onSurveyStatus },
      };

      const survey = new InlineSurvey(mockUrlBuilder, config);

      // Destroy before timeout
      survey.destroy();

      // Advance past the timeout
      jest.advanceTimersByTime(6000);

      // Should not have been called
      expect(onSurveyStatus).not.toHaveBeenCalled();
    });

    test('should ignore status messages from wrong origin', () => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      const onSurveyStatus = jest.fn();
      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
        statusTimeout: 0, // Disable timeout for this test
        callbacks: { onSurveyStatus },
      };

      new InlineSurvey(mockUrlBuilder, config);

      // Send a status message from wrong origin
      const event = new MessageEvent('message', {
        data: { type: 'hc:status', status: 'ready' },
        origin: 'https://malicious.com',
      });
      window.dispatchEvent(event);

      // Callback should not be called - message silently rejected for security
      expect(onSurveyStatus).not.toHaveBeenCalled();
    });

    test('should handle malformed status messages gracefully', () => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      const onSurveyStatus = jest.fn();
      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
        statusTimeout: 0, // Disable timeout for this test
        callbacks: { onSurveyStatus },
      };

      new InlineSurvey(mockUrlBuilder, config);

      // Send various malformed messages
      const malformedMessages = [
        { type: 'hc:status' }, // missing status
        { type: 'wrong:type', status: 'ready' }, // wrong type
        { status: 'ready' }, // missing type
        { type: 'hc:status', status: 123 }, // non-string status
        null,
        'string message',
        123,
      ];

      malformedMessages.forEach((data) => {
        const event = new MessageEvent('message', {
          data,
          origin: 'https://example.com',
        });
        window.dispatchEvent(event);
      });

      // Should not have been called for any malformed message
      expect(onSurveyStatus).not.toHaveBeenCalled();
    });

    test('should not set up timeout when statusTimeout is 0', () => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      const onSurveyStatus = jest.fn();
      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
        statusTimeout: 0,
        callbacks: { onSurveyStatus },
      };

      new InlineSurvey(mockUrlBuilder, config);

      // Advance time well past default timeout
      jest.advanceTimersByTime(20000);

      // Should not have been called
      expect(onSurveyStatus).not.toHaveBeenCalled();
    });

    test('should handle error status from survey', () => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      const onSurveyStatus = jest.fn();
      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
        callbacks: { onSurveyStatus },
      };

      new InlineSurvey(mockUrlBuilder, config);

      // Send an error status message
      const event = new MessageEvent('message', {
        data: {
          type: 'hc:status',
          status: 'error',
          reason: 'internal_error',
          message: 'An unexpected error occurred',
        },
        origin: 'https://example.com',
      });
      window.dispatchEvent(event);

      expect(onSurveyStatus).toHaveBeenCalledWith({
        status: 'error',
        reason: 'internal_error',
        message: 'An unexpected error occurred',
      });
    });

    test('should not throw if onSurveyStatus callback not provided', () => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
        statusTimeout: 1000,
      };

      const survey = new InlineSurvey(mockUrlBuilder, config);

      // Should not throw when status message received
      expect(() => {
        const event = new MessageEvent('message', {
          data: { type: 'hc:status', status: 'ready' },
          origin: 'https://example.com',
        });
        window.dispatchEvent(event);
      }).not.toThrow();

      // Should not throw when timeout fires
      expect(() => {
        jest.advanceTimersByTime(2000);
      }).not.toThrow();

      survey.destroy();
    });

    test('should clear statusTimeoutId on destroy', () => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
        statusTimeout: 5000,
      };

      const survey = new InlineSurvey(mockUrlBuilder, config);

      // Verify statusTimeoutId is set
      expect(survey['statusTimeoutId']).toBeDefined();

      // Destroy
      survey.destroy();

      // Verify statusTimeoutId is cleared
      expect(survey['statusTimeoutId']).toBeUndefined();
    });
  });

  describe('L. Survey Completed Event Tests', () => {
    test('should call onCompleted callback when valid completed message received', () => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      const onCompleted = jest.fn();
      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
        statusTimeout: 0,
        callbacks: { onCompleted },
      };

      new InlineSurvey(mockUrlBuilder, config);

      const event = new MessageEvent('message', {
        data: { type: 'hc:completed', timestamp: 1234567890 },
        origin: 'https://example.com',
      });
      window.dispatchEvent(event);

      expect(onCompleted).toHaveBeenCalledWith({ timestamp: 1234567890 });
    });

    test('should ignore completed message with missing timestamp', () => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      const onCompleted = jest.fn();
      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
        statusTimeout: 0,
        callbacks: { onCompleted },
      };

      new InlineSurvey(mockUrlBuilder, config);

      const event = new MessageEvent('message', {
        data: { type: 'hc:completed' },
        origin: 'https://example.com',
      });
      window.dispatchEvent(event);

      expect(onCompleted).not.toHaveBeenCalled();
    });

    test('should ignore completed message from wrong origin', () => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      const onCompleted = jest.fn();
      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
        statusTimeout: 0,
        callbacks: { onCompleted },
      };

      new InlineSurvey(mockUrlBuilder, config);

      const event = new MessageEvent('message', {
        data: { type: 'hc:completed', timestamp: 1234567890 },
        origin: 'https://malicious.com',
      });
      window.dispatchEvent(event);

      expect(onCompleted).not.toHaveBeenCalled();
    });

    test('should not throw if onCompleted callback not provided', () => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
        statusTimeout: 0,
      };

      new InlineSurvey(mockUrlBuilder, config);

      expect(() => {
        const event = new MessageEvent('message', {
          data: { type: 'hc:completed', timestamp: 1234567890 },
          origin: 'https://example.com',
        });
        window.dispatchEvent(event);
      }).not.toThrow();
    });
  });

  describe('M. Survey Page Changed Event Tests', () => {
    test('should call onPageChanged callback when valid page changed message received', () => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      const onPageChanged = jest.fn();
      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
        statusTimeout: 0,
        callbacks: { onPageChanged },
      };

      new InlineSurvey(mockUrlBuilder, config);

      const event = new MessageEvent('message', {
        data: {
          type: 'hc:pagechanged',
          currentPage: 2,
          totalPages: 5,
          timestamp: 1234567890,
        },
        origin: 'https://example.com',
      });
      window.dispatchEvent(event);

      expect(onPageChanged).toHaveBeenCalledWith({
        currentPage: 2,
        totalPages: 5,
        timestamp: 1234567890,
      });
    });

    test('should ignore page changed message with missing fields', () => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      const onPageChanged = jest.fn();
      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
        statusTimeout: 0,
        callbacks: { onPageChanged },
      };

      new InlineSurvey(mockUrlBuilder, config);

      const malformedMessages = [
        { type: 'hc:pagechanged', currentPage: 1 }, // missing totalPages and timestamp
        { type: 'hc:pagechanged', totalPages: 5 }, // missing currentPage and timestamp
        { type: 'hc:pagechanged', currentPage: 1, totalPages: 5 }, // missing timestamp
        { type: 'hc:pagechanged', timestamp: 123 }, // missing currentPage and totalPages
      ];

      malformedMessages.forEach((data) => {
        const event = new MessageEvent('message', {
          data,
          origin: 'https://example.com',
        });
        window.dispatchEvent(event);
      });

      expect(onPageChanged).not.toHaveBeenCalled();
    });

    test('should ignore page changed message from wrong origin', () => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      const onPageChanged = jest.fn();
      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
        statusTimeout: 0,
        callbacks: { onPageChanged },
      };

      new InlineSurvey(mockUrlBuilder, config);

      const event = new MessageEvent('message', {
        data: {
          type: 'hc:pagechanged',
          currentPage: 2,
          totalPages: 5,
          timestamp: 1234567890,
        },
        origin: 'https://malicious.com',
      });
      window.dispatchEvent(event);

      expect(onPageChanged).not.toHaveBeenCalled();
    });
  });

  describe('N. Survey Selected Event Tests', () => {
    test('should call onSelected callback when valid selected message received', () => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      const onSelected = jest.fn();
      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
        statusTimeout: 0,
        callbacks: { onSelected },
      };

      new InlineSurvey(mockUrlBuilder, config);

      const event = new MessageEvent('message', {
        data: {
          type: 'hc:selected',
          questionType: 'NPS',
          questionId: 'q1',
          questionIndex: 0,
          pageIndex: 0,
          timestamp: 1234567890,
        },
        origin: 'https://example.com',
      });
      window.dispatchEvent(event);

      expect(onSelected).toHaveBeenCalledWith({
        questionType: 'NPS',
        questionId: 'q1',
        questionIndex: 0,
        pageIndex: 0,
        timestamp: 1234567890,
      });
    });

    test('should call onSelected multiple times for multiple selections', () => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      const onSelected = jest.fn();
      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
        statusTimeout: 0,
        callbacks: { onSelected },
      };

      new InlineSurvey(mockUrlBuilder, config);

      // First selection
      window.dispatchEvent(
        new MessageEvent('message', {
          data: {
            type: 'hc:selected',
            questionType: 'NPS',
            questionId: 'q1',
            questionIndex: 0,
            pageIndex: 0,
            timestamp: 1234567890,
          },
          origin: 'https://example.com',
        }),
      );

      // Second selection (user changed answer)
      window.dispatchEvent(
        new MessageEvent('message', {
          data: {
            type: 'hc:selected',
            questionType: 'NPS',
            questionId: 'q1',
            questionIndex: 0,
            pageIndex: 0,
            timestamp: 1234567891,
          },
          origin: 'https://example.com',
        }),
      );

      expect(onSelected).toHaveBeenCalledTimes(2);
    });

    test('should ignore selected message with missing fields', () => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      const onSelected = jest.fn();
      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
        statusTimeout: 0,
        callbacks: { onSelected },
      };

      new InlineSurvey(mockUrlBuilder, config);

      const malformedMessages = [
        { type: 'hc:selected', questionType: 'NPS' }, // missing other required fields
        { type: 'hc:selected', questionId: 'q1' }, // missing other required fields
        {
          type: 'hc:selected',
          questionType: 'NPS',
          questionId: 'q1',
          questionIndex: 0,
        }, // missing pageIndex and timestamp
      ];

      malformedMessages.forEach((data) => {
        const event = new MessageEvent('message', {
          data,
          origin: 'https://example.com',
        });
        window.dispatchEvent(event);
      });

      expect(onSelected).not.toHaveBeenCalled();
    });

    test('should ignore selected message from wrong origin', () => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      const onSelected = jest.fn();
      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
        statusTimeout: 0,
        callbacks: { onSelected },
      };

      new InlineSurvey(mockUrlBuilder, config);

      const event = new MessageEvent('message', {
        data: {
          type: 'hc:selected',
          questionType: 'NPS',
          questionId: 'q1',
          questionIndex: 0,
          pageIndex: 0,
          timestamp: 1234567890,
        },
        origin: 'https://malicious.com',
      });
      window.dispatchEvent(event);

      expect(onSelected).not.toHaveBeenCalled();
    });
  });

  describe('O. Survey First Interaction Event Tests', () => {
    test('should call onFirstInteraction callback when valid first interaction message received', () => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      const onFirstInteraction = jest.fn();
      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
        statusTimeout: 0,
        callbacks: { onFirstInteraction },
      };

      new InlineSurvey(mockUrlBuilder, config);

      const event = new MessageEvent('message', {
        data: {
          type: 'hc:firstinteraction',
          questionType: 'NPS',
          timestamp: 1234567890,
        },
        origin: 'https://example.com',
      });
      window.dispatchEvent(event);

      expect(onFirstInteraction).toHaveBeenCalledWith({
        questionType: 'NPS',
        timestamp: 1234567890,
      });
    });

    test('should ignore first interaction message with missing fields', () => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      const onFirstInteraction = jest.fn();
      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
        statusTimeout: 0,
        callbacks: { onFirstInteraction },
      };

      new InlineSurvey(mockUrlBuilder, config);

      const malformedMessages = [
        { type: 'hc:firstinteraction' }, // missing questionType and timestamp
        { type: 'hc:firstinteraction', questionType: 'NPS' }, // missing timestamp
        { type: 'hc:firstinteraction', timestamp: 123 }, // missing questionType
      ];

      malformedMessages.forEach((data) => {
        const event = new MessageEvent('message', {
          data,
          origin: 'https://example.com',
        });
        window.dispatchEvent(event);
      });

      expect(onFirstInteraction).not.toHaveBeenCalled();
    });

    test('should ignore first interaction message from wrong origin', () => {
      const container = document.createElement('div');
      container.id = 'survey-container';
      document.body.appendChild(container);

      const onFirstInteraction = jest.fn();
      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
        statusTimeout: 0,
        callbacks: { onFirstInteraction },
      };

      new InlineSurvey(mockUrlBuilder, config);

      const event = new MessageEvent('message', {
        data: {
          type: 'hc:firstinteraction',
          questionType: 'NPS',
          timestamp: 1234567890,
        },
        origin: 'https://malicious.com',
      });
      window.dispatchEvent(event);

      expect(onFirstInteraction).not.toHaveBeenCalled();
    });
  });
});
