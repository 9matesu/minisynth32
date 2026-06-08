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
    name: 'Exploração Básica',
    description: 'Aprenda os controles e funcionalidades.',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>',
  },
  {
    id: 'class-2',
    name: 'Lead Senoidal',
    description: 'Crie um lead suave com onda senoidal.',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12c-5.5 0-5.5-6-11-6S5.5 12 2 12"></path><path d="M22 12c-5.5 0-5.5 6-11 6S5.5 12 2 12"></path></svg>',
  },
  {
    id: 'class-3',
    name: 'Pad Atmosférico',
    description: 'Crie um pad evolutivo e ressonante.',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>',
  },
  {
    id: 'class-4',
    name: 'Snare Percussivo',
    description: 'Crie um som de bateria com ruído.',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polyline></svg>',
  },
  {
    id: 'class-5',
    name: 'Lead Agressivo',
    description: 'Crie um lead cortante com onda square.',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>',
  },
];

interface ClassSelectorProps {
  selectedClass: string | null;
  onSelectClass: (classId: string) => void;
  completedClasses: Set<string>;
}

export function ClassSelector({ selectedClass, onSelectClass, completedClasses }: ClassSelectorProps) {
  return (
    <div className="tutorial-class-selector">
      <h3 className="tutorial-class-selector__title">Trilha de Aprendizado</h3>
      <div className="tutorial-class-selector__grid">
        {TUTORIAL_CLASSES.map((tutorialClass, index) => {
          // A class is unlocked if it's the first one, or if the previous class is completed
          const isUnlocked = index === 0 || completedClasses.has(TUTORIAL_CLASSES[index - 1].id);
          const isCompleted = completedClasses.has(tutorialClass.id);
          const isActive = selectedClass === tutorialClass.id;
          
          let stateClass = '';
          if (isActive) stateClass = 'tutorial-class-btn--active';
          else if (!isUnlocked) stateClass = 'tutorial-class-btn--locked';
          else if (isCompleted) stateClass = 'tutorial-class-btn--completed';

          return (
            <button
              key={tutorialClass.id}
              className={`tutorial-class-btn ${stateClass}`}
              onClick={() => isUnlocked && onSelectClass(tutorialClass.id)}
              disabled={!isUnlocked}
              aria-disabled={!isUnlocked}
            >
              <span className="tutorial-class-btn__icon" dangerouslySetInnerHTML={{ __html: tutorialClass.icon }} />
              <div className="tutorial-class-btn__content">
                <span className="tutorial-class-btn__name">
                  {tutorialClass.name}
                  {isCompleted && <span className="tutorial-class-btn__check">✓</span>}
                  {!isUnlocked && <span className="tutorial-class-btn__lock">🔒</span>}
                </span>
                <span className="tutorial-class-btn__description">{tutorialClass.description}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
