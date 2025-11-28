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
}
