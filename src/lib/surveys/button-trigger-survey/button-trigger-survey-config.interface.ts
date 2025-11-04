import { BaseSurveyConfig } from '../common/base-survey-config.interface';

import { ButtonPosition } from './button-position.type';
import { ButtonStylePreset } from './button-style-preset.type';

/**
 * Style configuration for button trigger elements
 *
 * @category Button Trigger
 */
export interface ButtonTriggerStyleConfig {
  buttonStyle?: Partial<CSSStyleDeclaration>;
  buttonHoverStyle?: Partial<CSSStyleDeclaration>;
  buttonIconStyle?: Partial<CSSStyleDeclaration>;
  buttonTextStyle?: Partial<CSSStyleDeclaration>;
}

/**
 * Configuration for ButtonTriggerSurvey
 *
 * @category Button Trigger
 */
export interface ButtonTriggerSurveyConfig extends BaseSurveyConfig {
  /**
   * Position of the button on the screen
   * @default 'bottom-right'
   */
  position?: ButtonPosition;

  /**
   * Predefined style preset
   * @default 'pill-button'
   */
  stylePreset?: ButtonStylePreset;

  /**
   * Language code for automatic translation (ISO 639-1)
   * If provided and text is not specified, button text will be
   * automatically translated based on this language.
   * Supports 30 languages including EN, FR, ES, DE, NL, IT, PT, PL, RU, AR, ZH, and more.
   *
   * @example 'EN', 'FR', 'ES', 'DE'
   * @see button-translations.ts for full list of supported languages
   */
  language?: string;

  /**
   * Button text content - accepts string or per-language object
   *
   * **String mode** (backwards compatible):
   * - Uses exact text provided (no translation)
   * - Disables dynamic language switching
   *
   * **Object mode** (NEW):
   * - Maps language codes to custom text: { EN: 'Feedback', FR: 'Commentaires' }
   * - Enables dynamic language switching with custom text
   * - Falls back to 'EN' key if current language not found
   * - Falls back to first available key if no 'EN' key
   * - Falls back to default 'Feedback' if object is empty
   * - Language codes are case-insensitive
   *
   * **Priority logic**:
   * 1. If text is object → Use language-specific text from object
   * 2. If text is string → Use exact text (no translation)
   * 3. If language provided → Auto-translate using built-in translations
   * 4. Default → 'Feedback'
   *
   * For circle-button preset, text is hidden visually but used
   * for ARIA label (accessibility)
   *
   * @example
   * // String mode (backwards compatible)
   * text: 'Give Feedback'
   *
   * @example
   * // Object mode with multiple languages
   * text: { EN: 'Feedback', FR: 'Commentaires', ES: 'Comentarios' }
   *
   * @example
   * // Object mode with case-insensitive keys
   * text: { en: 'Feedback', fr: 'Commentaires' }
   *
   * @default Auto-translated based on language, or 'Feedback' if no language specified
   */
  text?: string | Record<string, string>;

  /**
   * Custom icon/SVG element or HTML string
   *
   * ⚠️ **SECURITY WARNING:** If providing an HTML string, ensure it comes from a
   * trusted source to prevent XSS attacks. HTML content is NOT sanitized.
   * Only use static strings or SVG/HTML elements from your own codebase.
   *
   * @example
   * // ✅ Safe - static string
   * icon: '<svg><circle cx="10" cy="10" r="5"/></svg>'
   *
   * // ✅ Safe - SVG element
   * icon: document.createElementNS('http://www.w3.org/2000/svg', 'svg')
   *
   * // ✅ Safe - HTML element
   * icon: document.createElement('span')
   *
   * // ❌ UNSAFE - user input
   * icon: userProvidedContent // DO NOT DO THIS
   *
   * If provided as string, will be set as innerHTML.
   * For circle-button preset, an icon is highly recommended.
   */
  icon?: Element | string;

  /**
   * Callback function when button is clicked
   * Required - defines what happens on click
   */
  onTrigger: () => void;

  /**
   * Custom styles to override defaults
   */
  customStyle?: ButtonTriggerStyleConfig;

  /**
   * Override default CSS class names
   */
  classNames?: {
    buttonContainer?: string;
    button?: string;
    buttonIcon?: string;
    buttonText?: string;
  };

  /**
   * If true, removes all default styles
   * @default false
   */
  ignoreDefaultStyles?: boolean;

  /**
   * Query selector for container element
   * @default body
   */
  containerSelector?: string;

  /**
   * Show button immediately on creation
   * @default true
   */
  showByDefault?: boolean;

  /**
   * Enable entrance animation
   * @default true
   */
  enableAnimation?: boolean;

  /**
   * Unique identifier for quarantine tracking
   * If not provided, generated from position + text
   * Ensures quarantine persists across page reloads
   * @example 'feedback-button-main'
   */
  quarantineId?: string;

  /**
   * z-index for button positioning
   * @default 9999
   */
  zIndex?: number;

  /**
   * Accessibility label for screen readers
   */
  ariaLabel?: string;
}
