import { type KeyName, type ScaleNumber } from './music';

export interface NumberStats {
  attempts: number;
  correct: number;
}

export interface PersistentStats {
  byKey: Partial<Record<KeyName, NumberStats>>;
  byNumber: Partial<Record<ScaleNumber, NumberStats>>;
  byKeyAndNumber: Partial<Record<KeyName, Partial<Record<ScaleNumber, NumberStats>>>>;
  streak: number;
}

export interface QuestionResult {
  number: ScaleNumber;
  correct: boolean;
}

const STORAGE_KEY: string = 'nns-stats';

function emptyStats(): PersistentStats {
  return { byKey: {}, byNumber: {}, byKeyAndNumber: {}, streak: 0 };
}

export function loadStats(): PersistentStats {
  try {
    const raw: string | null = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      return emptyStats();
    }
    const parsed = JSON.parse(raw) as PersistentStats;
    return { ...emptyStats(), ...parsed };
  } catch {
    return emptyStats();
  }
}

export function saveStats(stats: PersistentStats): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

export function updateStats(
  current: PersistentStats,
  key: KeyName,
  results: QuestionResult[],
  passed: boolean,
): PersistentStats {
  const byKey: Partial<Record<KeyName, NumberStats>> = { ...current.byKey };
  const byNumber: Partial<Record<ScaleNumber, NumberStats>> = { ...current.byNumber };
  const byKeyAndNumber: Partial<Record<KeyName, Partial<Record<ScaleNumber, NumberStats>>>> = { ...current.byKeyAndNumber };

  const keyEntry: NumberStats = byKey[key] ?? { attempts: 0, correct: 0 };
  byKey[key] = {
    attempts: keyEntry.attempts + results.length,
    correct: keyEntry.correct + results.filter((r: QuestionResult) => r.correct).length,
  };

  const keyNumbers: Partial<Record<ScaleNumber, NumberStats>> = { ...(byKeyAndNumber[key] ?? {}) };
  for (const result of results) {
    const entry: NumberStats = byNumber[result.number] ?? { attempts: 0, correct: 0 };
    byNumber[result.number] = {
      attempts: entry.attempts + 1,
      correct: entry.correct + (result.correct ? 1 : 0),
    };

    const keyEntry: NumberStats = keyNumbers[result.number] ?? { attempts: 0, correct: 0 };
    keyNumbers[result.number] = {
      attempts: keyEntry.attempts + 1,
      correct: keyEntry.correct + (result.correct ? 1 : 0),
    };
  }
  byKeyAndNumber[key] = keyNumbers;

  return {
    byKey,
    byNumber,
    byKeyAndNumber,
    streak: passed ? current.streak + 1 : 0,
  };
}

const MIN_ATTEMPTS = 5;
const WEAK_THRESHOLD = 0.8;

export interface WeakKey {
  key: KeyName;
  numbers: ScaleNumber[];
}

export function getWeakSpots(stats: PersistentStats): WeakKey[] {
  return (Object.entries(stats.byKeyAndNumber) as [KeyName, Partial<Record<ScaleNumber, NumberStats>>][])
    .flatMap(([key, numberMap]) => {
      const weakNumbers = (Object.entries(numberMap) as [string, NumberStats][])
        .filter(([, s]) => s.attempts >= MIN_ATTEMPTS && s.correct / s.attempts < WEAK_THRESHOLD)
        .sort(([, a], [, b]) => a.correct / a.attempts - b.correct / b.attempts)
        .map(([n]) => Number(n) as ScaleNumber);
      return weakNumbers.length > 0 ? [{ key, numbers: weakNumbers }] : [];
    })
    .sort((a, b) => a.key.localeCompare(b.key));
}
