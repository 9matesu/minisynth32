import { Knob } from '../Knob';
import { HelpTooltip } from '../HelpTooltip';

interface OscillatorModuleProps {
  wave: number;
  tune: number;
  detune: number;
  level: number;
  voices: number;
  onWaveChange: (v: number) => void;
  onTuneChange: (v: number) => void;
  onDetuneChange: (v: number) => void;
  onLevelChange: (v: number) => void;
  onVoicesChange: (v: number) => void;
  isHighlighted?: boolean;
}

function WaveSelector({ value, onChange, helpMode }: { value: number; onChange: (v: number) => void; helpMode?: boolean }) {
  const waves = ['Square', 'Sine', 'Saw', 'Triangle'];
  return (
    <div className="flex flex-col gap-2 items-center relative group/knob">
      <span className="text-[10px] font-semibold text-textDim uppercase tracking-wider">Onda</span>
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

function VoicesSelector({ value, onChange, helpMode }: { value: number; onChange: (v: number) => void; helpMode?: boolean }) {
  const voices = [1, 2, 3, 4];
  return (
    <div className="flex flex-col gap-2 items-center relative group/knob">
      <span className="text-[10px] font-semibold text-textDim uppercase tracking-wider">Vozes</span>
      <div className="flex flex-col gap-1 bg-background border border-border p-1 rounded-lg">
        {voices.map((v) => (
          <button
            key={v}
            onClick={() => onChange(v)}
            className={`text-[10px] w-full px-3 py-1 rounded-md font-mono transition-colors ${value === v ? 'bg-text text-panel shadow-sm' : 'text-textDim hover:text-text hover:bg-border/50'}`}
          >
            {v}V
          </button>
        ))}
      </div>
    </div>
  );
}

export function OscillatorModule({ 
  wave, 
  tune, 
  detune, 
  level, 
  voices, 
  onWaveChange, 
  onTuneChange, 
  onDetuneChange, 
  onLevelChange, 
  onVoicesChange, 
  isHighlighted,
  helpMode
}: OscillatorModuleProps & { helpMode?: boolean }) {
  const formatTune = (val: number) => {
    const oct = Math.round((val / 25) - 2);
    return oct > 0 ? `+${oct}` : `${oct}`;
  };

  return (
    <div className={`border rounded-2xl flex flex-col gap-6 shadow-sm transition-all duration-300 h-full justify-between ${isHighlighted ? 'bg-primary/5 ring-2 ring-primary border-primary/20 p-6' : 'border-border bg-panel p-6'}`}>
      <div className={`flex items-center border-b pb-3 ${isHighlighted ? 'border-primary/20' : 'border-border'}`}>
        <h3 className={`text-[10px] font-bold tracking-widest uppercase ${isHighlighted ? 'text-primary' : 'text-textDim'}`}>Oscilador</h3>
      </div>
      <div className="flex flex-wrap items-start justify-center gap-x-6 gap-y-8">
        <WaveSelector value={wave} onChange={onWaveChange} helpMode={helpMode} />
        <VoicesSelector value={voices} onChange={onVoicesChange} helpMode={helpMode} />
        <Knob 
          label="Tune" 
          value={tune} 
          onChange={onTuneChange} 
          formatValue={formatTune}
          helpMode={helpMode}
          helpText="Ajusta a oitava do oscilador. Valores menores deixam o som mais grave."
        />
        <Knob 
          label="Detune" 
          value={detune} 
          onChange={onDetuneChange} 
          helpMode={helpMode}
          helpText="Desafina levemente as vozes do oscilador para criar sons mais largos e encorpados."
        />
        <Knob 
          label="Level" 
          value={level} 
          onChange={onLevelChange} 
          helpMode={helpMode}
          helpText="Volume principal deste oscilador."
        />
      </div>
    </div>
  );
}
