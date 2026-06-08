import { useEffect, useRef, useState } from 'react';

type KnobProps = {
  label: React.ReactNode;
  value: number;
  onChange: (value: number) => void;
  helpText?: string;
  helpMode?: boolean;
  formatValue?: (val: number) => string;
  hideValue?: boolean;
  step?: number;
};

export function Knob({ label, value, onChange, helpText, helpMode, formatValue, hideValue, step }: KnobProps) {
  const [localValue, setLocalValue] = useState(value);
  const [isHovering, setIsHovering] = useState(false);
  const startYRef = useRef(0);
  const startValRef = useRef(0);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const setSafeValue = (next: number) => {
    let finalValue = Math.max(0, Math.min(100, next));
    if (step) {
      finalValue = Math.round(finalValue / step) * step;
    } else {
      finalValue = Math.round(finalValue);
    }
    setLocalValue(finalValue);
    onChange(finalValue);
  };

  const handleDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    startYRef.current = e.clientY;
    startValRef.current = localValue;

    const onMove = (m: PointerEvent) => {
      const next = startValRef.current + (startYRef.current - m.clientY);
      setSafeValue(next);
    };

    const onUp = () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    };

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
      e.preventDefault();
      setSafeValue(localValue + 1);
    }

    if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
      e.preventDefault();
      setSafeValue(localValue - 1);
    }

    if (e.key === 'Home') {
      e.preventDefault();
      setSafeValue(0);
    }

    if (e.key === 'End') {
      e.preventDefault();
      setSafeValue(100);
    }
  };

  const rotation = -140 + localValue * 2.8;

  return (
    <div className="knob-container">
      <div
        className="mfb-knob-wrap"
        role="slider"
        tabIndex={0}
        aria-label={typeof label === 'string' ? label : 'Controle giratorio'}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={localValue}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        data-help-text={helpText}
        data-help-mode={helpMode}
      >
        {!hideValue && (
          <div className="mfb-knob-value">{formatValue ? formatValue(localValue) : `${localValue}%`}</div>
        )}

        <div
          className="mfb-knob"
          style={{ transform: `rotate(${rotation}deg)` }}
          onPointerDown={handleDrag}
        >
          <div className="mfb-knob-indicator"></div>
        </div>

        {helpMode && isHovering && helpText && <div className="help-balloon">{helpText}</div>}
      </div>

      {label && <span className="mfb-knob-label">{label}</span>}
    </div>
  );
}
