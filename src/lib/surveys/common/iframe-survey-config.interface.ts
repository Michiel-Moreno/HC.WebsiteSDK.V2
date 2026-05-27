import { BaseSurveyConfig } from './base-survey-config.interface';

/**
 * Shared configuration for iframe-based surveys (InlineSurvey, ModalSurvey).
 * Holds the options consumed by the common iframe message listener
 * (auto-height and survey status detection).
 *
 * @category Surveys
 */
export interface IframeSurveyConfig extends BaseSurveyConfig {
  /**
   * Enable auto-height adjustment based on survey content.
   * When enabled, the iframe height adjusts when receiving `hc:resize`
   * messages from the survey page.
   */
  autoHeight?: boolean;

  /**
   * Minimum height constraint in pixels for auto-height mode.
   * Only applies when `autoHeight` is enabled.
   */
  minHeight?: number;

  /**
   * Maximum height constraint in pixels for auto-height mode.
   * Only applies when `autoHeight` is enabled.
   */
  maxHeight?: number;

  /**
   * Timeout in milliseconds to wait for a survey status (`hc:status`) message.
   * If none is received within this time, `onSurveyStatus` fires with `'timeout'`.
   * Set to 0 to disable the timeout.
   *
   * @default 10000 (10 seconds)
   */
  statusTimeout?: number;
}
