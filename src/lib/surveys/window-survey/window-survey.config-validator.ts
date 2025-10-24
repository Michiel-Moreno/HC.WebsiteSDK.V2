import { ConfigValidationFunctionType } from '../../core/types/config-validation-function.type';
import { validateBoolean } from '../../core/utils/config-validation-helpers.util';
import { SurveyConfigValidator } from '../common/survey.config-validator';

import { WindowSurveyConfig } from './window-survey-config.interface';

/**
 * Class validating provided WindowSurveyConfig
 *
 * @category Validators
 */
export class WindowSurveyConfigValidator extends SurveyConfigValidator<WindowSurveyConfig> {
  public constructor() {
    super();
  }

  protected surveySpecificValidations(): ConfigValidationFunctionType<WindowSurveyConfig>[] {
    return [
      // Boolean validations using helper
      (config) => validateBoolean(config.openOnCreation, 'openOnCreation'),
      (config) => validateBoolean(config.openNewWindow, 'openNewWindow'),
    ];
  }
}
