import { InvalidQuerySelectorException } from '../../core/exceptions/invalid-query-selector.exception';
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
      }),
    } as unknown as UrlBuilder;
  });

  afterEach(() => {
    document.body.innerHTML = '';
    localStorageMock.clear();
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

      // Set quarantine
      const quarantineKey = 'hcSDK.SurveyQuarantineStart:test-survey-id';
      localStorageMock.store[quarantineKey] = Date.now().toString();

      const onQuarantineBlocked = jest.fn();
      const config: InlineSurveyConfig = {
        elementSelector: '#survey-container',
        quarantineConfig: { period: 7 },
        callbacks: { onQuarantineBlocked },
      };

      const survey = new InlineSurvey(mockUrlBuilder, config);
      survey.show();

      expect(onQuarantineBlocked).toHaveBeenCalled();
      expect(onQuarantineBlocked).toHaveBeenCalledWith(expect.any(Number));
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
});
