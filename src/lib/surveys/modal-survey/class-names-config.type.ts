import { ModalSurveyStyleConfig } from './modal-survey-style-config.interface';

export type ClassNamesConfigType = {
  [P in keyof ModalSurveyStyleConfig as P extends `${string}HoverStyle`
    ? never
    : P]: string;
};
