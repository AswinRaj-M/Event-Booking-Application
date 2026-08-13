export const DEFAULT_PLATFORM_COMMISSION_PERCENTAGE = 10;


export const getPlatformCommissionRate = () => {
  const envValue = parseFloat(process.env.PLATFORM_COMMISSION_PERCENTAGE);
  if (!isNaN(envValue) && envValue >= 0 && envValue <= 100) {
    return envValue;
  }
  return DEFAULT_PLATFORM_COMMISSION_PERCENTAGE;
};
