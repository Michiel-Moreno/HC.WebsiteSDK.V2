import { ButtonTriggerSurveyConfig } from './button-trigger-survey-config.interface';
import { ButtonTriggerSurveyConfigValidator } from './button-trigger-survey.config-validator';

describe('ButtonTriggerSurveyConfigValidator', () => {
  const noop = jest.fn();
  let validator: ButtonTriggerSurveyConfigValidator;

  beforeEach(() => {
    noop.mockClear();
    validator = new ButtonTriggerSurveyConfigValidator();
  });

  describe('Valid configurations', () => {
    test('should pass validation with minimal valid config (just onTrigger)', () => {
      const config: ButtonTriggerSurveyConfig = {
        onTrigger: noop,
      };

      const errors = validator.validate(config);
      expect(Object.keys(errors).length).toBe(0);
    });

    test('should pass validation with all optional fields provided', () => {
      const config: ButtonTriggerSurveyConfig = {
        position: 'bottom-right',
        stylePreset: 'pill-button',
        text: 'Feedback',
        icon: document.createElement('span'),
        onTrigger: noop,
        customStyle: {
          buttonStyle: { backgroundColor: 'red' },
        },
        classNames: {
          buttonContainer: 'custom-container',
          button: 'custom-button',
        },
        ignoreDefaultStyles: false,
        containerSelector: '#root',
        showByDefault: true,
        enableAnimation: true,
        quarantineConfig: { period: 7 },
        zIndex: 9999,
        ariaLabel: 'Open feedback form',
      };

      const errors = validator.validate(config);
      expect(Object.keys(errors).length).toBe(0);
    });

    test('should pass validation with various valid onTrigger implementations', () => {
      const configs: ButtonTriggerSurveyConfig[] = [
        { onTrigger: () => console.log('clicked') },
        { onTrigger: jest.fn() },
        { onTrigger: async () => console.log('async') },
      ];

      configs.forEach((config) => {
        const errors = validator.validate(config);
        expect(Object.keys(errors).length).toBe(0);
      });
    });

    test('should pass validation with partial optional fields', () => {
      const config: ButtonTriggerSurveyConfig = {
        onTrigger: noop,
        text: 'Give Feedback',
        position: 'top-left',
      };

      const errors = validator.validate(config);
      expect(Object.keys(errors).length).toBe(0);
    });
  });

  describe('Invalid configurations', () => {
    test('should fail when onTrigger is missing (undefined)', () => {
      const config = {} as ButtonTriggerSurveyConfig;

      const errors = validator.validate(config);
      expect(errors.onTriggerRequired).toBeDefined();
      expect(errors.onTriggerRequired).toBe('onTrigger callback is required');
    });

    test('should fail when onTrigger is null', () => {
      const config = {
        onTrigger: null,
      } as unknown as ButtonTriggerSurveyConfig;

      const errors = validator.validate(config);
      expect(errors.onTriggerRequired).toBeDefined();
    });

    test('should fail when onTrigger is a string', () => {
      const config = {
        onTrigger: 'not a function',
      } as unknown as ButtonTriggerSurveyConfig;

      const errors = validator.validate(config);
      expect(errors.onTriggerIsFunction).toBeDefined();
      expect(errors.onTriggerIsFunction).toBe('onTrigger must be a function');
    });

    test('should fail when onTrigger is a number', () => {
      const config = {
        onTrigger: 123,
      } as unknown as ButtonTriggerSurveyConfig;

      const errors = validator.validate(config);
      expect(errors.onTriggerIsFunction).toBeDefined();
    });

    test('should fail when onTrigger is an object', () => {
      const config = {
        onTrigger: { foo: 'bar' },
      } as unknown as ButtonTriggerSurveyConfig;

      const errors = validator.validate(config);
      expect(errors.onTriggerIsFunction).toBeDefined();
    });

    test('should fail when onTrigger is an array', () => {
      const config = {
        onTrigger: [1, 2, 3],
      } as unknown as ButtonTriggerSurveyConfig;

      const errors = validator.validate(config);
      expect(errors.onTriggerIsFunction).toBeDefined();
    });

    test('should fail when onTrigger is a boolean', () => {
      const config = {
        onTrigger: true,
      } as unknown as ButtonTriggerSurveyConfig;

      const errors = validator.validate(config);
      expect(errors.onTriggerIsFunction).toBeDefined();
    });
  });

  describe('Validation with optional fields', () => {
    test('should validate optional fields when provided', () => {
      const config = {
        onTrigger: noop,
        position: 'invalid-position',
        stylePreset: 'invalid-preset',
      } as unknown as ButtonTriggerSurveyConfig;

      // Validator now checks optional fields as well
      const errors = validator.validate(config);
      expect(Object.keys(errors).length).toBeGreaterThan(0);
      expect(errors.positionIsValid).toBeDefined();
      expect(errors.stylePresetIsValid).toBeDefined();
    });

    test('should fail validation for invalid position', () => {
      const config = {
        onTrigger: noop,
        position: 'invalid',
      } as unknown as ButtonTriggerSurveyConfig;

      const errors = validator.validate(config);
      expect(errors.positionIsValid).toBeDefined();
    });

    test('should fail validation for invalid stylePreset', () => {
      const config = {
        onTrigger: noop,
        stylePreset: 'invalid',
      } as unknown as ButtonTriggerSurveyConfig;

      const errors = validator.validate(config);
      expect(errors.stylePresetIsValid).toBeDefined();
    });

    test('should fail validation for non-string containerSelector', () => {
      const config = {
        onTrigger: noop,
        containerSelector: 123,
      } as unknown as ButtonTriggerSurveyConfig;

      const errors = validator.validate(config);
      expect(errors.containerSelectorIsString).toBeDefined();
    });

    test('should fail validation for non-positive zIndex', () => {
      const config = {
        onTrigger: noop,
        zIndex: -100,
      } as unknown as ButtonTriggerSurveyConfig;

      const errors = validator.validate(config);
      expect(errors.zIndexIsPositiveNumber).toBeDefined();
    });

    test('should fail validation for invalid icon type', () => {
      const config = {
        onTrigger: noop,
        icon: 123,
      } as unknown as ButtonTriggerSurveyConfig;

      const errors = validator.validate(config);
      expect(errors.iconIsStringOrElement).toBeDefined();
      expect(errors.iconIsStringOrElement).toBe(
        'icon must be a string (HTML/SVG) or an Element',
      );
    });
  });
});
