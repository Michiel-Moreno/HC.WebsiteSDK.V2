import { StyledElementFactory } from './styled-element.factory';

describe('StyledElementFactory', () => {
  beforeEach(() => {
    // Clean up DOM and style cache before each test
    document.body.innerHTML = '';
    document.head.innerHTML = '';
    StyledElementFactory.clearStyleCache();
  });

  afterEach(() => {
    // Clean up after each test
    document.body.innerHTML = '';
    document.head.innerHTML = '';
    StyledElementFactory.clearStyleCache();
  });

  describe('A. Basic Element Creation and Styling', () => {
    test('should create a styled element factory instance', () => {
      const div = document.createElement('div');
      const factory = new StyledElementFactory(div);

      expect(factory).toBeDefined();
      expect(factory.styledElement).toBeDefined();
      expect(factory.styledElement.tagName).toBe('DIV');
    });

    test('should not mutate the original element', () => {
      const div = document.createElement('div');
      div.className = 'original';

      const factory = new StyledElementFactory(div);
      factory.attachCssClass('new-class');

      expect(div.className).toBe('original');
      expect(factory.styledElement.className).toContain('new-class');
    });

    test('should attach CSS class to element', () => {
      const div = document.createElement('div');
      const factory = new StyledElementFactory(div);

      factory.attachCssClass('test-class');

      expect(factory.styledElement.classList.contains('test-class')).toBe(true);
    });

    test('should apply inline styles', () => {
      const div = document.createElement('div');
      const factory = new StyledElementFactory(div);

      factory.applyInlineStyle({
        color: 'red',
        fontSize: '16px',
      });

      expect(factory.styledElement.style.color).toBe('red');
      expect(factory.styledElement.style.fontSize).toBe('16px');
    });

    test('should apply class with styles to header', () => {
      const div = document.createElement('div');
      const factory = new StyledElementFactory(div);

      factory.applyClass('test-class', {
        backgroundColor: 'blue',
        padding: '10px',
      });

      expect(factory.styledElement.classList.contains('test-class')).toBe(true);

      const styleElement = document.querySelector(
        '[data-hello-customer-styles]',
      ) as HTMLStyleElement;
      expect(styleElement).not.toBeNull();
      expect(styleElement.innerHTML).toContain('.test-class');
      expect(styleElement.innerHTML).toContain('background-color:blue');
      expect(styleElement.innerHTML).toContain('padding:10px');
    });
  });

  describe('B. CSS Class Deduplication', () => {
    test('should append CSS class only once when called multiple times with same class name', () => {
      const style = { color: 'red', fontSize: '14px' };

      // Append the same class 5 times
      StyledElementFactory.appendCssClassToHeader(style, 'duplicate-test');
      StyledElementFactory.appendCssClassToHeader(style, 'duplicate-test');
      StyledElementFactory.appendCssClassToHeader(style, 'duplicate-test');
      StyledElementFactory.appendCssClassToHeader(style, 'duplicate-test');
      StyledElementFactory.appendCssClassToHeader(style, 'duplicate-test');

      const styleElement = document.querySelector(
        '[data-hello-customer-styles]',
      ) as HTMLStyleElement;
      const cssContent = styleElement?.innerHTML || '';

      // Count occurrences of the class
      const matches = cssContent.match(/\.duplicate-test\{/g);
      expect(matches).not.toBeNull();
      expect(matches?.length).toBe(1); // Should appear only once
    });

    test('should append different CSS classes separately', () => {
      StyledElementFactory.appendCssClassToHeader(
        { color: 'red' },
        'class-one',
      );
      StyledElementFactory.appendCssClassToHeader(
        { color: 'blue' },
        'class-two',
      );
      StyledElementFactory.appendCssClassToHeader(
        { color: 'green' },
        'class-three',
      );

      const styleElement = document.querySelector(
        '[data-hello-customer-styles]',
      ) as HTMLStyleElement;
      const cssContent = styleElement?.innerHTML || '';

      expect(cssContent).toContain('.class-one');
      expect(cssContent).toContain('.class-two');
      expect(cssContent).toContain('.class-three');
    });

    test('should not append CSS when empty style object is provided', () => {
      StyledElementFactory.appendCssClassToHeader({}, 'empty-class');

      const styleElement = document.querySelector(
        '[data-hello-customer-styles]',
      );
      expect(styleElement).toBeNull();
    });

    test('should handle rapid creation and destruction without CSS accumulation', () => {
      // Simulate creating and destroying 100 elements with the same class
      for (let i = 0; i < 100; i++) {
        const div = document.createElement('div');
        const factory = new StyledElementFactory(div);
        factory.applyClass('rapid-test-class', {
          color: 'red',
          padding: '10px',
        });
      }

      const styleElement = document.querySelector(
        '[data-hello-customer-styles]',
      ) as HTMLStyleElement;
      const cssContent = styleElement?.innerHTML || '';

      // Count occurrences of the class
      const matches = cssContent.match(/\.rapid-test-class\{/g);
      expect(matches).not.toBeNull();
      expect(matches?.length).toBe(1); // Should still appear only once
    });
  });

  describe('C. Media Rule Deduplication', () => {
    test('should append media rule only once when called multiple times', () => {
      const mediaQuery = '(max-width: 768px)';
      const rules = {
        'test-class': { fontSize: '12px', padding: '5px' },
      };

      // Append the same media rule 5 times
      StyledElementFactory.addMediaRule(mediaQuery, rules);
      StyledElementFactory.addMediaRule(mediaQuery, rules);
      StyledElementFactory.addMediaRule(mediaQuery, rules);
      StyledElementFactory.addMediaRule(mediaQuery, rules);
      StyledElementFactory.addMediaRule(mediaQuery, rules);

      const styleElement = document.querySelector(
        '[data-hello-customer-styles]',
      ) as HTMLStyleElement;
      const cssContent = styleElement?.innerHTML || '';

      // Count occurrences of the media rule
      const matches = cssContent.match(/@media \(max-width: 768px\)/g);
      expect(matches).not.toBeNull();
      expect(matches?.length).toBe(1); // Should appear only once
    });

    test('should append different media rules separately', () => {
      StyledElementFactory.addMediaRule('(max-width: 768px)', {
        'mobile-class': { fontSize: '12px' },
      });
      StyledElementFactory.addMediaRule('(min-width: 1024px)', {
        'desktop-class': { fontSize: '16px' },
      });

      const styleElement = document.querySelector(
        '[data-hello-customer-styles]',
      ) as HTMLStyleElement;
      const cssContent = styleElement?.innerHTML || '';

      expect(cssContent).toContain('@media (max-width: 768px)');
      expect(cssContent).toContain('@media (min-width: 1024px)');
    });

    test('should not append media rule when empty rules object is provided', () => {
      StyledElementFactory.addMediaRule('(max-width: 768px)', {});

      const styleElement = document.querySelector(
        '[data-hello-customer-styles]',
      );
      expect(styleElement).toBeNull();
    });

    test('should handle multiple classes in same media rule', () => {
      StyledElementFactory.addMediaRule('(max-width: 768px)', {
        'class-one': { fontSize: '12px' },
        'class-two': { padding: '5px' },
      });

      const styleElement = document.querySelector(
        '[data-hello-customer-styles]',
      ) as HTMLStyleElement;
      const cssContent = styleElement?.innerHTML || '';

      expect(cssContent).toContain('@media (max-width: 768px)');
      expect(cssContent).toContain('.class-one');
      expect(cssContent).toContain('.class-two');
    });
  });

  describe('D. clearStyleCache Method', () => {
    test('should clear appended classes cache', () => {
      StyledElementFactory.appendCssClassToHeader(
        { color: 'red' },
        'cached-class',
      );

      // Verify it was added
      let styleElement = document.querySelector(
        '[data-hello-customer-styles]',
      ) as HTMLStyleElement;
      expect(styleElement.innerHTML).toContain('.cached-class');

      // Clear cache
      StyledElementFactory.clearStyleCache();

      // Try to add again - should work now
      StyledElementFactory.appendCssClassToHeader(
        { color: 'blue' },
        'cached-class',
      );

      styleElement = document.querySelector(
        '[data-hello-customer-styles]',
      ) as HTMLStyleElement;
      expect(styleElement.innerHTML).toContain('.cached-class');
      expect(styleElement.innerHTML).toContain('color:blue');
    });

    test('should clear media rules cache', () => {
      const mediaQuery = '(max-width: 768px)';
      const rules = { 'test-class': { fontSize: '12px' } };

      StyledElementFactory.addMediaRule(mediaQuery, rules);

      // Verify it was added
      let styleElement = document.querySelector(
        '[data-hello-customer-styles]',
      ) as HTMLStyleElement;
      expect(styleElement.innerHTML).toContain('@media (max-width: 768px)');

      // Clear cache
      StyledElementFactory.clearStyleCache();

      // Try to add again - should work now
      StyledElementFactory.addMediaRule(mediaQuery, rules);

      styleElement = document.querySelector(
        '[data-hello-customer-styles]',
      ) as HTMLStyleElement;
      expect(styleElement.innerHTML).toContain('@media (max-width: 768px)');
    });

    test('should remove all styles from the style element', () => {
      StyledElementFactory.appendCssClassToHeader({ color: 'red' }, 'class-1');
      StyledElementFactory.appendCssClassToHeader({ color: 'blue' }, 'class-2');
      StyledElementFactory.addMediaRule('(max-width: 768px)', {
        'mobile-class': { fontSize: '12px' },
      });

      let styleElement = document.querySelector(
        '[data-hello-customer-styles]',
      ) as HTMLStyleElement;
      expect(styleElement.innerHTML.length).toBeGreaterThan(0);

      StyledElementFactory.clearStyleCache();

      styleElement = document.querySelector(
        '[data-hello-customer-styles]',
      ) as HTMLStyleElement;
      expect(styleElement?.innerHTML || '').toBe('');
    });

    test('should handle clearing cache when no styles exist', () => {
      expect(() => StyledElementFactory.clearStyleCache()).not.toThrow();
    });
  });

  describe('E. Conditional Styling', () => {
    test('should apply inline style conditionally when condition is true', () => {
      const div = document.createElement('div');
      const factory = new StyledElementFactory(div);

      factory.applyInlineConditionally(true, { color: 'red' });

      expect(factory.styledElement.style.color).toBe('red');
    });

    test('should not apply inline style conditionally when condition is false', () => {
      const div = document.createElement('div');
      const factory = new StyledElementFactory(div);

      factory.applyInlineConditionally(false, { color: 'red' });

      expect(factory.styledElement.style.color).toBe('');
    });

    test('should apply class conditionally when condition is true', () => {
      const div = document.createElement('div');
      const factory = new StyledElementFactory(div);

      factory.applyClassConditionally(true, 'conditional-class', {
        color: 'blue',
      });

      expect(
        factory.styledElement.classList.contains('conditional-class'),
      ).toBe(true);
    });

    test('should not apply class conditionally when condition is false', () => {
      const div = document.createElement('div');
      const factory = new StyledElementFactory(div);

      factory.applyClassConditionally(false, 'conditional-class', {
        color: 'blue',
      });

      expect(
        factory.styledElement.classList.contains('conditional-class'),
      ).toBe(false);
    });
  });

  describe('F. Method Chaining', () => {
    test('should support method chaining', () => {
      const div = document.createElement('div');
      const factory = new StyledElementFactory(div);

      const result = factory
        .attachCssClass('class-1')
        .applyInlineStyle({ color: 'red' })
        .attachCssClass('class-2')
        .applyClass('class-3', { fontSize: '14px' });

      expect(result).toBe(factory);
      expect(factory.styledElement.classList.contains('class-1')).toBe(true);
      expect(factory.styledElement.classList.contains('class-2')).toBe(true);
      expect(factory.styledElement.classList.contains('class-3')).toBe(true);
      expect(factory.styledElement.style.color).toBe('red');
    });
  });

  describe('G. Memory Management - Rapid Create/Destroy Cycles', () => {
    test('should not accumulate CSS with 100 rapid create/destroy cycles', () => {
      // Create and destroy 100 elements
      for (let i = 0; i < 100; i++) {
        const button = document.createElement('button');
        const factory = new StyledElementFactory(button);
        factory.applyClass('memory-test-button', {
          backgroundColor: 'blue',
          color: 'white',
          padding: '10px',
        });
      }

      const styleElement = document.querySelector(
        '[data-hello-customer-styles]',
      ) as HTMLStyleElement;
      const cssContent = styleElement?.innerHTML || '';

      // Count occurrences of the button class
      const buttonClassCount = (
        cssContent.match(/\.memory-test-button\{/g) || []
      ).length;

      // With deduplication, should have only 1 occurrence
      // Without deduplication, would have 100
      expect(buttonClassCount).toBe(1);
    });

    test('should not accumulate media rules with rapid creation', () => {
      for (let i = 0; i < 50; i++) {
        StyledElementFactory.addMediaRule('(max-width: 768px)', {
          'rapid-mobile-class': { fontSize: '12px' },
        });
      }

      const styleElement = document.querySelector(
        '[data-hello-customer-styles]',
      ) as HTMLStyleElement;
      const cssContent = styleElement?.innerHTML || '';

      const mediaRuleCount = (
        cssContent.match(/@media \(max-width: 768px\)/g) || []
      ).length;

      expect(mediaRuleCount).toBe(1);
    });

    test('should handle mixed class and media rule creation efficiently', () => {
      for (let i = 0; i < 100; i++) {
        const div = document.createElement('div');
        const factory = new StyledElementFactory(div);

        factory.applyClass('mixed-class', { color: 'red' });

        if (i % 10 === 0) {
          StyledElementFactory.addMediaRule('(max-width: 768px)', {
            'mixed-media-class': { fontSize: '12px' },
          });
        }
      }

      const styleElement = document.querySelector(
        '[data-hello-customer-styles]',
      ) as HTMLStyleElement;
      const cssContent = styleElement?.innerHTML || '';

      // Should have only 1 of each
      const classCount = (cssContent.match(/\.mixed-class\{/g) || []).length;
      const mediaCount = (
        cssContent.match(/@media \(max-width: 768px\)/g) || []
      ).length;

      expect(classCount).toBe(1);
      expect(mediaCount).toBe(1);
    });
  });
});
