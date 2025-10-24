import { BaseConfigValidator } from '../../core/base-classes/base.config-validator';
import { ConfigValidationFunctionType } from '../../core/types/config-validation-function.type';

import { BaseSurveyConfig } from './base-survey-config.interface';
import { SurveyQuarantineConfigValidator } from './survey-quarantine.config-validator';

/**
 * Abstract base validator for all survey config validators
 * Provides common validation functions that all surveys share
 *
 * Eliminates duplication of quarantine validation across all validators
 *
 * @category Validators
 */
export abstract class SurveyConfigValidator<
  T extends BaseSurveyConfig,
> extends BaseConfigValidator<T> {
  protected constructor() {
    super();
  }

  /**
   * Common validations shared by all surveys
   * Currently: quarantine config validation
   */
  protected commonValidations(): ConfigValidationFunctionType<T>[] {
    return [
      // Quarantine config type validation
      (config) =>
        !config.quarantineConfig ||
        (typeof config.quarantineConfig as unknown) === 'object'
          ? null
          : {
              quarantineConfigIsObject: 'Quarantine config must be an object',
            },

      // Quarantine config content validation
      (config) =>
        config.quarantineConfig
          ? new SurveyQuarantineConfigValidator().validate(
              config.quarantineConfig,
            )
          : null,
    ];
  }

  /**
   * Survey-specific validations (must implement in subclass)
   */
  protected abstract surveySpecificValidations(): ConfigValidationFunctionType<T>[];

  /**
   * Combine common and specific validations
   */
  protected defineValidationFunctions(): ConfigValidationFunctionType<T>[] {
    return [...this.commonValidations(), ...this.surveySpecificValidations()];
  }
}
