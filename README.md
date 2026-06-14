# NNS Bass Trainer

A web-based drill app for a 5-string electric bass player learning to internalize the Nashville Number System across all 12 keys.

## Modes

**Flashcard** — shown a Nashville number (1–7) and a key, pick the correct note name from four choices. Wrong answers are re-queued and shown again later in the session.

**Fretboard** — a position is highlighted on the fretboard SVG, identify the Nashville number it represents. The fretboard covers all 5 strings across frets 0–7.

**Number Map** — a chord progression (e.g. 1–4–5–1) is displayed as numbered slots. A shuffled bank of note-name cards sits below — tap a card to select it, tap a slot to place it. Fill all slots and hit Check to see which are correct. After checking, the fretboard reveals the positions of each chord in the progression, with wrong answers highlighted in red.

**Study** — the full key displayed on the fretboard, color-coded by scale degree: blue (root), amber (4th), green (5th).

## Features

- All 12 keys, selectable from a scrollable key bar or via Random Key
- 10-question sessions with wrong-answer re-queuing
- Per-session score breakdown by scale degree
- Streak counter for consecutive passing sessions (≥7/10)
- Stats persisted to localStorage (accuracy per key, per scale degree)

## Stack

- React + TypeScript
- Vite
- Tailwind CSS v4

## Running locally

```bash
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

## Roadmap

See [TODO.md](./TODO.md) for planned features.
