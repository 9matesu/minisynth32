import { Play, BookOpen } from 'lucide-react';

export function FrontPage({ onNavigate, onLearn }: { onNavigate: (view: 'synth' | 'tutorial') => void; onLearn?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen bg-background p-6">
      <div className="max-w-[600px] w-full flex flex-col items-center gap-12">
        <div className="text-center animate-in fade-in slide-in-from-top-4 duration-700">
          <h1 className="text-5xl font-black text-text uppercase tracking-widest mb-2">minisynth32</h1>
          <p className="text-sm font-bold text-textDim tracking-widest uppercase">Volt-Ampère Engine</p>
        </div>

        <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
          <p className="text-text leading-relaxed max-w-[400px]">Aprenda e descubra mais sobre síntese sonora ou explore seu sintetizador livremente.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <button
            className="group relative flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border border-primary/20 bg-primary text-white overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 hover:border-primary/50"
            onClick={() => onLearn ? onLearn() : onNavigate('tutorial')}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <BookOpen size={32} />
            <div className="flex flex-col items-center">
               <span className="text-xl font-black tracking-wider uppercase z-10">Aprender</span>
               <span className="text-[11px] font-bold text-white/80 uppercase tracking-widest z-10">Guia passo a passo</span>
            </div>
          </button>

          <button
            className="group relative flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border border-border bg-panel text-text overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg hover:border-text/20"
            onClick={() => onNavigate('synth')}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-text/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Play size={32} className="text-textDim group-hover:text-text transition-colors" />
            <div className="flex flex-col items-center">
               <span className="text-xl font-black tracking-wider uppercase z-10">Tocar</span>
               <span className="text-[11px] font-bold text-textDim uppercase tracking-widest z-10 group-hover:text-text transition-colors">Explorar livremente</span>
            </div>
          </button>
        </div>

        <div className="mt-8 animate-in fade-in duration-700 delay-500">
          <p className="text-xs font-mono text-textDim uppercase tracking-widest">v2.0</p>
        </div>
      </div>
    </div>
  );
}
