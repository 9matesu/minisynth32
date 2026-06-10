import { useMemo, useState, useEffect } from 'react';
import { FrontPage } from './components/FrontPage';
import { CheckupPage } from './components/CheckupPage';
import { TutorialPage } from './components/TutorialPage';
import { IntegratedTutorial } from './components/IntegratedTutorial';
import { ClassSelector } from './components/ClassSelector';
import { useSynthState } from './hooks/useSynthState';
import type { SynthState, Waveform } from './types';
import { CircleCheck, BookOpen, Volume2, Settings2 } from 'lucide-react';

// Modules
import { WaveDisplay } from './components/synth/WaveDisplay';
import { OscillatorModule } from './components/synth/OscillatorModule';
import { EnvelopeModule } from './components/synth/EnvelopeModule';
import { FilterModule } from './components/synth/FilterModule';
import { KeyboardModule } from './components/synth/KeyboardModule';

const PIANO_KEYS = [
  { note: 'C4', key: 'A', type: 'white', isBlack: false },
  { note: 'C#4', key: 'W', type: 'black', isBlack: true },
  { note: 'D4', key: 'S', type: 'white', isBlack: false },
  { note: 'D#4', key: 'E', type: 'black', isBlack: true },
  { note: 'E4', key: 'D', type: 'white', isBlack: false },
  { note: 'F4', key: 'F', type: 'white', isBlack: false },
  { note: 'F#4', key: 'T', type: 'black', isBlack: true },
  { note: 'G4', key: 'G', type: 'white', isBlack: false },
  { note: 'G#4', key: 'Y', type: 'black', isBlack: true },
  { note: 'A4', key: 'H', type: 'white', isBlack: false },
  { note: 'A#4', key: 'U', type: 'black', isBlack: true },
  { note: 'B4', key: 'J', type: 'white', isBlack: false },
  { note: 'C5', key: 'K', type: 'white', isBlack: false },
  { note: 'C#5', key: 'O', type: 'black', isBlack: true },
  { note: 'D5', key: 'L', type: 'white', isBlack: false },
  { note: 'D#5', key: 'P', type: 'black', isBlack: true },
];

const WAVEFORM_NAMES: Waveform[] = ['square', 'sine', 'saw', 'noise'];
const waveformToIndex = (w: Waveform): number => WAVEFORM_NAMES.indexOf(w);
const indexToWaveform = (i: number): Waveform => WAVEFORM_NAMES[i] ?? 'square';

type Patch = {
  name: string;
  wave: number;
  tune: number;
  level: number;
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  filterOn: boolean;
  cutoff: number;
  resonance: number;
  envelope: number;
  filterSlope: 12 | 24;
  arpOn: boolean;
  arpRate: number;
};

function synthStateToPatch(s: SynthState, name = 'Backend'): Patch {
  return {
    name,
    wave: waveformToIndex(s.osc1.waveform),
    tune: (s.osc1.octave + 2) * 25,
    level: s.osc1.volume,
    attack: s.ampAdsr.attack,
    decay: s.ampAdsr.decay,
    sustain: s.ampAdsr.sustain,
    release: s.ampAdsr.release,
    filterOn: s.filter.enabled,
    cutoff: s.filter.cutoff,
    resonance: s.filter.resonance,
    envelope: s.filter.envelope,
    filterSlope: s.filter.slope,
    arpOn: s.arpeggiator.enabled,
    arpRate: s.arpeggiator.rate,
  };
}

function getNoteFrequency(note: string): number {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const regex = /^([A-G]#?)(\d)$/;
  const match = note.match(regex);
  if (!match) return 440;
  
  const name = match[1];
  const octave = parseInt(match[2], 10);
  const noteIndex = notes.indexOf(name);
  
  const midiNote = noteIndex + (octave + 1) * 12;
  return 440 * Math.pow(2, (midiNote - 69) / 12);
}

export default function App() {
  const synth = useSynthState();
  const patch = useMemo(() => synthStateToPatch(synth.state), [synth.state]);

  const [currentView, setCurrentView] = useState<'front' | 'checkup' | 'tutorial' | 'synth'>('front');
  const [tutorialMode, setTutorialMode] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [completedClasses, setCompletedClasses] = useState<Set<string>>(new Set());
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [highlightedControl, setHighlightedControl] = useState<string | null>(null);
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());

  const updatePatch = <K extends keyof Patch>(key: K, value: Patch[K]) => {
    switch (key) {
      case 'wave': synth.setParam('osc1.waveform', indexToWaveform(value as number)); break;
      case 'tune': synth.setParam('osc1.octave', Math.round((value as number) / 25) - 2); break;
      case 'level': synth.setParam('osc1.volume', value as number); break;
      case 'attack': synth.setParam('ampAdsr.attack', value as number); break;
      case 'decay': synth.setParam('ampAdsr.decay', value as number); break;
      case 'sustain': synth.setParam('ampAdsr.sustain', value as number); break;
      case 'release': synth.setParam('ampAdsr.release', value as number); break;
      case 'filterOn': synth.setParam('filter.enabled', value as boolean); break;
      case 'cutoff': synth.setParam('filter.cutoff', value as number); break;
      case 'resonance': synth.setParam('filter.resonance', value as number); break;
      case 'envelope': synth.setParam('filter.envelope', value as number); break;
      case 'filterSlope': synth.setParam('filter.slope', value as (12 | 24)); break;
    }
  };

  useEffect(() => {
    if (currentView !== 'synth') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const keyMap = PIANO_KEYS.find(k => k.key === e.key.toUpperCase());
      if (keyMap && !activeNotes.has(keyMap.note)) {
        const freq = getNoteFrequency(keyMap.note);
        synth.sendNoteOn(keyMap.note, freq);
        setActiveNotes(prev => new Set(prev).add(keyMap.note));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const keyMap = PIANO_KEYS.find(k => k.key === e.key.toUpperCase());
      if (keyMap && activeNotes.has(keyMap.note)) {
        const freq = getNoteFrequency(keyMap.note);
        synth.sendNoteOff(keyMap.note, freq);
        setActiveNotes(prev => {
          const next = new Set(prev);
          next.delete(keyMap.note);
          return next;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [currentView, activeNotes, synth]);

  if (currentView === 'front') return <FrontPage onNavigate={(v) => setCurrentView(v === 'synth' ? 'checkup' : v)} onLearn={() => { setCurrentView('checkup'); setTutorialMode(true); }} />;
  if (currentView === 'checkup') return <CheckupPage synth={synth} onComplete={() => setCurrentView('synth')} onBack={() => { setCurrentView('front'); setTutorialMode(false); }} />;
  if (currentView === 'tutorial') return <TutorialPage onClose={() => setCurrentView('front')} />;

  return (
    <div className="flex h-screen w-full bg-background font-sans text-text overflow-hidden">
      {/* Left Panel: Educational Dashboard */}
      <aside className="w-[340px] md:w-[400px] border-r border-border bg-panel flex flex-col shadow-[0_0_15px_rgba(0,0,0,0.02)] z-10 relative">
        <div className="p-6 border-b border-border flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border border-border shadow-sm">
              <img src="/images/avatar.png" alt="User Profile" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] text-textDim">Volt-Ampère Engine</h2>
              <p className="text-sm text-text font-semibold flex items-center gap-2">
                Level 1 <span className="text-[10px] bg-border px-2 py-0.5 rounded-full text-textDim font-mono">Novice</span>
              </p>
            </div>
          </div>
          <div className="h-1 w-full bg-background rounded-full overflow-hidden">
            <div className="h-full bg-primary w-1/4 transition-all duration-1000" />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          <div className="flex gap-3 bg-background p-1 rounded-xl border border-border">
            <button 
              onClick={() => setTutorialMode(false)} 
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-xs font-semibold transition-colors ${!tutorialMode ? 'bg-panel text-text shadow-sm border border-border/50' : 'bg-transparent text-textDim hover:text-text'}`}
            >
              <Settings2 size={14} /> Free Play
            </button>
            <button 
              onClick={() => setTutorialMode(true)} 
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-xs font-semibold transition-colors ${tutorialMode ? 'bg-text text-panel shadow-sm' : 'bg-transparent text-textDim hover:text-text'}`}
            >
              <BookOpen size={14} /> Learn
            </button>
          </div>

          <div className="flex-1">
            {tutorialMode ? (
              <div className="flex flex-col gap-4 h-full">
                {selectedClass === null ? (
                  <ClassSelector 
                    selectedClass={selectedClass} 
                    onSelectClass={setSelectedClass} 
                    completedClasses={completedClasses}
                  />
                ) : (
                  <IntegratedTutorial
                    onClose={() => {
                      setTutorialMode(false);
                      setSelectedClass(null);
                      setCompletedTasks(new Set());
                      setHighlightedControl(null);
                    }}
                    onClassComplete={(classId) => {
                      setCompletedClasses(new Set(completedClasses).add(classId));
                      setSelectedClass(null);
                      setCompletedTasks(new Set());
                      setHighlightedControl(null);
                    }}
                    selectedClass={selectedClass}
                    completedTasks={completedTasks}
                    onTaskComplete={(taskId) => setCompletedTasks(new Set(completedTasks).add(taskId))}
                    onHighlightChange={setHighlightedControl}
                  />
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-[10px] uppercase tracking-[0.1em] font-bold text-textDim mb-3">Achievements</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1.5 rounded-full border border-border text-[11px] font-semibold flex items-center gap-1.5 bg-panel text-textDim">
                      <CircleCheck size={12} className="text-border" /> Filter Mastery
                    </span>
                    <span className="px-3 py-1.5 rounded-full border border-border text-[11px] font-semibold flex items-center gap-1.5 bg-panel text-textDim">
                      <CircleCheck size={12} className="text-border" /> First Sound
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-[10px] uppercase tracking-[0.1em] font-bold text-textDim mb-3">Quick Presets</h3>
                  <div className="flex flex-col gap-2">
                     <button className="text-left px-4 py-3 rounded-xl border border-border bg-panel hover:bg-background transition-colors text-sm font-medium text-text flex items-center justify-between">
                       Init Patch <Volume2 size={14} className="text-textDim" />
                     </button>
                     <button className="text-left px-4 py-3 rounded-xl border border-border bg-panel hover:bg-background transition-colors text-sm font-medium text-text flex items-center justify-between">
                       Deep Bass <Volume2 size={14} className="text-textDim" />
                     </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-4 border-t border-border">
          <button 
            onClick={() => { setCurrentView('front'); setTutorialMode(false); }}
            className="w-full py-2 text-xs font-semibold text-textDim hover:text-text transition-colors"
          >
            ← Disconnect & Return
          </button>
        </div>
      </aside>

      {/* Right Panel: Synthesizer Controllable UI */}
      <main className="flex-1 flex flex-col bg-background overflow-y-auto relative p-8 items-center justify-center">
        {/* Status Bar */}
        <div className="absolute top-6 right-8 flex items-center gap-3 bg-panel border border-border px-3 py-1.5 rounded-full shadow-sm">
          <div className={`w-2 h-2 rounded-full ${synth.connectionState === 'open' ? 'bg-primary' : 'bg-red-500'} ${synth.connectionState === 'open' ? 'animate-pulse' : ''}`} />
          <span className="text-[10px] text-textDim font-mono font-semibold tracking-widest">
            {synth.connectionState === 'open' ? 'SYNCED' : 'OFFLINE'}
          </span>
        </div>

        <div className="w-full max-w-[900px] flex flex-col gap-8">
          <WaveDisplay samples={synth.state.waveDisplay.samples} />

          {/* Controls Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <OscillatorModule 
              wave={patch.wave} 
              tune={patch.tune} 
              level={patch.level} 
              onWaveChange={(v) => updatePatch('wave', v)} 
              onTuneChange={(v) => updatePatch('tune', v)} 
              onLevelChange={(v) => updatePatch('level', v)} 
            />
            
            <EnvelopeModule 
              attack={patch.attack} 
              decay={patch.decay} 
              sustain={patch.sustain} 
              release={patch.release} 
              onAttackChange={(v) => updatePatch('attack', v)} 
              onDecayChange={(v) => updatePatch('decay', v)} 
              onSustainChange={(v) => updatePatch('sustain', v)} 
              onReleaseChange={(v) => updatePatch('release', v)} 
            />

            <FilterModule 
              filterOn={patch.filterOn} 
              cutoff={patch.cutoff} 
              resonance={patch.resonance} 
              envelope={patch.envelope} 
              filterSlope={patch.filterSlope} 
              onFilterToggle={() => updatePatch('filterOn', !patch.filterOn)} 
              onCutoffChange={(v) => updatePatch('cutoff', v)} 
              onResonanceChange={(v) => updatePatch('resonance', v)} 
              onEnvelopeChange={(v) => updatePatch('envelope', v)} 
              onSlopeChange={() => updatePatch('filterSlope', patch.filterSlope === 12 ? 24 : 12)} 
            />
          </div>

          {/* Keyboard */}
          <KeyboardModule
            keys={PIANO_KEYS}
            activeNotes={activeNotes}
            onNoteOn={(note) => {
              const freq = getNoteFrequency(note);
              synth.sendNoteOn(note, freq);
              setActiveNotes(prev => new Set(prev).add(note));
            }}
            onNoteOff={(note) => {
              const freq = getNoteFrequency(note);
              synth.sendNoteOff(note, freq);
              setActiveNotes(prev => {
                const next = new Set(prev);
                next.delete(note);
                return next;
              });
            }}
          />
        </div>
      </main>
    </div>
  );
}
