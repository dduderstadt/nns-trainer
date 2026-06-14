import { JSX } from 'react/jsx-runtime';
import { type FretPosition, type ScaleNumber } from './music';

const STRINGS: string[] = ['G', 'D', 'A', 'E', 'B'];

const DEGREE_COLORS: Record<ScaleNumber, string> = {
  1: '#3b82f6',
  2: 'rgba(107, 114, 128, 0.4)',
  3: 'rgba(107, 114, 128, 0.4)',
  4: '#f59e0b',
  5: '#22c55e',
  6: 'rgba(107, 114, 128, 0.4)',
  7: 'rgba(107, 114, 128, 0.4)',
};

const SVG_HEIGHT: number = 160;
const FRET_WIDTH: number = 64;
const LEFT_MARGIN: number = 36;
const RIGHT_PADDING: number = 28;
const POSITION_RADIUS: number = 13;
const DOT_FRETS: number[] = [3, 5, 7, 9];

interface FretboardProps {
  highlight?: FretPosition | null;
  positions?: FretPosition[];
  className?: string;
  viewBoxHeight?: number;
  fretCount?: number;
}

export default function Fretboard({ highlight, positions, className = 'w-full max-w-sm', viewBoxHeight = SVG_HEIGHT, fretCount = 5 }: FretboardProps): JSX.Element {
  const stringHeight: number = viewBoxHeight / 6;
  const svgWidth: number = LEFT_MARGIN + fretCount * FRET_WIDTH + RIGHT_PADDING;
  const frets: number[] = Array.from({ length: fretCount }, (_: unknown, i: number) => i);

  return (
    <svg
      viewBox={`0 0 ${svgWidth} ${viewBoxHeight}`}
      className={className}
    >
      {STRINGS.map((label: string, i: number) => {
        const y: number = stringHeight * (i + 1);
        return (
          <g key={label}>
            <line
              x1={LEFT_MARGIN} y1={y}
              x2={svgWidth} y2={y}
              stroke="#4b5563"
              strokeWidth={i === 4 ? 2.5 : 1.5}
            />
            <text x={8} y={y + 4} fill="#6b7280" fontSize={10} textAnchor="middle">
              {label}
            </text>
          </g>
        );
      })}

      {frets.map((fret: number) => {
        const x: number = LEFT_MARGIN + fret * FRET_WIDTH;
        return (
          <line
            key={fret}
            x1={x} y1={stringHeight}
            x2={x} y2={stringHeight * 5}
            stroke={fret === 0 ? '#e5e7eb' : '#4b5563'}
            strokeWidth={fret === 0 ? 3 : 1}
          />
        );
      })}

      <line
        x1={svgWidth} y1={stringHeight}
        x2={svgWidth} y2={stringHeight * 5}
        stroke="#4b5563"
        strokeWidth={1}
      />

      {DOT_FRETS.filter((f: number) => f < fretCount).map((f: number) => {
        const cx: number = LEFT_MARGIN + (f - 0.5) * FRET_WIDTH;
        const cy: number = stringHeight * 0.25;
        return (
          <g key={f}>
            <circle cx={cx} cy={cy} r={4} fill="#4b5563" />
            <text
              x={cx + 7} y={cy}
              fill="#6b7280"
              fontSize={8}
              textAnchor="start"
              dominantBaseline="middle"
            >
              {f}
            </text>
          </g>
        );
      })}

      {highlight && (() => {
        const stringIndex: number = 4 - highlight.string;
        const cx: number = highlight.fret === 0
          ? LEFT_MARGIN
          : LEFT_MARGIN + (highlight.fret - 0.5) * FRET_WIDTH;
        const cy: number = stringHeight * (stringIndex + 1);
        return (
          <circle cx={cx} cy={cy} r={12} fill="#3b82f6" />
        );
      })()}

      {positions && positions.map((pos: FretPosition, i: number) => {
        const stringIndex: number = 4 - pos.string;
        const cx: number = pos.fret === 0
          ? LEFT_MARGIN
          : LEFT_MARGIN + (pos.fret - 0.5) * FRET_WIDTH;
        const cy: number = stringHeight * (stringIndex + 1);
        const labelY: number = cy - POSITION_RADIUS - 5;
        return (
          <g key={i}>
            <rect
              x={cx - 12} y={labelY - 7}
              width={24} height={12}
              fill="#111827" rx={2}
            />
            <text
              x={cx} y={labelY}
              fill="white"
              fontSize={8}
              fontWeight="bold"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {pos.note}
            </text>
            <circle cx={cx} cy={cy} r={POSITION_RADIUS} fill={DEGREE_COLORS[pos.number]} />
            <text
              x={cx} y={cy}
              fill="white"
              fontSize={11}
              fontWeight="bold"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {pos.number}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
