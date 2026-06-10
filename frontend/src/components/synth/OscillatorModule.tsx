import { Knob } from '../Knob';

interface OscillatorModuleProps {
  wave: number;
  tune: number;
  level: number;
  onWaveChange: (v: number) => void;
  onTuneChange: (v: number) => void;
  onLevelChange: (v: number) => void;
}

function WaveSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const waves = ['Square', 'Sine', 'Saw', 'Noise'];
  return (
    <div className="flex flex-col gap-2 items-center">
      <span className="text-[10px] font-semibold text-textDim uppercase tracking-wider">Wave</span>
      <div className="flex flex-col gap-1 bg-background border border-border p-1 rounded-lg">
        {waves.map((w, i) => (
          <button
            key={w}
            onClick={() => onChange(i)}
            className={`text-[10px] px-3 py-1 rounded-md font-mono transition-colors ${value === i ? 'bg-text text-panel shadow-sm' : 'text-textDim hover:text-text hover:bg-border/50'}`}
          >
            {w}
          </button>
        ))}
      </div>
    </div>
  );
}

export function OscillatorModule({ wave, tune, level, onWaveChange, onTuneChange, onLevelChange }: OscillatorModuleProps) {
  const formatTune = (val: number) => {
    const oct = Math.round((val / 25) - 2);
    return oct > 0 ? `+${oct}` : `${oct}`;
  };

  return (
    <div className="border border-border bg-panel p-6 rounded-2xl flex flex-col gap-8 shadow-sm">
      <h3 className="text-[10px] font-bold tracking-widest uppercase text-textDim border-b border-border pb-3">Oscillator</h3>
      <div className="flex items-center justify-between">
        <WaveSelector value={wave} onChange={onWaveChange} />
        <Knob label="Tune" value={tune} onChange={onTuneChange} formatValue={formatTune} step={25} />
        <Knob label="Level" value={level} onChange={onLevelChange} />
      </div>
    </div>
  );
}
