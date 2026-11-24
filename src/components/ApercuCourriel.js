import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * L'APERÇU D'UN COURRIEL DE L'ADMIN, DANS UN CADRE ISOLÉ — contrôle d'Omar (mail HTML complet v2, 24/11/2026).
 *
 * Avant, l'aperçu s'ouvrait dans un onglet `blob:` : une adresse `blob:` prend l'ORIGINE du site admin, donc un script
 * glissé dans un HTML collé s'y serait exécuté sous mimia.fr, avec la session de l'admin. Ici, le courriel est posé
 * dans un cadre `sandbox=""` (comme la Messagerie) : pas de script, pas d'accès à la page, pas de navigation imposée.
 * Le contenu ne peut plus rien faire d'autre que s'afficher. C'est la seconde barrière : le serveur nettoie déjà le
 * HTML (`HtmlComplet.Nettoyer`).
 *
 * Le courriel garde sa vraie largeur : la fenêtre prend tout l'écran, et « Téléphone » le montre à 390 px.
 * Se ferme par Échap, par la croix, ou par un clic sur le voile.
 */
export default function ApercuCourriel({ html, onFermer }) {
  const idTitre = useId();
  const [largeur, setLargeur] = useState('ordinateur');

  useEffect(() => {
    const surTouche = (e) => { if (e.key === 'Escape') onFermer(); };
    document.addEventListener('keydown', surTouche);
    const debordement = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', surTouche);
      document.body.style.overflow = debordement;
    };
  }, [onFermer]);

  return createPortal(
    <div className="modale apercu-courriel" onMouseDown={(e) => { if (e.target === e.currentTarget) onFermer(); }}>
      <div className="modale__boite apercu-courriel__boite" role="dialog" aria-modal="true" aria-labelledby={idTitre}>
        <header className="apercu-courriel__tete">
          <h2 id={idTitre}>Aperçu du courriel</h2>
          <div className="apercu-courriel__largeurs" role="group" aria-label="Largeur de l’aperçu">
            <button
              type="button"
              aria-pressed={largeur === 'ordinateur'}
              className={largeur === 'ordinateur' ? 'est-actif' : undefined}
              onClick={() => setLargeur('ordinateur')}
            >
              Ordinateur
            </button>
            <button
              type="button"
              aria-pressed={largeur === 'telephone'}
              className={largeur === 'telephone' ? 'est-actif' : undefined}
              onClick={() => setLargeur('telephone')}
            >
              Téléphone
            </button>
          </div>
          <button type="button" className="apercu-courriel__fermer" aria-label="Fermer l’aperçu" onClick={onFermer}>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none"
              stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </header>

        <div className="apercu-courriel__corps">
          {/* `sandbox` VIDE : aucun droit. Ne jamais y ajouter `allow-scripts` ni `allow-same-origin`. */}
          <iframe
            title="Aperçu du courriel"
            className={`apercu-courriel__cadre apercu-courriel__cadre--${largeur}`}
            sandbox=""
            srcDoc={html}
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}
