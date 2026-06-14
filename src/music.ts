export type ScaleNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type KeyName = 'C' | 'G' | 'D' | 'A' | 'E' | 'B' | 'F#' | 'Db' | 'Ab' | 'Eb' | 'Bb' | 'F';

export interface FretPosition {
  string: number;  // 0 = B (lowest), 4 = G (highest)
  fret: number;    // 0 = open
  note: string;
  number: ScaleNumber;
}

// Circle of fifths order
export const KEY_NAMES: KeyName[] = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F'];

export const ALL_KEYS: Record<KeyName, Record<ScaleNumber, string>> = {
  'C':  { 1: 'C',  2: 'D',  3: 'E',  4: 'F',  5: 'G',  6: 'A',  7: 'B'  },
  'G':  { 1: 'G',  2: 'A',  3: 'B',  4: 'C',  5: 'D',  6: 'E',  7: 'F#' },
  'D':  { 1: 'D',  2: 'E',  3: 'F#', 4: 'G',  5: 'A',  6: 'B',  7: 'C#' },
  'A':  { 1: 'A',  2: 'B',  3: 'C#', 4: 'D',  5: 'E',  6: 'F#', 7: 'G#' },
  'E':  { 1: 'E',  2: 'F#', 3: 'G#', 4: 'A',  5: 'B',  6: 'C#', 7: 'D#' },
  'B':  { 1: 'B',  2: 'C#', 3: 'D#', 4: 'E',  5: 'F#', 6: 'G#', 7: 'A#' },
  'F#': { 1: 'F#', 2: 'G#', 3: 'A#', 4: 'B',  5: 'C#', 6: 'D#', 7: 'E#' },
  'Db': { 1: 'Db', 2: 'Eb', 3: 'F',  4: 'Gb', 5: 'Ab', 6: 'Bb', 7: 'C'  },
  'Ab': { 1: 'Ab', 2: 'Bb', 3: 'C',  4: 'Db', 5: 'Eb', 6: 'F',  7: 'G'  },
  'Eb': { 1: 'Eb', 2: 'F',  3: 'G',  4: 'Ab', 5: 'Bb', 6: 'C',  7: 'D'  },
  'Bb': { 1: 'Bb', 2: 'C',  3: 'D',  4: 'Eb', 5: 'F',  6: 'G',  7: 'A'  },
  'F':  { 1: 'F',  2: 'G',  3: 'A',  4: 'Bb', 5: 'C',  6: 'D',  7: 'E'  },
};

export const PROGRESSIONS: ScaleNumber[][] = [
  [1, 4, 5, 1],
  [1, 5, 6, 4],
  [1, 6, 4, 5],
  [1, 4, 1, 5],
  [1, 4, 2, 5],
  [1, 3, 4, 5],
  [1, 6, 2, 5],
  [2, 5, 1, 1],
  [1, 4, 5, 4],
  [6, 4, 1, 5],
  [1, 1, 4, 4, 5, 4, 1, 1],
];

const CHROMATIC: string[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Maps enharmonic flat/double-sharp names to their sharp equivalent for chromatic lookup
const ENHARMONICS: Record<string, string> = {
  'Bb': 'A#', 'Eb': 'D#', 'Ab': 'G#', 'Db': 'C#', 'Gb': 'F#', 'Cb': 'B', 'Fb': 'E',
  'E#': 'F',  'B#': 'C',
};

export function computeDiatonicPositions(scale: Record<ScaleNumber, string>, maxFret: number = 4): FretPosition[] {
  const OPEN_NOTES: string[] = ['B', 'E', 'A', 'D', 'G'];

  const noteToNumber: Map<string, ScaleNumber> = new Map<string, ScaleNumber>();
  for (const [num, note] of Object.entries(scale)) {
    const normalized: string = ENHARMONICS[note] ?? note;
    noteToNumber.set(normalized, Number(num) as ScaleNumber);
  }

  const positions: FretPosition[] = [];
  for (let string: number = 0; string < 5; string++) {
    const openNote: string = OPEN_NOTES[string];
    const openIndex: number = CHROMATIC.indexOf(openNote);
    for (let fret: number = 0; fret <= maxFret; fret++) {
      const noteIndex: number = (openIndex + fret) % 12;
      const chromaticNote: string = CHROMATIC[noteIndex];
      const num: ScaleNumber | undefined = noteToNumber.get(chromaticNote);
      if (num !== undefined) {
        positions.push({ string, fret, note: scale[num], number: num });
      }
    }
  }
  return positions;
}
