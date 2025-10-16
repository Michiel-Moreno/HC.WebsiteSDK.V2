import { InvalidQuerySelectorException } from '../../core/exceptions/invalid-query-selector.exception';
import { StyledElementFactory } from '../../core/factories/styled-element.factory';
import { UrlBuilder } from '../../url-builder/url.builder';
import { BaseSurvey } from '../common/base-survey';

import { InlineSurveyConfig } from './inline-survey-config.interface';
import { InlineSurveyConfigValidator } from './inline-survey.config-validator';

/**
 * Class creates iframe element in container referenced by query selector,
 * it parses and validate provided configuration object
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
 * @category Surveys
 */
export class InlineSurvey extends BaseSurvey<InlineSurveyConfig> {
  private readonly iFrameHandle: HTMLIFrameElement;
  private messageHandler: ((data: unknown) => void) | null = null;
  private messageEventListener: ((event: MessageEvent) => void) | null = null;

  constructor(
    configBuilder: UrlBuilder,
    private inlineConfig: InlineSurveyConfig,
  ) {
    // Call parent constructor with UrlBuilder, config, and validator
    super(configBuilder, inlineConfig, new InlineSurveyConfigValidator());

    // InlineSurvey-specific initialization
    this.iFrameHandle = this.createIframeElement();
    this.reload();

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
    return this.iFrameHandle;
  }

  /**
   * Show survey
   */
  public show(): void {
    if (!this.quarantineService.isUnderQuarantine()) {
      this.iFrameHandle.style.display = '';
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
    this.iFrameHandle.style.display = 'none';
    this.inlineConfig.callbacks?.onHide?.();
  }

  /**
   * Reload survey iframe with url produced bu UrlFactory
   */
  public reload(): void {
    this.iFrameHandle.src = this.urlFactory!.getUrlWithParams();
  }

  /**
   * Update survey configuration and reload iframe automatically
   * Convenience method that combines updateUrlConfig() and reload()
   *
   * @param patch - Partial config to merge with existing
   *
   * @example
   * ```typescript
   * // User logs in - update metadata and reload
   * user.onLogin((userData) => {
   *   survey.updateAndReload({
   *     extra: {
   *       respondent: {
   *         id: userData.id,
   *         email: userData.email,
   *       }
   *     }
   *   });
   * });
   * ```
   */
  public updateAndReload(patch: Record<string, unknown>): void {
    this.updateUrlConfig(patch);
    this.reload();
  }

  /**
   * Send message to survey iframe
   *
   * @param data - Data to send (must be JSON-serializable)
   * @param targetOrigin - Target origin for security (default: baseUrl)
   * @throws {Error} If iframe is not ready
   *
   * @example
   * ```typescript
   * survey.sendMessage({
   *   type: 'prefill',
   *   data: { email: 'user@example.com' }
   * });
   * ```
   */
  public sendMessage(data: unknown, targetOrigin?: string): void {
    if (!this.iFrameHandle.contentWindow) {
      throw new Error(
        '[Hello Customer SDK] Iframe not ready for postMessage communication',
      );
    }

    const origin = targetOrigin || this.urlFactory!.getBaseUrlWithLanguage();
    this.iFrameHandle.contentWindow.postMessage(data, origin);
  }

  /**
   * Listen for messages from survey iframe
   * Automatically verifies message origin for security
   *
   * @param callback - Function to call when message received
   * @returns Cleanup function to stop listening
   *
   * @example
   * ```typescript
   * const cleanup = survey.onMessage((data) => {
   *   if (data.type === 'survey_completed') {
   *     console.log('Survey completed!');
   *   }
   * });
   *
   * // Later, clean up
   * cleanup();
   * ```
   */
  public onMessage(callback: (data: unknown) => void): () => void {
    this.messageHandler = callback;

    const handler = (event: MessageEvent) => {
      // Verify origin for security
      const expectedOrigin = new URL(this.urlFactory!.getBaseUrlWithLanguage())
        .origin;

      if (event.origin !== expectedOrigin) {
        console.warn(
          `[Hello Customer SDK] Rejected postMessage from unexpected origin: ${event.origin}`,
        );
        return;
      }

      if (this.messageHandler) {
        this.messageHandler(event.data);
      }
    };

    this.messageEventListener = handler;
    window.addEventListener('message', handler);

    // Return cleanup function
    return () => {
      if (this.messageEventListener) {
        window.removeEventListener('message', this.messageEventListener);
        this.messageEventListener = null;
      }
      this.messageHandler = null;
    };
  }

  /**
   * Destroy survey iframe
   */
  public destroy(): void {
    // Clean up message listeners if active
    if (this.messageEventListener) {
      window.removeEventListener('message', this.messageEventListener);
      this.messageEventListener = null;
    }
    this.messageHandler = null;

    if (this.iFrame.parentElement) {
      this.iFrame.parentElement.removeChild(this.iFrame);
    }
    this.inlineConfig.callbacks?.onDestroy?.();
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

    // Add event listeners for iframe load and error
    iFrame.addEventListener('load', () => {
      this.inlineConfig.callbacks?.onLoad?.(iFrame);
    });

    iFrame.addEventListener('error', () => {
      const error = new Error('Failed to load survey iframe');
      this.inlineConfig.callbacks?.onError?.(error);
    });

    root.appendChild(iFrame);
    return iFrame;
  }
}
