import { IframeSurveyConfig } from '../common/iframe-survey-config.interface';

export interface InlineSurveyConfig extends IframeSurveyConfig {
  elementSelector: string;
  fillContainer?: boolean;
  iFrameCssClasses?: string[];
  iFrameInlineStylesRules?: Partial<CSSStyleDeclaration>;
}
