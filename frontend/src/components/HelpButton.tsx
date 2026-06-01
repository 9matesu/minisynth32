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
        aria-label="Alternar modo de ajuda"
        title={isActive ? 'Modo de ajuda ligado' : 'Modo de ajuda desligado'}
      >
        ?
      </button>
      <span className="mfb-label">Ajuda</span>
    </div>
  );
}
