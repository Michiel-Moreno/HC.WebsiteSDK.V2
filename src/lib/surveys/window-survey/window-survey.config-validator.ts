import { BaseConfigValidator } from '../../core/base-classes/base.config-validator';
import { ConfigValidationFunctionType } from '../../core/types/config-validation-function.type';
import { SurveyQuarantineConfigValidator } from '../common/survey-quarantine.config-validator';

import { WindowSurveyConfig } from './window-survey-config.interface';

/**
 * Class validating provided WindowSurveyConfig
 *
 * @category Validators
 */
export class WindowSurveyConfigValidator extends BaseConfigValidator<WindowSurveyConfig> {
  public constructor() {
    super();
  }

  protected defineValidationFunctions(): ConfigValidationFunctionType<WindowSurveyConfig>[] {
    return [
      (config) =>
        config.openOnCreation == undefined ||
        (typeof config.openOnCreation as unknown) == 'boolean'
          ? null
          : {
              openOnCreationIsBoolean: 'openOnCreation must be a boolean',
            },
      (config) =>
        config.openNewWindow == undefined ||
        (typeof config.openNewWindow as unknown) == 'boolean'
          ? null
          : {
              openNewWindowsIsBoolean: 'openNewWindow must be a boolean',
            },
      (config) => {
        return !config.quarantineConfig ||
          (typeof config.quarantineConfig as unknown) === 'object'
          ? null
          : {
              quarantineConfigIsObject: 'Quarantine config must be an object',
            };
      },
      (config) => {
        return config.quarantineConfig
          ? new SurveyQuarantineConfigValidator().validate(
              config.quarantineConfig,
            )
          : null;
      },
    ];
  }
}
