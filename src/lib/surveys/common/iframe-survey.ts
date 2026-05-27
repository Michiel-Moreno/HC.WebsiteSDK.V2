import { BaseSurvey } from './base-survey';
import { IframeSurveyConfig } from './iframe-survey-config.interface';
import { StatusMessage } from './survey-status.interface';

/**
 * Internal shape of an `hc:selected` message from the survey iframe.
 * Core fields are always present; the rest are question-type specific.
 * @internal
 */
interface SelectedMessage {
  type: 'hc:selected';
  questionType: string;
  questionId: string;
  questionIndex: number;
  pageIndex: number;
  timestamp: number;
  score?: number;
  minScore?: number;
  maxScore?: number;
  value?: boolean;
  selectedCount?: number;
  hasText?: boolean;
  textLength?: number;
}

/**
 * Abstract base for iframe-embedded surveys (InlineSurvey, ModalSurvey).
 *
 * Centralizes the postMessage protocol shared by both survey types:
 * auto-height (`hc:resize`), status detection (`hc:status`), and the
 * analytics lifecycle events (`hc:completed`, `hc:pagechanged`,
 * `hc:selected`, `hc:firstinteraction`).
 *
 * Survey-type-specific behavior is provided via the overridable
 * {@link applyResizeHeight} and {@link onSurveyCompleted} hooks.
 *
 * @category Surveys
 */
export abstract class IframeSurvey<
  TConfig extends IframeSurveyConfig,
> extends BaseSurvey<TConfig> {
  protected statusReceived = false;
  protected statusTimeoutId?: ReturnType<typeof setTimeout>;
  protected internalMessageHandler?: (event: MessageEvent) => void;

  /**
   * Resolve the expected origin of the survey iframe for security checks.
   * Returns null if the base URL cannot be parsed (in which case messages
   * are ignored rather than throwing during setup).
   * @protected
   */
  protected getExpectedOrigin(): string | null {
    try {
      return new URL(this.urlFactory!.getBaseUrlWithLanguage()).origin;
    } catch {
      console.warn(
        '[Hello Customer SDK] Could not determine survey origin; ' +
          'incoming messages will be ignored.',
      );
      return null;
    }
  }

  /**
   * Set up the internal message listener for auto-height, status detection,
   * and analytics lifecycle events. Uses a listener separate from
   * `onMessage()` to avoid conflicts with external usage.
   * @protected
   */
  protected setupMessageListener(): void {
    const expectedOrigin = this.getExpectedOrigin();

    this.internalMessageHandler = (event: MessageEvent) => {
      // Verify origin for security
      if (!expectedOrigin || event.origin !== expectedOrigin) {
        return;
      }

      // Verify message is from this survey's iframe (not another iframe on the page)
      // Only check if source is defined (JSDOM in tests doesn't set source)
      if (event.source && event.source !== this.iFrameHandle?.contentWindow) {
        return;
      }

      const data = event.data;

      // Handle auto-height resize messages
      if (this.config.autoHeight && this.isResizeMessage(data)) {
        const constrainedHeight = this.applyHeightConstraints(data.height);
        this.applyResizeHeight(constrainedHeight);
      }

      // Handle status messages
      if (this.isStatusMessage(data)) {
        this.handleStatusMessage(data);
      }

      // Handle completed messages
      if (this.isCompletedMessage(data)) {
        this.config.callbacks?.onCompleted?.({
          timestamp: data.timestamp,
        });
        this.onSurveyCompleted();
      }

      // Handle page changed messages
      if (this.isPageChangedMessage(data)) {
        this.config.callbacks?.onPageChanged?.({
          currentPage: data.currentPage,
          totalPages: data.totalPages,
          timestamp: data.timestamp,
        });
      }

      // Handle selected messages
      if (this.isSelectedMessage(data)) {
        this.config.callbacks?.onSelected?.({
          questionType: data.questionType,
          questionId: data.questionId,
          questionIndex: data.questionIndex,
          pageIndex: data.pageIndex,
          timestamp: data.timestamp,
          score: data.score,
          minScore: data.minScore,
          maxScore: data.maxScore,
          value: data.value,
          selectedCount: data.selectedCount,
          hasText: data.hasText,
          textLength: data.textLength,
        });
      }

      // Handle first interaction messages
      if (this.isFirstInteractionMessage(data)) {
        this.config.callbacks?.onFirstInteraction?.({
          questionType: data.questionType,
          timestamp: data.timestamp,
        });
      }
    };

    window.addEventListener('message', this.internalMessageHandler);

    // Setup timeout for surveys that don't respond with status
    const timeout = this.config.statusTimeout ?? 10000;
    if (timeout > 0) {
      this.statusTimeoutId = setTimeout(() => {
        if (!this.statusReceived) {
          this.config.callbacks?.onSurveyStatus?.({
            status: 'timeout',
            reason: 'no_response',
            message: 'Survey did not respond within timeout period',
          });
        }
      }, timeout);
    }
  }

  /**
   * Apply the constrained height to the survey iframe.
   * Override to apply additional survey-type-specific sizing (e.g. modal wrapper).
   * @protected
   */
  protected applyResizeHeight(constrainedHeight: number): void {
    this.iFrameHandle!.style.height = `${constrainedHeight}px`;
  }

  /**
   * Hook invoked after the `onCompleted` callback fires.
   * Default is a no-op; ModalSurvey overrides it for `autoCloseOnComplete`.
   * @protected
   */
  protected onSurveyCompleted(): void {
    // no-op by default
  }

  /**
   * Apply min/max height constraints to the given height.
   * @protected
   */
  protected applyHeightConstraints(height: number): number {
    let result = height;

    if (this.config.minHeight !== undefined) {
      result = Math.max(result, this.config.minHeight);
    }

    if (this.config.maxHeight !== undefined) {
      result = Math.min(result, this.config.maxHeight);
    }

    return result;
  }

  /**
   * Handle an incoming status message from the survey iframe.
   * @protected
   */
  protected handleStatusMessage(message: StatusMessage): void {
    this.statusReceived = true;

    // Clear the timeout since we received a response
    if (this.statusTimeoutId) {
      clearTimeout(this.statusTimeoutId);
      this.statusTimeoutId = undefined;
    }

    this.config.callbacks?.onSurveyStatus?.({
      status: message.status,
      reason: message.reason,
      message: message.message,
    });
  }

  /**
   * Tear down the internal message listener and pending status timeout.
   * Should be called from the subclass `destroy()`.
   * @protected
   */
  protected cleanupIframeMessageListener(): void {
    if (this.statusTimeoutId) {
      clearTimeout(this.statusTimeoutId);
      this.statusTimeoutId = undefined;
    }

    if (this.internalMessageHandler) {
      window.removeEventListener('message', this.internalMessageHandler);
      this.internalMessageHandler = undefined;
    }
  }

  /** @protected */
  protected isResizeMessage(
    data: unknown,
  ): data is { type: string; height: number } {
    return (
      typeof data === 'object' &&
      data !== null &&
      'type' in data &&
      (data as { type: string }).type === 'hc:resize' &&
      'height' in data &&
      typeof (data as { height: number }).height === 'number'
    );
  }

  /** @protected */
  protected isStatusMessage(data: unknown): data is StatusMessage {
    return (
      typeof data === 'object' &&
      data !== null &&
      'type' in data &&
      (data as StatusMessage).type === 'hc:status' &&
      'status' in data &&
      typeof (data as StatusMessage).status === 'string'
    );
  }

  /** @protected */
  protected isCompletedMessage(
    data: unknown,
  ): data is { type: 'hc:completed'; timestamp: number } {
    const d = data as Record<string, unknown>;
    return (
      typeof data === 'object' &&
      data !== null &&
      d.type === 'hc:completed' &&
      typeof d.timestamp === 'number'
    );
  }

  /** @protected */
  protected isPageChangedMessage(data: unknown): data is {
    type: 'hc:pagechanged';
    currentPage: number;
    totalPages: number;
    timestamp: number;
  } {
    const d = data as Record<string, unknown>;
    return (
      typeof data === 'object' &&
      data !== null &&
      d.type === 'hc:pagechanged' &&
      typeof d.currentPage === 'number' &&
      typeof d.totalPages === 'number' &&
      typeof d.timestamp === 'number'
    );
  }

  /** @protected */
  protected isSelectedMessage(data: unknown): data is SelectedMessage {
    const d = data as Record<string, unknown>;
    return (
      typeof data === 'object' &&
      data !== null &&
      d.type === 'hc:selected' &&
      typeof d.questionType === 'string' &&
      typeof d.questionId === 'string' &&
      typeof d.questionIndex === 'number' &&
      typeof d.pageIndex === 'number' &&
      typeof d.timestamp === 'number'
    );
  }

  /** @protected */
  protected isFirstInteractionMessage(data: unknown): data is {
    type: 'hc:firstinteraction';
    questionType: string;
    timestamp: number;
  } {
    const d = data as Record<string, unknown>;
    return (
      typeof data === 'object' &&
      data !== null &&
      d.type === 'hc:firstinteraction' &&
      typeof d.questionType === 'string' &&
      typeof d.timestamp === 'number'
    );
  }
}
