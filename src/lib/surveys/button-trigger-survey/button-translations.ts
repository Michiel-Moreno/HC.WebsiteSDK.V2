/**
 * Button text translations for ButtonTriggerSurvey
 * Supports 30 languages with automatic translation based on ISO 639-1 language codes
 *
 * @category Button Trigger
 */

/**
 * Button text translations for "Feedback" in all supported languages
 * Key: ISO 639-1 language code (uppercase)
 * Value: Translated text for "Feedback"
 *
 * All supported languages
 */
export const BUTTON_TEXT_TRANSLATIONS: { [key: string]: string } = {
  // A-D
  AR: 'تعليقات', // Arabic (RTL)
  BG: 'Обратна връзка', // Bulgarian
  CA: 'Comentaris', // Catalan
  CS: 'Zpětná vazba', // Czech
  DA: 'Feedback', // Danish
  DE: 'Rückmeldung', // German

  // E-G
  EL: 'Σχόλια', // Greek
  EN: 'Feedback', // English (default)
  ES: 'Comentarios', // Spanish
  ET: 'Tagasiside', // Estonian
  FI: 'Palaute', // Finnish
  FR: 'Commentaires', // French
  GA: 'Aiseolas', // Irish

  // H-L
  HR: 'Povratne informacije', // Croatian
  HU: 'Visszajelzés', // Hungarian
  IT: 'Feedback', // Italian
  LT: 'Atsiliepimai', // Lithuanian
  LV: 'Atsauksmes', // Latvian

  // M-R
  MT: 'Feedback', // Maltese
  NL: 'Feedback', // Dutch
  NO: 'Tilbakemelding', // Norwegian
  PL: 'Opinia', // Polish
  PT: 'Opinião', // Portuguese
  RO: 'Feedback', // Romanian
  RU: 'Отзыв', // Russian

  // S-Z
  SK: 'Spätná väzba', // Slovak
  SL: 'Povratne informacije', // Slovenian
  SV: 'Feedback', // Swedish
  TR: 'Geri Bildirim', // Turkish
  ZH: '反馈', // Chinese (Simplified)
};

/**
 * Default fallback text when language is not specified or not supported
 */
export const DEFAULT_BUTTON_TEXT = 'Feedback';

/**
 * List of languages that require right-to-left (RTL) text direction
 */
export const RTL_LANGUAGES = ['AR'];

/**
 * Get button text for a given language
 *
 * @param language - ISO 639-1 language code (case-insensitive)
 * @returns Translated button text, or default if not found
 *
 * @example
 * ```typescript
 * getButtonText('FR')  // Returns 'Commentaires'
 * getButtonText('fr')  // Returns 'Commentaires' (case-insensitive)
 * getButtonText('XX')  // Returns 'Feedback' (fallback)
 * getButtonText(undefined)  // Returns 'Feedback' (fallback)
 * ```
 */
export function getButtonText(language: string | undefined): string {
  if (!language) {
    return DEFAULT_BUTTON_TEXT;
  }

  const upperLang = language.toUpperCase();
  return BUTTON_TEXT_TRANSLATIONS[upperLang] || DEFAULT_BUTTON_TEXT;
}

/**
 * Check if a language requires right-to-left (RTL) text direction
 *
 * @param language - ISO 639-1 language code (case-insensitive)
 * @returns true if language is RTL, false otherwise
 *
 * @example
 * ```typescript
 * isRTL('AR')  // Returns true (Arabic)
 * isRTL('EN')  // Returns false
 * isRTL(undefined)  // Returns false
 * ```
 */
export function isRTL(language: string | undefined): boolean {
  if (!language) {
    return false;
  }

  return RTL_LANGUAGES.includes(language.toUpperCase());
}
