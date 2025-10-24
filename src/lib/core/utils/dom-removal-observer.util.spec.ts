import { observeDOMRemoval } from './dom-removal-observer.util';

describe('observeDOMRemoval', () => {
  let testContainer: HTMLDivElement;

  beforeEach(() => {
    // Clean up DOM
    document.body.innerHTML = '';

    // Create test container
    testContainer = document.createElement('div');
    testContainer.id = 'test-container';
    document.body.appendChild(testContainer);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('Basic Functionality', () => {
    test('should trigger callback when element is removed from document.body', (done) => {
      const element = document.createElement('div');
      document.body.appendChild(element);

      observeDOMRemoval(element, () => {
        expect(document.contains(element)).toBe(false);
        done();
      });

      // Remove element
      document.body.removeChild(element);
    });

    test('should trigger callback when element is removed from nested container', (done) => {
      const element = document.createElement('div');
      testContainer.appendChild(element);

      observeDOMRemoval(element, () => {
        expect(document.contains(element)).toBe(false);
        done();
      });

      // Remove element from nested container
      testContainer.removeChild(element);
    });

    test('should trigger callback when parent container is removed', (done) => {
      const element = document.createElement('div');
      testContainer.appendChild(element);

      observeDOMRemoval(element, () => {
        expect(document.contains(element)).toBe(false);
        done();
      });

      // Remove parent container (which removes element too)
      document.body.removeChild(testContainer);
    });
  });

  describe('Cleanup Functionality', () => {
    test('should return cleanup function', () => {
      const element = document.createElement('div');
      document.body.appendChild(element);

      const cleanup = observeDOMRemoval(element, () => {
        // Should not be called
      });

      expect(typeof cleanup).toBe('function');

      cleanup();
      document.body.removeChild(element);
    });

    test('should not trigger callback after cleanup is called', (done) => {
      const element = document.createElement('div');
      document.body.appendChild(element);

      let callbackCalled = false;
      const cleanup = observeDOMRemoval(element, () => {
        callbackCalled = true;
      });

      // Stop observing before removal
      cleanup();

      // Remove element
      document.body.removeChild(element);

      // Wait a bit to ensure callback doesn't fire
      setTimeout(() => {
        expect(callbackCalled).toBe(false);
        done();
      }, 100);
    });

    test('should handle multiple cleanup calls gracefully', () => {
      const element = document.createElement('div');
      document.body.appendChild(element);

      const cleanup = observeDOMRemoval(element, () => {
        // No-op
      });

      // Should not throw
      expect(() => {
        cleanup();
        cleanup();
        cleanup();
      }).not.toThrow();

      document.body.removeChild(element);
    });
  });

  describe('Edge Cases', () => {
    test('should trigger callback only once for element removal', (done) => {
      const element = document.createElement('div');
      document.body.appendChild(element);

      let callbackCount = 0;
      observeDOMRemoval(element, () => {
        callbackCount++;
      });

      // Remove element
      document.body.removeChild(element);

      // Wait to ensure callback only fires once
      setTimeout(() => {
        expect(callbackCount).toBe(1);
        done();
      }, 100);
    });

    test('should warn and return no-op cleanup if element not in document', () => {
      const element = document.createElement('div');
      // Element never attached to document

      const consoleWarnSpy = jest
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      const cleanup = observeDOMRemoval(element, () => {
        // Should never be called
      });

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[Hello Customer SDK] observeDOMRemoval called on element not in document. Observer not started.',
      );
      expect(typeof cleanup).toBe('function');

      // Cleanup should be safe to call
      expect(() => cleanup()).not.toThrow();

      consoleWarnSpy.mockRestore();
    });

    test('should handle element being re-added after removal', (done) => {
      const element = document.createElement('div');
      document.body.appendChild(element);

      let callbackCount = 0;
      const cleanup = observeDOMRemoval(element, () => {
        callbackCount++;
      });

      // Remove element
      document.body.removeChild(element);

      // Wait for callback
      setTimeout(() => {
        expect(callbackCount).toBe(1);

        // Re-add element (should not trigger callback again)
        document.body.appendChild(element);

        setTimeout(() => {
          expect(callbackCount).toBe(1); // Still 1
          cleanup();
          done();
        }, 100);
      }, 100);
    });

    test('should not interfere with other DOM mutations', (done) => {
      const element = document.createElement('div');
      document.body.appendChild(element);

      observeDOMRemoval(element, () => {
        done();
      });

      // Add other elements (should not trigger callback)
      const otherElement = document.createElement('div');
      document.body.appendChild(otherElement);

      // Modify attributes (should not trigger callback)
      element.setAttribute('data-test', 'value');

      // Wait a bit
      setTimeout(() => {
        // Now remove the watched element
        document.body.removeChild(element);
      }, 50);
    });
  });

  describe('Memory Management', () => {
    test('should handle rapid create/observe/remove cycles', (done) => {
      const iterations = 50;
      let completedCallbacks = 0;

      for (let i = 0; i < iterations; i++) {
        const element = document.createElement('div');
        element.id = `test-element-${i}`;
        document.body.appendChild(element);

        observeDOMRemoval(element, () => {
          completedCallbacks++;
          if (completedCallbacks === iterations) {
            done();
          }
        });

        // Remove immediately
        document.body.removeChild(element);
      }
    });

    test('should clean up observers properly to prevent memory leaks', () => {
      const cleanups: Array<() => void> = [];

      // Create 100 observers
      for (let i = 0; i < 100; i++) {
        const element = document.createElement('div');
        document.body.appendChild(element);

        const cleanup = observeDOMRemoval(element, () => {
          // No-op
        });

        cleanups.push(cleanup);
      }

      // Clean up all observers
      expect(() => {
        cleanups.forEach((cleanup) => cleanup());
      }).not.toThrow();

      // Verify DOM is still intact
      expect(document.body.children.length).toBeGreaterThan(0);
    });
  });
});
