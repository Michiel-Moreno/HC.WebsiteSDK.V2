import { BaseException } from '../../core/exceptions/base.exception';

import { SurveyStatusEvent } from './survey-status.interface';

/**
 * Event passed to onCompleted callback when survey is submitted
 *
 * @category Surveys
 */
export interface SurveyCompletedEvent {
  /**
   * Timestamp when survey was completed (milliseconds since epoch)
   */
  timestamp: number;
}

/**
 * Event passed to onPageChanged callback when user navigates between pages
 *
 * @category Surveys
 */
export interface SurveyPageChangedEvent {
  /**
   * Current page number (1-indexed)
   */
  currentPage: number;

  /**
   * Total number of pages in the survey
   */
  totalPages: number;

  /**
   * Timestamp when page changed (milliseconds since epoch)
   */
  timestamp: number;
}

/**
 * Event passed to onSelected callback when user selects/changes an answer
 *
 * Note: This event fires in real-time before survey submission.
 * It provides metadata only - no actual answer content for privacy.
 *
 * @category Surveys
 */
export interface SurveySelectedEvent {
  /**
   * Type of question answered
   */
  questionType: string;

  /**
   * Unique identifier for the question
   */
  questionId: string;

  /**
   * Index of the question within the survey (0-indexed)
   */
  questionIndex: number;

  /**
   * Index of the page containing the question (0-indexed)
   */
  pageIndex: number;

  /**
   * Timestamp when selection was made (milliseconds since epoch)
   */
  timestamp: number;
}

/**
 * Event passed to onFirstInteraction callback when user first engages with survey
 *
 * @category Surveys
 */
export interface SurveyFirstInteractionEvent {
  /**
   * Type of question that received first interaction
   */
  questionType: string;

  /**
   * Timestamp of first interaction (milliseconds since epoch)
   */
  timestamp: number;
}

/**
 * Lifecycle event callbacks for surveys
 * All callbacks are optional and can be used for analytics, logging, and custom behavior integration
 *
 * @category Surveys
 */
export interface SurveyCallbacks {
  /**
   * Called when survey is shown to user
   */
  onShow?: () => void;

  /**
   * Called when survey is hidden (but not destroyed)
   * Note: Only applicable to InlineSurvey and ButtonTriggerSurvey
   */
  onHide?: () => void;

  /**
   * Called when survey is closed
   * Note: Only applicable to ModalSurvey and WindowSurvey
   */
  onClose?: () => void;

  /**
   * Called when iframe has loaded successfully
   * Note: Only applicable to InlineSurvey and ModalSurvey (surveys with iframes)
   * @param iframe - The HTMLIFrameElement that loaded
   */
  onLoad?: (iframe: HTMLIFrameElement) => void;

  /**
   * Called when iframe fails to load or when window popup is blocked
   * @param error - Error describing the failure
   */
  onError?: (error: Error | BaseException) => void;

  /**
   * Called when survey is completely destroyed and removed from DOM
   */
  onDestroy?: () => void;

  /**
   * Called when survey was blocked by quarantine
   * @param remainingDays - Days remaining in quarantine period
   */
  onQuarantineBlocked?: (remainingDays: number) => void;

  /**
   * Called when survey status changes (ready, unavailable, timeout, error)
   * Note: Only applicable to InlineSurvey and ModalSurvey (surveys with iframes)
   *
   * Use this callback to detect when a survey is deactivated or unavailable,
   * allowing graceful handling (hide container, show fallback, etc.)
   *
   * @param event - Status event with details about the survey state
   *
   * @example
   * ```typescript
   * callbacks: {
   *   onSurveyStatus: (event) => {
   *     if (event.status === 'ready') {
   *       console.log('Survey is ready');
   *     } else if (event.status === 'unavailable') {
   *       document.querySelector('#survey-container').style.display = 'none';
   *       console.warn(`Survey unavailable: ${event.reason}`);
   *     }
   *   }
   * }
   * ```
   */
  onSurveyStatus?: (event: SurveyStatusEvent) => void;

  /**
   * Called when survey is successfully submitted
   * Note: Only applicable to InlineSurvey and ModalSurvey (surveys with iframes)
   *
   * @param event - Completed event with timestamp
   *
   * @example
   * ```typescript
   * callbacks: {
   *   onCompleted: (event) => {
   *     console.log('Survey completed at', new Date(event.timestamp));
   *     // Close modal, track conversion, etc.
   *   }
   * }
   * ```
   */
  onCompleted?: (event: SurveyCompletedEvent) => void;

  /**
   * Called when user navigates between pages in a multi-page survey
   * Note: Only applicable to InlineSurvey and ModalSurvey (surveys with iframes)
   *
   * @param event - Page change event with current/total page info
   *
   * @example
   * ```typescript
   * callbacks: {
   *   onPageChanged: (event) => {
   *     console.log(`Page ${event.currentPage} of ${event.totalPages}`);
   *   }
   * }
   * ```
   */
  onPageChanged?: (event: SurveyPageChangedEvent) => void;

  /**
   * Called when user selects or changes an answer (fires in real-time)
   * Note: Only applicable to InlineSurvey and ModalSurvey (surveys with iframes)
   *
   * This fires immediately on user interaction, before survey submission.
   * Can fire multiple times if user changes their answer.
   * Provides metadata only - no actual answer content for privacy.
   *
   * @param event - Selection event with question metadata
   *
   * @example
   * ```typescript
   * callbacks: {
   *   onSelected: (event) => {
   *     analytics.track('question_answered', {
   *       questionType: event.questionType,
   *       questionIndex: event.questionIndex
   *     });
   *   }
   * }
   * ```
   */
  onSelected?: (event: SurveySelectedEvent) => void;

  /**
   * Called once when user first interacts with the survey
   * Note: Only applicable to InlineSurvey and ModalSurvey (surveys with iframes)
   *
   * Useful for engagement tracking - fires only once per survey session.
   *
   * @param event - First interaction event with question type
   *
   * @example
   * ```typescript
   * callbacks: {
   *   onFirstInteraction: (event) => {
   *     analytics.track('survey_engagement_started');
   *   }
   * }
   * ```
   */
  onFirstInteraction?: (event: SurveyFirstInteractionEvent) => void;
}
