import { BaseSurveyConfig } from '../common/base-survey-config.interface';

import { ClassNamesConfigType } from './class-names-config.type';
import { ModalSurveyStyleConfig } from './modal-survey-style-config.interface';

export interface ModalSurveyConfig extends BaseSurveyConfig {
  /**
   * Override default modal css class names
   */
  classNames?: ClassNamesConfigType;
  /**
   * @default true
   */
  closeButton?: boolean;
  /**
   * @default true
   */
  closeOnBackgroundClick?: boolean;
  /**
   * @default true
   */
  closeOnEscape?: boolean;
  /**
   * @default false
   */
  ignoreDefaultStyles?: boolean;
  /**
   * modal root container query selector
   *
   * @default body
   */
  modalContainerSelector?: string;
  /**
   * Override default modal style
   */
  modalStyle?: ModalSurveyStyleConfig;
  /**
   * @default false
   */
  showByDefault?: boolean;
  /**
   * @default true
   */
  translucentBackground?: boolean;
  /**
   * ARIA label for the modal dialog
   * Used by screen readers to announce the modal
   * @default 'Survey dialog'
   */
  ariaLabel?: string;
  /**
   * ARIA description for the modal
   * Provides additional context to screen readers
   */
  ariaDescription?: string;
  /**
   * Enable auto-height adjustment based on survey content.
   * When enabled, the iframe height will automatically adjust when receiving
   * resize messages from the survey (requires backend support).
   *
   * @example
   * ```typescript
   * const modal = new ModalSurvey(urlBuilder, {
   *   autoHeight: true,
   *   maxHeight: 600, // Cap at 600px to fit viewport
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
   * const modal = new ModalSurvey(urlBuilder, {
   *   statusTimeout: 15000, // 15 seconds
   *   callbacks: {
   *     onSurveyStatus: (event) => {
   *       if (event.status === 'unavailable') {
   *         console.warn(`Survey unavailable: ${event.reason}`);
   *       }
   *     }
   *   }
   * });
   * ```
   */
  statusTimeout?: number;
  /**
   * Automatically close (hide) the modal when survey is completed.
   * When enabled, the modal will hide after receiving the `hc:completed` event.
   * The `onCompleted` callback will still fire before the modal closes.
   *
   * @default false
   *
   * @example
   * ```typescript
   * const modal = new ModalSurvey(urlBuilder, {
   *   autoCloseOnComplete: true,
   *   callbacks: {
   *     onCompleted: (event) => {
   *       console.log('Survey completed, modal closing...');
   *     }
   *   }
   * });
   * ```
   */
  autoCloseOnComplete?: boolean;
}
