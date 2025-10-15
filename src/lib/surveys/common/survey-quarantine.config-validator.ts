import { BaseConfigValidator } from '../../core/base-classes/base.config-validator';
import { ConfigValidationFunctionType } from '../../core/types/config-validation-function.type';

import { SurveyQuarantineConfig } from './survey-quarantine-config.interface';

/**
 * Class validating provided SurveyQuarantineConfig
 *
 * @category Validators
 */
export class SurveyQuarantineConfigValidator extends BaseConfigValidator<SurveyQuarantineConfig> {
  public constructor() {
    super();
  }

  /**
   * Here validation functions for SurveyQuarantineConfig can be provided
   */
  protected defineValidationFunctions(): ConfigValidationFunctionType<SurveyQuarantineConfig>[] {
    return [
      (config) => {
        return (typeof config.period as unknown) === 'number' &&
          config.period > 0
          ? null
          : {
              quarantinePeriodIsPositiveNumber:
                'Quarantine period must be a positive number',
            };
      },
    ];
  }
}
