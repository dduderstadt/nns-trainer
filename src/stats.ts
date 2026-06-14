import { type KeyName, type ScaleNumber } from './music';

export interface NumberStats {
  attempts: number;
  correct: number;
}

export interface PersistentStats {
  byKey: Partial<Record<KeyName, NumberStats>>;
  byNumber: Partial<Record<ScaleNumber, NumberStats>>;
  streak: number;
}

export interface QuestionResult {
  number: ScaleNumber;
  correct: boolean;
}

const STORAGE_KEY: string = 'nns-stats';

function emptyStats(): PersistentStats {
  return { byKey: {}, byNumber: {}, streak: 0 };
}

export function loadStats(): PersistentStats {
  try {
    const raw: string | null = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      return emptyStats();
    }
    return JSON.parse(raw) as PersistentStats;
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

  const keyEntry: NumberStats = byKey[key] ?? { attempts: 0, correct: 0 };
  byKey[key] = {
    attempts: keyEntry.attempts + results.length,
    correct: keyEntry.correct + results.filter((r: QuestionResult) => r.correct).length,
  };

  for (const result of results) {
    const entry: NumberStats = byNumber[result.number] ?? { attempts: 0, correct: 0 };
    byNumber[result.number] = {
      attempts: entry.attempts + 1,
      correct: entry.correct + (result.correct ? 1 : 0),
    };
  }

  return {
    byKey,
    byNumber,
    streak: passed ? current.streak + 1 : 0,
  };
}

const MIN_ATTEMPTS = 5;
const WEAK_THRESHOLD = 0.7;

export function getWeakSpots(stats: PersistentStats): { numbers: ScaleNumber[]; keys: KeyName[] } {
  const numbers = (Object.entries(stats.byNumber) as [string, NumberStats][])
    .filter(([, s]) => s.attempts >= MIN_ATTEMPTS && s.correct / s.attempts < WEAK_THRESHOLD)
    .sort(([, a], [, b]) => a.correct / a.attempts - b.correct / b.attempts)
    .map(([n]) => Number(n) as ScaleNumber);

  const keys = (Object.entries(stats.byKey) as [string, NumberStats][])
    .filter(([, s]) => s.attempts >= MIN_ATTEMPTS && s.correct / s.attempts < WEAK_THRESHOLD)
    .sort(([, a], [, b]) => a.correct / a.attempts - b.correct / b.attempts)
    .map(([k]) => k as KeyName);

  return { numbers, keys };
}
