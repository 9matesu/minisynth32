import { useMemo, useState, useEffect, useCallback } from 'react';
import { Knob } from './components/Knob';
import { LedGroupBtn } from './components/LedGroupBtn';
import { HelpButton } from './components/HelpButton';
import { WaveSaw, WaveSquare } from './components/Waves';
import { FrontPage } from './components/FrontPage';
import { CheckupPage } from './components/CheckupPage';
import { TutorialPage } from './components/TutorialPage';
import { IntegratedTutorial } from './components/IntegratedTutorial';
import { ClassSelector } from './components/ClassSelector';
import { useSynthState } from './hooks/useSynthState';
import type { SynthState, Waveform } from './types';

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

function WaveSine() {
  return (
    <svg className="wave-icon" viewBox="0 0 24 12" aria-hidden="true">
      <path d="M1 6 C4 1, 8 1, 12 6 S20 11, 23 6" />
    </svg>
  );
}

function WaveNoise() {
  return (
    <svg className="wave-icon" viewBox="0 0 24 12" aria-hidden="true">
      <path d="M1 8 L4 3 L7 9 L10 2 L13 8 L16 4 L19 10 L23 5" />
    </svg>
  );
}

// ── Waveform index ↔ backend string mapping ─────────────────
const WAVEFORM_NAMES: Waveform[] = ['square', 'sine', 'saw', 'noise'];
const waveformToIndex = (w: Waveform): number => WAVEFORM_NAMES.indexOf(w);
const indexToWaveform = (i: number): Waveform => WAVEFORM_NAMES[i] ?? 'square';

// ── SynthState → Patch conversion ────────────────────────────
function synthStateToPatch(s: SynthState, name = 'Backend'): Patch {
  return {
    name,
    wave: waveformToIndex(s.osc1.waveform),
    tune: (s.osc1.octave + 2) * 25,         // octave -2..2 → 0..100
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

function WaveDisplay({ samples }: { samples: number[] }) {
  const pathD = useMemo(() => {
    if (!samples || samples.length === 0) return '';
    const w = 162;
    const h = 60;
    const mid = h / 2;
    const step = w / (samples.length - 1 || 1);
    return samples
      .map((s, i) => {
        const x = i * step;
        const y = mid - s * (mid - 2);   // map -1..1 → 2..58
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  }, [samples]);

  return (
    <div className="wave-display">
      <div className="wave-display__header">
        <span className="mfb-label"></span>
      </div>

      <div className="wave-display__screen">
        <svg viewBox="0 0 162 60" className="wave-display__svg" aria-label="Visualizacao da onda">
          <defs>
            <pattern id="scopeGrid" width="18" height="15" patternUnits="userSpaceOnUse">
              <path d="M 18 0 L 0 0 0 15" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            </pattern>
          </defs>

          <rect x="0" y="0" width="162" height="60" fill="url(#scopeGrid)" />
          <line x1="0" y1="30" x2="162" y2="30" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke="#00ff88"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ filter: 'drop-shadow(0 0 3px #00ff8866)' }}
            />
          )}
        </svg>
      </div>
    </div>
  );
}

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
  arpRate: number; // 0: 1/32, 1: 1/24, 2: 1/16, 3: 1/8, 4: 1/4
};

const INITIAL_PRESETS: Patch[] = [
  {
    name: 'Patch Inicial',
    wave: 0,
    tune: 50,
    level: 72,
    attack: 12,
    decay: 46,
    sustain: 78,
    release: 34,
    filterOn: true,
    cutoff: 58,
    resonance: 36,
    envelope: 42,
    filterSlope: 12,
    arpOn: false,
    arpRate: 2,
  },
  {
    name: 'Baixo Profundo',
    wave: 0,
    tune: 38,
    level: 88,
    attack: 5,
    decay: 28,
    sustain: 82,
    release: 20,
    filterOn: true,
    cutoff: 34,
    resonance: 52,
    envelope: 58,
    filterSlope: 24,
    arpOn: false,
    arpRate: 2,
  },
  {
    name: 'Lead de Vidro',
    wave: 2,
    tune: 64,
    level: 76,
    attack: 8,
    decay: 34,
    sustain: 62,
    release: 26,
    filterOn: true,
    cutoff: 72,
    resonance: 48,
    envelope: 44,
    filterSlope: 12,
    arpOn: false,
    arpRate: 2,
  },
  {
    name: 'Orgao de Fita',
    wave: 1,
    tune: 48,
    level: 68,
    attack: 2,
    decay: 18,
    sustain: 92,
    release: 16,
    filterOn: false,
    cutoff: 64,
    resonance: 18,
    envelope: 20,
    filterSlope: 12,
    arpOn: false,
    arpRate: 2,
  },
  {
    name: 'Pluck Suave',
    wave: 2,
    tune: 56,
    level: 70,
    attack: 3,
    decay: 42,
    sustain: 28,
    release: 18,
    filterOn: true,
    cutoff: 48,
    resonance: 30,
    envelope: 76,
    filterSlope: 24,
    arpOn: true,
    arpRate: 3,
  },
  {
    name: 'Square Saturado',
    wave: 0,
    tune: 52,
    level: 90,
    attack: 4,
    decay: 36,
    sustain: 66,
    release: 22,
    filterOn: true,
    cutoff: 44,
    resonance: 62,
    envelope: 54,
    filterSlope: 24,
    arpOn: false,
    arpRate: 2,
  },
  {
    name: 'Pad Noturno',
    wave: 1,
    tune: 46,
    level: 64,
    attack: 42,
    decay: 36,
    sustain: 74,
    release: 58,
    filterOn: true,
    cutoff: 52,
    resonance: 24,
    envelope: 36,
    filterSlope: 12,
    arpOn: false,
    arpRate: 2,
  },
  {
    name: 'Pulso Mono',
    wave: 0,
    tune: 58,
    level: 84,
    attack: 6,
    decay: 24,
    sustain: 70,
    release: 15,
    filterOn: true,
    cutoff: 40,
    resonance: 58,
    envelope: 50,
    filterSlope: 24,
    arpOn: false,
    arpRate: 2,
  },
];

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
  // ── Backend connection ───────────────────────────────────────
  const synth = useSynthState();

  // ── Derived local patch from backend state ──────────────────
  const patch = useMemo(() => synthStateToPatch(synth.state), [synth.state]);

  // ── Local UI state ──────────────────────────────────────────
  const [currentView, setCurrentView] = useState<'front' | 'checkup' | 'tutorial' | 'synth'>('front');
  const [presetIndex, setPresetIndex] = useState(0);
  const [saveFlash, setSaveFlash] = useState(false);
  const [helpMode, setHelpMode] = useState(false);
  const [tutorialMode, setTutorialMode] = useState(false);
  const [isPresetExpanded, setIsPresetExpanded] = useState(false);
  const [isTutorialExpanded, setIsTutorialExpanded] = useState(true);
  const [isPianoExpanded, setIsPianoExpanded] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [completedClasses, setCompletedClasses] = useState<Set<string>>(new Set());
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [highlightedControl, setHighlightedControl] = useState<string | null>(null);
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());

  const [lastKnobValues, setLastKnobValues] = useState<Record<string, number>>({
    tune: patch.tune,
    level: patch.level,
    attack: patch.attack,
    decay: patch.decay,
    sustain: patch.sustain,
    release: patch.release,
    cutoff: patch.cutoff,
    resonance: patch.resonance,
    envelope: patch.envelope,
  });

  // ── Presets from backend + local fallback ────────────────────
  const backendPresets = synth.presets;
  const localPresets: Patch[] = useMemo(
    () => backendPresets.length > 0
      ? backendPresets.map((p) => synthStateToPatch(p.state, p.name))
      : INITIAL_PRESETS,
    [backendPresets]
  );
  const activePreset = useMemo(
    () => localPresets[Math.min(presetIndex, localPresets.length - 1)] ?? localPresets[0],
    [localPresets, presetIndex]
  );

  // Tutorial task completion detection
  useEffect(() => {
    if (!tutorialMode) return;

    const newCompletedTasks = new Set(completedTasks);

    // Check if specific controls have been adjusted
    if (patch.tune !== lastKnobValues.tune) newCompletedTasks.add('tune');
    if (patch.level !== lastKnobValues.level) newCompletedTasks.add('level');
    if (patch.attack !== lastKnobValues.attack) newCompletedTasks.add('attack');
    if (patch.decay !== lastKnobValues.decay) newCompletedTasks.add('decay');
    if (patch.sustain !== lastKnobValues.sustain) newCompletedTasks.add('sustain');
    if (patch.release !== lastKnobValues.release) newCompletedTasks.add('release');
    if (patch.cutoff !== lastKnobValues.cutoff) newCompletedTasks.add('cutoff');
    if (patch.resonance !== lastKnobValues.resonance) newCompletedTasks.add('resonance');
    if (patch.envelope !== lastKnobValues.envelope) newCompletedTasks.add('envelope');

    if (newCompletedTasks.size > completedTasks.size) {
      setCompletedTasks(newCompletedTasks);
      setLastKnobValues({
        tune: patch.tune,
        level: patch.level,
        attack: patch.attack,
        decay: patch.decay,
        sustain: patch.sustain,
        release: patch.release,
        cutoff: patch.cutoff,
        resonance: patch.resonance,
        envelope: patch.envelope,
      });
    }
  }, [patch, tutorialMode, completedTasks, lastKnobValues]);

  const loadPreset = useCallback((index: number) => {
    setPresetIndex(index);
    // If we have backend presets, load from backend (updates state via WS)
    if (backendPresets.length > 0 && backendPresets[index]) {
      synth.loadPreset(backendPresets[index].id);
    }
  }, [backendPresets, synth]);

  const prevPreset = () => {
    const len = localPresets.length;
    const nextIndex = (presetIndex - 1 + len) % len;
    loadPreset(nextIndex);
  };

  const nextPreset = () => {
    const len = localPresets.length;
    const nextIndex = (presetIndex + 1) % len;
    loadPreset(nextIndex);
  };

  // ── Patch key → backend param path mapping ──────────────────
  const updatePatch = <K extends keyof Patch>(key: K, value: Patch[K]) => {
    // Send to backend via WebSocket
    switch (key) {
      case 'wave':
        synth.setParam('osc1.waveform', indexToWaveform(value as number));
        break;
      case 'tune':
        synth.setParam('osc1.octave', Math.round((value as number) / 25) - 2);
        break;
      case 'level':
        synth.setParam('osc1.volume', value as number);
        break;
      case 'attack':
        synth.setParam('ampAdsr.attack', value as number);
        break;
      case 'decay':
        synth.setParam('ampAdsr.decay', value as number);
        break;
      case 'sustain':
        synth.setParam('ampAdsr.sustain', value as number);
        break;
      case 'release':
        synth.setParam('ampAdsr.release', value as number);
        break;
      case 'filterOn':
        synth.setParam('filter.enabled', value as boolean);
        break;
      case 'cutoff':
        synth.setParam('filter.cutoff', value as number);
        break;
      case 'resonance':
        synth.setParam('filter.resonance', value as number);
        break;
      case 'envelope':
        synth.setParam('filter.envelope', value as number);
        break;
      case 'filterSlope':
        synth.setParam('filter.slope', value as (12 | 24));
        break;
      case 'arpOn':
        synth.setParam('arpeggiator.enabled', value as boolean);
        break;
      case 'arpRate':
        synth.setParam('arpeggiator.rate', value as number);
        break;
    }

    // Tutorial task tracking
    if (tutorialMode && highlightedControl) {
      const taskMap: Record<string, string> = {
        wave: 'wave-select',
        tune: 'tune',
        level: 'level',
        attack: 'attack',
        decay: 'decay',
        sustain: 'sustain',
        release: 'release',
        cutoff: 'cutoff',
        resonance: 'resonance',
        envelope: 'envelope',
        filterOn: 'filter-toggle',
        filterSlope: 'filter-slope',
      };

      const taskId = taskMap[key as string];
      if (taskId && !completedTasks.has(taskId)) {
        if (highlightedControl.includes(taskId) || taskId.includes(highlightedControl.replace('knob-', ''))) {
          setCompletedTasks((prev) => new Set(prev).add(taskId));
        }
      }
    }
  };

  const savePreset = (newName: string) => {
    // Save to backend via WebSocket
    synth.savePreset(newName);
    setPresetIndex(localPresets.length); // new one will be appended

    setSaveFlash(true);
    window.setTimeout(() => setSaveFlash(false), 700);
  };

  const handleLearnClick = () => {
    setCurrentView('checkup');
    setTutorialMode(true);
  };

  const formatTime = (val: number) => {
    const ms = (val / 100) * 5000;
    return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${Math.round(ms)}ms`;
  };

  const formatHz = (val: number) => {
    const hz = (val / 100) * 20000;
    return hz >= 1000 ? `${(hz / 1000).toFixed(1)}kHz` : `${Math.round(hz)}Hz`;
  };

  const formatTune = (val: number) => {
    const oct = Math.round((val / 25) - 2);
    return oct > 0 ? `+${oct}` : `${oct}`;
  };

  useEffect(() => {
    if (currentView !== 'synth') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const keyMap = PIANO_KEYS.find(k => k.key === e.key.toUpperCase());
      if (keyMap) {
        handleNoteStart(keyMap.note);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const keyMap = PIANO_KEYS.find(k => k.key === e.key.toUpperCase());
      if (keyMap) {
        handleNoteEnd(keyMap.note);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [currentView, activeNotes]);

  const handleNoteStart = (note: string) => {
    if (!activeNotes.has(note)) {
      const freq = getNoteFrequency(note);
      console.log(`MIDI Note On: ${note} (${freq.toFixed(2)} Hz)`);
      synth.sendNoteOn(note, freq);
      setActiveNotes(prev => new Set(prev).add(note));
    }
  };

  const handleNoteEnd = (note: string) => {
    if (activeNotes.has(note)) {
      const freq = getNoteFrequency(note);
      console.log(`MIDI Note Off: ${note} (${freq.toFixed(2)} Hz)`);
      synth.sendNoteOff(note, freq);
      setActiveNotes(prev => {
        const next = new Set(prev);
        next.delete(note);
        return next;
      });
    }
  };

  return (
    <>
      {currentView === 'front' && <FrontPage onNavigate={(v) => setCurrentView(v === 'synth' ? 'checkup' : v)} onLearn={handleLearnClick} />}
      {currentView === 'checkup' && <CheckupPage synth={synth} onComplete={() => setCurrentView('synth')} onBack={() => { setCurrentView('front'); setTutorialMode(false); }} />}
      {currentView === 'tutorial' && <TutorialPage onClose={() => setCurrentView('front')} />}
      {currentView === 'synth' && (
        <div className="app-layout">
          <header className="app-header">
            <button 
              className="back-to-front-btn"
              onClick={() => {
                setCurrentView('front');
                setTutorialMode(false);
              }}
            >
              ← Voltar
            </button>
          </header>
          <div className={`app-shell ${tutorialMode ? 'app-shell--with-tutorial' : ''}`}>
        {tutorialMode && (
          <aside className={`tutorial-panel ${isTutorialExpanded ? 'is-expanded' : 'is-collapsed'}`} aria-label="Tutorial interativo">
            <div className="tutorial-panel__content-wrapper">
              <div className="tutorial-panel__content">
                {selectedClass === null ? (
                  <div className="class-selector-container">
                    <ClassSelector 
                      selectedClass={selectedClass} 
                      onSelectClass={setSelectedClass} 
                      completedClasses={completedClasses}
                    />
                  </div>
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
            </div>
            <button 
              className="tutorial-panel-toggle" 
              onClick={() => setIsTutorialExpanded(!isTutorialExpanded)}
              aria-label={isTutorialExpanded ? "Recolher tutorial" : "Expandir tutorial"}
            >
              {isTutorialExpanded ? '◀' : '▶'}
            </button>
          </aside>
        )}
      <section className="synth-panel-wrap">
        <div className="mfb-chassis">
          <div className="mfb-faceplate">
            <div className="mfb-screws screw-tl"></div>
            <div className="mfb-screws screw-tr"></div>
            <div className="mfb-screws screw-bl"></div>
            <div className="mfb-screws screw-br"></div>

            <header className="top-bar top-bar--compact">
              <div className="top-left">
                <span
                  className={`connection-dot connection-dot--${synth.connectionState}`}
                  title={`WebSocket: ${synth.connectionState}${synth.serialStatus ? ` | Serial: ${synth.serialStatus.status}` : ''}`}
                />
              </div>

              <div className="top-center">
                <h1 className="mfb-title">minisynth32</h1>
                <span className="mfb-label"></span>
              </div>

              <div className="top-right">
                <div style={{ display: 'flex', gap: '6px', flexDirection: 'column', alignItems: 'center' }}>
                  <HelpButton isActive={helpMode} onClick={() => setHelpMode(!helpMode)} />
                  {!tutorialMode && (
                    <button
                      type="button"
                      className="mfb-btn tutorial-enable-btn"
                      onClick={() => setTutorialMode(true)}
                      title="Ativar tutorial interativo"
                      aria-label="Ativar tutorial"
                    >
                      ?
                    </button>
                  )}
                </div>
              </div>
            </header>

            <main className="synth-layout">
              <section className="synth-block">
                <div className="block-inner block-inner--osc">
                  <div className="osc-panel-wrapper">
                    <div className="osc-panel">
                      <div className={`control-col control-col--selector ${tutorialMode && highlightedControl === 'wave-select' ? 'control-highlighted' : ''}`} id="wave-select">
                        <LedGroupBtn
                          leds={[<WaveSquare />, <WaveSine />, <WaveSaw />, <WaveNoise />]}
                          customLabels=""
                          buttonNum="1"
                          activeIdx={patch.wave}
                          onClick={() => {
                            updatePatch('wave', ((patch.wave + 1) % 4) as Patch['wave']);
                            if (tutorialMode) setCompletedTasks(new Set(completedTasks).add('wave-select'));
                          }}
                          helpText="Selecione a forma de onda: Square, Sine, Sawtooth ou Noise"
                          helpMode={helpMode}
                        />
                      </div>

                      <div className={`control-col control-col--knob ${tutorialMode && highlightedControl === 'knob-tune' ? 'control-highlighted' : ''}`} id="knob-tune">
                        <Knob label="Tune" value={patch.tune} onChange={(value) => updatePatch('tune', value)} helpText="Ajusta a altura/frequencia do oscilador" helpMode={helpMode} formatValue={formatTune} step={25} />
                      </div>

                      <div className={`control-col control-col--knob ${tutorialMode && highlightedControl === 'knob-level' ? 'control-highlighted' : ''}`} id="knob-level">
                        <Knob label="Level" value={patch.level} onChange={(value) => updatePatch('level', value)} helpText="Controla o volume de saida do oscilador" helpMode={helpMode} />
                      </div>
                    </div>

                    <div className="arp-panel">
                      <div className="filter-switch-col">
                        <span className="mfb-label">Arp</span>
                        <button
                          type="button"
                          className={`filter-toggle ${patch.arpOn ? 'is-on' : ''}`}
                          onClick={() => updatePatch('arpOn', !patch.arpOn)}
                          aria-pressed={patch.arpOn}
                        >
                          <span className="filter-toggle__led"></span>
                        </button>
                        <span className="mfb-label-small">{patch.arpOn ? 'ON' : 'OFF'}</span>
                      </div>

                      <div className="control-col control-col--knob">
                        <Knob 
                          label={['1/32', '1/24', '1/16', '1/8', '1/4'][patch.arpRate] || 'Rate'} 
                          value={patch.arpRate * 25} 
                          onChange={(value) => {
                            const step = Math.round(value / 25);
                            updatePatch('arpRate', step);
                          }} 
                          helpText="Arpeggiator Rate" 
                          helpMode={helpMode} 
                          hideValue={true}
                          step={25}
                        />
                      </div>
                    </div>
                  </div>

                  <WaveDisplay samples={synth.state.waveDisplay.samples} />
                </div>

                <span className="cell-title">OSC 1</span>
              </section>

              <section className="synth-block">
                <div className="block-inner block-inner--three">
                  <div className={`control-col control-col--knob ${tutorialMode && highlightedControl === 'knob-attack' ? 'control-highlighted' : ''}`} id="knob-attack">
                    <Knob label="Attack" value={patch.attack} onChange={(value) => updatePatch('attack', value)} helpText="Tempo para o envelope atingir o pico" helpMode={helpMode} formatValue={formatTime} />
                  </div>

                  <div className={`control-col control-col--knob ${tutorialMode && highlightedControl === 'knob-decay' ? 'control-highlighted' : ''}`} id="knob-decay">
                    <Knob label="Decay" value={patch.decay} onChange={(value) => updatePatch('decay', value)} helpText="Tempo para cair do pico ate o nivel de sustain" helpMode={helpMode} formatValue={formatTime} />
                  </div>

                  <div className={`control-col control-col--knob ${tutorialMode && highlightedControl === 'knob-sustain' ? 'control-highlighted' : ''}`} id="knob-sustain">
                    <Knob label="Sustain" value={patch.sustain} onChange={(value) => updatePatch('sustain', value)} helpText="Nivel mantido enquanto a nota e sustentada" helpMode={helpMode} />
                  </div>

                  <div className={`control-col control-col--knob ${tutorialMode && highlightedControl === 'knob-release' ? 'control-highlighted' : ''}`} id="knob-release">
                    <Knob label="Release" value={patch.release} onChange={(value) => updatePatch('release', value)} helpText="Tempo para desaparecer apos soltar a nota" helpMode={helpMode} formatValue={formatTime} />
                  </div>
                </div>

                <span className="cell-title">ADSR</span>
              </section>

              <section className="synth-block">
                <div className="block-inner block-inner--filter-extended">
                  <div className={`filter-switch-col ${tutorialMode && highlightedControl === 'filter-toggle' ? 'control-highlighted' : ''}`} id="filter-toggle">
                    <span className="mfb-label">Filter</span>

                    <button
                      type="button"
                      className={`filter-toggle ${patch.filterOn ? 'is-on' : ''}`}
                      onClick={() => {
                        updatePatch('filterOn', !patch.filterOn);
                        if (tutorialMode) setCompletedTasks(new Set(completedTasks).add('filter-toggle'));
                      }}
                      aria-pressed={patch.filterOn}
                    >
                      <span className="filter-toggle__led"></span>
                    </button>

                    <span className="mfb-label-small">{patch.filterOn ? 'ON' : 'OFF'}</span>
                  </div>

                  <div className={`control-col control-col--knob ${tutorialMode && highlightedControl === 'knob-cutoff' ? 'control-highlighted' : ''}`} id="knob-cutoff">
                    <Knob label="Cutoff" value={patch.cutoff} onChange={(value) => updatePatch('cutoff', value)} helpText="Ponto de corte de frequencia do filtro" helpMode={helpMode} formatValue={formatHz} />
                  </div>

                  <div className={`control-col control-col--knob ${tutorialMode && highlightedControl === 'knob-resonance' ? 'control-highlighted' : ''}`} id="knob-resonance">
                    <Knob label="Resonance" value={patch.resonance} onChange={(value) => updatePatch('resonance', value)} helpText="Enfase/Q na frequencia de corte" helpMode={helpMode} />
                  </div>

                  <div className={`control-col control-col--knob ${tutorialMode && highlightedControl === 'knob-envelope' ? 'control-highlighted' : ''}`} id="knob-envelope">
                    <Knob label="Envelope" value={patch.envelope} onChange={(value) => updatePatch('envelope', value)} helpText="Quantidade de modulacao do envelope no filtro" helpMode={helpMode} />
                  </div>

                  <div className={`filter-mode-col ${tutorialMode && highlightedControl === 'filter-slope' ? 'control-highlighted' : ''}`} id="filter-slope">
                    <span className="mfb-label">Slope</span>

                    <button
                      type="button"
                      className="filter-mode-btn"
                      onClick={() => {
                        updatePatch('filterSlope', patch.filterSlope === 12 ? 24 : 12);
                        if (tutorialMode) setCompletedTasks(new Set(completedTasks).add('filter-slope'));
                      }}
                    >
                      {patch.filterSlope} dB
                    </button>
                  </div>
                </div>

                <span className="cell-title">FILTER</span>
              </section>
            </main>
            
            <div className={`piano-roll-container ${isPianoExpanded ? 'is-expanded' : 'is-collapsed'}`}>
              <div className="piano-roll-header">
                <span className="mfb-label">Keyboard</span>
                <button 
                  className="piano-roll-toggle" 
                  onClick={() => setIsPianoExpanded(!isPianoExpanded)}
                  aria-label={isPianoExpanded ? "Recolher teclado" : "Expandir teclado"}
                >
                  {isPianoExpanded ? '▼' : '▲'}
                </button>
              </div>
              
              {isPianoExpanded && (
                <div className="piano-roll">
                  <div className="piano-keys">
                    {PIANO_KEYS.map((key) => (
                      <div
                        key={key.note}
                        className={`piano-key piano-key--${key.type} ${activeNotes.has(key.note) ? 'is-active' : ''}`}
                        onPointerDown={() => handleNoteStart(key.note)}
                        onPointerUp={() => handleNoteEnd(key.note)}
                        onPointerLeave={() => handleNoteEnd(key.note)}
                      >
                        <span className="piano-key-label">{key.key}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <aside className={`preset-panel ${isPresetExpanded ? 'is-expanded' : 'is-collapsed'}`} aria-label="Navegador de presets">
        <button 
          className="preset-panel-toggle" 
          onClick={() => setIsPresetExpanded(!isPresetExpanded)}
          aria-label={isPresetExpanded ? "Recolher presets" : "Expandir presets"}
        >
          {isPresetExpanded ? '▶' : '◀'}
        </button>

        <div className="preset-panel__content-wrapper">
          <div className="preset-panel__content">
            <div className="preset-panel__header">
              <div>
                <span className="preset-panel__eyebrow">Diretorio de Presets</span>
                <h2 className="preset-panel__title">Presets</h2>
              </div>

              <div className="preset-panel__nav">
                <button type="button" className="preset-nav-btn" onClick={prevPreset} aria-label="Preset anterior">
                  ←
                </button>
                <button type="button" className="preset-nav-btn" onClick={nextPreset} aria-label="Proximo preset">
                  →
                </button>
              </div>
            </div>

            <div className="preset-panel__current">
              <span className="preset-panel__current-label">Atual</span>
              <strong className="preset-panel__current-name">{activePreset.name}</strong>
            </div>

            <div className="preset-panel__actions">
              {isSaving ? (
                <div className="preset-save-form">
                  <input
                    type="text"
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    placeholder="Nome do preset"
                    className="preset-save-input"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newPresetName.trim()) {
                        savePreset(newPresetName.trim());
                        setIsSaving(false);
                      } else if (e.key === 'Escape') {
                        setIsSaving(false);
                      }
                    }}
                  />
                  <div className="preset-save-form-actions">
                    <button 
                      className="preset-save-confirm"
                      onClick={() => {
                        if (newPresetName.trim()) {
                          savePreset(newPresetName.trim());
                          setIsSaving(false);
                        }
                      }}
                    >
                      ✓
                    </button>
                    <button 
                      className="preset-save-cancel"
                      onClick={() => setIsSaving(false)}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className={`preset-save-btn ${saveFlash ? 'is-saved' : ''} ${tutorialMode && highlightedControl === 'preset-save' ? 'control-highlighted' : ''}`}
                  onClick={() => {
                    setIsSaving(true);
                    setNewPresetName('');
                    if (tutorialMode) setCompletedTasks(new Set(completedTasks).add('presets'));
                  }}
                  id="preset-save"
                >
                  SAVE
                </button>
              )}
            </div>

            <div className="preset-directory" role="list">
              {localPresets.map((preset, index) => {
                const active = index === presetIndex;

                return (
                  <button
                    key={`${preset.name}-${index}`}
                    type="button"
                    role="listitem"
                    className={`preset-row ${active ? 'is-active' : ''}`}
                    onClick={() => loadPreset(index)}
                  >
                    <span className="preset-row__tree">{active ? '`-' : '+-'}</span>
                    <span className="preset-row__name">{preset.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </aside>
      </div>
      </div>
      )}
    </>
  );
}
