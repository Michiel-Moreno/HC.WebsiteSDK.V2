import { SurveyCallbacks } from '../common/survey-callbacks.interface';
import { SurveyQuarantineConfig } from '../common/survey-quarantine-config.interface';

import { ClassNamesConfigType } from './class-names-config.type';
import { ModalSurveyStyleConfig } from './modal-survey-style-config.interface';

export interface ModalSurveyConfig {
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
  quarantineConfig?: SurveyQuarantineConfig;
  /**
   * @default false
   */
  showByDefault?: boolean;
  /**
   * @default true
   */
  translucentBackground?: boolean;
  /**
   * Lifecycle event callbacks
   */
  callbacks?: SurveyCallbacks;
}
