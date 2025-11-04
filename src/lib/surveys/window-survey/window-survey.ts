import { CannotOpenWindowException } from '../../core/exceptions/cannot-open-window.exception';
import { UrlBuilder } from '../../url-builder/url.builder';
import { BaseSurvey } from '../common/base-survey';

import { WindowSurveyConfig } from './window-survey-config.interface';
import { WindowSurveyConfigValidator } from './window-survey.config-validator';

/**
 * Class for opening survey in a new browser tab or popup window
 *
 * The `openNewWindow` option controls the opening behavior:
 * - `openNewWindow: true` → Opens as a **popup window** (800x700px, separate OS window)
 * - `openNewWindow: false` → Opens as a **new browser tab** (default)
 *
 * ### Example (es module) - Open as popup window
 * ```js
 * import { UrlBuilder, WindowSurvey } from '@hello-customer/website-touchpoint'
 * const urlBuilder = new UrlBuilder({
 *   baseUrl: 'https://base.com',
 *   language: 'EN',
 *   tenantId: 'xxxx',
 *   touchPointId: 'zzz',
 *   extra: {
 *     isPreview: true
 *   }
 * });
 * const windowSurvey = new WindowSurvey(urlBuilder, {
 *   openNewWindow: true  // Opens as popup window
 * });
 * windowSurvey.show();
 * ```
 *
 * ### Example (script tag) - Open as new tab
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
 * const windowSurvey = new hcWebsiteTouchpoint.WindowSurvey(urlBuilder, {
 *       openNewWindow: false  // Opens as new tab (default)
 *     });
 * windowSurvey.show();
 * </script>
 * ```
 * @category Surveys
 */
export class WindowSurvey extends BaseSurvey<WindowSurveyConfig> {
  private windowHandle: Window | undefined | null;

  constructor(
    configBuilder: UrlBuilder,
    private windowConfig: WindowSurveyConfig,
  ) {
    // Call parent constructor with UrlBuilder, config, and validator
    super(configBuilder, windowConfig, new WindowSurveyConfigValidator());

    // WindowSurvey-specific initialization
    if (this.windowConfig.openOnCreation) this.open();
  }

  get window(): Window | null | undefined {
    return this.windowHandle;
  }

  /**
   * Open survey in new window or tab
   *
   * **v3.0 Feature**: Popup blocker detection with user-friendly error messages
   *
   * @throws {CannotOpenWindowException} When popup is blocked by browser
   *
   * @example
   * ```typescript
   * // Basic usage
   * const survey = new WindowSurvey(urlBuilder, {
   *   openNewWindow: true
   * });
   * survey.open();
   * ```
   *
   * @example
   * ```typescript
   * // With popup blocker error handling (v3.0+)
   * const survey = new WindowSurvey(urlBuilder, {
   *   openNewWindow: true,
   *   callbacks: {
   *     onError: (error) => {
   *       // User-friendly error message
   *       if (error.message.includes('popup blocker')) {
   *         showNotification({
   *           type: 'warning',
   *           title: 'Popup Blocked',
   *           message: 'Please allow popups for this site to view the survey.',
   *           actions: [
   *             {
   *               label: 'How to enable',
   *               onClick: () => window.open('/help/enable-popups', '_blank')
   *             },
   *             {
   *               label: 'Try again',
   *               onClick: () => survey.open()
   *             }
   *           ]
   *         });
   *       }
   *     }
   *   }
   * });
   *
   * try {
   *   survey.open();
   * } catch (error) {
   *   // Error already handled by onError callback
   * }
   * ```
   *
   * @example
   * ```typescript
   * // Button click handler with error handling
   * document.getElementById('feedback-btn').addEventListener('click', () => {
   *   const survey = new WindowSurvey(urlBuilder, {
   *     callbacks: {
   *       onError: (error) => {
   *         const message = document.createElement('div');
   *         message.className = 'alert alert-warning';
   *         message.innerHTML = `
   *           <strong>Popup Blocked!</strong>
   *           <p>Please allow popups and click the button again.</p>
   *           <button onclick="this.parentElement.remove()">Dismiss</button>
   *         `;
   *         document.body.appendChild(message);
   *       },
   *       onShow: () => {
   *         console.log('Survey opened successfully!');
   *       }
   *     }
   *   });
   *
   *   try {
   *     survey.open();
   *   } catch (error) {
   *     // Handled by onError callback
   *   }
   * });
   * ```
   */
  public open(): void {
    if (!this.quarantineService.isUnderQuarantine()) {
      if (this.windowConfig.openNewWindow)
        this.windowHandle = window.open(
          this.urlFactory!.getUrlWithParams(),
          '_blank',
          'toolbar=0,location=0,menubar=0,height=800,width=700',
        );
      else
        this.windowHandle = window.open(
          this.urlFactory!.getUrlWithParams(),
          '_blank',
        );
      if (!this.windowHandle) {
        const error = new CannotOpenWindowException(
          '[Hello Customer SDK] Failed to open survey window. ' +
            'This is usually caused by a popup blocker. ' +
            'Please allow popups for this site to view the survey.',
        );
        this.windowConfig.callbacks?.onError?.(error);
        throw error;
      }
      this.quarantineService.startQuarantine();
      this.windowConfig.callbacks?.onShow?.();
    } else {
      const remainingDays = this.quarantineService.getRemainingDays();
      this.windowConfig.callbacks?.onQuarantineBlocked?.(remainingDays);
    }
  }

  /**
   * Show survey (alias for open())
   * Implements abstract method from BaseSurvey
   */
  public show(): void {
    this.open();
  }

  /**
   * Hide survey (alias for close())
   * Implements abstract method from BaseSurvey
   */
  public hide(): void {
    this.close();
  }

  /**
   * Close survey
   */
  public close(): void {
    if (this.windowHandle) this.windowHandle.close();
    this.windowConfig.callbacks?.onClose?.();
  }

  /**
   * Destroy survey and clean up resources
   * Closes window if still open
   */
  public destroy(): void {
    this.close();
    // No DOM cleanup needed (separate window)
    // Quarantine data persists in localStorage (by design)
    this.windowConfig.callbacks?.onDestroy?.();
  }
}
