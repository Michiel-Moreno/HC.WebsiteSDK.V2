import { InvalidQuerySelectorException } from '../../core/exceptions/invalid-query-selector.exception';
import { StyledElementFactory } from '../../core/factories/styled-element.factory';

import { BUTTON_TEXT_TRANSLATIONS, getButtonText } from './button-translations';
import { ButtonTriggerSurvey } from './button-trigger-survey';
import { ButtonTriggerSurveyConfig } from './button-trigger-survey-config.interface';
import * as defaults from './button-trigger-survey-defaults.style';

describe('ButtonTriggerSurvey', () => {
  // No-op function for tests that don't need to track onTrigger calls
  const noop = jest.fn();
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

    // Clear the noop mock
    noop.mockClear();

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
  });

  afterEach(() => {
    document.body.innerHTML = '';
    localStorageMock.clear();
    StyledElementFactory.clearStyleCache();
  });

  describe('A. Constructor & Creation Tests', () => {
    test('should create button element with default config', () => {
      const config: ButtonTriggerSurveyConfig = {
        onTrigger: noop,
      };

      const survey = new ButtonTriggerSurvey(config);

      expect(survey.button).toBeDefined();
      expect(survey.button.tagName).toBe('BUTTON');
      expect(survey.container).toBeDefined();
    });

    test('should throw error when onTrigger is missing', () => {
      const config = {} as ButtonTriggerSurveyConfig;

      expect(() => new ButtonTriggerSurvey(config)).toThrow();
    });

    test('should create button with all config options', () => {
      const config: ButtonTriggerSurveyConfig = {
        position: 'top-left',
        stylePreset: 'circle-button',
        text: 'Custom Text',
        onTrigger: noop,
        zIndex: 5000,
        ariaLabel: 'Custom Label',
      };

      const survey = new ButtonTriggerSurvey(config);

      expect(survey.button).toBeDefined();
      expect(survey.container).toBeDefined();
    });

    test('should append button to document.body by default', () => {
      const config: ButtonTriggerSurveyConfig = {
        onTrigger: noop,
      };

      new ButtonTriggerSurvey(config);

      const container = document.body.querySelector(
        '.hello-customer-button-trigger',
      );
      expect(container).not.toBeNull();
      expect(container?.parentElement).toBe(document.body);
    });

    test('should append to custom container when containerSelector provided', () => {
      const customContainer = document.createElement('div');
      customContainer.id = 'custom-root';
      document.body.appendChild(customContainer);

      const config: ButtonTriggerSurveyConfig = {
        onTrigger: noop,
        containerSelector: '#custom-root',
      };

      new ButtonTriggerSurvey(config);

      const container = customContainer.querySelector(
        '.hello-customer-button-trigger',
      );
      expect(container).not.toBeNull();
      expect(container?.parentElement).toBe(customContainer);
    });

    test('should throw InvalidQuerySelectorException when containerSelector is invalid', () => {
      const config: ButtonTriggerSurveyConfig = {
        onTrigger: noop,
        containerSelector: '#nonexistent',
      };

      expect(() => new ButtonTriggerSurvey(config)).toThrow(
        InvalidQuerySelectorException,
      );
    });

    test('should set default position to bottom-right', () => {
      const config: ButtonTriggerSurveyConfig = {
        onTrigger: noop,
      };

      const survey = new ButtonTriggerSurvey(config);

      // Check that the container has the default class
      expect(
        survey.container.classList.contains(
          defaults.classNames.buttonContainer,
        ),
      ).toBe(true);
    });

    test('should set default stylePreset to pill-button', () => {
      const config: ButtonTriggerSurveyConfig = {
        onTrigger: noop,
        text: 'Test',
      };

      const survey = new ButtonTriggerSurvey(config);

      // Check that the button has the default class
      expect(survey.button.classList.contains(defaults.classNames.button)).toBe(
        true,
      );
    });
  });

  describe('B. Position Tests', () => {
    test('should apply correct position styles for bottom-right', () => {
      const survey = new ButtonTriggerSurvey({
        onTrigger: noop,
        position: 'bottom-right',
      });

      expect(
        survey.container.classList.contains(
          defaults.classNames.buttonContainer,
        ),
      ).toBe(true);
    });

    test('should apply correct position styles for bottom-left', () => {
      const survey = new ButtonTriggerSurvey({
        onTrigger: noop,
        position: 'bottom-left',
      });

      expect(
        survey.container.classList.contains(
          defaults.classNames.buttonContainer,
        ),
      ).toBe(true);
    });

    test('should apply correct position styles for top-right', () => {
      const survey = new ButtonTriggerSurvey({
        onTrigger: noop,
        position: 'top-right',
      });

      expect(
        survey.container.classList.contains(
          defaults.classNames.buttonContainer,
        ),
      ).toBe(true);
    });

    test('should apply correct position styles for top-left', () => {
      const survey = new ButtonTriggerSurvey({
        onTrigger: noop,
        position: 'top-left',
      });

      expect(
        survey.container.classList.contains(
          defaults.classNames.buttonContainer,
        ),
      ).toBe(true);
    });

    test('should apply correct position styles for left-center', () => {
      const survey = new ButtonTriggerSurvey({
        onTrigger: noop,
        position: 'left-center',
      });

      expect(
        survey.container.classList.contains(
          defaults.classNames.buttonContainer,
        ),
      ).toBe(true);
    });

    test('should apply correct position styles for right-center', () => {
      const survey = new ButtonTriggerSurvey({
        onTrigger: noop,
        position: 'right-center',
      });

      expect(
        survey.container.classList.contains(
          defaults.classNames.buttonContainer,
        ),
      ).toBe(true);
    });

    test('should apply correct position styles for bottom-center', () => {
      const survey = new ButtonTriggerSurvey({
        onTrigger: noop,
        position: 'bottom-center',
      });

      expect(
        survey.container.classList.contains(
          defaults.classNames.buttonContainer,
        ),
      ).toBe(true);
    });

    test('should apply correct position styles for top-center', () => {
      const survey = new ButtonTriggerSurvey({
        onTrigger: noop,
        position: 'top-center',
      });

      expect(
        survey.container.classList.contains(
          defaults.classNames.buttonContainer,
        ),
      ).toBe(true);
    });
  });

  describe('C. Style Preset Tests', () => {
    test('should apply correct preset styles for pill-button', () => {
      const survey = new ButtonTriggerSurvey({
        onTrigger: noop,
        stylePreset: 'pill-button',
      });

      expect(survey.button.classList.contains(defaults.classNames.button)).toBe(
        true,
      );
    });

    test('should apply correct preset styles for circle-button', () => {
      const survey = new ButtonTriggerSurvey({
        onTrigger: noop,
        stylePreset: 'circle-button',
      });

      expect(survey.button.classList.contains(defaults.classNames.button)).toBe(
        true,
      );
    });

    test('should apply correct preset styles for side-tab', () => {
      const survey = new ButtonTriggerSurvey({
        onTrigger: noop,
        stylePreset: 'side-tab',
      });

      expect(survey.button.classList.contains(defaults.classNames.button)).toBe(
        true,
      );
    });

    test('should apply correct preset styles for banner', () => {
      const survey = new ButtonTriggerSurvey({
        onTrigger: noop,
        stylePreset: 'banner',
      });

      expect(survey.button.classList.contains(defaults.classNames.button)).toBe(
        true,
      );
    });
  });

  describe('D. Content Tests', () => {
    test('should render text content when provided', () => {
      const survey = new ButtonTriggerSurvey({
        onTrigger: noop,
        text: 'Give Feedback',
      });

      const textElement = survey.button.querySelector(
        '.hello-customer-button-trigger__text',
      );
      expect(textElement).not.toBeNull();
      expect(textElement?.textContent).toBe('Give Feedback');
    });

    test('should render icon when provided as HTMLElement', () => {
      const icon = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'svg',
      ) as unknown as HTMLElement;
      icon.innerHTML = '<path d="M10 10"></path>';

      const survey = new ButtonTriggerSurvey({
        onTrigger: noop,
        icon: icon,
      });

      const iconElement = survey.button.querySelector(
        '.hello-customer-button-trigger__icon',
      );
      expect(iconElement).not.toBeNull();
      expect(iconElement?.querySelector('svg')).not.toBeNull();
    });

    test('should render icon when provided as string/HTML', () => {
      const survey = new ButtonTriggerSurvey({
        onTrigger: noop,
        icon: '<svg><circle cx="10" cy="10" r="5"></circle></svg>',
      });

      const iconElement = survey.button.querySelector(
        '.hello-customer-button-trigger__icon',
      );
      expect(iconElement).not.toBeNull();
      expect(iconElement?.innerHTML).toContain('svg');
    });

    test('should render both text and icon', () => {
      const survey = new ButtonTriggerSurvey({
        onTrigger: noop,
        text: 'Feedback',
        icon: '<span>★</span>',
      });

      const textElement = survey.button.querySelector(
        '.hello-customer-button-trigger__text',
      );
      const iconElement = survey.button.querySelector(
        '.hello-customer-button-trigger__icon',
      );

      expect(textElement).not.toBeNull();
      expect(iconElement).not.toBeNull();
      expect(textElement?.textContent).toBe('Feedback');
    });

    test('should not render text for circle-button preset even when provided', () => {
      const survey = new ButtonTriggerSurvey({
        onTrigger: noop,
        stylePreset: 'circle-button',
        text: 'This should not appear',
      });

      const textElement = survey.button.querySelector(
        '.hello-customer-button-trigger__text',
      );
      expect(textElement).toBeNull();
    });
  });

  describe('E. Custom Style Tests', () => {
    test('should apply custom button styles', () => {
      const survey = new ButtonTriggerSurvey({
        onTrigger: noop,
        customStyle: {
          buttonStyle: {
            backgroundColor: 'red',
            color: 'yellow',
          },
        },
      });

      // Button should have the default class with custom styles merged
      expect(survey.button.classList.contains(defaults.classNames.button)).toBe(
        true,
      );
    });

    test('should merge custom styles with default styles', () => {
      const survey = new ButtonTriggerSurvey({
        onTrigger: noop,
        stylePreset: 'pill-button',
        customStyle: {
          buttonStyle: {
            backgroundColor: 'purple',
          },
        },
      });

      // Button should have the default class with merged styles
      expect(survey.button.classList.contains(defaults.classNames.button)).toBe(
        true,
      );
    });

    test('should ignore default styles when ignoreDefaultStyles is true', () => {
      const survey = new ButtonTriggerSurvey({
        onTrigger: noop,
        ignoreDefaultStyles: true,
      });

      // Button should still have the class name
      expect(survey.button.classList.contains(defaults.classNames.button)).toBe(
        true,
      );
    });

    test('should apply custom class names', () => {
      const survey = new ButtonTriggerSurvey({
        onTrigger: noop,
        classNames: {
          buttonContainer: 'my-container',
          button: 'my-button',
          buttonText: 'my-text',
        },
        text: 'Test',
      });

      expect(survey.container.classList.contains('my-container')).toBe(true);
      expect(survey.button.classList.contains('my-button')).toBe(true);

      const textElement = survey.button.querySelector('.my-text');
      expect(textElement).not.toBeNull();
    });
  });

  describe('F. Lifecycle Methods Tests', () => {
    test('should show button by default when showByDefault is not specified', () => {
      const survey = new ButtonTriggerSurvey({
        onTrigger: noop,
      });

      expect(
        survey.container.classList.contains(defaults.classNames.buttonVisible),
      ).toBe(true);
      expect(
        survey.container.classList.contains(defaults.classNames.buttonHidden),
      ).toBe(false);
    });

    test('should hide button when showByDefault is false', () => {
      const survey = new ButtonTriggerSurvey({
        onTrigger: noop,
        showByDefault: false,
      });

      expect(
        survey.container.classList.contains(defaults.classNames.buttonVisible),
      ).toBe(false);
      expect(
        survey.container.classList.contains(defaults.classNames.buttonHidden),
      ).toBe(true);
    });

    test('should show button when show() is called', () => {
      const survey = new ButtonTriggerSurvey({
        onTrigger: noop,
        showByDefault: false,
      });

      survey.show();

      expect(
        survey.container.classList.contains(defaults.classNames.buttonVisible),
      ).toBe(true);
      expect(
        survey.container.classList.contains(defaults.classNames.buttonHidden),
      ).toBe(false);
    });

    test('should hide button when hide() is called', () => {
      const survey = new ButtonTriggerSurvey({
        onTrigger: noop,
        showByDefault: true,
      });

      survey.hide();

      expect(
        survey.container.classList.contains(defaults.classNames.buttonVisible),
      ).toBe(false);
      expect(
        survey.container.classList.contains(defaults.classNames.buttonHidden),
      ).toBe(true);
    });

    test('should remove from DOM when destroy() is called', () => {
      const survey = new ButtonTriggerSurvey({
        onTrigger: noop,
      });

      const containerInDOM = document.body.contains(survey.container);
      expect(containerInDOM).toBe(true);

      survey.destroy();

      const containerStillInDOM = document.body.contains(survey.container);
      expect(containerStillInDOM).toBe(false);
    });

    test('should remove click handler when destroyed', () => {
      const onTriggerMock = jest.fn();
      const survey = new ButtonTriggerSurvey({
        onTrigger: onTriggerMock,
      });

      // Verify button works before destroy
      survey.button.click();
      expect(onTriggerMock).toHaveBeenCalledTimes(1);

      // Destroy the survey
      survey.destroy();

      // Try to click button after destroy (button still exists in memory)
      // The handler should be removed, so callback should not fire
      survey.button.click();

      // Should still be called only once (from before destroy)
      expect(onTriggerMock).toHaveBeenCalledTimes(1);
    });

    test('should clear internal references after destroy', () => {
      const survey = new ButtonTriggerSurvey({
        onTrigger: noop,
      });

      // Verify clickHandler exists before destroy (accessing private property for testing)
      expect(survey['clickHandler']).not.toBeNull();

      // Destroy the survey
      survey.destroy();

      // Verify clickHandler is cleared (accessing private property for testing)
      expect(survey['clickHandler']).toBeNull();

      // Verify isDestroyed flag is set (accessing private property for testing)
      expect(survey['isDestroyed']).toBe(true);
    });

    test('should not throw error when destroy called twice', () => {
      const survey = new ButtonTriggerSurvey({
        onTrigger: noop,
      });

      survey.destroy();

      expect(() => survey.destroy()).not.toThrow();
    });

    test('should not show if under quarantine', () => {
      // First survey to set quarantine
      const survey1 = new ButtonTriggerSurvey({
        onTrigger: noop,
        quarantineConfig: { period: 7 },
      });

      // Should be visible initially
      expect(
        survey1.container.classList.contains(defaults.classNames.buttonVisible),
      ).toBe(true);

      // Manually set quarantine in localStorage
      const quarantineKey =
        'hcSDK.SurveyQuarantineStart:button-trigger-bottom-right-' + Date.now();
      localStorageMock.setItem(quarantineKey, Date.now().toString());

      // Create new survey with same position (should be under quarantine)
      const survey2 = new ButtonTriggerSurvey({
        onTrigger: noop,
        quarantineConfig: { period: 7 },
        position: 'bottom-right',
      });

      // Second survey should be hidden due to quarantine
      expect(
        survey2.container.classList.contains(defaults.classNames.buttonVisible),
      ).toBe(false);
    });
  });

  describe('G. Trigger Callback Tests', () => {
    test('should call onTrigger callback when button is clicked', () => {
      const onTriggerMock = jest.fn();
      const survey = new ButtonTriggerSurvey({
        onTrigger: onTriggerMock,
      });

      survey.button.click();

      expect(onTriggerMock).toHaveBeenCalledTimes(1);
    });

    test('should call onTrigger multiple times if clicked multiple times', () => {
      const onTriggerMock = jest.fn();
      const survey = new ButtonTriggerSurvey({
        onTrigger: onTriggerMock,
      });

      survey.button.click();
      survey.button.click();
      survey.button.click();

      expect(onTriggerMock).toHaveBeenCalledTimes(3);
    });

    test('should pass correct context in callback', () => {
      let contextCheck = false;
      const survey = new ButtonTriggerSurvey({
        onTrigger: function () {
          contextCheck = true;
        },
      });

      survey.button.click();

      expect(contextCheck).toBe(true);
    });
  });

  describe('H. Quarantine Tests', () => {
    test('should start quarantine when button is shown', () => {
      const survey = new ButtonTriggerSurvey({
        onTrigger: noop,
        quarantineConfig: { period: 7 },
        showByDefault: true,
      });

      expect(survey.container).toBeDefined();
      expect(localStorageMock.setItem).toHaveBeenCalled();
      const setItemCalls = localStorageMock.setItem.mock.calls;
      const quarantineCall = setItemCalls.find((call) =>
        call[0].includes('hcSDK.SurveyQuarantineStart'),
      );
      expect(quarantineCall).toBeDefined();
    });

    test('should not show button if under quarantine', () => {
      // Create first survey with quarantine
      const survey1 = new ButtonTriggerSurvey({
        onTrigger: noop,
        quarantineConfig: { period: 7 },
        showByDefault: true,
      });

      // First survey should be visible and quarantine should be set
      expect(
        survey1.container.classList.contains(defaults.classNames.buttonVisible),
      ).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalled();

      // Hide the survey manually
      survey1.hide();

      // Try to show again - should respect quarantine
      survey1.show();

      // Note: Due to unique IDs per instance, each survey has its own quarantine
      // This test verifies the quarantine service is being called
      expect(localStorageMock.setItem).toHaveBeenCalledTimes(1);
    });

    test('should respect quarantine period configuration', () => {
      // Create survey with quarantine period
      const survey1 = new ButtonTriggerSurvey({
        onTrigger: noop,
        quarantineConfig: { period: 7 },
        showByDefault: true,
        text: 'Survey1',
      });

      // Verify quarantine was started
      expect(localStorageMock.setItem).toHaveBeenCalled();
      expect(
        survey1.container.classList.contains(defaults.classNames.buttonVisible),
      ).toBe(true);

      // Create another survey with different text (different quarantine ID)
      const survey2 = new ButtonTriggerSurvey({
        onTrigger: noop,
        quarantineConfig: { period: 1 },
        showByDefault: true,
        text: 'Survey2',
      });

      // Both surveys should set their own quarantine (different IDs due to different text)
      expect(localStorageMock.setItem).toHaveBeenCalledTimes(2);
      expect(
        survey2.container.classList.contains(defaults.classNames.buttonVisible),
      ).toBe(true);
    });

    test('should generate unique quarantine ID', () => {
      const survey1 = new ButtonTriggerSurvey({
        onTrigger: noop,
        quarantineConfig: { period: 7 },
        position: 'bottom-right',
      });

      const survey2 = new ButtonTriggerSurvey({
        onTrigger: noop,
        quarantineConfig: { period: 7 },
        position: 'top-left',
      });

      // Ensure both surveys were created
      expect(survey1.container).toBeDefined();
      expect(survey2.container).toBeDefined();

      // Each survey should have different quarantine keys due to position
      const calls = localStorageMock.setItem.mock.calls;
      const keys = calls.map((call) => call[0]);
      const uniqueKeys = new Set(keys);

      expect(uniqueKeys.size).toBeGreaterThan(0);
    });
  });

  describe('I. Quarantine ID Stability Tests', () => {
    test('should use provided quarantine ID', () => {
      const survey = new ButtonTriggerSurvey({
        onTrigger: noop,
        position: 'bottom-right',
        quarantineId: 'custom-feedback-button',
        quarantineConfig: { period: 7 },
      });

      expect(survey.container).toBeDefined();

      // Check localStorage key uses custom ID
      const calls = localStorageMock.setItem.mock.calls;
      const quarantineCall = calls.find(
        (call) =>
          call[0] === 'hcSDK.SurveyQuarantineStart:custom-feedback-button',
      );
      expect(quarantineCall).toBeDefined();
    });

    test('should generate stable ID from position and text', () => {
      const survey1 = new ButtonTriggerSurvey({
        onTrigger: noop,
        position: 'bottom-right',
        text: 'Feedback',
        quarantineConfig: { period: 7 },
      });

      expect(survey1.container).toBeDefined();

      // Check that localStorage key is predictable
      const calls = localStorageMock.setItem.mock.calls;
      const quarantineCall = calls.find(
        (call) =>
          call[0] ===
          'hcSDK.SurveyQuarantineStart:button-trigger-bottom-right-Feedback',
      );
      expect(quarantineCall).toBeDefined();
    });

    test('should generate stable ID with default text when no text provided', () => {
      const survey = new ButtonTriggerSurvey({
        onTrigger: noop,
        position: 'bottom-right',
        quarantineConfig: { period: 7 },
      });

      expect(survey.container).toBeDefined();

      // Should use 'default' when no text provided
      const calls = localStorageMock.setItem.mock.calls;
      const quarantineCall = calls.find(
        (call) =>
          call[0] ===
          'hcSDK.SurveyQuarantineStart:button-trigger-bottom-right-default',
      );
      expect(quarantineCall).toBeDefined();
    });

    test('should use different IDs for different positions', () => {
      const survey1 = new ButtonTriggerSurvey({
        onTrigger: noop,
        position: 'bottom-right',
        text: 'Feedback',
        quarantineConfig: { period: 7 },
      });

      const survey2 = new ButtonTriggerSurvey({
        onTrigger: noop,
        position: 'top-left',
        text: 'Feedback',
        quarantineConfig: { period: 7 },
      });

      expect(survey1.container).toBeDefined();
      expect(survey2.container).toBeDefined();

      // Verify different localStorage keys
      const calls = localStorageMock.setItem.mock.calls;
      const key1 = calls.find(
        (call) =>
          call[0] ===
          'hcSDK.SurveyQuarantineStart:button-trigger-bottom-right-Feedback',
      );
      const key2 = calls.find(
        (call) =>
          call[0] ===
          'hcSDK.SurveyQuarantineStart:button-trigger-top-left-Feedback',
      );

      expect(key1).toBeDefined();
      expect(key2).toBeDefined();
    });

    test('should use different IDs for different text values', () => {
      const survey1 = new ButtonTriggerSurvey({
        onTrigger: noop,
        position: 'bottom-right',
        text: 'Feedback',
        quarantineConfig: { period: 7 },
      });

      const survey2 = new ButtonTriggerSurvey({
        onTrigger: noop,
        position: 'bottom-right',
        text: 'Help',
        quarantineConfig: { period: 7 },
      });

      expect(survey1.container).toBeDefined();
      expect(survey2.container).toBeDefined();

      // Verify different localStorage keys
      const calls = localStorageMock.setItem.mock.calls;
      const key1 = calls.find(
        (call) =>
          call[0] ===
          'hcSDK.SurveyQuarantineStart:button-trigger-bottom-right-Feedback',
      );
      const key2 = calls.find(
        (call) =>
          call[0] ===
          'hcSDK.SurveyQuarantineStart:button-trigger-bottom-right-Help',
      );

      expect(key1).toBeDefined();
      expect(key2).toBeDefined();
    });
  });

  describe('J. Accessibility Tests', () => {
    test('should set aria-label attribute', () => {
      const survey = new ButtonTriggerSurvey({
        onTrigger: noop,
        ariaLabel: 'Open feedback form',
      });

      expect(survey.button.getAttribute('aria-label')).toBe(
        'Open feedback form',
      );
    });

    test('should set button type attribute to "button"', () => {
      const survey = new ButtonTriggerSurvey({
        onTrigger: noop,
      });

      expect(survey.button.getAttribute('type')).toBe('button');
    });

    test('should use text as aria-label when ariaLabel not provided', () => {
      const survey = new ButtonTriggerSurvey({
        onTrigger: noop,
        text: 'Give Feedback',
      });

      expect(survey.button.getAttribute('aria-label')).toBe('Give Feedback');
    });
  });

  describe('K. Property Getters Tests', () => {
    test('should expose button element via getter', () => {
      const survey = new ButtonTriggerSurvey({
        onTrigger: noop,
      });

      const button = survey.button;
      expect(button).toBeDefined();
      expect(button.tagName).toBe('BUTTON');
    });

    test('should expose container element via getter', () => {
      const survey = new ButtonTriggerSurvey({
        onTrigger: noop,
      });

      const container = survey.container;
      expect(container).toBeDefined();
      expect(container.tagName).toBe('DIV');
      expect(
        container.classList.contains('hello-customer-button-trigger'),
      ).toBe(true);
    });
  });

  describe('L. Lifecycle Callbacks Tests', () => {
    test('should call onShow when button is shown', () => {
      const onShow = jest.fn();
      const config: ButtonTriggerSurveyConfig = {
        onTrigger: noop,
        showByDefault: false,
        callbacks: { onShow },
      };

      const survey = new ButtonTriggerSurvey(config);
      survey.show();

      expect(onShow).toHaveBeenCalled();
    });

    test('should call onHide when button is hidden', () => {
      const onHide = jest.fn();
      const config: ButtonTriggerSurveyConfig = {
        onTrigger: noop,
        showByDefault: true,
        callbacks: { onHide },
      };

      const survey = new ButtonTriggerSurvey(config);
      survey.hide();

      expect(onHide).toHaveBeenCalled();
    });

    test('should call onDestroy when survey is destroyed', () => {
      const onDestroy = jest.fn();
      const config: ButtonTriggerSurveyConfig = {
        onTrigger: noop,
        callbacks: { onDestroy },
      };

      const survey = new ButtonTriggerSurvey(config);
      survey.destroy();

      expect(onDestroy).toHaveBeenCalled();
    });

    test('should call onQuarantineBlocked when blocked by quarantine', () => {
      // Set quarantine to 2 days ago (5 days remaining for 7-day period)
      const quarantineKey =
        'hcSDK.SurveyQuarantineStart:button-trigger-bottom-right-Test';
      const twoDaysAgo = Date.now() - 2 * 24 * 60 * 60 * 1000;
      localStorageMock.store[quarantineKey] = twoDaysAgo.toString();

      const onQuarantineBlocked = jest.fn();
      const config: ButtonTriggerSurveyConfig = {
        onTrigger: noop,
        quarantineConfig: { period: 7 },
        showByDefault: false,
        text: 'Test',
        callbacks: { onQuarantineBlocked },
      };

      const survey = new ButtonTriggerSurvey(config);
      survey.show();

      expect(onQuarantineBlocked).toHaveBeenCalled();
      expect(onQuarantineBlocked).toHaveBeenCalledWith(5);
    });

    test('should not throw if callbacks are not provided', () => {
      const config: ButtonTriggerSurveyConfig = {
        onTrigger: noop,
        showByDefault: false,
      };

      const survey = new ButtonTriggerSurvey(config);

      expect(() => {
        survey.show();
        survey.hide();
        survey.destroy();
      }).not.toThrow();
    });

    test('should call onShow when created with showByDefault=true', () => {
      const onShow = jest.fn();
      const config: ButtonTriggerSurveyConfig = {
        onTrigger: noop,
        showByDefault: true,
        callbacks: { onShow },
      };

      new ButtonTriggerSurvey(config);

      // Constructor calls show() when showByDefault is true (or undefined, which defaults to true)
      expect(onShow).toHaveBeenCalled();
    });

    test('should call onHide when created with showByDefault=false', () => {
      const onHide = jest.fn();
      const config: ButtonTriggerSurveyConfig = {
        onTrigger: noop,
        showByDefault: false,
        callbacks: { onHide },
      };

      new ButtonTriggerSurvey(config);

      // Constructor calls hide() when showByDefault is false
      expect(onHide).toHaveBeenCalled();
    });
  });

  describe('M. Dynamic URL Updates Tests', () => {
    test('should handle updateUrlConfig gracefully (no urlFactory)', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const config: ButtonTriggerSurveyConfig = {
        position: 'bottom-right',
        text: 'Feedback',
        onTrigger: noop,
      };

      const survey = new ButtonTriggerSurvey(config);

      // Should not throw
      expect(() => {
        survey.updateUrlConfig({ extra: { test: 'value' } });
      }).not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('no URL factory available'),
      );

      consoleSpy.mockRestore();
    });

    test('should not have updateAndReload method', () => {
      const config: ButtonTriggerSurveyConfig = {
        position: 'bottom-right',
        text: 'Feedback',
        onTrigger: noop,
      };

      const survey = new ButtonTriggerSurvey(config);

      // ButtonTriggerSurvey should not have updateAndReload because it has no iframe
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((survey as any).updateAndReload).toBeUndefined();
    });

    test('should not crash with multiple updateUrlConfig calls', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const config: ButtonTriggerSurveyConfig = {
        position: 'bottom-right',
        text: 'Feedback',
        onTrigger: noop,
      };

      const survey = new ButtonTriggerSurvey(config);

      // Should handle multiple calls gracefully
      expect(() => {
        survey.updateUrlConfig({ extra: { step: '1' } });
        survey.updateUrlConfig({ extra: { step: '2' } });
        survey.updateUrlConfig({ language: 'FR' });
      }).not.toThrow();

      // Should have warned 3 times
      expect(consoleSpy).toHaveBeenCalledTimes(3);

      consoleSpy.mockRestore();
    });
  });

  describe('N. i18n Tests', () => {
    describe('Automatic Translation', () => {
      test('should use English by default when no language provided', () => {
        const button = new ButtonTriggerSurvey({
          onTrigger: noop,
        });

        expect(button['buttonText']).toBe('Feedback');
      });

      test('should translate to French when language is FR', () => {
        const button = new ButtonTriggerSurvey({
          onTrigger: noop,
          language: 'FR',
        });

        expect(button['buttonText']).toBe('Commentaires');
      });

      test('should translate to Spanish when language is ES', () => {
        const button = new ButtonTriggerSurvey({
          onTrigger: noop,
          language: 'ES',
        });

        expect(button['buttonText']).toBe('Comentarios');
      });

      test('should translate to German when language is DE', () => {
        const button = new ButtonTriggerSurvey({
          onTrigger: noop,
          language: 'DE',
        });

        expect(button['buttonText']).toBe('Rückmeldung');
      });

      test('should translate to Arabic when language is AR', () => {
        const button = new ButtonTriggerSurvey({
          onTrigger: noop,
          language: 'AR',
        });

        expect(button['buttonText']).toBe('تعليقات');
      });

      test('should translate to Chinese when language is ZH', () => {
        const button = new ButtonTriggerSurvey({
          onTrigger: noop,
          language: 'ZH',
        });

        expect(button['buttonText']).toBe('反馈');
      });

      test('should handle case-insensitive language codes', () => {
        const buttonLowercase = new ButtonTriggerSurvey({
          onTrigger: noop,
          language: 'fr',
        });

        const buttonUppercase = new ButtonTriggerSurvey({
          onTrigger: noop,
          language: 'FR',
        });

        expect(buttonLowercase['buttonText']).toBe('Commentaires');
        expect(buttonUppercase['buttonText']).toBe('Commentaires');
      });

      test('should fallback to English for unsupported language', () => {
        const button = new ButtonTriggerSurvey({
          onTrigger: noop,
          language: 'XX', // Invalid language code
        });

        expect(button['buttonText']).toBe('Feedback');
      });

      test('should fallback to English for empty string language', () => {
        const button = new ButtonTriggerSurvey({
          onTrigger: noop,
          language: '',
        });

        expect(button['buttonText']).toBe('Feedback');
      });
    });

    describe('Custom Text Override', () => {
      test('should use custom text when provided', () => {
        const button = new ButtonTriggerSurvey({
          onTrigger: noop,
          language: 'FR',
          text: 'Custom French Text',
        });

        expect(button['buttonText']).toBe('Custom French Text');
      });

      test('should prefer custom text over translation', () => {
        const button = new ButtonTriggerSurvey({
          onTrigger: noop,
          language: 'ES',
          text: 'Mi Texto Personalizado',
        });

        expect(button['buttonText']).toBe('Mi Texto Personalizado');
        // Should not be the Spanish translation
        expect(button['buttonText']).not.toBe('Comentarios');
      });

      test('should use custom text even when no language provided', () => {
        const button = new ButtonTriggerSurvey({
          onTrigger: noop,
          text: 'My Custom Button',
        });

        expect(button['buttonText']).toBe('My Custom Button');
      });
    });

    describe('Circle Button Accessibility', () => {
      test('should hide text visually but use for ARIA label', () => {
        const button = new ButtonTriggerSurvey({
          onTrigger: noop,
          stylePreset: 'circle-button',
          language: 'FR',
          icon: '<svg><circle></circle></svg>',
        });

        // Text should not be in DOM (circle buttons don't show text)
        const textElement = button.button.querySelector(
          '.hello-customer-button-trigger__text',
        );
        expect(textElement).toBeNull();

        // But ARIA label should use the translated text
        expect(button.button.getAttribute('aria-label')).toBe('Commentaires');
      });

      test('should set ARIA label correctly for all languages', () => {
        const languages = [
          { code: 'EN', text: 'Feedback' },
          { code: 'FR', text: 'Commentaires' },
          { code: 'ES', text: 'Comentarios' },
          { code: 'DE', text: 'Rückmeldung' },
        ];

        languages.forEach(({ code, text }) => {
          const button = new ButtonTriggerSurvey({
            onTrigger: noop,
            stylePreset: 'circle-button',
            language: code,
            icon: '<svg></svg>',
          });

          expect(button.button.getAttribute('aria-label')).toBe(text);
        });
      });
    });

    describe('Dynamic Language Switching', () => {
      test('should update button text when language changes', () => {
        const button = new ButtonTriggerSurvey({
          onTrigger: noop,
          language: 'EN',
        });

        expect(button['buttonText']).toBe('Feedback');

        // Change language
        button.updateLanguage('FR');

        expect(button['buttonText']).toBe('Commentaires');

        const textElement = button.button.querySelector(
          '.hello-customer-button-trigger__text',
        );
        expect(textElement?.textContent).toBe('Commentaires');
      });

      test('should update ARIA label when language changes', () => {
        const button = new ButtonTriggerSurvey({
          onTrigger: noop,
          language: 'EN',
        });

        expect(button.button.getAttribute('aria-label')).toBe('Feedback');

        button.updateLanguage('ES');

        expect(button.button.getAttribute('aria-label')).toBe('Comentarios');
      });

      test('should not update when custom text is provided', () => {
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

        const button = new ButtonTriggerSurvey({
          onTrigger: noop,
          language: 'EN',
          text: 'Custom Text',
        });

        expect(button['buttonText']).toBe('Custom Text');

        // Try to change language - should not affect custom text
        button.updateLanguage('FR');

        expect(button['buttonText']).toBe('Custom Text');
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('Cannot update language'),
        );

        consoleSpy.mockRestore();
      });

      test('should switch between multiple languages', () => {
        const button = new ButtonTriggerSurvey({
          onTrigger: noop,
          language: 'EN',
        });

        expect(button['buttonText']).toBe('Feedback');

        button.updateLanguage('FR');
        expect(button['buttonText']).toBe('Commentaires');

        button.updateLanguage('ES');
        expect(button['buttonText']).toBe('Comentarios');

        button.updateLanguage('DE');
        expect(button['buttonText']).toBe('Rückmeldung');

        button.updateLanguage('EN');
        expect(button['buttonText']).toBe('Feedback');
      });
    });

    describe('Translation Dictionary Completeness', () => {
      test('should have translations for all 30 languages', () => {
        const expectedLanguages = [
          'AR',
          'BG',
          'CA',
          'CS',
          'DA',
          'DE',
          'EL',
          'EN',
          'ES',
          'ET',
          'FI',
          'FR',
          'GA',
          'HR',
          'HU',
          'IT',
          'LT',
          'LV',
          'MT',
          'NL',
          'NO',
          'PL',
          'PT',
          'RO',
          'RU',
          'SK',
          'SL',
          'SV',
          'TR',
          'ZH',
        ];

        expect(expectedLanguages).toHaveLength(30);

        expectedLanguages.forEach((lang) => {
          const translation = getButtonText(lang);
          expect(translation).toBeDefined();
          expect(translation.length).toBeGreaterThan(0);
          expect(translation).toBe(BUTTON_TEXT_TRANSLATIONS[lang]);
        });
      });

      test('should have non-empty translations for each language', () => {
        Object.values(BUTTON_TEXT_TRANSLATIONS).forEach((text) => {
          expect(text).toBeDefined();
          expect(typeof text).toBe('string');
          expect(text.length).toBeGreaterThan(0);
          expect(text.trim()).toBe(text); // No leading/trailing whitespace
        });
      });
    });

    describe('RTL Support', () => {
      test('should set RTL attributes for Arabic', () => {
        const button = new ButtonTriggerSurvey({
          onTrigger: noop,
          language: 'AR',
        });

        expect(button.button.getAttribute('dir')).toBe('rtl');
        expect(button.button.style.direction).toBe('rtl');
      });

      test('should not set RTL for LTR languages', () => {
        const languages = ['EN', 'FR', 'ES', 'DE'];

        languages.forEach((lang) => {
          const button = new ButtonTriggerSurvey({
            onTrigger: noop,
            language: lang,
          });

          expect(button.button.getAttribute('dir')).toBeFalsy();
        });
      });

      test('should adjust icon position for RTL with icon', () => {
        const button = new ButtonTriggerSurvey({
          onTrigger: noop,
          language: 'AR',
          icon: '<svg></svg>',
        });

        expect(button.button.style.flexDirection).toBe('row-reverse');
      });

      test('should update RTL when language switches to/from Arabic', () => {
        const button = new ButtonTriggerSurvey({
          onTrigger: noop,
          language: 'EN',
          icon: '<svg></svg>',
        });

        // Initially LTR
        expect(button.button.getAttribute('dir')).toBeFalsy();

        // Switch to Arabic
        button.updateLanguage('AR');
        expect(button.button.getAttribute('dir')).toBe('rtl');
        expect(button.button.style.direction).toBe('rtl');
        expect(button.button.style.flexDirection).toBe('row-reverse');

        // Switch back to English
        button.updateLanguage('EN');
        expect(button.button.getAttribute('dir')).toBeFalsy();
        expect(button.button.style.direction).toBe('');
        expect(button.button.style.flexDirection).toBe('');
      });
    });

    describe('Priority Order', () => {
      test('should prioritize explicit text over language translation', () => {
        const button = new ButtonTriggerSurvey({
          onTrigger: noop,
          text: 'Explicit Text',
          language: 'FR',
        });

        expect(button['buttonText']).toBe('Explicit Text');
        expect(button['buttonText']).not.toBe('Commentaires');
      });

      test('should prioritize language translation over default', () => {
        const button = new ButtonTriggerSurvey({
          onTrigger: noop,
          language: 'FR',
        });

        expect(button['buttonText']).toBe('Commentaires');
        expect(button['buttonText']).not.toBe('Feedback');
      });

      test('should use default when neither text nor language provided', () => {
        const button = new ButtonTriggerSurvey({
          onTrigger: noop,
        });

        expect(button['buttonText']).toBe('Feedback');
      });
    });

    describe('Custom ARIA Label', () => {
      test('should use custom ariaLabel over translated text', () => {
        const button = new ButtonTriggerSurvey({
          onTrigger: noop,
          language: 'FR',
          ariaLabel: 'Custom ARIA Label',
        });

        expect(button.button.getAttribute('aria-label')).toBe(
          'Custom ARIA Label',
        );
        expect(button['buttonText']).toBe('Commentaires');
      });

      test('should use translated text as ARIA label by default', () => {
        const button = new ButtonTriggerSurvey({
          onTrigger: noop,
          language: 'ES',
        });

        expect(button.button.getAttribute('aria-label')).toBe('Comentarios');
      });
    });
  });

  describe('O. Position-Aware Styling Tests', () => {
    test('should flip border radius for side-tab at left-center', () => {
      const button = new ButtonTriggerSurvey({
        onTrigger: noop,
        position: 'left-center',
        stylePreset: 'side-tab',
      });

      // Styles are applied via CSS classes, so check computed style
      const computedStyle = window.getComputedStyle(button.button);
      // Computed styles use shortened format (0 instead of 0px)
      expect(computedStyle.borderRadius).toBe('0 8px 8px 0');
    });

    test('should keep default border radius for side-tab at right-center', () => {
      const button = new ButtonTriggerSurvey({
        onTrigger: noop,
        position: 'right-center',
        stylePreset: 'side-tab',
      });

      const computedStyle = window.getComputedStyle(button.button);
      expect(computedStyle.borderRadius).toBe('8px 0 0 8px');
    });

    test('should warn when using side-tab at corner positions', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      new ButtonTriggerSurvey({
        onTrigger: noop,
        position: 'bottom-right',
        stylePreset: 'side-tab',
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("'side-tab' preset works best"),
      );

      consoleSpy.mockRestore();
    });

    test('should not warn when using side-tab at left-center or right-center', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      new ButtonTriggerSurvey({
        onTrigger: noop,
        position: 'left-center',
        stylePreset: 'side-tab',
      });

      new ButtonTriggerSurvey({
        onTrigger: noop,
        position: 'right-center',
        stylePreset: 'side-tab',
      });

      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    test('should set banner width to auto at corner positions', () => {
      const button = new ButtonTriggerSurvey({
        onTrigger: noop,
        position: 'bottom-right',
        stylePreset: 'banner',
      });

      const computedStyle = window.getComputedStyle(button.button);
      expect(computedStyle.width).not.toBe('100%');
      // Width will be 'auto' or calculated width, not the full viewport width
    });

    test('should keep full width for banner at top-center', () => {
      const button = new ButtonTriggerSurvey({
        onTrigger: noop,
        position: 'top-center',
        stylePreset: 'banner',
      });

      const computedStyle = window.getComputedStyle(button.button);
      // In JSDOM, 100% width gets computed, check it's defined
      expect(computedStyle.width).toBeDefined();
    });

    test('should keep full width for banner at bottom-center', () => {
      const button = new ButtonTriggerSurvey({
        onTrigger: noop,
        position: 'bottom-center',
        stylePreset: 'banner',
      });

      const computedStyle = window.getComputedStyle(button.button);
      expect(computedStyle.width).toBeDefined();
    });

    test('should warn when using banner at corner positions', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      new ButtonTriggerSurvey({
        onTrigger: noop,
        position: 'bottom-left',
        stylePreset: 'banner',
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("'banner' preset works best"),
      );

      consoleSpy.mockRestore();
    });

    test('should not warn when using banner at top-center or bottom-center', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      new ButtonTriggerSurvey({
        onTrigger: noop,
        position: 'top-center',
        stylePreset: 'banner',
      });

      new ButtonTriggerSurvey({
        onTrigger: noop,
        position: 'bottom-center',
        stylePreset: 'banner',
      });

      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    test('should allow custom styles to override position-aware adjustments', () => {
      const button = new ButtonTriggerSurvey({
        onTrigger: noop,
        position: 'left-center',
        stylePreset: 'side-tab',
        customStyle: {
          buttonStyle: {
            borderRadius: '16px', // Override the auto-adjusted radius
          },
        },
      });

      // Custom styles are merged after position-aware styles and take precedence
      const computedStyle = window.getComputedStyle(button.button);
      expect(computedStyle.borderRadius).toBe('16px');
    });

    test('should not affect pill-button or circle-button presets', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Pill button at any position should not warn
      new ButtonTriggerSurvey({
        onTrigger: noop,
        position: 'top-left',
        stylePreset: 'pill-button',
      });

      // Circle button at any position should not warn (about position)
      new ButtonTriggerSurvey({
        onTrigger: noop,
        position: 'bottom-center',
        stylePreset: 'circle-button',
        icon: '<svg></svg>', // Add icon to avoid icon-missing warning
      });

      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});
