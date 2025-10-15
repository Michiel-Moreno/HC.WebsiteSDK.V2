import { BaseConfigValidator } from '../../core/base-classes/base.config-validator';
import { ConfigValidationFunctionType } from '../../core/types/config-validation-function.type';

import { ButtonTriggerSurveyConfig } from './button-trigger-survey-config.interface';

/**
 * Class validating provided ButtonTriggerSurveyConfig
 *
 * @category Validators
 */
export class ButtonTriggerSurveyConfigValidator extends BaseConfigValidator<
  ButtonTriggerSurveyConfig
> {
  public constructor() {
    super();
  }

  protected defineValidationFunctions(): ConfigValidationFunctionType<
    ButtonTriggerSurveyConfig
  >[] {
    return [
      (config) =>
        config.onTrigger !== undefined && config.onTrigger !== null
          ? null
          : {
              onTriggerRequired: 'onTrigger callback is required',
            },
      (config) =>
        (typeof config.onTrigger as unknown) === 'function'
          ? null
          : {
              onTriggerIsFunction: 'onTrigger must be a function',
            },
    ];
  }
}
