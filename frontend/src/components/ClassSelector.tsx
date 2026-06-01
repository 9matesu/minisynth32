import { useState } from 'react';

export interface TutorialClass {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const TUTORIAL_CLASSES: TutorialClass[] = [
  {
    id: 'class-1',
    name: 'Exploração',
    description: 'Aprenda os knobs e funcionalidades básicas',
    icon: '🎛️',
  },
  {
    id: 'class-2',
    name: 'Sine Lead',
    description: 'Crie um lead suave com onda senoidal',
    icon: '〰️',
  },
  {
    id: 'class-3',
    name: 'Pad',
    description: 'Crie um pad atmosférico e ressonante',
    icon: '〰️',
  },
  {
    id: 'class-4',
    name: 'Snare',
    description: 'Crie um som de snare com ruído',
    icon: '⚡',
  },
  {
    id: 'class-5',
    name: 'Hard Lead',
    description: 'Crie um lead agressivo com square wave',
    icon: '▭',
  },
];

interface ClassSelectorProps {
  selectedClass: string | null;
  onSelectClass: (classId: string) => void;
}

export function ClassSelector({ selectedClass, onSelectClass }: ClassSelectorProps) {
  return (
    <div className="tutorial-class-selector">
      <h3 className="tutorial-class-selector__title">Escolha uma Classe</h3>
      <div className="tutorial-class-selector__grid">
        {TUTORIAL_CLASSES.map((tutorialClass) => (
          <button
            key={tutorialClass.id}
            className={`tutorial-class-btn ${selectedClass === tutorialClass.id ? 'tutorial-class-btn--active' : ''}`}
            onClick={() => onSelectClass(tutorialClass.id)}
          >
            <span className="tutorial-class-btn__icon">{tutorialClass.icon}</span>
            <span className="tutorial-class-btn__name">{tutorialClass.name}</span>
            <span className="tutorial-class-btn__description">{tutorialClass.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
