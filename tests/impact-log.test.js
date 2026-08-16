import test from 'node:test';
import assert from 'node:assert/strict';
import {
  IMPACT_LOG_SCHEMA_VERSION,
  IMPACT_LOG_STORAGE_KEY,
  appendImpactEvent,
  clearImpactLog,
  createImpactEvent,
  getImpactEvents,
  loadImpactLog,
  saveImpactLog,
} from '../app/js/impact-log.js';

function createMemoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    },
    removeItem(key) {
      values.delete(key);
    },
  };
}

function createWaterEvent(overrides = {}) {
  return createImpactEvent({
    eventId: 'event-shower-001',
    challengeId: 'shorter-shower',
    categoryId: 'water',
    completedAt: '2026-08-08T13:30:00.000Z',
    modelVersion: 'shower-water-v1',
    result: {
      type: 'estimated-range',
      resource: 'water',
      metric: 'use-reduction',
      unit: 'liter',
      min: 8,
      max: 10,
      completionRate: 1,
    },
    provenance: {
      userReported: true,
      documentedAverageUsed: true,
      measured: false,
    },
    ...overrides,
  });
}

test('üres tárhelyből verziózott, üres hatásnapló töltődik be', () => {
  const storage = createMemoryStorage();
  assert.deepEqual(loadImpactLog(storage), {
    schemaVersion: IMPACT_LOG_SCHEMA_VERSION,
    impactEvents: [],
  });
});

test('egy hatásesemény menthető és változatlanul visszaolvasható', () => {
  const storage = createMemoryStorage();
  const event = createWaterEvent();
  appendImpactEvent(event, storage);

  assert.deepEqual(getImpactEvents(storage), [event]);
});

test('azonos eventId nem kerül kétszer a hatásnaplóba', () => {
  const storage = createMemoryStorage();
  const event = createWaterEvent();
  appendImpactEvent(event, storage);
  appendImpactEvent(event, storage);

  assert.equal(getImpactEvents(storage).length, 1);
});

test('hibás becsült tartomány nem menthető', () => {
  assert.throws(() => createWaterEvent({
    result: {
      type: 'estimated-range',
      resource: 'water',
      metric: 'use-reduction',
      unit: 'liter',
      min: 12,
      max: 8,
      completionRate: 1,
    },
  }), /result\.min/);
});

test('sérült LocalStorage-adat helyett biztonságosan üres napló töltődik be', () => {
  const storage = createMemoryStorage({
    [IMPACT_LOG_STORAGE_KEY]: '{not-valid-json',
  });

  assert.deepEqual(loadImpactLog(storage).impactEvents, []);
});

test('a kvalitatív eredmény is naplózható számszerű megtakarítás nélkül', () => {
  const storage = createMemoryStorage();
  const event = createImpactEvent({
    eventId: 'event-lighting-001',
    challengeId: 'task-lighting',
    categoryId: 'electricity',
    completedAt: '2026-08-08T13:35:00.000Z',
    modelVersion: 'task-lighting-v0',
    result: {
      type: 'qualitative',
      completionRate: 0.66,
    },
    provenance: {
      userReported: true,
      documentedAverageUsed: false,
      measured: false,
    },
  });

  saveImpactLog({ schemaVersion: IMPACT_LOG_SCHEMA_VERSION, impactEvents: [event] }, storage);
  assert.equal(getImpactEvents(storage)[0].result.type, 'qualitative');
});

test('a teljes hatásnapló törölhető', () => {
  const storage = createMemoryStorage();
  appendImpactEvent(createWaterEvent(), storage);
  clearImpactLog(storage);

  assert.deepEqual(getImpactEvents(storage), []);
});
