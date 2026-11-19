import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../lib/actions/authActions';
import { accepterConditions, getConditionsDuParent, getProfil } from '../lib/api/profilApi';
import { fermerSession } from '../lib/api/sessionEleveApi';
import { fermerSessionEleve, sessionEleve } from '../lib/storage/sessionEleve';
import Confidentialite from './Confidentialite';
import ConditionsVente from './ConditionsVente';
import './verrouConditions.css';

/**
 * LES CONDITIONS GÉNÉRALES, BLOQUANTES — Camara, le 08/11/2026 : « s'il n'accepte pas, on ne le laisse pas entrer, on le
 * déconnecte et on le redirige sur la page d'accueil ; quand il se connecte, on réaffiche la popup. À chaque mise à jour
 * des CGU, la popup devra apparaître ; une fois validée, plus rien jusqu'à la prochaine mise à jour. »
 *
 * LE SERVEUR DÉCIDE : `GET /profil` dit s'il reste à accepter, et la version en vigueur vit dans `ConditionsEnVigueur`.
 *
 * LES PAGES NE SONT PAS MONTÉES DERRIÈRE LA FENÊTRE, et pas pendant la vérification non plus : elles lanceraient leurs
 * appels, le tutoriel, un cours. D'où `children` absent tant qu'on ne sait pas.
 *
 * L'ENFANT — Camara, le 08/11/2026 : « si un enfant se connecte alors que son parent n'a pas accepté, un message : son parent
 * doit valider, sinon il ne pourra pas utiliser le site ». Il est bloqué comme son parent, mais il n'a rien à accepter : il
 * lit le message, réessaie quand c'est fait, ou quitte pour laisser son parent se connecter sur le même appareil. La
 * vérification se fait à l'ouverture du site : un cours déjà commencé n'est pas coupé par une nouvelle version.
 *
 * LES NOUVELLES CONDITIONS ET LES OFFRES PAR EMAIL — Min's, le 19/11/2026 : « les parents déjà inscrits vont devoir valider
 * les nouvelles CGV ». La fenêtre porte alors DEUX ACCORDS SÉPARÉS, comme le veut le RGPD : les conditions (et la politique
 * de confidentialité), obligatoires pour entrer, par le bouton « J'accepte les conditions » ; et une case à part, jamais
 * cochée d'avance et facultative, pour recevoir les offres par email. On entre sans la cocher. Elle n'est pas reproposée à
 * qui a déjà consenti (`offresEmail` de `GET /profil`), et rien n'est coché d'office.
 *
 * CE QUI NE BLOQUE PAS :
 * - UNE PANNE. Si le serveur ne répond pas, ou ne répond pas à temps, on laisse passer : personne ne doit être enfermé
 *   dehors par la vérification elle-même. `=== true` pour la même raison : une API plus ancienne que ce front ne bloque pas.
 * - LA PAGE DU SCANNER (`/scan/`). Le téléphone l'ouvre au milieu d'un cours, et le jeton du QR code est son autorisation.
 */
const SANS_VERROU = ['/callback', '/silent-renew'];
const sansVerrou = (chemin) => SANS_VERROU.includes(chemin) || chemin.startsWith('/scan/');
const ATTENTE_MAX_MS = 6000;

const LECTURES = {
  conditions: { titre: 'Conditions générales', Texte: ConditionsVente },
  confidentialite: { titre: 'Politique de confidentialité', Texte: Confidentialite },
};

function FenetreConditions({ premiereFois, proposerOffres, onAccepter, onRefuser, occupe, erreur }) {
  // `lecture` : le texte ouvert dans la fenêtre, ou rien. La case garde son état pendant la lecture.
  const [lecture, setLecture] = useState(null);
  const [offres, setOffres] = useState(false);

  const accepter = (
    <button
      type="button"
      className="btn btn--compact"
      disabled={occupe}
      onClick={() => onAccepter(proposerOffres && offres)}
    >
      J’accepte les conditions
    </button>
  );

  if (lecture) {
    const { titre, Texte } = LECTURES[lecture];
    return (
      <div className="modale" role="dialog" aria-modal="true" aria-labelledby="conditions-titre">
        <div className="modale__boite conditions-fenetre conditions-fenetre--lecture">
          <h2 id="conditions-titre" className="conditions-fenetre__titre">{titre}</h2>
          <div className="modale__corps"><Texte /></div>
          {erreur && <div className="alert">{erreur}</div>}
          <div className="modale__actions">
            <button type="button" className="btn-ghost" onClick={() => setLecture(null)}>Retour</button>
            {accepter}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modale" role="dialog" aria-modal="true" aria-labelledby="conditions-titre">
      <div className="modale__boite conditions-fenetre">
        <h2 id="conditions-titre" className="conditions-fenetre__titre">
          {premiereFois ? 'Avant de commencer' : 'Nos conditions générales ont été mises à jour'}
        </h2>
        <div className="modale__corps">
          <p className="conditions-fenetre__texte">
            {premiereFois
              ? 'Pour utiliser Mimia, merci de lire et d’accepter nos conditions générales de vente et d’utilisation, ainsi que notre politique de confidentialité.'
              : 'Nous avons mis à jour nos conditions générales de vente et d’utilisation et notre politique de confidentialité. Pour continuer à utiliser Mimia, merci de les lire et de les accepter.'}
          </p>
          <div className="conditions-fenetre__liens">
            <button type="button" className="btn-ghost conditions-fenetre__consulter" onClick={() => setLecture('conditions')}>
              Consulter les conditions
            </button>
            <button
              type="button"
              className="btn-ghost conditions-fenetre__consulter"
              onClick={() => setLecture('confidentialite')}
            >
              Consulter la politique de confidentialité
            </button>
          </div>

          {/* L'AUTRE ACCORD, À PART : facultatif, jamais coché d'avance, sans effet sur l'entrée. */}
          {proposerOffres && (
            <div className="conditions-fenetre__offres">
              <label className="conditions-fenetre__case">
                <input
                  type="checkbox"
                  checked={offres}
                  disabled={occupe}
                  onChange={(e) => setOffres(e.target.checked)}
                />
                <span>J’accepte de recevoir par email les offres et nouveautés de Mimia.</span>
              </label>
              <p className="conditions-fenetre__note">
                Facultatif : vous pouvez continuer sans cocher. Désinscription possible à tout moment.
              </p>
            </div>
          )}

          <p className="conditions-fenetre__note">
            Si vous refusez les conditions, votre session sera fermée et vous n’aurez pas accès au site. Cette fenêtre
            réapparaîtra à votre prochaine connexion. Pour résilier un abonnement, écrivez à{' '}
            <a href="mailto:support@mimia.fr">support@mimia.fr</a>.
          </p>
          {erreur && <div className="alert">{erreur}</div>}
        </div>
        <div className="modale__actions">
          <button type="button" className="btn-ghost" disabled={occupe} onClick={onRefuser}>Je refuse</button>
          {accepter}
        </div>
      </div>
    </div>
  );
}

function MessageEnfant({ onReessayer, onQuitter, occupe, erreur }) {
  return (
    <div className="modale" role="dialog" aria-modal="true" aria-labelledby="conditions-titre">
      <div className="modale__boite conditions-fenetre">
        <h2 id="conditions-titre" className="conditions-fenetre__titre">
          Ton parent doit valider nos nouvelles conditions
        </h2>
        <div className="modale__corps">
          <p className="conditions-fenetre__texte">
            Nous avons mis à jour les conditions générales de Mimia. Ton parent doit les accepter en se connectant à
            son compte. Sinon, tu ne pourras pas utiliser le site.
          </p>
          <p className="conditions-fenetre__note">Quand c’est fait, appuie sur « Réessayer ».</p>
          {erreur && <div className="alert" role="alert">{erreur}</div>}
        </div>
        <div className="modale__actions">
          <button type="button" className="btn-ghost" disabled={occupe} onClick={onQuitter}>Quitter</button>
          <button type="button" className="btn btn--compact" disabled={occupe} onClick={onReessayer}>Réessayer</button>
        </div>
      </div>
    </div>
  );
}

export default function VerrouConditions({ children }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { authentifie, loading } = useSelector((state) => state.auth);
  const { pathname } = useLocation();

  // La session de l'enfant passe avant celle du parent, comme pour les appels au serveur (voir `enTeteAuth`).
  const qui = sessionEleve() ? 'enfant' : authentifie ? 'parent' : null;

  // `pour` : la réponse appartient à celui pour qui on l'a demandée. Un enfant qui quitte sur l'appareil où son parent est
  // connecté ne doit pas lui laisser son verdict, même le temps d'un affichage.
  const [etat, setEtat] = useState({ pour: null, aAccepter: false, premiereFois: false, offresEmail: false });
  const [occupe, setOccupe] = useState(false);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    if (!qui) {
      setEtat({ pour: null, aAccepter: false, premiereFois: false });
      return undefined;
    }

    let vivant = true;
    const laisserPasser = () => {
      if (vivant) setEtat({ pour: qui, aAccepter: false, premiereFois: false });
    };
    const garde = window.setTimeout(laisserPasser, ATTENTE_MAX_MS);

    (qui === 'enfant' ? getConditionsDuParent() : getProfil())
      .then(({ data }) => {
        if (!vivant) return;
        window.clearTimeout(garde);
        setEtat({
          pour: qui,
          aAccepter: data?.conditionsAAccepter === true,
          premiereFois: data?.conditionsPremiereFois === true,
          offresEmail: data?.offresEmail === true,
        });
      })
      .catch(laisserPasser);

    return () => {
      vivant = false;
      window.clearTimeout(garde);
    };
  }, [qui]);

  if (sansVerrou(pathname)) return children;
  if (loading) return null;
  if (!qui) return children;
  if (etat.pour !== qui) return null;
  if (!etat.aAccepter) return children;

  if (qui === 'enfant') {
    const reessayer = async () => {
      setOccupe(true);
      setErreur(null);

      try {
        const { data } = await getConditionsDuParent();
        if (data?.conditionsAAccepter === true) setErreur('Ton parent n’a pas encore validé les conditions.');
        else setEtat({ pour: qui, aAccepter: false, premiereFois: false });
      } catch {
        setErreur('La vérification n’a pas marché. Réessaie dans un instant.');
      } finally {
        setOccupe(false);
      }
    };

    // Comme le bouton « Quitter » de la barre : la session se ferme côté serveur d'abord (voir `Navbar`).
    const quitter = async () => {
      setOccupe(true);
      setErreur(null);
      await fermerSession().catch(() => {});
      fermerSessionEleve();
      setOccupe(false);
      navigate('/');
    };

    return <MessageEnfant occupe={occupe} erreur={erreur} onReessayer={reessayer} onQuitter={quitter} />;
  }

  const accepter = async (offresEmail) => {
    setOccupe(true);
    setErreur(null);

    try {
      await accepterConditions({ offresEmail });
      setEtat({ pour: qui, aAccepter: false, premiereFois: false });
    } catch {
      setErreur('Votre accord n’a pas pu être enregistré. Vous pouvez réessayer ?');
    } finally {
      setOccupe(false);
    }
  };

  // Le bouton reste figé : la déconnexion quitte la page, et mène à l'accueil.
  const refuser = () => {
    setOccupe(true);
    dispatch(logout());
  };

  return (
    <FenetreConditions
      premiereFois={etat.premiereFois}
      proposerOffres={!etat.offresEmail}
      occupe={occupe}
      erreur={erreur}
      onAccepter={accepter}
      onRefuser={refuser}
    />
  );
}
