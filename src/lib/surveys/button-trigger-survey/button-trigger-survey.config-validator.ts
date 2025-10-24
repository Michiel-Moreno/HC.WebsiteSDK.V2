import { BaseConfigValidator } from '../../core/base-classes/base.config-validator';
import { ConfigValidationFunctionType } from '../../core/types/config-validation-function.type';
import {
  validateEnum,
  validateString,
} from '../../core/utils/config-validation-helpers.util';

import { ButtonPosition } from './button-position.type';
import { ButtonStylePreset } from './button-style-preset.type';
import { ButtonTriggerSurveyConfig } from './button-trigger-survey-config.interface';

/**
 * Class validating provided ButtonTriggerSurveyConfig
 *
 * @category Validators
 */
export class ButtonTriggerSurveyConfigValidator extends BaseConfigValidator<ButtonTriggerSurveyConfig> {
  private readonly validPositions: readonly ButtonPosition[] = [
    'top-left',
    'top-center',
    'top-right',
    'left-center',
    'right-center',
    'bottom-left',
    'bottom-center',
    'bottom-right',
  ];

  private readonly validStylePresets: readonly ButtonStylePreset[] = [
    'pill-button',
    'circle-button',
    'side-tab',
    'banner',
  ];

  public constructor() {
    super();
  }

  protected defineValidationFunctions(): ConfigValidationFunctionType<ButtonTriggerSurveyConfig>[] {
    return [
      // onTrigger is required
      (config) =>
        config.onTrigger !== undefined && config.onTrigger !== null
          ? null
          : {
              onTriggerRequired: 'onTrigger callback is required',
            },

      // onTrigger must be a function
      (config) =>
        typeof config.onTrigger === 'function'
          ? null
          : {
              onTriggerIsFunction: 'onTrigger must be a function',
            },

      // Enum validation using helper for position
      (config) =>
        validateEnum(config.position, 'position', this.validPositions),

      // Enum validation using helper for stylePreset
      (config) =>
        validateEnum(config.stylePreset, 'stylePreset', this.validStylePresets),

      // String validation using helper
      (config) => validateString(config.containerSelector, 'containerSelector'),

      // Custom validation for zIndex (must be > 0, not >= 0)
      (config) =>
        config.zIndex === undefined ||
        (typeof config.zIndex === 'number' && config.zIndex > 0)
          ? null
          : {
              zIndexIsPositiveNumber: 'zIndex must be a positive number',
            },

      // Custom validation for icon (string or Element)
      (config) =>
        config.icon === undefined ||
        typeof config.icon === 'string' ||
        config.icon instanceof Element
          ? null
          : {
              iconIsStringOrElement:
                'icon must be a string (HTML/SVG) or an Element',
            },
    ];
  }
}
