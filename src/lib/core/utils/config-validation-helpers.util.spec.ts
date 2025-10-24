import {
  validateArray,
  validateBoolean,
  validateEnum,
  validateObject,
  validatePositiveNumber,
  validateString,
} from './config-validation-helpers.util';

describe('Config Validation Helpers', () => {
  describe('validateBoolean', () => {
    test('should return null for valid boolean true', () => {
      expect(validateBoolean(true, 'testField')).toBeNull();
    });

    test('should return null for valid boolean false', () => {
      expect(validateBoolean(false, 'testField')).toBeNull();
    });

    test('should return null for undefined', () => {
      expect(validateBoolean(undefined, 'testField')).toBeNull();
    });

    test('should return error for string', () => {
      const result = validateBoolean('true', 'testField');
      expect(result).toEqual({
        testFieldIsBoolean: 'testField must be a boolean',
      });
    });

    test('should return error for number', () => {
      const result = validateBoolean(1, 'testField');
      expect(result).toEqual({
        testFieldIsBoolean: 'testField must be a boolean',
      });
    });

    test('should return error for null', () => {
      const result = validateBoolean(null, 'testField');
      expect(result).toEqual({
        testFieldIsBoolean: 'testField must be a boolean',
      });
    });

    test('should return error for object', () => {
      const result = validateBoolean({}, 'testField');
      expect(result).toEqual({
        testFieldIsBoolean: 'testField must be a boolean',
      });
    });
  });

  describe('validateString', () => {
    test('should return null for valid string', () => {
      expect(validateString('test', 'testField')).toBeNull();
    });

    test('should return null for empty string', () => {
      expect(validateString('', 'testField')).toBeNull();
    });

    test('should return null for undefined', () => {
      expect(validateString(undefined, 'testField')).toBeNull();
    });

    test('should return error for number', () => {
      const result = validateString(123, 'testField');
      expect(result).toEqual({
        testFieldIsString: 'testField must be a string',
      });
    });

    test('should return error for boolean', () => {
      const result = validateString(true, 'testField');
      expect(result).toEqual({
        testFieldIsString: 'testField must be a string',
      });
    });

    test('should return error for null', () => {
      const result = validateString(null, 'testField');
      expect(result).toEqual({
        testFieldIsString: 'testField must be a string',
      });
    });

    test('should return error for object', () => {
      const result = validateString({}, 'testField');
      expect(result).toEqual({
        testFieldIsString: 'testField must be a string',
      });
    });
  });

  describe('validateObject', () => {
    test('should return null for valid object', () => {
      expect(validateObject({}, 'testField')).toBeNull();
    });

    test('should return null for object with properties', () => {
      expect(validateObject({ key: 'value' }, 'testField')).toBeNull();
    });

    test('should return null for undefined', () => {
      expect(validateObject(undefined, 'testField')).toBeNull();
    });

    test('should return error for null', () => {
      const result = validateObject(null, 'testField');
      expect(result).toEqual({
        testFieldIsObject: 'testField must be an object',
      });
    });

    test('should return error for string', () => {
      const result = validateObject('test', 'testField');
      expect(result).toEqual({
        testFieldIsObject: 'testField must be an object',
      });
    });

    test('should return error for number', () => {
      const result = validateObject(123, 'testField');
      expect(result).toEqual({
        testFieldIsObject: 'testField must be an object',
      });
    });

    test('should return error for boolean', () => {
      const result = validateObject(true, 'testField');
      expect(result).toEqual({
        testFieldIsObject: 'testField must be an object',
      });
    });

    test('should return error for array', () => {
      const result = validateObject([], 'testField');
      expect(result).toEqual({
        testFieldIsObject: 'testField must be an object',
      });
    });
  });

  describe('validatePositiveNumber', () => {
    test('should return null for positive number', () => {
      expect(validatePositiveNumber(5, 'testField')).toBeNull();
    });

    test('should return null for zero', () => {
      expect(validatePositiveNumber(0, 'testField')).toBeNull();
    });

    test('should return null for undefined', () => {
      expect(validatePositiveNumber(undefined, 'testField')).toBeNull();
    });

    test('should return error for negative number', () => {
      const result = validatePositiveNumber(-1, 'testField');
      expect(result).toEqual({
        testFieldIsPositiveNumber: 'testField must be a positive number',
      });
    });

    test('should return error for string', () => {
      const result = validatePositiveNumber('5', 'testField');
      expect(result).toEqual({
        testFieldIsPositiveNumber: 'testField must be a positive number',
      });
    });

    test('should return error for boolean', () => {
      const result = validatePositiveNumber(true, 'testField');
      expect(result).toEqual({
        testFieldIsPositiveNumber: 'testField must be a positive number',
      });
    });

    test('should return error for null', () => {
      const result = validatePositiveNumber(null, 'testField');
      expect(result).toEqual({
        testFieldIsPositiveNumber: 'testField must be a positive number',
      });
    });

    test('should return error for object', () => {
      const result = validatePositiveNumber({}, 'testField');
      expect(result).toEqual({
        testFieldIsPositiveNumber: 'testField must be a positive number',
      });
    });
  });

  describe('validateEnum', () => {
    const validValues = ['option1', 'option2', 'option3'] as const;

    test('should return null for valid enum value', () => {
      expect(validateEnum('option1', 'testField', validValues)).toBeNull();
    });

    test('should return null for another valid enum value', () => {
      expect(validateEnum('option3', 'testField', validValues)).toBeNull();
    });

    test('should return null for undefined', () => {
      expect(validateEnum(undefined, 'testField', validValues)).toBeNull();
    });

    test('should return error for invalid string', () => {
      const result = validateEnum('invalid', 'testField', validValues);
      expect(result).toEqual({
        testFieldIsValid: 'testField must be one of: option1, option2, option3',
      });
    });

    test('should return error for number', () => {
      const result = validateEnum(1, 'testField', validValues);
      expect(result).toEqual({
        testFieldIsValid: 'testField must be one of: option1, option2, option3',
      });
    });

    test('should return error for null', () => {
      const result = validateEnum(null, 'testField', validValues);
      expect(result).toEqual({
        testFieldIsValid: 'testField must be one of: option1, option2, option3',
      });
    });

    test('should return error for object', () => {
      const result = validateEnum({}, 'testField', validValues);
      expect(result).toEqual({
        testFieldIsValid: 'testField must be one of: option1, option2, option3',
      });
    });
  });

  describe('validateArray', () => {
    test('should return null for valid array', () => {
      expect(validateArray([], 'testField')).toBeNull();
    });

    test('should return null for array with items', () => {
      expect(validateArray([1, 2, 3], 'testField')).toBeNull();
    });

    test('should return null for undefined', () => {
      expect(validateArray(undefined, 'testField')).toBeNull();
    });

    test('should return error for string', () => {
      const result = validateArray('test', 'testField');
      expect(result).toEqual({
        testFieldIsArray: 'testField must be an array',
      });
    });

    test('should return error for number', () => {
      const result = validateArray(123, 'testField');
      expect(result).toEqual({
        testFieldIsArray: 'testField must be an array',
      });
    });

    test('should return error for boolean', () => {
      const result = validateArray(true, 'testField');
      expect(result).toEqual({
        testFieldIsArray: 'testField must be an array',
      });
    });

    test('should return error for null', () => {
      const result = validateArray(null, 'testField');
      expect(result).toEqual({
        testFieldIsArray: 'testField must be an array',
      });
    });

    test('should return error for object', () => {
      const result = validateArray({}, 'testField');
      expect(result).toEqual({
        testFieldIsArray: 'testField must be an array',
      });
    });
  });
});
