import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { chargerReferentiel } from '../lib/actions/referentielActions';
import { chargerEleves } from '../lib/actions/elevesActions';
import { getEvaluations, getCopieEvaluation } from '../lib/api/elevesApi';
import { styleMatiere } from '../lib/couleurMatiere';
import Avatar from './Avatar';
import Controle from './Controle';
import Loader from './Loader';

/**
 * Les évaluations d'un élève dans une matière — vues par l'ÉLÈVE.
 *
 * Elles n'étaient consultables que par le parent et l'administrateur. C'est
 * l'enfant qui les a passées : c'est d'abord à lui qu'elles servent. Revoir sa
 * copie, c'est voir ce qu'il a écrit à côté de ce qu'il fallait écrire — et
 * c'est là que la correction rentre, bien plus qu'au moment où la note tombe.
 *
 * La copie s'affiche avec le même composant que côté parent : mêmes questions,
 * mêmes coches vertes, mêmes croix rouges, même correction surlignée. Il n'y a
 * aucune raison de lui en montrer une version édulcorée — il l'a déjà vue au
 * moment de l'évaluation.
 */

const date = (valeur) =>
  valeur
    ? new Date(valeur).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric',
    })
    : '';

/**
 * La note, colorée par palier.
 *
 * Jamais de rouge, même à 4/20 : c'est la règle que le professeur s'impose à
 * l'oral, et elle vaut d'autant plus ici que l'enfant regarde seul, sans
 * personne à côté pour remettre le chiffre à sa place.
 */
function Note({ valeur }) {
  const ton = valeur >= 16 ? 1 : valeur >= 12 ? 2 : valeur >= 10 ? 3 : 0;

  return (
    <span className={`note note--ton${ton}`}>
      {valeur.toLocaleString('fr-FR', { maximumFractionDigits: 1 })}
      <span className="note__sur">/20</span>
    </span>
  );
}

export default function Evaluations() {
  const { eleveId, matiereId } = useParams();
  const dispatch = useDispatch();

  const { matieres } = useSelector((state) => state.referentiel);
  const { liste } = useSelector((state) => state.eleves);

  const [evaluations, setEvaluations] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  // La copie ouverte. `ouverture` porte l'identifiant plutôt qu'un booléen :
  // c'est ce qui permet de n'afficher « Ouverture… » que sur la ligne cliquée.
  const [copie, setCopie] = useState(null);
  const [ouverture, setOuverture] = useState(null);

  const eleve = liste.find((e) => String(e.id) === String(eleveId));
  const matiere = matieres.find((m) => String(m.id) === String(matiereId));

  useEffect(() => {
    if (matieres.length === 0) dispatch(chargerReferentiel());
    if (liste.length === 0) dispatch(chargerEleves());
  }, [dispatch, matieres.length, liste.length]);

  useEffect(() => {
    let vivant = true;

    getEvaluations(eleveId)
      .then(({ data }) => {
        if (vivant) setEvaluations(data ?? []);
      })
      .catch(() => {
        if (vivant) setErreur("Tes évaluations n'ont pas pu être chargées.");
      })
      .finally(() => {
        if (vivant) setChargement(false);
      });

    return () => { vivant = false; };
  }, [eleveId]);

  // Le filtrage se fait ici plutôt qu'au serveur : la route rend les vingt
  // dernières évaluations toutes matières confondues, et un élève n'en a pas
  // assez pour que trier vingt lignes se remarque.
  const siennes = useMemo(
    () => evaluations.filter((e) => String(e.matiereId) === String(matiereId)),
    [evaluations, matiereId],
  );

  const moyenne = useMemo(() => {
    if (siennes.length === 0) return null;
    return siennes.reduce((somme, e) => somme + e.note, 0) / siennes.length;
  }, [siennes]);

  const voirLaCopie = async (evaluationId) => {
    setOuverture(evaluationId);
    setErreur(null);

    try {
      const { data } = await getCopieEvaluation(eleveId, evaluationId);
      setCopie(data);
    } catch {
      setErreur("La copie n'a pas pu être ouverte.");
    } finally {
      setOuverture(null);
    }
  };

  const teinte = matiere?.profCouleur || 'var(--accent)';

  return (
    <section
      className="page page--large"
      style={{ '--teinte': teinte, ...styleMatiere(matiere) }}
    >
      <Link to={`/eleves/${eleveId}/matieres`} className="lien-retour">
        <span aria-hidden="true">←</span> Mes matières
      </Link>

      <header className="fiches-entete">
        {matiere && (
          <span className="fiches-entete__avatar">
            <Avatar nom={matiere.profAvatar} couleur={matiere.profCouleur} taille={56} />
          </span>
        )}

        <div className="fiches-entete__texte">
          {matiere?.libelle && (
            <p className="fiches-entete__sur-titre">{matiere.libelle}</p>
          )}

          <h1>Mes évaluations</h1>

          <p className="fiches-entete__ligne">
            {[
              matiere?.profPrenom && `Corrigées par ${matiere.profPrenom}`,
              eleve && `pour ${eleve.prenom}`,
            ]
              .filter(Boolean)
              .join(' ')}
          </p>
        </div>
      </header>

      {chargement && <Loader texte="Chargement de tes évaluations…" />}
      {erreur && <div className="alert">{erreur}</div>}

      {!chargement && !erreur && siennes.length === 0 && (
        <div className="fiches-vide">
          <p className="fiches-vide__titre">Pas encore d'évaluation ici.</p>
          <p>
            {matiere?.profPrenom ?? 'Ton professeur'} t'en proposera une quand une
            notion sera prête. Ce n'est pas un piège : elle sert à vérifier que
            c'est bien acquis, et tu sauras à l'avance qu'elle arrive.
          </p>
        </div>
      )}

      {siennes.length > 0 && (
        <>
          {/* La moyenne au-dessus de la liste : sans elle, l'enfant compare sa
              dernière note à la précédente et rien d'autre. Un mauvais jour
              pèse alors bien plus qu'il ne devrait. */}
          {moyenne !== null && siennes.length > 1 && (
            <p className="evaluations-moyenne">
              <strong>{moyenne.toLocaleString('fr-FR', { maximumFractionDigits: 1 })}/20</strong>
              {' '}de moyenne sur {siennes.length} évaluations
            </p>
          )}

          <ul className="evaluations-liste">
            {siennes.map((evaluation) => (
              <li key={evaluation.id}>
                <button
                  type="button"
                  className="evaluation-carte"
                  onClick={() => voirLaCopie(evaluation.id)}
                  disabled={ouverture === evaluation.id}
                >
                  <Note valeur={evaluation.note} />

                  <span className="evaluation-carte__corps">
                    <strong className="evaluation-carte__notion">
                      {evaluation.notion || 'Évaluation'}
                    </strong>
                    <span className="evaluation-carte__date">
                      {date(evaluation.dateCreation)}
                    </span>
                  </span>

                  <span className="evaluation-carte__lire">
                    {ouverture === evaluation.id ? 'Ouverture…' : 'Voir ma copie'}
                    {' '}
                    <span aria-hidden="true">→</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {copie && <Controle copie={copie} onFermer={() => setCopie(null)} />}
    </section>
  );
}
