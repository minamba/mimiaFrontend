import { useEffect, useRef } from 'react';
import logoFondClair from '../assets/logo-fond-clair.png';
import logoFondSombre from '../assets/logo-fond-sombre.png';
import { imprimerSous, nomDocument } from '../lib/impression';
import Loader from './Loader';

/**
 * La copie d'une évaluation.
 *
 * Un seul composant pour la fenêtre et pour le PDF : le « téléchargement »
 * passe par l'impression du navigateur, avec une feuille de style dédiée. Deux
 * rendus séparés finiraient par diverger, et le parent recevrait un document
 * différent de celui qu'il a vu à l'écran.
 */

const VERDICTS = {
  juste: { libelle: 'Juste', signe: '✓' },
  partiel: { libelle: 'En partie', signe: '~' },
  faux: { libelle: 'Faux', signe: '✕' },
};

/**
 * La pastille de verdict, en tête de question.
 *
 * Un tracé SVG et non un caractère « ✓ » : la coche typographique change de
 * dessin et d'épaisseur d'une police à l'autre, et disparaît souvent à
 * l'impression. Ici le trait est le même partout, à l'écran comme sur le PDF.
 */
function Marqueur({ verdict }) {
  const traces = {
    juste: 'M6 10.5l2.8 2.8L14 7.5',
    faux: 'M7 7l6 6M13 7l-6 6',
    partiel: 'M6.5 10h7',
  };

  return (
    <span className={`marqueur marqueur--${verdict ?? 'inconnu'}`} aria-hidden="true">
      <svg viewBox="0 0 20 20">
        <path d={traces[verdict] ?? traces.partiel} />
      </svg>
    </span>
  );
}

const dateLongue = (valeur) =>
  valeur
    ? new Date(valeur).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

const noteLisible = (note) =>
  note.toLocaleString('fr-FR', { maximumFractionDigits: 1 });

/** Feuille de copie. Extraite pour être imprimable seule. */
export function FeuilleControle({ copie }) {
  const ton = copie.note >= 16 ? 1 : copie.note >= 12 ? 2 : copie.note >= 10 ? 3 : 0;
  const questions = copie.questions ?? [];

  const compte = questions.reduce((total, q) => {
    total[q.verdict] = (total[q.verdict] ?? 0) + 1;
    return total;
  }, {});

  return (
    <article className="controle">
      {/* Le document sort de l'application : sur une feuille imprimée, rien
          d'autre ne dit d'où il vient. Deux fichiers plutôt qu'un, parce que
          la copie s'affiche sur fond sombre à l'écran et sur fond blanc au
          moment de l'impression. */}
      <div className="controle__marque">
        <img src={logoFondClair} alt="Mimia" className="controle__logo controle__logo--clair" />
        <img src={logoFondSombre} alt="" aria-hidden="true" className="controle__logo controle__logo--sombre" />
      </div>

      <header className="controle__entete">
        <div>
          <p className="controle__sur-titre">Évaluation · {copie.matiereLibelle}</p>
          <h2 className="controle__titre">{copie.notion || copie.matiereLibelle}</h2>
          <p className="controle__identite">
            {[copie.elevePrenom, copie.eleveNom].filter(Boolean).join(' ')}
            {copie.eleveNiveau && ` · ${copie.eleveNiveau}`}
          </p>
          <p className="controle__meta">
            {dateLongue(copie.dateCreation)}
            {copie.profPrenom && ` · évaluation conduite par ${copie.profPrenom}`}
          </p>
        </div>

        <div className={`controle__note controle__note--ton${ton}`}>
          <strong>{noteLisible(copie.note)}</strong>
          <span>sur 20</span>
        </div>
      </header>

      {questions.length === 0 ? (
        <p className="vide vide--compact">
          Le détail des questions n'a pas été enregistré pour cette évaluation.
        </p>
      ) : (
        <>
          <div className="controle__compte">
            {['juste', 'partiel', 'faux'].map((verdict) =>
              compte[verdict] ? (
                <span key={verdict} className={`verdict verdict--${verdict}`}>
                  {compte[verdict]} {VERDICTS[verdict].libelle.toLowerCase()}
                </span>
              ) : null,
            )}
          </div>

          <ol className="controle__questions">
            {questions.map((question, index) => {
              const verdict = VERDICTS[question.verdict];

              // Une réponse fausse ou incomplète appelle la bonne réponse juste
              // en dessous : c'est ce que l'élève relira avant le prochain
              // contrôle, pas son erreur.
              const aCorriger = question.verdict === 'faux' || question.verdict === 'partiel';

              return (
                  <li key={index} className={`question question--${question.verdict ?? 'inconnu'}`}>
                    <Marqueur verdict={question.verdict} />

                    <div className="question__corps">
                      <div className="question__entete">
                        <span className="question__numero">
                          Question {question.numero || index + 1}
                        </span>
                        {verdict && (
                          <span className={`verdict verdict--${question.verdict}`}>
                            {verdict.libelle}
                          </span>
                        )}
                      </div>

                      <p className="question__enonce">{question.enonce}</p>

                      <p className="question__reponse">
                        <span className="question__etiquette">Sa réponse</span>
                        {question.reponse || <em>pas de réponse</em>}
                      </p>

                      {question.commentaire && aCorriger && (
                        <div className="question__correction">
                          <span className="question__etiquette">La bonne réponse</span>
                          <p>{question.commentaire}</p>
                        </div>
                      )}

                      {/* Sur une réponse juste, le commentaire n'est pas une
                          correction : il ne prend pas la mise en évidence. */}
                      {question.commentaire && !aCorriger && (
                        <p className="question__commentaire">{question.commentaire}</p>
                      )}
                    </div>
                  </li>
              );
            })}
          </ol>
        </>
      )}

      {(copie.remarque || copie.aRevoir) && (
        <section className="controle__observation">
          <h3>Observation du professeur</h3>
          {copie.remarque && <p>{copie.remarque}</p>}
          {copie.aRevoir && (
            <p className="controle__a-revoir">
              <strong>À reprendre ensemble :</strong> {copie.aRevoir}
            </p>
          )}
          {copie.profPrenom && (
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
 *
 * Le bouton lance l'impression du navigateur : « Enregistrer au format PDF »
 * y produit exactement ce que la feuille de style d'impression décrit, sans
 * qu'on ait à fabriquer un PDF nous-mêmes.
 */
export default function Controle({ copie, chargement, erreur, onFermer }) {
  const boiteRef = useRef(null);

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
    <div className="modale modale--controle" role="dialog" aria-modal="true" aria-label="Copie de l'évaluation">
      <div className="modale__boite modale__boite--controle" ref={boiteRef}>
        {chargement && <Loader texte="Chargement de la copie…" />}
        {erreur && <div className="alert">{erreur}</div>}

        {copie && <FeuilleControle copie={copie} />}

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
