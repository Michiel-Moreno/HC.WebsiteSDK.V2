import { InvalidQuerySelectorException } from '../../core/exceptions/invalid-query-selector.exception';
import { StyledElementFactory } from '../../core/factories/styled-element.factory';
import { trueByDefault } from '../../core/utils/true-by-default.util';
import { BaseSurvey } from '../common/base-survey';

import { ButtonPosition } from './button-position.type';
import { ButtonStylePreset } from './button-style-preset.type';
import { getButtonText, isRTL } from './button-translations';
import { ButtonTriggerSurveyConfig } from './button-trigger-survey-config.interface';
import * as defaults from './button-trigger-survey-defaults.style';
import { ButtonTriggerSurveyConfigValidator } from './button-trigger-survey.config-validator';

/**
 * Creates a floating feedback button that can trigger surveys or custom callbacks
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
 * @category Surveys
 */
export class ButtonTriggerSurvey extends BaseSurvey<ButtonTriggerSurveyConfig> {
  private readonly buttonHandle: HTMLButtonElement;
  private readonly containerHandle: HTMLDivElement;
  private readonly position: ButtonPosition;
  private readonly stylePreset: ButtonStylePreset;
  private clickHandler: EventListener | null = null;
  private buttonText: string;
  private ariaLabel: string;

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

    // Create button DOM
    const [container, button] = this.createButton();
    this.containerHandle = container;
    this.buttonHandle = button;

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
      const classNames = this.getClassNames();
      this.containerHandle.classList.add(classNames.buttonVisible);
      this.containerHandle.classList.remove(classNames.buttonHidden);
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
    const classNames = this.getClassNames();
    this.containerHandle.classList.remove(classNames.buttonVisible);
    this.containerHandle.classList.add(classNames.buttonHidden);
    this.config.callbacks?.onHide?.();
  }

  /**
   * Destroy button and remove from DOM
   * Cleans up event listeners to prevent memory leaks
   */
  public destroy(): void {
    // Remove event listener
    if (this.clickHandler && this.buttonHandle) {
      this.buttonHandle.removeEventListener('click', this.clickHandler);
      this.clickHandler = null;
    }

    // Remove from DOM
    if (this.containerHandle.parentElement) {
      this.containerHandle.parentElement.removeChild(this.containerHandle);
    }

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
        '[Hello Customer SDK] Cannot update language: Custom text is set',
      );
      return;
    }

    this.config.language = newLanguage;

    // Recalculate button text
    this.buttonText = getButtonText(newLanguage);
    this.ariaLabel = this.buttonText;

    // Update DOM
    const textElement = this.buttonHandle.querySelector(
      `.${this.getClassNames().buttonText}`,
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
   * Get class names (default or custom)
   */
  private getClassNames() {
    return {
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
  }

  /**
   * Initialize default styles
   */
  private initStyles(): void {
    const classNames = this.getClassNames();

    // Add animation styles
    if (trueByDefault(this.config.enableAnimation)) {
      StyledElementFactory.appendCssClassToHeader(
        defaults.animationStyles.visible,
        classNames.buttonVisible,
      );
      StyledElementFactory.appendCssClassToHeader(
        defaults.animationStyles.hidden,
        classNames.buttonHidden,
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
        `${classNames.button}:hover`,
      );
    }
  }

  /**
   * Create button DOM structure
   */
  private createButton(): [HTMLDivElement, HTMLButtonElement] {
    const classNames = this.getClassNames();

    // Get styles
    const positionStyle = defaults.positionStyles[this.position];
    const presetStyles = defaults.stylePresets[this.stylePreset];

    // Merge styles
    const containerStyle = {
      ...defaults.baseContainerStyle,
      ...positionStyle,
      ...(this.config.zIndex && { zIndex: this.config.zIndex.toString() }),
    };

    const buttonStyle = {
      ...presetStyles.buttonStyle,
      ...this.config.customStyle?.buttonStyle,
    };

    // Create container
    const container = new StyledElementFactory(
      document.createElement('div'),
    ).applyClass(classNames.buttonContainer, containerStyle).styledElement;

    // Create button
    const button = new StyledElementFactory(
      document.createElement('button'),
    ).applyClass(
      classNames.button,
      this.config.ignoreDefaultStyles ? {} : buttonStyle,
    ).styledElement;

    // Set accessibility
    button.setAttribute('type', 'button');
    button.setAttribute('aria-label', this.ariaLabel);

    // Apply RTL styling if needed
    if (isRTL(this.config.language)) {
      button.setAttribute('dir', 'rtl');
      button.style.direction = 'rtl';
    }

    // Add icon if provided
    if (this.config.icon) {
      const iconContainer = document.createElement('span');
      iconContainer.className = classNames.buttonIcon;

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
      textSpan.className = classNames.buttonText;
      textSpan.textContent = this.buttonText;

      // Apply text styles if not ignoring defaults
      if (!this.config.ignoreDefaultStyles && presetStyles.buttonTextStyle) {
        const textStyleFactory = new StyledElementFactory(textSpan);
        textStyleFactory.applyInlineStyle(presetStyles.buttonTextStyle);
      }

      button.appendChild(textSpan);
    }

    // Add click handler and store reference for cleanup
    this.clickHandler = () => {
      this.config.onTrigger();
    };
    button.addEventListener('click', this.clickHandler);

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
