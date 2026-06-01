export function FrontPage({ onNavigate, onLearn }: { onNavigate: (view: 'synth' | 'tutorial') => void; onLearn?: () => void }) {
  return (
    <div className="front-page">
      <div className="front-page__container">
        <div className="front-page__header">
          <h1 className="front-page__title">minisynth32</h1>
          <p className="front-page__subtitle">1 OSC · ADSR compartilhado · Filtro</p>
        </div>

        <div className="front-page__description">
          <p>Bem-vindo ao minisynth32, um sintetizador digital simplificado para explorar sintese sonora.</p>
        </div>

        <div className="front-page__buttons">
          <button
            className="front-page__btn front-page__btn--learn"
            onClick={() => onLearn ? onLearn() : onNavigate('tutorial')}
          >
            <span className="front-page__btn-label">Aprender</span>
            <span className="front-page__btn-sublabel">Guia passo a passo</span>
          </button>

          <button
            className="front-page__btn front-page__btn--play"
            onClick={() => onNavigate('synth')}
          >
            <span className="front-page__btn-label">Tocar</span>
            <span className="front-page__btn-sublabel">Explorar livremente</span>
          </button>
        </div>

        <div className="front-page__footer">
          <p className="front-page__version">v1.0</p>
        </div>
      </div>
    </div>
  );
}
