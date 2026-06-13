import { JSX } from 'react';
import { type KeyName, KEY_NAMES } from './music';

interface KeySelectorProps {
  currentKey: KeyName;
  onSelect: (key: KeyName) => void;
}

export default function KeySelector({ currentKey, onSelect }: KeySelectorProps): JSX.Element {
  return (
    <div className="grid grid-cols-6 gap-x-2 gap-y-3 px-4 py-2">
      {KEY_NAMES.map((key: KeyName) => (
        <button
          key={key}
          onClick={() => { onSelect(key); }}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors cursor-pointer ${
            key === currentKey
              ? 'bg-white text-gray-950'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          {key}
        </button>
      ))}
    </div>
  );
}
