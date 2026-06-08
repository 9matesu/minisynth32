import { useEffect, useState } from 'react';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function midiNoteToName(midi: number): string {
  const octave = Math.floor(midi / 12) - 1;
  const noteName = NOTE_NAMES[midi % 12];
  return `${noteName}${octave}`;
}

function midiNoteToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

interface UseMidiProps {
  onNoteOn?: (note: string, freq: number, velocity: number) => void;
  onNoteOff?: (note: string) => void;
}

export function useMidi({ onNoteOn, onNoteOff }: UseMidiProps) {
  const [midiAccess, setMidiAccess] = useState<MIDIAccess | null>(null);
  const [midiError, setMidiError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.requestMIDIAccess) {
      setMidiError('Web MIDI API is not supported in this browser.');
      return;
    }

    let access: MIDIAccess;

    const handleMIDIMessage = (event: MIDIMessageEvent) => {
      const data = event.data;
      if (!data || data.length < 3) return;

      const [command, note, velocity] = data;
      const cmd = command >> 4;
      const channel = command & 0xf;

      // cmd 9 = note on, cmd 8 = note off
      // some devices send note on with velocity 0 for note off
      if (cmd === 9 && velocity > 0) {
        if (onNoteOn) {
          onNoteOn(midiNoteToName(note), midiNoteToFreq(note), velocity);
        }
      } else if (cmd === 8 || (cmd === 9 && velocity === 0)) {
        if (onNoteOff) {
          onNoteOff(midiNoteToName(note));
        }
      }
    };

    const attachListeners = (midi: MIDIAccess) => {
      midi.inputs.forEach((input) => {
        input.onmidimessage = handleMIDIMessage;
      });
    };

    navigator
      .requestMIDIAccess()
      .then((midi) => {
        setMidiAccess(midi);
        access = midi;
        attachListeners(midi);

        midi.onstatechange = (e) => {
          attachListeners(midi);
        };
      })
      .catch((err) => {
        console.error('MIDI Access Error:', err);
        setMidiError('Failed to get MIDI access.');
      });

    return () => {
      if (access) {
        access.inputs.forEach((input) => {
          input.onmidimessage = null;
        });
        access.onstatechange = null;
      }
    };
  }, [onNoteOn, onNoteOff]);

  return { midiAccess, midiError };
}
