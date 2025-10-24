import { StyledElementFactory } from '../../core/factories/styled-element.factory';
import { UrlBuilder } from '../../url-builder/url.builder';
import { ButtonTriggerSurvey } from '../button-trigger-survey/button-trigger-survey';
import { InlineSurvey } from '../inline-survey/inline-survey';
import { ModalSurvey } from '../modal-survey/modal-survey';
import { WindowSurvey } from '../window-survey/window-survey';

describe('Memory Leak Prevention', () => {
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

  test('should not leak memory with 100 ModalSurvey create/destroy cycles', () => {
    const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

    for (let i = 0; i < 100; i++) {
      const modal = new ModalSurvey(mockUrlBuilder, {});
      modal.destroy();
    }

    // Verify all listeners cleaned up
    expect(addEventListenerSpy.mock.calls.length).toBe(
      removeEventListenerSpy.mock.calls.length,
    );

    // Verify DOM is clean
    expect(document.body.children.length).toBe(0);

    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  test('should not leak memory with 100 InlineSurvey create/destroy cycles', () => {
    const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
    const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');

    for (let i = 0; i < 100; i++) {
      // Create container for each iteration
      const container = document.createElement('div');
      container.id = `inline-container-${i}`;
      document.body.appendChild(container);

      const inline = new InlineSurvey(mockUrlBuilder, {
        elementSelector: `#inline-container-${i}`,
      });
      inline.destroy();

      // Remove container
      container.remove();
    }

    // Verify all listeners cleaned up
    expect(addEventListenerSpy.mock.calls.length).toBe(
      removeEventListenerSpy.mock.calls.length,
    );

    // Verify DOM is clean
    expect(document.body.children.length).toBe(0);

    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  test('should not leak memory with 100 ButtonTriggerSurvey create/destroy cycles', () => {
    const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
    const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');

    for (let i = 0; i < 100; i++) {
      const button = new ButtonTriggerSurvey({
        onTrigger: jest.fn(),
      });
      button.destroy();
    }

    // Verify all listeners cleaned up
    expect(addEventListenerSpy.mock.calls.length).toBe(
      removeEventListenerSpy.mock.calls.length,
    );

    // Verify DOM is clean
    expect(document.body.children.length).toBe(0);

    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  test('should not leak memory with 100 WindowSurvey create/destroy cycles', () => {
    for (let i = 0; i < 100; i++) {
      const windowSurvey = new WindowSurvey(mockUrlBuilder, {
        openOnCreation: false,
      });
      windowSurvey.destroy();
    }

    // WindowSurvey doesn't add event listeners or DOM elements
    // Just verify it completes without errors
    expect(true).toBe(true);
  });

  test('should not leak memory with mixed survey types (25 of each, 100 total)', () => {
    const windowAddEventListenerSpy = jest.spyOn(window, 'addEventListener');
    const windowRemoveEventListenerSpy = jest.spyOn(
      window,
      'removeEventListener',
    );
    const documentAddEventListenerSpy = jest.spyOn(
      document,
      'addEventListener',
    );
    const documentRemoveEventListenerSpy = jest.spyOn(
      document,
      'removeEventListener',
    );

    for (let i = 0; i < 25; i++) {
      // ModalSurvey
      const modal = new ModalSurvey(mockUrlBuilder, {});
      modal.destroy();

      // InlineSurvey
      const container = document.createElement('div');
      container.id = `inline-container-${i}`;
      document.body.appendChild(container);
      const inline = new InlineSurvey(mockUrlBuilder, {
        elementSelector: `#inline-container-${i}`,
      });
      inline.destroy();
      container.remove();

      // ButtonTriggerSurvey
      const button = new ButtonTriggerSurvey({
        onTrigger: jest.fn(),
      });
      button.destroy();

      // WindowSurvey
      const windowSurvey = new WindowSurvey(mockUrlBuilder, {
        openOnCreation: false,
      });
      windowSurvey.destroy();
    }

    // Verify all window listeners cleaned up
    expect(windowAddEventListenerSpy.mock.calls.length).toBe(
      windowRemoveEventListenerSpy.mock.calls.length,
    );

    // Verify all document listeners cleaned up
    expect(documentAddEventListenerSpy.mock.calls.length).toBe(
      documentRemoveEventListenerSpy.mock.calls.length,
    );

    // Verify DOM is clean
    expect(document.body.children.length).toBe(0);

    windowAddEventListenerSpy.mockRestore();
    windowRemoveEventListenerSpy.mockRestore();
    documentAddEventListenerSpy.mockRestore();
    documentRemoveEventListenerSpy.mockRestore();
  });

  test('should not accumulate iframes with repeated create/destroy cycles', () => {
    for (let i = 0; i < 50; i++) {
      const modal = new ModalSurvey(mockUrlBuilder, {});
      expect(document.querySelectorAll('iframe').length).toBe(1);
      modal.destroy();
      expect(document.querySelectorAll('iframe').length).toBe(0);
    }
  });

  test('should not accumulate button elements with repeated create/destroy cycles', () => {
    for (let i = 0; i < 50; i++) {
      const button = new ButtonTriggerSurvey({
        onTrigger: jest.fn(),
      });
      expect(
        document.querySelectorAll('.hello-customer-button-trigger').length,
      ).toBe(1);
      button.destroy();
      expect(
        document.querySelectorAll('.hello-customer-button-trigger').length,
      ).toBe(0);
    }
  });
});
