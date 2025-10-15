import { SurveyQuarantineConfig } from './survey-quarantine-config.interface';

export class QuarantineService {
  private static quarantineStartKey = 'hcSDK.SurveyQuarantineStart';
  private static daysToMillisecondsMultiplier = 24 * 60 * 60 * 1000;

  constructor(
    private surveyIdentifier: string,
    private quarantineConfig?: SurveyQuarantineConfig,
  ) {}

  isUnderQuarantine(): boolean {
    // verify quarantine only when its config is provided
    if (this.quarantineConfig) {
      const quarantineStartData = this.getQuarantineStartData();
      const quarantineStart = quarantineStartData
        ? parseInt(quarantineStartData)
        : null;

      return (
        !!quarantineStart &&
        quarantineStart +
          this.quarantineConfig.period *
            QuarantineService.daysToMillisecondsMultiplier >
          Date.now()
      );
    }
    // no config - quarantine inactive
    return false;
  }

  startQuarantine(): void {
    if (this.quarantineConfig) {
      this.setQuarantineStartData(Date.now().toString());
    }
  }

  private getQuarantineStartData(): string | null {
    return localStorage.getItem(
      `${QuarantineService.quarantineStartKey}:${this.surveyIdentifier}`,
    );
  }

  private setQuarantineStartData(data: string): void {
    localStorage.setItem(
      `${QuarantineService.quarantineStartKey}:${this.surveyIdentifier}`,
      data,
    );
  }
}
