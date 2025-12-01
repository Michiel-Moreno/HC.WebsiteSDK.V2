import { InvalidQuerySelectorException } from '../../core/exceptions/invalid-query-selector.exception';
import { StyledElementFactory } from '../../core/factories/styled-element.factory';
import { observeDOMRemoval } from '../../core/utils/dom-removal-observer.util';
import { UrlBuilder } from '../../url-builder/url.builder';
import { BaseSurvey } from '../common/base-survey';
import { StatusMessage } from '../common/survey-status.interface';

import { InlineSurveyConfig } from './inline-survey-config.interface';
import { InlineSurveyConfigValidator } from './inline-survey.config-validator';

/**
 * Class creates iframe element in container referenced by query selector,
 * it parses and validate provided configuration object
 *
 * **v3.0 Feature**: Automatic DOM removal detection - when the iframe is removed from the DOM,
 * destroy() is called automatically to prevent memory leaks in SPA scenarios.
 *
 * ### Example (es module)
 * ```js
 * import { UrlBuilder, InlineSurvey } from '@hello-customer/website-touchpoint'
 * const urlBuilder = new UrlBuilder({
 *   baseUrl: 'https://base.com',
 *   language: 'EN',
 *   tenantId: 'xxxx',
 *   touchPointId: 'zzz',
 *   extra: {
 *     isPreview: true
 *   }
 * });
 * const inlineSurvey = new InlineSurvey(urlBuilder, {
 *   elementSelector: '#survey'
 * });
 * ```
 * ### Example (script tag)
 * ```html
 * <script src="https://unpkg.com/@hello-customer/website-touchpoint"></script>
 * <script>
 * const urlBuilder = new hcWebsiteTouchpoint.UrlBuilder({
 *     baseUrl: 'https://base.com',
 *     tenantId: 'xxxx',
 *     touchPointId: 'zzz',
 *     language: 'EN',
 *     extra: {
 *       isPreview: true
 *     }
 *    });
 * const inlineSurvey = new hcWebsiteSdk.InlineSurvey(urlBuilder, {
 *       elementSelector: '#survey'
 *     });
 * </script>
 * ```
 *
 * ### Example (SPA integration with auto-cleanup - v3.0+)
 * ```typescript
 * // React Router example
 * function FeedbackPage() {
 *   useEffect(() => {
 *     const survey = new InlineSurvey(urlBuilder, {
 *       elementSelector: '#survey-container',
 *       callbacks: {
 *         onDestroy: () => {
 *           console.log('Survey auto-cleaned on route change');
 *         }
 *       }
 *     });
 *
 *     // Cleanup happens automatically when component unmounts
 *     // No need to return cleanup function!
 *   }, []);
 *
 *   return <div id="survey-container"></div>;
 * }
 * ```
 *
 * ### Example (Vue.js integration - v3.0+)
 * ```typescript
 * // Vue component
 * export default {
 *   mounted() {
 *     this.survey = new InlineSurvey(urlBuilder, {
 *       elementSelector: '#survey-container'
 *     });
 *   },
 *   // No need for beforeUnmount hook - auto-cleanup in v3.0!
 *   template: '<div id="survey-container"></div>'
 * }
 * ```
 *
 * @category Surveys
 */
export class InlineSurvey extends BaseSurvey<InlineSurveyConfig> {
  private domRemovalCleanup?: () => void;
  private statusTimeoutId?: ReturnType<typeof setTimeout>;
  private statusReceived = false;
  private internalMessageHandler?: (event: MessageEvent) => void;

  constructor(
    configBuilder: UrlBuilder,
    private inlineConfig: InlineSurveyConfig,
  ) {
    // Call parent constructor with UrlBuilder, config, and validator
    super(configBuilder, inlineConfig, new InlineSurveyConfigValidator());

    // InlineSurvey-specific initialization
    this.iFrameHandle = this.createIframeElement();
    this.reload();

    // Set up DOM removal detection
    this.domRemovalCleanup = observeDOMRemoval(this.iFrameHandle, () =>
      this.destroy(),
    );

    // Set up unified message listener for auto-height and status detection
    this.setupMessageListener();

    // Handle quarantine state
    if (this.quarantineService.isUnderQuarantine()) {
      this.hide();
    } else {
      this.quarantineService.startQuarantine();
    }
  }

  /**
   * Get iframe element displaying embedded survey
   */
  public get iFrame(): HTMLIFrameElement {
    return this.iFrameHandle!;
  }

  /**
   * Show survey
   */
  public show(): void {
    if (!this.quarantineService.isUnderQuarantine()) {
      this.iFrameHandle!.style.display = '';
      this.quarantineService.startQuarantine();
      this.inlineConfig.callbacks?.onShow?.();
    } else {
      const remainingDays = this.quarantineService.getRemainingDays();
      this.inlineConfig.callbacks?.onQuarantineBlocked?.(remainingDays);
    }
  }

  /**
   * Hide survey
   */
  public hide(): void {
    this.iFrameHandle!.style.display = 'none';
    this.inlineConfig.callbacks?.onHide?.();
  }

  /**
   * Reload survey iframe with url produced bu UrlFactory
   */
  public reload(): void {
    this.iFrameHandle!.src = this.urlFactory!.getUrlWithParams();
  }

  /**
   * Destroy survey iframe and clean up all resources
   *
   * **v3.0+**: Automatically called when iframe element is removed from DOM
   * Safe to call multiple times (idempotent)
   *
   * Cleans up:
   * - Iframe element from DOM
   * - Event listeners
   * - PostMessage listeners
   * - DOM removal observer
   *
   * @example
   * ```typescript
   * // Manual cleanup
   * const survey = new InlineSurvey(urlBuilder, {
   *   elementSelector: '#survey-container'
   * });
   * // ... later
   * survey.destroy();
   * ```
   *
   * @example
   * ```typescript
   * // Automatic cleanup (v3.0+) - perfect for SPAs
   * const survey = new InlineSurvey(urlBuilder, {
   *   elementSelector: '#survey-container',
   *   callbacks: {
   *     onDestroy: () => {
   *       console.log('Survey cleaned up automatically!');
   *     }
   *   }
   * });
   *
   * // Later, when container is removed (e.g., route change)
   * document.getElementById('survey-container').remove();
   * // destroy() is called automatically - no memory leaks!
   * ```
   */
  public destroy(): void {
    // Clean up DOM removal observer
    if (this.domRemovalCleanup) {
      this.domRemovalCleanup();
      this.domRemovalCleanup = undefined;
    }

    // Clean up status timeout if pending
    if (this.statusTimeoutId) {
      clearTimeout(this.statusTimeoutId);
      this.statusTimeoutId = undefined;
    }

    // Clean up internal message handler
    if (this.internalMessageHandler) {
      window.removeEventListener('message', this.internalMessageHandler);
      this.internalMessageHandler = undefined;
    }

    // Clean up message listeners if active
    this.cleanupMessageHandlers();

    // Clean up all tracked event listeners
    this.cleanupEventListeners();

    if (this.iFrame.parentElement) {
      this.iFrame.parentElement.removeChild(this.iFrame);
    }
    this.inlineConfig.callbacks?.onDestroy?.();
  }

  /**
   * Set up internal message listener for auto-height and status messages.
   * Uses a separate listener from onMessage() to avoid conflicts with external usage.
   * Handles hc:resize (auto-height) and hc:status (survey availability) messages.
   * @private
   */
  private setupMessageListener(): void {
    // Get expected origin for security verification
    const expectedOrigin = new URL(this.urlFactory!.getBaseUrlWithLanguage())
      .origin;

    this.internalMessageHandler = (event: MessageEvent) => {
      // Verify origin for security
      if (event.origin !== expectedOrigin) {
        return;
      }

      // Verify message is from this survey's iframe (not another iframe on the page)
      // Only check if source is defined (JSDOM in tests doesn't set source)
      if (event.source && event.source !== this.iFrameHandle?.contentWindow) {
        return;
      }

      const data = event.data;

      // Handle auto-height resize messages
      if (this.inlineConfig.autoHeight && this.isResizeMessage(data)) {
        const constrainedHeight = this.applyHeightConstraints(data.height);
        this.iFrameHandle!.style.height = `${constrainedHeight}px`;
      }

      // Handle status messages
      if (this.isStatusMessage(data)) {
        this.handleStatusMessage(data);
      }

      // Handle completed messages
      if (this.isCompletedMessage(data)) {
        this.inlineConfig.callbacks?.onCompleted?.({
          timestamp: data.timestamp,
        });
      }

      // Handle page changed messages
      if (this.isPageChangedMessage(data)) {
        this.inlineConfig.callbacks?.onPageChanged?.({
          currentPage: data.currentPage,
          totalPages: data.totalPages,
          timestamp: data.timestamp,
        });
      }

      // Handle selected messages
      if (this.isSelectedMessage(data)) {
        this.inlineConfig.callbacks?.onSelected?.({
          questionType: data.questionType,
          questionId: data.questionId,
          questionIndex: data.questionIndex,
          pageIndex: data.pageIndex,
          timestamp: data.timestamp,
        });
      }

      // Handle first interaction messages
      if (this.isFirstInteractionMessage(data)) {
        this.inlineConfig.callbacks?.onFirstInteraction?.({
          questionType: data.questionType,
          timestamp: data.timestamp,
        });
      }
    };

    window.addEventListener('message', this.internalMessageHandler);

    // Setup timeout for surveys that don't respond with status
    const timeout = this.inlineConfig.statusTimeout ?? 10000;
    if (timeout > 0) {
      this.statusTimeoutId = setTimeout(() => {
        if (!this.statusReceived) {
          this.inlineConfig.callbacks?.onSurveyStatus?.({
            status: 'timeout',
            reason: 'no_response',
            message: 'Survey did not respond within timeout period',
          });
        }
      }, timeout);
    }
  }

  /**
   * Type guard to check if a message is a valid resize message.
   * @private
   */
  private isResizeMessage(
    data: unknown,
  ): data is { type: string; height: number } {
    return (
      typeof data === 'object' &&
      data !== null &&
      'type' in data &&
      (data as { type: string }).type === 'hc:resize' &&
      'height' in data &&
      typeof (data as { height: number }).height === 'number'
    );
  }

  /**
   * Apply min/max height constraints to the given height.
   * @private
   */
  private applyHeightConstraints(height: number): number {
    let result = height;

    if (this.inlineConfig.minHeight !== undefined) {
      result = Math.max(result, this.inlineConfig.minHeight);
    }

    if (this.inlineConfig.maxHeight !== undefined) {
      result = Math.min(result, this.inlineConfig.maxHeight);
    }

    return result;
  }

  /**
   * Type guard to check if a message is a valid status message.
   * @private
   */
  private isStatusMessage(data: unknown): data is StatusMessage {
    return (
      typeof data === 'object' &&
      data !== null &&
      'type' in data &&
      (data as StatusMessage).type === 'hc:status' &&
      'status' in data &&
      typeof (data as StatusMessage).status === 'string'
    );
  }

  /**
   * Type guard to check if a message is a valid completed message.
   * @private
   */
  private isCompletedMessage(
    data: unknown,
  ): data is { type: 'hc:completed'; timestamp: number } {
    const d = data as Record<string, unknown>;
    return (
      typeof data === 'object' &&
      data !== null &&
      d.type === 'hc:completed' &&
      typeof d.timestamp === 'number'
    );
  }

  /**
   * Type guard to check if a message is a valid page changed message.
   * @private
   */
  private isPageChangedMessage(data: unknown): data is {
    type: 'hc:pagechanged';
    currentPage: number;
    totalPages: number;
    timestamp: number;
  } {
    const d = data as Record<string, unknown>;
    return (
      typeof data === 'object' &&
      data !== null &&
      d.type === 'hc:pagechanged' &&
      typeof d.currentPage === 'number' &&
      typeof d.totalPages === 'number' &&
      typeof d.timestamp === 'number'
    );
  }

  /**
   * Type guard to check if a message is a valid selected message.
   * @private
   */
  private isSelectedMessage(data: unknown): data is {
    type: 'hc:selected';
    questionType: string;
    questionId: string;
    questionIndex: number;
    pageIndex: number;
    timestamp: number;
  } {
    const d = data as Record<string, unknown>;
    return (
      typeof data === 'object' &&
      data !== null &&
      d.type === 'hc:selected' &&
      typeof d.questionType === 'string' &&
      typeof d.questionId === 'string' &&
      typeof d.questionIndex === 'number' &&
      typeof d.pageIndex === 'number' &&
      typeof d.timestamp === 'number'
    );
  }

  /**
   * Type guard to check if a message is a valid first interaction message.
   * @private
   */
  private isFirstInteractionMessage(data: unknown): data is {
    type: 'hc:firstinteraction';
    questionType: string;
    timestamp: number;
  } {
    const d = data as Record<string, unknown>;
    return (
      typeof data === 'object' &&
      data !== null &&
      d.type === 'hc:firstinteraction' &&
      typeof d.questionType === 'string' &&
      typeof d.timestamp === 'number'
    );
  }

  /**
   * Handle an incoming status message from the survey iframe.
   * @private
   */
  private handleStatusMessage(message: StatusMessage): void {
    this.statusReceived = true;

    // Clear the timeout since we received a response
    if (this.statusTimeoutId) {
      clearTimeout(this.statusTimeoutId);
      this.statusTimeoutId = undefined;
    }

    this.inlineConfig.callbacks?.onSurveyStatus?.({
      status: message.status,
      reason: message.reason,
      message: message.message,
    });
  }

  /**
   * Creates iframe element inside parent container and returns reference to it
   *
   * @throws [[InvalidQuerySelectorException]]
   * @private
   */
  private createIframeElement(): HTMLIFrameElement {
    const root = document.querySelector(this.inlineConfig.elementSelector);
    if (!root)
      throw new InvalidQuerySelectorException(
        `[Hello Customer SDK] HTML element for ${this.inlineConfig.elementSelector} selector not found!`,
      );
    const iFrameFactory = new StyledElementFactory(
      document.createElement('iframe'),
    )
      .applyInlineConditionally(!!this.inlineConfig.fillContainer, {
        height: '100%',
        width: '100%',
      })
      .applyInlineConditionally(
        !!this.inlineConfig.iFrameInlineStylesRules,
        this.inlineConfig.iFrameInlineStylesRules,
      );

    if (this.inlineConfig.iFrameCssClasses)
      this.inlineConfig.iFrameCssClasses.forEach((cl) =>
        iFrameFactory.applyClass(cl),
      );
    const iFrame = iFrameFactory.styledElement;

    // Add tracked event listeners for iframe load and error
    this.addTrackedListener(iFrame, 'load', () => {
      this.inlineConfig.callbacks?.onLoad?.(iFrame);
    });

    this.addTrackedListener(iFrame, 'error', () => {
      const error = new Error('Failed to load survey iframe');
      this.inlineConfig.callbacks?.onError?.(error);
    });

    root.appendChild(iFrame);
    return iFrame;
  }
}
