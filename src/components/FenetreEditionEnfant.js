import { useEffect, useId } from 'react';
import { createPortal } from 'react-dom';

/**
 * LA FENÊTRE « MODIFIER » D'UN ENFANT — Camara, le 16/10/2026 : « quand on
 * clique sur Modifier, je veux une popup avec un formulaire moderne, propre et
 * pas monochrome ». Le formulaire se dépliait sous la carte, d'une seule
 * couleur, et se perdait au milieu de la liste.
 *
 * Une fenêtre centrée, posée sur `<body>` (un parent en `overflow` ou en
 * `transform` ne peut pas la couper), qui reprend la mécanique des autres
 * modales : titre figé, corps qui défile, boutons figés (`.modale__corps`).
 *
 * UNE COULEUR PAR SECTION (`Section`, attribut `couleur`) : on retrouve
 * l'identité, la scolarité et l'établissement d'un coup d'œil, et le champ
 * actif prend la couleur de sa section.
 *
 * Se ferme par Échap, par la croix, par « Annuler » ou par un clic sur le
 * voile — jamais par un clic qui a commencé DANS la fenêtre (une sélection de
 * texte relâchée sur le voile ne doit pas tout jeter).
 *
 * LA MÊME FENÊTRE POUR CRÉER (16/10/2026) : l'administration crée un enfant
 * pour un parent (`CreationEnfantAdmin`) — `titre` et `libelleBouton`
 * changent, le reste est le même.
 */
export default function FenetreEditionEnfant({
  prenom, sousTitre, initiale, onFermer, onSoumettre, saving, children,
  titre = null, libelleBouton = 'Enregistrer', libelleEnCours = 'Enregistrement…', erreur = null,
}) {
  const idTitre = useId();

  useEffect(() => {
    const surTouche = (evenement) => {
      if (evenement.key === 'Escape') onFermer();
    };
    document.addEventListener('keydown', surTouche);
    return () => document.removeEventListener('keydown', surTouche);
  }, [onFermer]);

  const surVoile = (evenement) => {
    if (evenement.target === evenement.currentTarget) onFermer();
  };

  return createPortal(
    <div className="modale edition-enfant" onMouseDown={surVoile}>
      <form
        className="modale__boite edition-enfant__boite"
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitre}
        onSubmit={onSoumettre}
      >
        <header className="edition-enfant__tete">
          <span className="edition-enfant__initiale" aria-hidden="true">{initiale}</span>
          <span className="edition-enfant__titres">
            <h2 id={idTitre}>{titre ?? `Modifier le profil de ${prenom}`}</h2>
            {sousTitre && <span>{sousTitre}</span>}
          </span>
          <button type="button" className="edition-enfant__fermer" aria-label="Fermer" onClick={onFermer}>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none"
              stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </header>

        <div className="modale__corps edition-enfant__corps">{children}</div>

        {/* L'ERREUR AU PIED, À CÔTÉ DU BOUTON (16/10/2026) : en haut du corps,
            elle tombait hors de vue — on clique en bas, après avoir défilé —
            et un refus passait pour un clic sans effet. */}
        {erreur && <p className="edition-enfant__erreur" role="alert">{erreur}</p>}

        <div className="modale__actions edition-enfant__actions">
          <button type="button" className="btn-ghost" onClick={onFermer}>Annuler</button>
          <button type="submit" className="btn edition-enfant__enregistrer" disabled={saving}>
            {saving ? libelleEnCours : libelleBouton}
          </button>
        </div>
      </form>
    </div>,
    document.body,
  );
}

const ICONES = {
  identite: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
    </>
  ),
  scolarite: (
    <>
      <path d="M2 9l10-5 10 5-10 5z" />
      <path d="M6 11v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" />
    </>
  ),
  lieu: (
    <>
      <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </>
  ),
};

/** Une section colorée de la fenêtre : une pastille, un titre, une phrase d'aide. */
export function Section({ couleur, titre, aide, children }) {
  return (
    <section className={`edition-section edition-section--${couleur}`}>
      <header className="edition-section__tete">
        <span className="edition-section__pastille" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {ICONES[couleur]}
          </svg>
        </span>
        <span>
          <h3>{titre}</h3>
          {aide && <p>{aide}</p>}
        </span>
      </header>
      <div className="edition-section__corps">{children}</div>
    </section>
  );
}
