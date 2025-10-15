import { SurveyCallbacks } from './survey-callbacks.interface';
import { SurveyQuarantineConfig } from './survey-quarantine-config.interface';

/**
 * Base config interface for all surveys
 * Contains common configuration shared across all survey types
 *
 * @category Surveys
 */
export interface BaseSurveyConfig {
  /**
   * Quarantine configuration to prevent survey from showing too frequently
   */
  quarantineConfig?: SurveyQuarantineConfig;

  /**
   * Lifecycle event callbacks
   */
  callbacks?: SurveyCallbacks;
}
