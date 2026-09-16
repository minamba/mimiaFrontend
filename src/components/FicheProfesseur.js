import { useEffect, useRef } from 'react';
import Avatar from './Avatar';
import MotifMatiere from './MotifMatiere';

/**
 * LA FICHE D'UN PROFESSEUR, OUVERTE DEPUIS SA CARTE — voulue par Camara le
 * 15/09/2026. La carte ne dit plus qu'un mot (« Mathématiques », « Arts ») :
 * c'est ici que le professeur se présente, puis détaille ce qu'il enseigne.
 *
 * TOUT VIENT DU SERVEUR (`/referentiel/equipe`), comme la carte : une liste de
 * disciplines recopiée ici divergerait de la base au premier ajout.
 *
 * Le verrou de défilement est automatique : `aria-modal` suffit (voir
 * `verrouDefilement.js`).
 */
export default function FicheProfesseur({ prof, onFermer }) {
  const fermerRef = useRef(null);

  // Lu par une référence : la page d'accueil repasse une nouvelle fonction à
  // chaque rendu, et l'effet ci-dessous ne doit tourner qu'à l'ouverture —
  // sinon le focus sauterait sur « Fermer » à chaque rafraîchissement.
  const onFermerRef = useRef(onFermer);
  onFermerRef.current = onFermer;

  // Le clavier atterrit dans la fenêtre, et Échap la referme, comme partout.
  useEffect(() => {
    fermerRef.current?.focus();

    const auClavier = (e) => { if (e.key === 'Escape') onFermerRef.current(); };
    document.addEventListener('keydown', auClavier);
    return () => document.removeEventListener('keydown', auClavier);
  }, []);

  const disciplines = prof.disciplines ?? [];

  return (
    <div
      className="modale"
      role="dialog"
      aria-modal="true"
      aria-labelledby="fiche-prof-titre"
      // Un clic sur le voile referme ; un clic dans la fiche, non.
      onMouseDown={(e) => { if (e.target === e.currentTarget) onFermer(); }}
    >
      <div className="modale__boite fiche-prof" style={{ '--teinte': prof.couleur }}>
        <button
          ref={fermerRef}
          type="button"
          className="fiche-prof__fermer"
          aria-label="Fermer la fiche"
          onClick={onFermer}
        >
          <span aria-hidden="true">×</span>
        </button>

        <header className="fiche-prof__entete">
          <MotifMatiere code={prof.code} />
          <Avatar nom={prof.avatar} taille={104} couleur={prof.couleur} />
          <div className="fiche-prof__identite">
            <p className="fiche-prof__surtitre">L’équipe pédagogique</p>
            <h2 id="fiche-prof-titre">{prof.prenom}</h2>
            {prof.titre && <p className="fiche-prof__titre">{prof.titre}</p>}
          </div>
        </header>

        <div className="modale__corps">
          {/* SA VOIX, PAS UNE NOTICE : il se présente à la première personne,
              comme il le fera à la première séance. */}
          <div className="fiche-prof__bulle">
            <p>
              <strong>Bonjour, moi c’est {prof.prenom}.</strong>
              {prof.presentation && <> {prof.presentation}</>}
            </p>
          </div>

          {disciplines.length > 0 && (
            <>
              <h3 className="fiche-prof__rubrique">Ce que j’enseigne</h3>
              <ul className="fiche-prof__disciplines">
                {disciplines.map((d) => (
                  <li key={d.libelle} className="fiche-prof__discipline">
                    <span className="fiche-prof__puce" aria-hidden="true" />
                    <div className="fiche-prof__discipline-texte">
                      <strong>{d.libelle}</strong>
                      {d.promesse && <span>{d.promesse}</span>}
                      <span className="fiche-prof__etiquettes">
                        {d.niveaux && <span className="fiche-prof__etiquette">{d.niveaux}</span>}
                        {d.voie && (
                          <span className="fiche-prof__etiquette fiche-prof__etiquette--voie">
                            {d.voie}
                          </span>
                        )}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <div className="modale__actions">
          <button type="button" className="btn btn--compact" onClick={onFermer}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
