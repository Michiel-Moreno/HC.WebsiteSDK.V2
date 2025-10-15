import { BaseSurveyConfig } from '../common/base-survey-config.interface';

export interface WindowSurveyConfig extends BaseSurveyConfig {
  /**
   * Specifies if the survey should be open in a new window
   *
   * @default false
   */
  openNewWindow?: boolean;
  /**
   * @default false
   */
  openOnCreation?: boolean;
}
