import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Server, Usb, Database, CheckSquare, Square, XSquare, AlertTriangle, ArrowLeft, RefreshCw, Play } from "lucide-react";
import type { UseSynthStateReturn } from '../hooks/useSynthState';

interface CheckupPageProps {
  synth: UseSynthStateReturn;
  onComplete: () => void;
  onBack: () => void;
}

export function CheckupPage({ synth, onComplete, onBack }: CheckupPageProps) {
  const wsConnected = synth.connectionState === 'open';
  const serialConnected = synth.serialStatus?.status === 'connected';
  const isReady = synth.ready;

  const allGood = wsConnected && serialConnected && isReady;
  const hasError = synth.serialStatus?.status === 'error' || synth.connectionState === 'closed' || synth.connectionState === 'error' || synth.lastError;

  return (
    <div className="min-h-screen bg-black text-[#00ff88] flex flex-col font-sans w-full items-center justify-center selection:bg-[#00ff88] selection:text-black">
      <div className="w-full max-w-4xl p-6 md:p-12 space-y-12">
        
        <div className="text-center space-y-6">
          <Badge variant="outline" className="rounded-none border-2 border-[#00ff88] text-[#00ff88] bg-black px-4 py-2 font-bold tracking-widest uppercase text-xs">
            Diagnóstico
          </Badge>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight uppercase">
            Verificação do <span className="text-white">Sistema</span>
          </h1>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          {/* WebSocket Check */}
          <Card className="bg-black border-2 border-[#00ff88] rounded-none p-6 flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {wsConnected ? (
                <CheckSquare className="h-10 w-10 text-[#00ff88]" />
              ) : (
                <Square className="h-10 w-10 text-[#00ff88] animate-pulse" />
              )}
              <div>
                <CardTitle className="text-xl text-white font-black uppercase flex items-center">
                  <Server className="mr-3 h-6 w-6 text-[#00ff88]" /> Conexão Backend
                </CardTitle>
                <div className="text-[#00ff88]/70 text-sm font-bold tracking-widest uppercase mt-2">
                  Status: {wsConnected ? 'Conectado' : synth.connectionState}
                </div>
              </div>
            </div>
          </Card>

          {/* ESP32 Serial Check */}
          <Card className={`bg-black border-2 ${synth.serialStatus?.status === 'error' ? 'border-white' : 'border-[#00ff88]'} rounded-none p-6 flex items-center justify-between`}>
            <div className="flex items-center space-x-6">
              {serialConnected ? (
                <CheckSquare className="h-10 w-10 text-[#00ff88]" />
              ) : synth.serialStatus?.status === 'error' ? (
                <XSquare className="h-10 w-10 text-white" />
              ) : (
                <Square className="h-10 w-10 text-[#00ff88] animate-pulse" />
              )}
              <div>
                <CardTitle className={`text-xl ${synth.serialStatus?.status === 'error' ? 'text-white' : 'text-white'} font-black uppercase flex items-center`}>
                  <Usb className={`mr-3 h-6 w-6 ${synth.serialStatus?.status === 'error' ? 'text-white' : 'text-[#00ff88]'}`} /> Porta Serial ESP32
                </CardTitle>
                <div className={`${synth.serialStatus?.status === 'error' ? 'text-white/70' : 'text-[#00ff88]/70'} text-sm font-bold tracking-widest uppercase mt-2`}>
                  Status: {synth.serialStatus?.status || 'desconhecido'}
                </div>
                {synth.serialStatus?.status === 'error' && (
                  <div className="mt-3 text-black bg-white px-3 py-1 text-sm font-bold uppercase tracking-widest inline-block">
                    Erro Serial Detectado
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Initial Data Sync Check */}
          <Card className="bg-black border-2 border-[#00ff88] rounded-none p-6 flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {isReady ? (
                <CheckSquare className="h-10 w-10 text-[#00ff88]" />
              ) : (
                <Square className="h-10 w-10 text-[#00ff88] animate-pulse" />
              )}
              <div>
                <CardTitle className="text-xl text-white font-black uppercase flex items-center">
                  <Database className="mr-3 h-6 w-6 text-[#00ff88]" /> Sincronização de Dados Iniciais
                </CardTitle>
                <div className="text-[#00ff88]/70 text-sm font-bold tracking-widest uppercase mt-2">
                  Status: {isReady ? 'Pronto' : 'Aguardando...'}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Error Troubleshooting Panel */}
        {(!allGood && (hasError || synth.lastError)) && (
          <div className="bg-black border-2 border-white p-8 mt-8">
            <h3 className="text-2xl font-black text-white uppercase flex items-center mb-6">
              <AlertTriangle className="mr-3 h-8 w-8 text-white" /> Solução de Problemas
            </h3>
            <ul className="space-y-3 text-lg text-white/80 font-medium list-disc pl-8 marker:text-white">
              {!wsConnected && <li>Certifique-se de que o backend Node está em execução (<code>npm run dev</code>).</li>}
              {(wsConnected && !serialConnected) && <li>Verifique a conexão do cabo USB entre o computador e o ESP32.</li>}
              {(wsConnected && !serialConnected) && <li>Certifique-se de que o ESP32 está ligado e gravado com o firmware correto.</li>}
              {(wsConnected && !serialConnected) && <li>Verifique se outro programa está mantendo a porta serial aberta.</li>}
              {(wsConnected && !serialConnected) && <li className="text-[#00ff88] font-bold">O sistema está tentando reconectar automaticamente em segundo plano...</li>}
              {synth.lastError && <li>Erro do Sistema: {synth.lastError}</li>}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 pt-10 justify-center">
          <Button 
            size="lg" 
            variant="outline" 
            className="bg-black hover:bg-white text-white hover:text-black font-black h-16 px-10 rounded-none border-2 border-white transition-colors duration-200 cursor-pointer text-xl uppercase tracking-wider"
            onClick={onBack}
          >
            <ArrowLeft className="mr-3 h-6 w-6" /> Voltar
          </Button>
          
          {!allGood && (
            <Button 
              size="lg" 
              variant="outline" 
              className="bg-black hover:bg-white text-white hover:text-black font-black h-16 px-10 rounded-none border-2 border-white transition-colors duration-200 cursor-pointer text-xl uppercase tracking-wider"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="mr-3 h-6 w-6" /> Forçar Recarregamento
            </Button>
          )}

          <Button 
            size="lg" 
            className="bg-[#00ff88] hover:bg-black text-black hover:text-[#00ff88] font-black h-16 px-12 rounded-none border-2 border-[#00ff88] transition-colors duration-200 uppercase tracking-wider text-xl disabled:opacity-50 disabled:hover:bg-[#00ff88] disabled:hover:text-black disabled:cursor-not-allowed"
            onClick={onComplete}
            disabled={!allGood}
          >
            {allGood ? (
              <><Play className="mr-3 h-6 w-6" fill="currentColor" /> Entrar no Sintetizador</>
            ) : (
              <><Square className="mr-3 h-6 w-6 animate-pulse" /> Aguardando...</>
            )}
          </Button>
        </div>

      </div>
    </div>
  );
}
