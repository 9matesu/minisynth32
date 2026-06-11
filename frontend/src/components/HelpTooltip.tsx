import { HelpCircle } from 'lucide-react';

interface HelpTooltipProps {
  title: string;
  description: string;
}

export function HelpTooltip({ title, description }: HelpTooltipProps) {
  return (
    <div className="relative group inline-flex items-center justify-center ml-2">
      <HelpCircle size={14} className="text-textDim/50 hover:text-primary transition-colors cursor-help" />
      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:flex flex-col items-center z-50 w-64 pointer-events-none animate-in fade-in slide-in-from-bottom-1 duration-200">
        <div className="bg-panel border border-border shadow-xl rounded-xl p-4 text-left">
          <h4 className="text-[11px] font-bold uppercase tracking-widest text-primary mb-2">{title}</h4>
          <p className="text-xs text-textDim leading-relaxed">{description}</p>
        </div>
        <div className="w-3 h-3 bg-panel border-r border-b border-border rotate-45 -mt-1.5" />
      </div>
    </div>
  );
}
