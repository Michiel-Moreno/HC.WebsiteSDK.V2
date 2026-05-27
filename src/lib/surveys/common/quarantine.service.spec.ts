import { QuarantineService } from './quarantine.service';
import { SurveyQuarantineConfig } from './survey-quarantine-config.interface';

describe('QuarantineService', () => {
  const surveyIdentifier = 'test-survey-123';
  const quarantineKey = `hcSDK.SurveyQuarantineStart:${surveyIdentifier}`;

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('getRemainingDays', () => {
    it('should return 0 when no quarantine config is provided', () => {
      const service = new QuarantineService(surveyIdentifier);
      expect(service.getRemainingDays()).toBe(0);
    });

    it('should return 0 when quarantine config is undefined', () => {
      const service = new QuarantineService(surveyIdentifier, undefined);
      expect(service.getRemainingDays()).toBe(0);
    });

    it('should return 0 when no quarantine start data exists in localStorage', () => {
      const config: SurveyQuarantineConfig = { period: 7 };
      const service = new QuarantineService(surveyIdentifier, config);
      expect(service.getRemainingDays()).toBe(0);
    });

    it('should return 0 when quarantine start data is invalid (NaN)', () => {
      const config: SurveyQuarantineConfig = { period: 7 };
      localStorage.setItem(quarantineKey, 'invalid-data');
      const service = new QuarantineService(surveyIdentifier, config);
      expect(service.getRemainingDays()).toBe(0);
    });

    it('should return 0 when quarantine has expired', () => {
      const config: SurveyQuarantineConfig = { period: 7 };
      // Set quarantine start to 8 days ago (expired)
      const eightDaysAgo = Date.now() - 8 * 24 * 60 * 60 * 1000;
      localStorage.setItem(quarantineKey, eightDaysAgo.toString());
      const service = new QuarantineService(surveyIdentifier, config);
      expect(service.getRemainingDays()).toBe(0);
    });

    it('should return correct remaining days when under active quarantine', () => {
      const config: SurveyQuarantineConfig = { period: 7 };
      // Set quarantine start to 2 days ago (5 days remaining)
      const twoDaysAgo = Date.now() - 2 * 24 * 60 * 60 * 1000;
      localStorage.setItem(quarantineKey, twoDaysAgo.toString());
      const service = new QuarantineService(surveyIdentifier, config);
      expect(service.getRemainingDays()).toBe(5);
    });

    it('should return correct remaining days for 14-day quarantine period', () => {
      const config: SurveyQuarantineConfig = { period: 14 };
      // Set quarantine start to 5 days ago (9 days remaining)
      const fiveDaysAgo = Date.now() - 5 * 24 * 60 * 60 * 1000;
      localStorage.setItem(quarantineKey, fiveDaysAgo.toString());
      const service = new QuarantineService(surveyIdentifier, config);
      expect(service.getRemainingDays()).toBe(9);
    });

    it('should round up remaining days using Math.ceil()', () => {
      const config: SurveyQuarantineConfig = { period: 7 };
      // Set quarantine start to 5.5 days ago (1.5 days remaining, should round to 2)
      const fiveAndHalfDaysAgo = Date.now() - 5.5 * 24 * 60 * 60 * 1000;
      localStorage.setItem(quarantineKey, fiveAndHalfDaysAgo.toString());
      const service = new QuarantineService(surveyIdentifier, config);
      expect(service.getRemainingDays()).toBe(2);
    });

    it('should return 1 when less than 1 day remains', () => {
      const config: SurveyQuarantineConfig = { period: 7 };
      // Set quarantine start to 6.5 days ago (0.5 days remaining, should round to 1)
      const sixAndHalfDaysAgo = Date.now() - 6.5 * 24 * 60 * 60 * 1000;
      localStorage.setItem(quarantineKey, sixAndHalfDaysAgo.toString());
      const service = new QuarantineService(surveyIdentifier, config);
      expect(service.getRemainingDays()).toBe(1);
    });

    it('should return 1 when just a few hours remain', () => {
      const config: SurveyQuarantineConfig = { period: 7 };
      // Set quarantine start to 6 days and 23 hours ago (1 hour remaining)
      const almostSevenDaysAgo = Date.now() - (7 * 24 - 1) * 60 * 60 * 1000;
      localStorage.setItem(quarantineKey, almostSevenDaysAgo.toString());
      const service = new QuarantineService(surveyIdentifier, config);
      expect(service.getRemainingDays()).toBe(1);
    });

    it('should return full period when quarantine just started', () => {
      const config: SurveyQuarantineConfig = { period: 7 };
      // Set quarantine start to now
      const now = Date.now();
      localStorage.setItem(quarantineKey, now.toString());
      const service = new QuarantineService(surveyIdentifier, config);
      // Should return 7 days since quarantine just started
      expect(service.getRemainingDays()).toBe(7);
    });

    it('should handle different survey identifiers independently', () => {
      const config: SurveyQuarantineConfig = { period: 7 };
      const twoDaysAgo = Date.now() - 2 * 24 * 60 * 60 * 1000;
      const fiveDaysAgo = Date.now() - 5 * 24 * 60 * 60 * 1000;

      // Set different quarantine times for different surveys
      localStorage.setItem(
        `hcSDK.SurveyQuarantineStart:survey-1`,
        twoDaysAgo.toString(),
      );
      localStorage.setItem(
        `hcSDK.SurveyQuarantineStart:survey-2`,
        fiveDaysAgo.toString(),
      );

      const service1 = new QuarantineService('survey-1', config);
      const service2 = new QuarantineService('survey-2', config);

      expect(service1.getRemainingDays()).toBe(5);
      expect(service2.getRemainingDays()).toBe(2);
    });
  });

  describe('Integration with isUnderQuarantine', () => {
    it('should return 0 when isUnderQuarantine returns false (expired)', () => {
      const config: SurveyQuarantineConfig = { period: 7 };
      const eightDaysAgo = Date.now() - 8 * 24 * 60 * 60 * 1000;
      localStorage.setItem(quarantineKey, eightDaysAgo.toString());
      const service = new QuarantineService(surveyIdentifier, config);

      expect(service.isUnderQuarantine()).toBe(false);
      expect(service.getRemainingDays()).toBe(0);
    });

    it('should return remaining days when isUnderQuarantine returns true', () => {
      const config: SurveyQuarantineConfig = { period: 7 };
      const twoDaysAgo = Date.now() - 2 * 24 * 60 * 60 * 1000;
      localStorage.setItem(quarantineKey, twoDaysAgo.toString());
      const service = new QuarantineService(surveyIdentifier, config);

      expect(service.isUnderQuarantine()).toBe(true);
      expect(service.getRemainingDays()).toBe(5);
    });
  });

  describe('localStorage unavailable (private mode / blocked storage)', () => {
    const config: SurveyQuarantineConfig = { period: 7 };
    let getItemSpy: jest.SpyInstance;
    let setItemSpy: jest.SpyInstance;
    let removeItemSpy: jest.SpyInstance;

    beforeEach(() => {
      const securityError = () => {
        throw new DOMException('storage blocked', 'SecurityError');
      };
      getItemSpy = jest
        .spyOn(Storage.prototype, 'getItem')
        .mockImplementation(securityError);
      setItemSpy = jest
        .spyOn(Storage.prototype, 'setItem')
        .mockImplementation(securityError);
      removeItemSpy = jest
        .spyOn(Storage.prototype, 'removeItem')
        .mockImplementation(securityError);
    });

    afterEach(() => {
      getItemSpy.mockRestore();
      setItemSpy.mockRestore();
      removeItemSpy.mockRestore();
    });

    it('does not throw and reports not quarantined when reads fail', () => {
      const service = new QuarantineService(surveyIdentifier, config);

      expect(() => service.isUnderQuarantine()).not.toThrow();
      expect(service.isUnderQuarantine()).toBe(false);
      expect(service.getRemainingDays()).toBe(0);
    });

    it('does not throw when starting quarantine fails to persist', () => {
      const service = new QuarantineService(surveyIdentifier, config);
      expect(() => service.startQuarantine()).not.toThrow();
    });

    it('does not throw when clearing quarantine fails', () => {
      const service = new QuarantineService(surveyIdentifier, config);
      expect(() => service.clearQuarantine()).not.toThrow();
    });
  });
});
