/**
 * Utility for detecting when a DOM element is removed from the document
 * Uses MutationObserver to watch for element removal and trigger a callback
 *
 * @category Utils
 */

/**
 * Observes a DOM element and triggers a callback when it's removed from the document
 *
 * @param element - The HTML element to observe
 * @param onRemoved - Callback function to execute when element is removed
 * @returns Cleanup function to stop observing
 *
 * @example
 * ```typescript
 * const button = document.createElement('button');
 * document.body.appendChild(button);
 *
 * const cleanup = observeDOMRemoval(button, () => {
 *   console.log('Button was removed!');
 * });
 *
 * // Later...
 * document.body.removeChild(button); // Triggers callback
 *
 * // Or manually stop observing
 * cleanup();
 * ```
 */
export function observeDOMRemoval(
  element: HTMLElement,
  onRemoved: () => void,
): () => void {
  // If element is not in the document, warn and return no-op
  if (!document.contains(element)) {
    console.warn(
      '[Hello Customer SDK] observeDOMRemoval called on element not in document. Observer not started.',
    );
    return () => {
      // No-op cleanup
    };
  }

  let isObserving = true;
  let callbackExecuted = false;

  // Create mutation observer to watch for element removal
  const observer = new MutationObserver(() => {
    // Check if element is still in document
    if (!document.contains(element)) {
      // Element was removed - trigger callback once
      if (isObserving && !callbackExecuted) {
        callbackExecuted = true;
        onRemoved();
      }
    }
  });

  // Observe the document body for childList changes (element additions/removals)
  // Use subtree: true to catch removals at any level
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Return cleanup function
  return () => {
    isObserving = false;
    observer.disconnect();
  };
}
