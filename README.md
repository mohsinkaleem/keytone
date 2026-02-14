# Keytone

A typing practice app that turns your keystrokes into music. Every correct character plays a harmonious note, while errors create discordant sounds - making typing practice both fun and immersive.

## Features

### Typing Practice
- **40+ sample texts** across 6 categories: Quotes, Prose, Poetry, Code, Pangrams, Facts
- **Auto-start** - Just start typing, no clicks needed
- **Real-time feedback** - Green for correct, red for errors
- **Progress tracking** - See your WPM, accuracy, and streak

### Musical Feedback
- Correct keystrokes play melodic notes (pentatonic scale)
- Errors play discordant sounds
- Completion triggers a celebratory chord
- 4 sound types: Soft (sine), Warm (triangle), Retro (square), Bright (sawtooth)

### Score System
- +10 points per correct character
- Streak multipliers: 2x at 10, 3x at 25, 5x at 50, 10x at 100
- -5 penalty for errors
- Accuracy bonus: +500 (≥95%), +250 (≥90%), +100 (≥85%)
- Speed bonus: +500 (≥80 WPM), +250 (≥60 WPM), +100 (≥40 WPM)

### Keyboard Shortcuts
- `Tab` - Get a new random text
- `Esc` - Restart current text

## Quick Start

```bash
npm install
npm run dev
```

## Tech Stack
- React + TypeScript
- Vite
- Tailwind CSS
- Web Audio API

### !important
Use playwright-cli to test the app at the end if needed