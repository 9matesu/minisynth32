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

export function Knob({ label, value, onChange, formatValue, hideValue, step }: KnobProps) {
  const [localValue, setLocalValue] = useState(value);
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

  // Minimalist SVG Arc approach
  const radius = 22;
  const strokeWidth = 2.5;
  const center = 28;
  const circumference = 2 * Math.PI * radius;
  // 280 degree arc
  const arcLength = circumference * (280 / 360);
  const dashoffset = arcLength - (localValue / 100) * arcLength;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className="relative flex items-center justify-center cursor-ns-resize outline-none group"
        role="slider"
        tabIndex={0}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={localValue}
        onKeyDown={handleKeyDown}
        onPointerDown={handleDrag}
      >
        <svg width="56" height="56" className="transform rotate-[130deg]">
          {/* Background arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            className="stroke-border"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />
          {/* Foreground arc (active value) */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            className="stroke-text transition-[stroke-dashoffset] duration-75 ease-out"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={dashoffset}
            strokeLinecap="round"
          />
        </svg>
        {/* Subtle hover effect dot */}
        <div className="absolute inset-0 m-auto w-1 h-1 bg-text/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {!hideValue && (
        <div className="font-mono text-[10px] text-text -mt-3 bg-panel px-1">
          {formatValue ? formatValue(localValue) : `${localValue}%`}
        </div>
      )}

      {label && <span className="text-[9px] font-bold text-textDim uppercase tracking-widest">{label}</span>}
    </div>
  );
}
