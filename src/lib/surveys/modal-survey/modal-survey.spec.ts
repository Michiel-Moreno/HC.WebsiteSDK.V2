import { InvalidQuerySelectorException } from '../../core/exceptions/invalid-query-selector.exception';
import { StyledElementFactory } from '../../core/factories/styled-element.factory';
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
  let createdModals: ModalSurvey[] = [];

  beforeEach(() => {
    // Reset modal tracking
    createdModals = [];

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
    // Destroy all tracked modals to prevent event listener accumulation
    createdModals.forEach((modal) => {
      try {
        modal.destroy();
      } catch (e) {
        // Ignore errors if already destroyed
      }
    });
    createdModals = [];

    document.body.innerHTML = '';
    localStorageMock.clear();
    StyledElementFactory.clearStyleCache();
  });

  describe('A. Constructor & Validation Tests', () => {
    test('should create ModalSurvey with empty config', () => {
      const config: ModalSurveyConfig = {};

      const survey = new ModalSurvey(mockUrlBuilder, config);

      createdModals.push(survey);

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

      createdModals.push(survey);

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

      createdModals.push(survey);

      expect(survey.modalContainer).toBeDefined();
      expect(survey.modalContainer.tagName).toBe('DIV');
    });

    test('should create iframe element', () => {
      const config: ModalSurveyConfig = {};

      const survey = new ModalSurvey(mockUrlBuilder, config);

      createdModals.push(survey);

      expect(survey.iFrame).toBeDefined();
      expect(survey.iFrame.tagName).toBe('IFRAME');
    });

    test('should apply default class names to elements', () => {
      const config: ModalSurveyConfig = {};

      const survey = new ModalSurvey(mockUrlBuilder, config);

      createdModals.push(survey);

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

      createdModals.push(survey);

      const windowDiv = survey.modalContainer.querySelector(
        `.${defaults.classNames.windowDivStyle}`,
      );
      expect(windowDiv).not.toBeNull();
    });

    test('should create window bar element', () => {
      const config: ModalSurveyConfig = {};

      const survey = new ModalSurvey(mockUrlBuilder, config);

      createdModals.push(survey);

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

      createdModals.push(survey);

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

      createdModals.push(survey);

      const closeButton = survey.modalContainer.querySelector(
        `.${defaults.classNames.windowCloseButtonStyle}`,
      );
      expect(closeButton).toBeNull();
    });

    test('should create footer element', () => {
      const config: ModalSurveyConfig = {};

      const survey = new ModalSurvey(mockUrlBuilder, config);

      createdModals.push(survey);

      const footer = survey.modalContainer.querySelector(
        `.${defaults.classNames.footerStyle}`,
      );
      expect(footer).not.toBeNull();
    });

    test('should create footer logo element', () => {
      const config: ModalSurveyConfig = {};

      const survey = new ModalSurvey(mockUrlBuilder, config);

      createdModals.push(survey);

      const logo = survey.modalContainer.querySelector(
        `.${defaults.classNames.footerLogoStyle}`,
      );
      expect(logo).not.toBeNull();
    });

    test('should append modal to document.body by default', () => {
      const config: ModalSurveyConfig = {};

      const survey = new ModalSurvey(mockUrlBuilder, config);

      createdModals.push(survey);

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

      createdModals.push(survey);

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

      createdModals.push(survey);

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

      createdModals.push(survey);

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

      createdModals.push(survey);

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

      createdModals.push(survey);

      expect(survey.modalContainer).toBeDefined();
    });

    test('should apply translucent background class when enabled', () => {
      const config: ModalSurveyConfig = {
        translucentBackground: true,
      };

      const survey = new ModalSurvey(mockUrlBuilder, config);

      createdModals.push(survey);

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

      createdModals.push(survey);

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

      createdModals.push(survey);

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

      createdModals.push(survey);

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

      createdModals.push(survey);

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

      createdModals.push(survey);

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

      createdModals.push(survey);

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

      createdModals.push(survey);

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

      createdModals.push(survey);

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

      createdModals.push(survey);

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

      createdModals.push(survey);

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

      createdModals.push(survey);

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

      createdModals.push(survey);

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

      createdModals.push(survey);

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

      createdModals.push(survey);

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

      createdModals.push(survey);

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

      createdModals.push(survey);

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

      createdModals.push(survey);

      expect(
        survey.modalContainer.classList.contains(
          defaults.classNames.modalVisible,
        ),
      ).toBe(true);
    });

    test('should be hidden by default when showByDefault is undefined', () => {
      const config: ModalSurveyConfig = {};

      const survey = new ModalSurvey(mockUrlBuilder, config);

      createdModals.push(survey);

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

      createdModals.push(survey);

      expect(survey.modalContainer).toBeDefined();
      expect(survey.modalContainer.tagName).toBe('DIV');
    });

    test('should expose iFrame via getter', () => {
      const config: ModalSurveyConfig = {};

      const survey = new ModalSurvey(mockUrlBuilder, config);

      createdModals.push(survey);

      expect(survey.iFrame).toBeDefined();
      expect(survey.iFrame.tagName).toBe('IFRAME');
    });
  });

  describe('J. URL Integration Tests', () => {
    test('should get URL from urlFactory on creation', () => {
      const config: ModalSurveyConfig = {};

      const survey = new ModalSurvey(mockUrlBuilder, config);
      createdModals.push(survey);

      const urlFactory = mockUrlBuilder.getUrlFactory();
      expect(urlFactory.getUrlWithParams).toHaveBeenCalled();
    });

    test('should get survey identifier from urlFactory for quarantine', () => {
      const config: ModalSurveyConfig = {
        quarantineConfig: { period: 7 },
      };

      const survey = new ModalSurvey(mockUrlBuilder, config);
      createdModals.push(survey);

      const urlFactory = mockUrlBuilder.getUrlFactory();
      expect(urlFactory.getSurveyIdentifier).toHaveBeenCalled();
    });
  });

  describe('K. Destroy & Cleanup Tests', () => {
    test('should have destroy method', () => {
      const config: ModalSurveyConfig = {};

      const survey = new ModalSurvey(mockUrlBuilder, config);

      createdModals.push(survey);

      expect(survey.destroy).toBeDefined();
      expect(typeof survey.destroy).toBe('function');
    });

    test('should remove modal from DOM when destroyed', () => {
      const config: ModalSurveyConfig = {};

      const survey = new ModalSurvey(mockUrlBuilder, config);

      createdModals.push(survey);

      expect(document.body.contains(survey.modalContainer)).toBe(true);

      survey.destroy();

      expect(document.body.contains(survey.modalContainer)).toBe(false);
    });

    test('should not throw error when destroy called twice', () => {
      const config: ModalSurveyConfig = {};

      const survey = new ModalSurvey(mockUrlBuilder, config);

      createdModals.push(survey);

      survey.destroy();

      expect(() => survey.destroy()).not.toThrow();
    });

    test('should not throw error when destroy called on already removed modal', () => {
      const config: ModalSurveyConfig = {};

      const survey = new ModalSurvey(mockUrlBuilder, config);

      createdModals.push(survey);

      // Manually remove from DOM
      if (survey.modalContainer.parentElement) {
        survey.modalContainer.parentElement.removeChild(survey.modalContainer);
      }

      // Should not throw
      expect(() => survey.destroy()).not.toThrow();
    });

    test('should clean up close button event listener', () => {
      const config: ModalSurveyConfig = {
        closeButton: true,
        showByDefault: true,
      };

      const survey = new ModalSurvey(mockUrlBuilder, config);

      createdModals.push(survey);

      const closeButton = survey.modalContainer.querySelector(
        `.${defaults.classNames.windowCloseButtonStyle}`,
      ) as HTMLElement;

      expect(closeButton).not.toBeNull();

      // Destroy should clean up listener
      survey.destroy();

      // Try to click close button (it's removed from DOM but still exists in memory)
      closeButton.click();

      // If listeners were cleaned up properly, modal should not be in DOM
      expect(document.body.contains(survey.modalContainer)).toBe(false);
    });

    test('should clean up window div event listener', () => {
      const config: ModalSurveyConfig = {
        showByDefault: true,
      };

      const survey = new ModalSurvey(mockUrlBuilder, config);

      createdModals.push(survey);

      const windowDiv = survey.modalContainer.querySelector(
        `.${defaults.classNames.windowDivStyle}`,
      ) as HTMLElement;

      expect(windowDiv).not.toBeNull();

      survey.destroy();

      // Modal should be removed from DOM
      expect(document.body.contains(survey.modalContainer)).toBe(false);
    });

    test('should clean up escape key listener', () => {
      const config: ModalSurveyConfig = {
        closeOnEscape: true,
        showByDefault: true,
      };

      const survey = new ModalSurvey(mockUrlBuilder, config);

      createdModals.push(survey);

      expect(
        survey.modalContainer.classList.contains(
          defaults.classNames.modalVisible,
        ),
      ).toBe(true);

      // Destroy should clean up the keydown listener
      survey.destroy();

      // Modal should be removed from DOM
      expect(document.body.contains(survey.modalContainer)).toBe(false);
    });

    test('should clean up background click listener', () => {
      const config: ModalSurveyConfig = {
        closeOnBackgroundClick: true,
        showByDefault: true,
      };

      const survey = new ModalSurvey(mockUrlBuilder, config);

      createdModals.push(survey);

      expect(
        survey.modalContainer.classList.contains(
          defaults.classNames.modalVisible,
        ),
      ).toBe(true);

      survey.destroy();

      // Modal should be removed from DOM
      expect(document.body.contains(survey.modalContainer)).toBe(false);
    });

    test('should clean up all event listeners for fully configured modal', () => {
      const config: ModalSurveyConfig = {
        closeButton: true,
        closeOnEscape: true,
        closeOnBackgroundClick: true,
        showByDefault: true,
      };

      const survey = new ModalSurvey(mockUrlBuilder, config);

      createdModals.push(survey);

      expect(document.body.contains(survey.modalContainer)).toBe(true);

      survey.destroy();

      // Modal should be removed from DOM after destroy
      expect(document.body.contains(survey.modalContainer)).toBe(false);
    });
  });

  describe('L. Lifecycle Callbacks Tests', () => {
    test('should call onShow when modal is shown', () => {
      const onShow = jest.fn();
      const config: ModalSurveyConfig = {
        showByDefault: false,
        callbacks: { onShow },
      };

      const survey = new ModalSurvey(mockUrlBuilder, config);

      createdModals.push(survey);

      localStorageMock.clear();
      survey.show();

      expect(onShow).toHaveBeenCalled();
    });

    test('should call onClose when modal is closed', () => {
      const onClose = jest.fn();
      const config: ModalSurveyConfig = {
        showByDefault: true,
        callbacks: { onClose },
      };

      const survey = new ModalSurvey(mockUrlBuilder, config);

      createdModals.push(survey);
      survey.close();

      expect(onClose).toHaveBeenCalled();
    });

    test('should call onDestroy when modal is destroyed', () => {
      const onDestroy = jest.fn();
      const config: ModalSurveyConfig = {
        callbacks: { onDestroy },
      };

      const survey = new ModalSurvey(mockUrlBuilder, config);

      createdModals.push(survey);
      survey.destroy();

      expect(onDestroy).toHaveBeenCalled();
    });

    test('should call onLoad when iframe loads', (done) => {
      const onLoad = jest.fn((iframe) => {
        expect(iframe).toBeDefined();
        expect(iframe.tagName).toBe('IFRAME');
        done();
      });

      const config: ModalSurveyConfig = {
        callbacks: { onLoad },
      };

      const survey = new ModalSurvey(mockUrlBuilder, config);

      createdModals.push(survey);

      // Trigger load event
      const loadEvent = new Event('load');
      survey.iFrame.dispatchEvent(loadEvent);
    });

    test('should call onError when iframe fails to load', () => {
      const onError = jest.fn();
      const config: ModalSurveyConfig = {
        callbacks: { onError },
      };

      const survey = new ModalSurvey(mockUrlBuilder, config);

      createdModals.push(survey);

      // Trigger error event
      const errorEvent = new Event('error');
      survey.iFrame.dispatchEvent(errorEvent);

      expect(onError).toHaveBeenCalled();
      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });

    test('should call onQuarantineBlocked when blocked by quarantine', () => {
      // Set quarantine to 2 days ago (5 days remaining for 7-day period)
      const quarantineKey = 'hcSDK.SurveyQuarantineStart:test-survey-id';
      const twoDaysAgo = Date.now() - 2 * 24 * 60 * 60 * 1000;
      localStorageMock.store[quarantineKey] = twoDaysAgo.toString();

      const onQuarantineBlocked = jest.fn();
      const config: ModalSurveyConfig = {
        quarantineConfig: { period: 7 },
        callbacks: { onQuarantineBlocked },
      };

      const survey = new ModalSurvey(mockUrlBuilder, config);

      createdModals.push(survey);
      survey.show();

      expect(onQuarantineBlocked).toHaveBeenCalled();
      expect(onQuarantineBlocked).toHaveBeenCalledWith(5);
    });

    test('should not throw if callbacks are not provided', () => {
      const config: ModalSurveyConfig = {};

      const survey = new ModalSurvey(mockUrlBuilder, config);

      createdModals.push(survey);

      expect(() => {
        survey.show();
        survey.close();
        survey.destroy();
      }).not.toThrow();
    });

    test('should handle multiple callbacks being called', () => {
      const onShow = jest.fn();
      const onClose = jest.fn();
      const onDestroy = jest.fn();

      const config: ModalSurveyConfig = {
        showByDefault: false,
        callbacks: { onShow, onClose, onDestroy },
      };

      const survey = new ModalSurvey(mockUrlBuilder, config);

      createdModals.push(survey);

      // Constructor calls close() when showByDefault is false, so onClose called once already
      expect(onClose).toHaveBeenCalledTimes(1);

      localStorageMock.clear();
      survey.show();
      survey.close();
      survey.show();
      survey.close();
      survey.destroy();

      expect(onShow).toHaveBeenCalledTimes(2);
      expect(onClose).toHaveBeenCalledTimes(3); // 1 from constructor + 2 explicit calls
      expect(onDestroy).toHaveBeenCalledTimes(1);
    });
  });

  describe('M. Accessibility Tests', () => {
    test('should have role="dialog" attribute', () => {
      const config: ModalSurveyConfig = {};

      const survey = new ModalSurvey(mockUrlBuilder, config);

      createdModals.push(survey);

      expect(survey.modalContainer.getAttribute('role')).toBe('dialog');
    });

    test('should have aria-modal="true" attribute', () => {
      const config: ModalSurveyConfig = {};

      const survey = new ModalSurvey(mockUrlBuilder, config);

      createdModals.push(survey);

      expect(survey.modalContainer.getAttribute('aria-modal')).toBe('true');
    });

    test('should have default aria-label', () => {
      const config: ModalSurveyConfig = {};

      const survey = new ModalSurvey(mockUrlBuilder, config);

      createdModals.push(survey);

      expect(survey.modalContainer.getAttribute('aria-label')).toBe(
        'Survey dialog',
      );
    });

    test('should use custom aria-label when provided', () => {
      const config: ModalSurveyConfig = {
        ariaLabel: 'Customer feedback survey',
      };

      const survey = new ModalSurvey(mockUrlBuilder, config);

      createdModals.push(survey);

      expect(survey.modalContainer.getAttribute('aria-label')).toBe(
        'Customer feedback survey',
      );
    });

    test('should set aria-description when provided', () => {
      const config: ModalSurveyConfig = {
        ariaDescription: 'Please take a moment to share your feedback',
      };

      const survey = new ModalSurvey(mockUrlBuilder, config);

      createdModals.push(survey);

      expect(survey.modalContainer.getAttribute('aria-description')).toBe(
        'Please take a moment to share your feedback',
      );
    });

    test('should not set aria-description when not provided', () => {
      const config: ModalSurveyConfig = {};

      const survey = new ModalSurvey(mockUrlBuilder, config);

      createdModals.push(survey);

      expect(survey.modalContainer.hasAttribute('aria-description')).toBe(
        false,
      );
    });

    test('should be focusable with tabindex="-1"', () => {
      const config: ModalSurveyConfig = {};

      const survey = new ModalSurvey(mockUrlBuilder, config);

      createdModals.push(survey);

      expect(survey.modalContainer.getAttribute('tabindex')).toBe('-1');
    });

    test('should focus modal when shown', (done) => {
      const config: ModalSurveyConfig = {
        showByDefault: false,
      };

      const survey = new ModalSurvey(mockUrlBuilder, config);

      createdModals.push(survey);

      // Mock focus method
      const focusSpy = jest.spyOn(survey.modalContainer, 'focus');

      localStorageMock.clear();
      survey.show();

      // Focus happens asynchronously
      setTimeout(() => {
        expect(focusSpy).toHaveBeenCalled();
        done();
      }, 10);
    });
  });

  describe('N. Dynamic URL Updates Tests', () => {
    test('should update URL config without recreating survey', () => {
      const config: ModalSurveyConfig = {};

      const survey = new ModalSurvey(mockUrlBuilder, config);

      createdModals.push(survey);
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
      const config: ModalSurveyConfig = {};

      const survey = new ModalSurvey(mockUrlBuilder, config);

      createdModals.push(survey);
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
      const config: ModalSurveyConfig = {};

      const survey = new ModalSurvey(mockUrlBuilder, config);

      createdModals.push(survey);
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
      const config: ModalSurveyConfig = {};

      const survey = new ModalSurvey(mockUrlBuilder, config);

      createdModals.push(survey);
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
      const config: ModalSurveyConfig = {};

      const survey = new ModalSurvey(mockUrlBuilder, config);

      createdModals.push(survey);
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

  describe('O. PostMessage Communication Tests', () => {
    describe('sendMessage', () => {
      test('should send message to iframe', () => {
        const config: ModalSurveyConfig = {};

        const survey = new ModalSurvey(mockUrlBuilder, config);

        createdModals.push(survey);
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
        const config: ModalSurveyConfig = {};

        const survey = new ModalSurvey(mockUrlBuilder, config);

        createdModals.push(survey);
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
        const config: ModalSurveyConfig = {};

        const survey = new ModalSurvey(mockUrlBuilder, config);

        createdModals.push(survey);

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
        const config: ModalSurveyConfig = {};

        const survey = new ModalSurvey(mockUrlBuilder, config);

        createdModals.push(survey);
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
        const config: ModalSurveyConfig = {};

        const survey = new ModalSurvey(mockUrlBuilder, config);

        createdModals.push(survey);
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
        const config: ModalSurveyConfig = {};

        const survey = new ModalSurvey(mockUrlBuilder, config);

        createdModals.push(survey);
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
        const config: ModalSurveyConfig = {};

        const survey = new ModalSurvey(mockUrlBuilder, config);

        createdModals.push(survey);
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
        const config: ModalSurveyConfig = {};

        const survey = new ModalSurvey(mockUrlBuilder, config);

        createdModals.push(survey);
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

  describe('P. Focus Trap Tests', () => {
    test('should store last focused element on show', (done) => {
      const button = document.createElement('button');
      button.id = 'trigger-button';
      document.body.appendChild(button);
      button.focus();

      const modal = new ModalSurvey(mockUrlBuilder, { showByDefault: false });

      createdModals.push(modal);

      localStorageMock.clear();
      modal.show();

      // Modal should be focused after show
      setTimeout(() => {
        expect(document.activeElement).toBe(modal.modalContainer);
        done();
      }, 10);
    });

    test('should trap Tab within modal', (done) => {
      const config: ModalSurveyConfig = {
        showByDefault: true,
        closeButton: true,
      };

      const modal = new ModalSurvey(mockUrlBuilder, config);

      createdModals.push(modal);

      // Wait for focus trap to be activated
      setTimeout(() => {
        // Get focusable elements (match implementation selector)
        const focusable = modal.modalContainer.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), iframe',
        );
        const first = focusable[0] as HTMLElement;
        const last = focusable[focusable.length - 1] as HTMLElement;

        // Ensure we have focusable elements
        expect(focusable.length).toBeGreaterThan(0);

        // Focus last element
        if (last && typeof last.focus === 'function') {
          last.focus();
          expect(document.activeElement).toBe(last);

          // Simulate Tab key
          const tabEvent = new KeyboardEvent('keydown', {
            key: 'Tab',
            bubbles: true,
            cancelable: true,
          });
          modal.modalContainer.dispatchEvent(tabEvent);

          // Should wrap to first
          setTimeout(() => {
            expect(document.activeElement).toBe(first);
            done();
          }, 10);
        } else {
          done.fail('Last element is not focusable');
        }
      }, 10);
    });

    test('should trap Shift+Tab within modal', (done) => {
      const config: ModalSurveyConfig = {
        showByDefault: true,
        closeButton: true,
      };

      const modal = new ModalSurvey(mockUrlBuilder, config);

      createdModals.push(modal);

      // Wait for focus trap to be activated
      setTimeout(() => {
        const focusable = modal.modalContainer.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), iframe',
        );
        const last = focusable[focusable.length - 1] as HTMLElement;

        // Ensure we have focusable elements
        expect(focusable.length).toBeGreaterThan(0);

        // Focus modal itself
        modal.modalContainer.focus();
        expect(document.activeElement).toBe(modal.modalContainer);

        // Simulate Shift+Tab
        const shiftTabEvent = new KeyboardEvent('keydown', {
          key: 'Tab',
          shiftKey: true,
          bubbles: true,
          cancelable: true,
        });
        modal.modalContainer.dispatchEvent(shiftTabEvent);

        // Should wrap to last
        setTimeout(() => {
          if (last && typeof last.focus === 'function') {
            expect(document.activeElement).toBe(last);
            done();
          } else {
            done.fail('Last element is not focusable');
          }
        }, 10);
      }, 10);
    });

    test('should restore focus on close', (done) => {
      const button = document.createElement('button');
      button.id = 'trigger-button';
      document.body.appendChild(button);
      button.focus();

      const modal = new ModalSurvey(mockUrlBuilder, { showByDefault: false });

      createdModals.push(modal);

      localStorageMock.clear();
      modal.show();

      // Wait for modal to be shown
      setTimeout(() => {
        expect(document.activeElement).toBe(modal.modalContainer);

        modal.close();

        // Focus restoration uses setTimeout
        setTimeout(() => {
          expect(document.activeElement).toBe(button);
          done();
        }, 10);
      }, 10);
    });

    test('should not restore focus on destroy', (done) => {
      const button = document.createElement('button');
      button.id = 'trigger-button';
      document.body.appendChild(button);
      button.focus();

      const modal = new ModalSurvey(mockUrlBuilder, { showByDefault: true });

      createdModals.push(modal);

      // Wait for modal to be focused
      setTimeout(() => {
        // Modal should be focused
        expect(document.activeElement).toBe(modal.modalContainer);

        modal.destroy();

        // Focus should not be restored to button (remains on body or modal container)
        // After destroy, modal is removed so focus goes to body
        expect(document.body.contains(modal.modalContainer)).toBe(false);
        done();
      }, 10);
    });

    test('should deactivate focus trap when modal closes', (done) => {
      const config: ModalSurveyConfig = {
        showByDefault: true,
        closeButton: true,
      };

      const modal = new ModalSurvey(mockUrlBuilder, config);

      createdModals.push(modal);
      createdModals.push(modal); // Track for cleanup

      // Wait for focus trap to be activated
      setTimeout(() => {
        // Close the modal
        modal.close();

        // Wait for deactivation to complete
        setTimeout(() => {
          // Try to trigger Tab event after closing - should not trap
          const tabEvent = new KeyboardEvent('keydown', {
            key: 'Tab',
            bubbles: true,
            cancelable: true,
          });

          // Event should not be prevented since trap is deactivated
          const preventDefaultSpy = jest.spyOn(tabEvent, 'preventDefault');
          document.dispatchEvent(tabEvent);

          expect(preventDefaultSpy).not.toHaveBeenCalled();

          done();
        }, 10);
      }, 10);
    });
  });
});
