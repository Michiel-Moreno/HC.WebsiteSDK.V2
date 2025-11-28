/**
 * Possible survey status values reported via postMessage
 *
 * - `ready`: Survey loaded successfully and is interactive
 * - `unavailable`: Survey is not available (deactivated, quota exceeded, etc.)
 * - `timeout`: No status message received within the configured timeout
 * - `error`: Survey encountered an error during loading
 *
 * @category Surveys
 */
export type SurveyStatusType = 'ready' | 'unavailable' | 'timeout' | 'error';

/**
 * Status event passed to the onSurveyStatus callback
 *
 * @example
 * ```typescript
 * callbacks: {
 *   onSurveyStatus: (event) => {
 *     if (event.status === 'ready') {
 *       console.log('Survey ready!');
 *     } else {
 *       console.warn(`Survey ${event.status}: ${event.reason}`);
 *     }
 *   }
 * }
 * ```
 *
 * @category Surveys
 */
export interface SurveyStatusEvent {
  /**
   * The status of the survey
   */
  status: SurveyStatusType;

  /**
   * Machine-readable reason for the status
   * @example 'deactivated', 'quota_exceeded', 'not_found', 'access_denied', 'no_response'
   */
  reason?: string;

  /**
   * Human-readable description of the status
   */
  message?: string;
}

/**
 * PostMessage format for status messages sent from survey iframe
 * @internal
 */
export interface StatusMessage {
  type: 'hc:status';
  status: 'ready' | 'unavailable' | 'error';
  reason?: string;
  message?: string;
}
