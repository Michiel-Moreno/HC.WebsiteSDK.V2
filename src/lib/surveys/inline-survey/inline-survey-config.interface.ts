import { BaseSurveyConfig } from '../common/base-survey-config.interface';

export interface InlineSurveyConfig extends BaseSurveyConfig {
  elementSelector: string;
  fillContainer?: boolean;
  iFrameCssClasses?: string[];
  iFrameInlineStylesRules?: Partial<CSSStyleDeclaration>;
}
