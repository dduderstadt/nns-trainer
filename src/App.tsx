import { useState, useEffect, useRef } from 'react';
import { type ScaleNumber, type FretPosition, SCALE, KEY, DIATONIC_POSITIONS } from './music';
import Fretboard from './Fretboard';

type Feedback = 'correct' | 'incorrect' | null;
type Mode = 'flashcard' | 'fretboard';

interface Question {
  number: ScaleNumber;
  choices: string[];
  correctChoice: string;
}

interface RetryItem {
  number: ScaleNumber;
  addedAt: number;
}

interface QuestionResult {
  number: ScaleNumber;
  correct: boolean;
}

const SESSION_LENGTH = 10;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildFlashcardQuestion(number: ScaleNumber): Question {
  const correct = SCALE[number];
  const others = shuffle(Object.values(SCALE).filter(n => n !== correct)).slice(0, 3);
  return { number, choices: shuffle([correct, ...others]), correctChoice: correct };
}

function buildFretboardQuestion(number: ScaleNumber): Question {
  const others = shuffle(([1, 2, 3, 4, 5, 6, 7] as ScaleNumber[]).filter(n => n !== number)).slice(0, 3);
  const choices = shuffle([number, ...others]).map(String);
  return { number, choices, correctChoice: String(number) };
}

function Results({ results, onRestart }: { results: QuestionResult[]; onRestart: () => void }) {
  const correct = results.filter(r => r.correct).length;
  const missedNumbers = [...new Set(results.filter(r => !r.correct).map(r => r.number))].sort();

  const breakdown = ([1, 2, 3, 4, 5, 6, 7] as ScaleNumber[]).map(n => {
    const attempts = results.filter(r => r.number === n);
    return { number: n, attempts: attempts.length, correct: attempts.filter(r => r.correct).length };
  }).filter(row => row.attempts > 0);

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

      <div className="w-full max-w-xs border border-gray-800 rounded-xl overflow-hidden">
        {breakdown.map(row => (
          <div key={row.number} className="flex justify-between items-center px-4 py-3 border-b border-gray-800 last:border-0">
            <span className="text-gray-400 text-sm">
              <span className="text-white font-semibold mr-2">{row.number}</span>
              {SCALE[row.number]}
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

export default function App() {
  const retryQueueRef = useRef<RetryItem[]>([]);
  const questionCountRef = useRef(0);
  const modeRef = useRef<Mode>('flashcard');

  const [mode, setMode] = useState<Mode>('flashcard');
  const [question, setQuestion] = useState<Question | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [sessionOver, setSessionOver] = useState(false);
  const [highlight, setHighlight] = useState<FretPosition | null>(null);

  function advance(currentResults: QuestionResult[]) {
    if (currentResults.length >= SESSION_LENGTH) {
      setSessionOver(true);
      return;
    }

    const queue = retryQueueRef.current;
    const count = questionCountRef.current;
    let number: ScaleNumber;

    if (queue.length > 0 && count - queue[0].addedAt >= 3) {
      number = queue[0].number;
      retryQueueRef.current = queue.slice(1);
    } else {
      number = Math.ceil(Math.random() * 7) as ScaleNumber;
    }

    questionCountRef.current += 1;

    if (modeRef.current === 'fretboard') {
      const positions = DIATONIC_POSITIONS.filter(p => p.number === number);
      const pos = positions[Math.floor(Math.random() * positions.length)];
      setHighlight(pos);
      setQuestion(buildFretboardQuestion(number));
    } else {
      setHighlight(null);
      setQuestion(buildFlashcardQuestion(number));
    }

    setFeedback(null);
    setSelected(null);
  }

  useEffect(() => { advance([]); }, []);

  function handleAnswer(note: string) {
    if (feedback !== null) {
      return;
    }
    const correct = note === question!.correctChoice;
    const result: QuestionResult = { number: question!.number, correct };
    const nextResults = [...results, result];

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

  function handleRestart() {
    retryQueueRef.current = [];
    questionCountRef.current = 0;
    setResults([]);
    setSessionOver(false);
    setQuestion(null);
    setFeedback(null);
    setSelected(null);
    advance([]);
  }

  function handleModeSwitch(next: Mode) {
    modeRef.current = next;
    setMode(next);
    retryQueueRef.current = [];
    questionCountRef.current = 0;
    setResults([]);
    setSessionOver(false);
    setQuestion(null);
    setFeedback(null);
    setSelected(null);
    advance([]);
  }

  if (sessionOver) {
    return <Results results={results} onRestart={handleRestart} />;
  }

  if (!question) {
    return null;
  }

  const answered = results.length;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <div className="flex flex-col border-b border-gray-800">
        <div className="flex justify-between items-center px-4 py-3">
          <span className="text-gray-400 text-sm font-medium">Key of {KEY}</span>
          <span className="text-gray-400 text-sm font-medium">{answered}/{SESSION_LENGTH}</span>
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
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 gap-8">
        {mode === 'fretboard' && <Fretboard highlight={highlight} />}
        {mode === 'fretboard'
          ? <p className="text-gray-400 text-lg">What number is this note?</p>
          : <p className="text-gray-400 text-lg">What note is the...</p>
        }
        {mode === 'flashcard' && <div className="text-9xl font-bold">{question.number}</div>}

        <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
          {question.choices.map(note => {
            const isCorrect = note === question.correctChoice;
            const isSelected = note === selected;
            let cls = 'py-5 text-xl font-semibold rounded-xl border-2 transition-colors cursor-pointer ';
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
              <button key={note} className={cls} onClick={() => handleAnswer(note)}>
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
