import { useEffect, useRef } from 'react';
import RenduFiche from './RenduFiche';
import { typeFiche } from '../../lib/mesFiches/typesFiches';

/**
 * L'APERÇU D'UN TYPE DE FICHE, EN GRAND — Camara, le 15/10/2026 : « que
 * l'enfant voie à quoi ressemble chaque type de fiche ». Un vrai exemple,
 * rendu par le même composant que ses futures fiches : ce qu'il voit ici est
 * ce qu'il obtiendra, sur son propre cours.
 *
 * « Choisir cette fiche » n'apparaît que si le choix est possible (sa matière
 * est choisie, son brouillon pas encore commencé) : sinon on regarde, sans
 * pouvoir faire un choix qui serait refusé.
 *
 * LA FENÊTRE PREND LA COULEUR DU TYPE (16/10/2026) : liseré, pastille et
 * bouton fermer, comme sa carte dans la grille — on sait d'un coup d'œil
 * quelle fiche on regarde.
 */
export default function ApercuType({ exemple, peutChoisir, onChoisir, onFermer }) {
  const fermer = useRef(null);
  const type = typeFiche(exemple.type);

  useEffect(() => {
    fermer.current?.focus();
    const auClavier = (e) => { if (e.key === 'Escape') onFermer(); };
    document.addEventListener('keydown', auClavier);
    return () => document.removeEventListener('keydown', auClavier);
  }, [onFermer]);

  return (
    <div className="mf-apercu" role="presentation" onClick={onFermer}>
      <div
        className={`mf-apercu__fenetre fdr-feuille--${exemple.type}`}
        role="dialog"
        aria-modal="true"
        aria-label={`Exemple : ${type?.libelle ?? ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mf-apercu__tete">
          <div className="mf-apercu__entete">
            <span className="mf-apercu__surtitre">
              <span aria-hidden="true">🔍</span> Exemple
            </span>
            <p className="mf-apercu__titre">{type?.libelle}</p>
            {type?.accroche && <p className="mf-apercu__accroche">{type.accroche}</p>}
          </div>
          <button ref={fermer} type="button" className="mf-apercu__fermer" aria-label="Fermer l’exemple" onClick={onFermer}>
            ×
          </button>
        </div>

        <div className="mf-apercu__corps">
          <RenduFiche fiche={exemple} />
        </div>

        <div className="mf-apercu__pied">
          <p className="mf-apercu__note">
            <span aria-hidden="true">💡</span>
            <span>
              Exemple sur un cours de {exemple.matiere.toLowerCase()}. <strong>Ta fiche reprendra TON cours.</strong>
            </span>
          </p>
          <div className="mf-apercu__boutons">
            <button type="button" className="btn btn--fantome" onClick={onFermer}>Fermer</button>
            {peutChoisir && (
              <button type="button" className="btn mf-apercu__choisir" onClick={onChoisir}>
                <span aria-hidden="true">✓ </span>Choisir cette fiche
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
