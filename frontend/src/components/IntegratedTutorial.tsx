import { useEffect, useState } from 'react';
import { X, Lightbulb, ArrowLeft, ArrowRight, CheckCircle2, Play, Square } from 'lucide-react';
import type { Patch } from '../App';
import { type NoteEvent, JUMP_MELODY, TAKE_ON_ME_MELODY } from '../lib/sequencer';

export type TutorialStep = {
  id: string;
  title: string;
  description: string;
  targetControl: string;
  details: string[];
  tip: string;
  validate?: (patch: any) => boolean;
};

export type TutorialClassDef = {
  initPatch: Partial<Patch>;
  steps: TutorialStep[];
  melody?: { timeMs: number, note: string, type: 'on' | 'off' }[];
};

const CLASS_TUTORIALS: Record<string, TutorialClassDef> = {
  'class-1': { // Reese Bass
    initPatch: { wave: 1, tune: 50, detune: 0, cutoff: 100 },
    steps: [
      {
        id: 'reese-wave',
        title: 'Reese Bass: Forma de Onda',
        description: 'O som Reese utiliza múltiplas ondas Sawtooth desafinadas.',
        targetControl: 'wave-select',
        details: ['A onda Sawtooth (Dente de Serra) gera harmônicos pares e ímpares.'],
        tip: 'Mude para Saw.',
        validate: (p) => p?.wave === 2
      },
      {
        id: 'reese-tune',
        title: 'Reese Bass: Oitava',
        description: 'Ajuste a oitava do oscilador para a região de sub-graves (-1 ou -2).',
        targetControl: 'knob-tune',
        details: ['Frequências baixas são a base do bassline.'],
        tip: 'Mude a oitava para valores de -1 ou -2.',
        validate: (p) => p?.tune <= 25 // 25 = -1, 0 = -2
      },
      {
        id: 'reese-detune',
        title: 'Reese Bass: Detune',
        description: 'Aplique detune (desafinação) entre 50% e 80% para criar o efeito estéreo de "phasing".',
        targetControl: 'knob-detune',
        details: ['O detune alarga a imagem estéreo do som.'],
        tip: 'Ajuste Detune entre 50% e 80%.',
        validate: (p) => p?.detune >= 50 && p?.detune <= 80
      },
      {
        id: 'reese-cutoff',
        title: 'Reese Bass: Filtro Lowpass',
        description: 'Reduza a frequência de corte (Cutoff) do Filtro para menos de 45%.',
        targetControl: 'knob-cutoff',
        details: ['Filtra os harmônicos agudos, retendo as frequências graves.'],
        tip: 'Abaixe Cutoff para <45%.',
        validate: (p) => p?.cutoff <= 45
      }
    ]
  },
  'class-2': { // Lush Pad
    initPatch: { voices: 1, attack: 10, release: 20 },
    steps: [
      {
        id: 'pad-voices',
        title: 'Lush Pad: Polifonia',
        description: 'Aumente o número de vozes (Voices) para 4, permitindo a execução de acordes (tétrades).',
        targetControl: 'wave-select',
        details: ['Sintetizadores polifônicos podem reproduzir múltiplas notas simultaneamente.'],
        tip: 'Selecione 4 Voices.',
        validate: (p) => p?.voices === 4
      },
      {
        id: 'pad-attack',
        title: 'Lush Pad: Attack',
        description: 'Aumente o Attack do Envelope para mais de 60%.',
        targetControl: 'knob-attack',
        details: ['Um Attack longo faz o volume aumentar gradualmente.'],
        tip: 'Attack > 60%.',
        validate: (p) => p?.attack >= 60
      },
      {
        id: 'pad-release',
        title: 'Lush Pad: Release',
        description: 'Aumente o Release para mais de 70%.',
        targetControl: 'knob-release',
        details: ['Um Release alto prolonga o som após a tecla ser solta.'],
        tip: 'Release > 70%.',
        validate: (p) => p?.release >= 70
      }
    ]
  },
  'class-3': { // Rave Lead
    initPatch: { wave: 1, resonance: 0, envelope: 0 },
    steps: [
      {
        id: 'rave-wave',
        title: 'Rave Lead: Square Wave',
        description: 'Selecione a forma de onda Square (Quadrada).',
        targetControl: 'wave-select',
        details: ['A onda Square contém apenas harmônicos ímpares.'],
        tip: 'Onda Square.',
        validate: (p) => p?.wave === 0
      },
      {
        id: 'rave-resonance',
        title: 'Rave Lead: Ressonância',
        description: 'Aumente a Ressonância (Res.) do filtro para mais de 75%.',
        targetControl: 'knob-resonance',
        details: ['A ressonância cria um pico de ganho na frequência de corte.'],
        tip: 'Res. > 75%',
        validate: (p) => p?.resonance >= 75
      },
      {
        id: 'rave-envelope',
        title: 'Rave Lead: Envelope do Filtro',
        description: 'Aumente a modulação do Envelope (Env.) para mais de 60%.',
        targetControl: 'knob-envelope',
        details: ['Aplica o formato do ADSR à frequência de corte do filtro.'],
        tip: 'Env > 60%',
        validate: (p) => p?.envelope >= 60
      }
    ]
  },
  'class-4': { // Jump Brass
    initPatch: { wave: 0, tune: 50, detune: 0, cutoff: 50, resonance: 0, attack: 0, decay: 50, sustain: 50, release: 20 },
    melody: JUMP_MELODY,
    steps: [
      {
        id: 'jump-wave',
        title: 'Jump Brass: Sawtooth',
        description: 'O timbre da música "Jump" (Van Halen) utiliza a onda Sawtooth.',
        targetControl: 'wave-select',
        details: ['Sawtooth é comum na síntese de timbres de metais (brass).'],
        tip: 'Selecione a onda Saw.',
        validate: (p) => p?.wave === 2
      },
      {
        id: 'jump-detune',
        title: 'Jump Brass: Detune',
        description: 'Aumente o Detune para pelo menos 40%.',
        targetControl: 'knob-detune',
        details: ['Simula a desafinação natural entre múltiplos instrumentos.'],
        tip: 'Detune > 40%',
        validate: (p) => p?.detune >= 40
      },
      {
        id: 'jump-cutoff',
        title: 'Jump Brass: Filtro Aberto',
        description: 'Eleve o Cutoff para mais de 80%.',
        targetControl: 'knob-cutoff',
        details: ['Filtros abertos permitem a passagem das altas frequências.'],
        tip: 'Cutoff > 80%',
        validate: (p) => p?.cutoff >= 80
      }
    ]
  },
  'class-5': { // Take On Me Lead
    initPatch: { wave: 2, voices: 1, attack: 50, decay: 50, sustain: 50, release: 50, cutoff: 100 },
    melody: TAKE_ON_ME_MELODY,
    steps: [
      {
        id: 'takeonme-wave',
        title: 'Synth Pop: Square Wave',
        description: 'A melodia principal de "Take On Me" (A-ha) é sintetizada com uma onda Square.',
        targetControl: 'wave-select',
        details: ['A onda Square apresenta um timbre característico e anasalado.'],
        tip: 'Selecione a onda Square.',
        validate: (p) => p?.wave === 0
      },
      {
        id: 'takeonme-env',
        title: 'Synth Pop: Pluck',
        description: 'Reduza o Sustain para 0% e o Decay para menos de 40%.',
        targetControl: 'knob-sustain',
        details: ['Envelopes sem sustain formam o comportamento de instrumentos percussivos (Pluck).'],
        tip: 'Sustain = 0% e Decay < 40%',
        validate: (p) => p?.sustain === 0 && p?.decay <= 40
      }
    ]
  }
};

interface IntegratedTutorialProps {
  onClose: () => void;
  selectedClass: string | null;
  completedTasks: Set<string>;
  onTaskComplete: (taskId: string) => void;
  onHighlightChange?: (controlId: string | null) => void;
  onClassComplete?: (classId: string) => void;
  onInitPatch?: (initPatch: Partial<Patch>) => void;
  onPlayMelody?: (melody: NoteEvent[]) => (() => void);
  patch?: any; // Contains the current synth parameters
}

export function IntegratedTutorial({
  onClose,
  selectedClass,
  completedTasks,
  onTaskComplete,
  onHighlightChange,
  onClassComplete,
  onInitPatch,
  onPlayMelody,
  patch,
}: IntegratedTutorialProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [stopMelody, setStopMelody] = useState<(() => void) | null>(null);

  const tutorialDef = selectedClass ? CLASS_TUTORIALS[selectedClass] : null;
  const tutorials = tutorialDef?.steps || [];
  const currentStep = tutorials[currentStepIndex];
  const totalSteps = tutorials.length;
  const isCompleted = currentStep ? completedTasks.has(currentStep.id) : false;

  // Reseta o index quando a classe muda e envia o patch inicial de inicialização para não pular as tarefas prontas
  useEffect(() => {
    setCurrentStepIndex(0);
    if (onInitPatch) {
      onInitPatch(tutorialDef?.initPatch || {});
    }
  }, [selectedClass]); // eslint-disable-line react-hooks/exhaustive-deps

  // Notify App about the current highlighted control
  useEffect(() => {
    if (currentStep && onHighlightChange) {
      onHighlightChange(currentStep.targetControl);
    }
  }, [currentStepIndex, currentStep, onHighlightChange]);

  // Validation Check: Auto-complete task if user moves knob to correct position
  useEffect(() => {
    if (currentStep && !isCompleted && patch && currentStep.validate) {
      if (currentStep.validate(patch)) {
        onTaskComplete(currentStep.id);
      }
    }
  }, [patch, currentStep, isCompleted, onTaskComplete]);

  // User advances manually using button
  const advanceTutorial = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else if (onClassComplete && selectedClass) {
      onClassComplete(selectedClass);
    }
  };

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

  const handlePlayToggle = () => {
    if (isPlaying && stopMelody) {
      stopMelody();
      setIsPlaying(false);
      setStopMelody(null);
    } else if (onPlayMelody && tutorialDef?.melody) {
      setIsPlaying(true);
      const stopFn = onPlayMelody(tutorialDef.melody);
      // Auto stop simulation for UI state (rough estimate)
      const maxTime = Math.max(...tutorialDef.melody.map(m => m.timeMs));
      setTimeout(() => setIsPlaying(false), maxTime + 500);
      setStopMelody(() => stopFn);
    }
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

        <div className={`border rounded-lg p-4 flex gap-3 mt-auto transition-colors duration-500 ${isCompleted ? 'bg-green-500/10 border-green-500/30' : 'bg-primary/5 border-primary/20'}`}>
          <div className="flex flex-col flex-1 gap-2">
            <div className="flex gap-3">
              <Lightbulb size={18} className={`flex-shrink-0 ${isCompleted ? 'text-green-500' : 'text-primary'}`} />
              <p className={`text-xs font-medium ${isCompleted ? 'text-green-500' : 'text-primary'}`}>
                {isCompleted ? 'Excelente! Tarefa concluída.' : currentStep.tip}
              </p>
            </div>
            {isCompleted && currentStepIndex === totalSteps - 1 && tutorialDef?.melody && (
              <button 
                onClick={handlePlayToggle}
                className={`mt-2 self-start px-4 py-2 ${isPlaying ? 'bg-red-600 hover:bg-red-700' : 'bg-primary hover:bg-primary/90'} text-white text-xs font-bold rounded-md shadow-sm transition-colors uppercase tracking-widest flex items-center gap-2`}
              >
                {isPlaying ? <><Square size={14} /> Parar</> : <><Play size={14} /> Ouvir Melodia</>}
              </button>
            )}
            
            {isCompleted && (
              <button 
                onClick={advanceTutorial}
                className="mt-2 self-start px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-md shadow-sm transition-colors uppercase tracking-widest flex items-center gap-2"
              >
                {currentStepIndex < totalSteps - 1 ? 'Próxima Etapa' : 'Concluir Aula'} <ArrowRight size={14} />
              </button>
            )}
          </div>
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
