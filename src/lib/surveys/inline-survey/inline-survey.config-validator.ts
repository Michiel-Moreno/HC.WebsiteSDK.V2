import { ConfigValidationFunctionType } from '../../core/types/config-validation-function.type';
import {
  validateArray,
  validateObject,
  validateString,
} from '../../core/utils/config-validation-helpers.util';
import { SurveyConfigValidator } from '../common/survey.config-validator';

import { InlineSurveyConfig } from './inline-survey-config.interface';

/**
 * Class validating provided InlineSurveyConfig
 *
 * @category Validators
 */
export class InlineSurveyConfigValidator extends SurveyConfigValidator<InlineSurveyConfig> {
  public constructor() {
    super();
  }

  /**
   * Here validation functions for InlineSurveyConfig can be provided
   */
  protected surveySpecificValidations(): ConfigValidationFunctionType<InlineSurveyConfig>[] {
    return [
      // Element selector is required
      (config) =>
        config.elementSelector
          ? null
          : {
              elementSelectorRequired: 'Element selector is required',
            },

      // String validation using helper
      (config) => validateString(config.elementSelector, 'elementSelector'),

      // Array validation using helper
      (config) => validateArray(config.iFrameCssClasses, 'iFrameCssClasses'),

      // Custom validation for array items
      (config) =>
        !config.iFrameCssClasses ||
        config.iFrameCssClasses.every(
          (cl) => (typeof cl as unknown) === 'string',
        )
          ? null
          : {
              cssClassesItemsAreString: 'CssClasses items must be strings',
            },

      // Object validation using helper
      (config) =>
        validateObject(
          config.iFrameInlineStylesRules,
          'iFrameInlineStylesRules',
        ),
    ];
  }
}
