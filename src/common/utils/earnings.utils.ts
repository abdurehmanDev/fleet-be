import { IDriverEarningsBreakdown, ICompanyEarningsBreakdown } from '../interfaces';

/**
 * Calculate driver total_amount from earnings breakdown
 * Formula: total_amount = weekly_earning - cash - tax + toll - rent - uber_subscription + adjustment - other
 */
export function calculateDriverTotalAmount(breakdown: Omit<IDriverEarningsBreakdown, 'total_amount'>): number {
  const total =
    breakdown.weekly_earning
    - breakdown.cash
    - breakdown.tax
    + breakdown.toll
    - breakdown.rent
    - breakdown.uber_subscription
    + breakdown.adjustment
    - breakdown.other;

  return Math.round(total * 100) / 100;
}

/**
 * Calculate company earnings
 * Formula: owner_earning = total_company_earning - total_driver_payouts
 */
export function calculateCompanyEarnings(
  totalCompanyEarning: number,
  totalDriverPayouts: number
): ICompanyEarningsBreakdown {
  const ownerEarning = Math.round((totalCompanyEarning - totalDriverPayouts) * 100) / 100;

  return {
    total_company_earning: totalCompanyEarning,
    total_driver_payouts: totalDriverPayouts,
    owner_earning: ownerEarning,
  };
}

/**
 * Format currency in INR
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Generate WhatsApp share payload for driver earnings
 */
export function generateWhatsAppPayload(
  driverName: string,
  weekLabel: string,
  breakdown: IDriverEarningsBreakdown
): string {
  const lines = [
    `📊 *Driver Earnings Bill*`,
    `👤 Driver: ${driverName}`,
    `📅 Week: ${weekLabel}`,
    ``,
    `💰 Weekly Earning: ₹${breakdown.weekly_earning}`,
    `💵 Cash: ₹${breakdown.cash}`,
    `🏛️ Tax: ₹${breakdown.tax}`,
    `🛣️ Toll: ₹${breakdown.toll}`,
    `🏠 Rent: ₹${breakdown.rent}`,
    `📱 Uber Subscription: ₹${breakdown.uber_subscription}`,
    `⚖️ Adjustment: ₹${breakdown.adjustment}`,
    `📋 Other: ₹${breakdown.other}`,
    ``,
    `✅ *Total Amount: ₹${breakdown.total_amount}*`,
  ];

  return lines.join('\n');
}
