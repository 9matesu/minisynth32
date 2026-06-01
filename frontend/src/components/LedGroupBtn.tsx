import { useState } from 'react';

type LedGroupBtnProps = {
  leds: React.ReactNode[];
  buttonNum: string;
  activeIdx: number;
  onClick: () => void;
  customLabels?: string;
  helpText?: string;
  helpMode?: boolean;
};

export function LedGroupBtn({
  leds,
  buttonNum,
  activeIdx,
  onClick,
  customLabels,
  helpText,
  helpMode,
}: LedGroupBtnProps) {
  const [isHovering, setIsHovering] = useState(false);
  return (
    <div className="led-group-btn">
      {customLabels && <span className="mfb-label-small">{customLabels}</span>}

      <div className="led-group-btn__options">
        {leds.map((led, i) => (
          <div key={i} className="led-group-btn__item">
            <div className={`mfb-led ${activeIdx === i ? 'active' : ''}`}></div>
            <div className="led-group-btn__icon">{led}</div>
          </div>
        ))}
      </div>

      <div
        style={{ position: 'relative' }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <button
          type="button"
          className="mfb-btn"
          onClick={onClick}
          aria-label={`Wave selector ${buttonNum}`}
          data-help-text={helpText}
          data-help-mode={helpMode}
        />
        {helpMode && isHovering && helpText && <div className="help-balloon help-balloon--small">{helpText}</div>}
      </div>
    </div>
  );
}