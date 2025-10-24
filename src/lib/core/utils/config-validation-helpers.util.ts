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
