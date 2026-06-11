import { Knob } from '../Knob';
import { HelpTooltip } from '../HelpTooltip';

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
  isHighlighted?: boolean;
  helpMode?: boolean;
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
  isHighlighted,
  helpMode,
}: FilterModuleProps) {
  const formatHz = (val: number) => {
    const hz = (val / 100) * 20000;
    return hz >= 1000 ? `${(hz / 1000).toFixed(1)}kHz` : `${Math.round(hz)}Hz`;
  };

  const renderVisualizer = () => {
    // Cutoff: 0-100 mapeado para X=10 a X=170
    const Cx = (cutoff / 100) * 160 + 10;
    
    // Base line for Lowpass filter should be high up (full amplitude). Y=40.
    // Resonance Peak: Y mapeado de 40 (sem res) para 10 (max res)
    const peak_y = 40 - (resonance / 100) * 30;
    
    // Slope width: 24dB cai rápido (15px), 12dB cai lento (40px)
    const slope_width = filterSlope === 24 ? 15 : 40;

    const p1 = `0,100`;
    const p2 = `0,40`;
    const p3 = `${Math.max(0, Cx - 20)},40`; // Inicio da rampa de ressonância
    const p4 = `${Cx},${peak_y}`; // Pico
    const p5 = `${Cx + slope_width},100`; // Fim do slope

    const points = `${p1} ${p2} ${p3} ${p4} ${p5}`;

    return (
      <div className="w-full flex justify-center mb-2">
        <svg width="200" height="100" viewBox="0 0 200 100" className={`overflow-visible transition-opacity duration-300 ${filterOn ? 'opacity-100' : 'opacity-40'}`}>
          {/* Background Grid */}
          <path d="M0,25 L200,25 M0,50 L200,50 M0,75 L200,75" stroke="currentColor" strokeOpacity="0.05" strokeWidth="1" />
          <path d="M50,0 L50,100 M100,0 L100,100 M150,0 L150,100" stroke="currentColor" strokeOpacity="0.05" strokeWidth="1" />
          
          {/* Fill shape */}
          <polygon points={points} fill="currentColor" fillOpacity="0.05" className="text-primary transition-all duration-300" />
          
          {/* Main line */}
          <polyline points={`${p2} ${p3} ${p4} ${p5}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" className="text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.5)] transition-all duration-300" />
        </svg>
      </div>
    );
  };

  return (
    <div className={`border rounded-2xl flex flex-col gap-6 shadow-sm transition-all duration-300 h-full justify-between ${isHighlighted ? 'bg-primary/5 ring-2 ring-primary border-primary/20 p-8' : 'border-border bg-panel p-6'}`}>
      <div className={`flex items-center justify-between border-b pb-3 ${isHighlighted ? 'border-primary/20' : 'border-border'}`}>
        <div className="flex items-center">
          <h3 className={`text-[10px] font-bold tracking-widest uppercase ${isHighlighted ? 'text-primary' : 'text-textDim'}`}>Filtro</h3>
        </div>
        <button 
          onClick={onFilterToggle}
          className={`text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded transition-colors ${filterOn ? 'bg-primary/10 text-primary' : 'bg-background text-textDim'}`}
        >
          {filterOn ? 'ON' : 'OFF'}
        </button>
      </div>

      {renderVisualizer()}

      <div className="flex items-center justify-between opacity-100 transition-opacity" style={{ opacity: filterOn ? 1 : 0.5 }}>
        <Knob label="Cutoff" value={cutoff} onChange={onCutoffChange} formatValue={formatHz} helpMode={helpMode} helpText="Frequência de corte do filtro. Corta frequências altas deixando o som mais abafado." />
        <Knob label="Res." value={resonance} onChange={onResonanceChange} helpMode={helpMode} helpText="Ressonância. Cria um pico na frequência de corte, gerando um efeito de 'laser' ou assobio." />
        <Knob label="Env." value={envelope} onChange={onEnvelopeChange} helpMode={helpMode} helpText="Quantidade de modulação que o Envelope aplica ao Cutoff do filtro." />
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
