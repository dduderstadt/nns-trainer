import { useState, useEffect, useRef, JSX } from 'react';
import { type ScaleNumber, type FretPosition, type KeyName, ALL_KEYS, KEY_NAMES, computeDiatonicPositions } from './music';
import { type QuestionResult, type PersistentStats, loadStats, updateStats, saveStats } from './stats';
import Fretboard from './Fretboard';
import KeySelector from './KeySelector';

type Feedback = 'correct' | 'incorrect' | null;
type Mode = 'flashcard' | 'fretboard' | 'study';

interface Question {
  number: ScaleNumber;
  choices: string[];
  correctChoice: string;
}

interface RetryItem {
  number: ScaleNumber;
  addedAt: number;
}

interface BreakdownRow {
  number: ScaleNumber;
  attempts: number;
  correct: number;
}

const SESSION_LENGTH: number = 10;
const PASSING_THRESHOLD: number = 7;

function shuffle<T>(arr: T[]): T[] {
  const a: T[] = [...arr];
  for (let i: number = a.length - 1; i > 0; i--) {
    const j: number = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildFlashcardQuestion(number: ScaleNumber, scale: Record<ScaleNumber, string>): Question {
  const correct: string = scale[number];
  const others: string[] = shuffle(Object.values(scale).filter((n: string) => n !== correct)).slice(0, 3);
  return { number, choices: shuffle([correct, ...others]), correctChoice: correct };
}

function buildFretboardQuestion(number: ScaleNumber): Question {
  const others: ScaleNumber[] = shuffle(([1, 2, 3, 4, 5, 6, 7] as ScaleNumber[]).filter((n: ScaleNumber) => n !== number)).slice(0, 3);
  const choices: string[] = shuffle([number, ...others]).map(String);
  return { number, choices, correctChoice: String(number) };
}

function Results({ results, onRestart, scale, streak }: { results: QuestionResult[]; onRestart: () => void; scale: Record<ScaleNumber, string>; streak: number }): JSX.Element {
  const correct: number = results.filter((r: QuestionResult) => r.correct).length;
  const missedNumbers: number[] = [...new Set(results.filter((r: QuestionResult) => !r.correct).map((r: QuestionResult) => r.number))].sort();

  const breakdown: BreakdownRow[] = ([1, 2, 3, 4, 5, 6, 7] as ScaleNumber[]).map((n: ScaleNumber) => {
    const attempts: QuestionResult[] = results.filter((r: QuestionResult) => r.number === n);
    return { number: n, attempts: attempts.length, correct: attempts.filter((r: QuestionResult) => r.correct).length };
  }).filter((row: BreakdownRow) => row.attempts > 0);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-4 gap-8">
      <h2 className="text-2xl font-bold">Session Complete</h2>

      <div className="text-6xl font-bold">
        {correct}<span className="text-gray-500 text-4xl">/{SESSION_LENGTH}</span>
      </div>

      {missedNumbers.length === 0 ? (
        <p className="text-green-400 font-medium">Perfect score!</p>
      ) : (
        <p className="text-red-400 font-medium">
          Missed: {missedNumbers.join(', ')}
        </p>
      )}

      <p className="text-gray-400 text-sm">
        {streak > 0 ? `${streak} session streak` : 'Streak: 0'}
      </p>

      <div className="w-full max-w-xs border border-gray-800 rounded-xl overflow-hidden">
        {breakdown.map((row: BreakdownRow) => (
          <div key={row.number} className="flex justify-between items-center px-4 py-3 border-b border-gray-800 last:border-0">
            <span className="text-gray-400 text-sm">
              <span className="text-white font-semibold mr-2">{row.number}</span>
              {scale[row.number]}
            </span>
            <span className={`text-sm font-medium ${row.correct === row.attempts ? 'text-green-400' : 'text-red-400'}`}>
              {row.correct}/{row.attempts}
            </span>
          </div>
        ))}
      </div>

      <button
        className="px-8 py-4 bg-white text-gray-950 font-semibold rounded-xl hover:bg-gray-200 transition-colors cursor-pointer"
        onClick={onRestart}
      >
        Try Again
      </button>
    </div>
  );
}

export default function App(): JSX.Element | null {
  const retryQueueRef = useRef<RetryItem[]>([]);
  const questionCountRef = useRef<number>(0);
  const modeRef = useRef<Mode>('flashcard');
  const initialKey: KeyName = KEY_NAMES[Math.floor(Math.random() * KEY_NAMES.length)];
  const selectedKeyRef = useRef<KeyName>(initialKey);
  const statsRef = useRef<PersistentStats>(loadStats());

  const [selectedKey, setSelectedKey] = useState<KeyName>(initialKey);
  const [mode, setMode] = useState<Mode>('flashcard');
  const [question, setQuestion] = useState<Question | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [sessionOver, setSessionOver] = useState<boolean>(false);
  const [highlight, setHighlight] = useState<FretPosition | null>(null);
  const [stats, setStats] = useState<PersistentStats>(statsRef.current);

  function advance(currentResults: QuestionResult[]): void {
    if (currentResults.length >= SESSION_LENGTH) {
      const passed: boolean = currentResults.filter((r: QuestionResult) => r.correct).length >= PASSING_THRESHOLD;
      const updated: PersistentStats = updateStats(statsRef.current, selectedKeyRef.current, currentResults, passed);
      saveStats(updated);
      statsRef.current = updated;
      setStats(updated);
      setSessionOver(true);
      return;
    }

    const scale: Record<ScaleNumber, string> = ALL_KEYS[selectedKeyRef.current];
    const diatonicPositions: FretPosition[] = computeDiatonicPositions(scale, 7);

    const queue: RetryItem[] = retryQueueRef.current;
    const count: number = questionCountRef.current;
    let number: ScaleNumber;

    if (queue.length > 0 && count - queue[0].addedAt >= 3) {
      number = queue[0].number;
      retryQueueRef.current = queue.slice(1);
    } else {
      number = Math.ceil(Math.random() * 7) as ScaleNumber;
    }

    questionCountRef.current += 1;

    if (modeRef.current === 'fretboard') {
      const positions: FretPosition[] = diatonicPositions.filter((p: FretPosition) => p.number === number);
      const pos: FretPosition = positions[Math.floor(Math.random() * positions.length)];
      setHighlight(pos);
      setQuestion(buildFretboardQuestion(number));
    } else {
      setHighlight(null);
      setQuestion(buildFlashcardQuestion(number, scale));
    }

    setFeedback(null);
    setSelected(null);
  }

  useEffect(() => { advance([]); }, []);

  function handleAnswer(note: string): void {
    if (feedback !== null) {
      return;
    }
    const correct: boolean = note === question!.correctChoice;
    const result: QuestionResult = { number: question!.number, correct };
    const nextResults: QuestionResult[] = [...results, result];

    setSelected(note);
    setFeedback(correct ? 'correct' : 'incorrect');
    setResults(nextResults);

    if (!correct) {
      retryQueueRef.current = [
        ...retryQueueRef.current,
        { number: question!.number, addedAt: questionCountRef.current },
      ];
    }

    setTimeout(() => { advance(nextResults); }, 1000);
  }

  function resetSession(): void {
    retryQueueRef.current = [];
    questionCountRef.current = 0;
    setResults([]);
    setSessionOver(false);
    setQuestion(null);
    setFeedback(null);
    setSelected(null);
    advance([]);
  }

  function handleModeSwitch(next: Mode): void {
    modeRef.current = next;
    setMode(next);
    resetSession();
  }

  function handleKeySwitch(key: KeyName): void {
    selectedKeyRef.current = key;
    setSelectedKey(key);
    resetSession();
  }

  if (sessionOver) {
    return <Results results={results} onRestart={resetSession} scale={ALL_KEYS[selectedKey]} streak={stats.streak} />;
  }

  if (mode === 'study') {
    const studyPositions = computeDiatonicPositions(ALL_KEYS[selectedKey], 7);
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col">
        <div className="flex flex-col border-b border-gray-800">
          <div className="flex justify-between items-center px-4 py-3">
            <span className="text-gray-400 text-sm font-medium">Key of {selectedKey}</span>
          </div>
          <KeySelector currentKey={selectedKey} onSelect={handleKeySwitch} />
          <div className="flex justify-center py-3">
            <button
              className="w-1/3 py-1.5 text-sm font-medium text-blue-400 bg-blue-950 hover:bg-blue-900 rounded-lg transition-colors cursor-pointer"
              onClick={() => { handleKeySwitch(KEY_NAMES[Math.floor(Math.random() * KEY_NAMES.length)]); }}
            >
              Random Key
            </button>
          </div>
          <div className="flex">
            <button
              className="flex-1 py-2 text-sm font-medium transition-colors text-gray-500"
              onClick={() => { handleModeSwitch('flashcard'); }}
            >
              Flashcard
            </button>
            <button
              className="flex-1 py-2 text-sm font-medium transition-colors text-gray-500"
              onClick={() => { handleModeSwitch('fretboard'); }}
            >
              Fretboard
            </button>
            <button
              className="flex-1 py-2 text-sm font-medium transition-colors text-white border-b-2 border-white"
              onClick={() => { handleModeSwitch('study'); }}
            >
              Study
            </button>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-4 gap-6">
          <Fretboard positions={studyPositions} className="w-full max-w-2xl" viewBoxHeight={240} fretCount={8} />
          <div className="flex gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-full bg-blue-500"></span>Root</span>
            <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-full bg-amber-500"></span>4th</span>
            <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>5th</span>
          </div>
        </div>
      </div>
    );
  }

  if (!question) {
    return null;
  }

  const answered: number = results.length;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <div className="flex flex-col border-b border-gray-800">
        <div className="flex justify-between items-center px-4 py-3">
          <span className="text-gray-400 text-sm font-medium">Key of {selectedKey}</span>
          <span className="text-gray-400 text-sm font-medium">{answered}/{SESSION_LENGTH}</span>
        </div>
        <KeySelector currentKey={selectedKey} onSelect={handleKeySwitch} />
        <div className="flex justify-center py-3">
          <button
            className="w-1/3 py-1.5 text-sm font-medium text-blue-400 bg-blue-950 hover:bg-blue-900 rounded-lg transition-colors cursor-pointer"
            onClick={() => { handleKeySwitch(KEY_NAMES[Math.floor(Math.random() * KEY_NAMES.length)]); }}
          >
            Random Key
          </button>
        </div>
        <div className="flex">
          <button
            className={`flex-1 py-2 text-sm font-medium transition-colors ${mode === 'flashcard' ? 'text-white border-b-2 border-white' : 'text-gray-500'}`}
            onClick={() => { handleModeSwitch('flashcard'); }}
          >
            Flashcard
          </button>
          <button
            className={`flex-1 py-2 text-sm font-medium transition-colors ${mode === 'fretboard' ? 'text-white border-b-2 border-white' : 'text-gray-500'}`}
            onClick={() => { handleModeSwitch('fretboard'); }}
          >
            Fretboard
          </button>
          <button
            className="flex-1 py-2 text-sm font-medium transition-colors text-gray-500"
            onClick={() => { handleModeSwitch('study'); }}
          >
            Study
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 gap-8">
        {mode === 'fretboard' && <Fretboard highlight={highlight} fretCount={8} className="w-full max-w-2xl" viewBoxHeight={240} />}
        {mode === 'fretboard'
          ? <p className="text-gray-400 text-lg">What number is this note?</p>
          : <p className="text-gray-400 text-lg">What note is the...</p>
        }
        {mode === 'flashcard' && <div className="text-9xl font-bold">{question.number}</div>}

        <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
          {question.choices.map((note: string) => {
            const isCorrect: boolean = note === question.correctChoice;
            const isSelected: boolean = note === selected;
            let cls: string = 'py-5 text-xl font-semibold rounded-xl border-2 transition-colors cursor-pointer ';
            if (feedback === null) {
              cls += 'border-gray-700 bg-gray-800 hover:bg-gray-700 active:bg-gray-600';
            } else if (isCorrect) {
              cls += 'border-green-500 bg-green-900 text-green-300';
            } else if (isSelected) {
              cls += 'border-red-500 bg-red-900 text-red-300';
            } else {
              cls += 'border-gray-800 bg-gray-900 text-gray-600';
            }
            return (
              <button key={note} className={cls} onClick={() => { handleAnswer(note); }}>
                {note}
              </button>
            );
          })}
        </div>

        <div className="h-7">
          {feedback && (
            <p className={`text-lg font-medium ${feedback === 'correct' ? 'text-green-400' : 'text-red-400'}`}>
              {feedback === 'correct' ? 'Correct!' : `It's ${question.correctChoice} — you'll see this again`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
