import { DIATONIC_POSITIONS, type FretPosition } from './music';

const STRINGS: string[] = ['G', 'D', 'A', 'E', 'B'];
const FRETS: number[] = [0, 1, 2, 3, 4];

const SVG_WIDTH: number = 320;
const SVG_HEIGHT: number = 160;
const FRET_WIDTH: number = SVG_WIDTH / 5;
const STRING_HEIGHT: number = SVG_HEIGHT / 6;
const LEFT_MARGIN: number = 24;

interface FretboardProps {
    highlight: FretPosition | null;
}

export default function Fretboard({ highlight }: FretboardProps) {
    return (
        <svg
            viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
            className='w-full max-w-sm'
        >
            {/* Strings */}
            {STRINGS.map((label, i) => {
                const y = STRING_HEIGHT * (i + 1);
                return (
                    <g key={label}>
                        <line
                            x1={LEFT_MARGIN} y1={y}
                            x2={SVG_WIDTH} y2={y}
                            stroke="#4b5563"
                            strokeWidth={i === 4 ? 2.5 : 1.5}
                        />
                        <text x={8} y={y + 4} fill="#6b7280" fontSize={10} textAnchor="middle">
                            {label}
                        </text>
                    </g>
                );
            })}
            {/* Fret liinies */}
            {FRETS.map(fret => {
                const x = LEFT_MARGIN + fret * FRET_WIDTH;
                return (
                    <line
                        key={fret}
                        x1={x} y1={STRING_HEIGHT}
                        x2={x} y2={STRING_HEIGHT * 5}
                        stroke={fret === 0 ? '#e5e7eb' : '#4b5563'}
                        strokeWidth={fret === 0 ? 3 : 1}
                    />
                );
            })}
            {/* Right edge */}
            <line
                x1={SVG_WIDTH} y1={STRING_HEIGHT}
                x2={SVG_WIDTH} y2={STRING_HEIGHT * 5}
                stroke="#4b5563"
                strokeWidth={1}
            />

            {/* 3rd fret dot marker */}
            <circle
                cx={LEFT_MARGIN + 2.5 * FRET_WIDTH}
                cy={STRING_HEIGHT * 0.5}
                r={4}
                fill="#4b5563"
            />

            {/* Highlighted position */}
            {highlight && (() => {
                const stringIndex = 4 - highlight.string;  // flip: string 0 (B) is bottom row
                const cx = highlight.fret === 0
                    ? LEFT_MARGIN                             // open note sits on the nut
                    : LEFT_MARGIN + (highlight.fret - 0.5) * FRET_WIDTH;
                const cy = STRING_HEIGHT * (stringIndex + 1);
                return (
                    <circle cx={cx} cy={cy} r={12} fill="#3b82f6" />
                );
            })()}
        </svg>
    )
}