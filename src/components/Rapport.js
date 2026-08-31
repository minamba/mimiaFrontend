import { useEffect } from 'react';
import logoFondClair from '../assets/logo-fond-clair.png';
import logoFondSombre from '../assets/logo-fond-sombre.png';
import { imprimerSous, nomDocument } from '../lib/impression';
import Loader from './Loader';

/**
 * Le compte rendu d'une séance.
 *
 * Calqué sur la copie d'évaluation — même feuille, même impression — parce
 * qu'un parent doit retrouver la même présentation d'un document à l'autre.
 * Ce qui change, c'est le contenu : deux notes au lieu d'une, et pas de
 * questions.
 */

const dateLongue = (valeur) =>
  valeur
    ? new Date(valeur).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

const noteLisible = (note) => note.toLocaleString('fr-FR', { maximumFractionDigits: 1 });

const ton = (note) => (note >= 16 ? 1 : note >= 12 ? 2 : note >= 10 ? 3 : 0);

/**
 * Une des deux notes.
 *
 * `null` n'est pas zéro : c'est l'absence de mesure. On l'écrit en toutes
 * lettres plutôt que d'afficher un tiret, qui se lirait comme une note ratée.
 */
function Note({ libelle, valeur, precision }) {
  return (
    <div className={`note-double ${valeur === null || valeur === undefined ? 'note-double--vide' : ''}`}>
      <span className="note-double__libelle">{libelle}</span>

      {valeur === null || valeur === undefined ? (
        <span className="note-double__absente">Pas évalué dans le cours</span>
      ) : (
        <span className={`note-double__valeur note-double__valeur--ton${ton(valeur)}`}>
          {noteLisible(valeur)}
          <span>/20</span>
        </span>
      )}

      {precision && <span className="note-double__precision">{precision}</span>}
    </div>
  );
}

/** Feuille de rapport. Extraite pour être imprimable seule. */
export function FeuilleRapport({ rapport }) {
  return (
    <article className="controle">
      {/* Même marque que sur la copie : ces documents circulent hors de
          l'application, ils doivent dire d'où ils viennent. */}
      <div className="controle__marque">
        <img src={logoFondClair} alt="Mimia" className="controle__logo controle__logo--clair" />
        <img src={logoFondSombre} alt="" aria-hidden="true" className="controle__logo controle__logo--sombre" />
      </div>

      <header className="controle__entete">
        <div>
          <p className="controle__sur-titre">Séance · {rapport.matiereLibelle}</p>
          <h2 className="controle__titre">{rapport.travaille || 'Compte rendu de séance'}</h2>
          <p className="controle__identite">
            {[rapport.elevePrenom, rapport.eleveNom].filter(Boolean).join(' ')}
            {rapport.eleveNiveau && ` · ${rapport.eleveNiveau}`}
          </p>
          <p className="controle__meta">
            {dateLongue(rapport.dateCreation)}
            {rapport.profPrenom && ` · séance conduite par ${rapport.profPrenom}`}
          </p>
        </div>
      </header>

      <div className="notes-doubles">
        <Note
          libelle="Compréhension"
          valeur={rapport.noteComprehension}
          precision="Ce qui a été vu pendant cette séance"
        />
        <Note
          libelle="Révision"
          valeur={rapport.noteRevision}
          precision="Les notions déjà vues, remobilisées"
        />
      </div>

      {(rapport.remarque || rapport.aRevoir) && (
        <section className="controle__observation">
          <h3>Observation du professeur</h3>
          {rapport.remarque && <p>{rapport.remarque}</p>}
          {rapport.aRevoir && (
            <p className="controle__a-revoir">
              <strong>À retravailler :</strong> {rapport.aRevoir}
            </p>
          )}
          {rapport.profPrenom && (
            <p className="controle__signature">
              — {rapport.profPrenom}, {rapport.matiereLibelle}
            </p>
          )}
        </section>
      )}
    </article>
  );
}

export default function Rapport({ rapport, chargement, erreur, onFermer }) {
  useEffect(() => {
    const auClavier = (evenement) => {
      if (evenement.key === 'Escape') onFermer?.();
    };

    document.addEventListener('keydown', auClavier);
    return () => document.removeEventListener('keydown', auClavier);
  }, [onFermer]);

  return (
    <div
      className="modale modale--controle"
      role="dialog"
      aria-modal="true"
      aria-label="Compte rendu de séance"
    >
      <div className="modale__boite modale__boite--controle">
        {chargement && <Loader texte="Chargement du rapport…" />}
        {erreur && <div className="alert">{erreur}</div>}

        {rapport && <FeuilleRapport rapport={rapport} />}

        <div className="modale__actions modale__actions--controle">
          {rapport && (
            <button
              type="button"
              className="btn btn--compact"
              onClick={() =>
                imprimerSous(
                  nomDocument({
                    prenom: rapport.elevePrenom,
                    nom: rapport.eleveNom,
                    matiere: rapport.matiereLibelle,
                    date: rapport.dateCreation,
                    suffixe: 'Rapport',
                  }),
                )
              }
            >
              Télécharger en PDF
            </button>
          )}
          <button type="button" className="btn-ghost" onClick={onFermer}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
