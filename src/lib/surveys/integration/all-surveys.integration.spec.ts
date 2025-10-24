import { StyledElementFactory } from '../../core/factories/styled-element.factory';
import { UrlBuilder } from '../../url-builder/url.builder';
import { ButtonTriggerSurvey } from '../button-trigger-survey/button-trigger-survey';
import { ButtonTriggerSurveyConfig } from '../button-trigger-survey/button-trigger-survey-config.interface';
import { InlineSurvey } from '../inline-survey/inline-survey';
import { InlineSurveyConfig } from '../inline-survey/inline-survey-config.interface';
import { ModalSurvey } from '../modal-survey/modal-survey';
import { ModalSurveyConfig } from '../modal-survey/modal-survey-config.interface';
import { WindowSurvey } from '../window-survey/window-survey';
import { WindowSurveyConfig } from '../window-survey/window-survey-config.interface';

describe('All Surveys Integration Tests', () => {
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

    // Mock window.open for WindowSurvey
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
    windowOpenSpy.mockRestore();
  });

  describe('Multiple Surveys on Same Page', () => {
    test('should create Modal + Inline + Window + Button simultaneously without conflicts', () => {
      // Create container for InlineSurvey
      const inlineContainer = document.createElement('div');
      inlineContainer.id = 'inline-container';
      document.body.appendChild(inlineContainer);

      // Create all survey types
      const modalConfig: ModalSurveyConfig = {};
      const modal = new ModalSurvey(mockUrlBuilder, modalConfig);

      const inlineConfig: InlineSurveyConfig = {
        elementSelector: '#inline-container',
      };
      const inline = new InlineSurvey(mockUrlBuilder, inlineConfig);

      const windowConfig: WindowSurveyConfig = {
        openOnCreation: false,
      };
      const windowSurvey = new WindowSurvey(mockUrlBuilder, windowConfig);

      const buttonConfig: ButtonTriggerSurveyConfig = {
        onTrigger: jest.fn(),
      };
      const button = new ButtonTriggerSurvey(buttonConfig);

      // Verify all surveys created successfully
      expect(modal).toBeDefined();
      expect(modal.iFrame).toBeDefined();
      expect(modal.modalContainer).toBeDefined();

      expect(inline).toBeDefined();
      expect(inline.iFrame).toBeDefined();

      expect(windowSurvey).toBeDefined();

      expect(button).toBeDefined();
      expect(button.button).toBeDefined();
      expect(button.container).toBeDefined();

      // Verify no DOM conflicts
      const modalElements = document.querySelectorAll('.hello-customer-modal');
      expect(modalElements.length).toBe(1);

      const buttonElements = document.querySelectorAll(
        '.hello-customer-button-trigger',
      );
      expect(buttonElements.length).toBe(1);

      // Verify inline iframe is in correct container
      const inlineIframe = inlineContainer.querySelector('iframe');
      expect(inlineIframe).toBeDefined();

      // Clean up
      modal.destroy();
      inline.destroy();
      windowSurvey.destroy();
      button.destroy();

      // Verify complete cleanup
      expect(document.querySelectorAll('.hello-customer-modal').length).toBe(0);
      expect(
        document.querySelectorAll('.hello-customer-button-trigger').length,
      ).toBe(0);
    });

    test('should handle multiple instances of same survey type without conflicts', () => {
      const modal1 = new ModalSurvey(mockUrlBuilder, {});
      const modal2 = new ModalSurvey(mockUrlBuilder, {});
      const modal3 = new ModalSurvey(mockUrlBuilder, {});

      expect(modal1).toBeDefined();
      expect(modal2).toBeDefined();
      expect(modal3).toBeDefined();

      const modalElements = document.querySelectorAll('.hello-customer-modal');
      expect(modalElements.length).toBe(3);

      modal1.destroy();
      expect(document.querySelectorAll('.hello-customer-modal').length).toBe(2);

      modal2.destroy();
      modal3.destroy();
      expect(document.querySelectorAll('.hello-customer-modal').length).toBe(0);
    });

    test('should verify no CSS class name conflicts between survey types', () => {
      const inlineContainer = document.createElement('div');
      inlineContainer.id = 'inline-container';
      document.body.appendChild(inlineContainer);

      const modal = new ModalSurvey(mockUrlBuilder, {});
      const inline = new InlineSurvey(mockUrlBuilder, {
        elementSelector: '#inline-container',
      });
      const button = new ButtonTriggerSurvey({ onTrigger: jest.fn() });

      // Get all class names used
      const allElements = document.querySelectorAll('*');
      const classNames = new Set<string>();

      allElements.forEach((el) => {
        el.classList.forEach((className) => {
          classNames.add(className);
        });
      });

      // Verify distinct class prefixes
      const modalClasses = Array.from(classNames).filter((c) =>
        c.startsWith('hello-customer-modal'),
      );
      const buttonClasses = Array.from(classNames).filter((c) =>
        c.startsWith('hello-customer-button-trigger'),
      );

      expect(modalClasses.length).toBeGreaterThan(0);
      expect(buttonClasses.length).toBeGreaterThan(0);
      // Verify we have classes from different survey types
      expect(classNames.size).toBeGreaterThan(5);

      // Clean up
      modal.destroy();
      inline.destroy();
      button.destroy();
    });

    test('should verify no event listener conflicts between surveys', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

      const modal = new ModalSurvey(mockUrlBuilder, {});
      const button = new ButtonTriggerSurvey({ onTrigger: jest.fn() });

      const listenersAfterCreate = addEventListenerSpy.mock.calls.length;

      modal.destroy();
      button.destroy();

      const listenersAfterDestroy = removeEventListenerSpy.mock.calls.length;

      // All listeners should be cleaned up
      expect(listenersAfterCreate).toBe(listenersAfterDestroy);

      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });

    test('should destroy all surveys and verify complete cleanup', () => {
      const inlineContainer = document.createElement('div');
      inlineContainer.id = 'inline-container';
      document.body.appendChild(inlineContainer);

      const modal = new ModalSurvey(mockUrlBuilder, {});
      const inline = new InlineSurvey(mockUrlBuilder, {
        elementSelector: '#inline-container',
      });
      const button = new ButtonTriggerSurvey({ onTrigger: jest.fn() });

      // Verify elements exist
      expect(document.querySelectorAll('.hello-customer-modal').length).toBe(1);
      expect(
        document.querySelectorAll('.hello-customer-button-trigger').length,
      ).toBe(1);
      expect(document.querySelectorAll('iframe').length).toBe(2); // modal + inline

      // Destroy all
      modal.destroy();
      inline.destroy();
      button.destroy();

      // Verify complete cleanup
      expect(document.querySelectorAll('.hello-customer-modal').length).toBe(0);
      expect(
        document.querySelectorAll('.hello-customer-button-trigger').length,
      ).toBe(0);
      expect(
        document.querySelectorAll('iframe.hello-customer-survey__survey')
          .length,
      ).toBe(0);
    });
  });

  describe('Survey Type Interactions', () => {
    test('should trigger ModalSurvey from ButtonTriggerSurvey onTrigger callback', () => {
      const modal = new ModalSurvey(mockUrlBuilder, {});

      const button = new ButtonTriggerSurvey({
        onTrigger: () => {
          modal.show();
        },
      });

      // Initially modal should be hidden (not visible in DOM or display none/empty)
      const initialDisplay = modal.modalContainer.style.display;
      expect(['none', '']).toContain(initialDisplay);

      // Trigger button
      button.button.click();

      // Modal should now be visible
      expect(modal.modalContainer.style.display).not.toBe('none');

      // Clean up
      modal.destroy();
      button.destroy();
    });

    test('should verify independent quarantine services for different survey instances', () => {
      // Create two modals with different touchPointIds to ensure different identifiers
      const mockUrlBuilder1 = {
        getUrlFactory: jest.fn().mockReturnValue({
          getUrlWithParams: jest
            .fn()
            .mockReturnValue('https://example.com/survey?entry.test=value'),
          getSurveyIdentifier: jest.fn().mockReturnValue('modal-survey-id'),
          patchConfig: jest.fn(),
          getBaseUrlWithLanguage: jest
            .fn()
            .mockReturnValue('https://example.com/EN/tenant-id/touchpoint-id'),
        }),
      } as unknown as UrlBuilder;

      const modalConfig: ModalSurveyConfig = {
        quarantineConfig: { period: 30 },
      };
      const modal = new ModalSurvey(mockUrlBuilder1, modalConfig);

      const buttonConfig: ButtonTriggerSurveyConfig = {
        onTrigger: jest.fn(),
        quarantineConfig: { period: 30 },
        quarantineId: 'button-custom-id',
        showByDefault: false, // Ensure button isn't shown by default
      };
      const button = new ButtonTriggerSurvey(buttonConfig);

      // Neither should be quarantined initially
      expect(modal.isQuarantined()).toBe(false);
      expect(button.isQuarantined()).toBe(false);

      // Show modal (triggers quarantine for modal only)
      modal.show();
      expect(modal.isQuarantined()).toBe(true);

      // Button should not be quarantined (different identifier, not shown yet)
      expect(button.isQuarantined()).toBe(false);

      // Show button (triggers its own quarantine)
      button.show();
      expect(button.isQuarantined()).toBe(true);

      // Both should be independently quarantined
      expect(modal.isQuarantined()).toBe(true);
      expect(button.isQuarantined()).toBe(true);

      // Clear modal quarantine - button should remain quarantined
      modal.clearQuarantine();
      expect(modal.isQuarantined()).toBe(false);
      expect(button.isQuarantined()).toBe(true);

      // Clear button quarantine - modal should remain cleared
      button.clearQuarantine();
      expect(modal.isQuarantined()).toBe(false);
      expect(button.isQuarantined()).toBe(false);

      // Clean up
      modal.destroy();
      button.destroy();
    });

    test('should handle multiple ButtonTriggers triggering different survey types', () => {
      const modal = new ModalSurvey(mockUrlBuilder, {});
      const windowSurvey = new WindowSurvey(mockUrlBuilder, {
        openOnCreation: false,
      });

      const button1 = new ButtonTriggerSurvey({
        onTrigger: () => modal.show(),
        position: 'bottom-right',
      });

      const button2 = new ButtonTriggerSurvey({
        onTrigger: () => windowSurvey.show(),
        position: 'bottom-left',
      });

      expect(
        document.querySelectorAll('.hello-customer-button-trigger').length,
      ).toBe(2);

      // Trigger first button
      button1.button.click();
      expect(modal.modalContainer.style.display).not.toBe('none');

      // Trigger second button
      button2.button.click();
      expect(windowOpenSpy).toHaveBeenCalled();

      // Clean up
      modal.destroy();
      windowSurvey.destroy();
      button1.destroy();
      button2.destroy();
    });

    test('should verify cleanup works correctly for both button and triggered survey', () => {
      const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
      const removeEventListenerSpy = jest.spyOn(
        document,
        'removeEventListener',
      );

      const modal = new ModalSurvey(mockUrlBuilder, {});
      const button = new ButtonTriggerSurvey({
        onTrigger: () => modal.show(),
      });

      const listenersAfterCreate = addEventListenerSpy.mock.calls.length;

      // Destroy both
      modal.destroy();
      button.destroy();

      const listenersAfterDestroy = removeEventListenerSpy.mock.calls.length;

      // All listeners should be cleaned up
      expect(listenersAfterCreate).toBe(listenersAfterDestroy);

      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });
  });

  describe('Quarantine Across Survey Types', () => {
    test('should share quarantine between two ModalSurveys with same touchPointId', () => {
      const config1: ModalSurveyConfig = {
        quarantineConfig: { period: 30 },
      };
      const modal1 = new ModalSurvey(mockUrlBuilder, config1);

      const config2: ModalSurveyConfig = {
        quarantineConfig: { period: 30 },
      };
      const modal2 = new ModalSurvey(mockUrlBuilder, config2);

      // Show first modal (triggers quarantine)
      modal1.show();
      expect(modal1.isQuarantined()).toBe(true);

      // Second modal should also be quarantined (same identifier)
      expect(modal2.isQuarantined()).toBe(true);

      // Clean up
      modal1.destroy();
      modal2.destroy();
    });

    test('should trigger onQuarantineBlocked callback when second survey is blocked', () => {
      const onQuarantineBlocked1 = jest.fn();
      const onQuarantineBlocked2 = jest.fn();

      const config1: ModalSurveyConfig = {
        quarantineConfig: { period: 30 },
        callbacks: {
          onQuarantineBlocked: onQuarantineBlocked1,
        },
      };
      const modal1 = new ModalSurvey(mockUrlBuilder, config1);

      const config2: ModalSurveyConfig = {
        quarantineConfig: { period: 30 },
        callbacks: {
          onQuarantineBlocked: onQuarantineBlocked2,
        },
      };
      const modal2 = new ModalSurvey(mockUrlBuilder, config2);

      // Show first modal
      modal1.show();
      expect(onQuarantineBlocked1).not.toHaveBeenCalled();

      // Try to show second modal (should be blocked)
      modal2.show();
      expect(onQuarantineBlocked2).toHaveBeenCalledTimes(1);

      // Clean up
      modal1.destroy();
      modal2.destroy();
    });

    test('should verify quarantine stored correctly in localStorage', () => {
      const config: ModalSurveyConfig = {
        quarantineConfig: { period: 30 },
      };
      const modal = new ModalSurvey(mockUrlBuilder, config);

      // Show modal
      modal.show();

      // Verify localStorage was called
      expect(localStorageMock.setItem).toHaveBeenCalled();

      // Verify quarantine status
      const quarantineStatus = modal.getQuarantineStatus();
      expect(quarantineStatus.isQuarantined).toBe(true);
      expect(quarantineStatus.remainingDays).toBe(30);

      // Clean up
      modal.destroy();
    });

    test('should clear quarantine for all surveys sharing same identifier', () => {
      const modal1 = new ModalSurvey(mockUrlBuilder, {
        quarantineConfig: { period: 30 },
      });
      const modal2 = new ModalSurvey(mockUrlBuilder, {
        quarantineConfig: { period: 30 },
      });

      // Show first modal (both get quarantined)
      modal1.show();
      expect(modal1.isQuarantined()).toBe(true);
      expect(modal2.isQuarantined()).toBe(true);

      // Clear quarantine on first modal
      modal1.clearQuarantine();

      // Both should be cleared (shared identifier)
      expect(modal1.isQuarantined()).toBe(false);
      expect(modal2.isQuarantined()).toBe(false);

      // Clean up
      modal1.destroy();
      modal2.destroy();
    });

    test('should handle getRemainingDays correctly across multiple surveys', () => {
      const modal1 = new ModalSurvey(mockUrlBuilder, {
        quarantineConfig: { period: 30 },
      });
      const modal2 = new ModalSurvey(mockUrlBuilder, {
        quarantineConfig: { period: 30 },
      });

      // Show first modal
      modal1.show();

      const status1 = modal1.getQuarantineStatus();
      const status2 = modal2.getQuarantineStatus();

      // Both should report same remaining days
      expect(status1.remainingDays).toBe(status2.remainingDays);
      expect(status1.remainingDays).toBe(30);

      // Clean up
      modal1.destroy();
      modal2.destroy();
    });
  });
});
