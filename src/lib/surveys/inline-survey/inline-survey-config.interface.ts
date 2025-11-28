import { BaseSurveyConfig } from '../common/base-survey-config.interface';

export interface InlineSurveyConfig extends BaseSurveyConfig {
  elementSelector: string;
  fillContainer?: boolean;
  iFrameCssClasses?: string[];
  iFrameInlineStylesRules?: Partial<CSSStyleDeclaration>;
  /**
   * Enable auto-height adjustment based on survey content.
   * When enabled, the iframe height will automatically adjust when receiving
   * resize messages from the survey (requires backend support).
   *
   * @example
   * ```typescript
   * const survey = new InlineSurvey(urlBuilder, {
   *   elementSelector: '#survey-container',
   *   autoHeight: true,
   *   maxHeight: 800, // Optional: cap at 800px
   * });
   * ```
   */
  autoHeight?: boolean;
  /**
   * Minimum height constraint in pixels for auto-height mode.
   * The iframe will never be shorter than this value.
   * Only applies when `autoHeight` is enabled.
   */
  minHeight?: number;
  /**
   * Maximum height constraint in pixels for auto-height mode.
   * The iframe will never be taller than this value (content will scroll).
   * Only applies when `autoHeight` is enabled.
   */
  maxHeight?: number;
  /**
   * Timeout in milliseconds to wait for survey status message.
   * If no status message is received within this time, onSurveyStatus fires with 'timeout'.
   * Set to 0 to disable the timeout (callback will only fire on explicit status messages).
   *
   * Requires the survey page to send `hc:status` postMessage events.
   *
   * @default 10000 (10 seconds)
   *
   * @example
   * ```typescript
   * const survey = new InlineSurvey(urlBuilder, {
   *   elementSelector: '#survey-container',
   *   statusTimeout: 15000, // 15 seconds
   *   callbacks: {
   *     onSurveyStatus: (event) => {
   *       if (event.status === 'timeout') {
   *         console.warn('Survey did not respond');
   *       }
   *     }
   *   }
   * });
   * ```
   */
  statusTimeout?: number;
}
