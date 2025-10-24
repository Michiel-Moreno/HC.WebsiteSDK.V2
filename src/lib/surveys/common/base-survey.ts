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
  protected iFrameHandle?: HTMLIFrameElement;
  private messageHandler: ((data: unknown) => void) | null = null;
  private messageEventListener: ((event: MessageEvent) => void) | null = null;
  protected eventListeners: Array<{
    element: HTMLElement | Window | Document;
    event: string;
    handler: EventListener;
  }> = [];

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
   *
   * Safe to call multiple times (idempotent)
   * Automatically called when survey is removed from DOM (v3.0+)
   *
   * @example
   * ```typescript
   * const modal = new ModalSurvey(urlBuilder, {
   *   callbacks: {
   *     onDestroy: () => console.log('Cleaned up!')
   *   }
   * });
   *
   * // Manual cleanup
   * modal.destroy();
   *
   * // Or automatic cleanup when removed from DOM (v3.0+)
   * modal.modalContainer.remove(); // destroy() called automatically
   * ```
   *
   * @example
   * ```typescript
   * // SPA scenario - automatic cleanup prevents memory leaks
   * function showSurvey() {
   *   const survey = new InlineSurvey(urlBuilder, {
   *     elementSelector: '#survey-container'
   *   });
   * }
   *
   * function navigateAway() {
   *   document.getElementById('survey-container').remove();
   *   // No need to manually call destroy() - automatic in v3.0!
   * }
   * ```
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

  /**
   * Send message to survey iframe
   * Only available for iframe-based surveys (Modal, Inline)
   *
   * @param data - Data to send (must be JSON-serializable)
   * @param targetOrigin - Target origin for security (default: baseUrl)
   * @throws {Error} If survey doesn't have iframe or iframe not ready
   *
   * @example
   * ```typescript
   * // Simple message
   * survey.sendMessage({
   *   type: 'prefill',
   *   data: { email: 'user@example.com' }
   * });
   * ```
   *
   * @example
   * ```typescript
   * // Update survey context dynamically
   * function onUserAction(action) {
   *   survey.sendMessage({
   *     type: 'context_update',
   *     action: action,
   *     timestamp: Date.now()
   *   });
   * }
   * ```
   *
   * @example
   * ```typescript
   * // With custom origin for security
   * survey.sendMessage(
   *   { type: 'ping' },
   *   'https://custom-survey-domain.com'
   * );
   * ```
   */
  public sendMessage(data: unknown, targetOrigin?: string): void {
    if (!this.iFrameHandle) {
      throw new Error(
        '[Hello Customer SDK] This survey type does not support sendMessage (no iframe)',
      );
    }

    if (!this.iFrameHandle.contentWindow) {
      throw new Error(
        '[Hello Customer SDK] Iframe not ready for postMessage communication',
      );
    }

    const origin = targetOrigin || this.urlFactory!.getBaseUrlWithLanguage();
    this.iFrameHandle.contentWindow.postMessage(data, origin);
  }

  /**
   * Listen for messages from survey iframe
   * Only available for iframe-based surveys (Modal, Inline)
   * Automatically verifies message origin for security
   *
   * Note: Only one listener supported at a time (calling again replaces previous)
   * Automatically cleaned up when destroy() is called
   *
   * @param callback - Function to call when message received
   * @returns Cleanup function to stop listening
   *
   * @example
   * ```typescript
   * // Basic usage
   * const cleanup = survey.onMessage((data) => {
   *   if (data.type === 'survey_completed') {
   *     console.log('Survey completed!');
   *   }
   * });
   *
   * // Later, clean up
   * cleanup();
   * ```
   *
   * @example
   * ```typescript
   * // Google Tag Manager integration
   * survey.onMessage((data) => {
   *   window.dataLayer = window.dataLayer || [];
   *
   *   if (data.type === 'question_answered') {
   *     window.dataLayer.push({
   *       event: 'survey_question_answered',
   *       questionId: data.questionId,
   *       answer: data.answer
   *     });
   *   }
   *
   *   if (data.type === 'survey_submitted') {
   *     window.dataLayer.push({
   *       event: 'survey_completed',
   *       surveyId: data.surveyId
   *     });
   *   }
   * });
   * ```
   *
   * @example
   * ```typescript
   * // Advanced analytics with response tracking
   * const analytics = {
   *   questionViews: {},
   *   responses: {},
   *   startTime: Date.now()
   * };
   *
   * survey.onMessage((data) => {
   *   switch (data.type) {
   *     case 'question_shown':
   *       analytics.questionViews[data.questionId] = Date.now();
   *       break;
   *
   *     case 'question_answered':
   *       analytics.responses[data.questionId] = {
   *         answer: data.answer,
   *         timeSpent: Date.now() - analytics.questionViews[data.questionId]
   *       };
   *       break;
   *
   *     case 'survey_submitted':
   *       const totalTime = Date.now() - analytics.startTime;
   *       console.log('Survey analytics:', { ...analytics, totalTime });
   *       // Send to your analytics service
   *       break;
   *   }
   * });
   * ```
   */
  public onMessage(callback: (data: unknown) => void): () => void {
    if (!this.iFrameHandle) {
      throw new Error(
        '[Hello Customer SDK] This survey type does not support onMessage (no iframe)',
      );
    }

    this.messageHandler = callback;

    const handler = (event: MessageEvent) => {
      // Verify origin for security
      const expectedOrigin = new URL(this.urlFactory!.getBaseUrlWithLanguage())
        .origin;

      if (event.origin !== expectedOrigin) {
        console.warn(
          `[Hello Customer SDK] Rejected postMessage from unexpected origin: ${event.origin}`,
        );
        return;
      }

      if (this.messageHandler) {
        this.messageHandler(event.data);
      }
    };

    this.messageEventListener = handler;
    window.addEventListener('message', handler);

    // Return cleanup function
    return () => {
      if (this.messageEventListener) {
        window.removeEventListener('message', this.messageEventListener);
        this.messageEventListener = null;
      }
      this.messageHandler = null;
    };
  }

  /**
   * Update survey configuration and reload iframe automatically
   * Only available for iframe-based surveys (Modal, Inline)
   * Convenience method that combines updateUrlConfig() and reload()
   *
   * @param patch - Partial config to merge with existing
   *
   * @example
   * ```typescript
   * // Update metadata when user logs in
   * survey.updateAndReload({
   *   extra: {
   *     respondent: { id: user.id, email: user.email }
   *   }
   * });
   * ```
   *
   * @example
   * ```typescript
   * // SPA scenario - update context as user navigates
   * const survey = new InlineSurvey(urlBuilder, {
   *   elementSelector: '#feedback-widget'
   * });
   *
   * // User logs in
   * authService.onLogin((user) => {
   *   survey.updateAndReload({
   *     extra: {
   *       respondent: {
   *         id: user.id,
   *         email: user.email,
   *         name: user.name
   *       }
   *     }
   *   });
   * });
   *
   * // User navigates to different page
   * router.onNavigate((route) => {
   *   survey.updateAndReload({
   *     extra: {
   *       metadata: {
   *         currentPage: route.path,
   *         previousPage: route.from
   *       }
   *     }
   *   });
   * });
   * ```
   *
   * @example
   * ```typescript
   * // Dynamic language switching
   * function changeLanguage(newLang) {
   *   survey.updateAndReload({
   *     language: newLang
   *   });
   * }
   * ```
   */
  public updateAndReload(patch: Record<string, unknown>): void {
    this.updateUrlConfig(patch);

    // Call reload() if it exists (ModalSurvey and InlineSurvey have it)
    const self = this as { reload?: () => void };
    if (typeof self.reload === 'function') {
      self.reload();
    } else {
      console.warn(
        '[Hello Customer SDK] updateAndReload not supported for this survey type (no reload method)',
      );
    }
  }

  /**
   * Clean up PostMessage listeners
   * Should be called by child classes in their destroy() method
   * @protected
   */
  protected cleanupMessageHandlers(): void {
    if (this.messageEventListener) {
      window.removeEventListener('message', this.messageEventListener);
      this.messageEventListener = null;
    }
    this.messageHandler = null;
  }

  /**
   * Add event listener and track it for cleanup
   * All tracked listeners will be automatically removed when cleanupEventListeners() is called
   *
   * @param element - Element to attach listener to (HTMLElement, Window, or Document)
   * @param event - Event name (e.g., 'click', 'keydown')
   * @param handler - Event handler function
   * @protected
   *
   * @example
   * ```typescript
   * this.addTrackedListener(button, 'click', () => this.handleClick());
   * this.addTrackedListener(window, 'keydown', (e) => this.handleKeyDown(e));
   * ```
   */
  protected addTrackedListener(
    element: HTMLElement | Window | Document,
    event: string,
    handler: EventListener,
  ): void {
    element.addEventListener(event, handler);
    this.eventListeners.push({ element, event, handler });
  }

  /**
   * Clean up all tracked event listeners
   * Should be called by child classes in their destroy() method
   * @protected
   */
  protected cleanupEventListeners(): void {
    this.eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.eventListeners = [];
  }
}
