export const IMPACT_LOG_STORAGE_KEY = 'egyutt-szamit-impact-log-v1';
export const IMPACT_LOG_SCHEMA_VERSION = 1;

const RESULT_TYPES = new Set(['estimated-range', 'qualitative']);

export function createEmptyImpactLog() {
  return {
    schemaVersion: IMPACT_LOG_SCHEMA_VERSION,
    impactEvents: [],
  };
}

export function createImpactEvent({
  eventId = createEventId(),
  challengeId,
  categoryId,
  completedAt = new Date().toISOString(),
  modelVersion,
  result,
  provenance,
}) {
  const event = {
    eventId,
    schemaVersion: IMPACT_LOG_SCHEMA_VERSION,
    challengeId,
    categoryId,
    completedAt,
    modelVersion,
    result,
    provenance,
  };

  validateImpactEvent(event);
  return event;
}

export function validateImpactEvent(event) {
  if (!event || typeof event !== 'object' || Array.isArray(event)) {
    throw new TypeError('A hatáseseménynek objektumnak kell lennie.');
  }

  assertNonEmptyString(event.eventId, 'eventId');
  assertExactSchemaVersion(event.schemaVersion);
  assertNonEmptyString(event.challengeId, 'challengeId');
  assertNonEmptyString(event.categoryId, 'categoryId');
  assertValidDate(event.completedAt, 'completedAt');
  assertNonEmptyString(event.modelVersion, 'modelVersion');
  validateResult(event.result);
  validateProvenance(event.provenance);

  return true;
}

export function loadImpactLog(storage = getDefaultStorage()) {
  try {
    const raw = storage.getItem(IMPACT_LOG_STORAGE_KEY);
    if (!raw) return createEmptyImpactLog();

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return createEmptyImpactLog();
    if (parsed.schemaVersion !== IMPACT_LOG_SCHEMA_VERSION || !Array.isArray(parsed.impactEvents)) {
      return createEmptyImpactLog();
    }

    const validEvents = parsed.impactEvents.filter((event) => {
      try {
        validateImpactEvent(event);
        return true;
      } catch {
        return false;
      }
    });

    return {
      schemaVersion: IMPACT_LOG_SCHEMA_VERSION,
      impactEvents: validEvents,
    };
  } catch {
    return createEmptyImpactLog();
  }
}

export function saveImpactLog(log, storage = getDefaultStorage()) {
  if (!log || typeof log !== 'object' || Array.isArray(log)) {
    throw new TypeError('A hatásnaplónak objektumnak kell lennie.');
  }
  assertExactSchemaVersion(log.schemaVersion);
  if (!Array.isArray(log.impactEvents)) throw new TypeError('Az impactEvents mezőnek tömbnek kell lennie.');
  log.impactEvents.forEach(validateImpactEvent);

  const serializableLog = {
    schemaVersion: IMPACT_LOG_SCHEMA_VERSION,
    impactEvents: [...log.impactEvents],
  };
  storage.setItem(IMPACT_LOG_STORAGE_KEY, JSON.stringify(serializableLog));
  return serializableLog;
}

export function appendImpactEvent(event, storage = getDefaultStorage()) {
  validateImpactEvent(event);
  const log = loadImpactLog(storage);
  if (log.impactEvents.some((item) => item.eventId === event.eventId)) return log;

  const updatedLog = {
    schemaVersion: IMPACT_LOG_SCHEMA_VERSION,
    impactEvents: [...log.impactEvents, event],
  };
  return saveImpactLog(updatedLog, storage);
}

export function getImpactEvents(storage = getDefaultStorage()) {
  return [...loadImpactLog(storage).impactEvents];
}

export function clearImpactLog(storage = getDefaultStorage()) {
  storage.removeItem(IMPACT_LOG_STORAGE_KEY);
}

function validateResult(result) {
  if (!result || typeof result !== 'object' || Array.isArray(result)) {
    throw new TypeError('A result mezőnek objektumnak kell lennie.');
  }
  if (!RESULT_TYPES.has(result.type)) throw new TypeError('Ismeretlen result.type.');
  assertCompletionRate(result.completionRate);

  if (result.type === 'qualitative') {
    return;
  }

  assertNonEmptyString(result.resource, 'result.resource');
  assertNonEmptyString(result.metric, 'result.metric');
  assertNonEmptyString(result.unit, 'result.unit');
  assertNonNegativeFiniteNumber(result.min, 'result.min');
  assertNonNegativeFiniteNumber(result.max, 'result.max');
  if (result.min > result.max) throw new RangeError('A result.min nem lehet nagyobb a result.max értéknél.');
}

function validateProvenance(provenance) {
  if (!provenance || typeof provenance !== 'object' || Array.isArray(provenance)) {
    throw new TypeError('A provenance mezőnek objektumnak kell lennie.');
  }
  ['userReported', 'documentedAverageUsed', 'measured'].forEach((key) => {
    if (typeof provenance[key] !== 'boolean') throw new TypeError(`A provenance.${key} mezőnek logikai értéknek kell lennie.`);
  });
}

function assertExactSchemaVersion(value) {
  if (value !== IMPACT_LOG_SCHEMA_VERSION) {
    throw new RangeError(`Nem támogatott hatásnapló-sémaverzió: ${String(value)}`);
  }
}

function assertNonEmptyString(value, fieldName) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new TypeError(`A ${fieldName} mező nem lehet üres.`);
  }
}

function assertValidDate(value, fieldName) {
  assertNonEmptyString(value, fieldName);
  if (Number.isNaN(Date.parse(value))) throw new TypeError(`A ${fieldName} mező nem érvényes dátum.`);
}

function assertNonNegativeFiniteNumber(value, fieldName) {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`A ${fieldName} mezőnek nemnegatív véges számnak kell lennie.`);
  }
}

function assertCompletionRate(value) {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new RangeError('A result.completionRate értékének 0 és 1 közé kell esnie.');
  }
}

function createEventId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `impact-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function getDefaultStorage() {
  if (typeof globalThis.localStorage === 'undefined') {
    throw new Error('LocalStorage nem érhető el ebben a környezetben.');
  }
  return globalThis.localStorage;
}
