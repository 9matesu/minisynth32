import { useState } from 'react';

const TUTORIAL_STEPS = [
  {
    title: 'Selecao de Forma de Onda',
    description: 'Escolha entre 4 formas de onda diferentes no setor OSC 1.',
    details: [
      'Square (quadrada): som brilhante e percussivo',
      'Sine (senoidal): som puro e macio',
      'Saw (dente de serra): som rico em harmonicos',
      'Triangle (triangular): som puro e oco',
    ],
    tip: 'Comece com Sine para entender harmonicos basicos.',
  },
  {
    title: 'Ajuste de Frequencia',
    description: 'Use o knob "Tune" para alterar a frequencia base do oscilador.',
    details: [
      'Faixa de 20 Hz a 20 kHz, dentro da audicao humana',
      'Valores baixos criam tons graves',
      'Valores altos criam tons agudos',
    ],
    tip: 'Experimente valores entre 30 e 80 para sons musicais.',
  },
  {
    title: 'Controle de Volume',
    description: 'O knob "Level" controla o volume de saida do oscilador.',
    details: [
      'Evite distorcao mantendo valores moderados',
      'Use para equilibrar multiplas fontes, quando houver',
      'Importante para a mixagem final',
    ],
    tip: 'Mantenha entre 50 e 90 para melhor dinamica.',
  },
  {
    title: 'ADSR - Attack',
    description: 'Attack controla quanto tempo o som leva para atingir o volume maximo.',
    details: [
      'Valores baixos (0-20): ataque percussivo, como um piano',
      'Valores medios (30-50): ataque suave, como um violino',
      'Valores altos (60-100): entrada gradual, como um pad',
    ],
    tip: 'Para sons percussivos, use valores baixos.',
  },
  {
    title: 'ADSR - Decay',
    description: 'Decay determina o tempo para cair do pico ate o nivel sustentado.',
    details: [
      'Depois do attack, o som desce para o nivel de sustain',
      'Valores baixos: transicao rapida',
      'Valores altos: transicao lenta e musical',
    ],
    tip: 'Combinado com sustain, cria o corpo do som.',
  },
  {
    title: 'ADSR - Sustain',
    description: 'Sustain e o nivel mantido enquanto a nota esta sendo tocada.',
    details: [
      'Valores altos: o som continua forte',
      'Valores baixos: o som praticamente desaparece, criando staccato',
      'Afeta como o som respira',
    ],
    tip: 'Para pads, use sustain alto. Para notas curtas, use baixo.',
  },
  {
    title: 'ADSR - Release',
    description: 'Release controla quanto tempo o som leva para desaparecer apos soltar a nota.',
    details: [
      'Valores baixos: som seco, com corte abrupto',
      'Valores altos: cauda sonora longa e ressonante',
      'Cria sensacao de espaco e reverb natural',
    ],
    tip: 'Aumente para sons mais naturais e envolventes.',
  },
  {
    title: 'Ativar o Filtro',
    description: 'O filtro remove ou atenua frequencias altas do som.',
    details: [
      'Clique no botao "Filter" para ativar',
      'Filtros sao essenciais para sintese subtrativa',
      'Cria movimento e interesse no timbre',
    ],
    tip: 'Ative o filtro para controle timbrico avancado.',
  },
  {
    title: 'Cutoff - Frequencia de Corte',
    description: 'Define onde o filtro comeca a remover frequencias.',
    details: [
      'Valores baixos: som escuro, sem frequencias altas',
      'Valores altos: som brilhante, com mais detalhes',
      'Faixa: 20 Hz a 20 kHz',
    ],
    tip: 'Varie cutoff para criar movimento dinamico.',
  },
  {
    title: 'Resonance - Enfase',
    description: 'Aumenta o volume exatamente na frequencia de corte.',
    details: [
      'Valores baixos: filtro suave',
      'Valores altos: pico pronunciado, efeito wah-wah',
      'Pode causar oscilacao em valores extremos',
    ],
    tip: 'Use com cuidado: valores altos criam efeitos dramaticos.',
  },
  {
    title: 'Envelope do Filtro',
    description: 'Modula o cutoff usando o envelope ADSR, criando varreduras dinamicas.',
    details: [
      'Valores positivos: cutoff sobe com a nota, aumentando o brilho',
      'Valores negativos: cutoff desce com a nota, escurecendo o som',
      'Cria o efeito de varredura caracteristico da sintese',
    ],
    tip: 'Experimente valores entre 40 e 80 para efeitos musicais.',
  },
  {
    title: 'Slope do Filtro',
    description: 'Determina a agressividade do filtro.',
    details: [
      '12 dB: filtro suave, menos agressivo',
      '24 dB: filtro mais forte e mais ressonante',
      'Maior inclinacao cria maior contraste timbrico',
    ],
    tip: 'Use 24 dB para efeitos mais dramaticos.',
  },
  {
    title: 'Presets e Salvamento',
    description: 'Salve suas criacoes como presets para reutilizacao.',
    details: [
      'Clique em "SAVE" para guardar os ajustes atuais',
      'Navegue entre presets com as setas',
      'Otimo para construir uma paleta sonora pessoal',
    ],
    tip: 'Salve frequentemente enquanto experimenta.',
  },
  {
    title: 'Criando Seu Primeiro Som',
    description: 'Guia pratico para criar um som interessante.',
    details: [
      '1. Comece com onda Square e Tune perto de 60',
      '2. Use Attack perto de 10, Decay perto de 30, Sustain perto de 70 e Release perto de 20',
      '3. Ative o filtro, com Cutoff perto de 50 e Resonance perto de 40',
      '4. Use Filter Envelope perto de 60 para criar movimento',
    ],
    tip: 'Faca pequenos ajustes e ouca o resultado.',
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
          <button className="tutorial-close-btn" onClick={onClose} aria-label="Fechar tutorial">
            x
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
              <span className="tutorial-tip-icon">Dica</span>
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
            &lt;- Anterior
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
            aria-label="Proxima etapa"
          >
            Proxima -&gt;
          </button>
        </div>
      </div>
    </div>
  );
}
