import { IframeSurveyConfig } from '../common/iframe-survey-config.interface';

import { ClassNamesConfigType } from './class-names-config.type';
import { ModalSurveyStyleConfig } from './modal-survey-style-config.interface';

export interface ModalSurveyConfig extends IframeSurveyConfig {
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
