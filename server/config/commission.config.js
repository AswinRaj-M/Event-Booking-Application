export const DEFAULT_PLATFORM_COMMISSION_PERCENTAGE = 10;

/**
 * Reusable helper to retrieve platform commission percentage.
 * Can be configured via environment variable or system settings.
 */
export const getPlatformCommissionRate = () => {
  const envValue = parseFloat(process.env.PLATFORM_COMMISSION_PERCENTAGE);
  if (!isNaN(envValue) && envValue >= 0 && envValue <= 100) {
    return envValue;
  }
  return DEFAULT_PLATFORM_COMMISSION_PERCENTAGE;
};
