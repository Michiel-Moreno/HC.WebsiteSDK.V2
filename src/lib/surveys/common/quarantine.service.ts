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
        ? parseInt(quarantineStartData, 10)
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
      ? parseInt(quarantineStartData, 10)
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

  /**
   * Get detailed quarantine status
   * @returns Object with isQuarantined flag and remaining days
   */
  getQuarantineStatus(): { isQuarantined: boolean; remainingDays: number } {
    const isQuarantined = this.isUnderQuarantine();
    const remainingDays = isQuarantined ? this.getRemainingDays() : 0;

    return {
      isQuarantined,
      remainingDays,
    };
  }

  /**
   * Manually clear quarantine
   * Removes quarantine start data from localStorage
   */
  clearQuarantine(): void {
    if (this.quarantineConfig) {
      this.safeStorageOp(() => localStorage.removeItem(this.storageKey()));
    }
  }

  private storageKey(): string {
    return `${QuarantineService.quarantineStartKey}:${this.surveyIdentifier}`;
  }

  private getQuarantineStartData(): string | null {
    return this.safeStorageOp(() => localStorage.getItem(this.storageKey()));
  }

  private setQuarantineStartData(data: string): void {
    this.safeStorageOp(() => localStorage.setItem(this.storageKey(), data));
  }

  /**
   * Run a localStorage operation, swallowing access errors.
   *
   * localStorage throws (SecurityError) when storage is blocked — e.g. Safari
   * private mode, cross-origin iframes with restricted storage access, or when
   * the user has disabled cookies/site data. In those contexts quarantine
   * simply degrades to inactive rather than breaking survey display.
   */
  private safeStorageOp<T>(op: () => T): T | null {
    try {
      return op();
    } catch {
      return null;
    }
  }
}
