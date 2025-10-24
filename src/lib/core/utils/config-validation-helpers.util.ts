/**
 * Common validation helper functions for survey configs
 * Reduces code duplication and standardizes validation patterns
 *
 * @category Utilities
 */

/**
 * Validates that a value is a boolean
 * @param value - The value to validate
 * @param fieldName - The name of the field being validated
 * @returns Error object if invalid, null if valid or undefined
 *
 * @example
 * ```typescript
 * // In a config validator
 * class MyConfigValidator extends BaseConfigValidator<MyConfig> {
 *   protected defineValidationFunctions() {
 *     return [
 *       (config) => validateBoolean(config.showByDefault, 'showByDefault'),
 *       (config) => validateBoolean(config.closeButton, 'closeButton')
 *     ];
 *   }
 * }
 *
 * // Valid cases
 * validateBoolean(true, 'enabled');        // Returns null (valid)
 * validateBoolean(false, 'disabled');      // Returns null (valid)
 * validateBoolean(undefined, 'optional');  // Returns null (valid - optional field)
 *
 * // Invalid case
 * validateBoolean('true', 'enabled');
 * // Returns: { enabledIsBoolean: 'enabled must be a boolean' }
 * ```
 */
export function validateBoolean(
  value: unknown,
  fieldName: string,
): Record<string, string> | null {
  if (value === undefined) return null;
  return typeof value === 'boolean'
    ? null
    : { [`${fieldName}IsBoolean`]: `${fieldName} must be a boolean` };
}

/**
 * Validates that a value is a string
 * @param value - The value to validate
 * @param fieldName - The name of the field being validated
 * @returns Error object if invalid, null if valid or undefined
 *
 * @example
 * ```typescript
 * // In a config validator
 * class ButtonConfigValidator extends BaseConfigValidator<ButtonConfig> {
 *   protected defineValidationFunctions() {
 *     return [
 *       (config) => validateString(config.text, 'text'),
 *       (config) => validateString(config.ariaLabel, 'ariaLabel')
 *     ];
 *   }
 * }
 *
 * // Valid cases
 * validateString('Hello', 'message');       // Returns null (valid)
 * validateString('', 'empty');              // Returns null (valid - empty string is still string)
 * validateString(undefined, 'optional');    // Returns null (valid - optional field)
 *
 * // Invalid case
 * validateString(123, 'message');
 * // Returns: { messageIsString: 'message must be a string' }
 * ```
 */
export function validateString(
  value: unknown,
  fieldName: string,
): Record<string, string> | null {
  if (value === undefined) return null;
  return typeof value === 'string'
    ? null
    : { [`${fieldName}IsString`]: `${fieldName} must be a string` };
}

/**
 * Validates that a value is an object (and not null or array)
 * @param value - The value to validate
 * @param fieldName - The name of the field being validated
 * @returns Error object if invalid, null if valid or undefined
 *
 * @example
 * ```typescript
 * // In a config validator
 * class SurveyConfigValidator extends BaseConfigValidator<SurveyConfig> {
 *   protected defineValidationFunctions() {
 *     return [
 *       (config) => validateObject(config.callbacks, 'callbacks'),
 *       (config) => validateObject(config.modalStyle, 'modalStyle')
 *     ];
 *   }
 * }
 *
 * // Valid cases
 * validateObject({ key: 'value' }, 'config');  // Returns null (valid)
 * validateObject({}, 'empty');                 // Returns null (valid - empty object)
 * validateObject(undefined, 'optional');       // Returns null (valid - optional field)
 *
 * // Invalid cases
 * validateObject(null, 'config');
 * // Returns: { configIsObject: 'config must be an object' }
 *
 * validateObject(['array'], 'config');
 * // Returns: { configIsObject: 'config must be an object' }
 * ```
 */
export function validateObject(
  value: unknown,
  fieldName: string,
): Record<string, string> | null {
  if (value === undefined) return null;
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? null
    : { [`${fieldName}IsObject`]: `${fieldName} must be an object` };
}

/**
 * Validates that a value is a positive number (>= 0)
 * @param value - The value to validate
 * @param fieldName - The name of the field being validated
 * @returns Error object if invalid, null if valid or undefined
 *
 * @example
 * ```typescript
 * // In a quarantine config validator
 * class QuarantineConfigValidator extends BaseConfigValidator<QuarantineConfig> {
 *   protected defineValidationFunctions() {
 *     return [
 *       (config) => validatePositiveNumber(config.daysBeforeShowing, 'daysBeforeShowing'),
 *       (config) => validatePositiveNumber(config.zIndex, 'zIndex')
 *     ];
 *   }
 * }
 *
 * // Valid cases
 * validatePositiveNumber(0, 'count');         // Returns null (valid - zero is allowed)
 * validatePositiveNumber(42, 'count');        // Returns null (valid)
 * validatePositiveNumber(3.14, 'decimal');    // Returns null (valid - decimals allowed)
 * validatePositiveNumber(undefined, 'optional'); // Returns null (valid - optional field)
 *
 * // Invalid cases
 * validatePositiveNumber(-1, 'count');
 * // Returns: { countIsPositiveNumber: 'count must be a positive number' }
 *
 * validatePositiveNumber('5', 'count');
 * // Returns: { countIsPositiveNumber: 'count must be a positive number' }
 * ```
 */
export function validatePositiveNumber(
  value: unknown,
  fieldName: string,
): Record<string, string> | null {
  if (value === undefined) return null;
  return typeof value === 'number' && value >= 0
    ? null
    : {
        [`${fieldName}IsPositiveNumber`]: `${fieldName} must be a positive number`,
      };
}

/**
 * Validates that a value is one of the allowed enum values
 * @param value - The value to validate
 * @param fieldName - The name of the field being validated
 * @param validValues - Array of valid values
 * @returns Error object if invalid, null if valid or undefined
 *
 * @example
 * ```typescript
 * // In a button config validator
 * const VALID_POSITIONS = ['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const;
 * const VALID_PRESETS = ['pill-button', 'circle-button', 'side-tab', 'banner'] as const;
 *
 * class ButtonConfigValidator extends BaseConfigValidator<ButtonConfig> {
 *   protected defineValidationFunctions() {
 *     return [
 *       (config) => validateEnum(config.position, 'position', VALID_POSITIONS),
 *       (config) => validateEnum(config.stylePreset, 'stylePreset', VALID_PRESETS)
 *     ];
 *   }
 * }
 *
 * // Valid cases
 * validateEnum('top-left', 'position', VALID_POSITIONS);  // Returns null (valid)
 * validateEnum(undefined, 'position', VALID_POSITIONS);   // Returns null (valid - optional)
 *
 * // Invalid case
 * validateEnum('center', 'position', VALID_POSITIONS);
 * // Returns: {
 * //   positionIsValid: 'position must be one of: top-left, top-right, bottom-left, bottom-right'
 * // }
 * ```
 */
export function validateEnum<T extends string>(
  value: unknown,
  fieldName: string,
  validValues: readonly T[],
): Record<string, string> | null {
  if (value === undefined) return null;
  return validValues.includes(value as T)
    ? null
    : {
        [`${fieldName}IsValid`]: `${fieldName} must be one of: ${validValues.join(', ')}`,
      };
}

/**
 * Validates that a value is an array
 * @param value - The value to validate
 * @param fieldName - The name of the field being validated
 * @returns Error object if invalid, null if valid or undefined
 *
 * @example
 * ```typescript
 * // In a custom config validator
 * class MultiSurveyConfigValidator extends BaseConfigValidator<MultiSurveyConfig> {
 *   protected defineValidationFunctions() {
 *     return [
 *       (config) => validateArray(config.surveyIds, 'surveyIds'),
 *       (config) => validateArray(config.allowedLanguages, 'allowedLanguages')
 *     ];
 *   }
 * }
 *
 * // Valid cases
 * validateArray([], 'items');               // Returns null (valid - empty array)
 * validateArray([1, 2, 3], 'numbers');      // Returns null (valid)
 * validateArray(['a', 'b'], 'strings');     // Returns null (valid)
 * validateArray(undefined, 'optional');     // Returns null (valid - optional field)
 *
 * // Invalid cases
 * validateArray('not-array', 'items');
 * // Returns: { itemsIsArray: 'items must be an array' }
 *
 * validateArray({ length: 3 }, 'items');
 * // Returns: { itemsIsArray: 'items must be an array' }
 * ```
 */
export function validateArray(
  value: unknown,
  fieldName: string,
): Record<string, string> | null {
  if (value === undefined) return null;
  return Array.isArray(value)
    ? null
    : { [`${fieldName}IsArray`]: `${fieldName} must be an array` };
}
