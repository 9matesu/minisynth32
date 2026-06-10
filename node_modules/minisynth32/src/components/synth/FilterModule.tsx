import { Knob } from '../Knob';

interface FilterModuleProps {
  filterOn: boolean;
  cutoff: number;
  resonance: number;
  envelope: number;
  filterSlope: 12 | 24;
  onFilterToggle: () => void;
  onCutoffChange: (v: number) => void;
  onResonanceChange: (v: number) => void;
  onEnvelopeChange: (v: number) => void;
  onSlopeChange: () => void;
}

export function FilterModule({
  filterOn,
  cutoff,
  resonance,
  envelope,
  filterSlope,
  onFilterToggle,
  onCutoffChange,
  onResonanceChange,
  onEnvelopeChange,
  onSlopeChange,
}: FilterModuleProps) {
  const formatHz = (val: number) => {
    const hz = (val / 100) * 20000;
    return hz >= 1000 ? `${(hz / 1000).toFixed(1)}kHz` : `${Math.round(hz)}Hz`;
  };

  return (
    <div className="border border-border bg-panel p-6 rounded-2xl flex flex-col gap-8 shadow-sm">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h3 className="text-[10px] font-bold tracking-widest uppercase text-textDim">Filter</h3>
        <button 
          onClick={onFilterToggle}
          className={`text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded transition-colors ${filterOn ? 'bg-primary/10 text-primary' : 'bg-background text-textDim'}`}
        >
          {filterOn ? 'ON' : 'OFF'}
        </button>
      </div>
      <div className="flex items-center justify-between opacity-100 transition-opacity" style={{ opacity: filterOn ? 1 : 0.5 }}>
        <Knob label="Cutoff" value={cutoff} onChange={onCutoffChange} formatValue={formatHz} />
        <Knob label="Res." value={resonance} onChange={onResonanceChange} />
        <Knob label="Env." value={envelope} onChange={onEnvelopeChange} />
      </div>
      <div className="flex justify-center mt-[-10px]" style={{ opacity: filterOn ? 1 : 0.5 }}>
        <button
          className="text-[10px] font-mono px-3 py-1 rounded bg-background border border-border text-text hover:bg-border/50 transition-colors"
          onClick={onSlopeChange}
        >
          Slope: {filterSlope}dB
        </button>
      </div>
    </div>
  );
}
