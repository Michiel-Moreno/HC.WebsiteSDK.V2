import { BaseSurveyConfig } from '../common/base-survey-config.interface';

export interface WindowSurveyConfig extends BaseSurveyConfig {
  /**
   * Controls how the survey window opens:
   *
   * - `true`: Opens as a **popup window** (separate OS window with dimensions: 800x700px, no toolbar/menubar)
   * - `false`: Opens as a **new browser tab** (default browser behavior)
   *
   * **Note**: When `true`, popup blockers may prevent the window from opening. Use the `onError` callback
   * to handle popup blocker scenarios gracefully.
   *
   * @default false
   *
   * @example
   * // Open as popup window
   * { openNewWindow: true }
   *
   * @example
   * // Open as new tab (default)
   * { openNewWindow: false }
   */
  openNewWindow?: boolean;

  /**
   * Automatically opens the survey when the WindowSurvey instance is created.
   *
   * - `true`: Survey opens immediately upon creation (no need to call `show()`)
   * - `false`: Survey only opens when `show()` is called manually
   *
   * @default false
   */
  openOnCreation?: boolean;
}
