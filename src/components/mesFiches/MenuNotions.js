import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';

/** Le bouton « menu » à trois traits, posé à gauche d'« Agrandir ». */
export function BoutonNotions({ onClick }) {
  return (
    <button type="button" className="mf-notions-coin" aria-label="Les notions du cours" aria-haspopup="dialog" onClick={onClick}>
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none"
        stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
        <path d="M4 7h16M4 12h16M4 17h16" />
      </svg>
    </button>
  );
}

/**
 * LES NOTIONS SUR TÉLÉPHONE — Camara, le 16/10/2026 : « vu qu'on ne peut pas
 * afficher le menu des notions directement, un petit bouton à gauche
 * d'Agrandir, avec le signe d'un menu sandwich ; on clique, le menu s'ouvre
 * pour voir les notions et sélectionner ».
 *
 * Le sommaire de gauche disparaît sous 900 px : ce panneau le remplace. Il
 * monte du bas de l'écran (sous le pouce), reprend le style du sommaire, s'ouvre
 * sur la notion regardée et se referme dès qu'on en choisit une.
 *
 * Posé sur `<body>` : la fiche qui arrive glisse (transform), et un parent
 * transformé couperait un panneau fixe. La couleur de la matière lui est donc
 * repassée (`style`), elle ne lui vient plus de la page.
 *
 * Se ferme par Échap, par la croix, ou par un toucher sur le voile.
 */
export default function MenuNotions({ fiches, indexVu, onChoisir, onFermer, style = undefined }) {
  const idTitre = useId();
  const courante = useRef(null);
  const fermerRef = useRef(onFermer);
  fermerRef.current = onFermer;

  useEffect(() => {
    const avant = document.activeElement;
    const debordement = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    courante.current?.focus({ preventScroll: true });
    courante.current?.scrollIntoView?.({ block: 'center' });

    const surTouche = (e) => { if (e.key === 'Escape') fermerRef.current(); };
    document.addEventListener('keydown', surTouche);
    return () => {
      document.removeEventListener('keydown', surTouche);
      document.body.style.overflow = debordement;
      avant?.focus?.({ preventScroll: true });
    };
  }, []);

  const surVoile = (e) => {
    if (e.target === e.currentTarget) onFermer();
  };

  return createPortal(
    <div className="mf-menu-notions" style={style} onMouseDown={surVoile}>
      <div className="mf-menu-notions__panneau" role="dialog" aria-modal="true" aria-labelledby={idTitre}>
        <header className="mf-menu-notions__tete">
          <span className="mf-menu-notions__poignee" aria-hidden="true" />
          <h2 id={idTitre} className="mf-menu-notions__titre">Les notions</h2>
          <span className="mf-menu-notions__position">Fiche {indexVu + 1} sur {fiches.length}</span>
          <button type="button" className="mf-menu-notions__fermer" aria-label="Fermer" onClick={onFermer}>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none"
              stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </header>

        <ol className="mf-sommaire__liste mf-menu-notions__liste">
          {fiches.map((f, i) => (
            <li key={f.id}>
              <button
                type="button"
                ref={i === indexVu ? courante : undefined}
                className={`mf-sommaire__notion${i === indexVu ? ' est-courante' : ''}`}
                aria-current={i === indexVu ? 'true' : undefined}
                onClick={() => onChoisir(i)}
              >
                <span className="mf-sommaire__numero" aria-hidden="true">{f.notionRang ?? i + 1}</span>
                <span className="mf-sommaire__nom">{f.titre}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </div>,
    document.body,
  );
}
