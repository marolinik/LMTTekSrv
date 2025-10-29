// PSU requirements based on GPU count
// Each GPU requires ~650W
// PSU mapping:
// 1-2 GPUs (650-1300W) → 2 PSU (4000W total)
// 3-4 GPUs (1950-2600W) → 3 PSU (6000W total)
// 5-6 GPUs (3250-3900W) → 4 PSU (8000W total)
// 7-8 GPUs (4550-5200W) → 5 PSU (10000W total)
export const getMinimumPSUCount = (gpuCount: number): number => {
  if (gpuCount <= 2) return 2;
  if (gpuCount <= 4) return 3;
  if (gpuCount <= 6) return 4;
  return 5; // 7-8 GPUs
};

// Get the total wattage requirement for GPU count
export const getGPUWattage = (gpuCount: number): number => {
  return gpuCount * 650;
};

// Get the total PSU wattage for PSU count
export const getPSUWattage = (psuCount: number): number => {
  return psuCount * 2000; // Each PSU is 2000W
};

export const isPSUValid = (gpuCount: number, psuCount: number): boolean => {
  const minPSU = getMinimumPSUCount(gpuCount);
  return psuCount >= minPSU;
};

// Extract PSU count from model name (e.g., "2x Redundant" -> 2, "1x PSU" -> 1)
export const extractPSUCount = (psuModel: string): number => {
  const match = psuModel.match(/^(\d+)x/);
  return match ? parseInt(match[1]) : 1;
};
