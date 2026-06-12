import { useMemo, useState, useEffect, useCallback } from 'react';
import { useUser } from './hooks/useUser';
import { FrontPage } from './components/FrontPage';
import { CheckupPage } from './components/CheckupPage';
import { TutorialPage } from './components/TutorialPage';
import { IntegratedTutorial } from './components/IntegratedTutorial';
import { HelpTooltip } from './components/HelpTooltip';
import { ClassSelector } from './components/ClassSelector';
import { useSynthState } from './hooks/useSynthState';
import { type SynthState, type Waveform, DEFAULT_SYNTH_STATE } from './types';
import { CircleCheck, BookOpen, Volume2, Settings2, Trash2, HelpCircle } from 'lucide-react';
import { playSequence } from './lib/sequencer';

// Modules
import { OscillatorModule } from './components/synth/OscillatorModule';
import { EnvelopeModule } from './components/synth/EnvelopeModule';
import { FilterModule } from './components/synth/FilterModule';
import { KeyboardModule } from './components/synth/KeyboardModule';
import { ArpeggiatorModule } from './components/synth/ArpeggiatorModule';

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

const WAVEFORM_NAMES: Waveform[] = ['square', 'sine', 'saw', 'triangle'];
const waveformToIndex = (w: Waveform): number => WAVEFORM_NAMES.indexOf(w);
const indexToWaveform = (i: number): Waveform => WAVEFORM_NAMES[i] ?? 'square';

export type Patch = {
  name: string;
  wave: number;
  tune: number;
  detune: number;
  level: number;
  voices: number;
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
  multiCore: boolean;
};

function synthStateToPatch(s: SynthState, name = 'Backend'): Patch {
  return {
    name,
    wave: waveformToIndex(s.osc1.waveform),
    tune: (s.osc1.octave + 2) * 25,
    detune: s.osc1.detune,
    level: s.osc1.volume,
    voices: s.global.voices,
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
    multiCore: s.global.multiCore,
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
  const [xp, setXp] = useState(0);
  const [isHelpMode, setIsHelpMode] = useState(false);

  const { user, loading: userLoading, updateUser } = useUser();

  useEffect(() => {
    if (user) {
      setXp(user.xp);
      setCompletedTasks(new Set(user.completedTasks));
      setCompletedClasses(new Set(user.settings?.completedClasses || []));
    }
  }, [user]);

  const handleTaskComplete = useCallback((taskId: string) => {
    setCompletedTasks(prev => {
      if (prev.has(taskId)) return prev;
      const next = new Set(prev).add(taskId);
      const newXp = xp + 10;
      setXp(newXp);
      updateUser({
        xp: newXp,
        completedTasks: Array.from(next),
        settings: { completedClasses: Array.from(completedClasses) }
      });
      return next;
    });
  }, [xp, completedClasses, updateUser]);

  const handleClassComplete = useCallback((classId: string) => {
    setCompletedClasses(prev => {
      if (prev.has(classId)) return prev;
      const next = new Set(prev).add(classId);
      const newXp = xp + 100;
      setXp(newXp);
      updateUser({
        xp: newXp,
        completedTasks: Array.from(completedTasks),
        settings: { completedClasses: Array.from(next) }
      });
      return next;
    });
  }, [xp, completedTasks, updateUser]);

  const applyInitState = (initPatch?: Partial<Patch>) => {
    const defaultPatch = synthStateToPatch(DEFAULT_SYNTH_STATE);
    const mergedPatch = { ...defaultPatch, ...(initPatch || {}) };
    Object.entries(mergedPatch).forEach(([key, val]) => {
      updatePatch(key as keyof Patch, val as any);
    });
  };

  const updatePatch = <K extends keyof Patch>(key: K, value: Patch[K]) => {
    switch (key) {
      case 'wave': synth.setParam('osc1.waveform', indexToWaveform(value as number)); break;
      case 'tune': synth.setParam('osc1.octave', Math.round((value as number) / 25) - 2); break;
      case 'detune': synth.setParam('osc1.detune', value as number); break;
      case 'level': synth.setParam('osc1.volume', value as number); break;
      case 'voices': synth.setParam('global.voices', value as number); break;
      case 'attack': synth.setParam('ampAdsr.attack', value as number); break;
      case 'decay': synth.setParam('ampAdsr.decay', value as number); break;
      case 'sustain': synth.setParam('ampAdsr.sustain', value as number); break;
      case 'release': synth.setParam('ampAdsr.release', value as number); break;
      case 'filterOn': synth.setParam('filter.enabled', value as boolean); break;
      case 'cutoff': synth.setParam('filter.cutoff', value as number); break;
      case 'resonance': synth.setParam('filter.resonance', value as number); break;
      case 'envelope': synth.setParam('filter.envelope', value as number); break;
      case 'filterSlope': synth.setParam('filter.slope', value as (12 | 24)); break;
      case 'arpOn': synth.setParam('arpeggiator.enabled', value as boolean); break;
      case 'arpRate': synth.setParam('arpeggiator.rate', value as number); break;
      case 'multiCore': synth.setParam('global.multiCore', value as boolean); break;
    }
  };

  const handleOctaveDown = useCallback(() => {
    const newOctave = Math.max(-2, synth.state.osc1.octave - 1);
    synth.setParam('osc1.octave', newOctave);
  }, [synth]);

  const handleOctaveUp = useCallback(() => {
    const newOctave = Math.min(2, synth.state.osc1.octave + 1);
    synth.setParam('osc1.octave', newOctave);
  }, [synth]);

  useEffect(() => {
    if (currentView !== 'synth') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;

      const keyUpper = e.key.toUpperCase();
      if (keyUpper === 'Z') {
        handleOctaveDown();
        return;
      }
      if (keyUpper === 'X') {
        handleOctaveUp();
        return;
      }

      const keyMap = PIANO_KEYS.find(k => k.key === keyUpper);
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
              <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] text-textDim">Sintetizador</h2>
              <p className="text-sm text-text font-semibold flex items-center gap-2">
                Nível {Math.floor(xp / 100) + 1} <span className="text-[10px] bg-border px-2 py-0.5 rounded-full text-textDim font-mono">{xp} XP</span>
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
              <Settings2 size={14} /> Modo Livre
            </button>
            <button 
              onClick={() => setTutorialMode(true)} 
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-xs font-semibold transition-colors ${tutorialMode ? 'bg-text text-panel shadow-sm' : 'bg-transparent text-textDim hover:text-text'}`}
            >
              <BookOpen size={14} /> Aprender
            </button>
          </div>

          <div className="flex-1">
            {tutorialMode ? (
              <div className="flex flex-col gap-4 h-full">
                {selectedClass === null ? (
                  <ClassSelector 
                    selectedClass={selectedClass} 
                    onSelectClass={(id) => {
                      setSelectedClass(id);
                      setCompletedTasks(new Set());
                      setHighlightedControl(null);
                    }} 
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
                      handleClassComplete(classId);
                      
                      const currentMatch = classId.match(/\d+/);
                      if (currentMatch) {
                        const nextId = parseInt(currentMatch[0]) + 1;
                        if (nextId <= 5) { // Passa para a próxima aula
                          setSelectedClass(`class-${nextId}`);
                          return;
                        }
                      }
                      
                      setSelectedClass(null);
                      setHighlightedControl(null);
                      // applyInitState(); // Remove resetting preset when finishing tutorial
                    }}
                    onInitPatch={applyInitState}
                    selectedClass={selectedClass}
                    completedTasks={completedTasks}
                    onTaskComplete={handleTaskComplete}
                    onHighlightChange={setHighlightedControl}
                    onPlayMelody={(melody) => {
                      return playSequence(
                        melody,
                        (note) => {
                          const freq = getNoteFrequency(note);
                          synth.sendNoteOn(note, freq);
                          setActiveNotes(prev => new Set(prev).add(note));
                        },
                        (note) => {
                          const freq = getNoteFrequency(note);
                          synth.sendNoteOff(note, freq);
                          setActiveNotes(prev => {
                            const next = new Set(prev);
                            next.delete(note);
                            return next;
                          });
                        }
                      );
                    }}
                    patch={patch}
                  />
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-[10px] uppercase tracking-[0.1em] font-bold text-textDim mb-3">Conquistas</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1.5 rounded-full border border-border text-[11px] font-semibold flex items-center gap-1.5 bg-panel text-textDim">
                      <CircleCheck size={12} className="text-border" /> Mestre do Filtro
                    </span>
                    <span className="px-3 py-1.5 rounded-full border border-border text-[11px] font-semibold flex items-center gap-1.5 bg-panel text-textDim">
                      <CircleCheck size={12} className="text-border" /> Primeiro Som
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[10px] uppercase tracking-[0.1em] font-bold text-textDim">Presets</h3>
                    <button 
                      onClick={() => {
                        const name = prompt('Nome do Preset:');
                        if (name) synth.savePreset(name);
                      }}
                      className="text-[10px] bg-primary/10 text-primary hover:bg-primary/20 px-2 py-0.5 rounded font-bold uppercase tracking-widest transition-colors"
                    >
                      Salvar
                    </button>
                  </div>
                  <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                     {synth.presets.map(p => (
                       <div key={p.id} className="group relative">
                         <button 
                           onClick={() => synth.loadPreset(p.id)}
                           className="w-full text-left px-4 py-3 rounded-xl border border-border bg-panel hover:bg-background transition-all active:scale-[0.98] active:bg-primary/10 text-sm font-medium text-text flex items-center justify-between"
                         >
                           {p.name} 
                           <Volume2 size={14} className="text-textDim group-hover:text-primary transition-colors" />
                         </button>
                         <button
                           onClick={(e) => {
                             e.stopPropagation();
                             if (confirm(`Deseja excluir o preset "${p.name}"?`)) {
                               synth.deletePreset(p.id);
                             }
                           }}
                           className="absolute right-12 top-1/2 -translate-y-1/2 p-2 text-textDim hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                           title="Excluir preset"
                         >
                           <Trash2 size={14} />
                         </button>
                       </div>
                     ))}
                     {synth.presets.length === 0 && (
                       <div className="text-center p-4 border border-dashed border-border rounded-xl text-textDim text-xs font-medium">
                         Nenhum preset salvo
                       </div>
                     )}
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
            ← Desconectar e Voltar
          </button>
        </div>
      </aside>

      {/* Right Panel: Synthesizer Controllable UI */}
      <main className="flex-1 bg-background overflow-y-auto relative">
        <div className="min-h-full flex flex-col items-center justify-center p-8 pt-24 pb-12">
          {/* Status Bar */}
          <div className="absolute top-6 right-8 flex items-center gap-3 z-50">
            <button 
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm ${isHelpMode ? 'bg-primary text-white scale-110 shadow-primary/20' : 'bg-background border border-border text-textDim hover:text-text hover:bg-panel'}`}
              onClick={() => setIsHelpMode(!isHelpMode)}
              aria-label="Toggle Help Mode"
              title="Ativar/Desativar modo de ajuda"
            >
              <HelpCircle size={18} className={isHelpMode ? 'animate-pulse' : ''} />
            </button>
            <div className="flex items-center gap-2 bg-panel border border-border px-3 py-1.5 rounded-full shadow-sm">
              <div className={`w-2 h-2 rounded-full ${synth.connectionState === 'open' ? 'bg-primary' : 'bg-red-500'} ${synth.connectionState === 'open' ? 'animate-pulse' : ''}`} />
              <span className="text-[10px] text-textDim font-mono font-semibold tracking-widest">
                {synth.connectionState === 'open' ? 'CONECTADO' : 'OFFLINE'}
              </span>
            </div>
          </div>

          <div className="w-full max-w-[1000px] flex flex-col gap-6">
            {/* Controls Grid Top Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            <OscillatorModule 
              helpMode={isHelpMode}
              isHighlighted={!!highlightedControl?.match(/wave-select|knob-tune|knob-level/)}
              wave={patch.wave} 
              tune={patch.tune} 
              detune={patch.detune}
              level={patch.level} 
              voices={patch.voices}
              onWaveChange={(v) => updatePatch('wave', v)} 
              onTuneChange={(v) => updatePatch('tune', v)} 
              onDetuneChange={(v) => updatePatch('detune', v)}
              onLevelChange={(v) => updatePatch('level', v)} 
              onVoicesChange={(v) => updatePatch('voices', v)}
            />
            
            <EnvelopeModule 
              helpMode={isHelpMode}
              isHighlighted={!!highlightedControl?.match(/knob-attack|knob-decay|knob-sustain|knob-release/)}
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
              helpMode={isHelpMode}
              isHighlighted={!!highlightedControl?.match(/filter-toggle|knob-cutoff|knob-resonance|knob-envelope|filter-slope/)}
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

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-end">
            <ArpeggiatorModule
              helpMode={isHelpMode}
              arpOn={patch.arpOn}
              arpRate={patch.arpRate}
              onArpToggle={() => updatePatch('arpOn', !patch.arpOn)}
              onRateChange={(v) => updatePatch('arpRate', v)}
            />

            <div className="lg:col-span-2 w-full">
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
                onOctaveDown={handleOctaveDown}
                onOctaveUp={handleOctaveUp}
              />
            </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
