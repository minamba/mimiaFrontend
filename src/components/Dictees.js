import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { chargerReferentiel } from '../lib/actions/referentielActions';
import { chargerEleves } from '../lib/actions/elevesActions';
import { getDictees, getDictee, marquerDicteeVue } from '../lib/api/elevesApi';
import { styleMatiere } from '../lib/couleurMatiere';
import Avatar from './Avatar';
import DicteeCopie from './DicteeCopie';
import Loader from './Loader';

/**
 * Les dictées corrigées d'un élève dans une matière — vues par l'ÉLÈVE.
 *
 * Même principe que `Evaluations.js` : c'est l'enfant qui les a écrites,
 * c'est d'abord à lui qu'elles servent. Revoir sa copie à côté du texte
 * dicté, avec la remarque du professeur, est ce qui fait rentrer la
 * correction — bien plus que le moment où elle a été dite une seule fois,
 * à l'oral, pendant la séance.
 */

/** L'heure seule : la date est déjà portée par l'en-tête du cours. */
const heure = (valeur) =>
  valeur
    ? new Date(valeur).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    : '';

const date = (valeur) =>
  valeur
    ? new Date(valeur).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric',
    })
    : '';

export default function Dictees() {
  const { eleveId, matiereId } = useParams();
  const dispatch = useDispatch();

  const { matieres } = useSelector((state) => state.referentiel);
  const { liste } = useSelector((state) => state.eleves);

  const [dictees, setDictees] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  // La dictée ouverte. `ouverture` porte l'identifiant plutôt qu'un booléen :
  // c'est ce qui permet de n'afficher « Ouverture… » que sur la carte cliquée.
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

    getDictees(eleveId, matiereId)
      .then(({ data }) => {
        if (vivant) setDictees(data ?? []);
      })
      .catch(() => {
        if (vivant) setErreur("Tes dictées n'ont pas pu être chargées.");
      })
      .finally(() => {
        if (vivant) setChargement(false);
      });

    return () => { vivant = false; };
  }, [eleveId, matiereId]);

  /**
   * LES DICTÉES SE REGROUPENT PAR JOUR, PAS PAR CONVERSATION.
   *
   * À plat, rien ne disait que deux dictées venaient du même après-midi de
   * travail : le parent lisait une file de lignes sans savoir ce qui allait
   * ensemble. Le jour est l'unité qui a du sens pour lui — c'est le moment où
   * son enfant s'est assis pour travailler.
   *
   * PAS LA CONVERSATION, ET C'EST UNE CORRECTION. Le premier essai groupait
   * par `conversationId`, comme les compréhensions orales. Relevé le
   * 11/09/2026 : un fil unique portait cinq dictées écrites les 8, 9 et 11
   * septembre — toutes affichées sous « Cours du 8 septembre 2026 ». Un fil
   * de discussion se rouvre des jours durant ; une journée de travail, non.
   *
   * PAS D'IMBRICATION ICI, contrairement à l'écoute. Quand le professeur
   * relit un passage que l'enfant n'a pas retenu, ce n'est pas un second
   * exercice : c'est la même dictée qui continue, et son texte comme sa copie
   * la portent en entier.
   */
  const seances = useMemo(() => {
    const parJour = new Map();

    dictees.forEach((d) => {
      // La clé est la journée LOCALE : une dictée de 23 h 52 en temps
      // universel appartient au lendemain pour l'enfant qui l'a écrite.
      const quand = new Date(d.dateCreation);
      const cle = [
        quand.getFullYear(),
        String(quand.getMonth() + 1).padStart(2, '0'),
        String(quand.getDate()).padStart(2, '0'),
      ].join('-');

      if (!parJour.has(cle)) parJour.set(cle, { cle, dictees: [] });
      parJour.get(cle).dictees.push(d);
    });

    return [...parJour.values()]
      .map((seance) => ({
        ...seance,
        // LA PLUS RÉCENTE EN HAUT, dans le jour comme entre les jours.
        dictees: [...seance.dictees]
          .sort((a, b) => new Date(b.dateCreation) - new Date(a.dateCreation)),
        date: seance.dictees[0].dateCreation,
        // LE MÊME COMPTE QUE LA CARTE DE MATIÈRE, AU MÊME MOMENT.
        //
        // Elle annonce « à consulter » les dictées jamais ouvertes ET celles
        // que le professeur a corrigées depuis la dernière lecture. Ne
        // compter ici que les premières aurait donné deux chiffres pour la
        // même chose, sur deux écrans voisins.
        nouveautes: seance.dictees.filter(
          (d) => d.jamaisLue || d.miseAJourNonLue,
        ).length,
      }))
      .sort((a, b) => b.cle.localeCompare(a.cle));
  }, [dictees]);

  const [depliees, setDepliees] = useState(new Set());

  // Le cours le plus récent s'ouvre seul : c'est celui qu'on vient de faire.
  useEffect(() => {
    if (seances.length === 0) return;
    setDepliees((actuel) => (actuel.size > 0 ? actuel : new Set([seances[0].cle])));
  }, [seances]);

  const basculer = (cle) => {
    setDepliees((actuel) => {
      const suivant = new Set(actuel);
      if (suivant.has(cle)) suivant.delete(cle); else suivant.add(cle);
      return suivant;
    });
  };

  const voirLaCopie = async (dicteeId) => {
    setOuverture(dicteeId);
    setErreur(null);

    try {
      const { data } = await getDictee(eleveId, dicteeId);
      setCopie(data);

      // LA PASTILLE S'ÉTEINT ICI, PAS AU PROCHAIN CHARGEMENT.
      //
      // Le serveur est prévenu — d'où le catch muet, un échec ne doit rien
      // changer à l'affichage de la copie — mais la liste, elle, vit en
      // mémoire : sans cette retouche, l'en-tête continuait d'annoncer
      // « 1 à consulter » alors que l'enfant venait de l'ouvrir sous ses
      // propres yeux.
      marquerDicteeVue(eleveId, dicteeId).catch(() => {});

      setDictees((liste) => liste.map(
        (d) => (d.id === dicteeId
          ? { ...d, jamaisLue: false, miseAJourNonLue: false }
          : d),
      ));
    } catch {
      setErreur("La dictée n'a pas pu être ouverte.");
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

          <h1>Mes dictées</h1>

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

      {chargement && <Loader texte="Chargement de tes dictées…" />}
      {/* CE QUE VEULENT DIRE LES INDICATEURS.
          Même légende que « Mes compréhensions orales », et pour la même
          raison : un point orange sur un cours et une étiquette sur une
          ligne, sans rien qui dise lequel veut dire quoi. La dictée a un
          état de plus que l'écoute — une copie peut avoir été lue AVANT
          d'être corrigée — donc trois entrées au lieu de deux. */}
      {seances.length > 0 && (
        <ul className="co-legende">
          <li className="co-legende__item">
            <span className="co-legende__pastille" aria-hidden="true" />
            Cours à consulter
          </li>

          <li className="co-legende__item">
            <span className="dictee-etiquette dictee-etiquette--neuve" aria-hidden="true">Nouveau</span>
            Jamais ouverte
          </li>

          <li className="co-legende__item">
            <span className="dictee-etiquette dictee-etiquette--corrigee" aria-hidden="true">Corrigée</span>
            Corrigée depuis ta visite
          </li>
        </ul>
      )}

      {erreur && <div className="alert">{erreur}</div>}

      {!chargement && !erreur && seances.length === 0 && (
        <div className="fiches-vide">
          <p className="fiches-vide__titre">Pas encore de dictée ici.</p>
          <p>
            {matiere?.profPrenom ?? 'Ton professeur'} archivera chaque dictée
            corrigée ici, avec le texte dicté, ta copie et son observation.
          </p>
        </div>
      )}

      {seances.length > 0 && (
        <ul className="co-seances">
          {seances.map((seance) => {
            const ouverte = depliees.has(seance.cle);

            return (
              <li key={seance.cle} className="co-seance">
                <button
                  type="button"
                  className={`co-seance__entete ${ouverte ? 'co-seance__entete--ouverte' : ''}`}
                  onClick={() => basculer(seance.cle)}
                  aria-expanded={ouverte}
                >
                  <span className="co-seance__chevron" aria-hidden="true">›</span>

                  <span className="co-seance__titre">
                    <strong>Cours du {date(seance.date)}</strong>
                    <span className="co-seance__compte">
                      {seance.dictees.length} dictée{seance.dictees.length > 1 ? 's' : ''}
                      {seance.nouveautes > 0 && ` · ${seance.nouveautes} à consulter`}
                    </span>
                  </span>

                  {seance.nouveautes > 0 && <span className="co-seance__pastille" aria-hidden="true" />}
                </button>

                {ouverte && (
                  <ul className="evaluations-liste">
                    {seance.dictees.map((dictee) => (
                      <li key={dictee.id}>
                        <button
                          type="button"
                          className="evaluation-carte evaluation-carte--dictee"
                          onClick={() => voirLaCopie(dictee.id)}
                          disabled={ouverture === dictee.id}
                        >
                          <span className="evaluation-carte__emoji" aria-hidden="true">✏️</span>

                          {/* QUATRE COLONNES FIXES, ET C'EST TOUT L'OBJET.

                              Les étiquettes se suivaient à la queue leu leu :
                              « en attente de correction » se décalait d'une
                              ligne à l'autre selon que « nouveau » était là ou
                              non, et rien ne s'alignait verticalement. Chaque
                              état a désormais sa colonne, occupée ou vide. */}
                          <span className="dictee-ligne__corps">
                            <strong className="evaluation-carte__notion">
                              {dictee.titre || 'Dictée'}
                            </strong>
                            <span className="evaluation-carte__date">
                              {heure(dictee.dateCreation)}
                            </span>
                          </span>

                          <span className="dictee-ligne__lecture">
                            {dictee.jamaisLue && (
                              <span className="dictee-etiquette dictee-etiquette--neuve">
                                Nouveau
                              </span>
                            )}

                            {!dictee.jamaisLue && dictee.miseAJourNonLue && (
                              <span className="dictee-etiquette dictee-etiquette--corrigee">
                                Corrigée
                              </span>
                            )}
                          </span>

                          <span className="dictee-ligne__correction">
                            {dictee.etat === 'en_attente' && (
                              <span className="dictee-etat dictee-etat--attente">
                                En attente de correction
                              </span>
                            )}
                          </span>

                          <span className="evaluation-carte__lire">
                            {ouverture === dictee.id ? 'Ouverture…' : 'Voir'}
                            {' '}
                            <span aria-hidden="true">→</span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {copie && <DicteeCopie copie={copie} onFermer={() => setCopie(null)} />}
    </section>
  );
}
