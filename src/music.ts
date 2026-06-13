export type ScaleNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const SCALE: Record<ScaleNumber, string> = {
  1: 'G', 2: 'A', 3: 'B', 4: 'C', 5: 'D', 6: 'E', 7: 'F#',
};

export const KEY: string = 'G';

export interface FretPosition {
    string: number; // 0 = B (lowest), 4 = G (highest)
    fret: number; //  0 = open
    note: string;
    number: ScaleNumber;
}

// All fret positions in open position (frets 0-4) that are diatonic to G major
export const DIATONIC_POSITIONS: FretPosition[] = [
    { string: 0, fret: 0, note: 'B', number: 3},
    { string: 0, fret: 1, note: 'C',  number: 4 },
    { string: 0, fret: 3, note: 'D',  number: 5 },
    { string: 1, fret: 0, note: 'E',  number: 6 },
    { string: 1, fret: 2, note: 'F#', number: 7 },
    { string: 1, fret: 3, note: 'G',  number: 1 },
    { string: 2, fret: 0, note: 'A',  number: 2 },
    { string: 2, fret: 2, note: 'B',  number: 3 },
    { string: 2, fret: 3, note: 'C',  number: 4 },
    { string: 3, fret: 0, note: 'D',  number: 5 },
    { string: 3, fret: 2, note: 'E',  number: 6 },
    { string: 3, fret: 4, note: 'F#', number: 7 },
    { string: 4, fret: 0, note: 'G',  number: 1 },
    { string: 4, fret: 2, note: 'A',  number: 2 },
    { string: 4, fret: 4, note: 'B',  number: 3 },
  ];