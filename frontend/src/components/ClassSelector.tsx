import { useState } from 'react';
import { Compass, Zap, Cloud, Drum, Flame, Lock, CheckCircle2 } from 'lucide-react';

export interface TutorialClass {
  id: string;
  name: string;
  description: string;
  icon: any;
}

export const TUTORIAL_CLASSES: TutorialClass[] = [
  {
    id: 'class-1',
    name: 'Exploração Básica',
    description: 'Aprenda os controles e funcionalidades.',
    icon: Compass,
  },
  {
    id: 'class-2',
    name: 'Lead Senoidal',
    description: 'Crie um lead suave com onda senoidal.',
    icon: Zap,
  },
  {
    id: 'class-3',
    name: 'Pad Atmosférico',
    description: 'Crie um pad evolutivo e ressonante.',
    icon: Cloud,
  },
  {
    id: 'class-4',
    name: 'Snare Percussivo',
    description: 'Crie um som de bateria com ruído.',
    icon: Drum,
  },
  {
    id: 'class-5',
    name: 'Lead Agressivo',
    description: 'Crie um lead cortante com onda square.',
    icon: Flame,
  },
];

interface ClassSelectorProps {
  selectedClass: string | null;
  onSelectClass: (classId: string) => void;
  completedClasses: Set<string>;
}

export function ClassSelector({ selectedClass, onSelectClass, completedClasses }: ClassSelectorProps) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-[10px] uppercase tracking-[0.1em] font-bold text-textDim mb-1">Trilha de Aprendizado</h3>
      <div className="flex flex-col gap-3">
        {TUTORIAL_CLASSES.map((tutorialClass, index) => {
          const isUnlocked = index === 0 || completedClasses.has(TUTORIAL_CLASSES[index - 1].id);
          const isCompleted = completedClasses.has(tutorialClass.id);
          const isActive = selectedClass === tutorialClass.id;
          const Icon = tutorialClass.icon;
          
          let stateClass = 'border-border bg-panel text-text hover:border-text/30 hover:shadow-sm';
          if (isActive) stateClass = 'border-primary bg-primary/5 text-primary shadow-sm';
          else if (!isUnlocked) stateClass = 'border-border/50 bg-background text-textDim/50 cursor-not-allowed';
          else if (isCompleted) stateClass = 'border-primary/30 bg-panel text-text';

          return (
            <button
              key={tutorialClass.id}
              className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${stateClass}`}
              onClick={() => isUnlocked && onSelectClass(tutorialClass.id)}
              disabled={!isUnlocked}
              aria-disabled={!isUnlocked}
            >
              <div className={`p-2 rounded-lg ${isActive ? 'bg-primary/10 text-primary' : isCompleted ? 'bg-primary/10 text-primary' : !isUnlocked ? 'bg-border/20 text-textDim/30' : 'bg-background text-textDim'}`}>
                <Icon size={18} />
              </div>
              <div className="flex flex-col flex-1">
                <span className={`font-bold text-xs uppercase tracking-wide flex items-center gap-2 ${!isUnlocked && 'opacity-50'}`}>
                  {tutorialClass.name}
                  {isCompleted && <CheckCircle2 size={12} className="text-primary" />}
                  {!isUnlocked && <Lock size={12} className="text-textDim" />}
                </span>
                <span className={`text-[10px] mt-0.5 ${isActive ? 'text-primary/70' : 'text-textDim'}`}>{tutorialClass.description}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
