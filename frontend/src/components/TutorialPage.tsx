import { useState } from 'react';

const TUTORIAL_STEPS = [
  {
    title: 'Seleção de Forma de Onda',
    description: 'Escolha entre 4 formas de onda diferentes no setor OSC 1.',
    details: [
      'Square (Quadrada): Som brilhante e percussivo',
      'Sine (Senoidal): Som puro e macio',
      'Saw (Dente de serra): Som rico em harmônicos',
      'Noise (Ruído): Som ruidoso e metálico',
    ],
    tip: 'Comece com sine para entender harmônicos básicos.',
  },
  {
    title: 'Ajuste de Frequência',
    description: 'Use o knob "Tune" para alterar a frequência base do oscillador.',
    details: [
      'Faixa de 20Hz a 20kHz (audição humana)',
      'Valores baixos = tons graves',
      'Valores altos = tons agudos',
    ],
    tip: 'Experimente valores entre 30-80 para sons musicais.',
  },
  {
    title: 'Controle de Volume',
    description: 'O knob "Level" controla o volume de saída do oscillador.',
    details: [
      'Evite distorção mantendo valores moderados',
      'Use para balancear múltiplas fontes (se houver)',
      'Importante para mixing final',
    ],
    tip: 'Mantenha entre 50-90 para melhor dinâmica.',
  },
  {
    title: 'ADSR - Attack',
    description: 'Attack controla quanto tempo leva para o som atingir o volume máximo.',
    details: [
      'Valores baixos (0-20): Ataque percussivo, como um piano',
      'Valores médios (30-50): Ataque suave, como um violino',
      'Valores altos (60-100): Fade-in gradual, como um pad',
    ],
    tip: 'Para sons percussivos, use valores baixos.',
  },
  {
    title: 'ADSR - Decay',
    description: 'Decay determina o tempo para cair do pico até o nível sustentado.',
    details: [
      'Após o attack, o som desce para o nível de sustain',
      'Valores baixos: transição rápida',
      'Valores altos: transição lenta e musical',
    ],
    tip: 'Combinado com sustain, cria o "corpo" do som.',
  },
  {
    title: 'ADSR - Sustain',
    description: 'Sustain é o nível mantido enquanto a nota está sendo tocada.',
    details: [
      'Valores altos: som continua forte',
      'Valores baixos: som praticamente desaparece (staccato)',
      'Afeta como o som "respira"',
    ],
    tip: 'Para pads, use sustain alto. Para notas curtas, use baixo.',
  },
  {
    title: 'ADSR - Release',
    description: 'Release controla quanto tempo o som leva para desaparecer após soltar a nota.',
    details: [
      'Valores baixos: som "seco", corte abrupto',
      'Valores altos: cauda sonora longa e ressonante',
      'Cria sensação de espaço e reverb natural',
    ],
    tip: 'Aumente para sons mais "naturais" e envolventes.',
  },
  {
    title: 'Ativar o Filtro',
    description: 'O filtro remove ou atenua frequências altas do som.',
    details: [
      'Clique no botão de toggle "Filter" para ativar',
      'Filtros são essenciais para síntese subtrativa',
      'Cria movimento e interesse no timbre',
    ],
    tip: 'Ative o filtro para controle tímbrico avançado.',
  },
  {
    title: 'Cutoff - Frequência de Corte',
    description: 'Define onde o filtro começa a remover frequências.',
    details: [
      'Valores baixos: som escuro, sem frequências altas',
      'Valores altos: som brilhante, mais detalhes',
      'Faixa: 20Hz a 20kHz',
    ],
    tip: 'Varie cutoff para criar movimento dinâmico.',
  },
  {
    title: 'Resonance - Ênfase',
    description: 'Aumenta o volume exatamente na frequência de corte (Cutoff).',
    details: [
      'Valores baixos: filtro suave',
      'Valores altos: pico pronunciado, efeito "wah-wah"',
      'Pode causar oscilação em valores extremos',
    ],
    tip: 'Use com cuidado - valores altos criam efeitos dramáticos.',
  },
  {
    title: 'Envelope do Filtro',
    description: 'Modula o cutoff usando o envelope ADSR, criando varreduras dinâmicas.',
    details: [
      'Valores positivos: cutoff sobe com a nota (brilho aumenta)',
      'Valores negativos: cutoff desce com a nota (escurece)',
      'Cria efeito de "sweep" característico da síntese',
    ],
    tip: 'Experimente valores entre 40-80 para efeitos musicais.',
  },
  {
    title: 'Slope do Filtro',
    description: 'Determina a agressividade do filtro.',
    details: [
      '12 dB: Filtro suave, menos agressivo',
      '24 dB: Filtro mais forte, mais ressonante',
      'Mais steep = maior contraste tímbrico',
    ],
    tip: 'Use 24 dB para efeitos mais dramáticos.',
  },
  {
    title: 'Presets e Salvamento',
    description: 'Salve suas criações como presets para reutilização.',
    details: [
      'Clique "SAVE" para guardar os ajustes atuais',
      'Navegue entre presets com as setas',
      'Ótimo para construir paleta sonora pessoal',
    ],
    tip: 'Salve frequentemente enquanto experimenta!',
  },
  {
    title: 'Criando Seu Primeiro Som',
    description: 'Guia prático para criar um som interessante.',
    details: [
      '1. Comece com Square wave, Tune ~60',
      '2. Attack ~10, Decay ~30, Sustain ~70, Release ~20',
      '3. Ative o filtro, Cutoff ~50, Resonance ~40',
      '4. Filter Envelope ~60 para movimento',
    ],
    tip: 'Ajuste pequenas mudanças e ouça o resultado!',
  },
];

export function TutorialPage({ onClose }: { onClose: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const step = TUTORIAL_STEPS[currentStep];
  const totalSteps = TUTORIAL_STEPS.length;

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="tutorial-page">
      <div className="tutorial-container">
        <div className="tutorial-header">
          <button
            className="tutorial-close-btn"
            onClick={onClose}
            aria-label="Fechar tutorial"
          >
            ✕
          </button>
          <h1 className="tutorial-title">Guia de Aprendizado</h1>
          <p className="tutorial-step-counter">
            Etapa {currentStep + 1} de {totalSteps}
          </p>
        </div>

        <div className="tutorial-content">
          <div className="tutorial-step">
            <h2 className="tutorial-step-title">{step.title}</h2>
            <p className="tutorial-step-description">{step.description}</p>

            <div className="tutorial-step-details">
              <ul className="tutorial-details-list">
                {step.details.map((detail, index) => (
                  <li key={index} className="tutorial-details-item">
                    {detail}
                  </li>
                ))}
              </ul>
            </div>

            <div className="tutorial-tip">
              <span className="tutorial-tip-icon">💡</span>
              <p className="tutorial-tip-text">{step.tip}</p>
            </div>
          </div>

          <div className="tutorial-progress">
            <div className="tutorial-progress-bar">
              <div
                className="tutorial-progress-fill"
                style={{
                  width: `${((currentStep + 1) / totalSteps) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        </div>

        <div className="tutorial-footer">
          <button
            className="tutorial-nav-btn tutorial-nav-btn--prev"
            onClick={prevStep}
            disabled={currentStep === 0}
            aria-label="Etapa anterior"
          >
            ← Anterior
          </button>

          <div className="tutorial-dots">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <button
                key={index}
                className={`tutorial-dot ${index === currentStep ? 'tutorial-dot--active' : ''}`}
                onClick={() => setCurrentStep(index)}
                aria-label={`Ir para etapa ${index + 1}`}
              ></button>
            ))}
          </div>

          <button
            className="tutorial-nav-btn tutorial-nav-btn--next"
            onClick={nextStep}
            disabled={currentStep === totalSteps - 1}
            aria-label="Próxima etapa"
          >
            Próxima →
          </button>
        </div>
      </div>
    </div>
  );
}
