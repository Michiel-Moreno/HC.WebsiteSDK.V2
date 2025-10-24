import { BaseConfigValidator } from '../../core/base-classes/base.config-validator';
import { ConfigValidationFunctionType } from '../../core/types/config-validation-function.type';

import { ButtonPosition } from './button-position.type';
import { ButtonStylePreset } from './button-style-preset.type';
import { ButtonTriggerSurveyConfig } from './button-trigger-survey-config.interface';

/**
 * Class validating provided ButtonTriggerSurveyConfig
 *
 * @category Validators
 */
export class ButtonTriggerSurveyConfigValidator extends BaseConfigValidator<ButtonTriggerSurveyConfig> {
  private readonly validPositions: ButtonPosition[] = [
    'top-left',
    'top-center',
    'top-right',
    'left-center',
    'right-center',
    'bottom-left',
    'bottom-center',
    'bottom-right',
  ];

  private readonly validStylePresets: ButtonStylePreset[] = [
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
      (config) =>
        config.onTrigger !== undefined && config.onTrigger !== null
          ? null
          : {
              onTriggerRequired: 'onTrigger callback is required',
            },
      (config) =>
        typeof config.onTrigger === 'function'
          ? null
          : {
              onTriggerIsFunction: 'onTrigger must be a function',
            },
      (config) =>
        config.position === undefined ||
        this.validPositions.includes(config.position)
          ? null
          : {
              positionIsValid: `position must be one of: ${this.validPositions.join(', ')}`,
            },
      (config) =>
        config.stylePreset === undefined ||
        this.validStylePresets.includes(config.stylePreset)
          ? null
          : {
              stylePresetIsValid: `stylePreset must be one of: ${this.validStylePresets.join(', ')}`,
            },
      (config) =>
        config.containerSelector === undefined ||
        typeof config.containerSelector === 'string'
          ? null
          : {
              containerSelectorIsString: 'containerSelector must be a string',
            },
      (config) =>
        config.zIndex === undefined ||
        (typeof config.zIndex === 'number' && config.zIndex > 0)
          ? null
          : {
              zIndexIsPositiveNumber: 'zIndex must be a positive number',
            },
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
