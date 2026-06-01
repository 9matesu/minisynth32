import { useMemo, useState, useEffect } from 'react';
import { Knob } from './components/Knob';
import { LedGroupBtn } from './components/LedGroupBtn';
import { HelpButton } from './components/HelpButton';
import { WaveSaw, WaveSquare } from './components/Waves';
import { FrontPage } from './components/FrontPage';
import { TutorialPage } from './components/TutorialPage';
import { IntegratedTutorial } from './components/IntegratedTutorial';
import { ClassSelector } from './components/ClassSelector';

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

function WaveDisplay({ wave }: { wave: number }) {
  const paths = [
    'M0 30 L18 30 L18 8 L36 8 L36 30 L54 30 L54 8 L72 8 L72 30 L90 30 L90 8 L108 8 L108 30 L126 30 L126 8 L144 8 L144 30 L162 30',
    'M0 30 C12 8, 28 8, 40 30 C52 52, 68 52, 80 30 C92 8, 108 8, 120 30 C132 52, 148 52, 162 30',
    'M0 30 L27 8 L54 30 L81 52 L108 30 L135 8 L162 30',
    'M0 36 L8 12 L16 40 L24 18 L32 46 L40 14 L48 38 L56 16 L64 44 L72 20 L80 34 L88 17 L96 43 L104 13 L112 39 L120 22 L128 37 L136 15 L148 41 L162 24',
  ];

  return (
    <div className="wave-display">
      <div className="wave-display__header">
        <span className="mfb-label">Wave Monitor</span>
      </div>

      <div className="wave-display__screen">
        <svg viewBox="0 0 162 60" className="wave-display__svg" aria-label="Visualização da onda">
          <defs>
            <pattern id="scopeGrid" width="18" height="15" patternUnits="userSpaceOnUse">
              <path d="M 18 0 L 0 0 0 15" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            </pattern>
          </defs>

          <rect x="0" y="0" width="162" height="60" fill="url(#scopeGrid)" />
          <line x1="0" y1="30" x2="162" y2="30" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
          <path
            d={paths[wave]}
            fill="none"
            stroke="#f3f0d4"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
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
};

const INITIAL_PRESETS: Patch[] = [
  {
    name: 'Init Patch',
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
  },
  {
    name: 'Deep Bass',
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
  },
  {
    name: 'Glass Lead',
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
  },
  {
    name: 'Tape Organ',
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
  },
  {
    name: 'Soft Pluck',
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
  },
  {
    name: 'Square Drive',
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
  },
  {
    name: 'Night Pad',
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
  },
  {
    name: 'Mono Pulse',
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
  },
];

export default function App() {
  const [currentView, setCurrentView] = useState<'front' | 'tutorial' | 'synth'>('front');
  const [presets, setPresets] = useState<Patch[]>(INITIAL_PRESETS);
  const [presetIndex, setPresetIndex] = useState(0);
  const [patch, setPatch] = useState<Patch>({ ...INITIAL_PRESETS[0] });
  const [saveFlash, setSaveFlash] = useState(false);
  const [helpMode, setHelpMode] = useState(false);
  const [tutorialMode, setTutorialMode] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [highlightedControl, setHighlightedControl] = useState<string | null>(null);
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

  const activePreset = useMemo(() => presets[presetIndex], [presets, presetIndex]);

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

  const loadPreset = (index: number) => {
    setPresetIndex(index);
    setPatch({ ...presets[index] });
  };

  const prevPreset = () => {
    const nextIndex = (presetIndex - 1 + presets.length) % presets.length;
    loadPreset(nextIndex);
  };

  const nextPreset = () => {
    const nextIndex = (presetIndex + 1) % presets.length;
    loadPreset(nextIndex);
  };

  const updatePatch = <K extends keyof Patch>(key: K, value: Patch[K]) => {
    setPatch((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const savePreset = () => {
    setPresets((current) =>
      current.map((preset, index) =>
        index === presetIndex
          ? {
              ...patch,
              name: preset.name,
            }
          : preset
      )
    );

    setPatch((current) => ({
      ...current,
      name: presets[presetIndex].name,
    }));

    setSaveFlash(true);
    window.setTimeout(() => setSaveFlash(false), 700);
  };

  return (
    <>
      {currentView === 'front' && <FrontPage onNavigate={setCurrentView} />}
      {currentView === 'tutorial' && <TutorialPage onClose={() => setCurrentView('front')} />}
      {currentView === 'synth' && (
        <div className={`app-shell ${tutorialMode ? 'app-shell--with-tutorial' : ''}`}>
      <section className="synth-panel-wrap">
        <div className="mfb-chassis">
          <div className="mfb-faceplate">
            <div className="mfb-screws screw-tl"></div>
            <div className="mfb-screws screw-tr"></div>
            <div className="mfb-screws screw-bl"></div>
            <div className="mfb-screws screw-br"></div>

            <header className="top-bar top-bar--compact">
              <div className="top-left">
                <div className="power-block">
                  <span className="mfb-label-small">↓</span>
                  <span className="mfb-label">Power</span>
                  <div className="mfb-btn mt-1"></div>
                  <span className="mfb-label-small mt-1">ON/OFF</span>
                </div>
              </div>

              <div className="top-center">
                <h1 className="mfb-title">minisynth32</h1>
                <span className="mfb-label">1 OSC · Shared ADSR · Filter</span>
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
                  <div className="osc-panel">
                    <div className={`control-col control-col--selector ${tutorialMode && !completedTasks.has('wave-select') ? 'control-highlighted' : ''}`} id="wave-select">
                      <LedGroupBtn
                        leds={[<WaveSquare />, <WaveSine />, <WaveSaw />, <WaveNoise />]}
                        customLabels="Wave Select"
                        buttonNum="1"
                        activeIdx={patch.wave}
                        onClick={() => {
                          updatePatch('wave', ((patch.wave + 1) % 4) as Patch['wave']);
                          if (tutorialMode) setCompletedTasks(new Set(completedTasks).add('wave-select'));
                        }}
                        helpText="Select waveform: Square, Sine, Sawtooth, or Noise"
                        helpMode={helpMode}
                      />
                    </div>

                    <div className={`control-col control-col--knob ${tutorialMode && !completedTasks.has('tune') ? 'control-highlighted' : ''}`} id="knob-tune">
                      <Knob label="Tune" value={patch.tune} onChange={(value) => updatePatch('tune', value)} helpText="Adjust pitch/frequency of the oscillator" helpMode={helpMode} />
                    </div>

                    <div className={`control-col control-col--knob ${tutorialMode && !completedTasks.has('level') ? 'control-highlighted' : ''}`} id="knob-level">
                      <Knob label="Level" value={patch.level} onChange={(value) => updatePatch('level', value)} helpText="Control output volume of the oscillator" helpMode={helpMode} />
                    </div>
                  </div>

                  <WaveDisplay wave={patch.wave} />
                </div>

                <span className="cell-title">OSC 1</span>
              </section>

              <section className="synth-block">
                <div className="block-inner block-inner--three">
                  <div className={`control-col control-col--knob ${tutorialMode && !completedTasks.has('attack') ? 'control-highlighted' : ''}`} id="knob-attack">
                    <Knob label="Attack" value={patch.attack} onChange={(value) => updatePatch('attack', value)} helpText="Time for envelope to reach peak" helpMode={helpMode} />
                  </div>

                  <div className={`control-col control-col--knob ${tutorialMode && !completedTasks.has('decay') ? 'control-highlighted' : ''}`} id="knob-decay">
                    <Knob label="Decay" value={patch.decay} onChange={(value) => updatePatch('decay', value)} helpText="Time to fall from peak to sustain level" helpMode={helpMode} />
                  </div>

                  <div className={`control-col control-col--knob ${tutorialMode && !completedTasks.has('sustain') ? 'control-highlighted' : ''}`} id="knob-sustain">
                    <Knob label="Sustain" value={patch.sustain} onChange={(value) => updatePatch('sustain', value)} helpText="Held level while note is sustained" helpMode={helpMode} />
                  </div>

                  <div className={`control-col control-col--knob ${tutorialMode && !completedTasks.has('release') ? 'control-highlighted' : ''}`} id="knob-release">
                    <Knob label="Release" value={patch.release} onChange={(value) => updatePatch('release', value)} helpText="Time to fade after note release" helpMode={helpMode} />
                  </div>
                </div>

                <span className="cell-title">ADSR</span>
              </section>

              <section className="synth-block">
                <div className="block-inner block-inner--filter-extended">
                  <div className={`filter-switch-col ${tutorialMode && !completedTasks.has('filter-toggle') ? 'control-highlighted' : ''}`} id="filter-toggle">
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

                  <div className={`control-col control-col--knob ${tutorialMode && !completedTasks.has('cutoff') ? 'control-highlighted' : ''}`} id="knob-cutoff">
                    <Knob label="Cutoff" value={patch.cutoff} onChange={(value) => updatePatch('cutoff', value)} helpText="Filter frequency cutoff point" helpMode={helpMode} />
                  </div>

                  <div className={`control-col control-col--knob ${tutorialMode && !completedTasks.has('resonance') ? 'control-highlighted' : ''}`} id="knob-resonance">
                    <Knob label="Resonance" value={patch.resonance} onChange={(value) => updatePatch('resonance', value)} helpText="Emphasis/Q at cutoff frequency" helpMode={helpMode} />
                  </div>

                  <div className={`control-col control-col--knob ${tutorialMode && !completedTasks.has('envelope') ? 'control-highlighted' : ''}`} id="knob-envelope">
                    <Knob label="Envelope" value={patch.envelope} onChange={(value) => updatePatch('envelope', value)} helpText="Amount of envelope modulation on filter" helpMode={helpMode} />
                  </div>

                  <div className={`filter-mode-col ${tutorialMode && !completedTasks.has('filter-slope') ? 'control-highlighted' : ''}`} id="filter-slope">
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
          </div>
        </div>
      </section>

      <aside className="preset-panel" aria-label="Preset browser">
        <div className="preset-panel__header">
          <div>
            <span className="preset-panel__eyebrow">Preset Directory</span>
            <h2 className="preset-panel__title">Presets</h2>
          </div>

          <div className="preset-panel__nav">
            <button type="button" className="preset-nav-btn" onClick={prevPreset} aria-label="Preset anterior">
              ←
            </button>
            <button type="button" className="preset-nav-btn" onClick={nextPreset} aria-label="Próximo preset">
              →
            </button>
          </div>
        </div>

        <div className="preset-panel__current">
          <span className="preset-panel__current-label">Current</span>
          <strong className="preset-panel__current-name">{activePreset.name}</strong>
        </div>

        <div className="preset-panel__actions">
          <button
            type="button"
            className={`preset-save-btn ${saveFlash ? 'is-saved' : ''} ${tutorialMode && !completedTasks.has('presets') ? 'control-highlighted' : ''}`}
            onClick={() => {
              savePreset();
              if (tutorialMode) setCompletedTasks(new Set(completedTasks).add('presets'));
            }}
            id="preset-save"
          >
            SAVE
          </button>
        </div>

        <div className="preset-directory" role="list">
          {presets.map((preset, index) => {
            const active = index === presetIndex;

            return (
              <button
                key={preset.name}
                type="button"
                role="listitem"
                className={`preset-row ${active ? 'is-active' : ''}`}
                onClick={() => loadPreset(index)}
              >
                <span className="preset-row__tree">{active ? '└─' : '├─'}</span>
                <span className="preset-row__name">{preset.name}</span>
              </button>
            );
          })}
        </div>
      </aside>
        {tutorialMode && selectedClass === null && (
          <div className="class-selector-container">
            <ClassSelector selectedClass={selectedClass} onSelectClass={setSelectedClass} />
          </div>
        )}
        {tutorialMode && selectedClass !== null && (
          <IntegratedTutorial
            onClose={() => {
              setTutorialMode(false);
              setSelectedClass(null);
              setCompletedTasks(new Set());
            }}
            selectedClass={selectedClass}
            completedTasks={completedTasks}
            onTaskComplete={(taskId) => setCompletedTasks(new Set(completedTasks).add(taskId))}
            highlightedControl={highlightedControl}
          />
        )}
      </div>
      )}
    </>
  );
}