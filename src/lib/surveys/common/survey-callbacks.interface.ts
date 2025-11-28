import { BaseException } from '../../core/exceptions/base.exception';

import { SurveyStatusEvent } from './survey-status.interface';

/**
 * Lifecycle event callbacks for surveys
 * All callbacks are optional and can be used for analytics, logging, and custom behavior integration
 *
 * @category Surveys
 */
export interface SurveyCallbacks {
  /**
   * Called when survey is shown to user
   */
  onShow?: () => void;

  /**
   * Called when survey is hidden (but not destroyed)
   * Note: Only applicable to InlineSurvey and ButtonTriggerSurvey
   */
  onHide?: () => void;

  /**
   * Called when survey is closed
   * Note: Only applicable to ModalSurvey and WindowSurvey
   */
  onClose?: () => void;

  /**
   * Called when iframe has loaded successfully
   * Note: Only applicable to InlineSurvey and ModalSurvey (surveys with iframes)
   * @param iframe - The HTMLIFrameElement that loaded
   */
  onLoad?: (iframe: HTMLIFrameElement) => void;

  /**
   * Called when iframe fails to load or when window popup is blocked
   * @param error - Error describing the failure
   */
  onError?: (error: Error | BaseException) => void;

  /**
   * Called when survey is completely destroyed and removed from DOM
   */
  onDestroy?: () => void;

  /**
   * Called when survey was blocked by quarantine
   * @param remainingDays - Days remaining in quarantine period
   */
  onQuarantineBlocked?: (remainingDays: number) => void;

  /**
   * Called when survey status changes (ready, unavailable, timeout, error)
   * Note: Only applicable to InlineSurvey and ModalSurvey (surveys with iframes)
   *
   * Use this callback to detect when a survey is deactivated or unavailable,
   * allowing graceful handling (hide container, show fallback, etc.)
   *
   * @param event - Status event with details about the survey state
   *
   * @example
   * ```typescript
   * callbacks: {
   *   onSurveyStatus: (event) => {
   *     if (event.status === 'ready') {
   *       console.log('Survey is ready');
   *     } else if (event.status === 'unavailable') {
   *       document.querySelector('#survey-container').style.display = 'none';
   *       console.warn(`Survey unavailable: ${event.reason}`);
   *     }
   *   }
   * }
   * ```
   */
  onSurveyStatus?: (event: SurveyStatusEvent) => void;
}
