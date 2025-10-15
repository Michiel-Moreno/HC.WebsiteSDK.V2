import { BaseConfigValidator } from '../../core/base-classes/base.config-validator';
import { UrlFactory } from '../../core/factories/url.factory';
import { UrlBuilder } from '../../url-builder/url.builder';

import { BaseSurveyConfig } from './base-survey-config.interface';
import { QuarantineService } from './quarantine.service';

/**
 * Abstract base class for all survey types
 * Handles common initialization and shared behavior
 *
 * Centralizes:
 * - UrlFactory initialization from UrlBuilder
 * - Config validation via BaseConfigValidator
 * - QuarantineService setup with identifier
 * - Public quarantine API methods
 *
 * @category Surveys
 */
export abstract class BaseSurvey<TConfig extends BaseSurveyConfig> {
  protected readonly urlFactory?: UrlFactory;
  protected readonly quarantineService: QuarantineService;
  protected readonly validator: BaseConfigValidator<TConfig>;

  /**
   * Creates a new survey instance
   *
   * @param configBuilder - UrlBuilder instance (optional for ButtonTriggerSurvey)
   * @param config - Survey configuration extending BaseSurveyConfig
   * @param validator - Validator instance for config validation
   * @param quarantineIdentifier - Optional custom identifier for quarantine tracking
   *                               (e.g., ButtonTriggerSurvey uses custom ID instead of survey identifier)
   */
  constructor(
    configBuilder: UrlBuilder | null,
    protected config: TConfig,
    validator: BaseConfigValidator<TConfig>,
    quarantineIdentifier?: string,
  ) {
    // Initialize UrlFactory if UrlBuilder provided
    if (configBuilder) {
      this.urlFactory = configBuilder.getUrlFactory();
    }

    // Validate configuration
    this.validator = validator;
    this.validator.validateAndThrowOnErrors(config);

    // Initialize quarantine service
    // Use custom identifier if provided (e.g., ButtonTriggerSurvey),
    // otherwise use survey identifier from URL factory
    const identifier =
      quarantineIdentifier ||
      (this.urlFactory ? this.urlFactory.getSurveyIdentifier() : '');

    this.quarantineService = new QuarantineService(
      identifier,
      config.quarantineConfig,
    );
  }

  /**
   * Show survey, respecting quarantine rules
   * Must be implemented by each survey type
   */
  public abstract show(): void;

  /**
   * Hide survey
   * Must be implemented by each survey type
   */
  public abstract hide(): void;

  /**
   * Destroy survey and clean up resources
   * Must be implemented by each survey type
   */
  public abstract destroy(): void;

  /**
   * Check if survey is under quarantine
   *
   * @returns true if survey is currently under quarantine, false otherwise
   *
   * @example
   * ```typescript
   * if (survey.isQuarantined()) {
   *   console.log('Survey is under quarantine');
   * }
   * ```
   */
  public isQuarantined(): boolean {
    return this.quarantineService.isUnderQuarantine();
  }

  /**
   * Get detailed quarantine status
   *
   * @returns Quarantine status object with isQuarantined and remainingDays
   *
   * @example
   * ```typescript
   * const status = survey.getQuarantineStatus();
   * console.log(`Quarantined: ${status.isQuarantined}, Days remaining: ${status.remainingDays}`);
   * ```
   */
  public getQuarantineStatus() {
    return this.quarantineService.getQuarantineStatus();
  }

  /**
   * Manually clear quarantine
   * Allows survey to be shown again immediately
   *
   * @example
   * ```typescript
   * survey.clearQuarantine();
   * survey.show(); // Will now show even if previously quarantined
   * ```
   */
  public clearQuarantine(): void {
    this.quarantineService.clearQuarantine();
  }

  /**
   * Update survey URL configuration dynamically
   * Only affects URL parameters, not DOM structure
   *
   * Note: Changes take effect on next reload() call for surveys with iframes
   *
   * @param patch - Partial config to merge with existing
   *
   * @example
   * ```typescript
   * // Add user metadata after login
   * survey.updateUrlConfig({
   *   extra: {
   *     respondent: { id: '123', email: 'user@example.com' }
   *   }
   * });
   * survey.reload(); // Apply changes
   * ```
   *
   * @example
   * ```typescript
   * // Update language dynamically
   * survey.updateUrlConfig({
   *   language: 'FR'
   * });
   * survey.reload();
   * ```
   */
  public updateUrlConfig(patch: Record<string, unknown>): void {
    if (!this.urlFactory) {
      console.warn(
        '[Hello Customer SDK] updateUrlConfig called but no URL factory available. ' +
          'This survey type does not support URL configuration updates.',
      );
      return;
    }
    this.urlFactory.patchConfig(patch);
  }
}
