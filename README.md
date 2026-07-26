# NNS Bass Trainer

Most bass players learn songs by memorizing shapes on one neck position. This app drills the underlyng number-to-note relationships instead - so a "1-4-5" progression is recognizable and playable in any key, not just the one it was learned in. Four practice modes target different skills: recall, fretboard recognition, chord-building, and visual study.

## Modes

**Flashcard** — shown a Nashville number (1–7) and a key, pick the correct note name from four choices. Wrong answers are re-queued and shown again later in the session.
<img width="1703" height="965" alt="image" src="https://github.com/user-attachments/assets/43953875-9543-4067-8e36-4b3379770b69" />

**Fretboard** — a position is highlighted on the fretboard SVG, identify the Nashville number it represents. The fretboard covers all 5 strings across frets 0–7.
<img width="1704" height="989" alt="image" src="https://github.com/user-attachments/assets/3bf36905-df16-4093-9ed5-2d486caa0463" />

**Note ID** - show a note on the fretboard and identify what the note name is (C#, G, Db, etc.)
<img width="1709" height="945" alt="image" src="https://github.com/user-attachments/assets/7b1000eb-35af-4712-930a-b0c64b66ef43" />

**Number Map** — a chord progression (e.g. 1–4–5–1) is displayed as numbered slots. A shuffled bank of note-name cards sits below — tap a card to select it, tap a slot to place it. Fill all slots and hit Check to see which are correct. After checking, the fretboard reveals the positions of each chord in the progression, with wrong answers highlighted in red.
<img width="1708" height="905" alt="image" src="https://github.com/user-attachments/assets/e45027ce-fec1-49a7-be76-e1b0dc303c2c" />

**Study** — the full key displayed on the fretboard, color-coded by scale degree: blue (root), amber (4th), green (5th).
<img width="1709" height="876" alt="image" src="https://github.com/user-attachments/assets/1b40a4bb-5dd5-4afe-a15a-4e7e6acfcf3b" />

## Features

- All 12 keys, selectable from a scrollable key bar or via Random Key
- 10-question sessions with wrong-answer re-queuing
- Per-session score breakdown by scale degree
- Streak counter for consecutive passing sessions (≥7/10)
- Stats persisted to localStorage (accuracy per key, per scale degree)
- Weak spot detection: after each session, surfaces numbers below 80% accuracy grouped by key

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
