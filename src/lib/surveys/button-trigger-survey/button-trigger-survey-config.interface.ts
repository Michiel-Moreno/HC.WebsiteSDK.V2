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
   * Button text content
   * @default 'Feedback'
   */
  text?: string;

  /**
   * Custom icon/SVG element or HTML string
   * If provided as string, will be set as innerHTML
   */
  icon?: HTMLElement | string;

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
