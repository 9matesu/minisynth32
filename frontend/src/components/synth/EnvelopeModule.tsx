import { Knob } from '../Knob';
import { HelpTooltip } from '../HelpTooltip';

interface EnvelopeModuleProps {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  onAttackChange: (v: number) => void;
  onDecayChange: (v: number) => void;
  onSustainChange: (v: number) => void;
  onReleaseChange: (v: number) => void;
  isHighlighted?: boolean;
  helpMode?: boolean;
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
  isHighlighted,
  helpMode,
}: EnvelopeModuleProps) {
  const formatTime = (val: number) => {
    const ms = (val / 100) * 5000;
    return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${Math.round(ms)}ms`;
  };

  const renderVisualizer = () => {
    // Escala dos valores 0-100 para coordenadas no SVG 200x100
    const Ax = (attack / 100) * 60;
    const Dx = (decay / 100) * 60;
    const Sy = 100 - (sustain / 100) * 100;
    const Swidth = 40;
    const Rx = (release / 100) * 40;

    const p1 = `0,100`;
    const p2 = `${Ax},0`;
    const p3 = `${Ax + Dx},${Sy}`;
    const p4 = `${Ax + Dx + Swidth},${Sy}`;
    const p5 = `${Ax + Dx + Swidth + Rx},100`;

    const points = `${p1} ${p2} ${p3} ${p4} ${p5}`;

    return (
      <div className="w-full flex justify-center mb-2">
        <svg width="200" height="100" viewBox="0 0 200 100" className="overflow-visible">
          {/* Background Grid */}
          <path d="M0,25 L200,25 M0,50 L200,50 M0,75 L200,75" stroke="currentColor" strokeOpacity="0.05" strokeWidth="1" />
          <path d="M50,0 L50,100 M100,0 L100,100 M150,0 L150,100" stroke="currentColor" strokeOpacity="0.05" strokeWidth="1" />
          
          {/* Fill shape */}
          <polygon points={`${points} 0,100`} fill="currentColor" fillOpacity="0.05" className="text-primary" />
          
          {/* Main line */}
          <polyline points={points} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" className="text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
          
          {/* Points (Nodes) */}
          <circle cx={Ax} cy="0" r="3" fill="currentColor" className="text-primary" />
          <circle cx={Ax + Dx} cy={Sy} r="3" fill="currentColor" className="text-primary" />
          <circle cx={Ax + Dx + Swidth} cy={Sy} r="3" fill="currentColor" className="text-primary" />
        </svg>
      </div>
    );
  };

  return (
    <div className={`border rounded-2xl flex flex-col gap-6 shadow-sm transition-all duration-300 h-full justify-between ${isHighlighted ? 'bg-primary/5 ring-2 ring-primary border-primary/20 p-8' : 'border-border bg-panel p-6'}`}>
      <div className={`flex items-center border-b pb-3 ${isHighlighted ? 'border-primary/20' : 'border-border'}`}>
        <h3 className={`text-[10px] font-bold tracking-widest uppercase ${isHighlighted ? 'text-primary' : 'text-textDim'}`}>Envelope</h3>
      </div>
      
      {renderVisualizer()}
      
      <div className="grid grid-cols-2 gap-y-6 gap-x-2 justify-items-center">
        <Knob label="Attack" value={attack} onChange={onAttackChange} formatValue={formatTime} helpMode={helpMode} helpText="Tempo que o som leva para atingir o volume máximo após pressionar a tecla." />
        <Knob label="Decay" value={decay} onChange={onDecayChange} formatValue={formatTime} helpMode={helpMode} helpText="Tempo que o som leva para cair do volume máximo para o nível de Sustain." />
        <Knob label="Sustain" value={sustain} onChange={onSustainChange} helpMode={helpMode} helpText="Volume em que o som se mantém enquanto a tecla continua pressionada." />
        <Knob label="Release" value={release} onChange={onReleaseChange} formatValue={formatTime} helpMode={helpMode} helpText="Tempo que o som leva para desaparecer completamente após soltar a tecla." />
      </div>
    </div>
  );
}
