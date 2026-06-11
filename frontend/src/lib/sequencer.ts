export type NoteEvent = {
  timeMs: number;
  note: string;
  type: 'on' | 'off';
};

export const JUMP_MELODY: NoteEvent[] = [
  { timeMs: 0, note: 'G4', type: 'on' },
  { timeMs: 150, note: 'G4', type: 'off' },
  { timeMs: 300, note: 'G4', type: 'on' },
  { timeMs: 450, note: 'G4', type: 'off' },
  { timeMs: 600, note: 'C5', type: 'on' },
  { timeMs: 900, note: 'C5', type: 'off' },
  { timeMs: 1050, note: 'F4', type: 'on' },
  { timeMs: 1350, note: 'F4', type: 'off' },
  { timeMs: 1500, note: 'F4', type: 'on' },
  { timeMs: 1650, note: 'F4', type: 'off' },
  { timeMs: 1800, note: 'G4', type: 'on' },
  { timeMs: 2100, note: 'G4', type: 'off' },
];

export const TAKE_ON_ME_MELODY: NoteEvent[] = [
  { timeMs: 0, note: 'F#4', type: 'on' },
  { timeMs: 150, note: 'F#4', type: 'off' },
  { timeMs: 200, note: 'F#4', type: 'on' },
  { timeMs: 350, note: 'F#4', type: 'off' },
  { timeMs: 400, note: 'E4', type: 'on' },
  { timeMs: 550, note: 'E4', type: 'off' },
  { timeMs: 600, note: 'D4', type: 'on' },
  { timeMs: 750, note: 'D4', type: 'off' },
  { timeMs: 800, note: 'E4', type: 'on' },
  { timeMs: 950, note: 'E4', type: 'off' },
  { timeMs: 1200, note: 'E4', type: 'on' },
  { timeMs: 1350, note: 'E4', type: 'off' },
  { timeMs: 1400, note: 'E4', type: 'on' },
  { timeMs: 1550, note: 'E4', type: 'off' },
];

export function playSequence(
  sequence: NoteEvent[],
  onNoteOn: (note: string) => void,
  onNoteOff: (note: string) => void,
  onFinish?: () => void
) {
  let timeouts: number[] = [];

  sequence.forEach((event) => {
    const t = window.setTimeout(() => {
      if (event.type === 'on') {
        onNoteOn(event.note);
      } else {
        onNoteOff(event.note);
      }
    }, event.timeMs);
    timeouts.push(t);
  });

  const maxTime = Math.max(...sequence.map(e => e.timeMs));
  const finishTimeout = window.setTimeout(() => {
    if (onFinish) onFinish();
  }, maxTime + 100);
  
  timeouts.push(finishTimeout);

  // Return a stop function
  return () => {
    timeouts.forEach(t => window.clearTimeout(t));
    // Turn off all notes in sequence to be safe
    const uniqueNotes = Array.from(new Set(sequence.map(e => e.note)));
    uniqueNotes.forEach(note => onNoteOff(note));
  };
}
