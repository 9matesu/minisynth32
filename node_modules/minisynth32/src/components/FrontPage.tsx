import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, Play, GraduationCap, Server, Usb, Waves, SlidersHorizontal, Settings2 } from "lucide-react";
import type { UseSynthStateReturn } from "../hooks/useSynthState";

const wsStatusMap: Record<string, string> = {
  connecting: 'Conectando...',
  open: 'Conectado',
  closed: 'Fechado',
  error: 'Erro',
  disconnected: 'Desconectado'
};

const serialStatusMap: Record<string, string> = {
  connecting: 'Conectando...',
  connected: 'Conectado',
  disconnected: 'Desconectado',
  error: 'Erro'
};

export function FrontPage({ synth, onNavigate, onLearn }: { synth?: UseSynthStateReturn, onNavigate: (view: 'synth' | 'tutorial') => void; onLearn?: () => void }) {
  const wsStatusRaw = synth?.connectionState || 'disconnected';
  const serialStatusRaw = synth?.serialStatus?.status || 'disconnected';
  const port = synth?.serialStatus?.port || 'N/D';

  const wsStatus = wsStatusMap[wsStatusRaw] || wsStatusRaw;
  const serialStatus = serialStatusMap[serialStatusRaw] || serialStatusRaw;

  return (
    <div className="min-h-screen bg-black text-[#00ff88] flex flex-col font-sans w-full selection:bg-[#00ff88] selection:text-black">
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-16 space-y-20">
        
        {/* Header / Hero Section */}
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="flex-1 space-y-10">
            <Badge variant="outline" className="rounded-none border-2 border-[#00ff88] text-[#00ff88] bg-black px-4 py-2 font-bold tracking-widest uppercase text-xs">
              v1.0 • Sintetizador Educacional
            </Badge>
            
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-tight uppercase">
              minisynth<span className="text-white">32</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-[#00ff88]/80 max-w-xl leading-relaxed font-medium">
              Descubra a arte da síntese sonora. Aprenda os fundamentos com nosso tutorial interativo ou mergulhe direto para esculpir seus próprios sons únicos.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 pt-6">
              {/* Primary CTA - Flat / Brutalist */}
              <Button 
                size="lg" 
                className="bg-[#00ff88] hover:bg-black text-black hover:text-[#00ff88] font-black h-16 px-10 rounded-none border-2 border-[#00ff88] transition-colors duration-200 cursor-pointer w-full sm:w-auto text-xl uppercase tracking-wider"
                onClick={() => onNavigate('synth')}
              >
                <Play className="mr-3 h-7 w-7" fill="currentColor" /> Tocar Livremente
              </Button>
              
              {/* Secondary CTA - Flat / Brutalist */}
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-black hover:bg-[#00ff88] text-[#00ff88] hover:text-black font-bold h-16 px-10 rounded-none border-2 border-[#00ff88] transition-colors duration-200 cursor-pointer w-full sm:w-auto text-xl uppercase tracking-wider"
                onClick={() => onLearn ? onLearn() : onNavigate('tutorial')}
              >
                <GraduationCap className="mr-3 h-7 w-7" /> Iniciar Tutorial
              </Button>
            </div>
          </div>
          
          <div className="flex-1 w-full max-w-md relative group">
            {/* Removed blur/glow gradients, strict black/green theme */}
            <div className="relative">
              <div className="absolute inset-0 bg-[#00ff88] translate-x-4 translate-y-4 border-2 border-[#00ff88]"></div>
              <img 
                src="/hero-synth.png" 
                alt="Visualização do Sintetizador" 
                className="w-full relative z-10 rounded-none border-2 border-[#00ff88] object-cover bg-black opacity-90 sepia-[.5] hue-rotate-[-50deg] saturate-200"
                style={{aspectRatio: '4/3', mixBlendMode: 'luminosity'}}
              />
            </div>
          </div>
        </div>

        {/* Connection Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-16 border-t-4 border-[#00ff88]">
          <Card className="bg-black border-2 border-[#00ff88] rounded-none p-6">
            <CardHeader className="pb-4 px-0 pt-0">
              <CardTitle className="text-[#00ff88]/70 flex items-center text-sm font-bold tracking-widest uppercase">
                <Server className="mr-3 h-5 w-5 text-[#00ff88]" /> Conexão WebSocket
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <div className="flex items-center justify-between mt-2">
                <span className="text-4xl font-black text-white uppercase">{wsStatus}</span>
                <div className={`h-6 w-6 rounded-none border-2 border-[#00ff88] transition-all duration-200 ${wsStatusRaw === 'open' ? 'bg-[#00ff88]' : wsStatusRaw === 'connecting' ? 'bg-transparent animate-pulse' : 'bg-black'}`}></div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black border-2 border-[#00ff88] rounded-none p-6">
            <CardHeader className="pb-4 px-0 pt-0">
              <CardTitle className="text-[#00ff88]/70 flex items-center text-sm font-bold tracking-widest uppercase">
                <Usb className="mr-3 h-5 w-5 text-[#00ff88]" /> Serial de Hardware (ESP32)
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <div className="flex items-center justify-between mt-2">
                <div>
                  <div className="text-4xl font-black text-white uppercase">{serialStatus}</div>
                  <div className="text-sm text-[#00ff88]/70 mt-3 font-bold tracking-widest uppercase">Porta: {port}</div>
                </div>
                <div className={`h-6 w-6 rounded-none border-2 border-[#00ff88] transition-all duration-200 ${serialStatusRaw === 'connected' ? 'bg-[#00ff88]' : serialStatusRaw === 'connecting' ? 'bg-transparent animate-pulse' : 'bg-black'}`}></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Educational Info Modules */}
        <div className="space-y-12 pt-16 border-t-4 border-[#00ff88]">
          <h2 className="text-4xl font-black flex items-center text-white uppercase tracking-tight"><Activity className="mr-4 text-[#00ff88] h-10 w-10" /> Fundamentos da Síntese</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <Card className="bg-black border-2 border-[#00ff88] rounded-none p-6">
              <CardHeader className="px-0 pt-0">
                <Waves className="h-14 w-14 text-black mb-6 p-3 bg-[#00ff88] rounded-none" />
                <CardTitle className="text-2xl text-white font-black uppercase">Osciladores (VCO)</CardTitle>
                <CardDescription className="text-[#00ff88]/70 text-sm font-bold tracking-widest uppercase mt-2">A fonte sonora</CardDescription>
              </CardHeader>
              <CardContent className="px-0 pb-0 text-lg text-[#00ff88]/90 font-medium leading-relaxed mt-4">
                Gere formas de onda brutas (Senóide, Quadrada, Dente de Serra, Ruído) que formam o tom e a altura fundamentais do seu som.
              </CardContent>
            </Card>

            <Card className="bg-black border-2 border-[#00ff88] rounded-none p-6">
              <CardHeader className="px-0 pt-0">
                <SlidersHorizontal className="h-14 w-14 text-black mb-6 p-3 bg-[#00ff88] rounded-none" />
                <CardTitle className="text-2xl text-white font-black uppercase">Filtros (VCF)</CardTitle>
                <CardDescription className="text-[#00ff88]/70 text-sm font-bold tracking-widest uppercase mt-2">Molde o timbre</CardDescription>
              </CardHeader>
              <CardContent className="px-0 pb-0 text-lg text-[#00ff88]/90 font-medium leading-relaxed mt-4">
                Remova ou enfatize frequências específicas usando Cutoff e Ressonância para esculpir o caráter final da forma de onda.
              </CardContent>
            </Card>

            <Card className="bg-black border-2 border-[#00ff88] rounded-none p-6">
              <CardHeader className="px-0 pt-0">
                <Settings2 className="h-14 w-14 text-black mb-6 p-3 bg-[#00ff88] rounded-none" />
                <CardTitle className="text-2xl text-white font-black uppercase">Envelopes (ADSR)</CardTitle>
                <CardDescription className="text-[#00ff88]/70 text-sm font-bold tracking-widest uppercase mt-2">Forma no tempo</CardDescription>
              </CardHeader>
              <CardContent className="px-0 pb-0 text-lg text-[#00ff88]/90 font-medium leading-relaxed mt-4">
                Controle como o volume ou filtro do som muda ao longo do tempo usando os estágios de Attack, Decay, Sustain e Release.
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
}
