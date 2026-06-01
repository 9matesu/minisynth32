type HelpButtonProps = {
  isActive: boolean;
  onClick: () => void;
};

export function HelpButton({ isActive, onClick }: HelpButtonProps) {
  return (
    <div className="help-btn-block">
      <button
        type="button"
        className={`mfb-btn help-btn ${isActive ? 'help-btn--active' : ''}`}
        onClick={onClick}
        aria-label="Toggle help mode"
        title={isActive ? 'Help mode ON' : 'Help mode OFF'}
      >
        ?
      </button>
      <span className="mfb-label">{isActive ? 'Help' : 'Help'}</span>
    </div>
  );
}
