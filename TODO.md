# TODO

## Keys
- [x] Key selector — let user choose which key to drill in
- [x] Add all 12 major keys to the data model (currently hardcoded to G)
- [x] Random key — random key on page load + "Random Key" button to re-randomize

## Practice Modes
- [x] Fretboard mode — highlight a fret/string position, ask "what Nashville number is this?"
- [x] Extend fretboard quiz mode to include frets 0–7 (currently limited to 0–4)
- [x] Study mode — show all notes of the selected key on the fretboard, color-coded by scale degree (1=blue, 4=amber, 5=green)
- [ ] Fretboard note identification — shown a fret position, ask "what note is this?" (answer is the note name e.g. F# or Bb, independent of key context)
- [x] Chord chart reader mode — display a number chart (e.g. 1-4-5-1), tap each number to reveal the note name

## Input
- [ ] Text input toggle — let user type the answer instead of using multiple choice buttons

## Progress & Stats
- [x] Persist session stats to localStorage (accuracy per key, accuracy per scale degree)
- [x] Streak counter — consecutive passing sessions (≥7/10), shown on results screen
- [ ] Highlight weak spots — surface which numbers or keys have the lowest accuracy over time
- [ ] Stats dashboard — dedicated page showing accuracy per key, per scale degree, and streak history

## Difficulty
- [ ] Start with "guitar player's keys" (G, D, A, E, C) and unlock others as accuracy improves
- [ ] Option to disable key unlocking and go free across all 12 keys

## Fretboard Visual
- [x] SVG fretboard — 5 strings (B E A D G), frets 0–4, labeled strings, dot marker at 3rd fret

## UI
- [ ] Redesign color scheme
