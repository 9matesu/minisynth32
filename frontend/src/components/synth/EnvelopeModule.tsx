import { Knob } from '../Knob';

interface EnvelopeModuleProps {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  onAttackChange: (v: number) => void;
  onDecayChange: (v: number) => void;
  onSustainChange: (v: number) => void;
  onReleaseChange: (v: number) => void;
}

export function EnvelopeModule({
  attack,
  decay,
  sustain,
  release,
  onAttackChange,
  onDecayChange,
  onSustainChange,
  onReleaseChange,
}: EnvelopeModuleProps) {
  const formatTime = (val: number) => {
    const ms = (val / 100) * 5000;
    return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${Math.round(ms)}ms`;
  };

  return (
    <div className="border border-border bg-panel p-6 rounded-2xl flex flex-col gap-8 shadow-sm">
      <h3 className="text-[10px] font-bold tracking-widest uppercase text-textDim border-b border-border pb-3">Envelope</h3>
      <div className="grid grid-cols-2 gap-y-6 gap-x-2 justify-items-center">
        <Knob label="Attack" value={attack} onChange={onAttackChange} formatValue={formatTime} />
        <Knob label="Decay" value={decay} onChange={onDecayChange} formatValue={formatTime} />
        <Knob label="Sustain" value={sustain} onChange={onSustainChange} />
        <Knob label="Release" value={release} onChange={onReleaseChange} formatValue={formatTime} />
      </div>
    </div>
  );
}
