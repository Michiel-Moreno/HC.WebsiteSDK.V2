import { UrlFactory } from '../core/factories/url.factory';
import { SurveyConfig } from '../core/interfaces/survey-config.interface';
import { wrapObjectKeysInBrackets } from '../core/utils/wrap-object-keys-in-brackets.util';

import { UrlConfigValidator } from './url.config-validator';

/**
 * Extract language from URL query parameters
 * Checks common parameter names: lang, language, locale
 * Returns uppercase language code or null if not found
 *
 * @returns Language code (e.g., 'EN', 'NL', 'FR') or null
 *
 * @example
 * // URL: https://example.com?lang=nl
 * getLanguageFromUrl() // Returns: 'NL'
 *
 * @example
 * // URL: https://example.com
 * getLanguageFromUrl() // Returns: null
 */
function getLanguageFromUrl(): string | null {
  // Server-side rendering safety check
  if (typeof window === 'undefined' || !window.location) {
    return null;
  }

  const urlParams = new URLSearchParams(window.location.search);

  // Check common parameter names in order of preference
  const lang =
    urlParams.get('lang') ||
    urlParams.get('language') ||
    urlParams.get('locale');

  // Normalize to uppercase for consistency (e.g., 'nl' -> 'NL')
  return lang ? lang.toUpperCase() : null;
}

/**
 * Class is responsible for building and validating common survey configuration
 *
 * ### Example (es module)
 * ```js
 * import { UrlBuilder } from '@hello-customer/website-touchpoint'
 * const urlBuilder = new UrlBuilder({
 *   baseUrl: 'https://base.com',
 *   tenantId: 'xxxx',
 *   touchPointId: 'zzz',
 *   language: 'EN',
 *   extra: {
 *     isPreview: true
 *   }
 * });
 * ```
 *
 * ### Example (script tag)
 * ```html
 * <script src="https://unpkg.com/@hello-customer/website-touchpoint"></script>
 * <script>
 * const urlBuilder = new hcWebsiteTouchpoint.UrlBuilder({
 *     baseUrl: 'https://base.com',
 *     tenantId: 'xxxx',
 *     touchPointId: 'zzz',
 *     language: 'EN',
 *     extra: {
 *       isPreview: true
 *     }
 *    });
 * </script>
 * ```
 *
 * @category Root
 */
export class UrlBuilder {
  private readonly urlFactory: UrlFactory;
  private readonly validator: UrlConfigValidator;

  constructor(config: SurveyConfig) {
    config = UrlBuilder.transformConfig(config);
    this.validator = new UrlConfigValidator();
    this.validator.validateAndThrowOnErrors(config);
    this.urlFactory = new UrlFactory(config);
  }

  /**
   * @return UrlFactory object with injected validated config
   */
  public getUrlFactory(): UrlFactory {
    return this.urlFactory;
  }

  /**
   * Get the configured language (after URL detection and defaults applied)
   * @return Language code (e.g., 'EN', 'NL', 'FR')
   */
  public getLanguage(): string {
    return this.urlFactory.getLanguage();
  }

  /**
   * If a provided configuration object has to be transformed before usage,
   * here such operations can be defined
   *
   * @param config
   * @private
   */
  private static transformConfig(config: SurveyConfig): SurveyConfig {
    // Handle metadata
    if (config.extra && config.extra.metadata) {
      config.extra.metadata = wrapObjectKeysInBrackets(config.extra.metadata);
    }

    // Set language with priority: URL param > config > default 'EN'
    const urlLang = getLanguageFromUrl();
    config.language = urlLang || config.language || 'EN';

    return config;
  }
}
