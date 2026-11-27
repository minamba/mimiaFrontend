import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  getControle, getMatieresEleve, supprimerControle,
} from '../lib/api/elevesApi';
import { styleMatiere } from '../lib/couleurMatiere';
import BarrePreparation, { palierPreparation } from './BarrePreparation';
import ControleForm from './ControleForm';
import CoursDuControle from './CoursDuControle';
import OuvertureSeance from './OuvertureSeance';
import FenetreSansForfait from './FenetreSansForfait';
import useAccesForfait, { compteInactif } from '../lib/hooks/useAccesForfait';
import useRelectureApresSeance from '../lib/hooks/useRelectureApresSeance';
import JustificationProfesseur from './JustificationProfesseur';
import Loader from './Loader';
import PastillePret from './PastillePret';
import { delaiControle, jourControle } from './MesControles';
import { useAffichageEleve } from '../lib/besoins';
import { vueIllustree } from '../lib/vueIllustree';
import { paletteDeMatiere, sceneDeMatiere } from '../lib/scenesMatieres';
import { iconeEpreuve } from './PreparationExamen';
import './controleFicheIllustre.css';

/**
 * La fiche d'un contrôle : ce qu'il est, où en est sa préparation, et par quoi
 * continuer.
 *
 * L'ÉTAT DE CHAQUE NOTION EST ÉCRIT EN TOUTES LETTRES, jamais porté par la
 * seule couleur de sa puce — même règle que la carte des compétences, et pour
 * la même raison : un enfant daltonien lit cette page comme les autres.
 */
export const LIBELLE_ETAT = {
  acquise: 'Acquise',
  'a-confirmer': 'À confirmer',
  'en-cours': 'En cours',
  fragile: 'À revoir',
  'a-decouvrir': 'À découvrir',
};

/** L'ordre dans lequel on veut LIRE ses notions : ce qui reste à faire d'abord. */
const ORDRE = ['a-decouvrir', 'fragile', 'en-cours', 'a-confirmer', 'acquise'];

const ERREUR_CHARGEMENT = "Ce contrôle n'a pas pu être chargé.";

const dateCourte = (iso) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });

/**
 * Les deux icônes des actions secondaires. Dessinées au trait, comme partout
 * ailleurs dans le produit — un emoji change de dessin d'un système à l'autre,
 * et une corbeille qui ressemble à autre chose sur Android est une corbeille
 * qu'on clique par erreur.
 */
export function IconeCrayon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3.3 12.7 4.1 9.5 10.4 3.2c.6-.6 1.6-.6 2.2 0 .6.6.6 1.6 0 2.2L6.3 11.7 3.3 12.7Z" />
      <path d="M9.2 4.4 11.4 6.6" />
    </svg>
  );
}

/** Le calendrier de la pastille du délai (vue de l'enfant). */
function IconeCalendrier() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M8 3v4M16 3v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
    </svg>
  );
}

/** « hier », « il y a 3 jours » : le temps écoulé depuis un contrôle passé. */
export const ilYa = (jours) => (jours <= 1 ? 'hier' : `il y a ${jours} jours`);

function IconeCorbeille() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2.8 4.3h10.4M6.3 4.3V3.1c0-.4.3-.8.8-.8h1.8c.5 0 .8.4.8.8v1.2" />
      <path d="M4.2 4.3l.6 8.4c0 .5.4.9.9.9h4.6c.5 0 .9-.4.9-.9l.6-8.4" />
      <path d="M6.8 7v4M9.2 7v4" />
    </svg>
  );
}

export default function ControleFiche() {
  const { eleveId, controleId } = useParams();
  // L'affichage adapté aux besoins particuliers de l'élève (11/10/2026) — voir `lib/besoins.js`.
  const { calme } = useAffichageEleve(eleveId);
  const [parametres] = useSearchParams();

  // LISTE FERMÉE, jamais l'URL telle quelle : `retour` vient d'une adresse que
  // n'importe qui peut réécrire, et un lien de retour fabriqué depuis du texte
  // libre enverrait l'enfant où le lien le veut.
  const retour = parametres.get('retour') === 'matieres'
    ? { lien: `/eleves/${eleveId}/matieres#mes-controles`, libelle: 'Mes cours' }
    : { lien: `/eleves/${eleveId}/controles`, libelle: 'Mes contrôles' };
  const navigate = useNavigate();

  const [controle, setControle] = useState(null);
  const [matieres, setMatieres] = useState([]);

  // LA SÉANCE QU'ON S'APPRÊTE À OUVRIR — `'controle'` ou `'bilan'` —, le temps
  // des deux questions d'avant cours : la durée, puis le casque. Camara, le
  // 26/09/2026 : « faire le point » ouvrait le cours sans demander le casque.
  const [ouverture, setOuverture] = useState(null);
  // COMPTE INACTIF (Camara, le 17/11/2026) : « Préparer » ou « Faire le point » ouvre la fenêtre « Aucun abonnement ».
  const accesForfait = useAccesForfait(eleveId);
  const [sansForfait, setSansForfait] = useState(false);
  const lancer = (mode) => (compteInactif(accesForfait) ? setSansForfait(true) : setOuverture(mode));
  const [edition, setEdition] = useState(false);
  const [confirmation, setConfirmation] = useState(false);
  const [erreur, setErreur] = useState(null);

  // `silencieuse` (relecture après une séance) : un échec ne fait apparaître aucun bandeau, la fiche reste (#65 v2).
  // `vivant()` faux à l'arrivée de la réponse = fiche quittée : on ignore. Un succès efface l'erreur de chargement.
  const charger = useCallback(({ silencieuse = false, vivant = () => true } = {}) =>
    getControle(eleveId, controleId)
      .then(({ data }) => {
        if (!vivant()) return;
        setControle(data);
        setErreur((avant) => (avant === ERREUR_CHARGEMENT ? null : avant));
      })
      .catch(() => { if (vivant() && !silencieuse) setErreur(ERREUR_CHARGEMENT); }),
  [eleveId, controleId]);

  useEffect(() => { charger(); }, [charger]);

  // Ouverte juste après « Quitter », la fiche se relit le temps que le professeur conclue la séance (signalement #65).
  useRelectureApresSeance((vivant) => charger({ silencieuse: true, vivant }), `${eleveId}-${controleId}`);

  useEffect(() => {
    let vivant = true;

    getMatieresEleve(eleveId)
      .then(({ data }) => { if (vivant) setMatieres((data ?? []).filter((m) => m.active)); })
      .catch(() => { /* Le formulaire le dira lui-même. */ });

    return () => { vivant = false; };
  }, [eleveId]);

  const supprimer = async () => {
    try {
      await supprimerControle(eleveId, controleId);
      navigate(`/eleves/${eleveId}/controles`);
    } catch {
      setErreur("Le contrôle n'a pas pu être supprimé.");
      setConfirmation(false);
    }
  };

  if (erreur && !controle) return <div className="alert">{erreur}</div>;
  if (!controle) return <Loader texte="Chargement…" />;

  const preparation = controle.preparation;
  const passe = controle.joursRestants < 0;
  const aUneNote = controle.note !== null && controle.note !== undefined;

  const notions = [...(preparation?.notions ?? [])].sort(
    (a, b) => ORDRE.indexOf(a.etat) - ORDRE.indexOf(b.etat),
  );

  // LA FICHE ILLUSTRÉE DE L'ENFANT — Camara, le 15/11/2026 : sa maquette, « qui s'adapte à n'importe quel contrôle ».
  // Les couleurs et la scène de la bannière viennent de la matière du contrôle (lib/scenesMatieres.js) ; sans scène
  // connue, la bannière garde son dégradé. Le parent garde la fiche d'avant. Rien n'isole la page (pas de z-index,
  // ni filtre, ni transformation sur sa racine) : les fenêtres qu'elle ouvre passent au-dessus du pied de page.
  // Aussi pour le parent dans l'espace de son enfant (16/11/2026) : voir lib/vueIllustree.js.
  const illustre = vueIllustree();
  const matiere = matieres.find((m) => m.id === controle.matiereId);
  const scene = illustre ? sceneDeMatiere(matiere?.code) : null;
  const style = {
    ...styleMatiere({ matiereLibelle: controle.matiereLibelle }),
    ...(illustre && matiere ? paletteDeMatiere(matiere) : {}),
  };

  return (
    <section className={`page controle-page${illustre ? ' page-decor-enfant cfi' : ''}`} style={style}>
      {/* LE RETOUR SUIT LE CHEMIN PARCOURU, pas la place de la page dans
          l'arborescence. Relevé par Camara le 13/09/2026 : arrivé depuis ses
          cours, l'enfant était renvoyé vers la liste des contrôles — une page
          qu'il n'avait pas ouverte, et d'où il lui fallait un second retour.
          La provenance voyage dans l'URL pour survivre à un F5. */}
      <Link to={retour.lien} className="lien-retour">← {retour.libelle}</Link>

      {erreur && <div className="alert">{erreur}</div>}

      {/* TOUT TIENT DANS UNE SEULE CARTE — la page ne porte rien d'autre, et
          du contenu posé à même le fond sur un écran de 2 000 px de large
          flottait dans le vide. */}
      <article className="controle-fiche">

      <header className="controle-fiche__entete">
        {scene && (
          <span className="cfi-scene" aria-hidden="true" style={{ backgroundImage: `url(${scene.image})` }} />
        )}

        <div className="controle-fiche__haut">
          <span className="controle-fiche__matiere">
            {illustre ? (
              <span className="cfi-icone" aria-hidden="true">{iconeEpreuve({ libelle: controle.matiereLibelle })}</span>
            ) : (
              <span className="controle-fiche__point" aria-hidden="true" />
            )}
            {controle.matiereLibelle}
          </span>

          <span className={`controle-fiche__badge${passe ? ' est-passe' : ''}`}>
            {illustre && <IconeCalendrier />}
            {passe
              ? (illustre ? ilYa(-controle.joursRestants) : 'contrôle passé')
              : delaiControle(controle.joursRestants)}
          </span>
        </div>

        <h1>{controle.sujet || 'Contrôle'}</h1>

        <p className="controle-fiche__quand">
          {jourControle(controle.dateControle)}
          {controle.heureControle && ` · ${controle.heureControle.slice(0, 5)}`}
        </p>
      </header>

      <div className="controle-fiche__corps">

      {/* Le résumé dans son propre encadré : « où j'en suis globalement » et
          « le détail notion par notion » sont deux lectures différentes, et
          elles se confondaient faute de frontière. */}
      <section className="controle-fiche__resume">

      {/* APRÈS LE CONTRÔLE, C'EST LE RÉSULTAT QUI COMPTE, plus l'avancement
          des révisions : celui-ci appartient désormais au passé. */}
      {passe && aUneNote ? (
        <section className="controle-bilan">
          <p className="controle-bilan__note">
            <strong>{controle.note.toLocaleString('fr-FR', { maximumFractionDigits: 1 })}</strong>
            <span>/20</span>
          </p>

          {controle.ressenti && <p className="controle-bilan__ressenti">{controle.ressenti}</p>}
        </section>
      ) : passe && controle.ressenti ? (
        /* Pas de note, mais une phrase : c'est le récit de l'élève, ou la
           raison pour laquelle il n'y a rien à en dire. On ne rajoute
           SURTOUT PAS « note pas encore connue » par-dessus — il n'attend
           peut-être aucune note, il n'a simplement pas voulu en parler. */
        <section className="controle-bilan">
          <p className="controle-bilan__ressenti">{controle.ressenti}</p>
        </section>
      ) : passe && controle.bilanClos ? (
        /* Clos sans rien : soit le point a été fait sans qu'il en sorte quoi
           que ce soit, soit la question a été posée assez de fois. Dans les
           deux cas on le dit franchement, plutôt que de promettre une suite
           qui ne viendra pas. */
        <p className="controle-bilan__attente">Pas de bilan pour ce contrôle.</p>
      ) : passe ? (
        <p className="controle-bilan__attente">
          Quand tu veux, fais le point sur ce contrôle avec ton professeur
          de {controle.matiereLibelle}.
        </p>
      ) : (
        <>
          <BarrePreparation
            pourcent={preparation?.pourcent}
            perimetreConnu={preparation?.perimetreConnu ?? false}
          />

          {/* LE VERDICT DU PROFESSEUR, EN ENTIER ET DATÉ.
              Sur la carte, l'observation tient dans une infobulle ; ici elle
              est le cœur de la page — c'est la phrase qui dit à l'enfant quoi
              faire de son pourcentage. La date est écrite parce que le verdict
              ne périme pas : rien ne s'efface tout seul, et un enfant doit
              pouvoir voir que « prêt » date d'avant-hier. */}
          <div className="controle-pret">
            <PastillePret statut={preparation?.pretStatut} />

            {/* LA JUSTIFICATION EST CELLE DU PROFESSEUR, ET RIEN D'AUTRE.
                Le serveur a un temps composé un constat de repli à partir des
                notions — « il te reste à consolider X (54 %) ». Retiré sur la
                règle de Camara : on ne devine pas. Le statut et sa raison
                viennent de la même personne, et elle signe. */}
            {/* EN PARAGRAPHES, un par notion — voir JustificationProfesseur. */}
            {preparation?.pretObservation && (
              <JustificationProfesseur
                texte={preparation.pretObservation}
                signature={preparation.pretLe
                  ? ` — ton professeur, le ${jourControle(preparation.pretLe)}`
                  : null}
              />
            )}
          </div>
        </>
      )}

      </section>

      {notions.length > 0 && (
        <section className="controle-fiche__notions">
          <h2>
            {passe ? 'Ce qu’il y avait au programme' : 'Ce qu’il y a au programme'}
            <span className="controle-fiche__compte">
              {notions.length} notion{notions.length > 1 ? 's' : ''}
            </span>
          </h2>
          {/* UNE BARRE PAR NOTION, ET C'EST CE QUI DONNE SA RAISON D'ÊTRE À
              CETTE PAGE — voulu par Camara le 13/09/2026. Un pourcentage
              global dit où on en est ; il ne dit pas PAR QUOI continuer.
              Ici l'enfant voit d'un coup d'œil les deux notions qui traînent
              et celles qui sont tenues. */}
          <ul className="controle-notions">
            {notions.map((notion) => (
              <li key={notion.id} className="controle-notion">
                <div className="controle-notion__ligne">
                  <span className="controle-notion__libelle">{notion.libelle}</span>

                  <span className="controle-notion__etat">
                    {LIBELLE_ETAT[notion.etat] ?? notion.etat}
                    <span className="controle-notion__pourcent">{notion.pourcent} %</span>
                  </span>
                </div>

                <div
                  className="controle-notion__jauge"
                  role="progressbar"
                  aria-valuenow={notion.pourcent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${notion.libelle} : ${LIBELLE_ETAT[notion.etat] ?? notion.etat}`}
                >
                  <span
                    className={`est-${palierPreparation(notion.pourcent)}`}
                    style={{ width: `${notion.pourcent}%` }}
                  />
                </div>

                {/* CE QUE LA COPIE CORRIGÉE A MONTRÉ passe devant l'état
                    mesuré : c'est un fait daté, écrit par le professeur de
                    l'école, et c'est ce que l'enfant est venu voir. */}
                {notion.resultat && (
                  <span className={`controle-notion__resultat est-${notion.resultat}`}>
                    {notion.resultat === 'reussie' ? '✓ réussie au contrôle' : '✕ ratée au contrôle'}
                  </span>
                )}

                {/* VALIDÉE PAR UNE NOTE : l'enfant doit savoir que celle-là ne
                    bougera plus à l'impression — voulu par Camara le
                    13/09/2026, après une notion prouvée à 17,5/20 retombée
                    de 98 à 71 % le lendemain. Le résultat du contrôle, quand
                    il existe, reste prioritaire. */}
                {!notion.resultat && notion.valideeParMesure && (
                  <span className="controle-notion__resultat est-reussie">
                    ✓ validée par une note
                  </span>
                )}

                {!notion.resultat && !notion.valideeParMesure && notion.travailleeLe && (
                  <span className="controle-fiche__travaillee">
                    travaillée le {dateCourte(notion.travailleeLe)}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {controle.dernierePreparationLe && (
        <p className="controle-fiche__derniere">
          Dernière préparation le {dateCourte(controle.dernierePreparationLe)}
          {controle.nombrePreparations > 1 && ` · ${controle.nombrePreparations} séances en tout`}
        </p>
      )}

      {/* LE COURS DE L'ÉLÈVE — Camara, le 26/09/2026. Ici aussi, et pas
          seulement dans la fenêtre du contrôle : l'enfant qui n'avait pas son
          cahier sous la main en créant le contrôle l'ajoute plus tard, là où
          il vient préparer. Il sert aussi à la correction de la copie. */}
      {illustre && (
        <div className="cfi-separateur" aria-hidden="true"><span>✦</span></div>
      )}

      <section className="controle-fiche__cours">
        <CoursDuControle eleveId={eleveId} controleId={controle.id} />
      </section>

      </div>

      {ouverture && (
        <OuvertureSeance
          eleveId={eleveId}
          calme={calme}
          matiere={matieres.find((m) => m.id === controle.matiereId)
            ?? { id: controle.matiereId, profPrenom: 'Ton professeur' }}
          onAnnuler={() => setOuverture(null)}
          onOuvrir={(duree, casque) => navigate(
            `/eleves/${eleveId}/matieres/${controle.matiereId}/chat`
            + `?duree=${duree}&casque=${casque ? 1 : 0}`
            + `&mode=${ouverture}&controleId=${controle.id}`,
          )}
        />
      )}

      {sansForfait && <FenetreSansForfait onFermer={() => setSansForfait(false)} />}

      <div className="controle-fiche__actions">
        {!passe && (
          <button
            type="button"
            className="btn"
            onClick={() => lancer('controle')}
          >
            {illustre && <span className="cfi-bouton-icone" aria-hidden="true">🚀</span>}
            Préparer ce contrôle
          </button>
        )}

        {/* Passé, le contrôle ne se prépare plus : il se raconte. Le bilan
            s'ouvre par ce bouton, et seulement par lui. */}
        {passe && (
          <button
            type="button"
            className="btn"
            onClick={() => lancer('bilan')}
          >
            {illustre && <span className="cfi-bouton-icone" aria-hidden="true">💬</span>}
            Faire le point sur ce contrôle
          </button>
        )}

        <button type="button" className="btn-action btn-action--modifier" onClick={() => setEdition(true)}>
          <IconeCrayon />
          Modifier
        </button>

        <button type="button" className="btn-action btn-action--supprimer" onClick={() => setConfirmation(true)}>
          <IconeCorbeille />
          Supprimer
        </button>
      </div>

      </article>

      {edition && (
        <div className="modale" role="dialog" aria-modal="true" aria-label="Modifier le contrôle">
          <div className="modale__boite">
            <ControleForm
              eleveId={eleveId}
              matieres={matieres}
              jour={null}
              controle={controle}
              onEnregistre={() => { setEdition(false); charger(); }}
              onAnnule={() => setEdition(false)}
            />
          </div>
        </div>
      )}

      {confirmation && (
        <div className="modale" role="dialog" aria-modal="true" aria-label="Supprimer le contrôle">
          <div className="modale__boite">
            <h2 className="jour-detail__titre">Supprimer ce contrôle ?</h2>
            <p>
              Il disparaîtra de ton calendrier, avec tout ce qui avait été noté
              à son programme. Ton travail, lui, reste acquis.
            </p>

            <div className="modale__actions">
              <button type="button" className="btn-ghost" onClick={() => setConfirmation(false)}>
                Annuler
              </button>
              <button type="button" className="btn btn--compact btn--danger" onClick={supprimer}>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
