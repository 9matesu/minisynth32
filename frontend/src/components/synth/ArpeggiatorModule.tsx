import { Knob } from '../Knob';
import { HelpTooltip } from '../HelpTooltip';

interface ArpeggiatorModuleProps {
  arpOn: boolean;
  arpRate: number;
  onArpToggle: () => void;
  onRateChange: (v: number) => void;
  helpMode?: boolean;
}

export function ArpeggiatorModule({
  arpOn,
  arpRate,
  onArpToggle,
  onRateChange,
  helpMode,
}: ArpeggiatorModuleProps) {
  // Arp rate is mapped roughly from 1-32 internally
  const formatRate = (val: number) => {
    return `1/${val}`;
  };

  return (
    <div className="border border-border bg-panel p-6 rounded-2xl flex flex-col gap-8 shadow-sm">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center">
          <h3 className="text-[10px] font-bold tracking-widest uppercase text-textDim">Arpeggiator</h3>
        </div>
        <button 
          onClick={onArpToggle}
          className={`w-10 h-5 rounded-full relative transition-colors ${arpOn ? 'bg-primary' : 'bg-border'}`}
        >
          <div className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${arpOn ? 'left-5' : 'left-1'}`} />
        </button>
      </div>

      <div className="flex items-center justify-center pt-2 opacity-100 transition-opacity" style={{ opacity: arpOn ? 1 : 0.5 }}>
        <Knob 
          label="Rate" 
          value={arpRate} 
          onChange={onRateChange} 
          formatValue={formatRate} 
          helpMode={helpMode}
          helpText="Velocidade do arpejo. Ajuste para tocar notas mais rápido ou mais devagar (em BPM/Ms)."
        />
      </div>
    </div>
  );
}
