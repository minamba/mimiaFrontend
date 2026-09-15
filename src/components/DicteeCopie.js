import { useEffect, useMemo } from 'react';
import { comparerDictee } from '../lib/storage/diffDictee';
import { TexteCompare, LegendeErreurs, aDesTrous } from './ComparaisonDictee';
import logoFondClair from '../assets/logo-fond-clair.png';
import logoFondSombre from '../assets/logo-fond-sombre.png';
import { imprimerSous, nomDocument } from '../lib/impression';
import Loader from './Loader';

/**
 * La copie d'une dictée corrigée.
 *
 * Même construction que `Controle.js` (les évaluations) : un seul composant
 * pour la fenêtre et pour le PDF, avec une feuille de style d'impression
 * dédiée. Ici pas de questions à parcourir — deux textes à comparer, le
 * dicté et la copie — et pas de note : juste ce qui a été dicté, ce qui a
 * été écrit, et l'observation du professeur en bas.
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

/** Feuille de copie. Extraite pour être imprimable seule. */
export function FeuilleDictee({ copie }) {
  // LES MÊMES BADGES QU'AU TABLEAU — voulu par Camara le 11/09/2026 : l'enfant
  // retrouve dans son archive les erreurs numérotées qu'il a vues en séance.
  //
  // Seulement une fois CORRIGÉE : une dictée en attente se corrige avec le
  // professeur, pas en découvrant seul les réponses la veille du cours.
  const comparee = useMemo(
    () => comparerDictee(copie.texteDicte ?? '', copie.copie ?? ''),
    [copie.texteDicte, copie.copie],
  );

  const surligner = copie.etat !== 'en_attente' && comparee.comparable && comparee.erreurs > 0;

  return (
    <article className="controle dictee-copie">
      <div className="controle__marque">
        <img src={logoFondClair} alt="Mimia" className="controle__logo controle__logo--clair" />
        <img src={logoFondSombre} alt="" aria-hidden="true" className="controle__logo controle__logo--sombre" />
      </div>

      <header className="controle__entete">
        <div>
          <p className="controle__sur-titre">Dictée · {copie.matiereLibelle}</p>
          <h2 className="controle__titre">{copie.titre || 'Dictée'}</h2>
          {copie.etat === 'en_attente' && (
            <span className="dictee-etat dictee-etat--attente">En attente de correction</span>
          )}
          <p className="controle__identite">
            {[copie.elevePrenom, copie.eleveNom].filter(Boolean).join(' ')}
            {copie.eleveNiveau && ` · ${copie.eleveNiveau}`}
          </p>
          <p className="controle__meta">
            {dateLongue(copie.dateCreation)}
            {copie.profPrenom && ` · dictée avec ${copie.profPrenom}`}
          </p>
        </div>
      </header>

      {surligner && <LegendeErreurs trous={aDesTrous(comparee)} variante="feuille" />}

      {/* DEUX TEXTES, DEUX IDENTITÉS — voulu par Camara le 11/09/2026 : tout
          était du même gris, et l'on cherchait lequel était lequel. La
          dictée prend l'ambre de ses surlignés, la copie le corail des
          siens : la couleur du bloc et celle de l'erreur se répondent. */}
      <section className="dictee-copie__bloc dictee-copie__bloc--dictee">
        <header className="dictee-copie__entete">
          <span className="dictee-copie__icone" aria-hidden="true">📖</span>
          <div>
            <h3>Le texte dicté</h3>
            <p className="dictee-copie__sous-titre">Ce qu’il fallait écrire</p>
          </div>
        </header>
        <p className="dictee-copie__texte dictee-copie__texte--dictee">
          {surligner
            ? <TexteCompare segments={comparee.dicte} cote="dictee" />
            : copie.texteDicte}
        </p>
      </section>

      <section className="dictee-copie__bloc dictee-copie__bloc--copie">
        <header className="dictee-copie__entete">
          <span className="dictee-copie__icone" aria-hidden="true">✍️</span>
          <div>
            <h3>Ta copie</h3>
            <p className="dictee-copie__sous-titre">Ce que tu as écrit</p>
          </div>
        </header>
        <p className="dictee-copie__texte dictee-copie__texte--copie">
          {surligner
            ? <TexteCompare segments={comparee.copie} cote="copie" />
            : copie.copie}
        </p>
      </section>

      {copie.remarque && (
        <section className="controle__observation">
          <h3>{copie.etat === 'en_attente' ? 'Pas encore corrigée' : 'Observation du professeur'}</h3>
          <p>{copie.remarque}</p>
          {copie.etat !== 'en_attente' && copie.profPrenom && (
            <p className="controle__signature">
              — {copie.profPrenom}, {copie.matiereLibelle}
            </p>
          )}
        </section>
      )}
    </article>
  );
}

/**
 * La copie en fenêtre, avec le bouton d'impression.
 */
export default function DicteeCopie({ copie, chargement, erreur, onFermer }) {
  // Échap ferme la fenêtre : un enfant qui a fini de lire sa copie cherche
  // rarement le bouton.
  useEffect(() => {
    const auClavier = (evenement) => {
      if (evenement.key === 'Escape') onFermer?.();
    };

    document.addEventListener('keydown', auClavier);
    return () => document.removeEventListener('keydown', auClavier);
  }, [onFermer]);

  return (
    <div className="modale modale--dictee" role="dialog" aria-modal="true" aria-label="Copie de la dictée">
      <div className="modale__boite modale__boite--controle">
        {chargement && <Loader texte="Chargement de la copie…" />}
        {erreur && <div className="alert">{erreur}</div>}

        {copie && <FeuilleDictee copie={copie} />}

        <div className="modale__actions modale__actions--controle">
          {copie && (
            <button
              type="button"
              className="btn btn--compact"
              onClick={() =>
                imprimerSous(
                  nomDocument({
                    prenom: copie.elevePrenom,
                    nom: copie.eleveNom,
                    matiere: copie.matiereLibelle,
                    date: copie.dateCreation,
                    suffixe: 'Dictee',
                  }),
                  '.modale--dictee',
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
