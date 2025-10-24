import { ConfigValidationFunctionType } from '../../core/types/config-validation-function.type';

import { BaseSurveyConfig } from './base-survey-config.interface';
import { SurveyConfigValidator } from './survey.config-validator';

// Concrete test implementation of abstract SurveyConfigValidator
interface TestSurveyConfig extends BaseSurveyConfig {
  testField?: string;
}

class TestSurveyConfigValidator extends SurveyConfigValidator<TestSurveyConfig> {
  public constructor() {
    super();
  }

  protected surveySpecificValidations(): ConfigValidationFunctionType<TestSurveyConfig>[] {
    return [
      (config) =>
        config.testField === undefined || typeof config.testField === 'string'
          ? null
          : {
              testFieldIsString: 'testField must be a string',
            },
    ];
  }
}

describe('SurveyConfigValidator', () => {
  let validator: TestSurveyConfigValidator;

  beforeEach(() => {
    validator = new TestSurveyConfigValidator();
  });

  describe('Common validations', () => {
    test('should pass validation with no quarantine config', () => {
      const config: TestSurveyConfig = {};
      const errors = validator.validate(config);
      expect(Object.keys(errors).length).toBe(0);
    });

    test('should pass validation with valid quarantine config', () => {
      const config: TestSurveyConfig = {
        quarantineConfig: { period: 7 },
      };
      const errors = validator.validate(config);
      expect(Object.keys(errors).length).toBe(0);
    });

    test('should fail when quarantine config is not an object', () => {
      const config = {
        quarantineConfig: 'invalid',
      } as unknown as TestSurveyConfig;

      const errors = validator.validate(config);
      expect(errors.quarantineConfigIsObject).toBeDefined();
      expect(errors.quarantineConfigIsObject).toBe(
        'Quarantine config must be an object',
      );
    });

    test('should fail when quarantine config has invalid period', () => {
      const config = {
        quarantineConfig: { period: -5 },
      } as unknown as TestSurveyConfig;

      const errors = validator.validate(config);
      expect(errors.quarantinePeriodIsPositiveNumber).toBeDefined();
      expect(errors.quarantinePeriodIsPositiveNumber).toBe(
        'Quarantine period must be a positive number',
      );
    });

    test('should fail when quarantine config period is missing', () => {
      const config = {
        quarantineConfig: {},
      } as unknown as TestSurveyConfig;

      const errors = validator.validate(config);
      expect(errors.quarantinePeriodIsPositiveNumber).toBeDefined();
    });
  });

  describe('Survey-specific validations', () => {
    test('should run survey-specific validations', () => {
      const config: TestSurveyConfig = {
        testField: 'valid string',
      };

      const errors = validator.validate(config);
      expect(Object.keys(errors).length).toBe(0);
    });

    test('should fail survey-specific validation for invalid field', () => {
      const config = {
        testField: 123,
      } as unknown as TestSurveyConfig;

      const errors = validator.validate(config);
      expect(errors.testFieldIsString).toBeDefined();
      expect(errors.testFieldIsString).toBe('testField must be a string');
    });
  });

  describe('Combined validations', () => {
    test('should run both common and specific validations', () => {
      const config: TestSurveyConfig = {
        quarantineConfig: { period: 14 },
        testField: 'valid',
      };

      const errors = validator.validate(config);
      expect(Object.keys(errors).length).toBe(0);
    });

    test('should report errors from both common and specific validations', () => {
      const config = {
        quarantineConfig: 'invalid',
        testField: 123,
      } as unknown as TestSurveyConfig;

      const errors = validator.validate(config);
      expect(errors.quarantineConfigIsObject).toBeDefined();
      expect(errors.testFieldIsString).toBeDefined();
    });
  });
});
