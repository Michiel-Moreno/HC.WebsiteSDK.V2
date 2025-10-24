import { computeClassNames } from './compute-class-names.util';

describe('computeClassNames', () => {
  type TestClassNames = {
    button: string;
    icon: string;
    text: string;
    container: string;
  };

  const defaultClassNames: Required<TestClassNames> = {
    button: 'btn-default',
    icon: 'icon-default',
    text: 'text-default',
    container: 'container-default',
  };

  describe('Basic Functionality', () => {
    test('should return defaults when no user config provided', () => {
      const result = computeClassNames<TestClassNames>(
        undefined,
        defaultClassNames,
      );

      expect(result).toEqual(defaultClassNames);
      expect(result).not.toBe(defaultClassNames); // Should be new object
    });

    test('should return defaults when empty user config provided', () => {
      const result = computeClassNames<TestClassNames>({}, defaultClassNames);

      expect(result).toEqual(defaultClassNames);
    });

    test('should override specific class names from user config', () => {
      const userConfig: Partial<TestClassNames> = {
        button: 'btn-custom',
      };

      const result = computeClassNames<TestClassNames>(
        userConfig,
        defaultClassNames,
      );

      expect(result).toEqual({
        button: 'btn-custom', // User override
        icon: 'icon-default',
        text: 'text-default',
        container: 'container-default',
      });
    });

    test('should override multiple class names from user config', () => {
      const userConfig: Partial<TestClassNames> = {
        button: 'btn-custom',
        icon: 'icon-custom',
        text: 'text-custom',
      };

      const result = computeClassNames<TestClassNames>(
        userConfig,
        defaultClassNames,
      );

      expect(result).toEqual({
        button: 'btn-custom',
        icon: 'icon-custom',
        text: 'text-custom',
        container: 'container-default', // Still default
      });
    });

    test('should override all class names when all provided', () => {
      const userConfig: TestClassNames = {
        button: 'btn-custom',
        icon: 'icon-custom',
        text: 'text-custom',
        container: 'container-custom',
      };

      const result = computeClassNames<TestClassNames>(
        userConfig,
        defaultClassNames,
      );

      expect(result).toEqual(userConfig);
    });
  });

  describe('Type Safety', () => {
    test('should work with different object structures', () => {
      type ModalClassNames = {
        rootDivStyle: string;
        windowDivStyle: string;
        iFrameStyle: string;
      };

      const defaults: Required<ModalClassNames> = {
        rootDivStyle: 'hello-customer-modal',
        windowDivStyle: 'hello-customer-modal__window',
        iFrameStyle: 'hello-customer-survey__survey',
      };

      const userConfig: Partial<ModalClassNames> = {
        rootDivStyle: 'custom-modal',
      };

      const result = computeClassNames<ModalClassNames>(userConfig, defaults);

      expect(result).toEqual({
        rootDivStyle: 'custom-modal',
        windowDivStyle: 'hello-customer-modal__window',
        iFrameStyle: 'hello-customer-survey__survey',
      });
    });

    test('should work with single property objects', () => {
      type SingleProp = {
        className: string;
      };

      const defaults: Required<SingleProp> = {
        className: 'default',
      };

      const userConfig: Partial<SingleProp> = {
        className: 'custom',
      };

      const result = computeClassNames<SingleProp>(userConfig, defaults);

      expect(result).toEqual({ className: 'custom' });
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty string values in user config', () => {
      const userConfig: Partial<TestClassNames> = {
        button: '', // Empty string
      };

      const result = computeClassNames<TestClassNames>(
        userConfig,
        defaultClassNames,
      );

      expect(result.button).toBe('');
      expect(result.icon).toBe('icon-default');
    });

    test('should not mutate the defaults object', () => {
      const originalDefaults = { ...defaultClassNames };
      const userConfig: Partial<TestClassNames> = {
        button: 'btn-custom',
      };

      computeClassNames<TestClassNames>(userConfig, defaultClassNames);

      expect(defaultClassNames).toEqual(originalDefaults);
    });

    test('should not mutate the user config object', () => {
      const userConfig: Partial<TestClassNames> = {
        button: 'btn-custom',
      };
      const originalUserConfig = { ...userConfig };

      computeClassNames<TestClassNames>(userConfig, defaultClassNames);

      expect(userConfig).toEqual(originalUserConfig);
    });

    test('should handle class names with spaces and special characters', () => {
      type ComplexClassNames = {
        multi: string;
        special: string;
      };

      const defaults: Required<ComplexClassNames> = {
        multi: 'class-one class-two',
        special: 'class_with-special.chars',
      };

      const userConfig: Partial<ComplexClassNames> = {
        multi: 'custom-one custom-two custom-three',
      };

      const result = computeClassNames<ComplexClassNames>(userConfig, defaults);

      expect(result.multi).toBe('custom-one custom-two custom-three');
      expect(result.special).toBe('class_with-special.chars');
    });
  });

  describe('Real-World Scenarios', () => {
    test('should work like ModalSurvey computeClassNames pattern', () => {
      // Simulating ModalSurvey's class name structure
      type ModalClassNames = {
        rootDivStyle: string;
        windowBarDivStyle: string;
        windowDivStyle: string;
        windowCloseButtonStyle: string;
        iFrameStyle: string;
        modalVisible: string;
        modalTranslucentBackground: string;
        footerStyle: string;
        footerLogoStyle: string;
      };

      const modalDefaults: Required<ModalClassNames> = {
        rootDivStyle: 'hello-customer-modal',
        windowBarDivStyle: 'hello-customer-modal__bar',
        windowDivStyle: 'hello-customer-modal__window',
        windowCloseButtonStyle: 'hello-customer-modal__close-button',
        iFrameStyle: 'hello-customer-survey__survey',
        modalVisible: 'hello-customer-modal--visible',
        modalTranslucentBackground: 'hello-customer-modal--translucent',
        footerStyle: 'hello-customer-modal__footer',
        footerLogoStyle: 'hello-customer-modal__logo',
      };

      const userConfig: Partial<ModalClassNames> = {
        rootDivStyle: 'my-custom-modal',
        iFrameStyle: 'my-custom-iframe',
      };

      const result = computeClassNames<ModalClassNames>(
        userConfig,
        modalDefaults,
      );

      expect(result.rootDivStyle).toBe('my-custom-modal');
      expect(result.iFrameStyle).toBe('my-custom-iframe');
      expect(result.windowBarDivStyle).toBe('hello-customer-modal__bar');
      expect(result.windowDivStyle).toBe('hello-customer-modal__window');
      // All other defaults preserved
    });

    test('should work like ButtonTriggerSurvey classNames caching pattern', () => {
      type ButtonClassNames = {
        buttonContainer: string;
        button: string;
        buttonIcon: string;
        buttonText: string;
        buttonVisible: string;
        buttonHidden: string;
      };

      const buttonDefaults: Required<ButtonClassNames> = {
        buttonContainer: 'hc-button-trigger-container',
        button: 'hc-button-trigger',
        buttonIcon: 'hc-button-trigger__icon',
        buttonText: 'hc-button-trigger__text',
        buttonVisible: 'hc-button-trigger--visible',
        buttonHidden: 'hc-button-trigger--hidden',
      };

      const userConfig: Partial<ButtonClassNames> = {
        button: 'custom-feedback-button',
        buttonIcon: 'custom-icon',
      };

      const result = computeClassNames<ButtonClassNames>(
        userConfig,
        buttonDefaults,
      );

      expect(result.button).toBe('custom-feedback-button');
      expect(result.buttonIcon).toBe('custom-icon');
      expect(result.buttonContainer).toBe('hc-button-trigger-container');
      expect(result.buttonVisible).toBe('hc-button-trigger--visible');
    });
  });
});
