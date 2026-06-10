import { useEffect, useState } from 'react';
import { X, Lightbulb, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';


export type TutorialStep = {
  id: string;
  title: string;
  description: string;
  targetControl: string;
  details: string[];
  tip: string;
};

const CLASS_TUTORIALS: Record<string, TutorialStep[]> = {
  'class-1': [
    {
      id: 'wave-select',
      title: 'Escolher Forma de Onda',
      description: 'Clique no botão de seleção de onda para mudar entre Square, Sine, Sawtooth ou Noise.',
      targetControl: 'wave-select',
      details: [
        'Square: Som brilhante e percussivo',
        'Sine: Som puro e macio',
        'Saw: Som rico em harmônicos',
        'Noise: Som ruidoso',
      ],
      tip: 'Comece com Sine para entender harmônicos básicos.',
    },
    {
      id: 'tune',
      title: 'Ajustar Frequência (Tune)',
      description: 'Use o knob "Tune" para alterar a frequência do oscillador.',
      targetControl: 'knob-tune',
      details: [
        'Valores baixos (0-30): Tons graves',
        'Valores médios (40-60): Faixa média',
        'Valores altos (70-100): Tons agudos',
      ],
      tip: 'Experimente valores entre 30-80 para sons musicais.',
    },
    {
      id: 'level',
      title: 'Controlar Volume (Level)',
      description: 'Ajuste o knob "Level" para aumentar ou diminuir o volume de saída.',
      targetControl: 'knob-level',
      details: [
        'Evite distorção em valores muito altos',
        'Mantenha dinâmica musical',
        'Importante para mixagem com múltiplas fontes',
      ],
      tip: 'Mantenha entre 50-90 para melhor dinâmica.',
    },
    {
      id: 'attack',
      title: 'ADSR - Attack (Ataque)',
      description: 'Ajuste o "Attack" para controlar quanto tempo leva para o som atingir o volume máximo.',
      targetControl: 'knob-attack',
      details: [
        'Valores baixos (0-20): Ataque percussivo',
        'Valores médios (30-50): Ataque suave',
        'Valores altos (60-100): entrada gradual',
      ],
      tip: 'Para sons percussivos, use valores baixos.',
    },
    {
      id: 'decay',
      title: 'ADSR - Decay (Decaimento)',
      description: 'Ajuste o "Decay" para o tempo de queda até o nível sustentado.',
      targetControl: 'knob-decay',
      details: [
        'Afeta a transição do pico ao nível de sustain',
        'Valores baixos: transição rápida',
        'Valores altos: transição musical',
      ],
      tip: 'Combinado com sustain, cria o "corpo" do som.',
    },
    {
      id: 'sustain',
      title: 'ADSR - Sustain (Sustentação)',
      description: 'Ajuste o "Sustain" para o nível mantido enquanto a nota está ativa.',
      targetControl: 'knob-sustain',
      details: [
        'Valores altos: som continua forte',
        'Valores baixos: som evanescente (staccato)',
        'Afeta como o som "respira"',
      ],
      tip: 'Para pads, use sustain alto.',
    },
    {
      id: 'release',
      title: 'ADSR - Release (Liberação)',
      description: 'Ajuste o "Release" para o tempo de desvanecimento após soltar a nota.',
      targetControl: 'knob-release',
      details: [
        'Valores baixos: som seco e cortante',
        'Valores altos: cauda sonora longa',
        'Cria sensação de espaço e reverb',
      ],
      tip: 'Aumente para sons mais naturais.',
    },
    {
      id: 'filter-toggle',
      title: 'Ativar o Filtro',
      description: 'Clique no botão do filtro para ativar o controle de timbre.',
      targetControl: 'filter-toggle',
      details: [
        'Filtros removem ou atenuam frequências altas',
        'Essencial para síntese subtrativa',
        'Cria movimento e interesse tímbrico',
      ],
      tip: 'Ative o filtro para controle tímbrico avançado.',
    },
    {
      id: 'cutoff',
      title: 'Cutoff - Frequência de Corte',
      description: 'Ajuste o knob "Cutoff" para definir onde o filtro começa a atuar.',
      targetControl: 'knob-cutoff',
      details: [
        'Valores baixos: som escuro',
        'Valores altos: som brilhante',
        'Varie para criar movimento dinâmico',
      ],
      tip: 'Varie cutoff para criar movimento.',
    },
    {
      id: 'resonance',
      title: 'Resonance - Ênfase do Filtro',
      description: 'Ajuste o "Resonance" para criar ênfase na frequência de corte.',
      targetControl: 'knob-resonance',
      details: [
        'Valores baixos: filtro suave',
        'Valores altos: pico pronunciado',
        'Cria efeito "wah-wah"',
      ],
      tip: 'Use com cuidado - valores altos criam efeitos dramáticos.',
    },
    {
      id: 'envelope',
      title: 'Envelope do Filtro',
      description: 'Ajuste o knob "Envelope" para modular o cutoff com o ADSR.',
      targetControl: 'knob-envelope',
      details: [
        'Valores positivos: cutoff sobe com a nota',
        'Valores negativos: cutoff desce',
        'Cria efeito "sweep" característico',
      ],
      tip: 'Experimente valores entre 40-80.',
    },
    {
      id: 'filter-slope',
      title: 'Slope do Filtro',
      description: 'Clique no botão "Slope" para alternar entre 12dB e 24dB.',
      targetControl: 'filter-slope',
      details: [
        '12 dB: Filtro suave e sutil',
        '24 dB: Filtro mais agressivo',
        'Maior inclinação = maior contraste tímbrico',
      ],
      tip: 'Use 24 dB para efeitos dramáticos.',
    },
  ],
  'class-2': [
    {
      id: 'sine-wave',
      title: 'Selecione Sine Wave',
      description: 'Para um lead suave, comece selecionando a onda Sine.',
      targetControl: 'wave-select',
      details: [
        'Sine wave é perfeita para leads melódicos',
        'Produz um som puro e suave',
        'Excelente para expressividade musical',
      ],
      tip: 'Clique no botão Wave Select até chegar em Sine.',
    },
    {
      id: 'sine-tune',
      title: 'Ajuste a Frequência',
      description: 'Configure o Tune para uma faixa média, em torno de 50-70.',
      targetControl: 'knob-tune',
      details: [
        'Valores 50-70: Excelente para leads vocais',
        'Cria presença no espectro médio',
        'Permite melodias expressivas',
      ],
      tip: 'Use valores entre 55-65 para leads clássicos.',
    },
    {
      id: 'sine-attack',
      title: 'Ataque Rápido',
      description: 'Configure Attack em torno de 5-15 para respostas rápidas.',
      targetControl: 'knob-attack',
      details: [
        'Attack rápido: resposta imediata',
        'Ideal para leads expressivos',
        'Permite articulação clara',
      ],
      tip: 'Valores 8-12 criam leads agressivos.',
    },
    {
      id: 'sine-sustain',
      title: 'Sustain Forte',
      description: 'Configure Sustain alto, entre 70-90.',
      targetControl: 'knob-sustain',
      details: [
        'Sustain alto mantém a nota forte',
        'Cria continuidade no som',
        'Essencial para leads expressivos',
      ],
      tip: 'Sustain 80+ garante presença constante.',
    },
    {
      id: 'sine-decay',
      title: 'Decay Rápido',
      description: 'Configure Decay em 10-25 para transição rápida.',
      targetControl: 'knob-decay',
      details: [
        'Decay rápido: transição suave',
        'Evita sons flutuantes',
        'Mantém clareza melódica',
      ],
      tip: 'Valores 15-20 funcionam bem para leads.',
    },
    {
      id: 'sine-release',
      title: 'Release Curto',
      description: 'Configure Release entre 15-30.',
      targetControl: 'knob-release',
      details: [
        'Release curto: corte limpo',
        'Evita cauda sonora excessiva',
        'Mantém articulação clara',
      ],
      tip: 'Release 20-25 é ideal para leads.',
    },
    {
      id: 'sine-filter-toggle',
      title: 'Ative o Filtro',
      description: 'Clique para ativar o filtro de corte.',
      targetControl: 'filter-toggle',
      details: [
        'Adiciona movimento tímbrico',
        'Cria interesse harmônico',
        'Permite expressividade dinâmica',
      ],
      tip: 'Filtro ativo deixa o som mais vivo.',
    },
    {
      id: 'sine-cutoff',
      title: 'Cutoff Aberto',
      description: 'Configure Cutoff em 70-85 para brilho.',
      targetControl: 'knob-cutoff',
      details: [
        'Cutoff alto: som brilhante',
        'Revela harmônicos ricos',
        'Cria presença na faixa alta',
      ],
      tip: 'Valores 75-80 são ótimos para leads brilhantes.',
    },
    {
      id: 'sine-resonance',
      title: 'Ressonância Moderada',
      description: 'Configure Resonance em 30-50.',
      targetControl: 'knob-resonance',
      details: [
        'Ressonância moderada: destaca o cutoff',
        'Cria presença em frequências específicas',
        'Evita bicos extremos',
      ],
      tip: 'Valores 40-45 criam bom destaque.',
    },
    {
      id: 'sine-envelope',
      title: 'Envelope do Filtro',
      description: 'Configure Envelope em 20-40.',
      targetControl: 'knob-envelope',
      details: [
        'Modula o cutoff com o ADSR',
        'Cria movimento tímbrico',
        'Adiciona expressividade',
      ],
      tip: 'Valores 30-35 criam varreduras musicais.',
    },
  ],
  'class-3': [
    {
      id: 'pad-wave',
      title: 'Selecione a Onda',
      description: 'Para um pad, use Sine ou Sawtooth. Comece com Sine.',
      targetControl: 'wave-select',
      details: [
        'Sine: pad suave e etéreo',
        'Sawtooth: pad mais rico em harmônicos',
        'Escolha conforme o estilo desejado',
      ],
      tip: 'Sine cria pads mais atmosféricos.',
    },
    {
      id: 'pad-tune',
      title: 'Frequência do Pad',
      description: 'Configure Tune em 40-60 para uma faixa média-grave.',
      targetControl: 'knob-tune',
      details: [
        'Faixa grave: cria fundação sonora',
        'Faixa média: equilíbrio e presença',
        'Pads funcionam bem em qualquer faixa',
      ],
      tip: 'Valores 45-55 são ideais para pads.',
    },
    {
      id: 'pad-attack',
      title: 'Ataque Longo',
      description: 'Configure Attack em 30-60 para fade-in longo.',
      targetControl: 'knob-attack',
      details: [
        'Attack longo: entrada suave e atmosférica',
        'Cria transição gradual',
        'Essencial para pads envolventes',
      ],
      tip: 'Attack 40-50 cria pads clássicos.',
    },
    {
      id: 'pad-sustain',
      title: 'Sustain Máximo',
      description: 'Configure Sustain entre 85-100.',
      targetControl: 'knob-sustain',
      details: [
        'Sustain alto: som continua forte',
        'Pads precisam de sustain máximo',
        'Cria fundação sonora estável',
      ],
      tip: 'Sustain 90+ é essencial para pads.',
    },
    {
      id: 'pad-decay',
      title: 'Decay Longo',
      description: 'Configure Decay em 40-70.',
      targetControl: 'knob-decay',
      details: [
        'Decay longo: transição musical',
        'Evita queda abrupta',
        'Cria naturalidade no som',
      ],
      tip: 'Valores 50-60 funcionam bem.',
    },
    {
      id: 'pad-release',
      title: 'Release Longo',
      description: 'Configure Release em 50-80 para cauda sonora.',
      targetControl: 'knob-release',
      details: [
        'Release longo: som desvanece gradualmente',
        'Cria efeito reverberado',
        'Essencial para pads atmósféricos',
      ],
      tip: 'Release 60-70 é clássico para pads.',
    },
    {
      id: 'pad-filter-toggle',
      title: 'Ative o Filtro',
      description: 'Clique para ativar filtro de movimento tímbrico.',
      targetControl: 'filter-toggle',
      details: [
        'Filtro adiciona movimento',
        'Cria dinâmica nos pads',
        'Evita som estático',
      ],
      tip: 'Filtro ativo melhora muito pads.',
    },
    {
      id: 'pad-cutoff',
      title: 'Cutoff Moderado',
      description: 'Configure Cutoff em 50-70.',
      targetControl: 'knob-cutoff',
      details: [
        'Cutoff moderado: equilíbrio de brilho',
        'Não muito escuro, não muito brilhante',
        'Permite detalhe harmônico',
      ],
      tip: 'Valores 60-65 funcionam bem.',
    },
    {
      id: 'pad-resonance',
      title: 'Ressonância Sutil',
      description: 'Configure Resonance em 20-40.',
      targetControl: 'knob-resonance',
      details: [
        'Ressonância baixa: som liso',
        'Evita picos desconfortáveis',
        'Mantém qualidade de pad suave',
      ],
      tip: 'Valores 25-30 são ideais.',
    },
    {
      id: 'pad-envelope',
      title: 'Envelope Suave',
      description: 'Configure Envelope em 10-30.',
      targetControl: 'knob-envelope',
      details: [
        'Envelope baixo: movimento sutil',
        'Evita varreduras agressivas',
        'Mantém caráter atmosférico',
      ],
      tip: 'Valores 15-20 criam pads suaves.',
    },
  ],
  'class-4': [
    {
      id: 'snare-wave',
      title: 'Selecione Noise',
      description: 'Para um snare, use a onda Noise para textura percussiva.',
      targetControl: 'wave-select',
      details: [
        'Noise: textura percussiva essencial',
        'Cria corpo para o som de snare',
        'Imprevisível e natural',
      ],
      tip: 'Clique até selecionar Noise (4ª opção).',
    },
    {
      id: 'snare-tune',
      title: 'Frequência de Snare',
      description: 'Configure Tune em 40-60.',
      targetControl: 'knob-tune',
      details: [
        'Faixa média: snare equilibrado',
        'Valores mais altos: snare mais brilhante',
        'Valores mais baixos: snare mais gordo',
      ],
      tip: 'Valores 50-55 são clássicos.',
    },
    {
      id: 'snare-level',
      title: 'Ajuste o Volume',
      description: 'Configure Level em 70-85.',
      targetControl: 'knob-level',
      details: [
        'Snares precisam de volume forte',
        'Destaca o som na mistura',
        'Cria presença impactante',
      ],
      tip: 'Valores 75-80 funcionam bem.',
    },
    {
      id: 'snare-attack',
      title: 'Ataque Instantâneo',
      description: 'Configure Attack em 0-10.',
      targetControl: 'knob-attack',
      details: [
        'Attack muito rápido: clique percussivo',
        'Essencial para snares',
        'Cria transiente responsivo',
      ],
      tip: 'Attack 2-5 é ideal para snares.',
    },
    {
      id: 'snare-decay',
      title: 'Decay Rápido',
      description: 'Configure Decay em 20-40.',
      targetControl: 'knob-decay',
      details: [
        'Decay rápido: som sucinto',
        'Cria corpo percussivo',
        'Evita cauda excessiva',
      ],
      tip: 'Valores 25-35 funcionam bem.',
    },
    {
      id: 'snare-sustain',
      title: 'Sustain Baixo',
      description: 'Configure Sustain em 5-25.',
      targetControl: 'knob-sustain',
      details: [
        'Sustain baixo: som seco',
        'Snares não precisam de sustain alto',
        'Mantém caráter percussivo',
      ],
      tip: 'Valores 10-20 funcionam bem.',
    },
    {
      id: 'snare-release',
      title: 'Release Rápido',
      description: 'Configure Release em 10-25.',
      targetControl: 'knob-release',
      details: [
        'Release rápido: corte percussivo',
        'Evita cauda sonora',
        'Mantém definição do snare',
      ],
      tip: 'Release 15-20 é clássico.',
    },
    {
      id: 'snare-filter-toggle',
      title: 'Ative o Filtro',
      description: 'Clique para ativar filtro de timbre.',
      targetControl: 'filter-toggle',
      details: [
        'Filtro controla brilho do snare',
        'Cria movimento tímbrico',
        'Essencial para snares polidos',
      ],
      tip: 'Filtro ativo melhora snares.',
    },
    {
      id: 'snare-cutoff',
      title: 'Cutoff Alto',
      description: 'Configure Cutoff em 65-80.',
      targetControl: 'knob-cutoff',
      details: [
        'Cutoff alto: snare brilhante',
        'Revela detalhe do ruído',
        'Cria presença na faixa alta',
      ],
      tip: 'Valores 70-75 são ideais.',
    },
    {
      id: 'snare-resonance',
      title: 'Ressonância Baixa',
      description: 'Configure Resonance em 10-25.',
      targetControl: 'knob-resonance',
      details: [
        'Ressonância baixa: som limpo',
        'Evita ressoâncias indesejadas',
        'Mantém clareza percussiva',
      ],
      tip: 'Valores 15-20 funcionam bem.',
    },
  ],
  'class-5': [
    {
      id: 'lead-wave',
      title: 'Selecione Square Wave',
      description: 'Para um hard lead, comece com Square Wave.',
      targetControl: 'wave-select',
      details: [
        'Square: agressivo e brilhante',
        'Conteúdo harmônico rico',
        'Perfeito para leads duros',
      ],
      tip: 'Clique para selecionar Square (1ª opção).',
    },
    {
      id: 'lead-tune',
      title: 'Frequência do Lead',
      description: 'Configure Tune em 60-80 para uma faixa alta.',
      targetControl: 'knob-tune',
      details: [
        'Faixa alta: lead agudo e cortante',
        'Valores 70+: presença acima de tudo',
        'Cria impacto na mistura',
      ],
      tip: 'Valores 70-75 são agressivos.',
    },
    {
      id: 'lead-level',
      title: 'Volume do Lead',
      description: 'Configure Level em 80-95.',
      targetControl: 'knob-level',
      details: [
        'Hard leads precisam de volume forte',
        'Destaca o som na mistura',
        'Cria presença dominante',
      ],
      tip: 'Valores 85-90 funcionam bem.',
    },
    {
      id: 'lead-attack',
      title: 'Ataque Rápido',
      description: 'Configure Attack em 3-15.',
      targetControl: 'knob-attack',
      details: [
        'Attack rápido: resposta imediata',
        'Cria agressividade',
        'Permite articulação clara',
      ],
      tip: 'Valores 5-10 são ideais.',
    },
    {
      id: 'lead-decay',
      title: 'Decay Curto',
      description: 'Configure Decay em 10-30.',
      targetControl: 'knob-decay',
      details: [
        'Decay rápido: transição agressiva',
        'Cria movimento percussivo',
        'Mantém clareza melódica',
      ],
      tip: 'Valores 15-25 funcionam bem.',
    },
    {
      id: 'lead-sustain',
      title: 'Sustain Alto',
      description: 'Configure Sustain em 75-95.',
      targetControl: 'knob-sustain',
      details: [
        'Sustain alto: nota mantém força',
        'Essencial para leads expressivos',
        'Cria presença constante',
      ],
      tip: 'Valores 85+ garantem presença.',
    },
    {
      id: 'lead-release',
      title: 'Release Rápido',
      description: 'Configure Release em 10-30.',
      targetControl: 'knob-release',
      details: [
        'Release rápido: corte limpo',
        'Evita cauda sonora',
        'Mantém agressividade',
      ],
      tip: 'Valores 15-25 funcionam bem.',
    },
    {
      id: 'lead-filter-toggle',
      title: 'Ative o Filtro',
      description: 'Clique para ativar filtro de movimento.',
      targetControl: 'filter-toggle',
      details: [
        'Filtro adiciona movimento tímbrico',
        'Cria interesse dinâmico',
        'Essencial para hard leads',
      ],
      tip: 'Filtro ativo melhora muito leads.',
    },
    {
      id: 'lead-cutoff',
      title: 'Cutoff Alto',
      description: 'Configure Cutoff em 75-90.',
      targetControl: 'knob-cutoff',
      details: [
        'Cutoff alto: som brilhante',
        'Revela harmônicos ricos do square',
        'Cria agressividade sonora',
      ],
      tip: 'Valores 80-85 são ideais.',
    },
    {
      id: 'lead-resonance',
      title: 'Ressonância Alta',
      description: 'Configure Resonance em 50-70.',
      targetControl: 'knob-resonance',
      details: [
        'Ressonância alta: destaque pronunciado',
        'Cria pico característico',
        'Adiciona caráter agressivo',
      ],
      tip: 'Valores 55-65 criam sons clássicos.',
    },
    {
      id: 'lead-envelope',
      title: 'Envelope Dinâmico',
      description: 'Configure Envelope em 40-60.',
      targetControl: 'knob-envelope',
      details: [
        'Envelope forte: varredura agressiva',
        'Cria movimento dinâmico',
        'Adiciona expressividade extrema',
      ],
      tip: 'Valores 50-55 criam leads expressivos.',
    },
    {
      id: 'lead-slope',
      title: 'Slope Agressivo',
      description: 'Configure para 24dB.',
      targetControl: 'filter-slope',
      details: [
        '24dB: filtro mais agressivo',
        'Cria varreduras dramáticas',
        'Essencial para hard leads',
      ],
      tip: 'Use sempre 24dB para leads duros.',
    },
  ],
};

interface IntegratedTutorialProps {
  onClose: () => void;
  selectedClass: string | null;
  completedTasks: Set<string>;
  onTaskComplete: (taskId: string) => void;
  onHighlightChange?: (controlId: string | null) => void;
  onClassComplete?: (classId: string) => void;
}

export function IntegratedTutorial({
  onClose,
  selectedClass,
  completedTasks,
  onTaskComplete,
  onHighlightChange,
  onClassComplete,
}: IntegratedTutorialProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const tutorials = selectedClass ? CLASS_TUTORIALS[selectedClass] : [];
  const currentStep = tutorials[currentStepIndex];
  const totalSteps = tutorials.length;
  const isCompleted = currentStep ? completedTasks.has(currentStep.id) : false;

  // Notify App about the current highlighted control
  useEffect(() => {
    if (currentStep && onHighlightChange) {
      onHighlightChange(currentStep.targetControl);
    }
  }, [currentStepIndex, currentStep, onHighlightChange]);

  // Auto-advance to next step when current step is completed
  useEffect(() => {
    if (isCompleted) {
      if (currentStepIndex < totalSteps - 1) {
        const timer = setTimeout(() => {
          setCurrentStepIndex(currentStepIndex + 1);
        }, 500);
        return () => clearTimeout(timer);
      } else if (onClassComplete && selectedClass) {
        // Last step completed, wait a bit then complete class
        const timer = setTimeout(() => {
          onClassComplete(selectedClass);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [isCompleted, currentStepIndex, totalSteps, onClassComplete, selectedClass]);

  if (!selectedClass || !currentStep) {
    return null;
  }

  const nextStep = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const goToStep = (index: number) => {
    setCurrentStepIndex(index);
  };

  return (
    <div className="flex flex-col h-full bg-background border border-border rounded-xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center justify-between p-4 border-b border-border bg-panel">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-1 hover:bg-border/50 rounded-md text-textDim transition-colors" aria-label="Fechar tutorial">
            <X size={16} />
          </button>
          <h3 className="font-bold text-[11px] uppercase tracking-widest text-text flex items-center gap-2">
            {currentStep.title}
            {isCompleted && <CheckCircle2 size={14} className="text-primary" />}
          </h3>
        </div>
        <span className="text-[9px] font-mono text-textDim font-bold bg-background px-2 py-0.5 rounded border border-border">
          {currentStepIndex + 1}/{totalSteps}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">
        <p className="text-sm text-text font-medium leading-relaxed">{currentStep.description}</p>

        <ul className="flex flex-col gap-2">
          {currentStep.details.map((detail, index) => (
            <li key={index} className="flex items-start gap-2 text-xs text-textDim">
              <span className="w-1 h-1 rounded-full bg-primary mt-1.5 flex-shrink-0" />
              {detail}
            </li>
          ))}
        </ul>

        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex gap-3 mt-auto">
          <Lightbulb size={18} className="text-primary flex-shrink-0" />
          <p className="text-xs text-primary font-medium">{currentStep.tip}</p>
        </div>
      </div>

      <div className="p-4 bg-panel border-t border-border flex flex-col gap-4">
        <div className="h-1 w-full bg-background rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={prevStep}
            disabled={currentStepIndex === 0}
            className="p-2 text-textDim hover:text-text disabled:opacity-30 transition-colors"
          >
            <ArrowLeft size={16} />
          </button>

          <div className="flex gap-1.5">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToStep(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentStepIndex
                    ? 'bg-primary scale-125'
                    : completedTasks.has(tutorials[index].id)
                    ? 'bg-primary/40'
                    : 'bg-border'
                }`}
                aria-label={`Ir para etapa ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={nextStep}
            disabled={currentStepIndex === totalSteps - 1}
            className="p-2 text-textDim hover:text-text disabled:opacity-30 transition-colors"
          >
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
