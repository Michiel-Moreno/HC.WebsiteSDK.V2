import { ConfigValidationFunctionType } from '../../core/types/config-validation-function.type';
import {
  validateBoolean,
  validateObject,
  validateString,
} from '../../core/utils/config-validation-helpers.util';
import { SurveyConfigValidator } from '../common/survey.config-validator';

import { ModalSurveyConfig } from './modal-survey-config.interface';

/**
 * Class validating provided ModalSurveyConfig
 *
 * @category Validators
 */
export class ModalSurveyConfigValidator extends SurveyConfigValidator<ModalSurveyConfig> {
  public constructor() {
    super();
  }

  protected surveySpecificValidations(): ConfigValidationFunctionType<ModalSurveyConfig>[] {
    return [
      // Boolean validations using helper
      (config) =>
        validateBoolean(config.ignoreDefaultStyles, 'ignoreDefaultStyles'),
      (config) =>
        validateBoolean(config.translucentBackground, 'translucentBackground'),
      (config) =>
        validateBoolean(
          config.closeOnBackgroundClick,
          'closeOnBackgroundClick',
        ),
      (config) => validateBoolean(config.closeOnEscape, 'closeOnEscape'),
      (config) => validateBoolean(config.closeButton, 'closeButton'),
      (config) => validateBoolean(config.showByDefault, 'showByDefault'),

      // Object validations using helper
      (config) => validateObject(config.classNames, 'classNames'),

      // Custom validation for classNames values
      (config) =>
        config.classNames == undefined ||
        Object.entries(config.classNames).every(
          (el) => (typeof el[1] as unknown) == 'string',
        )
          ? null
          : {
              classNamesValuesStrings: 'classNames values must be strings',
            },

      // Object validation for modalStyle
      (config) => validateObject(config.modalStyle, 'modalStyle'),

      // Custom validation for modalStyle values
      (config) =>
        config.modalStyle == undefined ||
        Object.entries(config.modalStyle).every(
          (el) => (typeof el[1] as unknown) == 'object',
        )
          ? null
          : {
              modalStyleValuesObjects: 'modalStyle values must be objects',
            },

      // String validation using helper
      (config) =>
        validateString(config.modalContainerSelector, 'modalContainerSelector'),
    ];
  }
}
