import { useState, JSX } from 'react';
import { type ScaleNumber, type FretPosition, PROGRESSIONS, computeDiatonicPositions } from './music';
import Fretboard from './Fretboard';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function randomProgression(): ScaleNumber[] {
  return PROGRESSIONS[Math.floor(Math.random() * PROGRESSIONS.length)];
}

interface ChordChartProps {
  scale: Record<ScaleNumber, string>;
}

export default function ChordChart({ scale }: ChordChartProps): JSX.Element {
  const [progression, setProgression] = useState<ScaleNumber[]>(randomProgression);
  const [bank, setBank] = useState<(string | null)[]>(() => shuffle(progression.map(n => scale[n])));
  const [slots, setSlots] = useState<(string | null)[]>(() => new Array(progression.length).fill(null));
  const [selectedBankIdx, setSelectedBankIdx] = useState<number | null>(null);
  const [checked, setChecked] = useState<boolean>(false);

  const allFilled: boolean = slots.every(s => s !== null);

  function tapBank(i: number): void {
    if (checked) {
      return;
    }
    setSelectedBankIdx(prev => prev === i ? null : i);
  }

  function tapSlot(j: number): void {
    if (checked) {
      return;
    }
    if (selectedBankIdx !== null) {
      const note = bank[selectedBankIdx];
      if (note === null) {
        return;
      }
      const newBank = [...bank];
      const newSlots = [...slots];
      if (slots[j] !== null) {
        newBank[selectedBankIdx] = slots[j];
      } else {
        newBank[selectedBankIdx] = null;
      }
      newSlots[j] = note;
      setBank(newBank);
      setSlots(newSlots);
      setSelectedBankIdx(null);
    } else if (slots[j] !== null) {
      const firstNull = bank.findIndex(b => b === null);
      if (firstNull === -1) {
        return;
      }
      const newBank = [...bank];
      const newSlots = [...slots];
      newBank[firstNull] = slots[j];
      newSlots[j] = null;
      setBank(newBank);
      setSlots(newSlots);
    }
  }

  function next(): void {
    const p = randomProgression();
    setProgression(p);
    setBank(shuffle(p.map(n => scale[n])));
    setSlots(new Array(p.length).fill(null));
    setSelectedBankIdx(null);
    setChecked(false);
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 gap-8">
      <div className="flex flex-wrap justify-center gap-3">
        {progression.map((num: ScaleNumber, j: number) => {
          const placed = slots[j];
          const isCorrect = checked && placed === scale[num];
          const isWrong = checked && placed !== null && placed !== scale[num];
          let slotCls = 'w-20 h-24 rounded-xl border-2 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ';
          if (isCorrect) {
            slotCls += 'border-green-500 bg-green-900';
          } else if (isWrong) {
            slotCls += 'border-red-500 bg-red-900';
          } else {
            slotCls += 'border-gray-600 bg-gray-800 hover:bg-gray-700';
          }
          return (
            <button key={j} className={slotCls} onClick={() => { tapSlot(j); }}>
              <span className="text-2xl font-bold text-gray-300">{num}</span>
              {placed && (
                <span className={`text-2xl font-semibold ${isCorrect ? 'text-green-300' : isWrong ? 'text-red-300' : 'text-blue-400'}`}>
                  {placed}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {bank.map((note: string | null, i: number) => {
          if (note === null) {
            return <div key={i} className="w-20 h-24 rounded-xl border-2 border-dashed border-gray-700" />;
          }
          const isSelected = selectedBankIdx === i;
          return (
            <button
              key={i}
              onClick={() => { tapBank(i); }}
              className={`w-20 h-24 rounded-xl border-2 text-2xl font-bold transition-colors cursor-pointer ${isSelected ? 'border-blue-400 bg-blue-900 text-white' : 'border-gray-600 bg-gray-800 hover:bg-gray-700 text-gray-200'}`}
            >
              {note}
            </button>
          );
        })}
      </div>

      {checked && (() => {
        const allPositions: FretPosition[] = computeDiatonicPositions(scale, 7);
        const uniqueNumbers = new Set(progression);
        const positions: FretPosition[] = allPositions.filter(p => uniqueNumbers.has(p.number) && p.fret > 0);
        const wrongNumbers = new Set(progression.filter((num, j) => slots[j] !== scale[num]));
        return <Fretboard positions={positions} errorNumbers={wrongNumbers} fretCount={8} className="w-full max-w-2xl" viewBoxHeight={240} />;
      })()}

      <div className="flex gap-3">
        {!checked && allFilled && (
          <button
            onClick={() => { setChecked(true); }}
            className="px-6 py-2 text-sm font-medium bg-white text-gray-950 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
          >
            Check
          </button>
        )}
        {checked && (
          <button
            onClick={next}
            className="px-6 py-2 text-sm font-medium bg-white text-gray-950 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
          >
            Next
          </button>
        )}
        {!checked && (
          <button
            onClick={next}
            className="px-6 py-2 text-sm font-medium border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer text-gray-400"
          >
            Skip
          </button>
        )}
      </div>
    </div>
  );
}
