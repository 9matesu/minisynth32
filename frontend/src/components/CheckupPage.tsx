import { UseSynthStateReturn } from '../hooks/useSynthState';
import { CheckCircle2, XCircle, Loader2, AlertCircle } from 'lucide-react';

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
    <div className="flex flex-col items-center justify-center w-full min-h-screen bg-background p-6">
      <div className="w-full max-w-[600px] flex flex-col gap-8">
        <h1 className="text-3xl font-black text-center text-text uppercase tracking-widest">System Checkup</h1>
        
        <div className="flex flex-col gap-6 bg-panel border border-border p-8 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-8 flex justify-center">
              {wsConnected ? <CheckCircle2 className="text-primary" size={24} /> : <Loader2 className="text-textDim animate-spin" size={24} />}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-text text-sm uppercase tracking-wide">Backend Connection</span>
              <span className="text-xs text-textDim font-mono">Status: {synth.connectionState === 'open' ? 'connected' : synth.connectionState}</span>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="w-8 flex justify-center mt-1">
              {serialConnected ? <CheckCircle2 className="text-primary" size={24} /> : (synth.serialStatus?.status === 'error' ? <XCircle className="text-red-500" size={24} /> : <Loader2 className="text-textDim animate-spin" size={24} />)}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-text text-sm uppercase tracking-wide">ESP32 Serial Port</span>
              <span className="text-xs text-textDim font-mono">Status: {synth.serialStatus?.status || 'unknown'}</span>
              {synth.serialStatus?.status === 'error' && (
                <div className="mt-2 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-md border border-red-100 flex items-center gap-2">
                  <AlertCircle size={14} /> Serial Error Detected
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-8 flex justify-center">
              {isReady ? <CheckCircle2 className="text-primary" size={24} /> : <Loader2 className="text-textDim animate-spin" size={24} />}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-text text-sm uppercase tracking-wide">Initial Data Sync</span>
              <span className="text-xs text-textDim font-mono">Status: {isReady ? 'Ready' : 'Waiting...'}</span>
            </div>
          </div>
        </div>

        {(!allGood && (hasError || synth.lastError)) && (
          <div className="bg-red-50 border border-red-200 p-6 rounded-xl flex flex-col gap-4">
            <h3 className="font-bold text-red-600 uppercase tracking-widest text-xs flex items-center gap-2"><AlertCircle size={14}/> Troubleshooting</h3>
            <ul className="flex flex-col gap-2 text-xs text-red-900 font-medium list-disc pl-4">
              {!wsConnected && <li>Ensure the Node backend is running (<code className="bg-red-100 px-1 rounded font-mono">npm run dev</code>).</li>}
              {(wsConnected && !serialConnected) && <li>Check the USB cable connection between your computer and the ESP32.</li>}
              {(wsConnected && !serialConnected) && <li>Ensure the ESP32 is powered on and flashed with the correct firmware.</li>}
              {(wsConnected && !serialConnected) && <li>Check if another program is holding the serial port open.</li>}
              {(wsConnected && !serialConnected) && <li className="font-bold animate-pulse">The system is automatically trying to reconnect in the background...</li>}
              {synth.lastError && <li>System Error: {synth.lastError}</li>}
            </ul>
          </div>
        )}

        <div className="flex items-center justify-center gap-4 pt-4">
          <button 
            onClick={onBack}
            className="px-6 py-3 rounded-xl border border-border bg-panel text-text font-bold text-xs uppercase tracking-widest hover:bg-border/30 transition-colors"
          >
            Back
          </button>
          
          {!allGood && (
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 rounded-xl border border-border bg-panel text-text font-bold text-xs uppercase tracking-widest hover:bg-border/30 transition-colors"
            >
              Force Reload
            </button>
          )}

          <button 
            onClick={onComplete}
            disabled={!allGood}
            className={`px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${allGood ? 'bg-primary text-white shadow-[0_4px_12px_rgba(16,185,129,0.3)] hover:-translate-y-0.5' : 'bg-border text-textDim cursor-not-allowed opacity-50'}`}
          >
            {allGood ? 'Enter Synth' : 'Waiting...'}
          </button>
        </div>
      </div>
    </div>
  );
}
