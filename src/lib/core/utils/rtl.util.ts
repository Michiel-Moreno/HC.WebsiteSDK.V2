/**
 * Utility for handling right-to-left (RTL) language support
 * Used across surveys that need to adapt to RTL languages
 *
 * @category Utils
 */

/**
 * List of languages that require right-to-left (RTL) text direction
 * Based on ISO 639-1 language codes (uppercase)
 */
export const RTL_LANGUAGES = ['AR']; // Arabic

/**
 * Check if a language requires right-to-left (RTL) text direction
 *
 * @param language - ISO 639-1 language code (case-insensitive)
 * @returns true if language is RTL, false otherwise
 *
 * @example
 * ```typescript
 * isRTL('AR')  // Returns true (Arabic)
 * isRTL('ar')  // Returns true (case-insensitive)
 * isRTL('EN')  // Returns false
 * isRTL('en')  // Returns false
 * isRTL(undefined)  // Returns false
 * isRTL(null)  // Returns false
 * ```
 */
export function isRTL(language: string | undefined): boolean {
  if (!language) {
    return false;
  }

  return RTL_LANGUAGES.includes(language.toUpperCase());
}
