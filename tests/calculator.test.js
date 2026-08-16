import test from 'node:test';
import assert from 'node:assert/strict';

import {
  estimateDrinkingWaterPersonDays,
  estimateReducedShowerWater,
  formatRangeHu,
  roundRange,
} from '../app/js/calculator.js';

test('two shorter minutes produce the documented V0 water range', () => {
  const result = estimateReducedShowerWater({
    minutesReduced: 2,
    flowRateMinLpm: 7.6,
    flowRateMaxLpm: 9.5,
  });

  assert.equal(result.rawMinLiters, 15.2);
  assert.equal(result.rawMaxLiters, 19);
  assert.equal(result.modelVersion, 'shower-water-v0.1.0');
});

test('one shorter minute produces the expected range', () => {
  const result = estimateReducedShowerWater({
    minutesReduced: 1,
    flowRateMinLpm: 7.6,
    flowRateMaxLpm: 9.5,
  });

  assert.equal(result.rawMinLiters, 7.6);
  assert.equal(result.rawMaxLiters, 9.5);
});

test('drinking-water person-days use the configured liters per day', () => {
  const result = estimateDrinkingWaterPersonDays({
    waterMinLiters: 16,
    waterMaxLiters: 20,
    litersPerPersonDay: 2,
  });

  assert.equal(result.minPersonDays, 8);
  assert.equal(result.maxPersonDays, 10);
});

test('range rounding does not modify calculation inputs', () => {
  const result = roundRange(15.2, 19, 0);
  assert.deepEqual(result, { min: 15, max: 19 });
});

test('Hungarian range formatter includes the unit', () => {
  assert.equal(formatRangeHu(15, 19, 'liter'), '15–19 liter');
});

test('invalid ranges are rejected', () => {
  assert.throws(() => estimateReducedShowerWater({
    minutesReduced: 2,
    flowRateMinLpm: 10,
    flowRateMaxLpm: 8,
  }), RangeError);
});
