import { InvalidQuerySelectorException } from '../../core/exceptions/invalid-query-selector.exception';
import { StyledElementFactory } from '../../core/factories/styled-element.factory';
import { observeDOMRemoval } from '../../core/utils/dom-removal-observer.util';
import { isRTL } from '../../core/utils/rtl.util';
import { trueByDefault } from '../../core/utils/true-by-default.util';
import { BaseSurvey } from '../common/base-survey';

import { ButtonPosition } from './button-position.type';
import { ButtonStylePreset } from './button-style-preset.type';
import { getButtonText } from './button-translations';
import { ButtonTriggerSurveyConfig } from './button-trigger-survey-config.interface';
import * as defaults from './button-trigger-survey-defaults.style';
import { ButtonTriggerSurveyConfigValidator } from './button-trigger-survey.config-validator';

/**
 * Creates a floating feedback button that can trigger surveys or custom callbacks
 *
 * **v3.0 Features**:
 * - Automatic DOM removal detection for memory leak prevention
 * - Comprehensive config validation with helpful warnings
 * - Smart position + stylePreset compatibility checks
 *
 * ### Example (ES module)
 * ```js
 * import { UrlBuilder, ModalSurvey, ButtonTriggerSurvey } from '@hello-customer/website-touchpoint-v2'
 *
 * const urlBuilder = new UrlBuilder({
 *   baseUrl: 'https://base.com',
 *   tenantId: 'xxx',
 *   touchPointId: 'zzz',
 *   language: 'EN'
 * });
 *
 * const modalSurvey = new ModalSurvey(urlBuilder, {});
 *
 * const buttonTrigger = new ButtonTriggerSurvey({
 *   position: 'bottom-right',
 *   stylePreset: 'pill-button',
 *   text: 'Give Feedback',
 *   onTrigger: () => modalSurvey.show()
 * });
 * ```
 *
 * ### Example (script tag)
 * ```html
 * <script src="https://resources.hellocustomer.com/hubfs/HC.WebsiteSDK.V2/website-touchpoint-v2.js"></script>
 * <script>
 *   const urlBuilder = new hcWebsiteTouchpoint.UrlBuilder({...});
 *   const modalSurvey = new hcWebsiteTouchpoint.ModalSurvey(urlBuilder, {});
 *   const buttonTrigger = new hcWebsiteTouchpoint.ButtonTriggerSurvey({
 *     position: 'bottom-right',
 *     text: 'Feedback',
 *     onTrigger: () => modalSurvey.show()
 *   });
 * </script>
 * ```
 *
 * ### Example (validation warnings - v3.0+)
 * ```typescript
 * // Warning: 'side-tab' works best at 'left-center' or 'right-center'
 * const button = new ButtonTriggerSurvey({
 *   position: 'bottom-right',  // Corner position
 *   stylePreset: 'side-tab',   // Side preset
 *   onTrigger: () => {}
 * });
 * // Console: "[Hello Customer SDK] 'side-tab' preset works best at
 * //  'left-center' or 'right-center'. Current position: 'bottom-right'..."
 * ```
 *
 * ### Example (circle-button validation - v3.0+)
 * ```typescript
 * // Warning: circle-button needs an icon
 * const button = new ButtonTriggerSurvey({
 *   position: 'bottom-left',
 *   stylePreset: 'circle-button',
 *   text: 'Feedback',  // Text provided but no icon
 *   onTrigger: () => {}
 * });
 * // Console: "[Hello Customer SDK] circle-button preset works best
 * //  with an icon. Consider adding an icon..."
 * ```
 *
 * @category Surveys
 */
export class ButtonTriggerSurvey extends BaseSurvey<ButtonTriggerSurveyConfig> {
  private readonly buttonHandle: HTMLButtonElement;
  private readonly containerHandle: HTMLDivElement;
  private readonly position: ButtonPosition;
  private readonly stylePreset: ButtonStylePreset;
  private buttonText: string;
  private ariaLabel: string;
  private isDestroyed: boolean = false;
  private domRemovalCleanup?: () => void;
  private readonly classNames: {
    buttonContainer: string;
    button: string;
    buttonIcon: string;
    buttonText: string;
    buttonVisible: string;
    buttonHidden: string;
  };

  constructor(config: ButtonTriggerSurveyConfig) {
    // Set defaults before calling super
    const position = config.position || 'bottom-right';
    const stylePreset = config.stylePreset || 'pill-button';

    // Generate stable identifier for quarantine
    // Uses config.quarantineId if provided, otherwise generates from position + text
    // This ensures quarantine persists across page reloads
    const quarantineId =
      config.quarantineId ||
      `button-trigger-${position}-${config.text || 'default'}`;

    // Call parent constructor with null UrlBuilder (ButtonTrigger doesn't use surveys)
    super(null, config, new ButtonTriggerSurveyConfigValidator(), quarantineId);

    this.position = position;
    this.stylePreset = stylePreset;

    // Determine button text and ARIA label based on config
    this.buttonText = this.determineButtonText();
    this.ariaLabel = this.determineAriaLabel();

    // Cache class names (computed once to avoid repeated object allocations)
    this.classNames = {
      buttonContainer:
        this.config.classNames?.buttonContainer ||
        defaults.classNames.buttonContainer,
      button: this.config.classNames?.button || defaults.classNames.button,
      buttonIcon:
        this.config.classNames?.buttonIcon || defaults.classNames.buttonIcon,
      buttonText:
        this.config.classNames?.buttonText || defaults.classNames.buttonText,
      buttonVisible: defaults.classNames.buttonVisible,
      buttonHidden: defaults.classNames.buttonHidden,
    };

    // Create button DOM
    const [container, button] = this.createButton();
    this.containerHandle = container;
    this.buttonHandle = button;

    // Set up DOM removal detection
    this.domRemovalCleanup = observeDOMRemoval(this.containerHandle, () => {
      if (!this.isDestroyed) {
        this.destroy();
      }
    });

    // Initialize styles
    if (!this.config.ignoreDefaultStyles) {
      this.initStyles();
    }

    // Show or hide based on config and quarantine
    if (trueByDefault(this.config.showByDefault)) {
      if (this.quarantineService.isUnderQuarantine()) {
        this.hide();
      } else {
        this.show();
      }
    } else {
      this.hide();
    }
  }

  /**
   * Get button element
   */
  public get button(): HTMLButtonElement {
    return this.buttonHandle;
  }

  /**
   * Get container element
   */
  public get container(): HTMLDivElement {
    return this.containerHandle;
  }

  /**
   * Show button
   */
  public show(): void {
    if (!this.quarantineService.isUnderQuarantine()) {
      this.containerHandle.classList.add(this.classNames.buttonVisible);
      this.containerHandle.classList.remove(this.classNames.buttonHidden);
      this.quarantineService.startQuarantine();
      this.config.callbacks?.onShow?.();
    } else {
      const remainingDays = this.quarantineService.getRemainingDays();
      this.config.callbacks?.onQuarantineBlocked?.(remainingDays);
    }
  }

  /**
   * Hide button
   */
  public hide(): void {
    this.containerHandle.classList.remove(this.classNames.buttonVisible);
    this.containerHandle.classList.add(this.classNames.buttonHidden);
    this.config.callbacks?.onHide?.();
  }

  /**
   * Destroy button and remove from DOM
   * Cleans up event listeners and internal references to prevent memory leaks
   *
   * **v3.0+**: Automatically called when button element is removed from DOM
   * Safe to call multiple times (idempotent)
   *
   * Cleans up:
   * - Button container from DOM
   * - Event listeners
   * - DOM removal observer
   *
   * @example
   * ```typescript
   * // Manual cleanup
   * const button = new ButtonTriggerSurvey({
   *   position: 'bottom-right',
   *   text: 'Feedback',
   *   onTrigger: () => modal.show()
   * });
   * // ... later
   * button.destroy();
   * ```
   *
   * @example
   * ```typescript
   * // Automatic cleanup (v3.0+)
   * const button = new ButtonTriggerSurvey({
   *   position: 'bottom-right',
   *   text: 'Feedback',
   *   onTrigger: () => modal.show(),
   *   callbacks: {
   *     onDestroy: () => {
   *       console.log('Button auto-cleaned!');
   *     }
   *   }
   * });
   *
   * // Later, removing from DOM triggers automatic cleanup
   * button.container.remove(); // destroy() called automatically
   * ```
   */
  public destroy(): void {
    // Prevent double-destroy
    if (this.isDestroyed) {
      return;
    }

    // Clean up DOM removal observer
    if (this.domRemovalCleanup) {
      this.domRemovalCleanup();
      this.domRemovalCleanup = undefined;
    }

    // Remove all tracked event listeners
    this.cleanupEventListeners();

    // Remove from DOM
    if (this.containerHandle && this.containerHandle.parentElement) {
      this.containerHandle.parentElement.removeChild(this.containerHandle);
    }

    // Mark as destroyed
    this.isDestroyed = true;

    // Call destroy callback
    this.config.callbacks?.onDestroy?.();
  }

  /**
   * Update button language dynamically
   * Only works if no custom text was provided initially
   *
   * @param newLanguage - New language code (ISO 639-1)
   *
   * @example
   * ```typescript
   * button.updateLanguage('FR'); // Changes button text to 'Commentaires'
   * button.updateLanguage('ES'); // Changes button text to 'Comentarios'
   * ```
   */
  public updateLanguage(newLanguage: string): void {
    // Only update if using automatic translation (no explicit text provided)
    if (this.config.text) {
      console.warn(
        '[Hello Customer SDK] Cannot update language: Custom text is set. ' +
          'To enable dynamic language switching, remove the "text" config option and use "language" instead.',
      );
      return;
    }

    this.config.language = newLanguage;

    // Recalculate button text
    this.buttonText = getButtonText(newLanguage);
    this.ariaLabel = this.buttonText;

    // Update DOM
    const textElement = this.buttonHandle.querySelector(
      `.${this.classNames.buttonText}`,
    );
    if (textElement) {
      textElement.textContent = this.buttonText;
    }

    this.buttonHandle.setAttribute('aria-label', this.ariaLabel);

    // Update RTL if needed
    this.updateRTL(newLanguage);
  }

  /**
   * Determine button text based on config
   * Priority: explicit text > language translation > default
   */
  private determineButtonText(): string {
    // Priority 1: Explicit text provided
    if (this.config.text) {
      return this.config.text;
    }

    // Priority 2: Auto-translate based on language
    if (this.config.language) {
      return getButtonText(this.config.language);
    }

    // Priority 3: Default fallback
    return getButtonText(undefined); // Returns 'Feedback'
  }

  /**
   * Determine ARIA label for accessibility
   * Uses button text or custom aria label
   */
  private determineAriaLabel(): string {
    // Use custom aria label if provided, otherwise use button text
    return this.config.ariaLabel || this.buttonText;
  }

  /**
   * Update RTL styling for button
   */
  private updateRTL(language: string | undefined): void {
    if (isRTL(language)) {
      this.buttonHandle.setAttribute('dir', 'rtl');
      this.buttonHandle.style.direction = 'rtl';

      // Adjust icon position for RTL (if icon exists)
      if (this.config.icon) {
        this.buttonHandle.style.flexDirection = 'row-reverse';
      }
    } else {
      this.buttonHandle.removeAttribute('dir');
      this.buttonHandle.style.direction = '';
      if (this.config.icon) {
        this.buttonHandle.style.flexDirection = '';
      }
    }
  }

  /**
   * Get position-aware button styles
   * Automatically adjusts preset styles based on position to handle odd combinations
   * @private
   */
  private getPositionAwareButtonStyle(): Partial<CSSStyleDeclaration> {
    const presetStyles = defaults.stylePresets[this.stylePreset];
    const adjustedStyle = { ...presetStyles.buttonStyle };

    // Side tab adjustments
    if (this.stylePreset === 'side-tab') {
      if (this.position === 'left-center') {
        // Flip border radius and shadow for left side
        adjustedStyle.borderRadius = '0 8px 8px 0';
        adjustedStyle.boxShadow = '4px 0 12px rgba(0, 0, 0, 0.15)';
      }

      // Warn for incompatible positions
      const cornerPositions: ButtonPosition[] = [
        'top-left',
        'top-right',
        'bottom-left',
        'bottom-right',
        'top-center',
        'bottom-center',
      ];
      if (cornerPositions.includes(this.position)) {
        console.warn(
          `[Hello Customer SDK] 'side-tab' preset works best at 'left-center' or 'right-center'. ` +
            `Current position: '${this.position}'. ` +
            `Recommended: Change to { position: 'left-center' } or { stylePreset: 'pill-button' }`,
        );
      }
    }

    // Banner adjustments
    if (this.stylePreset === 'banner') {
      const centerPositions: ButtonPosition[] = ['top-center', 'bottom-center'];
      if (!centerPositions.includes(this.position)) {
        // Remove full width for non-center positions
        delete adjustedStyle.width;
        adjustedStyle.width = 'auto';
        adjustedStyle.padding = '12px 24px'; // Keep padding

        console.warn(
          `[Hello Customer SDK] 'banner' preset works best at 'top-center' or 'bottom-center'. ` +
            `Current position: '${this.position}'. ` +
            `Recommended: Change to { position: 'top-center' } or { stylePreset: 'pill-button' }`,
        );
      }
    }

    return adjustedStyle;
  }

  /**
   * Initialize default styles
   */
  private initStyles(): void {
    // Add animation styles
    if (trueByDefault(this.config.enableAnimation)) {
      StyledElementFactory.appendCssClassToHeader(
        defaults.animationStyles.visible,
        this.classNames.buttonVisible,
      );
      StyledElementFactory.appendCssClassToHeader(
        defaults.animationStyles.hidden,
        this.classNames.buttonHidden,
      );
    }

    // Add media queries
    Object.entries(defaults.medias).forEach(([media, rules]) =>
      StyledElementFactory.addMediaRule(media, rules),
    );

    // Add hover styles
    const presetStyles = defaults.stylePresets[this.stylePreset];
    if (presetStyles.buttonHoverStyle) {
      StyledElementFactory.appendCssClassToHeader(
        presetStyles.buttonHoverStyle,
        `${this.classNames.button}:hover`,
      );
    }
  }

  /**
   * Create button DOM structure
   */
  private createButton(): [HTMLDivElement, HTMLButtonElement] {
    // Get styles
    const positionStyle = defaults.positionStyles[this.position];
    const presetStyles = defaults.stylePresets[this.stylePreset];

    // Separate base styles (shared across all buttons) from position-specific styles
    // Position styles are applied inline to avoid conflicts when multiple buttons exist
    const containerBaseStyle = {
      ...defaults.baseContainerStyle,
      ...(this.config.zIndex && { zIndex: this.config.zIndex.toString() }),
    };

    let containerPositionStyle = positionStyle;

    // Banner requires full-width container positioning for edge-to-edge display
    if (
      this.stylePreset === 'banner' &&
      (this.position === 'top-center' || this.position === 'bottom-center')
    ) {
      // Override container position to span full viewport width
      const modifiedPositionStyle: Partial<CSSStyleDeclaration> = {
        ...containerPositionStyle,
        left: '0',
        right: '0',
      };
      // Remove the centering transform since we want edge-to-edge
      delete modifiedPositionStyle.transform;
      containerPositionStyle = modifiedPositionStyle;
    }

    // Use position-aware button style that automatically adjusts for odd combinations
    const buttonStyle = {
      ...this.getPositionAwareButtonStyle(),
      ...this.config.customStyle?.buttonStyle,
    };

    // Create container with base styles as CSS class and position styles as inline
    // This prevents CSS conflicts when multiple buttons with different positions exist
    const container = new StyledElementFactory(document.createElement('div'))
      .applyClass(this.classNames.buttonContainer, containerBaseStyle)
      .applyInlineStyle(containerPositionStyle).styledElement;

    // Create button
    const button = new StyledElementFactory(
      document.createElement('button'),
    ).applyClass(
      this.classNames.button,
      this.config.ignoreDefaultStyles ? {} : buttonStyle,
    ).styledElement;

    // Set accessibility
    button.setAttribute('type', 'button');
    button.setAttribute('aria-label', this.ariaLabel);

    // Warn if circle-button preset is used without an icon
    if (this.stylePreset === 'circle-button' && !this.config.icon) {
      console.warn(
        '[Hello Customer SDK] circle-button preset works best with an icon. ' +
          'Consider adding an icon or using a different preset like pill-button.',
      );
    }

    // Apply RTL styling if needed
    if (isRTL(this.config.language)) {
      button.setAttribute('dir', 'rtl');
      button.style.direction = 'rtl';
    }

    // Add icon if provided
    if (this.config.icon) {
      const iconContainer = document.createElement('span');
      iconContainer.className = this.classNames.buttonIcon;

      // Apply icon styles if not ignoring defaults
      if (!this.config.ignoreDefaultStyles && presetStyles.buttonIconStyle) {
        const iconStyleFactory = new StyledElementFactory(iconContainer);
        iconStyleFactory.applyInlineStyle(presetStyles.buttonIconStyle);
      }

      if (typeof this.config.icon === 'string') {
        iconContainer.innerHTML = this.config.icon;
      } else {
        iconContainer.appendChild(this.config.icon);
      }

      // Adjust icon position for RTL
      if (isRTL(this.config.language)) {
        button.style.flexDirection = 'row-reverse';
      }

      button.appendChild(iconContainer);
    }

    // Add text (hidden for circle button, but kept for accessibility)
    if (this.buttonText && this.stylePreset !== 'circle-button') {
      const textSpan = document.createElement('span');
      textSpan.className = this.classNames.buttonText;
      textSpan.textContent = this.buttonText;

      // Apply text styles if not ignoring defaults
      if (!this.config.ignoreDefaultStyles && presetStyles.buttonTextStyle) {
        const textStyleFactory = new StyledElementFactory(textSpan);
        textStyleFactory.applyInlineStyle(presetStyles.buttonTextStyle);
      }

      button.appendChild(textSpan);
    }

    // Add click handler using tracked listener for automatic cleanup
    const clickHandler = () => {
      this.config.onTrigger();
    };
    this.addTrackedListener(button, 'click', clickHandler);

    // Append to container
    container.appendChild(button);

    // Append to document
    if (this.config.containerSelector) {
      const root = document.querySelector(this.config.containerSelector);
      if (!root) {
        throw new InvalidQuerySelectorException(
          `[Hello Customer SDK] HTML element for ${this.config.containerSelector} selector not found!`,
        );
      }
      root.appendChild(container);
    } else {
      document.body.appendChild(container);
    }

    return [container, button];
  }
}
