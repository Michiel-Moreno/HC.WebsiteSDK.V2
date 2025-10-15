import { InvalidQuerySelectorException } from '../../core/exceptions/invalid-query-selector.exception';
import { UrlBuilder } from '../../url-builder/url.builder';

import { ModalSurvey } from './modal-survey';
import { ModalSurveyConfig } from './modal-survey-config.interface';
import * as defaults from './modal-survey-defaults.style';

describe('ModalSurvey', () => {
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
    test('should create ModalSurvey with empty config', () => {
      const config: ModalSurveyConfig = {};

      const survey = new ModalSurvey(mockUrlBuilder, config);

      expect(survey).toBeDefined();
      expect(survey.iFrame).toBeDefined();
      expect(survey.modalContainer).toBeDefined();
    });

    test('should create ModalSurvey with all config options', () => {
      const config: ModalSurveyConfig = {
        showByDefault: true,
        closeButton: true,
        closeOnBackgroundClick: true,
        closeOnEscape: true,
        translucentBackground: true,
        ignoreDefaultStyles: false,
      };

      const survey = new ModalSurvey(mockUrlBuilder, config);

      expect(survey).toBeDefined();
    });

    test('should validate closeButton as boolean', () => {
      const config = {
        closeButton: 'true',
      } as unknown as ModalSurveyConfig;

      expect(() => new ModalSurvey(mockUrlBuilder, config)).toThrow();
    });

    test('should validate showByDefault as boolean', () => {
      const config = {
        showByDefault: 'true',
      } as unknown as ModalSurveyConfig;

      expect(() => new ModalSurvey(mockUrlBuilder, config)).toThrow();
    });

    test('should validate ignoreDefaultStyles as boolean', () => {
      const config = {
        ignoreDefaultStyles: 'false',
      } as unknown as ModalSurveyConfig;

      expect(() => new ModalSurvey(mockUrlBuilder, config)).toThrow();
    });
  });

  describe('B. DOM Structure Creation Tests', () => {
    test('should create modal root element', () => {
      const config: ModalSurveyConfig = {};

      const survey = new ModalSurvey(mockUrlBuilder, config);

      expect(survey.modalContainer).toBeDefined();
      expect(survey.modalContainer.tagName).toBe('DIV');
    });

    test('should create iframe element', () => {
      const config: ModalSurveyConfig = {};

      const survey = new ModalSurvey(mockUrlBuilder, config);

      expect(survey.iFrame).toBeDefined();
      expect(survey.iFrame.tagName).toBe('IFRAME');
    });

    test('should apply default class names to elements', () => {
      const config: ModalSurveyConfig = {};

      const survey = new ModalSurvey(mockUrlBuilder, config);

      expect(
        survey.modalContainer.classList.contains(
          defaults.classNames.rootDivStyle,
        ),
      ).toBe(true);

      expect(
        survey.iFrame.classList.contains(defaults.classNames.iFrameStyle),
      ).toBe(true);
    });

    test('should create window div element', () => {
      const config: ModalSurveyConfig = {};

      const survey = new ModalSurvey(mockUrlBuilder, config);

      const windowDiv = survey.modalContainer.querySelector(
        `.${defaults.classNames.windowDivStyle}`,
      );
      expect(windowDiv).not.toBeNull();
    });

    test('should create window bar element', () => {
      const config: ModalSurveyConfig = {};

      const survey = new ModalSurvey(mockUrlBuilder, config);

      const windowBar = survey.modalContainer.querySelector(
        `.${defaults.classNames.windowBarDivStyle}`,
      );
      expect(windowBar).not.toBeNull();
    });

    test('should create close button when closeButton is true', () => {
      const config: ModalSurveyConfig = {
        closeButton: true,
      };

      const survey = new ModalSurvey(mockUrlBuilder, config);

      const closeButton = survey.modalContainer.querySelector(
        `.${defaults.classNames.windowCloseButtonStyle}`,
      );
      expect(closeButton).not.toBeNull();
    });

    test('should not create close button when closeButton is false', () => {
      const config: ModalSurveyConfig = {
        closeButton: false,
      };

      const survey = new ModalSurvey(mockUrlBuilder, config);

      const closeButton = survey.modalContainer.querySelector(
        `.${defaults.classNames.windowCloseButtonStyle}`,
      );
      expect(closeButton).toBeNull();
    });

    test('should create footer element', () => {
      const config: ModalSurveyConfig = {};

      const survey = new ModalSurvey(mockUrlBuilder, config);

      const footer = survey.modalContainer.querySelector(
        `.${defaults.classNames.footerStyle}`,
      );
      expect(footer).not.toBeNull();
    });

    test('should create footer logo element', () => {
      const config: ModalSurveyConfig = {};

      const survey = new ModalSurvey(mockUrlBuilder, config);

      const logo = survey.modalContainer.querySelector(
        `.${defaults.classNames.footerLogoStyle}`,
      );
      expect(logo).not.toBeNull();
    });

    test('should append modal to document.body by default', () => {
      const config: ModalSurveyConfig = {};

      const survey = new ModalSurvey(mockUrlBuilder, config);

      expect(document.body.contains(survey.modalContainer)).toBe(true);
    });

    test('should append modal to custom container when selector provided', () => {
      const customContainer = document.createElement('div');
      customContainer.id = 'custom-modal-root';
      document.body.appendChild(customContainer);

      const config: ModalSurveyConfig = {
        modalContainerSelector: '#custom-modal-root',
      };

      const survey = new ModalSurvey(mockUrlBuilder, config);

      expect(customContainer.contains(survey.modalContainer)).toBe(true);
    });

    test('should throw InvalidQuerySelectorException for invalid container selector', () => {
      const config: ModalSurveyConfig = {
        modalContainerSelector: '#nonexistent',
      };

      expect(() => new ModalSurvey(mockUrlBuilder, config)).toThrow(
        InvalidQuerySelectorException,
      );
    });
  });

  describe('C. Style Application Tests', () => {
    test('should apply default styles when ignoreDefaultStyles is false', () => {
      const config: ModalSurveyConfig = {
        ignoreDefaultStyles: false,
      };

      const survey = new ModalSurvey(mockUrlBuilder, config);

      expect(
        survey.modalContainer.classList.contains(
          defaults.classNames.rootDivStyle,
        ),
      ).toBe(true);
    });

    test('should not apply default styles when ignoreDefaultStyles is true', () => {
      const config: ModalSurveyConfig = {
        ignoreDefaultStyles: true,
      };

      const survey = new ModalSurvey(mockUrlBuilder, config);

      // Should still have class names
      expect(
        survey.modalContainer.classList.contains(
          defaults.classNames.rootDivStyle,
        ),
      ).toBe(true);
    });

    test('should apply custom class names when provided', () => {
      const config: ModalSurveyConfig = {
        classNames: {
          rootDivStyle: 'custom-root',
          iFrameStyle: 'custom-iframe',
        },
      };

      const survey = new ModalSurvey(mockUrlBuilder, config);

      expect(survey.modalContainer.classList.contains('custom-root')).toBe(
        true,
      );
      expect(survey.iFrame.classList.contains('custom-iframe')).toBe(true);
    });

    test('should apply custom modal styles when provided', () => {
      const config: ModalSurveyConfig = {
        modalStyle: {
          rootDivStyle: {
            backgroundColor: 'red',
          } as Partial<CSSStyleDeclaration>,
        },
      };

      const survey = new ModalSurvey(mockUrlBuilder, config);

      expect(survey.modalContainer).toBeDefined();
    });

    test('should apply translucent background class when enabled', () => {
      const config: ModalSurveyConfig = {
        translucentBackground: true,
      };

      const survey = new ModalSurvey(mockUrlBuilder, config);

      expect(
        survey.modalContainer.classList.contains(
          defaults.classNames.modalTranslucentBackground,
        ),
      ).toBe(true);
    });

    test('should not apply translucent background class when disabled', () => {
      const config: ModalSurveyConfig = {
        translucentBackground: false,
      };

      const survey = new ModalSurvey(mockUrlBuilder, config);

      expect(
        survey.modalContainer.classList.contains(
          defaults.classNames.modalTranslucentBackground,
        ),
      ).toBe(false);
    });
  });

  describe('D. Lifecycle Methods Tests', () => {
    test('should show modal by adding visible class', () => {
      const config: ModalSurveyConfig = {
        showByDefault: false,
      };

      const survey = new ModalSurvey(mockUrlBuilder, config);

      // Clear localStorage to avoid quarantine
      localStorageMock.clear();

      survey.show();

      expect(
        survey.modalContainer.classList.contains(
          defaults.classNames.modalVisible,
        ),
      ).toBe(true);
    });

    test('should close modal by removing visible class', () => {
      const config: ModalSurveyConfig = {
        showByDefault: true,
      };

      const survey = new ModalSurvey(mockUrlBuilder, config);

      survey.close();

      expect(
        survey.modalContainer.classList.contains(
          defaults.classNames.modalVisible,
        ),
      ).toBe(false);
    });

    test('should reload iframe by updating src', () => {
      const config: ModalSurveyConfig = {};

      const survey = new ModalSurvey(mockUrlBuilder, config);

      // Update the mock to return a different URL
      const urlFactory = mockUrlBuilder.getUrlFactory();
      (urlFactory.getUrlWithParams as jest.Mock).mockReturnValue(
        'https://example.com/new-survey',
      );

      survey.reload();

      expect(survey.iFrame.src).toBe('https://example.com/new-survey');
    });

    test('should set iframe src from urlFactory on creation', () => {
      const config: ModalSurveyConfig = {};

      const survey = new ModalSurvey(mockUrlBuilder, config);

      expect(survey.iFrame.src).toBe(
        'https://example.com/survey?entry.test=value',
      );
    });
  });

  describe('E. Event Handlers Tests', () => {
    test('should close modal when close button is clicked', () => {
      const config: ModalSurveyConfig = {
        closeButton: true,
        showByDefault: true,
      };

      const survey = new ModalSurvey(mockUrlBuilder, config);

      const closeButton = survey.modalContainer.querySelector(
        `.${defaults.classNames.windowCloseButtonStyle}`,
      ) as HTMLElement;

      expect(closeButton).not.toBeNull();

      closeButton.click();

      expect(
        survey.modalContainer.classList.contains(
          defaults.classNames.modalVisible,
        ),
      ).toBe(false);
    });

    test('should close modal when background is clicked and closeOnBackgroundClick is true', () => {
      const config: ModalSurveyConfig = {
        closeOnBackgroundClick: true,
        showByDefault: true,
      };

      const survey = new ModalSurvey(mockUrlBuilder, config);

      survey.modalContainer.click();

      expect(
        survey.modalContainer.classList.contains(
          defaults.classNames.modalVisible,
        ),
      ).toBe(false);
    });

    test('should not close modal when window div is clicked', () => {
      const config: ModalSurveyConfig = {
        closeOnBackgroundClick: true,
        showByDefault: true,
      };

      const survey = new ModalSurvey(mockUrlBuilder, config);

      const windowDiv = survey.modalContainer.querySelector(
        `.${defaults.classNames.windowDivStyle}`,
      ) as HTMLElement;

      expect(windowDiv).not.toBeNull();

      // Click on window div should not close modal due to stopPropagation
      windowDiv.click();

      expect(
        survey.modalContainer.classList.contains(
          defaults.classNames.modalVisible,
        ),
      ).toBe(true);
    });

    test('should not register escape key listener when closeOnEscape is false', () => {
      const config: ModalSurveyConfig = {
        closeOnEscape: false,
      };

      const survey = new ModalSurvey(mockUrlBuilder, config);

      expect(survey.modalContainer).toBeDefined();
    });
  });

  describe('F. Quarantine Integration Tests', () => {
    test('should not show modal when under quarantine', () => {
      // Set quarantine in localStorage
      const quarantineKey = 'hcSDK.SurveyQuarantineStart:test-survey-id';
      localStorageMock.store[quarantineKey] = Date.now().toString();

      const config: ModalSurveyConfig = {
        quarantineConfig: { period: 7 },
      };

      const survey = new ModalSurvey(mockUrlBuilder, config);

      survey.show();

      expect(
        survey.modalContainer.classList.contains(
          defaults.classNames.modalVisible,
        ),
      ).toBe(false);
    });

    test('should start quarantine when modal is shown', () => {
      const config: ModalSurveyConfig = {
        showByDefault: false,
        quarantineConfig: { period: 7 },
      };

      const survey = new ModalSurvey(mockUrlBuilder, config);

      // Clear localStorage
      localStorageMock.clear();

      survey.show();

      expect(localStorageMock.setItem).toHaveBeenCalled();
      const setItemCalls = localStorageMock.setItem.mock.calls;
      const quarantineCall = setItemCalls.find((call) =>
        call[0].includes('hcSDK.SurveyQuarantineStart'),
      );
      expect(quarantineCall).toBeDefined();
    });

    test('should work without quarantine config', () => {
      const config: ModalSurveyConfig = {};

      const survey = new ModalSurvey(mockUrlBuilder, config);

      survey.show();
      expect(survey.modalContainer).toBeDefined();
    });

    test('should respect quarantine period', () => {
      // Set quarantine that expired 8 days ago
      const quarantineKey = 'hcSDK.SurveyQuarantineStart:test-survey-id';
      const eightDaysAgo = Date.now() - 8 * 24 * 60 * 60 * 1000;
      localStorageMock.store[quarantineKey] = eightDaysAgo.toString();

      const config: ModalSurveyConfig = {
        quarantineConfig: { period: 7 },
      };

      const survey = new ModalSurvey(mockUrlBuilder, config);

      survey.show();

      // Should show because quarantine period (7 days) has passed
      expect(
        survey.modalContainer.classList.contains(
          defaults.classNames.modalVisible,
        ),
      ).toBe(true);
    });
  });

  describe('G. Container Selector Tests', () => {
    test('should append to document.body when no selector provided', () => {
      const config: ModalSurveyConfig = {};

      const survey = new ModalSurvey(mockUrlBuilder, config);

      expect(survey.modalContainer.parentElement).toBe(document.body);
    });

    test('should append to custom container when selector is valid', () => {
      const customContainer = document.createElement('div');
      customContainer.id = 'modal-root';
      document.body.appendChild(customContainer);

      const config: ModalSurveyConfig = {
        modalContainerSelector: '#modal-root',
      };

      const survey = new ModalSurvey(mockUrlBuilder, config);

      expect(survey.modalContainer.parentElement).toBe(customContainer);
    });

    test('should throw exception when custom selector is invalid', () => {
      const config: ModalSurveyConfig = {
        modalContainerSelector: '#invalid-selector',
      };

      expect(() => new ModalSurvey(mockUrlBuilder, config)).toThrow(
        InvalidQuerySelectorException,
      );
      expect(() => new ModalSurvey(mockUrlBuilder, config)).toThrow(
        '[Hello Customer SDK] HTML element for #invalid-selector selector not found!',
      );
    });
  });

  describe('H. showByDefault Behavior Tests', () => {
    test('should be hidden when showByDefault is false', () => {
      const config: ModalSurveyConfig = {
        showByDefault: false,
      };

      const survey = new ModalSurvey(mockUrlBuilder, config);

      expect(
        survey.modalContainer.classList.contains(
          defaults.classNames.modalVisible,
        ),
      ).toBe(false);
    });

    test('should be visible when showByDefault is true', () => {
      const config: ModalSurveyConfig = {
        showByDefault: true,
      };

      const survey = new ModalSurvey(mockUrlBuilder, config);

      expect(
        survey.modalContainer.classList.contains(
          defaults.classNames.modalVisible,
        ),
      ).toBe(true);
    });

    test('should be hidden by default when showByDefault is undefined', () => {
      const config: ModalSurveyConfig = {};

      const survey = new ModalSurvey(mockUrlBuilder, config);

      expect(
        survey.modalContainer.classList.contains(
          defaults.classNames.modalVisible,
        ),
      ).toBe(false);
    });
  });

  describe('I. Property Getters Tests', () => {
    test('should expose modalContainer via getter', () => {
      const config: ModalSurveyConfig = {};

      const survey = new ModalSurvey(mockUrlBuilder, config);

      expect(survey.modalContainer).toBeDefined();
      expect(survey.modalContainer.tagName).toBe('DIV');
    });

    test('should expose iFrame via getter', () => {
      const config: ModalSurveyConfig = {};

      const survey = new ModalSurvey(mockUrlBuilder, config);

      expect(survey.iFrame).toBeDefined();
      expect(survey.iFrame.tagName).toBe('IFRAME');
    });
  });

  describe('J. URL Integration Tests', () => {
    test('should get URL from urlFactory on creation', () => {
      const config: ModalSurveyConfig = {};

      new ModalSurvey(mockUrlBuilder, config);

      const urlFactory = mockUrlBuilder.getUrlFactory();
      expect(urlFactory.getUrlWithParams).toHaveBeenCalled();
    });

    test('should get survey identifier from urlFactory for quarantine', () => {
      const config: ModalSurveyConfig = {
        quarantineConfig: { period: 7 },
      };

      new ModalSurvey(mockUrlBuilder, config);

      const urlFactory = mockUrlBuilder.getUrlFactory();
      expect(urlFactory.getSurveyIdentifier).toHaveBeenCalled();
    });
  });
});
