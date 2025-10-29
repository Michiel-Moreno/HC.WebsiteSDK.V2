import { camelToKebabCase } from '../utils/camel-to-kebab-case.util';

/**
 * Util class making applying 'css in js' styles easy. Provides many features:
 * * Attaching inline styles
 * * Attaching styles by creating a new style ya in header with defined class
 * * Conditionally attach styles
 * * Factory does not mutate the input element
 *
 * @category Factories
 * @typeParam T Element type
 */
export class StyledElementFactory<T extends HTMLElement> {
  private readonly elementClone: T;

  private static readonly STYLES_ATTRIBUTE = 'data-hello-customer-styles';

  /**
   * Set to track CSS classes that have already been appended to prevent duplicates
   * @private
   */
  private static appendedClasses = new Set<string>();

  /**
   * Set to track media rules that have already been appended to prevent duplicates
   * @private
   */
  private static appendedMediaRules = new Set<string>();

  public constructor(element: T) {
    this.elementClone = element.cloneNode(true) as T;
  }

  public get styledElement(): T {
    return this.elementClone;
  }

  public attachCssClass(className: string): StyledElementFactory<T> {
    this.elementClone.classList.add(className);
    return this;
  }

  public attachInlineRule(
    ruleName: keyof CSSStyleDeclaration,
    ruleValue: CSSStyleDeclaration[keyof CSSStyleDeclaration],
  ): StyledElementFactory<T> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.elementClone.style as Record<string, any>)[
      camelToKebabCase(ruleName)
    ] = ruleValue;
    return this;
  }

  /**
   * Attach inline style conditionally
   *
   * @param condition
   * @param style
   */
  public applyInlineConditionally(
    condition: boolean,
    style?: Partial<CSSStyleDeclaration>,
  ): StyledElementFactory<T> {
    return condition && style ? this.applyInlineStyle(style) : this;
  }

  /**
   * Attach css class conditionally
   *
   * @param condition
   * @param name
   * @param style
   */
  public applyClassConditionally(
    condition: boolean,
    name: string,
    style?: Partial<CSSStyleDeclaration>,
  ): StyledElementFactory<T> {
    return condition ? this.applyClass(name, style) : this;
  }

  /**
   * Attach inline style
   *
   * @param style
   */
  public applyInlineStyle(
    style: Partial<CSSStyleDeclaration>,
  ): StyledElementFactory<T> {
    Object.entries(style).forEach(([key, rule]) => {
      this.attachInlineRule(
        key as keyof CSSStyleDeclaration,
        rule as CSSStyleDeclaration[keyof CSSStyleDeclaration],
      );
    });
    return this;
  }

  /**
   * Attach css class to the element, if the style object is provided,
   * besides attaching class to the element, the class gets created and posted to the header
   *
   * @param className
   * @param style
   */
  public applyClass(
    className: string,
    style?: Partial<CSSStyleDeclaration>,
  ): StyledElementFactory<T> {
    this.attachCssClass(className);
    if (style) StyledElementFactory.appendCssClassToHeader(style, className);
    return this;
  }

  /**
   * Parse provided partial style and class name into a string containing css class declaration,
   * and append it to the dedicated style element in the header - marked by [[StyledElementFactory.STYLES_ATTRIBUTE]].
   * If this style element does not exist it gets created.
   *
   * Deduplicates CSS classes to prevent memory bloat when surveys are created/destroyed repeatedly.
   *
   * @param style
   * @param name
   */
  public static appendCssClassToHeader(
    style: Partial<CSSStyleDeclaration>,
    name: string,
  ): void {
    if (Object.keys(style).length < 1) return;

    // Check if this class has already been appended to prevent duplicates
    if (StyledElementFactory.appendedClasses.has(name)) {
      return;
    }

    const element = StyledElementFactory.getStyleElement();
    element.innerHTML += StyledElementFactory.parseStyleToClass(name, style);

    // Track that we've appended this class
    StyledElementFactory.appendedClasses.add(name);
  }

  /**
   * Add media rule to the header
   *
   * Deduplicates media rules to prevent memory bloat when surveys are created/destroyed repeatedly.
   *
   * @param media
   * @param rules
   */
  public static addMediaRule(
    media: string,
    rules: Record<string, Partial<CSSStyleDeclaration>>,
  ) {
    if (Object.keys(rules).length < 1) return;

    // Generate the media rule string
    const mediaRuleString = `@media ${media} {${Object.entries(rules)
      .map((rule) => StyledElementFactory.parseStyleToClass(rule[0], rule[1]))
      .join(' ')}}`;

    // Check if this exact media rule has already been appended
    if (StyledElementFactory.appendedMediaRules.has(mediaRuleString)) {
      return;
    }

    const element = StyledElementFactory.getStyleElement();
    element.innerHTML += mediaRuleString;

    // Track that we've appended this media rule
    StyledElementFactory.appendedMediaRules.add(mediaRuleString);
  }

  /**
   * Remove a specific CSS class from the style element and cache.
   * Used for cleanup when surveys are destroyed and need to clean up their styles.
   *
   * @param className - Class name to remove (e.g., 'my-button', 'my-button:hover')
   */
  public static removeStyleClass(className: string): void {
    // Remove from cache
    if (StyledElementFactory.appendedClasses.has(className)) {
      StyledElementFactory.appendedClasses.delete(className);
    }

    // Get the style element
    const element = document.querySelector(
      `[${StyledElementFactory.STYLES_ATTRIBUTE}]`,
    ) as HTMLStyleElement;

    if (!element) {
      return;
    }

    // Parse and filter out the target class
    const styleContent = element.innerHTML;

    // Create regex to match the specific class (including pseudo-selectors)
    // Handles: .classname{...} and .classname:hover{...}
    const escapedClassName = className.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const classRegex = new RegExp(`\\.${escapedClassName}\\s*\\{[^}]*\\}`, 'g');

    // Remove the class definition
    const newContent = styleContent.replace(classRegex, '');
    element.innerHTML = newContent;
  }

  /**
   * Check if a style class has been appended.
   * Useful for testing and debugging.
   *
   * @param className - Class name to check
   * @returns true if class exists in cache
   */
  public static hasStyleClass(className: string): boolean {
    return StyledElementFactory.appendedClasses.has(className);
  }

  /**
   * Clear style cache and remove all appended styles.
   * Useful for testing and cleanup scenarios.
   *
   * @internal
   */
  public static clearStyleCache(): void {
    StyledElementFactory.appendedClasses.clear();
    StyledElementFactory.appendedMediaRules.clear();

    const element = document.querySelector(
      `[${StyledElementFactory.STYLES_ATTRIBUTE}]`,
    );
    if (element) {
      element.innerHTML = '';
    }
  }

  private static getStyleElement(): HTMLStyleElement {
    let element = document.querySelector(
      `[${StyledElementFactory.STYLES_ATTRIBUTE}]`,
    ) as HTMLStyleElement;
    if (!element) {
      element = document.createElement('style');
      element.setAttribute(StyledElementFactory.STYLES_ATTRIBUTE, '');
      document.head.appendChild(element);
    }
    return element;
  }

  private static parseStyleToClass(
    name: string,
    style: Partial<CSSStyleDeclaration>,
  ): string {
    return `.${name}{${Object.entries(style)
      .map((rule) => [camelToKebabCase(rule[0]), rule[1]])
      .map((rule) => rule.join(':'))
      .join(';')};}`;
  }
}
