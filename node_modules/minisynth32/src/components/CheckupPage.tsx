import { UseSynthStateReturn } from '../hooks/useSynthState';

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
    <div className="front-page">
      <div className="front-content" style={{ maxWidth: '600px', textAlign: 'left', width: '100%' }}>
        <h1 className="title" style={{ fontSize: '2.5rem', marginBottom: '2rem', textAlign: 'center' }}>System Checkup</h1>
        
        <div className="checkup-steps" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem', fontSize: '1.2rem', backgroundColor: 'rgba(0,0,0,0.3)', padding: '2rem', borderRadius: '12px' }}>
          <div className="step" style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ display: 'inline-block', width: '40px', fontSize: '1.5rem' }}>{wsConnected ? '✅' : '⏳'}</span>
            <div>
              <div style={{ fontWeight: 'bold' }}>Backend Connection (WebSocket)</div>
              <div style={{ fontSize: '0.9rem', color: '#aaa' }}>Status: {synth.connectionState === 'open' ? 'connected' : synth.connectionState}</div>
            </div>
          </div>
          
          <div className="step" style={{ display: 'flex', alignItems: 'flex-start' }}>
            <span style={{ display: 'inline-block', width: '40px', fontSize: '1.5rem' }}>
              {serialConnected ? '✅' : (synth.serialStatus?.status === 'error' ? '❌' : '⏳')}
            </span>
            <div>
              <div style={{ fontWeight: 'bold' }}>ESP32 Serial Port</div>
              <div style={{ fontSize: '0.9rem', color: '#aaa' }}>Status: {synth.serialStatus?.status || 'unknown'}</div>
              {synth.serialStatus?.status === 'error' && (
                <div style={{ color: '#ff6b6b', fontSize: '0.9rem', marginTop: '0.5rem', backgroundColor: 'rgba(255,0,0,0.1)', padding: '0.5rem', borderRadius: '4px' }}>
                  Serial Error Detected
                </div>
              )}
            </div>
          </div>
          
          <div className="step" style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ display: 'inline-block', width: '40px', fontSize: '1.5rem' }}>{isReady ? '✅' : '⏳'}</span>
            <div>
              <div style={{ fontWeight: 'bold' }}>Initial Data Sync</div>
              <div style={{ fontSize: '0.9rem', color: '#aaa' }}>Status: {isReady ? 'Ready' : 'Waiting...'}</div>
            </div>
          </div>
        </div>

        {(!allGood && (hasError || synth.lastError)) && (
          <div className="error-panel" style={{ backgroundColor: 'rgba(255,50,50,0.1)', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid rgba(255,50,50,0.3)' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#ff6b6b' }}>Connection Troubleshooting</h3>
            <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#e0e0e0', fontSize: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {!wsConnected && <li>Ensure the Node backend is running (<code>npm run dev</code>).</li>}
              {(wsConnected && !serialConnected) && <li>Check the USB cable connection between your computer and the ESP32.</li>}
              {(wsConnected && !serialConnected) && <li>Ensure the ESP32 is powered on and flashed with the correct firmware.</li>}
              {(wsConnected && !serialConnected) && <li>Check if another program is holding the serial port open.</li>}
              {(wsConnected && !serialConnected) && <li><strong style={{color: '#fff'}}>The system is automatically trying to reconnect in the background...</strong></li>}
              {synth.lastError && <li>System Error: {synth.lastError}</li>}
            </ul>
          </div>
        )}

        <div className="actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button className="btn-secondary" onClick={onBack}>
            Back
          </button>
          
          {!allGood && (
            <button className="btn-secondary" onClick={() => window.location.reload()}>
              Force Reload
            </button>
          )}

          <button 
            className="btn-primary" 
            onClick={onComplete}
            disabled={!allGood}
            style={{ opacity: allGood ? 1 : 0.5, cursor: allGood ? 'pointer' : 'not-allowed' }}
          >
            {allGood ? 'Enter Synth 🚀' : 'Waiting...'}
          </button>
        </div>
      </div>
    </div>
  );
}
