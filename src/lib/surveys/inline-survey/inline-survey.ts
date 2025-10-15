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
   * Destroy survey iframe
   */
  public destroy(): void {
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
