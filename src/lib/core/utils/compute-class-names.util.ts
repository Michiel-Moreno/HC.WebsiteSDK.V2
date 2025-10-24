/**
 * Utility for computing class names by merging user config with defaults
 * Follows DRY principle - used by multiple survey types
 *
 * @category Utils
 */

/**
 * Merges user-provided class names with default class names
 * User-provided values take precedence over defaults
 *
 * @param userClassNames - User-provided class name overrides (optional)
 * @param defaultClassNames - Default class names for all properties
 * @returns Complete object with all class names resolved
 *
 * @example
 * ```typescript
 * const defaults = {
 *   button: 'btn-default',
 *   icon: 'icon-default',
 *   text: 'text-default'
 * };
 *
 * const userConfig = {
 *   button: 'btn-custom'
 * };
 *
 * const result = computeClassNames(userConfig, defaults);
 * // Returns: {
 * //   button: 'btn-custom',     // User override
 * //   icon: 'icon-default',     // Default used
 * //   text: 'text-default'      // Default used
 * // }
 * ```
 */
export function computeClassNames<T extends Record<string, string>>(
  userClassNames: Partial<T> | undefined,
  defaultClassNames: Required<T>,
): Required<T> {
  // Always return a new object to avoid mutations
  // Merge defaults with user overrides (user takes precedence)
  return {
    ...defaultClassNames,
    ...userClassNames,
  } as Required<T>;
}
