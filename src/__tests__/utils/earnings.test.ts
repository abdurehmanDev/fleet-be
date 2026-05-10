import { describe, it, expect } from '@jest/globals';
import { calculateDriverTotalAmount, calculateCompanyEarnings, formatINR } from '../../common/utils/earnings.utils';

describe('Earnings Utils', () => {
  it('calculateDriverTotalAmount - should calculate correctly', () => {
    const result = calculateDriverTotalAmount({
      weekly_earning: 5000,
      cash: 500,
      tax: -200,
      toll: -100,
      rent: -1500,
      uber_subscription: -300,
      adjustment: 100,
      other: 0,
    });
    expect(result).toBe(3500);
  });

  it('calculateCompanyEarnings - should calculate owner earning', () => {
    const result = calculateCompanyEarnings(10000, 7000);
    expect(result.total_company_earning).toBe(10000);
    expect(result.total_driver_payouts).toBe(7000);
    expect(result.owner_earning).toBe(3000);
  });

  it('formatINR - should format amount in INR', () => {
    const result = formatINR(5000);
    expect(result).toContain('5000');
  });
});
