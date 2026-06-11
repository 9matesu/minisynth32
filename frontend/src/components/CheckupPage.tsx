import { useState, useEffect, useRef, useCallback } from 'react';
import { UseSynthStateReturn } from '../hooks/useSynthState';
import { CheckCircle2, XCircle, Loader2, AlertCircle, RotateCcw, ArrowLeft, Wifi, Usb, Database, Zap } from 'lucide-react';

interface CheckupPageProps {
  synth: UseSynthStateReturn;
  onComplete: () => void;
  onBack: () => void;
}

const MAX_ATTEMPTS = 3;
const ATTEMPT_TIMEOUT_MS = 6000;

type CheckPhase = 'checking' | 'success' | 'failed';

export function CheckupPage({ synth, onComplete, onBack }: CheckupPageProps) {
  const wsConnected = synth.connectionState === 'open';
  const serialConnected = synth.serialStatus?.status === 'connected';
  const isReady = synth.ready;
  const allGood = wsConnected && serialConnected && isReady;

  const [attempt, setAttempt] = useState(1);
  const [phase, setPhase] = useState<CheckPhase>('checking');
  const [countdown, setCountdown] = useState(ATTEMPT_TIMEOUT_MS / 1000);
  const [autoEntered, setAutoEntered] = useState(false);

  const attemptTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Cleanup helper ────────────────────────────────────────
  const clearTimers = useCallback(() => {
    if (attemptTimerRef.current) { clearTimeout(attemptTimerRef.current); attemptTimerRef.current = null; }
    if (countdownTimerRef.current) { clearInterval(countdownTimerRef.current); countdownTimerRef.current = null; }
  }, []);

  // ── Auto-enter when all systems go ────────────────────────
  useEffect(() => {
    if (allGood && phase === 'checking' && !autoEntered) {
      clearTimers();
      setPhase('success');
      setAutoEntered(true);
    }
  }, [allGood, phase, autoEntered, clearTimers]);

  // ── Navigate after success flash ──────────────────────────
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (phase !== 'success') return;
    const enterTimer = setTimeout(() => onCompleteRef.current(), 800);
    return () => clearTimeout(enterTimer);
  }, [phase]);

  // ── Attempt timer: countdown + retry logic ────────────────
  useEffect(() => {
    if (phase !== 'checking') return;

    // Start countdown display
    setCountdown(ATTEMPT_TIMEOUT_MS / 1000);
    countdownTimerRef.current = setInterval(() => {
      setCountdown(prev => Math.max(0, prev - 1));
    }, 1000);

    // Timeout for this attempt
    attemptTimerRef.current = setTimeout(() => {
      if (attempt < MAX_ATTEMPTS) {
        setAttempt(prev => prev + 1);
        // The effect will re-run due to attempt change
      } else {
        setPhase('failed');
        clearTimers();
      }
    }, ATTEMPT_TIMEOUT_MS);

    return clearTimers;
  }, [attempt, phase, clearTimers]);

  // ── Retry from failed state ───────────────────────────────
  const handleRetry = () => {
    setAttempt(1);
    setPhase('checking');
    setAutoEntered(false);
  };

  // ── Status item component ────────────────────────────────
  const StatusItem = ({ label, connected, error, icon: Icon }: { 
    label: string; connected: boolean; error?: boolean; icon: typeof Wifi 
  }) => (
    <div className="flex items-center gap-4 py-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-background border border-border">
        <Icon size={18} className={connected ? 'text-primary' : error ? 'text-red-500' : 'text-textDim'} />
      </div>
      <div className="flex-1 flex flex-col">
        <span className="font-bold text-text text-sm">{label}</span>
        <span className={`text-xs font-mono ${connected ? 'text-primary' : error ? 'text-red-500' : 'text-textDim'}`}>
          {connected ? 'Conectado' : error ? 'Erro' : 'Aguardando...'}
        </span>
      </div>
      <div className="w-6 flex justify-center">
        {connected ? (
          <CheckCircle2 className="text-primary" size={20} />
        ) : error ? (
          <XCircle className="text-red-500" size={20} />
        ) : (
          <Loader2 className="text-textDim animate-spin" size={20} />
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen bg-background p-6">
      <div className="w-full max-w-[520px] flex flex-col gap-6">
        
        {/* Header */}
        <div className="text-center flex flex-col gap-2">
          <h1 className="text-2xl font-black text-text uppercase tracking-widest">Verificação do Sistema</h1>
          {phase === 'checking' && (
            <p className="text-xs text-textDim font-mono uppercase tracking-wider">
              Tentativa {attempt}/{MAX_ATTEMPTS} · {countdown}s restantes
            </p>
          )}
          {phase === 'success' && (
            <p className="text-xs text-primary font-bold uppercase tracking-wider flex items-center justify-center gap-2">
              <Zap size={14} /> Tudo certo — entrando no synth...
            </p>
          )}
          {phase === 'failed' && (
            <p className="text-xs text-red-500 font-bold uppercase tracking-wider">
              Falha na conexão após {MAX_ATTEMPTS} tentativas
            </p>
          )}
        </div>

        {/* Progress bar */}
        {phase === 'checking' && (
          <div className="w-full h-1 bg-border rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-1000 ease-linear"
              style={{ width: `${(countdown / (ATTEMPT_TIMEOUT_MS / 1000)) * 100}%` }}
            />
          </div>
        )}
        {phase === 'success' && (
          <div className="w-full h-1 bg-primary rounded-full" />
        )}
        {phase === 'failed' && (
          <div className="w-full h-1 bg-red-400 rounded-full" />
        )}

        {/* Status checks */}
        <div className="bg-panel border border-border rounded-2xl p-6 divide-y divide-border">
          <StatusItem 
            label="Backend WebSocket" 
            connected={wsConnected} 
            error={synth.connectionState === 'error' || synth.connectionState === 'closed'} 
            icon={Wifi} 
          />
          <StatusItem 
            label="Porta Serial do ESP32" 
            connected={serialConnected} 
            error={synth.serialStatus?.status === 'error'} 
            icon={Usb} 
          />
          <StatusItem 
            label="Sincronização Inicial de Dados" 
            connected={isReady} 
            icon={Database} 
          />
        </div>

        {/* Error panel */}
        {phase === 'failed' && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex flex-col gap-4">
            <h3 className="font-bold text-red-700 uppercase tracking-widest text-xs flex items-center gap-2">
              <AlertCircle size={14} /> Guia de Resolução de Problemas
            </h3>

            {!wsConnected && (
              <div className="flex flex-col gap-2">
                <h4 className="font-bold text-red-800 text-sm">Backend inacessível</h4>
                <ul className="flex flex-col gap-1.5 text-xs text-red-900 font-medium list-disc pl-4">
                  <li>Certifique-se de que o backend Node está rodando: <code className="bg-red-100 px-1.5 py-0.5 rounded font-mono text-[11px]">npm run dev</code></li>
                  <li>Verifique se a porta 3333 está bloqueada por firewall ou outro processo.</li>
                  <li>Olhe o terminal para erros de crash no backend.</li>
                </ul>
              </div>
            )}

            {wsConnected && !serialConnected && (
              <div className="flex flex-col gap-2">
                <h4 className="font-bold text-red-800 text-sm">ESP32 não detectado</h4>
                <ul className="flex flex-col gap-1.5 text-xs text-red-900 font-medium list-disc pl-4">
                  <li><strong>Cabo USB</strong> — Garanta que é um cabo de dados, não apenas carregamento.</li>
                  <li><strong>Energia</strong> — O LED de energia do ESP32 deve estar aceso.</li>
                  <li><strong>Firmware</strong> — Garanta que o ESP32 está com o firmware minisynth32.</li>
                  <li><strong>Conflito de porta</strong> — Feche a Arduino IDE, PlatformIO ou qualquer monitor serial que possa estar ocupando a porta COM.</li>
                  <li><strong>Driver</strong> — Instale o driver USB-serial CH340/CP2102 se necessário.</li>
                  {synth.serialStatus?.error && (
                    <li className="text-red-600"><strong>Erro serial:</strong> {synth.serialStatus.error}</li>
                  )}
                </ul>
              </div>
            )}

            {wsConnected && serialConnected && !isReady && (
              <div className="flex flex-col gap-2">
                <h4 className="font-bold text-red-800 text-sm">Sincronização travada</h4>
                <ul className="flex flex-col gap-1.5 text-xs text-red-900 font-medium list-disc pl-4">
                  <li>O ESP32 está conectado mas não envia dados JSON válidos.</li>
                  <li>Verifique se o baud rate do firmware e backend é o mesmo (115200).</li>
                  <li>Tente apertar o botão reset do ESP32.</li>
                </ul>
              </div>
            )}

            {synth.lastError && (
              <div className="mt-2 p-3 bg-red-100 border border-red-200 rounded-lg">
                <p className="text-xs text-red-800 font-mono break-all">
                  <strong>Erro do sistema:</strong> {synth.lastError}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={onBack}
            className="px-5 py-2.5 rounded-xl border border-border bg-panel text-text font-bold text-xs uppercase tracking-widest hover:bg-background transition-colors flex items-center gap-2"
          >
            <ArrowLeft size={14} /> Voltar
          </button>

          {phase === 'failed' && (
            <button
              onClick={handleRetry}
              className="px-5 py-2.5 rounded-xl border border-primary bg-primary/10 text-primary font-bold text-xs uppercase tracking-widest hover:bg-primary/20 transition-colors flex items-center gap-2"
            >
              <RotateCcw size={14} /> Tentar Novamente
            </button>
          )}

          {phase === 'failed' && (
            <button
              onClick={onComplete}
              className="px-5 py-2.5 rounded-xl border border-border bg-panel text-textDim font-bold text-xs uppercase tracking-widest hover:bg-background transition-colors"
            >
              Entrar Mesmo Assim
            </button>
          )}

          {phase === 'checking' && allGood && (
            <button
              onClick={onComplete}
              className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-xs uppercase tracking-widest shadow-[0_4px_12px_rgba(16,185,129,0.3)] hover:-translate-y-0.5 transition-all"
            >
              Entrar no Synth
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
