import { JSX } from 'react';
import { type KeyName, KEY_NAMES } from './music';
import KeySelector from './KeySelector';

export type Mode = 'flashcard' | 'fretboard' | 'note-id' | 'study' | 'chart';

const MODE_TABS: { mode: Mode; label: string }[] = [
  { mode: 'flashcard', label: 'Flashcard' },
  { mode: 'fretboard', label: 'Fretboard' },
  { mode: 'note-id', label: 'Note ID' },
  { mode: 'chart', label: 'Number Map' },
  { mode: 'study', label: 'Study' },
];

interface ModeHeaderProps {
  mode: Mode;
  selectedKey: KeyName;
  answered?: number;
  sessionTotal?: number;
  onKeySwitch: (key: KeyName) => void;
  onModeSwitch: (mode: Mode) => void;
}

export default function ModeHeader({ mode, selectedKey, answered, sessionTotal, onKeySwitch, onModeSwitch }: ModeHeaderProps): JSX.Element {
  return (
    <div className="flex flex-col border-b border-gray-800">
      <div className="flex justify-between items-center px-4 py-3">
        {mode !== 'note-id'
          ? <span className="text-gray-400 text-sm font-medium">Key of {selectedKey}</span>
          : <span className="text-gray-400 text-sm font-medium">Key-independent</span>
        }
        {answered !== undefined && (
          <span className="text-gray-400 text-sm font-medium">{answered}/{sessionTotal}</span>
        )}
      </div>
      {mode !== 'note-id' && (
        <>
          <KeySelector currentKey={selectedKey} onSelect={onKeySwitch} />
          <div className="flex justify-center py-3">
            <button
              className="w-1/3 py-1.5 text-sm font-medium text-blue-400 bg-blue-950 hover:bg-blue-900 rounded-lg transition-colors cursor-pointer"
              onClick={() => { onKeySwitch(KEY_NAMES[Math.floor(Math.random() * KEY_NAMES.length)]); }}
            >
              Random Key
            </button>
          </div>
        </>
      )}
      <div className="flex">
        {MODE_TABS.map((tab) => (
          <button
            key={tab.mode}
            className={`flex-1 py-2 text-xs font-medium transition-colors ${tab.mode === mode ? 'text-white border-b-2 border-white' : 'text-gray-500'}`}
            onClick={() => { onModeSwitch(tab.mode); }}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
