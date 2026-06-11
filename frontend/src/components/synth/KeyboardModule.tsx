import { useMemo } from 'react';
import { HelpTooltip } from '../HelpTooltip';

export interface PianoKey {
  note: string;
  key: string;
  type: string;
  isBlack: boolean;
}

interface KeyboardModuleProps {
  keys: PianoKey[];
  activeNotes: Set<string>;
  onNoteOn: (note: string) => void;
  onNoteOff: (note: string) => void;
  onOctaveDown: () => void;
  onOctaveUp: () => void;
}

export function KeyboardModule({ keys, activeNotes, onNoteOn, onNoteOff, onOctaveDown, onOctaveUp }: KeyboardModuleProps) {
  return (
    <div className="border border-border bg-panel p-6 rounded-2xl flex flex-col gap-6 shadow-sm w-full">
      <div className="flex items-center border-b border-border pb-3">
        <h3 className="text-[10px] font-bold tracking-widest uppercase text-textDim">Teclado</h3>
      </div>
      
      <div className="relative h-40 w-full flex justify-center gap-6">
        {/* Octave Controls */}
        <div className="flex flex-col justify-between h-full py-1">
          <button 
            onClick={onOctaveUp}
            className="flex flex-col items-center justify-center bg-background border border-border hover:bg-border transition-colors rounded-lg h-[48%] w-14 shadow-sm"
          >
            <span className="text-[9px] font-bold text-text">+1 OIT</span>
            <span className="text-[10px] font-mono font-bold text-primary mt-1 border border-border rounded px-1.5">X</span>
          </button>
          <button 
            onClick={onOctaveDown}
            className="flex flex-col items-center justify-center bg-background border border-border hover:bg-border transition-colors rounded-lg h-[48%] w-14 shadow-sm"
          >
            <span className="text-[9px] font-bold text-text">-1 OIT</span>
            <span className="text-[10px] font-mono font-bold text-primary mt-1 border border-border rounded px-1.5">Z</span>
          </button>
        </div>

        <div className="flex relative select-none touch-none">
          {keys.map((k, i) => {
            if (k.isBlack) return null; // We render white keys first, black keys absolute positioned

            const isActive = activeNotes.has(k.note);
            return (
              <div
                key={k.note}
                onMouseDown={() => onNoteOn(k.note)}
                onMouseUp={() => onNoteOff(k.note)}
                onMouseLeave={() => isActive && onNoteOff(k.note)}
                onTouchStart={(e) => { e.preventDefault(); onNoteOn(k.note); }}
                onTouchEnd={(e) => { e.preventDefault(); onNoteOff(k.note); }}
                className={`relative w-12 h-full border border-border border-r-0 last:border-r rounded-b-md flex items-end justify-center pb-2 cursor-pointer transition-all ${
                  isActive ? 'bg-border shadow-inner translate-y-[2px]' : 'bg-panel hover:bg-background'
                }`}
              >
                <span className="text-[10px] font-mono font-bold text-textDim">{k.key}</span>
              </div>
            );
          })}

          {/* Black Keys */}
          {keys.map((k, i) => {
            if (!k.isBlack) return null;

            // Calculate position. This logic depends on the specific PIANO_KEYS array structure.
            // C4, C#4, D4, D#4, E4, F4, F#4, G4, G#4, A4, A#4, B4, C5, C#5, D5, D#5
            // Find how many white keys came before this black key to calculate left offset
            const whiteKeysBefore = keys.slice(0, i).filter(key => !key.isBlack).length;
            
            const isActive = activeNotes.has(k.note);
            
            return (
              <div
                key={k.note}
                onMouseDown={() => onNoteOn(k.note)}
                onMouseUp={() => onNoteOff(k.note)}
                onMouseLeave={() => isActive && onNoteOff(k.note)}
                onTouchStart={(e) => { e.preventDefault(); onNoteOn(k.note); }}
                onTouchEnd={(e) => { e.preventDefault(); onNoteOff(k.note); }}
                className={`absolute w-8 h-2/3 border border-border rounded-b-sm flex items-end justify-center pb-2 cursor-pointer z-10 transition-all ${
                  isActive ? 'bg-textDim translate-y-[2px]' : 'bg-text hover:bg-text/90'
                }`}
                style={{
                  left: `${whiteKeysBefore * 48 - 16}px`, // 48px is w-12, 16px is half of w-8
                }}
              >
                <span className="text-[9px] font-mono font-bold text-panel">{k.key}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
