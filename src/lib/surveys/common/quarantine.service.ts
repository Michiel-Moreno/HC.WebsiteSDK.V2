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

  getRemainingDays(): number {
    // Return 0 if no quarantine config
    if (!this.quarantineConfig) {
      return 0;
    }

    const quarantineStartData = this.getQuarantineStartData();
    const quarantineStart = quarantineStartData
      ? parseInt(quarantineStartData)
      : null;

    // Return 0 if no quarantine start time or invalid data
    if (!quarantineStart || isNaN(quarantineStart)) {
      return 0;
    }

    const quarantineEndTime =
      quarantineStart +
      this.quarantineConfig.period *
        QuarantineService.daysToMillisecondsMultiplier;
    const now = Date.now();

    // Return 0 if quarantine has expired
    if (quarantineEndTime <= now) {
      return 0;
    }

    // Calculate remaining milliseconds and convert to days, rounding up
    const remainingMilliseconds = quarantineEndTime - now;
    const remainingDays =
      remainingMilliseconds / QuarantineService.daysToMillisecondsMultiplier;

    return Math.ceil(remainingDays);
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
