import { useMemo } from 'react';
import { Activity } from 'lucide-react';

interface WaveDisplayProps {
  samples: number[];
}

export function WaveDisplay({ samples }: WaveDisplayProps) {
  const pathD = useMemo(() => {
    if (!samples || samples.length === 0) return '';
    const w = 800;
    const h = 120;
    const mid = h / 2;
    const step = w / (samples.length - 1 || 1);
    return samples
      .map((s, i) => {
        const x = i * step;
        const y = mid - s * (mid - 2);
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  }, [samples]);

  return (
    <div className="w-full h-[180px] border border-border bg-panel rounded-2xl flex flex-col items-center justify-center p-6 shadow-sm overflow-hidden relative group">
      {/* Background Cover Image */}
      <div 
        className="absolute inset-0 opacity-10 bg-center bg-cover mix-blend-multiply"
        style={{ backgroundImage: 'url(/images/cover.png)' }}
      />
      
      <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
        <Activity size={14} className="text-primary" />
        <span className="text-[10px] font-bold tracking-widest uppercase text-textDim bg-panel/80 px-1 rounded">Oscilloscope</span>
      </div>
      
      <svg viewBox="0 0 800 120" className="w-full h-full opacity-70 relative z-10" preserveAspectRatio="none">
        {pathD && (
          <path
            d={pathD}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-text drop-shadow-[0_0_2px_rgba(0,0,0,0.1)]"
          />
        )}
      </svg>
    </div>
  );
}
