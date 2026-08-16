export const MODEL_VERSION = 'shower-water-v0.1.0';

function assertPositiveNumber(value, fieldName) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new TypeError(`${fieldName} must be a positive number.`);
  }
}

export function estimateReducedShowerWater({
  minutesReduced,
  flowRateMinLpm,
  flowRateMaxLpm,
}) {
  assertPositiveNumber(minutesReduced, 'minutesReduced');
  assertPositiveNumber(flowRateMinLpm, 'flowRateMinLpm');
  assertPositiveNumber(flowRateMaxLpm, 'flowRateMaxLpm');

  if (flowRateMinLpm > flowRateMaxLpm) {
    throw new RangeError('flowRateMinLpm cannot exceed flowRateMaxLpm.');
  }

  return {
    rawMinLiters: minutesReduced * flowRateMinLpm,
    rawMaxLiters: minutesReduced * flowRateMaxLpm,
    modelVersion: MODEL_VERSION,
  };
}

export function estimateDrinkingWaterPersonDays({
  waterMinLiters,
  waterMaxLiters,
  litersPerPersonDay,
}) {
  assertPositiveNumber(waterMinLiters, 'waterMinLiters');
  assertPositiveNumber(waterMaxLiters, 'waterMaxLiters');
  assertPositiveNumber(litersPerPersonDay, 'litersPerPersonDay');

  if (waterMinLiters > waterMaxLiters) {
    throw new RangeError('waterMinLiters cannot exceed waterMaxLiters.');
  }

  return {
    minPersonDays: waterMinLiters / litersPerPersonDay,
    maxPersonDays: waterMaxLiters / litersPerPersonDay,
  };
}

export function roundRange(minValue, maxValue, precision = 0) {
  if (!Number.isFinite(minValue) || !Number.isFinite(maxValue)) {
    throw new TypeError('Range values must be finite numbers.');
  }

  const factor = 10 ** precision;
  return {
    min: Math.round(minValue * factor) / factor,
    max: Math.round(maxValue * factor) / factor,
  };
}

export function formatRangeHu(minValue, maxValue, unit = '') {
  const formatter = new Intl.NumberFormat('hu-HU', {
    maximumFractionDigits: Number.isInteger(minValue) && Number.isInteger(maxValue) ? 0 : 1,
  });
  const suffix = unit ? ` ${unit}` : '';

  if (minValue === maxValue) {
    return `${formatter.format(minValue)}${suffix}`;
  }

  return `${formatter.format(minValue)}–${formatter.format(maxValue)}${suffix}`;
}
