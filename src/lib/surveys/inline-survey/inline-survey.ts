import { InvalidQuerySelectorException } from '../../core/exceptions/invalid-query-selector.exception';
import { StyledElementFactory } from '../../core/factories/styled-element.factory';
import { observeDOMRemoval } from '../../core/utils/dom-removal-observer.util';
import { UrlBuilder } from '../../url-builder/url.builder';
import { BaseSurvey } from '../common/base-survey';

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
