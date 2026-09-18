import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ouvrirConversation,
  envoyerMessage,
  resetChat,
  annoncer,
} from '../lib/actions/chatActions';
import {
  quitterCours, signalerFermeture, deposerPieceJointe, poserChoixCopie, getChoixCopie,
} from '../lib/api/chatApi';
import { mesurerVoix, nouvelleSeanceDeMesure } from '../lib/api/mesuresApi';
import {
  departDeLaSeance, ecouleDepuisLeDepart, oublierLeDepart,
} from '../lib/storage/departSeance';
import { chargerEleves } from '../lib/actions/elevesActions';
import { voixService } from '../lib/storage/voixService';
import {
  marquerCopieAuCahier,
  marquerCopieAuClavier,
  retirerMarqueurCahier,
} from '../lib/storage/copieCahier';
import {
  texteDicteDepuis,
} from '../lib/storage/comparaisonDictee';
import {
  carteDeChoixVisible,
  debutDeDictee,
  finDeDictee,
  tableauVerrouille,
} from '../lib/storage/etatDictee';
import { ecouteService } from '../lib/storage/ecouteService';
import { langueTranscription } from '../lib/storage/langueTranscription';
import { ecouteTempsReel, estUnTourDeParole } from '../lib/storage/ecouteTempsReel';
import { estUnEcho } from '../lib/storage/echo';
import { estIOS } from '../lib/storage/appareil';
import { estCommandePhoto } from '../lib/storage/commandePhoto';
import {
  etatCopieControle, lireDemandeCopie, marquerPieceControle, retirerMarqueurCopieControle,
} from '../lib/storage/copieControle';
import CopieControle from './CopieControle';
import {
  supportChoisi, marquerSupport, retirerMarqueurSupport, CAHIER,
  // RENOMMÉ À L'IMPORT : `copieRendue` existe déjà dans ce fichier, et c'est un
  // BOOLÉEN — « le professeur vient de rendre la note ». Sans cet alias, l'appel
  // plus bas tombait sur lui et levait « copieRendue is not a function ».
  copieRendue as copieEvaluationRendue,
} from '../lib/storage/supportEvaluation';
import SupportEvaluation from './SupportEvaluation';
import ScanMobileModale from './ScanMobileModale';
import { styleMatiere, murMatiere } from '../lib/couleurMatiere';
import scannerPng from '../assets/scanner.png';
import micFermePng from '../assets/mic_b.png';
import micOuvertPng from '../assets/mic_o.png';
import hautParleurPng from '../assets/haut_parleur.webp';
import { camera } from '../lib/storage/camera';
import { delaiAssemblage, doitAttendreAvantEnvoi } from '../lib/storage/tourEleve';
import { estUnSchema } from '../lib/storage/schemaSvg';
import {
  decouper,
  texteParle,
  contientDictee,
  contientCorrectionDictee,
  dicteeAbandonnee,
  dicteeSupprimee,
  dicteeAuTableau,
  extraireEcoutes,
  REPERE_DICTEE_ARCHIVEE,
  nettoyerArdoise,
  extraireArdoises,
  effaceLeTableau,
  evaluationOuverte,
  evaluationRendue,
  evaluationAbandonnee,
  aQuelqueChoseAMontrer,
  seanceClose,
  sembleDireAuRevoir,
  prendConge,
  demandeArret,
  demandeDocument,
} from '../lib/storage/ardoise';
import { getEvaluations, getCopieEvaluation, getDictee } from '../lib/api/elevesApi';
import Avatar from './Avatar';
import LignesCopie from './LignesCopie';
import { ContenuTableau, tableauDeDictee } from './ComparaisonDictee';
import { copieDeReference } from '../lib/storage/diffDictee';
import { estMatiereLangue } from '../lib/matieresLangues';
import {
  VITESSES, VITESSE_PAR_DEFAUT, carteVitesseVisible, estVitesseConnue,
} from '../lib/storage/vitesseEcoute';
import { demandeChoixVitesse, vitesseDemandee } from '../lib/storage/ardoise';
import {
  conversationEnCours, marquerVitesseChoisie, rangConversation,
  retirerMarqueurConversation,
} from '../lib/storage/conversationLangue';
import HorlogeReelle from './HorlogeReelle';
import Schema from './Schema';
import ZoomSchema from './ZoomSchema';
import {
  BoutonPieceJointe, VignetteEnAttente, PieceJointeBulle, TAILLE_MAX, PIECES_MAX, reduire,
} from './PieceJointe';
import CameraVoix from './CameraVoix';
import Loader from './Loader';
import Controle from './Controle';

/**
 * Affiche un message.
 *
 * Ce qui est écrit au tableau n'apparaît PAS dans le fil : il vit dans le
 * panneau à côté, où il reste visible. Le fil n'en garde qu'une pastille
 * cliquable — sinon un schéma remonterait hors de vue dès la phrase suivante,
 * exactement ce qu'un vrai tableau ne fait jamais.
 */
/**
 * Un clic sur le tableau, tel qu'il part au professeur.
 *
 * Le message est écrit POUR LUI, pas pour l'élève : il porte la zone, la clé de
 * la figure et les coordonnées. Affiché tel quel dans la conversation, ça
 * donnait un pavé technique avec « POINTAGE:hg-france-regions@53,27 » en clair
 * au milieu — l'enfant y lisait du charabia à la place de son propre geste.
 */
/*
 * Le motif s'arrête volontairement au jeton, PAS À LA FIN DU MESSAGE.
 *
 * Des blocs entre crochets s'ajoutent derrière — le nom de l'étiquette
 * calculée, et ce qui viendra après. Un `$` collé au jeton faisait échouer la
 * reconnaissance dès le premier ajout, et l'enfant retrouvait tout le pavé
 * technique dans sa propre bulle.
 */
const POINTAGE = /^\[L'élève montre un endroit de la figure.*POINTAGE:[a-z0-9-]+(?:\/muette)?@\d+,\d+\]/s;

function Contenu({ texte, onRappelerTableau }) {
  const segments = useMemo(
    () => decouper(retirerMarqueurConversation(
      retirerMarqueurSupport(retirerMarqueurCopieControle(retirerMarqueurCahier(texte))),
    )),
    [texte],
  );

  if (POINTAGE.test((texte ?? '').trim())) {
    return (
      <span className="bulle__geste">
        <span aria-hidden="true">◎</span> Tu as montré un endroit sur le schéma
      </span>
    );
  }

  return segments.map((segment, index) =>
    segment.type === 'ardoise' ? (
      <button
        key={index}
        type="button"
        className="rappel-tableau"
        onClick={() => onRappelerTableau?.(nettoyerArdoise(segment.contenu))}
      >
        <span aria-hidden="true">▦</span> Revoir ce qui est au tableau
      </button>
    ) : (
      <span key={index}>{segment.contenu}</span>
    ),
  );
}

/**
 * Durées de séance acceptées. Une valeur hors liste retombe sur 25 minutes.
 *
 * Le 6 est la séance de test, et il RESTE : son bouton n'est proposé qu'aux
 * comptes administrateurs, dans GrilleMatieres. Le retirer d'ici casserait les
 * séances de test sans rien protéger — une séance plus courte consomme moins
 * d'heures, pas plus.
 */
/**
 * Les durées qu'une adresse peut demander.
 *
 * 1 et 6 sont les séances de test de l'administration ; les quatre autres sont
 * celles qu'un parent choisit. La liste est ici parce que c'est ici qu'on s'en
 * sert pour valider le paramètre d'URL — une valeur inconnue retombe sur 25.
 *
 * Aucun risque à les laisser accessibles : une séance plus courte consomme
 * MOINS de quota. Un parent qui devinerait `?duree=1` ne s'accorderait rien,
 * il se priverait.
 */
const DUREES_VALIDES = [1, 6, 15, 25, 35, 45];

/**
 * Sous ce reste, le minuteur passe en « bientôt » à l'écran.
 *
 * Il déclenchait aussi une annonce parlée — le professeur disait « il nous
 * reste cinq minutes ». Elle a été retirée : le marqueur de temps voyage avec
 * chaque message de l'élève, le professeur le sait donc en permanence et le
 * place lui-même dans le fil de ce qu'il dit. L'annonce, elle, tombait
 * n'importe quand et répétait ce qu'il venait d'annoncer.
 *
 * Il ne reste que le signal visuel : il informe sans interrompre.
 */
const PREAVIS = 5 * 60;

/**
 * Dernier préavis : le professeur salue l'élève.
 *
 * C'est le seul moment où il clôt de sa propre initiative. Avant, le temps
 * restant appartient à l'élève, même s'il n'en reste que deux minutes.
 *
 * Trois secondes, et non trente : sur un quart d'heure, trente secondes
 * représentaient trois pour cent de la séance rendus avant l'heure, chaque
 * fois. Le temps est payé, il revient à l'élève jusqu'au bout.
 *
 * Conséquence assumée : l'au revoir se PRONONCE après le zéro. Entre le
 * déclenchement, la génération et la synthèse, il s'écoule une dizaine de
 * secondes — le minuteur affichera donc 00:00 pendant que le professeur parle
 * encore. C'est le bon sens de la chose : la politesse déborde, elle ne se
 * prend pas sur le cours. Rien ne se ferme brutalement derrière, le marqueur
 * de fin est posé au moment du déclenchement et empêche toute annonce de
 * partir par-dessus.
 *
 * Le seuil jumeau vit côté serveur, dans `MarqueurTemps` : c'est lui qui
 * s'applique quand c'est l'ÉLÈVE qui parle à la toute fin. Les deux doivent
 * bouger ensemble, sinon le professeur conclut encore à trente secondes dès
 * que l'élève dit un mot.
 */
const PREAVIS_FINAL = 3;

/**
 * En dessous de ce reste, un au revoir du professeur est accepté sans
 * corroboration.
 *
 * Le garde-fou sert à l'empêcher de voler des minutes payées ; à moins d'une
 * minute de la fin, il n'y a plus rien à voler, et le refuser produit une
 * seconde conclusion par le minuteur — ce qui est bien pire.
 */
const FIN_TOLEREE = 60;

/**
 * Le rab accordé à un contrôle qui déborde, en secondes.
 *
 * Dix minutes de dépassement, puis un avertissement, puis deux minutes de
 * plus. Le sursis ne peut pas être infini : un contrôle abandonné en cours
 * laisserait la séance ouverte indéfiniment, micro compris.
 */
const RAB_AVERTISSEMENT = 10 * 60;
const RAB_MAXIMUM = 12 * 60;

/**
 * Deux minutes avant la fin de la séance, on rappelle la copie — Camara, le
 * 18/09/2026.
 *
 * DEUX MINUTES ET PAS CINQ : le rappel doit laisser le temps de photographier
 * une page, pas celui de finir l'exercice. Trop tôt, il presse un élève qui
 * travaille encore ; trop tard, il arrive après la fin.
 *
 * UNE SEULE FOIS, jamais répété : « il ne fera qu'une fois ce rappel, c'est
 * tout ». Un contrôle n'est pas un endroit où l'on se fait harceler.
 */
const RAPPEL_COPIE = 2 * 60;

/** mm:ss, et hh:mm:ss au-delà de l'heure. */
function formaterDuree(secondes) {
  const h = Math.floor(secondes / 3600);
  const m = Math.floor((secondes % 3600) / 60);
  const s = secondes % 60;

  const deuxChiffres = (n) => String(n).padStart(2, '0');

  return h > 0
    ? `${h}:${deuxChiffres(m)}:${deuxChiffres(s)}`
    : `${deuxChiffres(m)}:${deuxChiffres(s)}`;
}

/**
 * Nombre d'écoutes sans un mot avant de rompre le mode mains libres.
 *
 * Vingt fenêtres de douze secondes, soit environ quatre minutes de silence
 * complet. C'était trois — une demi-minute — et c'était beaucoup trop court :
 * un élève peut rester deux minutes sur un problème sans dire un mot, et se
 * faire relancer pendant qu'il cherche est exactement ce qui casse la
 * concentration qu'on essaie de construire.
 *
 * Passé ce délai, il a vraiment quitté son bureau. On coupe le micro pour ne
 * pas le laisser ouvert indéfiniment — sans un mot, par un simple message à
 * l'écran.
 */
const SILENCES_AVANT_RELANCE = 20;

/**
 * Combien de pannes CONSÉCUTIVES de la liaison temps réel avant de se rabattre
 * sur le moteur du navigateur, pour le reste de la séance.
 *
 * Trois, parce que les deux situations à départager ne se ressemblent pas. Une
 * liaison morte — jeton refusé, pare-feu — échoue à chaque tentative, donc trois
 * fois en moins d'une seconde : on renonce vite, et l'élève parle. Un incident
 * passager échoue une fois puis passe : le compteur repart de zéro à
 * l'ouverture suivante et le cours n'en garde aucune trace.
 */
const ECHECS_AVANT_REPLI = 3;

/**
 * Combien de temps on reste sur le moteur du navigateur après un renoncement.
 *
 * LE REPLI ÉTAIT DÉFINITIF, ET C’ÉTAIT UN DÉFAUT COÛTEUX.
 *
 * Trois coupures de WebSocket — ce qui arrive à CHAQUE redémarrage de l'API,
 * donc à chaque déploiement — et l'élève finissait le cours sur la
 * reconnaissance vocale de Chrome. Même une fois le serveur revenu.
 *
 * Or ce moteur-là ÉMET UN SON à chaque démarrage et à chaque arrêt : c'est
 * une sonnerie du navigateur, qu’aucune option ne désactive. En mode mains
 * libres le micro se relance à chaque tour — et depuis qu’il reste ouvert
 * pendant les explications, ces sonneries tombent PENDANT que le professeur
 * parle. Des « bips intempestifs », exactement.
 *
 * Deux minutes : assez pour laisser passer un redéploiement, assez court
 * pour que la séance retrouve le temps réel sans recharger la page.
 */
const REPLI_MS = 120000;

/**
 * Délai avant de rouvrir le micro après que le professeur s'est tu.
 *
 * 300 ms suffit à éviter que deux reconnaissances démarrent dans la même
 * image — une pure question de séquencement JavaScript, sans rapport avec
 * le matériel.
 */
const DELAI_REOUVERTURE_MS = 300;

/**
 * Le même délai, mais sur iPhone/iPad ET sans casque.
 *
 * LE MICRO SE MET À CLIGNOTER, « TOUTES LES SECONDES », UNE FOIS SUR DEUX.
 * -------------------------------------------------------------------------
 * Relevé le 06/09/2026, uniquement sur iOS, uniquement en mode haut-parleur,
 * et seulement après que le professeur a fini de parler. Jamais sur Android.
 *
 * En haut-parleur, le micro est FERMÉ pendant toute l'explication — voir
 * `auDebutDeParole` — pour ne pas capter la voix du professeur. Dès qu'elle
 * se tait, on le rouvre. Mais la voix qu'on vient d'entendre est sortie par
 * un `AudioContext` (voir `voixService`) que rien ne suspend jamais : il
 * reste actif pour toute la séance, prêt à parler à nouveau.
 *
 * Rouvrir le micro, c'est demander à iOS de faire cohabiter DEUX usages du
 * son en même temps — la sortie qui vient de jouer, l'entrée qu'on réclame —
 * et iOS ne les fait pas cohabiter instantanément : il doit reconfigurer sa
 * session audio pour que le haut-parleur ET le micro restent actifs
 * ensemble. Sur Android, chaque appli a son propre flux ; sur iOS, un seul
 * partagé par tout le système, et la bascule prend un instant.
 *
 * 300 ms suffit quand cet instant est déjà passé, et ne suffit pas sinon —
 * d'où le « une fois sur deux » : ce n'est pas un hasard, c'est une course
 * contre une transition matérielle qu'on ne voit pas. Le micro échoue,
 * l'effet de réouverture retente 300 ms plus tard, retombe dans la même
 * course, et ça se répète : c'est le clignotement.
 *
 * ON NE SAIT PAS COMBIEN DE TEMPS IL FAUT, exactement — cela dépend du
 * modèle d'iPhone, de la version d'iOS. Un délai plus large ne supprime
 * donc pas la course, il la rend moins probable. Écarté sur Android et sur
 * iOS au casque, où le micro reste ouvert en permanence et ce délai ne
 * s'applique jamais : aucun autre appareil n'est concerné par ce chiffre.
 */
const DELAI_REOUVERTURE_IOS_HP_MS = 900;

/**
 * Cette transcription justifie-t-elle de couper la parole au professeur ?
 *
 * Deux caractères au moins. Une syllabe isolée arrachée au bruit de fond n'est
 * pas une prise de parole, et le moteur du navigateur en produit à chaque
 * redémarrage — soit toutes les huit secondes environ, puisqu'il se referme dès
 * que le silence dure.
 *
 * ELLE EXISTE PARCE QUE LA RÈGLE ÉTAIT ÉCRITE À UN SEUL ENDROIT SUR DEUX.
 * Le gardien vivait dans `onPartiel` ; `onFinal`, quatre lignes plus bas,
 * coupait sans rien vérifier. Les deux chemins mènent pourtant au même geste
 * irréversible. Une fonction nommée, appelée des deux côtés, rend l'oubli
 * visible : on ne peut plus en protéger un et pas l'autre sans le voir.
 */
const assezPourCouper = (texte) => (texte ?? '').trim().length >= 2;

/**
 * Ce qu'on affiche quand le forfait ne permet plus de travailler.
 *
 * Quatre situations, quatre messages. « Vous n'avez plus d'heures » là où le
 * problème est un abonnement en pause laisserait le parent chercher au mauvais
 * endroit — et l'enfant, lui, ne doit jamais se sentir en faute.
 */
function MessageQuota({ motif, prof }) {
  const textes = {
    PotEpuise: {
      titre: 'Les heures du mois sont utilisées',
      detail:
        "Tu as bien travaillé. Demande à tes parents d'ajouter des heures, ou reviens au renouvellement du forfait.",
    },
    PlafondEnfant: {
      titre: 'Tu as utilisé toutes tes heures du mois',
      detail:
        "Il reste des heures pour tes frères et sœurs, mais ta part est terminée. On se retrouve le mois prochain.",
    },
    TropDEnfants: {
      titre: 'La formule ne couvre pas ta place ce mois-ci',
      detail:
        "D'autres enfants de la famille travaillent déjà sur ce forfait. Tes parents peuvent passer à une formule plus large.",
    },
    EnPause: {
      titre: 'Le forfait est en pause',
      detail: 'Tes parents ont mis les cours en pause. Ils peuvent les reprendre quand ils veulent.',
    },
    SansAbonnement: {
      titre: 'Aucun forfait en cours',
      detail: 'Tes parents doivent choisir une formule pour que tu puisses travailler.',
    },

    // Le disjoncteur. Réglé si haut qu'aucun élève ne devrait jamais lire ce
    // texte — mais s'il le lit, il doit comprendre que ce n'est pas sa faute
    // et que ce n'est pas une punition. D'où « demain » plutôt qu'un délai
    // vague : il sait quand revenir.
    PlafondJetons: {
      titre: 'On arrête pour aujourd’hui',
      detail:
        "Tu as énormément travaillé aujourd'hui — plus que ce qu'une journée permet. Repose-toi, on reprend demain.",
    },
  };

  const { titre, detail } = textes[motif] ?? textes.SansAbonnement;

  return (
    <div className="fin-seance fin-seance--quota">
      <strong>{titre}</strong>
      <span>{detail}</span>
      <Link to="/profil" className="btn btn--compact">
        Voir le forfait
      </Link>
      {prof && <span className="fin-seance__signature">— {prof}</span>}
    </div>
  );
}

/**
 * L'ardoise : ce que le professeur a écrit, toujours sous les yeux.
 *
 * Nommée `ardoise` et non `tableau` : cette dernière classe désigne déjà les
 * tableaux de données de l'administration, et le panneau en héritait leur
 * bordure et leur fond — d'où son allure de simple carte.
 */
function Ardoise({ contenu, prof, onMontrer, copieReference = null }) {
  // Le tableau en grand. Une planche d'anatomie porte une douzaine de
  // légendes dans un panneau large comme un téléphone : lisible pour situer,
  // pas pour lire. L'agrandissement n'est donc pas un confort, c'est ce qui
  // rend la figure exploitable.
  const [agrandi, setAgrandi] = useState(false);

  /**
   * L'endroit montré, tenu ICI et non dans la figure.
   *
   * Il y a DEUX vues de la même figure — le panneau et le plein écran — donc
   * deux instances du composant. Tant que chacune gardait sa propre marque,
   * cliquer en grand la posait sur une vue qui se refermait aussitôt : le
   * professeur commentait un clic dont il ne restait aucune trace à l'écran, et
   * l'élève ne pouvait plus dire de quoi on parlait.
   *
   * Remis à zéro quand le tableau change : une marque survivante désignerait un
   * point sur une figure qui n'est plus là.
   */
  const [pointMontre, setPointMontre] = useState(null);
  useEffect(() => setPointMontre(null), [contenu]);

  // Échap referme, comme partout ailleurs. Sans ça, un élève au clavier reste
  // coincé dans la vue plein écran.
  useEffect(() => {
    if (!agrandi) return undefined;

    const auClavier = (evenement) => {
      if (evenement.key === 'Escape') setAgrandi(false);
    };

    // LE FOND NE DÉFILE PLUS PENDANT L'AGRANDISSEMENT.
    //
    // Sans ça, la molette traverse la vue plein écran et fait défiler la
    // conversation derrière : l'élève croit faire glisser le schéma, et c'est
    // le cours qui bouge. On rend la barre au démontage, y compris si le
    // composant disparaît autrement qu'en refermant.
    const debordementInitial = window.document.body.style.overflow;
    window.document.body.style.overflow = 'hidden';

    window.addEventListener('keydown', auClavier);

    return () => {
      window.document.body.style.overflow = debordementInitial;
      window.removeEventListener('keydown', auClavier);
    };
  }, [agrandi]);

  return (
    <aside className="ardoise" aria-label="Le tableau du professeur">
      <header className="ardoise__entete">
        <span className="ardoise__titre">Le tableau</span>
        {prof && <span className="ardoise__prof">écrit par {prof}</span>}

        {/* UN BOUTON QUI SE LIT, PAS UNE ICÔNE À DEVINER.
            Une double flèche dans un coin ne dit rien à un enfant de dix ans :
            il ne l'essaie pas, et il travaille sur une planche trop petite en
            croyant que c'est ainsi. Le mot fait ce qu'aucun pictogramme ne
            fait — il appelle le clic.

            SEULEMENT POUR UNE FIGURE. Un calcul ou une liste de mots à la craie
            n'a rien à gagner à l'agrandissement : le texte se lit déjà. Le
            proposer quand même apprendrait à l'élève que ce bouton ne sert à
            rien — et il ne l'essaierait plus le jour où une planche
            d'anatomie arrive. */}
        {contenu && estUnSchema(contenu) && (
          <button
            type="button"
            className="ardoise__agrandir"
            onClick={() => setAgrandi(true)}
          >
            {/* Une icône dessinée plutôt qu'un emoji : un emoji change de forme
                d'un système à l'autre — loupe grise sur Windows, jaune sur
                Android — et n'hérite pas de la couleur du texte. Ces quatre
                angles-là suivent la craie et gardent le même trait partout. */}
            <svg
              className="ardoise__agrandir-icone"
              viewBox="0 0 16 16"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M6 1.5H1.5v4.5M10 14.5h4.5v-4.5M1.5 10v4.5H6M14.5 6V1.5H10" />
            </svg>
            Agrandir le schéma
          </button>
        )}
      </header>

      {/* Le même composant rendu en grand, et non une image à part : un
          schéma de la bibliothèque comme un dessin du professeur passent par
          le même chemin, donc il n'y a qu'un rendu à maintenir.

          RENDU DANS `document.body`, PAS ICI.

          Sous 1040 px, l'ardoise devient collante avec `z-index: 10` — ce qui
          crée un CONTEXTE D'EMPILEMENT. Le `z-index: 70` de la vue plein écran
          ne valait alors que dans ce contexte, lui-même sous la barre de
          navigation : sur mobile, la croix de fermeture et le bandeau
          d'interaction se retrouvaient cachés derrière l'en-tête, et l'élève
          ne pouvait plus refermer la figure.

          Un portail sort la vue de toute la hiérarchie. Elle ne dépend plus
          d'aucun ancêtre — ni de celui-ci, ni de ceux qu'on ajoutera. */}
      {agrandi && contenu && createPortal(
        <div
          className="tableau-plein"
          role="dialog"
          aria-modal="true"
          aria-label="Le tableau en grand"
          onClick={() => setAgrandi(false)}
        >
          <div className="tableau-plein__surface" onClick={(e) => e.stopPropagation()}>
            {estUnSchema(contenu) ? (
              // Montrer marche AUSSI en plein écran, et c'est même là qu'on
              // vise le mieux : une carte de France dans un panneau de trois
              // cents pixels ne se pointe pas au doigt.
              //
              // Le zoom n'entoure QUE la figure, jamais le texte : un calcul à
              // la craie se lit déjà, et des commandes de zoom au-dessus d'une
              // liste de mots inviteraient à un geste sans effet.
              <ZoomSchema>
                {(zoome) => (
                  <Schema
                    contenu={contenu}
                    point={pointMontre}
                    onPoint={setPointMontre}
                    // ZOOMÉ, ON NE MONTRE PLUS : ON DÉPLACE.
                    //
                    // Les deux gestes se terminent de la même façon — un
                    // relâchement — et les départager aux pixels marchait mal.
                    // Tant qu'on est zoomé, la figure se promène ; revenu à
                    // 100 %, elle se pointe de nouveau.
                    // LA VUE RESTE OUVERTE.
                    //
                    // Elle se refermait au clic, du temps où la marque était
                    // interne à chaque instance : la garder ouverte aurait
                    // affiché le point en grand et laissé le panneau vierge.
                    // La marque est partagée maintenant, et refermer coûterait
                    // à l'élève tout ce qu'il vient d'obtenir — un schéma
                    // lisible pendant que le professeur lui en parle. Il
                    // montre, il écoute, il montre encore.
                    onMontrer={zoome ? undefined : onMontrer}
                  />
                )}
              </ZoomSchema>
            ) : (
              <ContenuTableau contenu={contenu} copieReference={copieReference} />
            )}
          </div>

          <button
            type="button"
            className="tableau-plein__fermer"
            onClick={() => setAgrandi(false)}
            aria-label="Fermer"
          >
            ×
          </button>
        </div>,
        document.body,
      )}

      {/* Le contenu est centré dans la surface plutôt que collé en haut à
          gauche : une figure de six lignes perdue dans un panneau qui fait
          toute la hauteur de l'écran donne l'impression d'un espace vide.

          UNE FIGURE N'A PAS BESOIN DES MÊMES MARGES QU'UN TEXTE. Du texte à la
          craie se lit mal collé au cadre ; une planche d'anatomie, elle, ne
          demande qu'à être grande — chaque pixel rendu à la marge est un mot de
          légende en moins. Le modificateur ne sert qu'à ça. */}
      <div className={contenu && estUnSchema(contenu)
        ? 'ardoise__surface ardoise__surface--figure'
        : 'ardoise__surface'}
      >
        {/* Une clé qui change avec le contenu : React remonte le bloc, et
            l'animation d'écriture rejoue à chaque fois que le professeur
            efface pour écrire autre chose. */}
        {/* Deux registres sur la MÊME surface, et non deux panneaux : un
            calcul reste du texte à la craie, un schéma devient un dessin. Le
            cadre, l'en-tête et le fond ne bougent pas — pour l'élève c'est le
            même tableau, le professeur y écrit ou y dessine. */}
        {contenu && estUnSchema(contenu) ? (
          <Schema
            contenu={contenu}
            key={contenu}
            onMontrer={onMontrer}
            point={pointMontre}
            onPoint={setPointMontre}
          />
        ) : contenu ? (
          // Une correction de dictée s'y affiche avec ses erreurs numérotées,
          // au même endroit des deux textes — voir `ComparaisonDictee`.
          <ContenuTableau contenu={contenu} copieReference={copieReference} key={contenu} />
        ) : (
          <p className="ardoise__vide">
            <span className="ardoise__craie" aria-hidden="true" />
            Ce que ton professeur écrit apparaîtra ici,
            <br />
            et y restera tant qu'il n'écrit pas autre chose.
          </p>
        )}
      </div>
    </aside>
  );
}

/**
 * Où survit l'état d'une dictée en cours, séance par séance.
 *
 * Hors du composant : une fonction recréée à chaque rendu compterait comme
 * dépendance des effets qui la lisent, et les relancerait sans cesse.
 */
const cleDictee = (id) => `school-ia-dictee-${id}`;

/**
 * UN ÉTAT DE DICTÉE SE PÉRIME, ET VITE.
 *
 * Il sert à survivre à un F5 — quelques secondes. Gardé sans limite, il
 * ressuscitait la dictée de la veille au début de la séance suivante :
 * panneau « Ta copie » ouvert d'office, question du support jamais posée, et
 * un professeur qui renvoie l'élève vers des boutons qui ne s'affichent pas.
 *
 * Deux heures : au-delà, l'enfant n'est plus devant le même écran, et
 * reposer la question vaut mieux que deviner à sa place.
 */
const VIE_ETAT_DICTEE = 2 * 60 * 60 * 1000;
export default function Chat() {
  const { eleveId, matiereId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { conversation, messages, reponseEnCours, streaming, loading, error, quota } =
    useSelector((state) => state.chat);
  const { liste } = useSelector((state) => state.eleves);
  const eleve = liste.find((e) => String(e.id) === String(eleveId));

  const [tableauRappele, setTableauRappele] = useState(null);
  const [saisie, setSaisie] = useState('');

  /**
   * LE CHAMP APPARTIENT À CELUI QUI L'A REMPLI.
   *
   * Relevé en séance, une fois sur deux : « j'écris et d'un coup tout s'efface
   * dans ce que j'ai écrit ». La voix et le clavier écrivent dans le MÊME
   * champ, et la voix ne regardait jamais ce qui s'y trouvait déjà. Un souffle,
   * un bruit de clavier, la voix du professeur dans le micro — n'importe quelle
   * transcription provisoire remplaçait la phrase en cours de frappe.
   *
   * Pire que l'effacement : le tour partait. Un envoi vide le champ, donc ce
   * qu'il tapait disparaissait ET une phrase qu'il n'avait pas dite partait au
   * professeur.
   *
   * Dès qu'il y a du texte TAPÉ dans le champ, la voix se met en retrait : elle
   * n'affiche plus, elle n'accumule plus, elle n'envoie plus. Quelqu'un qui tape
   * n'est pas en train de dicter, et le geste pour lui rendre la parole est
   * celui qu'il ferait de toute façon — vider le champ.
   *
   * Deux formes du même fait : l'état pour l'affichage, la ref pour les
   * rappels du micro, qui sont créés une fois et ne verraient jamais l'état
   * changer.
   */
  const [saisieTapee, setSaisieTapee] = useState(false);
  const saisieTapeeRef = useRef(false);

  /**
   * Le champ vient du clavier.
   *
   * On coupe aussi l'ÉMISSION du micro : garder les trois verrous sans cesser
   * d'envoyer le son reviendrait à payer des minutes de transcription pour un
   * texte qu'on jette. La liaison, elle, reste ouverte — sa consigne demande au
   * professeur de faire taper trois lettres quand une terminaison ne s'entend
   * pas, et rouvrir une session pour « ée » coûterait plus que l'économie.
   */
  const taper = (valeur) => {
    const tapee = valeur.trim().length > 0;
    saisieTapeeRef.current = tapee;
    setSaisieTapee(tapee);
    setSaisie(valeur);

    // Le moteur du navigateur, en repli, n'a pas de pause : d'où l'appel
    // facultatif. Les trois verrous, eux, valent pour les deux.
    ecouteRef.current?.suspendre?.(tapee);
  };

  /** Le champ est vidé : la voix reprend la main, et la parole aussi. */
  const viderSaisie = () => {
    saisieTapeeRef.current = false;
    setSaisieTapee(false);
    setSaisie('');
    ecouteRef.current?.suspendre?.(false);
  };

  // La copie du contrôle qui vient d'être rendu : l'identifiant pour la
  // récupérer, et son contenu quand l'élève l'ouvre.
  const [copieId, setCopieId] = useState(null);
  const [copie, setCopie] = useState(null);
  const [copieEnCours, setCopieEnCours] = useState(false);

  /**
   * ALLUMÉ PAR DÉFAUT, ET C’EST UN CHANGEMENT DU 04/09/2026.
   *
   * Le défaut était « éteint » : le mode ne s’allumait que si l’élève
   * l’avait activé une fois sur CET appareil. Invisible sur les machines
   * de test, où il l’avait été depuis longtemps ; flagrant sur un
   * téléphone neuf, où le micro restait fermé et où l’élève devait
   * cliquer avant chaque phrase — dans un produit dont toute la promesse
   * est de PARLER à un professeur.
   *
   * `!== '0'` ET NON `=== '1'` : la nuance est ce qui distingue « jamais
   * répondu » de « répondu non ». Celui qui a explicitement éteint le mode
   * garde son choix ; celui qui n’a jamais rien touché reçoit le défaut.
   * Tester l’égalité à `'1'` confondait les deux, au détriment du second.
   */
  const [mainsLibres, setMainsLibres] = useState(
    () => localStorage.getItem('school-ia-mains-libres') !== '0',
  );

  // Incrémenté chaque fois que le professeur se tait. C'est le signal qui
  // rend la parole à l'élève : un simple effet sur `streaming` ouvrirait le
  // micro pendant que la voix joue encore, et le professeur s'entendrait.
  const [tourDeParole, setTourDeParole] = useState(0);

  // Durée de la séance en cours. Repart de zéro à chaque entrée dans le
  // cours : c'est le temps de travail du moment qui intéresse l'élève, pas le
  // cumul depuis l'inscription.
  //
  // LU DÈS LE PREMIER RENDU, et pas seulement dans l'effet qui suit. Ce qui en
  // dépend — la séance est-elle déjà terminée ? — se décide avant que le
  // premier effet ne s'exécute. Partir de zéro puis corriger laissait une
  // fenêtre où la séance paraissait neuve, et l'au revoir repartait.
  //
  // `seance` vaut 1 au montage : c'est le numéro de la séance d'origine, celui
  // sous lequel le départ a été enregistré.
  const [secondes, setSecondes] = useState(
    () => ecouleDepuisLeDepart({ eleveId, matiereId, seance: 1 }),
  );

  // Numéro de la séance dans cette visite. Sert uniquement à faire repartir le
  // chronomètre quand l'élève en relance une : changer cette valeur suffit à
  // redémarrer l'effet, sans remonter tout le composant ni recharger la page.
  const [seance, setSeance] = useState(1);

  // Le document en attente d'envoi. Trois choses à retenir en même temps : le
  // fichier local (pour le nom, la taille et l'aperçu immédiat), son identifiant
  // une fois monté (c'est lui qui partira avec le message), et l'état du dépôt.
  // LES DOCUMENTS EN ATTENTE, dans l'ordre où l'élève les a ajoutés — Camara,
  // le 16/09/2026 : plusieurs photos ou fichiers, une liste, un seul envoi,
  // et le professeur a tout en tête d'un coup. Chaque entrée :
  // { cle, fichier, apercu, enCours, id, erreur }.
  const [piecesEnAttente, setPiecesEnAttente] = useState([]);

  // Image agrandie, ou null. Une visionneuse plutôt qu'un nouvel onglet : le
  // blob a une URL locale, et l'ouvrir ailleurs sortirait l'élève du cours.
  const [agrandie, setAgrandie] = useState(null);

  const [parametres] = useSearchParams();
  const dureeChoisie = Number(parametres.get('duree'));

  /**
   * L'élève a-t-il dit écouter sur un haut-parleur ?
   *
   * DANS L'ADRESSE, ET PAS DANS UN ÉTAT REACT : un rechargement de page en
   * plein cours — un enfant qui tire sur le câble, un téléphone qui met
   * l'onglet en veille — ferait sinon repartir la séance en duplex intégral
   * sur un appareil qui ne le supporte pas, sans que personne ne repose la
   * question.
   *
   * Le défaut est « avec casque » : c'est le comportement historique, et
   * c'est celui qu'on veut pour un lien ancien ou recopié à la main.
   */
  const sansCasque = parametres.get('casque') === '0';

  /**
   * Le contrôle que l'élève vient préparer, quand il est arrivé par
   * « Préparer ce contrôle » — le professeur ouvre alors dessus au lieu de le
   * proposer.
   *
   * DANS L'ADRESSE POUR LA MÊME RAISON QUE LE CASQUE : un F5 en plein cours ne
   * doit pas faire perdre le sujet de la séance. Le serveur revérifie qu'il
   * appartient bien à cet élève, dans cette matière ; un lien recopié ou
   * périmé est simplement ignoré.
   */
  const controleId = Number(parametres.get('controleId')) || null;

  /**
   * D'OÙ VIENT L'ÉLÈVE — 'controle', 'bilan', 'examen', ou rien pour un cours
   * normal — et l'épreuve préparée. Voulu par Camara le 14/09/2026 : le
   * professeur sait par quel bouton l'élève est entré, et ne parle que de ça.
   * Dans l'adresse pour la même raison que le contrôle ; le serveur revérifie.
   */
  const modeSeance = parametres.get('mode');
  const epreuveCode = parametres.get('epreuve');

  const dureeSeance = DUREES_VALIDES.includes(dureeChoisie) ? dureeChoisie : 25;

  const restant = Math.max(0, dureeSeance * 60 - secondes);

  // Un contrôle est-il commencé et non rendu ? On regarde le dernier message
  // du professeur, ou le flux en cours s'il est en train de parler.
  //
  // On remonte l'historique et on s'arrête au PREMIER marqueur rencontré :
  // trois le referment — la copie rendue, l'abandon, et rien d'autre — un seul
  // l'ouvre. L'abandon est le cas qui manquait : le serveur l'écrit dans un
  // message à lui seul, qui n'ouvrait ni ne fermait rien et se faisait donc
  // ignorer. On remontait jusqu'à l'ouverture restée béante, et l'indicateur
  // « Contrôle » ne s'éteignait plus jamais — avec, derrière, le rab de
  // dépassement accordé à tort et la séance qui refusait de se terminer.
  const evaluationEnCours = useMemo(() => {
    if (evaluationOuverte(reponseEnCours)) return true;
    if (evaluationRendue(reponseEnCours)) return false;

    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i].role !== 'assistant') continue;
      if (evaluationAbandonnee(messages[i].contenu)) return false;
      if (evaluationRendue(messages[i].contenu)) return false;
      if (evaluationOuverte(messages[i].contenu)) return true;
    }

    return false;
  }, [messages, reponseEnCours]);

  // Secondes écoulées au-delà du temps prévu.
  const depasse = Math.max(0, secondes - dureeSeance * 60);

  // Le rab est épuisé : on reprend la main. Une fois posé, l'état ne se
  // retire pas — sinon la fin du contrôle rouvrirait la séance.
  const [rabEpuise, setRabEpuise] = useState(false);

  // L'EXCEPTION DE DÉPASSEMENT. Le temps est écoulé, mais l'élève est au
  // milieu d'un contrôle : on laisse tourner. Le couper avant qu'il ait rendu
  // sa copie lui laisserait une note qui ne veut rien dire et le sentiment
  // d'avoir été sanctionné par une horloge.
  const depassement = restant === 0 && evaluationEnCours && !rabEpuise;

  /**
   * L'élève a demandé à s'arrêter, le professeur a dit au revoir.
   *
   * Le marqueur du professeur ne suffit PAS à fermer la séance : il lui est
   * arrivé de conclure de son propre chef avec près de quatre minutes au
   * compteur. Trois minutes perdues par séance, sur un abonnement, c'est du
   * temps payé qui n'est jamais rendu.
   *
   * On n'accepte donc l'adieu que dans deux cas :
   *   — l'application a déjà invité le professeur à saluer (les trente
   *     secondes, l'échéance, la clôture forcée d'un contrôle) ;
   *   — le dernier message de l'élève dit qu'il s'en va.
   *
   * Sinon le marqueur est ignoré, il est retiré de l'affichage comme les
   * autres balises, et le cours continue. Le professeur enchaînera au tour
   * suivant.
   *
   * On retient l'INDICE du message validé, pas un simple booléen. Un booléen
   * ne redescendait jamais : en rouvrant une séance close, l'historique
   * chargé portait l'ancien au revoir, la séance se verrouillait, et le
   * message d'accueil qui arrivait derrière ne la rouvrait pas — l'élève se
   * retrouvait salué par son professeur devant un clavier mort.
   */
  const [indexAdieu, setIndexAdieu] = useState(null);

  // Le dernier message du professeur. C'est lui seul qui compte : dès qu'il en
  // arrive un nouveau sans balise, la séance se rouvre d'elle-même.
  const indexDernierProf = useMemo(
    () => messages.map((m) => m.role).lastIndexOf('assistant'),
    [messages],
  );

  // La balise, OU un au revoir mutuel en toutes lettres — voir l'effet qui
  // valide l'adieu, plus bas : c'est lui qui a posé `indexAdieu`, et il ne le
  // fait que corroboré.
  const adieuFait =
    indexDernierProf !== -1
    && indexDernierProf === indexAdieu
    && (seanceClose(messages[indexDernierProf].contenu)
      || prendConge(messages[indexDernierProf].contenu));

  /**
   * LE PROFESSEUR VIENT DE DEMANDER UN DOCUMENT : LES DEUX BOUTONS S'ALLUMENT.
   *
   * Éteints tant que le tour actuel n'a rien demandé. Le trombone et la
   * caméra restent alors des icônes parmi d'autres — rien ne les distingue
   * quand rien ne les réclame.
   */
  const [docDemande, setDocDemande] = useState(false);

  /**
   * LA COPIE D'UN CONTRÔLE PASSÉ — voir `copieControle.js`. Lue dans les
   * messages à chaque rendu : un F5 retrouve la carte où elle en était.
   */
  /**
   * La réponse à « L'énoncé et ta copie sont-ils séparés ? », par contrôle.
   * ELLE NE VIT PAS DANS LES MESSAGES : un clic n'envoie rien au professeur —
   * voir `choisirCopie`. Posée au clic, relue sur le serveur après un F5.
   */
  const [choixCopie, setChoixCopie] = useState({});

  const etatCopie = useMemo(
    () => etatCopieControle(messages, choixCopie),
    [messages, choixCopie],
  );

  /**
   * SUR QUOI IL COMPOSE SON ÉVALUATION — Camara, le 18/09/2026.
   *
   * `null` veut dire « la question est posée, sans réponse » : c'est le
   * moment où la carte s'affiche. `undefined`, elle n'a jamais été posée.
   *
   * À NE PAS CONFONDRE AVEC `etatCopie` juste au-dessus, qui parle du
   * contrôle passé à l'ÉCOLE et dont on regarde la copie après coup. Ici,
   * c'est l'évaluation que le professeur fait passer MAINTENANT.
   */
  const support = useMemo(() => supportChoisi(messages), [messages]);

  /**
   * LA CARTE ATTEND : LES AUTRES CHEMINS D'ENVOI SONT FERMÉS.
   *
   * Voulu par Camara le 13/09/2026 : « tout ce qui est envoi de copie et
   * d'énoncé de contrôle doit forcément passer par cette question ». Tant que
   * la carte n'a pas tout reçu, le trombone, la caméra et le scanner généraux
   * sont désactivés — sinon la feuille partirait sans étiquette, et sans que
   * la question ait été posée.
   */
  const copieBloquante = Boolean(etatCopie && !etatCopie.complet);

  useEffect(() => {
    const contenu = indexDernierProf !== -1 ? messages[indexDernierProf]?.contenu : null;

    // UNE COPIE DE CONTRÔLE NE PASSE PAS PAR LE TROMBONE : si le message porte
    // [COPIE_CONTROLE], c'est la carte qui répond — le trombone ne s'allume pas.
    if (!demandeDocument(contenu) || lireDemandeCopie(contenu) !== null) {
      setDocDemande(false);
      return undefined;
    }

    setDocDemande(true);

    // LE TEXTE PEUT ÊTRE FINI SANS QUE LA VOIX LE SOIT : la synthèse lit en
    // retard sur ce qui s'affiche. Tant qu'il reste quelque chose en file —
    // `streaming` ou `estOccupe()` — les boutons restent en évidence.
    if (streaming || lecteurRef.current.estOccupe()) {
      const minuteur = setInterval(() => {
        if (!streaming && !lecteurRef.current.estOccupe()) {
          setDocDemande(false);
          clearInterval(minuteur);
        }
      }, 250);

      return () => clearInterval(minuteur);
    }

    return undefined;
  }, [messages, indexDernierProf, streaming]);

  /**
   * Les au revoir déjà REFUSÉS, par index de message.
   *
   * UN REFUS DOIT ÊTRE DÉFINITIF, ET IL NE L'ÉTAIT PAS.
   *
   * Cet effet se rejoue à chaque seconde — le temps restant est dans ses
   * dépendances. Un au revoir refusé à quatre-vingts secondes était donc
   * réexaminé soixante fois, et finissait par être ACCEPTÉ dès que le reste
   * passait sous le seuil de tolérance. La séance se fermait alors sur une
   * salutation prononcée une minute plus tôt, dans un contexte qui n'existait
   * plus : entre-temps l'élève avait répondu, et le professeur lui avait
   * répondu à son tour.
   *
   * Relevé en séance : le professeur salue à 1 min 20 en cours d'anglais, sa
   * consigne du moment lui disant « fais le bilan, ne dis pas encore au
   * revoir ». La séance s'est refermée avec du temps payé au compteur.
   *
   * On garde donc la décision. Ce qui a été jugé prématuré une fois le reste
   * pour toujours — c'est au professeur de saluer à nouveau quand l'heure sera
   * vraiment venue, et le minuteur l'y invite de lui-même à zéro.
   */
  const adieuxRefusesRef = useRef(new Set());

  useEffect(() => {
    if (indexDernierProf === -1 || indexDernierProf === indexAdieu) return;
    if (adieuxRefusesRef.current.has(indexDernierProf)) return;

    const contenu = messages[indexDernierProf].contenu;
    const balise = seanceClose(contenu);

    // L'AU REVOIR MUTUEL, MÊME SANS LA BALISE.
    //
    // Relevé par Camara le 11/09/2026 : « OK, à la prochaine » — « À bientôt
    // Bilal ! » — et la séance restait ouverte jusqu'à la fin du minuteur, le
    // professeur ayant oublié [FIN_SEANCE]. Deux personnes qui se sont dit au
    // revoir ont fini leur cours ; la balise n'est qu'un moyen de le savoir.
    //
    // Trois verrous, pour ne jamais fermer un cours par erreur :
    // - le professeur PREND CONGÉ en toutes lettres (`prendConge`, sans
    //   « salut », qui dit aussi bonjour) ;
    // - il répond DIRECTEMENT à l'élève — le message juste avant est le sien.
    //   À l'accueil, le message précédent est l'au revoir de la dernière fois,
    //   celui du professeur : rien ne peut se refermer sur une arrivée ;
    // - et ce message de l'élève annonce qu'il part.
    const repondDirectement = messages[indexDernierProf - 1]?.role === 'user';
    const conge = !balise && repondDirectement && prendConge(contenu);

    if (!balise && !conge) return;

    // Le message de l'élève auquel ce dernier tour répond.
    const question = messages
      .slice(0, indexDernierProf)
      .reverse()
      .find((m) => m.role === 'user');

    if (conge) {
      if (demandeArret(question?.contenu)) {
        setIndexAdieu(indexDernierProf);
        annoncesRef.current.fin = true;
      }

      // Un au revoir en mots que l'élève n'a pas demandé ne ferme rien — et
      // ne se condamne pas non plus : ce n'était peut-être qu'une formule.
      return;
    }

    // Troisième cas d'acceptation : il ne reste presque plus rien.
    //
    // Le garde-fou existe pour empêcher le professeur de voler des minutes
    // payées. À moins d'une minute de la fin, il n'y a plus rien à voler — et
    // refuser son au revoir coûte bien plus cher que de l'accepter : la séance
    // reste ouverte, le minuteur atteint zéro, et l'élève se fait dire au
    // revoir une seconde fois par l'annonce d'échéance.
    const presqueFini = restant > 0 && restant <= FIN_TOLEREE;

    if (annoncesRef.current.fin || presqueFini || demandeArret(question?.contenu)) {
      setIndexAdieu(indexDernierProf);

      // Plus aucune annonce derrière : les adieux sont dits.
      annoncesRef.current.fin = true;
      return;
    }

    adieuxRefusesRef.current.add(indexDernierProf);

    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[seance] Au revoir ignore : le professeur conclut de lui-meme alors que '
          + "l'eleve n'a rien demande et que le temps n'est pas ecoule. "
          + `Restant : ${restant} s.`,
      );
    }
  }, [messages, indexDernierProf, indexAdieu, restant]);

  // Le temps est écoulé : l'élève ne peut plus rien envoyer. Le professeur, lui,
  // termine sa conclusion — c'est la parole de l'élève qu'on ferme, pas la sienne.
  // Un forfait épuisé et un au revoir ferment la séance de la même façon.
  const seanceTerminee =
    quota !== null || adieuFait || (restant === 0 && (!evaluationEnCours || rabEpuise));

  // Doublon en référence : les rappels du micro se déclenchent hors rendu et
  // liraient sinon la valeur figée à la création de la fonction d'écoute.
  const seanceTermineeRef = useRef(false);

  // Le temps restant, en référence : il change chaque seconde, et le mettre
  // dans les dépendances de l'envoi recréerait la fonction soixante fois par
  // minute — jusque dans les écouteurs du micro.
  const restantRef = useRef(0);
  restantRef.current = restant;

  // Même raison que pour le chronomètre : `envoyerTexte` est aussi appelé par
  // la reconnaissance vocale, dont les rappels sont posés une fois pour toutes.
  // Le mettre dans les dépendances recréerait la fonction à chaque frappe, et
  // le micro enverrait son texte à une version périmée.
  const piecesRef = useRef([]);
  piecesRef.current = piecesEnAttente;

  // La caméra pilotée à la voix : capturer() prend la frame courante, et le
  // drapeau dit à l'effet plus bas d'envoyer le tour dès que la photo est
  // montée — sans lui, la photo resterait accrochée en attente d'un clic
  // que l'élève, qui vient de le demander à voix haute, ne fera jamais.
  const cameraRef = useRef(null);
  const autoEnvoiPhotoRef = useRef(false);

  /**
   * CE QUE LA PROCHAINE PIÈCE ENVOYÉE EST, quand elle part de la carte de
   * copie : `{ role: 'enonce' | 'copie', controleId }`. Consommée par
   * `envoyerTexte`, qui l'étiquette. Posée au moment du CHOIX du fichier, pas
   * du clic : un élève qui ouvre le sélecteur puis annule n'étiquette rien.
   */
  const rolePieceRef = useRef(null);

  /** La fenêtre du QR code du scanner est-elle ouverte ? */
  const [scanOuvert, setScanOuvert] = useState(false);
  const [confirmationPhoto, setConfirmationPhoto] = useState(false);

  /**
   * Une caméra est-elle branchée ? Sert au panneau de dictée au cahier :
   * le bouton « Prendre ma copie en photo » n'a rien à proposer sur un
   * appareil qui n'en a pas — la question n'est réglée qu'une fois, elle ne
   * change pas en cours de séance.
   */
  const [cameraDispo, setCameraDispo] = useState(false);

  useEffect(() => {
    let vivant = true;
    camera.disponible().then((oui) => { if (vivant) setCameraDispo(oui); });
    return () => { vivant = false; };
  }, []);

  /**
   * Les annonces déjà faites. Une référence, pas un état : un rendu tardif
   * remettrait un état à zéro, et l'annonce repartirait.
   *
   * ET ELLES SONT CONSIDÉRÉES COMME FAITES SI LA SÉANCE ÉTAIT DÉJÀ FINIE
   * AU CHARGEMENT DE LA PAGE.
   *
   * Une annonce marque le FRANCHISSEMENT d'un seuil pendant que l'élève est
   * là. Arriver sur une séance déjà terminée n'est pas un franchissement :
   * c'est un constat.
   *
   * Sans cette distinction, un rechargement sur une séance finie relançait
   * l'au revoir — le professeur disait « à bientôt » à chaque F5, et chaque
   * F5 était un appel au modèle facturé. Trois bulles identiques à la suite
   * l'ont montré, et rien n'empêchait d'en faire trois cents.
   */
  const annoncesRef = useRef(null);

  if (annoncesRef.current === null) {
    const dejaFinie = restant <= 0;

    annoncesRef.current = {
      preavisFinal: dejaFinie,
      fin: dejaFinie,
      clotureProche: dejaFinie,

      // Le rappel des deux minutes ne se rejoue pas sur une séance qu'on
      // rouvre : elle est déjà finie, la copie ne partira plus.
      copieAttendue: dejaFinie,
      clotureForcee: dejaFinie,
    };
  }

  const silencesRef = useRef(0);

  /**
   * Quel moteur d'écoute est en service.
   *
   * La transcription par le serveur est le mode normal : elle marche sur tous
   * les navigateurs — Firefox n'a aucune reconnaissance vocale — et sa
   * détection de fin de tour est réglable, contrairement au silence long et
   * figé du Web Speech.
   *
   * Le moteur du navigateur reste en repli. Le jour où la liaison échoue,
   * l'élève perd en fluidité, pas en usage.
   *
   * LA BASCULE N'EST PLUS DÉFINITIVE.
   * --------------------------------
   * Elle l'a été : un `tempsReelRef.current = false` à la première panne, et la
   * séance finissait sur le moteur du navigateur. Or celui-ci se referme de
   * lui-même après quelques secondes de silence et se rouvre aussitôt — le
   * micro clignote toutes les huit secondes, « je t'écoute » disparaît, et
   * l'élève croit que ça plante. Une coupure réseau d'une seconde suffisait à
   * lui infliger ça pour le reste de l'heure.
   *
   * On compte donc les échecs CONSÉCUTIFS, et une liaison qui s'ouvre remet le
   * compteur à zéro. Trois pannes d'affilée valent un renoncement ; trois
   * pannes réparties sur une heure ne valent rien du tout.
   *
   * Pourquoi une limite malgré tout : sans elle, une liaison définitivement
   * morte — un jeton refusé, un pare-feu — serait réessayée toutes les trois
   * cents millisecondes jusqu'à la fin du cours, sans que l'élève puisse jamais
   * parler.
   */
  /**
   * Depuis quand on est retombé sur le moteur du navigateur. 0 = jamais.
   *
   * Une DATE et non un booléen : c'est ce qui rend le repli temporaire.
   */
  const replriDepuisRef = useRef(0);
  const echecsTempsReelRef = useRef(0);

  // Le micro est disponible dès qu'UN des deux moteurs l'est. La transcription
  // par le serveur ne demande rien de plus qu'un micro et un WebSocket : c'est
  // ce qui débloque Firefox et Safari, où le Web Speech n'existe pas ou tient
  // mal le mode continu.
  const vocalDispo = ecouteTempsReel.supporte || ecouteService.supporte;
  const mainsLibresRef = useRef(mainsLibres);

  // L'élève a coupé l'écoute lui-même. Couper le micro juste après une
  // question, c'est vouloir réfléchir au calme : lui répondre « je n'ai rien
  // entendu » serait exactement le contraire de ce qu'il demande.
  const arretVolontaireRef = useRef(false);

  // Ce que le professeur vient de dire, et quand il s'est tu. Sert à
  // reconnaître sa propre voix si elle revient par le micro.
  const paroleProfRef = useRef({ texte: '', finLe: 0 });

  /**
   * Le professeur est-il en train de parler, à cet instant ?
   *
   * UNE RÉFÉRENCE ET NON UN ÉTAT : elle est lue depuis les rappels du
   * lecteur, qui ne sont pas rejoués au rendu. Un `useState` y renverrait la
   * valeur figée à la dernière exécution de l’effet.
   */
  const profParleRef = useRef(false);

  /**
   * Le micro est-il en pause parce que le professeur parle ?
   *
   * UN ÉTAT EN PLUS DE LA RÉFÉRENCE, et les deux sont nécessaires. La
   * référence sert aux rappels du lecteur, qui ne sont pas rejoués au
   * rendu ; l'état sert à l'écran, qu'une référence ne redessine jamais.
   *
   * Sans lui, l'onde bleue continuait d'annoncer « Je t'écoute… » pendant
   * une explication où le micro était fermé. Le pire mensonge possible :
   * l'élève parle dans le vide en croyant être entendu.
   */
  const [micEnPause, setMicEnPause] = useState(false);

  /**
   * Le professeur parle-t-il, quel que soit le mode ?
   *
   * DISTINCT DE `micEnPause`, qui ne vaut que sans casque. Celui-ci est vrai
   * dans les deux cas, parce que le bandeau doit rester à l’écran dans les
   * deux cas — seul son message change.
   *
   * Avec casque, le micro reste ouvert : l'élève peut couper la parole, et
   * c'est précisément ce qu'il faut lui dire à ce moment-là. Sans casque, le
   * micro est fermé et il doit attendre. Deux situations opposées, un seul
   * bandeau, deux phrases.
   */
  const [profParle, setProfParle] = useState(false);
  const [ecoute, setEcoute] = useState(false);

  /**
   * Un silence de dictée est en cours : l élève doit écrire.
   *
   * Vingt à quarante secondes sans un son ni un mouvement à l écran, c est
   * indiscernable d une panne pour un enfant de dix ans — il clique ailleurs
   * et la dictée s arrête. L attente est voulue, elle doit se voir.
   */
  const [pauseDictee, setPauseDictee] = useState(false);

  /**
   * LA RELECTURE COMPLÈTE, APRÈS LA DERNIÈRE PHRASE.
   *
   * `null` avant, `'en_cours'` pendant, `'finie'` ou `'interrompue'` après.
   * Dite par le service de voix, qui en tient l'écran au courant : un
   * bandeau pendant qu'elle se fait, puis le geste suivant mis en avant —
   * « Rendre ma copie » au clavier, la photo au cahier.
   *
   * JAMAIS UN VERROU. Sans voix — son coupé, synthèse en panne — il n'y a pas
   * de relecture du tout, et l'élève doit pouvoir rendre sa copie quand même.
   */
  const [relectureDictee, setRelectureDictee] = useState(null);
  const relectureTerminee = relectureDictee === 'finie' || relectureDictee === 'interrompue';

  /**
   * LA VITESSE DE LECTURE D'UN EXERCICE D'ÉCOUTE, CHOISIE PAR L'ÉLÈVE.
   *
   * Voulu par Camara le 12/09/2026 : avant chaque compréhension orale, quatre
   * boutons — très lent, lent, normal, rapide. Celui qui n'a rien compris
   * n'ose pas toujours demander qu'on ralentisse ; là, on le lui demande.
   *
   * `tourVitesseRef` retient le tour où le choix a été fait, `passageChoisiRef`
   * le texte de l'exercice : le professeur qui RELIT le même passage garde la
   * vitesse choisie, seul un passage inédit repose la question.
   */
  const [vitesseEcoute, setVitesseEcoute] = useState(VITESSE_PAR_DEFAUT);
  const vitesseEcouteRef = useRef(VITESSE_PAR_DEFAUT);
  const tourVitesseRef = useRef(null);
  const passageEcouteChoisiRef = useRef('');

  /**
   * Le décompte du délai que ressent l'élève, maillon par maillon.
   *
   * CE QU'ON MESURAIT NE COUVRAIT QU'UN CINQUIÈME DU CHEMIN.
   * -------------------------------------------------------
   * `delaiMs` va du texte affiché à la première syllabe entendue. Sur 759
   * mesures il est sain — médiane 699 ms. Mais l'élève attend jusqu'à cinq
   * secondes entre le moment où il se tait et celui où le professeur parle,
   * et le reste du chemin n'était pas mesuré du tout.
   *
   * Trois repères suffisent à le découper :
   *
   *   `silenceLe`  — l'instant où l'on clôt le tour de parole. C'est
   *                  `onSilence` : le navigateur vient de mesurer assez de
   *                  silence et envoie l'ordre de transcrire.
   *   `envoiLe`    — l'instant où le message part au serveur.
   *   et les deux durées qui en découlent.
   *
   * DANS UNE RÉFÉRENCE ET NON DANS UN ÉTAT : ces valeurs ne s'affichent nulle
   * part, et un rendu de plus par tour de parole pour une statistique serait
   * un mauvais échange.
   */
  const chronoRef = useRef({
    silenceLe: 0,
    envoiLe: 0,
    transcriptionMs: null,
    assemblageMs: null,
    reponseMs: null,
  });

  /**
   * La copie de DICTÉE en cours, quand elle se fait au clavier.
   *
   * Nommée `copieDictee` et non `copie` : ce dernier existe déjà, pour la
   * copie d un CONTRÔLE. Deux choses différentes, deux noms.
   *
   * `null` = pas de dictée au clavier. Un tableau = une dictée est en cours,
   * et chaque entrée est une phrase que l'élève a validée par Entrée.
   *
   * POURQUOI RIEN N'EST ENVOYÉ AVANT LA FIN
   * ---------------------------------------
   * Chaque message envoyé déclenche un tour du professeur. Dix phrases
   * validées, ce sont dix réponses — donc dix commentaires au milieu de la
   * dictée, et dix appels au modèle payés pour rien. Le professeur DOIT se
   * taire pendant qu'on écrit ; le seul moyen sûr de le garantir n'est pas de
   * le lui demander, c'est de ne rien lui envoyer.
   *
   * Les phrases s'accumulent donc ici, à l'écran, et partent en UN message
   * quand l'élève rend sa copie.
   */
  const [copieDictee, setCopieDictee] = useState(null);

  /**
   * Une dictée est en cours SUR LE CAHIER, et sa photo n'est pas arrivée.
   *
   * Le pendant exact de `copieDictee` pour l'autre support. Le clavier avait
   * son panneau et son bouton « Rendre ma copie » ; le cahier n'avait rien du
   * tout — une phrase dans la consigne du professeur, et c'est tout. D'où la
   * panne : l'élève dit « j'ai fini », et plus personne ne sait quoi faire de
   * cette phrase.
   *
   * Le cahier IMPOSE la photo : c'est le seul chemin par lequel l'orthographe
   * peut arriver jusqu'au professeur. La voix ne la porte pas — dire « fermée »
   * à voix haute ne dit pas combien de « e » on a écrits. Cet état existe donc
   * pour réclamer cette photo, à l'écran comme au professeur, tant qu'elle
   * manque.
   *
   * Il se referme sur l'envoi d'un document, jamais autrement : c'est le seul
   * événement qui prouve que la copie est arrivée.
   */
  const [cahierOuvert, setCahierOuvert] = useState(false);

  // Lu dans `envoyerTexte`, qui ne doit pas changer d'identité à chaque
  // ouverture de cahier : elle est en dépendance de l'écoute et de
  // l'assemblage, et les rebâtir couperait le micro au milieu d'une dictée.
  const cahierRef = useRef(false);
  useEffect(() => { cahierRef.current = cahierOuvert; }, [cahierOuvert]);

  /**
   * Comment l'élève écrit ses dictées : `null` tant qu'il n'a pas choisi,
   * puis `'cahier'` ou `'clavier'`.
   *
   * POURQUOI C'EST L'ÉCRAN QUI POSE LA QUESTION, ET PLUS LE PROFESSEUR
   * ------------------------------------------------------------------
   * Sa consigne le lui demandait, en tête de section, en capitales, avec la
   * mention « rien ne commence avant cette question ». Il ne l'a pas fait :
   * dans une séance où il avait déjà dicté deux fois sans demander, il a suivi
   * son propre précédent plutôt que la règle. C'est le comportement normal
   * d'un modèle de langue, et aucune formulation ne le rend fiable.
   *
   * UNE GARANTIE D'USAGE NE SE DEMANDE PAS, ELLE S'IMPOSE. Le même
   * raisonnement que pour les matières hors programme : le filtre d'interface
   * était un confort, ce qui interdisait devait être ailleurs. Ici la question
   * est posée par l'écran, avant que le premier mot ne soit prononcé — le
   * professeur n'a plus rien à décider.
   *
   * La question est reposée à CHAQUE dictée : voir `tourModeRef`.
   */
  const [modeDictee, setModeDictee] = useState(null);

  /**
   * UNE DICTÉE RESTE OUVERTE JUSQU'À SA CORRECTION, PAS JUSQU'À LA COPIE.
   *
   * Relevé le 11/09/2026 : l'élève rend sa copie sans avoir eu le temps de
   * retenir la dernière phrase, le professeur la relit — et l'écran, croyant
   * la dictée terminée puisque la copie était partie, redemandait « comment
   * veux-tu écrire ? » et repartait sur une copie vide. L'enfant perdait de
   * vue ce qu'il avait déjà écrit, au moment précis où il devait le compléter.
   *
   * Ce que la copie rendue signifie, c'est « j'ai fini d'écrire pour
   * l'instant » — pas « la dictée est finie ». Seule la correction la clôt.
   */
  const [dicteeOuverte, setDicteeOuverte] = useState(false);

  /**
   * Le prochain envoi EST une copie de dictée tapée au clavier.
   *
   * Posé par « Rendre ma copie » et consommé par l'envoi : c'est le seul
   * moment où l'écran peut affirmer au professeur qu'il a la copie entière
   * sous les yeux. Un tour plus tard, il ne le saurait plus.
   */
  const copieAuClavierRef = useRef(false);

  /**
   * OÙ COMMENCE LA DICTÉE EN COURS, dans le fil des messages.
   *
   * Sert à distinguer une dictée NEUVE d'une relecture de celle en cours :
   * on ne compare le passage qui arrive qu'à ce qui a été dicté depuis ce
   * repère. Il se pose au choix du support — c'est l'instant précis où une
   * dictée commence, et le seul que l'écran connaisse à coup sûr.
   */
  const debutDicteeRef = useRef(0);

  /**
   * UNE DICTÉE DOIT SURVIVRE À UN RECHARGEMENT DE PAGE.
   *
   * Tout ce qui la décrit — le support choisi, les lignes déjà tapées, le
   * fait qu'elle soit en cours — vivait en mémoire et en mémoire seulement.
   * Un F5, et il ne restait rien.
   *
   * Relevé le 11/09/2026 : l'élève rafraîchit sa page en pleine dictée,
   * demande au professeur de la redire, choisit le clavier — et se retrouve
   * avec un panneau « prends ta page en photo », sa phrase partie dans le fil
   * au lieu de sa copie, et une demande de photo alors qu'il n'a pas de
   * cahier. Trois symptômes, une seule cause.
   *
   * LE NAVIGATEUR EST LE SEUL À SAVOIR. La copie en cours n'est jamais
   * envoyée au serveur avant d'être rendue — c'est ce qui garantit que
   * l'élève ne souffle rien pendant qu'il écrit. Elle ne peut donc être
   * gardée que là.
   */

  /**
   * Vrai une fois l'état relu, et pas avant.
   *
   * Sans ce garde, l'effet d'écriture tournerait au premier rendu avec les
   * valeurs vides du départ et EFFACERAIT ce qu'on venait de sauver.
   */
  const dicteeRestauree = useRef(false);

  /** L identifiant seul : l objet `conversation` change d identité sans raison. */
  const seanceEnCours = conversation?.id ?? null;

  useEffect(() => {
    dicteeRestauree.current = false;
    if (!seanceEnCours) return;

    try {
      const brut = localStorage.getItem(cleDictee(seanceEnCours));

      const etat = brut ? JSON.parse(brut) : null;
      const perime = !etat?.quand || (Date.now() - etat.quand) > VIE_ETAT_DICTEE;

      if (perime) {
        // Trop vieux pour dire quoi que ce soit de l'écran d'aujourd'hui.
        localStorage.removeItem(cleDictee(seanceEnCours));
      } else {
        setModeDictee(etat.mode ?? null);
        setDicteeOuverte(Boolean(etat.ouverte));
        setCopieDictee(etat.copie ?? null);
        setCahierOuvert(etat.mode === 'cahier');
        debutDicteeRef.current = etat.debut ?? 0;
        tourModeRef.current = etat.tour ?? null;
      }
    } catch {
      // Navigation privée, quota, JSON abîmé : la dictée repart à zéro,
      // ce qui est exactement l'ancien comportement.
    }

    dicteeRestauree.current = true;
  }, [seanceEnCours]);

  useEffect(() => {
    if (!seanceEnCours || !dicteeRestauree.current) return;

    try {
      // Dictée close : la trace part avec elle. Sinon la prochaine séance
      // rouvrirait une copie qui n'a plus lieu d'être.
      if (!dicteeOuverte) {
        localStorage.removeItem(cleDictee(seanceEnCours));
        return;
      }

      localStorage.setItem(cleDictee(seanceEnCours), JSON.stringify({
        mode: modeDictee,
        ouverte: dicteeOuverte,
        copie: copieDictee,
        debut: debutDicteeRef.current,
        quand: Date.now(),
        tour: tourModeRef.current,
      }));
    } catch {
      // Le stockage peut refuser. Une dictée qui ne survit pas au F5 reste
      // préférable à une séance qui s'arrête.
    }
  }, [seanceEnCours, dicteeOuverte, modeDictee, copieDictee]);

  /**
   * Le tour de parole pour lequel le mode a été choisi.
   *
   * LA QUESTION SE REPOSE À CHAQUE NOUVELLE DICTÉE, pas une fois par séance.
   * Un élève peut prendre son cahier pour la première et taper la suivante,
   * ou l'inverse — c'est même le cas le plus courant quand il découvre les
   * deux modes.
   *
   * Le repère est le nombre de messages : il ne bouge pas pendant qu'une
   * dictée se déroule — le message du professeur n'est versé au fil qu'à la
   * fin de son flux — et il a forcément changé quand la suivante arrive,
   * puisqu'il a fallu au moins la demander. La carte ne peut donc ni
   * réapparaître au milieu d'une dictée, ni manquer au début de la suivante.
   */
  const tourModeRef = useRef(null);

  /**
   * Le repère d'un tour : le nombre de messages DE L'ÉLÈVE.
   *
   * PAS `messages.length`, ET C'EST TOUT LE PROBLÈME QU'ON CORRIGE ICI.
   *
   * Ce total change AU MILIEU d'une dictée : le message du professeur est
   * versé au fil à la fin de son flux, et le compte passe de L à L+1. La carte
   * de choix, qui comparait ce nombre, disparaissait donc toute seule au bout
   * d'une seconde — et le professeur enchaînait sans que l'élève ait choisi.
   *
   * Le nombre de messages de l'ÉLÈVE, lui, ne bouge pas pendant que le
   * professeur parle. Et il a forcément augmenté quand une nouvelle dictée
   * arrive, puisqu'il a fallu la demander. Les deux propriétés qu'on cherchait,
   * sans celle qui gênait.
   */
  const tourEleve = useMemo(
    () => messages.filter((m) => m.role !== 'assistant').length,
    [messages],
  );

  /**
   * La dictée du moment : celle qui arrive en flux, ou celle que le professeur
   * vient de finir d'écrire.
   *
   * LES DEUX SOURCES COMPTENT. Le texte vit d'abord dans `reponseEnCours`,
   * puis passe dans `messages` — et la voix a deux chemins, un par étape. Ne
   * regarder que le premier laissait le second jouer la dictée sans attendre
   * le choix.
   */
  const dicteeCourante =
    contientDictee(reponseEnCours)
    || (
      // ENCORE FAUT-IL QUE CE SOIT LE DERNIER MOT DE LA CONVERSATION.
      //
      // Sans cette condition, la carte revenait au pire moment : l'élève rend
      // sa copie, le professeur n'a pas encore répondu, et le dernier message
      // DU PROFESSEUR est toujours la dictée. On lui aurait redemandé comment
      // il voulait écrire une dictée qu'il vient de terminer.
      indexDernierProf === messages.length - 1
      && contientDictee(messages[indexDernierProf]?.contenu)
    );

  /**
   * Une dictée attend son mode : la voix est retenue tant que l'élève n'a pas
   * répondu.
   *
   * Sans cette retenue, le professeur commencerait à dicter pendant que la
   * question s'affiche — l'élève écouterait la première phrase en cherchant
   * son stylo, ou en cliquant sur un bouton.
   */
  /**
   * Une dictée attend son mode : la voix est retenue, et son message reste
   * masqué, tant que l'élève n'a pas répondu.
   *
   * LA DÉCISION EST SORTIE DU COMPOSANT — voir `etatDictee.js`. Elle a cédé
   * trois fois en une journée, chaque fois pour une condition oubliée, et
   * aucun test ne pouvait l'atteindre ici. Les quatre conditions sont
   * désormais éprouvées une par une.
   */
  const dicteeEnAttente = carteDeChoixVisible({
    dicteeCourante,
    tourDuMode: tourModeRef.current,
    tourEleve,
    copieOuverte: copieDictee !== null,
    dicteeOuverte,
  });
  /** Enregistre le choix de l'élève, pour cette dictée-ci. */
  const choisirModeDictee = (mode) => {
    tourModeRef.current = tourEleve;
    setDicteeOuverte(true);

    debutDicteeRef.current = debutDeDictee({
      dicteeDansLeFlux: contientDictee(reponseEnCours),
      nombreMessages: messages.length,
      indexDernierProf,
    });
    setModeDictee(mode);

    // La copie repart vide : celle d'une dictée précédente n'a rien à faire
    // dans celle-ci, et un mode « cahier » ferme le cahier à l'écran.
    setCopieDictee(mode === 'clavier' ? [] : null);

    // Et symétriquement : le cahier s'ouvre, en attente de sa photo.
    setCahierOuvert(mode === 'cahier');

    // La relecture de la dictée précédente ne dit rien de celle-ci.
    setRelectureDictee(null);
  };

  // La voix doit savoir sur quoi l'élève écrit : c'est ce qui décide de la
  // consigne dite après la relecture — la photo, ou « Rendre ma copie ».
  useEffect(() => {
    if (lecteurRef.current) lecteurRef.current.supportDictee = modeDictee;
  }, [modeDictee]);

  /**
   * Le passage d'écoute du moment — celui qui arrive en flux, ou celui que le
   * professeur vient de finir d'écrire. Les deux comptent, comme pour la
   * dictée : la voix a deux chemins, un par étape.
   */
  const passageEcoute = useMemo(() => {
    const enFlux = extraireEcoutes(reponseEnCours);
    if (enFlux) return enFlux;

    return indexDernierProf === messages.length - 1
      ? extraireEcoutes(messages[indexDernierProf]?.contenu)
      : '';
  }, [reponseEnCours, messages, indexDernierProf]);

  /**
   * LA VITESSE, EN CONVERSATION — Camara, le 18/09/2026 : « elle me demande
   * la vitesse, mais j’ai pas la fenêtre ».
   *
   * DEUX DÉFAUTS OPPOSÉS, ET IL FALLAIT LES RÉGLER ENSEMBLE.
   *
   * `carteVitesseVisible` attend un PASSAGE dans la langue pour s'afficher,
   * et repose la question dès qu'il est inédit. En compréhension orale c'est
   * exactement ce qu'il faut. En conversation, les deux moitiés tombent à
   * côté :
   *
   *   - au moment où le professeur DEMANDE la vitesse, il n'a encore rien dit
   *     dans la langue — pas de passage, donc pas de fenêtre. C'est ce que
   *     Camara a vu ;
   *   - et une fois la conversation lancée, chaque réplique est un texte
   *     inédit — la fenêtre serait revenue à chaque tour de parole.
   *
   * Ici, c'est donc l'OUVERTURE de la conversation qui pose la question, une
   * fois, sans attendre de passage ; et plus rien ensuite.
   */
  const enConversation = useMemo(
    () => conversationEnCours(messages, reponseEnCours),
    [messages, reponseEnCours],
  );

  // L'identité de la conversation en cours — voir `rangConversation`, où le
  // choix du RANG plutôt que de l'index est expliqué et vérifié.
  const ouvertureConversation = useMemo(
    () => rangConversation(messages, reponseEnCours),
    [messages, reponseEnCours],
  );

  // L’ouverture pour laquelle l’élève a déjà choisi. `undefined` tant qu’il
  // n’a rien choisi — jamais `null`, qui est une valeur possible ci-dessus.
  const vitesseConversationRef = useRef(undefined);

  const vitesseEnAttente = enConversation
    ? vitesseConversationRef.current !== ouvertureConversation
    : carteVitesseVisible({
      passageEcoute,
      passageChoisi: passageEcouteChoisiRef.current,
      tourDuChoix: tourVitesseRef.current,
      tourEleve,
    });

  /** Enregistre la vitesse choisie, pour cet exercice-ci. */
  const choisirVitesseEcoute = (cle) => {
    setVitesseEcoute(cle);
    tourVitesseRef.current = tourEleve;
    passageEcouteChoisiRef.current = passageEcoute;

    // EN CONVERSATION, LE CHOIX VAUT POUR TOUT L’ÉCHANGE : on retient
    // laquelle, pour ne plus reposer la question jusqu'à l'archivage.
    if (!enConversation) return;

    vitesseConversationRef.current = ouvertureConversation;

    // ET IL PART AU PROFESSEUR, sinon il attend un signal qui ne vient
    // jamais — voir `marquerVitesseChoisie`. En compréhension orale le clic
    // ne produit aucun tour, et c’est correct : le passage est déjà écrit.
    // Ici, rien ne se passait.
    envoyerTexte(marquerVitesseChoisie());
  };

  /**
   * L'ÉLÈVE CHANGE DE VITESSE EN PLEIN EXERCICE — Camara, le 16/09/2026.
   *
   * « Il peut choisir une vitesse et se rendre compte qu'elle n'est pas
   * adaptée » : il doit pouvoir en changer quand il veut, autant de fois qu'il
   * veut. C'est le professeur qui le signale, par une balise que l'élève ne
   * voit ni n'entend :
   *
   *   [VITESSE]        « change la vitesse » — la fenêtre se rouvre, il
   *                    choisit de nouveau.
   *   [VITESSE:lent]   « plus lent », « plus vite » — le professeur connaît le
   *                    débit en cours et pose le cran voisin. Pas de fenêtre :
   *                    l'élève a déjà dit ce qu'il voulait.
   *
   * LU PENDANT LE FLUX, et pas seulement sur le message terminé : le
   * professeur relit le passage DANS CE MÊME message, et la voix attend que la
   * question de vitesse soit réglée avant de prononcer quoi que ce soit. Poser
   * le choix trop tard laisserait partir la lecture à l'ancien débit.
   *
   * Une clé inconnue est ignorée : mieux vaut relire au débit en cours que
   * partir sur une valeur inventée par le modèle.
   */
  const vitesseTraiteeRef = useRef('');
  useEffect(() => {
    const texte = reponseEnCours
      || (indexDernierProf === messages.length - 1
        ? messages[indexDernierProf]?.contenu ?? ''
        : '');

    if (!texte) return;

    const cible = vitesseDemandee(texte);
    const rouvre = demandeChoixVitesse(texte);
    if (!cible && !rouvre) return;

    // Le même message arrive plusieurs fois — à chaque fragment du flux, puis
    // versé dans l'historique. Sans cette signature, la fenêtre se rouvrirait
    // juste après que l'élève a cliqué.
    const signature = `${indexDernierProf}|${cible ?? ''}|${rouvre}`;
    if (vitesseTraiteeRef.current === signature) return;
    vitesseTraiteeRef.current = signature;

    if (cible && estVitesseConnue(cible)) {
      setVitesseEcoute(cible);
      tourVitesseRef.current = tourEleve;
      passageEcouteChoisiRef.current = passageEcoute;
      return;
    }

    if (rouvre) {
      // Oublier le choix précédent SUFFIT à rouvrir la fenêtre : elle
      // s'affiche dès qu'un passage d'écoute n'a pas encore sa vitesse.
      tourVitesseRef.current = null;
      passageEcouteChoisiRef.current = '';
    }
  }, [reponseEnCours, messages, indexDernierProf, tourEleve, passageEcoute]);

  // LE PASSAGE GRANDIT PENDANT QUE LE PROFESSEUR ÉCRIT. Le choix a été fait
  // sur ses premiers mots ; sans cette mise à jour, la relecture du texte
  // ENTIER passerait pour un exercice inédit et reposerait la question.
  useEffect(() => {
    if (tourVitesseRef.current === tourEleve && passageEcoute) {
      passageEcouteChoisiRef.current = passageEcoute;
    }
  }, [passageEcoute, tourEleve]);

  // La voix lit les passages de la langue étudiée à cette vitesse-là.
  useEffect(() => {
    if (lecteurRef.current) lecteurRef.current.vitesseEcoute = vitesseEcoute;

    // ET DANS UNE RÉFÉRENCE, POUR L'ENVOI. Le professeur reçoit le débit en
    // cours avec chaque message de l'élève — sans quoi il ne saurait ni de
    // quel cran descendre, ni qu'il lit déjà au plus lent. Une référence, et
    // non l'état : la fonction d'envoi est mémorisée, et la lister dans ses
    // dépendances la ferait recréer à chaque changement de vitesse.
    vitesseEcouteRef.current = vitesseEcoute;
  }, [vitesseEcoute]);

  // En cours de langue, les tirets sont muets : le professeur ne dit pas
  // « moins » devant un tiret de ponctuation — voir `sansTiretsMuets`.
  useEffect(() => {
    if (lecteurRef.current) {
      lecteurRef.current.matiereLangue = estMatiereLangue(conversation?.matiereCode);
    }
  }, [conversation?.matiereCode]);

  /**
   * LA FIN D'UNE DICTÉE.
   *
   * La correction la clôt. Une AUTRE dictée la clôt aussi, corrigée ou non :
   * sans cela l'état de la précédente survivait à la suivante, qui héritait
   * d'un support que l'élève n'avait pas choisi. Voir `finDeDictee`.
   */
  useEffect(() => {
    if (!dicteeOuverte) return;

    const dansLeFlux = contientDictee(reponseEnCours);
    const arrivant = messages[indexDernierProf]?.contenu;

    const fin = finDeDictee({
      dicteeOuverte,
      correctionArrivee: contientCorrectionDictee(arrivant),
      // L'abandon est posé par le serveur dans un message à part, et
      // l'accueil du retour vient juste après : on le cherche donc dans tout
      // ce qui a suivi le début de la dictée, pas seulement au dernier mot.
      abandonArrive: messages
        .slice(debutDicteeRef.current)
        .some((m) => m.role === 'assistant'
          && (dicteeAbandonnee(m.contenu) || dicteeSupprimee(m.contenu))),
      passageArrivant: texteDicteDepuis([
        { role: 'assistant', contenu: dansLeFlux ? reponseEnCours : arrivant },
      ]),
      dejaDicte: texteDicteDepuis(messages.slice(
        debutDicteeRef.current,
        dansLeFlux ? messages.length : indexDernierProf,
      )),
      indexDernierProf,
      debutDictee: debutDicteeRef.current,
      dicteeDansLeFlux: dansLeFlux,
    });

    if (!fin) return;

    setDicteeOuverte(false);

    // Une dictée ABANDONNÉE — pour une autre, ou parce que l'élève est parti
    // avant de la rendre — referme aussi le cahier et la copie : la suivante
    // repart de zéro. Une dictée CORRIGÉE laisse l'écran tel quel — il n'y a
    // plus rien à y écrire de toute façon.
    if (fin === 'nouvelle' || fin === 'abandon') {
      setCopieDictee(null);
      setCahierOuvert(false);
      setRelectureDictee(null);
    }
  }, [dicteeOuverte, messages, indexDernierProf, reponseEnCours]);
  const [erreurMicro, setErreurMicro] = useState(null);

  /**
   * LA REPRISE APRÈS « OREILLE MORTE », RENDUE VISIBLE.
   *
   * `ecouteTempsReel` se remet en route toute seule huit secondes après
   * avoir cessé d'entendre — mais rien ne le disait à l'écran pendant ces
   * huit secondes : « Je t'écoute… » restait affiché sans changer, comme si
   * de rien n'était. Relevé : un élève qui répète la même phrase trois fois
   * de suite, croyant son micro coupé, pendant que l'appli attendait en
   * silence de son côté aussi. Les deux se taisaient chacun en pensant que
   * l'autre parlait.
   */
  const [oreilleMorte, setOreilleMorte] = useState(false);
  const oreilleMorteMinuteurRef = useRef(null);

  const signalerOreilleMorte = useCallback(() => {
    setOreilleMorte(true);

    if (oreilleMorteMinuteurRef.current) clearTimeout(oreilleMorteMinuteurRef.current);
    oreilleMorteMinuteurRef.current = setTimeout(() => setOreilleMorte(false), 4000);
  }, []);

  useEffect(() => () => {
    if (oreilleMorteMinuteurRef.current) clearTimeout(oreilleMorteMinuteurRef.current);
  }, []);

  const [sonBloque, setSonBloque] = useState(false);
  const [muet, setMuet] = useState(() => localStorage.getItem('school-ia-muet') === '1');

  const filRef = useRef(null);
  const lecteurRef = useRef(null);
  const luJusquaRef = useRef(0);
  const ecouteRef = useRef(null);

  if (lecteurRef.current === null) lecteurRef.current = voixService.creerLecteur();

  // ------------------------------------------------------------------ cycle
  useEffect(() => {
    // LA SÉANCE ÉTAIT-ELLE DÉJÀ FINIE QUAND LA PAGE S'EST CHARGÉE ?
    //
    // Seul le navigateur peut le dire : le serveur ignore la durée choisie et
    // l'heure de départ. Sans cette information, recharger une séance terminée
    // déclenchait un accueil — et un appel au modèle — à chaque F5.
    //
    // `restantRef` n'existe pas encore à ce stade du montage : on relit le
    // temps écoulé à la source, comme pour le chronomètre.
    const dejaFinie =
      ecouleDepuisLeDepart({ eleveId, matiereId, seance: 1 }) >= dureeSeance * 60;

    dispatch(ouvrirConversation(
      Number(eleveId), Number(matiereId), dejaFinie, dureeSeance, controleId,
      modeSeance, epreuveCode,
    ));
    if (liste.length === 0) dispatch(chargerEleves());

    const lecteur = lecteurRef.current;

    // Ouvrir la conversation, c'est trois requêtes enchaînées côté serveur,
    // puis la génération de l'accueil. On profite de ce temps mort pour sonder
    // la synthèse et ouvrir le graphe audio, au lieu de les payer au moment où
    // l'élève attend la première syllabe.
    if (!muet) lecteur.prechauffer();

    return () => {
      lecteur.arreter();
      ecouteRef.current?.arreter();
      dispatch(resetChat());
    };
  }, [dispatch, eleveId, matiereId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Qui parle, et à qui : chaque professeur a sa propre voix, et le débit
  // s'adapte à l'âge. Les deux arrivent de façon asynchrone, d'où l'effet.
  useEffect(() => {
    lecteurRef.current.configurer({
      avatar: conversation?.profAvatar,
      age: eleve?.age,
    });
  }, [eleve, conversation]);

  useEffect(() => {
    filRef.current?.scrollTo({ top: filRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, reponseEnCours]);

  /**
   * Recoller au bas du fil quand il RÉTRÉCIT.
   *
   * L'effet ci-dessus ne suit que le contenu, et c'est ce qui manquait : la
   * hauteur du fil change aussi toute seule. Quand quelque chose s'insère en
   * dessous et prend sa place, le bas de la conversation passe sous le bord
   * sans qu'un seul message n'ait bougé. On croit voir un recouvrement, c'est
   * un défilement qui manque.
   *
   * La barre « je t'écoute » fut le cas le plus visible ; elle ne l'est plus,
   * elle vit maintenant DANS le fil et défile avec les bulles. Restent
   * l'avertissement de son bloqué, le bandeau de quota, l'interrupteur mains
   * libres, une fenêtre redimensionnée.
   *
   * Un observateur de taille plutôt qu'une liste de dépendances : les énumérer
   * serait s'engager à ne jamais en oublier une.
   */
  useEffect(() => {
    const fil = filRef.current;
    if (!fil || typeof ResizeObserver === 'undefined') return undefined;

    // Sans animation ici : le déplacement accompagne un changement de mise en
    // page, il doit être déjà fait quand l'œil arrive.
    const observateur = new ResizeObserver(() => {
      fil.scrollTo({ top: fil.scrollHeight });
    });

    observateur.observe(fil);
    return () => observateur.disconnect();
  }, []);

  // ------------------------------------------------------------- tableau
  // Le dernier contenu écrit, qu'il vienne du flux en cours ou du dernier
  // message reçu. C'est ce qui reste affiché à côté de la conversation.
  const tableauAuto = useMemo(() => {
    // ON REMONTE JUSQU'AU PREMIER GESTE, ÉCRITURE OU EFFACEMENT.
    //
    // La gomme doit s'arrêter au même endroit que l'écriture, sinon elle ne
    // gomme rien : sans elle, la boucle continuait de remonter et retrouvait
    // l'exercice d'avant. C'est très exactement ce que voyait l'élève à qui on
    // venait d'annoncer « effacé ».
    const lire = (texte) => {
      // Une dictée archivée remise au tableau par son numéro : l'écran ira
      // chercher l'archive elle-même — voir `dicteeAuTableau`.
      const archivee = dicteeAuTableau(texte);
      if (archivee) return { valeur: `${REPERE_DICTEE_ARCHIVEE}${archivee}` };

      const trouves = extraireArdoises(texte);
      if (trouves.length > 0) return { valeur: trouves[trouves.length - 1] };
      if (effaceLeTableau(texte)) return { valeur: null };
      return null;
    };

    const enCours = lire(reponseEnCours);
    if (enCours) return enCours.valeur;

    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i].role !== 'assistant') continue;
      const geste = lire(messages[i].contenu);
      if (geste) return geste.valeur;
    }

    return null;
  }, [messages, reponseEnCours]);

  // Le professeur vient d'écrire : ce qu'il montre l'emporte sur ce que
  // l'élève avait rappelé d'un message plus ancien.
  useEffect(() => setTableauRappele(null), [tableauAuto]);

  /**
   * LE TABLEAU RESTE VIDE TANT QUE LA COPIE N'EST PAS RENDUE.
   *
   * Relevé le 11/09/2026 : le texte dicté écrit AU TABLEAU, en entier, face
   * à une copie à laquelle il manquait deux fins de phrase. À partir de là
   * il n'y a plus de dictée — l'enfant n'a qu'à recopier ce qu'il a sous les
   * yeux, et l'exercice ne mesure plus rien.
   *
   * La consigne le lui interdit déjà. Elle n'a pas suffi, comme elle n'avait
   * pas suffi pour la photo au cahier ni pour l'annonce avant le choix du
   * support. Une garantie d'usage ne se demande pas, elle s'impose : tant
   * que la dictée est ouverte, le tableau ne montre rien.
   *
   * Il se libère dès que la copie est rendue — tapée, ou arrivée en photo :
   * c'est là que le professeur y pose le texte dicté et, dessous, la copie
   * de l'élève, pour corriger devant les deux. Voir `tableauVerrouille`.
   */
  const tableauAffiche = tableauVerrouille({
    carteDeChoix: dicteeEnAttente,
    dicteeOuverte,
    copieClavierOuverte: copieDictee !== null,
    cahierEnAttente: cahierOuvert,
  })
    ? null
    : (tableauRappele ?? tableauAuto);

  /**
   * UNE DICTÉE ARCHIVÉE AU TABLEAU : on va chercher l'archive, telle que
   * « Mes dictées » la montre — texte dicté et copie d'origine. Gardée en
   * mémoire pour la séance : le tableau se redessine souvent, l'archive ne
   * change pas.
   */
  const [dicteesArchivees, setDicteesArchivees] = useState({});

  const idDicteeAuTableau = typeof tableauAffiche === 'string'
    && tableauAffiche.startsWith(REPERE_DICTEE_ARCHIVEE)
    ? Number(tableauAffiche.slice(REPERE_DICTEE_ARCHIVEE.length))
    : null;

  useEffect(() => {
    if (!idDicteeAuTableau || !eleveId || idDicteeAuTableau in dicteesArchivees) return;

    getDictee(eleveId, idDicteeAuTableau)
      .then(({ data }) => {
        setDicteesArchivees((c) => ({ ...c, [idDicteeAuTableau]: tableauDeDictee(data) }));
      })
      .catch(() => {
        // Introuvable — supprimée entre-temps, ou pas la sienne : le tableau
        // reste vide plutôt que d'afficher un repère technique.
        setDicteesArchivees((c) => ({ ...c, [idDicteeAuTableau]: null }));
      });
  }, [idDicteeAuTableau, eleveId, dicteesArchivees]);

  const contenuTableau = idDicteeAuTableau
    ? (dicteesArchivees[idDicteeAuTableau] ?? null)
    : tableauAffiche;

  // La vraie copie de l'élève, quand le professeur a écrit lui-même la
  // comparaison au tableau — voir `copieDeReference`. Une archive remise au
  // tableau porte déjà la sienne.
  const copieReference = useMemo(
    () => (idDicteeAuTableau
      ? null
      : copieDeReference(messages, contenuTableau, { retirerMarqueur: retirerMarqueurCahier })),
    [messages, contenuTableau, idDicteeAuTableau],
  );

  // -------------------------------------------------------- mains libres
  useEffect(() => {
    mainsLibresRef.current = mainsLibres;
  }, [mainsLibres]);

  // Chronomètre de séance. Calculé à partir de l'heure de départ plutôt qu'en
  // incrémentant un compteur : un onglet mis en arrière-plan voit ses timers
  // ralentis par le navigateur, et le décompte dériverait.
  useEffect(() => {
    // Forfait refusé : aucune séance n'a lieu, donc aucun temps ne s'écoule.
    // Laisser le décompte tourner à côté d'un « les cours sont en pause »
    // donnait l'impression que le temps payé filait pendant le blocage.
    //
    // Après l'au revoir, même raison : ils se sont dit au revoir, plus rien
    // ne se passe, le compteur n'a plus de sens.
    if (quota || adieuFait) return undefined;

    // LE DÉPART SURVIT AU RECHARGEMENT.
    //
    // Il valait `Date.now()` — donc l'instant du montage. Un F5 remettait le
    // chronomètre à zéro, et avec lui le temps restant annoncé au professeur :
    // il cessait de conclure, la séance terminée redevenait en cours, et
    // l'évaluation des compétences ne se déclenchait jamais.
    //
    // Relancer une séance change `seance`, ce qui remet bien le compteur à
    // zéro : on distingue « je rafraîchis » de « je recommence ».
    const depart = departDeLaSeance({ eleveId, matiereId, seance });

    // Recalé tout de suite : sans ça, l'affichage montre zéro pendant une
    // seconde avant que le battement ne le corrige — assez pour qu'un élève
    // qui recharge croie avoir retrouvé une séance entière.
    setSecondes(Math.floor((Date.now() - depart) / 1000));

    const battement = setInterval(
      () => setSecondes(Math.floor((Date.now() - depart) / 1000)),
      1000,
    );

    return () => clearInterval(battement);
  }, [eleveId, matiereId, seance, quota, adieuFait]);

  // L'au revoir clôt la séance côté serveur, exactement comme le bouton
  // « Quitter le cours » : c'est ce marqueur qui déclenche l'évaluation des
  // compétences. Sans lui, une séance terminée par un adieu ne serait analysée
  // qu'au balayage périodique, une demi-heure plus tard.
  const sortieSignalee = useRef(false);

  useEffect(() => {
    if (!adieuFait || streaming || !conversation || sortieSignalee.current) return;

    sortieSignalee.current = true;
    quitterCours(conversation.id).catch(() => {
      // Sans importance : le balayage périodique rattrapera la séance.
    });
  }, [adieuFait, streaming, conversation]);

  /**
   * L'élève ferme son onglet sans cliquer sur « Quitter le cours ».
   *
   * C'est le cas le plus fréquent : un enfant ferme la fenêtre, éteint la
   * tablette, ou passe à autre chose. Le serveur ne l'apprenait alors qu'au
   * balayage périodique — une demi-heure de séances qui s'accumulent, et une
   * analyse tardive.
   *
   * `pagehide` PLUTÔT QUE `beforeunload` : le second ne se déclenche pas de
   * façon fiable sur mobile, où l'application passe en arrière-plan sans être
   * « déchargée ». `pagehide` couvre les deux, y compris le retour arrière.
   *
   * Le drapeau `sortieSignalee` est partagé avec l'effet du dessus : une séance
   * conclue par un au revoir puis fermée ne doit pas être signalée deux fois.
   */
  useEffect(() => {
    if (!conversation) return undefined;

    const auDepart = () => {
      if (sortieSignalee.current) return;

      sortieSignalee.current = true;
      signalerFermeture(conversation.id);
    };

    window.addEventListener('pagehide', auDepart);
    return () => window.removeEventListener('pagehide', auDepart);
  }, [conversation]);

  // Une copie vient d'être rendue : on récupère son identifiant pour que
  // l'élève puisse la télécharger. C'est le serveur qui l'a créée en lisant le
  // bloc du professeur, donc il faut la lui redemander.
  const dernierMessage = messages[messages.length - 1];
  const copieRendue = !streaming
    && dernierMessage?.role === 'assistant'
    && evaluationRendue(dernierMessage.contenu);

  useEffect(() => {
    if (!copieRendue || !eleveId) return;

    let vivant = true;

    getEvaluations(eleveId)
      .then(({ data }) => {
        if (vivant && data?.length) setCopieId(data[0].id);
      })
      .catch(() => {
        // Sans identifiant, pas de bouton de téléchargement. L'élève a quand
        // même entendu sa note, et la copie reste dans sa fiche.
      });

    return () => {
      vivant = false;
    };
  }, [copieRendue, eleveId]);

  const ouvrirCopie = async () => {
    if (!copieId) return;

    setCopieEnCours(true);
    try {
      const { data } = await getCopieEvaluation(eleveId, copieId);
      setCopie(data);
    } finally {
      setCopieEnCours(false);
    }
  };

  // Le temps vient de tomber à zéro : on ferme le micro. `arretVolontaire`
  // évite le « je n'ai rien entendu » — ce n'est pas une panne, c'est la fin.
  useEffect(() => {
    seanceTermineeRef.current = seanceTerminee;
    if (!seanceTerminee) return;

    arretVolontaireRef.current = true;
    ecouteRef.current?.arreter();
    setEcoute(false);
  }, [seanceTerminee]);

  // Le lecteur prévient quand il s'est tu : c'est le moment de rouvrir le micro.
  useEffect(() => {
    const lecteur = lecteurRef.current;

    lecteur.auSilence = () => {
      paroleProfRef.current.finLe = Date.now();

      // SANS CASQUE, LE MICRO REVIENT ICI — et nulle part ailleurs. C'est
      // la seconde moitié du demi-duplex : la première ferme, celle-ci
      // rouvre, et le tour de parole redevient celui de l'élève.
      profParleRef.current = false;
      setMicEnPause(false);
      setProfParle(false);

      // IL NE SE ROUVRE PLUS : IL N'AVAIT PAS ÉTÉ FERMÉ.
      //
      // Le temps réel est resté ouvert et sourd pendant l'explication (voir
      // `auDebutDeParole`) : il suffit de lui rendre l'oreille, et il écoute
      // à l'instant même. Si l'élève est en train de taper, SA pause continue
      // — lever la surdité ne doit pas lever le clavier.
      //
      // Le moteur du navigateur, lui, a bien été fermé : c'est l'effet de
      // réouverture qui en crée un neuf, au tour suivant.
      arretVolontaireRef.current = false;
      ecouteRef.current?.suspendre?.(saisieTapeeRef.current);

      setTourDeParole((n) => n + 1);
    };

    // LE DEMI-DUPLEX, ET POURQUOI IL N'EST PAS LE DÉFAUT.
    //
    // Le micro reste normalement ouvert pendant que le professeur parle :
    // c'est ce qui permet de l'interrompre, et l'interruption est la moitié
    // de ce qui fait un cours vivant. On ne la retire qu'à ceux qui ne
    // peuvent pas en profiter.
    //
    // Sur un haut-parleur, ce micro ouvert capte la voix du professeur, la
    // transcrit et la lui renvoie comme une interruption : il se coupe
    // lui-même, indéfiniment. `estUnEcho` rattrape le cas en aval, mais
    // APRÈS coup — il coupe alors le mode mains libres, ce qui règle la
    // boucle en supprimant le dialogue. Fermer le micro à la source règle
    // le même problème sans rien retirer.
    lecteur.auDebutDeParole = () => {
      profParleRef.current = true;
      setProfParle(true);

      // UNIQUEMENT EN MAINS LIBRES.
      //
      // Hors de ce mode, le micro ne s’ouvre que sur un clic délibéré de
      // l’élève : le fermer d’office annulerait son geste, et il devrait
      // recliquer sans comprendre pourquoi. C’est aussi la seule situation où
      // la réouverture automatique existe pour le rallumer ensuite.
      if (sansCasque && mainsLibresRef.current) {
        setMicEnPause(true);

        // LE MICRO RESTE OUVERT, MAIS SOURD — décision de Camara du
        // 13/09/2026, qui renverse le choix précédent de le FERMER.
        //
        // Le fermer réglait l'écho, et coûtait la première phrase de l'élève
        // à CHAQUE tour. La réouverture reconstruisait tout — liaison, micro,
        // contexte audio, programme de capture — pendant qu'à l'écran
        // « Je t'écoute… » s'affichait déjà : l'enfant répondait dès que le
        // professeur se taisait, et tout ce qu'il disait avant que la capture
        // tourne n'était jamais enregistré. « Les premières phrases que je
        // dis ne sont jamais prises en compte. »
        //
        // `suspendre(true, false)` règle l'écho sans rien fermer : pendant que
        // le professeur parle, ce que capte le micro n'est ni envoyé, ni gardé
        // — la réserve est jetée à la reprise (voir `microPendantExplication`).
        // À l'instant où il se tait, le micro écoute DÉJÀ.
        //
        // LE MOTEUR DU NAVIGATEUR, EN REPLI, N'A PAS DE PAUSE : lui seul est
        // encore fermé. Il ne sait pas être sourd, et le laisser ouvert sur un
        // haut-parleur rouvrirait la boucle d'écho.
        if (ecouteRef.current?.suspendre) {
          ecouteRef.current.suspendre(true, false);
        } else {
          arretVolontaireRef.current = true;
          ecouteRef.current?.arreter();
          setEcoute(false);
        }
      }
    };

    // Le navigateur exige une interaction avant de jouer un son. En arrivant
    // par un clic il n'y a pas de problème ; en rechargeant la page sur
    // l'URL du cours, si.
    lecteur.surBlocage = () => setSonBloque(true);

    // CE QUE L'ÉLÈVE A VÉCU, REMONTÉ AU SERVEUR.
    //
    // Les deux chiffres qu'on ne pouvait pas avoir autrement : combien de temps
    // il a attendu la première syllabe, et si la voix qu'il a entendue était
    // bien celle du professeur. Le second compte autant que le premier — un
    // repli sur la voix du navigateur SONNE robotique, et c'est précisément le
    // reproche qu'on cherche à mesurer.
    //
    // Nouveau tirage à chaque montage : une séance, un identifiant, qui ne
    // désigne personne.
    nouvelleSeanceDeMesure();
    // LE TOUR ENTIER PART EN UNE SEULE MESURE.
    //
    // Les quatre durées appartiennent au même tour de parole : les envoyer
    // séparément obligerait à les recoller en base, et une ligne par maillon
    // rendrait impossible de dire « CE tour-là a duré cinq secondes, et voici
    // où elles sont passées ».
    lecteur.surDelai = (delaiMs) => {
      const c = chronoRef.current;
      mesurerVoix({
        delaiMs,
        transcriptionMs: c.transcriptionMs,
        assemblageMs: c.assemblageMs,
        reponseMs: c.reponseMs,
      });

      c.transcriptionMs = null;
      c.assemblageMs = null;
      c.reponseMs = null;
    };

    lecteur.surRepli = () => mesurerVoix({ repli: true });

    // Une vraie coupure réseau en plein passage : le professeur a déjà
    // commencé à parler, puis plus rien, sans que l'élève sache pourquoi.
    // Le même canal que les autres soucis de voix — il n'y a pas besoin
    // d'un second type de bandeau pour un problème de plus.
    lecteur.surCoupure = () => {
      setErreurMicro(
        'Le professeur a été coupé par un problème de connexion en plein milieu '
        + 'de sa phrase. Redis-lui ce qui te manque, ou continue — il suivra.',
      );
    };

    // Le silence de dictée : l'écran doit dire qu'il est voulu.
    lecteur.surPauseDictee = setPauseDictee;

    // La relecture complète : l'écran dit qu'elle se fait, puis met en avant
    // le geste qui rend la copie.
    lecteur.surRelectureDictee = setRelectureDictee;

    return () => {
      lecteur.auSilence = null;
      lecteur.auDebutDeParole = null;
      lecteur.surBlocage = null;
      lecteur.surDelai = null;
      lecteur.surRepli = null;
      lecteur.surCoupure = null;
      lecteur.surPauseDictee = null;
      lecteur.surRelectureDictee = null;
    };

  // `sansCasque` vient de l’adresse et ne bouge pas d’une séance à l’autre.
  // Il figure quand même ici : le jour où l’élève pourra changer d’avis en
  // plein cours, l’oubli laisserait les deux rappels branchés sur l’ancienne
  // valeur, et le micro resterait fermé sans raison.
  }, [sansCasque]);

  // Un clic, n'importe où, rend l'autorisation de jouer du son. On le dit à
  // l'élève plutôt que de le laisser devant un professeur muet.
  useEffect(() => {
    if (!sonBloque) return undefined;

    const debloquer = () => setSonBloque(false);
    document.addEventListener('pointerdown', debloquer, { once: true });
    document.addEventListener('keydown', debloquer, { once: true });

    return () => {
      document.removeEventListener('pointerdown', debloquer);
      document.removeEventListener('keydown', debloquer);
    };
  }, [sonBloque]);

  // ------------------------------------------------- lecture à voix haute
  // On lit au fil du flux, pas à la fin : attendre la génération complète
  // ajouterait plusieurs secondes de silence après chaque question.
  useEffect(() => {
    if (muet || !voixService.supporte) return;

    // On attend de savoir QUI parle : la voix est celle du professeur, et
    // commencer sans elle ferait changer de timbre au milieu du message. La
    // conversation est là bien avant le premier fragment — elle conditionne le
    // flux lui-même —, donc cette attente ne coûte rien.
    //
    // On n'attend PLUS de savoir à qui. `eleve` ne détermine que le registre
    // de jeu (débit, ton), pas l'identité de la voix, et il vient d'un autre
    // appel qui court en parallèle. Quand l'accueil arrivait en premier, la
    // lecture restait bloquée jusqu'à ce que la liste des élèves tombe : le
    // texte s'affichait, rien ne sortait, et l'attente se comptait en
    // secondes. Un registre par défaut sur les quarante premiers caractères
    // est un défaut sans commune mesure avec ce silence-là.
    if (!conversation) return;

    // LE MODE DICTÉE EST POSÉ AVANT DE METTRE QUOI QUE CE SOIT EN FILE.
    //
    // Il vaut pour tout le tour de parole : la consigne du professeur lui
    // demande de ne rien mettre d'autre dans un message qui porte une dictée.
    // Un grain plus fin obligerait à suivre la frontière du marqueur à travers
    // un flux qui la coupe en deux un fragment sur trois — pour un gain nul,
    // puisque le message ne contient que ça.
    // RIEN N'EST PRONONCÉ TANT QUE L'ÉLÈVE N'A PAS CHOISI.
    //
    // La question s'affiche à l'écran ; la voix attend. Le texte déjà reçu
    // n'est pas perdu — `luJusqua` ne bouge pas, et tout partira d'un bloc au
    // moment du choix.
    // LE PREMIER CARACTÈRE DU MODÈLE FERME CE MAILLON.
    //
    // On mesure sur `reponseEnCours` brut et non sur le texte prononçable :
    // un tour qui commence par une balise — un bloc de dictée, une ardoise —
    // n'a rien à prononcer pendant plusieurs fragments, et le chiffre
    // compterait alors l'écriture du bloc au lieu du temps de réflexion.
    const c = chronoRef.current;
    if (c.envoiLe && reponseEnCours) {
      c.reponseMs = performance.now() - c.envoiLe;
      c.envoiLe = 0;
    }

    if (dicteeEnAttente) return;

    // MÊME RETENUE POUR L'ÉCOUTE : le passage ne se prononce pas avant que
    // l'élève ait choisi sa vitesse. Sans elle, il l'entendrait une première
    // fois au débit par défaut — l'exercice serait déjà entamé.
    if (vitesseEnAttente) return;

    // LE MODE CLAVIER OUVRE LE CAHIER DÈS LE PREMIER MOT DICTÉ : l'élève doit
    // pouvoir taper la première phrase pendant qu'il entend la deuxième.
    if (contientDictee(reponseEnCours) && modeDictee === 'clavier') {
      setCopieDictee((c) => c ?? []);
    }

    // Le drapeau n'est plus posé ici : les bornes voyagent DANS le texte, et
    // c'est le service de voix qui bascule au bon endroit. Le poser pour tout
    // le tour donnait sa pause à la phrase d'annonce.
    const parlable = texteParle(reponseEnCours, { bornes: true });

    // Le chronomètre part ici, à l'instant où il y a quelque chose à dire, et
    // non à la mise en file : entre les deux il peut se passer un groupe à
    // remplir et un aller-retour de synthèse, et c'est précisément ce que
    // l'élève ressent.
    if (parlable.length > 0) lecteurRef.current.marquerDebutTour();

    // Un texte plus court que le compteur signifie qu'un NOUVEAU tour a
    // commencé — le flux repart de zéro alors que le compteur pointe encore
    // sur la réponse précédente.
    //
    // C'est le cas quand l'élève coupe la parole : il envoie son message
    // pendant que le professeur parle, donc `streaming` ne repasse jamais à
    // faux entre les deux et la remise à zéro de fin de flux n'a pas lieu. Le
    // compteur restait par exemple à 250, et les 250 premiers caractères de la
    // réponse suivante n'étaient jamais prononcés — une réponse plus courte
    // que ça restait muette en entier.
    //
    // `parlable` non vide est essentiel : un flux VIDE ne signale pas un
    // nouveau tour plus court, il signale qu'aucun tour n'est en cours — c'est
    // l'état juste après la fin d'un message. Sans cette condition, le
    // compteur retombait à zéro à chaque fin de flux, et l'effet de rattrapage
    // ci-dessous reprononçait le message en entier.
    if (parlable.length > 0 && parlable.length < luJusquaRef.current) {
      luJusquaRef.current = 0;
    }

    if (parlable.length > luJusquaRef.current) {
      lecteurRef.current.alimenter(parlable.slice(luJusquaRef.current));
      luJusquaRef.current = parlable.length;
      paroleProfRef.current.texte = parlable;
    }
  }, [
    reponseEnCours, muet, conversation, dicteeEnAttente, vitesseEnAttente,
    modeDictee, messages.length,
  ]);

  // Le dernier tour a-t-il vraiment été diffusé ? Sert à distinguer un message
  // qui vient d'arriver d'un message déjà présent dans l'historique chargé.
  const aStreameRef = useRef(false);
  useEffect(() => {
    if (streaming) aStreameRef.current = true;
  }, [streaming]);

  // Le message qui a déjà été confié au lecteur.
  const indexDitRef = useRef(-1);

  /**
   * Fin du flux : on prononce ce qui n'a pas encore été dit, puis on vide.
   *
   * On repart du message COMPLET et non du seul tampon de flux. Un message
   * court dont toute la réponse arrive dans un même paquet réseau ne produit
   * qu'un seul rendu : `reponseEnCours` y passe de vide à vide — le texte a
   * été versé dans l'historique dans la même fournée — et l'effet de lecture
   * ne voit jamais rien à dire. Le message s'affichait sans être prononcé.
   *
   * C'est ce qui rendait l'au revoir muet : court, et arrivé d'un bloc.
   */
  useEffect(() => {
    if (streaming || muet || !voixService.supporte) return;
    if (!eleve || !conversation) return;

    const index = indexDernierProf;
    if (index === -1 || index === indexDitRef.current) return;

    // LE SECOND CHEMIN ATTEND LUI AUSSI LE CHOIX.
    //
    // Il n'y avait qu'un garde-fou, sur le chemin du flux. Celui-ci, qui
    // rattrape ce qui n'a pas été prononcé une fois le message versé au fil,
    // partait sans rien demander : la carte s'affichait une seconde, le flux
    // se terminait, et la dictée démarrait toute seule.
    //
    // On sort AVANT de poser `indexDitRef` : sans ça, le tour serait marqué
    // comme déjà dit et l'effet ne repasserait jamais après le choix.
    if (dicteeEnAttente) return;

    // Et la même chose pour la vitesse d'écoute : ce second chemin prononce
    // le message une fois versé au fil, et il partirait sans attendre le clic.
    if (vitesseEnAttente) return;

    indexDitRef.current = index;

    // Rien n'a été diffusé : c'est l'historique qu'on vient de charger. Le
    // relire à voix haute réciterait toute la séance précédente.
    if (!aStreameRef.current) return;
    aStreameRef.current = false;

    const attendu = texteParle(messages[index].contenu, { bornes: true });
    if (attendu.length > luJusquaRef.current) {
      lecteurRef.current.alimenter(attendu.slice(luJusquaRef.current));
    }

    lecteurRef.current.terminer();
    luJusquaRef.current = 0;
  }, [
    streaming, indexDernierProf, messages, muet, eleve, conversation,
    dicteeEnAttente, vitesseEnAttente,
  ]);

  // Une panne côté serveur doit s'entendre, pas seulement s'afficher : sans
  // ça l'élève attend une réponse qui ne viendra jamais.
  const erreurDite = useRef(null);
  useEffect(() => {
    if (!error || muet || erreurDite.current === error) return;
    erreurDite.current = error;
    lecteurRef.current.dire("Désolée, j'ai un problème technique. Tu peux réessayer ?");
  }, [error, muet]);

  /**
   * L'élève quitte le cours.
   *
   * On prévient le serveur AVANT de naviguer, mais sans bloquer : si l'appel
   * échoue, on part quand même — au pire le professeur retombe sur le délai de
   * silence pour décider s'il doit accueillir.
   */
  const quitter = async () => {
    lecteurRef.current.arreter();
    ecouteRef.current?.arreter();

    // Le départ enregistré meurt avec la séance. Sans ça, revenir dans la même
    // matière un quart d'heure plus tard reprendrait le décompte de la
    // précédente : l'enfant retrouverait un chronomètre déjà entamé, voire
    // épuisé, sans comprendre pourquoi.
    oublierLeDepart();

    if (conversation) {
      try {
        await quitterCours(conversation.id);
      } catch {
        // Sans importance : la navigation prime sur le marqueur.
      }
    }

    navigate(`/eleves/${eleveId}/matieres`);
  };

  /**
   * L'élève repart pour une séance, de la même durée que celle qui vient de
   * finir. On ne recharge pas la page : la conversation, donc la mémoire du
   * professeur, doit rester la même — c'est le compteur qu'on remet à zéro.
   */
  const relancer = async () => {
    if (!conversation) return;

    lecteurRef.current.arreter();
    ecouteRef.current?.arreter();

    // Déverrouillé tout de suite : l'élève a cliqué, l'interface doit répondre
    // sans attendre l'aller-retour réseau.
    annoncesRef.current = {
      preavisFinal: false,
      fin: false,
      clotureProche: false,
      copieAttendue: false,
      clotureForcee: false,
    };

    // Les index repartent sur une nouvelle séance : un refus d'avant ne doit
    // pas condamner un au revoir légitime de celle-ci.
    adieuxRefusesRef.current = new Set();
    setRabEpuise(false);
    setIndexAdieu(null);
    sortieSignalee.current = false;
    silencesRef.current = 0;
    setErreurMicro(null);
    viderSaisie();
    setSecondes(0);
    setSeance((n) => n + 1);

    // Clôture la séance écoulée côté serveur : c'est ce marqueur qui déclenche
    // l'évaluation des compétences. Sans lui, deux séances enchaînées n'en
    // feraient qu'une seule aux yeux de l'observateur.
    try {
      await quitterCours(conversation.id);
    } catch {
      // Tant pis pour le marqueur : la nouvelle séance démarre quand même.
    }

    dispatch(annoncer(conversation.id, 'nouvelle-seance'));
  };

  const basculerSon = () => {
    const nouveau = !muet;
    setMuet(nouveau);
    localStorage.setItem('school-ia-muet', nouveau ? '1' : '0');
    if (nouveau) lecteurRef.current.arreter();
  };

  // ------------------------------------------------- assemblage du tour
  //
  // Les fragments de transcription s'accumulent ici avant d'être envoyés.
  // `texte` est ce qui a déjà été dit dans ce tour, `minuteur` le compte à
  // rebours qui décidera qu'il est clos.
  const assemblageRef = useRef({ texte: '', minuteur: null });

  // La dernière transcription provisoire, et le fait qu'on l'ait déjà prise
  // pour définitive. C'est le filet quand le fournisseur ne tranche pas.
  const partielRef = useRef('');
  const partielConsommeRef = useRef(false);

  // La dernière question du professeur, pour régler la patience : c'est lui
  // qui sait s'il attend un nombre ou une explication. Dans une ref plutôt
  // qu'un état — elle est lue dans des rappels, jamais rendue.
  const demandeProfRef = useRef('');
  useEffect(() => {
    const dernier = messages.map((m) => m.role).lastIndexOf('assistant');
    if (dernier === -1) return;

    // CE QUI EST ÉCRIT AU TABLEAU FAIT PARTIE DE LA QUESTION.
    //
    // `texteParle` retirait le contenu des ardoises — c'est son rôle, il rend
    // ce qui se PRONONCE. Mais pour régler la patience, on ne cherche pas ce
    // que le professeur a dit : on cherche ce qu'il a DEMANDÉ. Or en
    // mathématiques il écrit l'énoncé au tableau et se contente de dire
    // « vas-y, je t'écoute » : un « explique-moi pourquoi » posé sur
    // l'ardoise était invisible ici, et l'élève n'avait droit qu'à la
    // patience d'une réponse courte pour justifier tout un raisonnement.
    const contenu = messages[dernier].contenu ?? '';

    demandeProfRef.current = decouper(contenu)
      .map((segment) => segment.contenu)
      .join(' ');
  }, [messages]);

  // ------------------------------------------------------------- envoi
  /**
   * Retire le document en attente et relâche son aperçu local.
   *
   * Défini AVANT `envoyerTexte`, qui l'appelle : un `const` n'est pas hissé,
   * et l'ordre inverse produirait une référence morte au premier envoi.
   */
  const retirerDocument = useCallback((cle) => {
    // Sans clé, on vide tout — c'est l'envoi qui l'appelle ainsi. Avec une
    // clé, c'est la croix d'une vignette : les autres restent.
    setPiecesEnAttente((actuelles) => actuelles.filter((p) => {
      if (cle !== undefined && p.cle !== cle) return true;
      if (p.apercu) URL.revokeObjectURL(p.apercu);
      return false;
    }));
  }, []);

  const envoyerTexte = useCallback(
    (contenu) => {
      // Un envoi, d'où qu'il vienne, clôt le tour en cours. Sans cette purge,
      // l'élève qui tape sur « Envoyer » pendant qu'un fragment attend verrait
      // partir son message, puis le fragment derrière, comme deux questions.
      if (assemblageRef.current.minuteur) clearTimeout(assemblageRef.current.minuteur);
      assemblageRef.current = { texte: '', minuteur: null };

      const propre = contenu.trim();

      // Un document SANS texte est un tour valide : l'élève montre sa feuille.
      // On l'encourage à dire ce qui le bloque — le texte d'invite change quand
      // un document est accroché — mais on ne le lui impose pas.
      const documentsPrets = piecesRef.current
        .filter((p) => p.id && !p.enCours)
        .map((p) => p.id);
      const documentPret = documentsPrets[0] ?? null;
      if ((!propre && !documentPret) || !conversation) return;

      // CE QUE L'ÉCRAN SAIT, LE PROFESSEUR DOIT LE SAVOIR AUSSI.
      //
      // Tant que la photo du cahier n'est pas là, il n'a RIEN à corriger — et
      // c'est un fait, pas une consigne : il n'a matériellement pas la copie.
      // Le lui dire au moment du tour vaut mieux que le lui avoir écrit dans
      // sa consigne, où il l'a déjà ignoré quatre fois.
      //
      // Le document en attente referme le cahier : son arrivée EST la copie.
      const enAttenteDeCopie = cahierRef.current && !documentPret;
      if (cahierRef.current && documentPret) setCahierOuvert(false);

      // ET SYMÉTRIQUEMENT, QUAND LA COPIE ARRIVE AU CLAVIER.
      //
      // Relevé le 11/09/2026 : la copie s'affiche entière dans le fil, et le
      // professeur répond « envoie-moi la photo dès que tu peux ». L'élève
      // n'a pas de cahier.
      const copieAuClavier = copieAuClavierRef.current;
      copieAuClavierRef.current = false;

      const charge = enAttenteDeCopie
        ? marquerCopieAuCahier(propre)
        : copieAuClavier
          ? marquerCopieAuClavier(propre)
          : propre;

      // Une transcription peut arriver après l'échéance : le micro était encore
      // ouvert quand le temps est tombé. Elle ne part pas.
      if (seanceTermineeRef.current) return;

      // L'élève reprend la parole : le professeur se tait, comme dans la vraie vie.
      lecteurRef.current.arreter();

      // On envoie MÊME si une réponse est en cours de génération. C'est la
      // saga qui s'en charge : le nouveau message annule le précédent, comme
      // un professeur qui abandonne sa phrase pour écouter. Retenir le message
      // le temps que la génération finisse produisait deux réponses à une
      // seule question — la seconde répondant à ce que l'élève venait de dire,
      // la première à plus rien du tout.
      //
      // Le chronomètre part avec : c'est la seule façon pour le professeur de
      // savoir combien il reste. Sans lui, il devine — et il conclut avec
      // trois minutes au compteur.
      // Le départ du maillon le plus lourd : du message envoyé au premier
      // caractère écrit par le modèle.
      chronoRef.current.envoiLe = performance.now();

      // Un aperçu minimal de la pièce déjà envoyée, pour que sa bulle
      // l'affiche tout de suite. `chargerPieceJointe` sait aller la chercher
      // dès maintenant : le dépôt a déjà réussi, c'est ce que dit `documentPret`.
      // La bulle se dessine tout de suite, avec TOUTES les pièces : n'en
      // montrer qu'une ferait croire que les autres ne sont pas parties.
      const piecesJointesApercu = piecesRef.current
        .filter((p) => p.id && !p.enCours)
        .map((p) => ({
          id: p.id,
          estImage: p.fichier?.type !== 'application/pdf',
          consultable: true,
          nomFichier: p.fichier?.name ?? null,
          nombrePages: 0,
        }));

      // LA PIÈCE PART ÉTIQUETÉE quand elle vient de la carte de copie : c'est
      // ce qui dit au professeur — et au serveur — si c'est l'énoncé ou la
      // copie. L'étiquette ne sert qu'une fois.
      const rolePiece = documentPret ? rolePieceRef.current : null;
      if (documentPret) rolePieceRef.current = null;

      const aEnvoyer = rolePiece
        ? marquerPieceControle(charge, rolePiece.role, rolePiece.controleId)
        : charge;

      dispatch(envoyerMessage(
        conversation.id, aEnvoyer, restantRef.current, documentsPrets, piecesJointesApercu,
        vitesseEcouteRef.current,
      ));
      viderSaisie();

      // Le document part avec le message : il ne doit pas repartir avec le
      // suivant. L'aperçu local est relâché ici — la conversation affichera
      // désormais celui que le serveur rend.
      if (documentsPrets.length > 0) retirerDocument();
    },
    [dispatch, conversation, retirerDocument],
  );

  /**
   * L'élève montre un endroit du tableau.
   *
   * CE QUI PART EST DU TEXTE, PAS UNE IMAGE.
   * ---------------------------------------
   * La tentation était de capturer le tableau et de l'envoyer au professeur.
   * Ç'aurait été un appel de vision par clic, plusieurs secondes d'attente, et
   * une photo à effacer derrière. Or l'information tient en deux nombres : le
   * professeur sait déjà ce que la planche contient — c'est le relevé de ses
   * légendes, injecté dans sa consigne — il lui manquait seulement OÙ.
   *
   * Le message est écrit entre crochets, comme les marqueurs de séance : ce
   * n'est pas l'élève qui parle, c'est son geste qu'on rapporte.
   *
   * IL EST ENVOYÉ COMME UN TOUR NORMAL, et c'est voulu : montrer, c'est
   * répondre. Le professeur enchaîne, la voix repart, et l'élève n'a rien à
   * taper — ce qui est tout l'intérêt pour un enfant de CE2.
   */
  const montrerSurLeTableau = useCallback(
    ({
      x, y, position, titre, cle, variante, mot,
    }) => {
      const pct = (v) => Math.round(v * 100);
      const figure = titre ? ` « ${titre} »` : '';

      /**
       * LE NOM, QUAND C'EST LE NAVIGATEUR QUI PEUT LE DIRE.
       *
       * Sur un schéma dessiné, les légendes sont des balises `text` avec leur
       * position : le navigateur mesure, il ne devine pas. Le serveur, lui, ne
       * verra jamais ce SVG — la bibliothèque vit dans le front et l'ardoise ne
       * transporte que la clé.
       *
       * La formulation est EXACTEMENT celle que le serveur produit pour les
       * planches importées : le professeur reçoit la même phrase quelle que
       * soit l'origine de la figure, et sa consigne n'a qu'une règle à suivre.
       */
      const nomme = mot
        ? `\n[L'ÉLÈVE A MONTRÉ : ${mot.toUpperCase()}.]`
          + "\n[Réponse CALCULÉE à partir de la position du clic et des étiquettes "
          + 'du schéma. Elle ne se discute pas.]'
          // Même rappel que côté serveur, et pour la même raison : la règle est
          // dans la consigne système, mais l'historique est plein de ses propres
          // remerciements — et c'est ce qu'elle relit.
          + "\n[COMMENCE PAR LE NOM. Pas de « merci », pas de commentaire sur "
          + "l'image. L'élève a cliqué pour apprendre, pas pour être remercié.]"
        : '';

      // LA CLÉ VOYAGE AVEC LE CLIC, ET C'EST ELLE QUI FAIT TOUT MARCHER.
      //
      // Le serveur la lit pour rattacher la planche à ce tour : le professeur
      // reçoit alors l'IMAGE en même temps que la position, et regarde au lieu
      // de calculer. Sans elle il n'avait que des pourcentages, et sur une
      // image qui contient des marges blanches et cinq encarts d'outre-mer,
      // « 52 % de la largeur » ne désigne rien de géographique — d'où le
      // Grand-Est annoncé pour un clic sur l'Île-de-France.
      // COURT, PARCE QUE L'IMAGE PORTE DÉSORMAIS L'INFORMATION.
      //
      // La première version détaillait la position en toutes lettres et en
      // pourcentages — utile tant que le professeur ne voyait rien. Depuis que
      // la cible est dessinée sur la planche jointe, ce préambule ne fait que
      // répéter ce qu'il a sous les yeux, et se paie à chaque tour tant qu'il
      // reste dans la fenêtre d'historique.
      //
      // Reste le strict nécessaire : le geste, la zone en un mot — seul repli
      // quand la figure ne peut pas être jointe — et le jeton technique.
      // LA VARIANTE VOYAGE AVEC LA CLÉ.
      //
      // Sans elle, le serveur joindrait au professeur la planche LÉGENDÉE
      // alors que l'enfant regarde la muette : il verrait les mots que
      // l'enfant cherche, et lui répondrait en lisant au lieu de le faire
      // deviner. La correction, elle, se lit sur la carte de la légendée dans
      // les deux cas — même fond, même cadrage.
      const suffixe = variante === 'muette' ? '/muette' : '';

      envoyerTexte(
        `[L'élève montre un endroit de la figure${figure} : ${position}. `
        + `POINTAGE:${cle}${suffixe}@${pct(x)},${pct(y)}]${nomme}`,
      );
    },
    [envoyerTexte],
  );

  /**
   * Un fragment de plus dans le tour en cours.
   *
   * Chaque fragment repousse l'échéance : tant que l'élève reprend, on
   * continue de recoller. Le délai est recalculé à chaque fois, parce qu'un
   * fragment qui s'achève sur « parce que » change le verdict même si le
   * précédent semblait complet.
   */
  /**
   * Programme l'envoi du tour assemblé dans `delai` millisecondes.
   *
   * Séparé de l'accumulation, et c'est tout le correctif du 10/09/2026 : le
   * compte à rebours partait à l'ARRIVÉE D'UN FRAGMENT DE TEXTE, c'est-à-dire
   * potentiellement pendant que l'élève parlait encore. Sur une explication
   * d'une minute, le fournisseur rend une phrase toutes les dix ou quinze
   * secondes ; chacune armait 150 ms, expirait avant qu'il ait repris son
   * souffle, et partait SEULE — en annulant au passage la réponse en cours
   * sur la précédente (voir `envoyerTexte`). L'élève parlait une minute et
   * voyait arriver une réponse à ses trois derniers mots.
   */
  const programmerEnvoi = useCallback(
    (delai) => {
      const encours = assemblageRef.current;
      if (encours.minuteur) clearTimeout(encours.minuteur);

      const debutAttente = Date.now();

      // LE DÉLAI EXPIRÉ NE SUFFIT PLUS : IL FAUT QUE TOUT SOIT TRANSCRIT.
      //
      // Relevé par Camara le 13/09/2026 : une justification de trente
      // secondes partie en un bout de phrase — « Alors, comme D appartient à
      // AB et E à » —, le reste s'écrivant puis s'effaçant à l'écran. Le délai
      // partait au silence, alors que le dernier morceau dit n'était pas
      // encore revenu de la transcription. On vérifie donc, à l'échéance, que
      // plus rien n'est en route ; sinon on repasse un quart de seconde plus
      // tard. Voir `doitAttendreAvantEnvoi`.
      const tenter = () => {
        const ecoute = ecouteRef.current;

        if (doitAttendreAvantEnvoi({
          parle: ecoute?.parleEnCeMoment?.(),
          transcriptionEnCours: ecoute?.transcriptionEnCours?.(),
          attenteMs: Date.now() - debutAttente,
        })) {
          const minuteur = setTimeout(tenter, 250);
          assemblageRef.current = { ...assemblageRef.current, minuteur };
          return;
        }

        const complet = assemblageRef.current.texte;
        assemblageRef.current = { texte: '', minuteur: null };
        if (complet.trim()) envoyerTexte(complet);
      };

      const minuteur = setTimeout(tenter, delai);

      assemblageRef.current = { ...assemblageRef.current, minuteur };
    },
    [envoyerTexte],
  );

  /**
   * Le micro est silencieux et il reste du texte : on programme son départ.
   *
   * Appelé quand le silence de fin de tour est constaté — la seule mesure
   * fiable de « il a fini », puisqu'elle vient du niveau sonore et non d'une
   * devinette sur la ponctuation.
   */
  const armerEnvoi = useCallback(() => {
    const { texte } = assemblageRef.current;
    if (!texte.trim()) return;

    const attente = delaiAssemblage({
      demandeProf: demandeProfRef.current, fragment: '', accumule: texte,
    });

    chronoRef.current.assemblageMs = attente;
    programmerEnvoi(attente);
  }, [programmerEnvoi]);

  const accumuler = useCallback(
    (fragment) => {
      // LE DERNIER VERROU, ET LE PLUS IMPORTANT DES TROIS.
      //
      // Les deux autres protègent l'affichage ; celui-ci protège l'ENVOI. Sans
      // lui, la voix continuait d'assembler en silence et finissait par
      // expédier au professeur une phrase que l'élève n'avait pas dite — en
      // vidant au passage le champ qu'il était en train de remplir.
      if (saisieTapeeRef.current) return;

      const encours = assemblageRef.current;
      if (encours.minuteur) clearTimeout(encours.minuteur);

      const texte = encours.texte ? `${encours.texte} ${fragment.trim()}` : fragment.trim();
      assemblageRef.current = { texte, minuteur: null };
      setSaisie(texte);

      // TANT QUE LE MICRO L'ENTEND, RIEN NE PART — MÊME PAS DANS DEUX SECONDES.
      //
      // Un fragment qui arrive pendant qu'il parle ne dit rien de la fin de son
      // tour : il dit seulement que le fournisseur a fini de transcrire ce
      // qu'il a déjà dit. C'est le silence du micro qui clôt un tour, et lui
      // seul — voir `armerEnvoi`, appelé depuis `onSilence`.
      if (ecouteRef.current?.parleEnCeMoment?.()) return;

      const attente = delaiAssemblage({
        demandeProf: demandeProfRef.current, fragment, accumule: texte,
      });

      chronoRef.current.assemblageMs = attente;
      programmerEnvoi(attente);
    },
    [programmerEnvoi],
  );

  // Quitter la page en plein assemblage laisserait un compte à rebours courir
  // sur un composant démonté.
  useEffect(() => () => {
    if (assemblageRef.current.minuteur) clearTimeout(assemblageRef.current.minuteur);
  }, []);

  /**
   * Un document choisi : on l'affiche tout de suite, on l'envoie derrière.
   *
   * L'aperçu local est posé AVANT que le fichier ne parte : l'élève voit sa
   * photo apparaître à l'instant où il la choisit, et l'envoi se fait pendant
   * qu'il écrit sa phrase. Attendre la réponse du serveur pour afficher quoi
   * que ce soit donnerait plusieurs secondes d'écran mort sur un réseau lent.
   */
  const deposer = useCallback(
    async (fichier) => {
      if (!conversation || !fichier) return;

      const cle = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      // LE PLAFOND SE VOIT DANS LA LISTE, comme un fichier refusé : c'est là
      // que l'élève regarde. Il retire la bande d'une croix et continue.
      if (piecesRef.current.filter((p) => !p.erreur).length >= PIECES_MAX) {
        setPiecesEnAttente((actuelles) => [
          ...actuelles,
          { cle, erreur: `Au plus ${PIECES_MAX} documents par message. Retires-en un pour en ajouter.` },
        ]);
        return;
      }

      // L'aperçu est posé à partir du fichier D'ORIGINE, avant la réduction :
      // il doit apparaître à l'instant du choix. La réduction, elle, prend
      // quelques centaines de millisecondes sur une photo de douze mégapixels.
      const apercu = fichier.type.startsWith('image/') ? URL.createObjectURL(fichier) : null;

      const poser = (changement) => setPiecesEnAttente((actuelles) =>
        actuelles.map((p) => (p.cle === cle ? { ...p, ...changement } : p)));

      setPiecesEnAttente((actuelles) => [
        ...actuelles, { cle, fichier, apercu, enCours: true, id: null },
      ]);

      try {
        const aEnvoyer = await reduire(fichier);

        // Le plafond est vérifié APRÈS la réduction : une photo de huit
        // mégaoctets prise en pleine définition passe très bien une fois
        // ramenée à la taille utile. La refuser d'entrée aurait bloqué le cas
        // le plus courant — un téléphone récent tenu à bout de bras.
        if (aEnvoyer.size > TAILLE_MAX) {
          if (apercu) URL.revokeObjectURL(apercu);
          poser({
            fichier: null, apercu: null, enCours: false,
            erreur: 'Ce fichier est trop lourd. Essaie une photo un peu moins grande.',
          });
          return;
        }

        const { data } = await deposerPieceJointe(conversation.id, aEnvoyer);
        poser({ enCours: false, id: data.id });
      } catch (erreur) {
        if (apercu) URL.revokeObjectURL(apercu);

        // Le motif vient du serveur et il est écrit pour l'élève — « ce PDF
        // fait 40 pages » — donc on l'affiche tel quel. Un message générique
        // ne lui dirait pas quoi faire.
        poser({
          fichier: null, apercu: null, enCours: false,
          erreur:
            erreur?.response?.data?.message
            ?? "Je n'ai pas réussi à recevoir ce fichier. Tu peux réessayer ?",
        });
      }
    },
    [conversation],
  );

  /**
   * L'élève a dit « Photo » : on capture, on dépose, et on envoie le tour
   * tout seul dès que la photo est montée — voir l'effet plus bas.
   *
   * Rien à faire si la caméra n'est pas allumée : `capturer()` répond alors
   * `null`, et un enfant qui aurait dit « photo » sans avoir ouvert la
   * caméra ne voit rien partir de travers, juste rien se passer.
   */
  const prendrePhoto = useCallback(async () => {
    const fichier = await cameraRef.current?.capturer();
    if (!fichier) return;

    autoEnvoiPhotoRef.current = true;
    deposer(fichier);
  }, [deposer]);

  // LE TOUR PART DÈS QUE LA PHOTO EST MONTÉE, SANS CLIC.
  //
  // `deposer` met à jour `piecesEnAttente` en deux temps — l'aperçu tout de
  // suite, l'identifiant une fois l'envoi terminé — et c'est ce SECOND
  // instant qu'on attend ici plutôt que d'enchaîner à la suite de
  // `prendrePhoto` : lire `piecesRef.current` juste après l'avoir déposée
  // risquerait de retomber sur le rendu d'avant, avant que React n'ait posé
  // le nouvel état. Réagir au changement d'état lui-même ne peut pas se
  // tromper de rendu.
  useEffect(() => {
    if (!autoEnvoiPhotoRef.current) return;

    if (piecesEnAttente.some((p) => p.erreur)) {
      autoEnvoiPhotoRef.current = false;
      rolePieceRef.current = null;
      return;
    }

    // TOUTES déposées, aucune en cours : c'est le moment. Une seule qui monte
    // encore, et le professeur recevrait un message incomplet.
    const pretes = piecesEnAttente.filter((p) => !p.erreur);
    if (pretes.length > 0 && pretes.every((p) => p.id && !p.enCours)) {
      autoEnvoiPhotoRef.current = false;

      // La carte de copie coche elle-même ce qui est arrivé : la pastille
      // « la photo est envoyée » ferait doublon — et mentirait pour un PDF.
      const depuisCarteCopie = Boolean(rolePieceRef.current);

      envoyerTexte('');
      if (!depuisCarteCopie) setConfirmationPhoto(true);

      // LA CAMÉRA SE FERME TOUTE SEULE, ELLE AUSSI.
      //
      // La photo est partie : l'aperçu qui restait ouvert par-dessus la
      // conversation n'a plus rien à montrer, et il cachait le message du
      // professeur pendant qu'il répondait. L'élève qui veut reprendre une
      // photo peut toujours rallumer la caméra d'un clic.
      cameraRef.current?.fermer();
    }
  }, [piecesEnAttente, envoyerTexte]);

  // La confirmation se referme TOUTE SEULE : l'élève vient de parler et de
  // capturer sans toucher l'écran, lui demander un clic de plus pour fermer
  // une pastille casserait exactement le geste qu'on vient de lui épargner.
  useEffect(() => {
    if (!confirmationPhoto) return undefined;
    const minuteur = setTimeout(() => setConfirmationPhoto(false), 2600);
    return () => clearTimeout(minuteur);
  }, [confirmationPhoto]);

  // COLLER UNE CAPTURE. C'est le geste le plus naturel sur ordinateur, et il
  // ne coûte qu'un écouteur : l'élève fait une capture de son exercice à
  // l'écran et la colle directement dans le champ.
  const auCollage = useCallback(
    (evenement) => {
      const fichier = Array.from(evenement.clipboardData?.items ?? [])
        .find((element) => element.kind === 'file')
        ?.getAsFile();

      if (fichier) {
        evenement.preventDefault();
        deposer(fichier);
      }
    },
    [deposer],
  );

  const auDepot = useCallback(
    (evenement) => {
      evenement.preventDefault();
      const fichier = evenement.dataTransfer?.files?.[0];
      if (fichier) deposer(fichier);
    },
    [deposer],
  );

  /**
   * LA CARTE DE COPIE : répondre à la question, envoyer une pièce, scanner.
   *
   * Tout passe par les chemins existants — `envoyerTexte` pour la réponse,
   * `deposer` puis l'envoi automatique pour la pièce, la caméra de séance
   * pour le scan sur ordinateur. Aucun second chemin d'envoi.
   */
  /**
   * OUI / NON : ENREGISTRÉ EN SILENCE, SANS TOUR DE CONVERSATION.
   *
   * Relevé par Camara le 13/09/2026 : le clic partait comme un message, et le
   * professeur y répondait « J'ai bien reçu, envoie-moi le second dès que tu
   * peux » — alors que rien n'avait été envoyé. Un clic sur un bouton ne
   * demande aucune réponse : sans message, la phrase ne peut plus exister. Le
   * professeur apprend le choix avec la première pièce, par le rappel que le
   * serveur joint à chaque tour.
   *
   * La carte avance tout de suite ; si l'enregistrement échoue, elle revient à
   * la question et le dit.
   */
  /**
   * L'élève choisit son support, et le fait part avec son message.
   *
   * UN TOUR NORMAL, comme le clic sur le tableau : le professeur enchaîne
   * tout de suite — il affiche le sujet, ou il pose sa première question.
   * Un choix enregistré à part aurait laissé l'élève devant une carte
   * refermée, sans rien qui se passe.
   */
  const choisirSupport = useCallback(
    (choix) => envoyerTexte(marquerSupport('', choix)),
    [envoyerTexte],
  );

  const choisirCopie = useCallback(
    async (separee) => {
      if (!etatCopie || !conversation) return;

      const { cle, controleId } = etatCopie;
      setChoixCopie((actuel) => ({ ...actuel, [cle]: separee }));

      try {
        await poserChoixCopie(conversation.id, controleId, separee);
      } catch {
        setChoixCopie((actuel) => {
          const suite = { ...actuel };
          delete suite[cle];
          return suite;
        });
        setErreurMicro('Ta réponse n’a pas pu être enregistrée. Tu peux réessayer ?');
      }
    },
    [etatCopie, conversation],
  );

  // APRÈS UN RECHARGEMENT, LE CHOIX SE RELIT SUR LE SERVEUR : sans ça, la
  // carte reposerait une question à laquelle l'élève a déjà répondu. Une
  // seule lecture par DEMANDE — le serveur remet le choix à zéro à chaque
  // nouvelle demande, il répond donc « pas encore choisi » pour une demande
  // neuve, et la question passe.
  const choixLusRef = useRef(new Set());
  const demandeSansChoix = etatCopie && etatCopie.separee === null ? etatCopie : null;
  const cleSansChoix = demandeSansChoix?.cle ?? null;
  const controleSansChoix = demandeSansChoix?.controleId ?? null;

  useEffect(() => {
    if (!conversation?.id || cleSansChoix === null) return;
    if (choixLusRef.current.has(cleSansChoix)) return;

    choixLusRef.current.add(cleSansChoix);

    getChoixCopie(conversation.id, controleSansChoix)
      .then(({ data }) => {
        if (typeof data?.separee === 'boolean') {
          setChoixCopie((actuel) => ({ ...actuel, [cleSansChoix]: data.separee }));
        }
      })
      .catch(() => { /* la question reste posée, rien de cassé */ });
  }, [conversation?.id, cleSansChoix, controleSansChoix]);

  const envoyerPieceCopie = useCallback(
    (role, fichier) => {
      if (!etatCopie || !fichier) return;

      rolePieceRef.current = { role, controleId: etatCopie.controleId };

      // Le même envoi sans clic que la photo dite à la voix : l'élève a déjà
      // fait son geste en choisissant le fichier.
      autoEnvoiPhotoRef.current = true;
      deposer(fichier);
    },
    [etatCopie, deposer],
  );

  /**
   * LA PHOTO ENVOYÉE PAR LE TÉLÉPHONE EST ARRIVÉE.
   *
   * Elle est déjà sur le serveur : on n'a rien à téléverser, seulement à la
   * remettre en attente comme si l'élève venait de la déposer — et le même
   * envoi automatique que la photo dite à la voix la fait partir au
   * professeur. Aucun second chemin d'envoi.
   */
  const recevoirScan = useCallback((piece) => {
    if (!piece?.id) return;

    // ELLE REJOINT LA LISTE, ET N'ENVOIE RIEN. Le téléphone peut en avoir
    // plusieurs à donner ; c'est son « terminé » (`terminerScan`) qui fait
    // partir le tout — Camara, le 16/09/2026.
    setPiecesEnAttente((actuelles) => (actuelles.some((p) => p.id === piece.id)
      ? actuelles
      : [...actuelles, {
        cle: `scan-${piece.id}`,
        fichier: {
          name: piece.nomFichier ?? 'photo.jpg',
          type: piece.typeMime ?? 'image/jpeg',
          size: piece.taille ?? 0,
        },
        apercu: null,
        enCours: false,
        id: piece.id,
      }]));
  }, []);

  /**
   * LE TÉLÉPHONE A APPUYÉ SUR « ENVOYER » : tout ce qu'il a donné part au
   * professeur d'un coup, par le même envoi automatique que la photo dite à
   * la voix. La copie de liste force l'effet à repasser, même si la dernière
   * photo était déjà arrivée avant le signal.
   */
  const terminerScan = useCallback(() => {
    autoEnvoiPhotoRef.current = true;
    setPiecesEnAttente((actuelles) => [...actuelles]);
  }, []);

  // « SCANNER MA COPIE » SUR ORDINATEUR = LE QR CODE DU TÉLÉPHONE. La photo
  // qui arrive part étiquetée « copie » : `recevoirScan` la remet en attente,
  // et `envoyerTexte` consomme l'étiquette posée ici.
  const scannerCopie = useCallback(() => {
    if (!etatCopie) return;

    rolePieceRef.current = { role: 'copie', controleId: etatCopie.controleId };
    setScanOuvert(true);
  }, [etatCopie]);

  /**
   * UN TÉLÉPHONE SCANNE AVEC SON APPAREIL PHOTO NATIF — `capture` sur le
   * sélecteur de fichier l'ouvre directement. Sur ordinateur, `capture` est
   * ignoré : on passe alors par la caméra de la séance, si elle existe.
   */
  const scannerNatif = useMemo(
    () => typeof window !== 'undefined'
      && Boolean(window.matchMedia?.('(pointer: coarse)')?.matches),
    [],
  );

  const soumettre = (evenement) => {
    evenement.preventDefault();
    envoyerTexte(saisie);
  };

  const auClavier = (evenement) => {
    if (evenement.key !== 'Enter' || evenement.shiftKey) return;

    evenement.preventDefault();

    // EN DICTÉE AU CLAVIER, ENTRÉE VALIDE UNE PHRASE — ELLE N'ENVOIE RIEN.
    //
    // C'est le geste d'un élève qui passe à la ligne suivante, pas celui d'un
    // élève qui pose une question. Envoyer ferait répondre le professeur au
    // milieu de la dictée.
    if (copieDictee) {
      const ligne = saisie.trim();
      if (!ligne) return;

      setCopieDictee((lignes) => [...(lignes ?? []), ligne]);
      viderSaisie();

      // IL A FINI D'ÉCRIRE : LA PAUSE N'A PLUS D'OBJET.
      //
      // Le silence entre deux phrases est CALCULÉ, donc majoré — il doit
      // couvrir l'élève le plus lent de sa classe d'âge. Sa validation est le
      // signal exact que l'estimation cherchait à approcher : continuer
      // d'attendre ferait patienter quelqu'un qui a terminé, et rallongerait
      // une dictée de dix lignes de plusieurs minutes pour rien.
      lecteurRef.current.sauterLaPause();

      return;
    }

    envoyerTexte(saisie);
  };

  /**
   * L'élève rend sa copie : tout part en un seul message.
   *
   * La dernière phrase est prise même si elle n'a pas été validée par Entrée —
   * personne ne pense à appuyer sur Entrée avant de cliquer sur « Rendre ».
   */
  const rendreLaCopie = () => {
    // Les lignes ouvertes puis laissées vides ne sont pas de la copie.
    const lignes = (copieDictee ?? []).map((l) => l.trim()).filter(Boolean);
    const derniere = saisie.trim();
    if (derniere) lignes.push(derniere);

    copieAuClavierRef.current = lignes.length > 0;

    setCopieDictee(null);
    viderSaisie();

    if (lignes.length > 0) envoyerTexte(lignes.join('\n'));
  };

  // ------------------------------------------------------------- micro
  /**
   * Signale un incident : le professeur le dit à voix haute, et le détail
   * technique s'affiche pour l'adulte qui regarde l'écran.
   */
  const signaler = useCallback(
    (aDire, aEcrire) => {
      setErreurMicro(aEcrire);
      if (!muet) lecteurRef.current.dire(aDire);
    },
    [muet],
  );

  /**
   * L'élève vient de prendre la parole alors que le professeur parlait.
   *
   * Dans un vrai cours on coupe son professeur : on dit « attends », « non
   * mais », « j'ai pas compris », et le professeur s'arrête net. Attendre la
   * fin de sa phrase pour pouvoir placer un mot n'a rien d'une conversation.
   */
  const couperLaParole = useCallback(() => {
    if (!lecteurRef.current.estOccupe()) return;

    lecteurRef.current.arreter();

    // La fenêtre de détection d'écho part de MAINTENANT : le professeur vient
    // d'être coupé, sa voix n'a pas fini de s'éteindre dans la pièce.
    paroleProfRef.current.finLe = Date.now();

    // Le tour du professeur est abandonné, pas suspendu. Sans cela, le
    // rattrapage de fin de flux prononcerait la suite du message une fois
    // l'élève terminé — le professeur reprendrait sa phrase là où on l'a
    // coupé, ce qui est exactement ce qu'on cherche à éviter.
    aStreameRef.current = false;
  }, []);

  const demarrerEcoute = useCallback(() => {
    setErreurMicro(null);

    // Libère l'instance précédente avant d'en créer une autre : deux
    // reconnaissances concurrentes se disputent le micro, et la seconde
    // démarre sans jamais recevoir d'audio.
    ecouteRef.current?.arreter();

    setEcoute(true);

    /**
     * Transcription par le serveur : le micro reste ouvert pour toute la
     * séance, et c'est le fournisseur qui décide de la fin d'un tour.
     *
     * Il n'y a donc plus de fenêtres d'écoute à rouvrir, plus de compteur de
     * silences, plus de « je n'entends rien » : l'élève peut réfléchir dix
     * minutes sans que rien ne se referme derrière lui. Tout ce mécanisme
     * n'existait que pour compenser le Web Speech du navigateur.
     */
    // Le temps réel reprend la main dès que le repli a expiré. Le compteur
    // d'échecs repart de zéro à la première ouverture réussie, donc un
    // serveur toujours en panne rebascule en trois essais, sans insister.
    const enRepli = Date.now() - replriDepuisRef.current < REPLI_MS;

    if (ecouteTempsReel.supporte && !enRepli && conversation) {
      ecouteRef.current = ecouteTempsReel.ecouter({
        conversationId: conversation.id,

        // Au PREMIER son, pas à la première transcription : couper la parole
        // au professeur doit être instantané, pas attendre l'aller-retour.
        onVoix: couperLaParole,

        // Ce qui est déjà assemblé reste affiché devant le fragment en cours :
        // pendant une justification, l'élève doit voir sa phrase entière se
        // construire, pas seulement son dernier morceau.
        onPartiel: (texte) => {
          // IL TAPE : ON NE TOUCHE PAS À SON CHAMP. Voir saisieTapeeRef.
          if (saisieTapeeRef.current) return;

          // Une nouvelle transcription provisoire, c'est une nouvelle prise de
          // parole : le verrou anti-doublon est levé.
          partielRef.current = texte;
          partielConsommeRef.current = false;

          const debut = assemblageRef.current.texte;
          setSaisie(debut ? `${debut} ${texte}` : texte);
        },

        // Le filet. L'élève s'est tu et le fournisseur n'a toujours pas
        // tranché : on prend le provisoire pour définitif et on l'envoie.
        // Sans ça, sa phrase reste en suspens jusqu'à ce qu'il dise un mot de
        // plus — et il croit, à juste titre, que l'application est cassée.
        onSilence: () => {
          // L'ordre de transcrire vient de partir : c'est le vrai départ du
          // délai, et le seul instant où on le connaisse.
          chronoRef.current.silenceLe = performance.now();

          // LE MÊME JUGE QUE SUR L'AUTRE CHEMIN, ET C'EST TOUT LE CORRECTIF.
          //
          // Ce filet prenait le provisoire pour définitif SANS RIEN VÉRIFIER,
          // alors que le verdict du fournisseur, lui, passait par deux
          // garde-fous. Un point arraché au silence partait donc en message :
          // des bulles vides, envoyées pendant que l'élève ne disait rien.
          if (saisieTapeeRef.current) {
            partielRef.current = '';
            return;
          }

          const partiel = partielRef.current.trim();
          if (!estUnTourDeParole(partiel)) {
            // TROISIÈME CHEMIN D'EFFACEMENT, ET LE DERNIER QUI ÉTAIT MUET.
            // Un provisoire non vide écarté ici disparaît de l'écran sans
            // laisser de trace : c'est le cas qu'il faut pouvoir nommer quand
            // l'élève dit « ça s'écrit puis ça s'efface ».
            if (process.env.NODE_ENV !== 'production' && partiel) {
              console.warn('[ecoute] provisoire écarté au silence :', partiel);
            }

            // Le champ est vidé quand même : ce qui s'y affichait n'était pas
            // de la parole, et le laisser ferait partir ce point avec la
            // phrase suivante.
            partielRef.current = '';
            setSaisie(assemblageRef.current.texte);

            // RIEN DE NEUF À AJOUTER NE VEUT PAS DIRE RIEN À ENVOYER.
            //
            // Le tour peut être déjà entièrement assemblé — le fournisseur
            // ayant tranché lui-même juste avant, il ne reste aucun partiel.
            // Sans cette ligne, ce qui était accumulé pendant qu'il parlait
            // n'avait plus personne pour le faire partir, et restait dans le
            // champ jusqu'à ce qu'il appuie lui-même sur Envoyer.
            armerEnvoi();
            return;
          }

          partielRef.current = '';
          partielConsommeRef.current = true;

          // « Photo » ne s'accumule pas comme le reste : la caméra doit être
          // allumée pour que le mot compte comme une commande, sinon un
          // élève qui répond « une photo » à une question ordinaire
          // déclencherait une capture inexistante.
          if (cameraRef.current?.actif && estCommandePhoto(partiel)) {
            setSaisie(assemblageRef.current.texte);
            prendrePhoto();
            return;
          }

          accumuler(partiel);
        },

        // IL REPREND SON SOUFFLE, IL N'A PAS FINI.
        //
        // L'envoi programmé pendant la pause est annulé net : ce qui est déjà
        // assemblé attendra la suite de sa phrase. C'est ce qui permet à un
        // enfant d'expliquer pendant une minute, en respirant entre ses
        // phrases, sans que son explication parte en six messages dont cinq
        // annulés.
        onReprise: () => {
          const { minuteur } = assemblageRef.current;
          if (!minuteur) return;

          clearTimeout(minuteur);
          assemblageRef.current = { ...assemblageRef.current, minuteur: null };
        },

        // Pas de détection d'écho sur ce chemin, contrairement au moteur du
        // navigateur : on demande ici l'annulation d'écho au micro lui-même,
        // et le risque s'inverse. Un élève qui reprend les mots du professeur
        // — « ça donne trois quarts », juste après qu'elle les a dits — serait
        // pris pour un retour de haut-parleur, et sa réponse jetée.
        // On n'envoie PAS tout de suite : le transcripteur dit qu'une phrase
        // est finie, pas que l'élève a fini de parler. Voir tourEleve.js.
        onFinal: (texte) => {
          // Du départ de l'ordre au texte reçu. Nul si le transcripteur a
          // tranché de lui-même avant qu'on ne clôture : il n'y a alors aucun
          // départ à mesurer, et zéro serait un mensonge.
          const { silenceLe } = chronoRef.current;
          if (silenceLe) {
            chronoRef.current.transcriptionMs = performance.now() - silenceLe;
            chronoRef.current.silenceLe = 0;
          }

          partielRef.current = '';

          // Le fournisseur finit par trancher, parfois après qu'on a conclu à
          // sa place : son verdict porte alors sur une phrase DÉJÀ envoyée. La
          // reprendre la poserait deux fois.
          if (partielConsommeRef.current) {
            partielConsommeRef.current = false;
            return;
          }

          if (texte?.trim()) {
            if (cameraRef.current?.actif && estCommandePhoto(texte)) {
              setSaisie(assemblageRef.current.texte);
              prendrePhoto();
              return;
            }

            accumuler(texte);
          }
        },

        // LA LIAISON EST DÉFINITIVEMENT PERDUE — et seulement dans ce cas.
        //
        // Depuis le 13/09/2026, une coupure ordinaire ne remonte plus ici :
        // l'écoute rappelle le serveur toute seule, en gardant la parole dite
        // pendant la coupure dans sa mémoire tampon (voir `tamponParole`).
        // Ce signal ne part qu'après une longue série de rappels ratés : on
        // repasse alors en « micro fermé », et l'effet de réouverture laisse la
        // place au moteur du navigateur. Sans lui, l'interface afficherait
        // « je t'écoute » alors que plus rien ne peut partir.
        onFermeture: () => setEcoute(false),

        // Le chien de garde vient de déclencher une reprise : ce silence-là
        // avait une cause, l'élève mérite de le savoir plutôt que de croire
        // son micro cassé.
        onOreilleMorte: signalerOreilleMorte,

        // La liaison tient : les échecs d'avant ne comptent plus. Sans cet
        // oubli, trois incidents espacés d'une demi-heure finiraient par
        // condamner le temps réel aussi sûrement que trois d'affilée.
        onOuverture: () => { echecsTempsReelRef.current = 0; },

        onErreur: (message) => {
          echecsTempsReelRef.current += 1;

          // On ne renonce qu'après plusieurs échecs de suite. Avant ça, l'effet
          // de réouverture retente le temps réel — c'est le mode normal, et une
          // panne passagère ne doit pas coûter le reste de la séance.
          if (echecsTempsReelRef.current >= ECHECS_AVANT_REPLI) {
            // On bascule sur le moteur du navigateur plutôt que de laisser
            // l'élève sans micro. Il perd en fluidité, pas en usage.
            //
            // ON DATE LE RENONCEMENT AU LIEU DE LE GRAVER : voir `REPLI_MS`.
            // Sans cette date, une panne de dix secondes coûtait le reste du
            // cours, sonneries de Chrome comprises.
            replriDepuisRef.current = Date.now();
            setErreurMicro(message);
          }

          setEcoute(false);
        },
      });

      // NÉ SUSPENDU SI LE PROFESSEUR PARLE DÉJÀ.
      //
      // C'est ICI que la garde doit être posée, et pas seulement dans
      // l'effet qui programme la réouverture. `profParleRef` est une
      // référence : la changer ne rejoue aucun effet. Un micro déjà
      // programmé — la réouverture passe par un délai de 300 ms — naissait
      // donc ouvert quand le professeur prenait la parole entre-temps, et
      // sa voix repartait aussitôt dans la transcription de l'élève.
      //
      // La règle est vraie par construction à l'endroit où l'écouteur est
      // créé : quel que soit le chemin qui y mène, il ne peut pas naître
      // ouvert pendant une explication.
      if (sansCasque && profParleRef.current) {
        ecouteRef.current?.suspendre?.(true, false);
      }

      return;
    }

    ecouteRef.current = ecouteService.ecouter({
      // CE MOTEUR NE SAIT PAS ÊTRE BILINGUE, CONTRAIREMENT AU SERVEUR.
      //
      // `SpeechRecognition.lang` n'accepte qu'une langue à la fois — pas de
      // détection automatique. Sans ce réglage, un cours d'anglais restait
      // transcrit en français, et « cat » en ressortait « carte » : le
      // professeur corrigeait alors une réponse juste. Voir
      // `langueTranscription.js` pour l'arbitrage.
      langue: langueTranscription(conversation?.matiereCode),
      onPartiel: (texte) => {
        if (saisieTapeeRef.current) return;
        if (assezPourCouper(texte)) couperLaParole();
        setSaisie(texte);
      },
      onFinal: (texte) => {
        // LA MÊME RÈGLE QU'EN PARTIEL, ET C'EST TOUT LE CORRECTIF.
        //
        // Cette ligne coupait SANS CONDITION, alors que la ligne du dessus s'en
        // gardait depuis toujours. Un fragment d'un caractère arraché au bruit
        // de fond — le moteur du navigateur en produit à chaque redémarrage,
        // c'est-à-dire toutes les huit secondes — suffisait donc à couper le
        // professeur.
        //
        // Et couper n'est pas suspendre : `couperLaParole` ABANDONNE le tour.
        // Le texte continuait de s'écrire à l'écran pendant que la voix, elle,
        // ne reprenait jamais. On croyait le professeur arrêté au milieu d'une
        // phrase « comme s'il n'y avait plus rien derrière ».
        if (saisieTapeeRef.current) return;
        if (assezPourCouper(texte)) couperLaParole();
        setSaisie(texte);
      },
      onFin: (texte, diagnostic) => {
        setEcoute(false);

        // Arrêt demandé par l'élève : aucun message, aucun décompte. Le
        // silence qui suit lui appartient.
        if (arretVolontaireRef.current) {
          arretVolontaireRef.current = false;
          if (texte?.trim() && !saisieTapeeRef.current) setSaisie(texte);
          return;
        }

        if (texte?.trim()) {
          silencesRef.current = 0;

          if (cameraRef.current?.actif && estCommandePhoto(texte)) {
            viderSaisie();
            prendrePhoto();
            return;
          }

          // Le micro a rendu au professeur ce qu'il venait de dire : l'élève
          // est sur haut-parleurs. On ne l'envoie surtout pas — le cours
          // partirait en boucle sur lui-même — et on le dit franchement,
          // parce que c'est un problème d'équipement que l'élève peut régler.
          const { texte: parole, finLe } = paroleProfRef.current;

          if (estUnEcho(texte, parole, finLe)) {
            setMainsLibres(false);
            viderSaisie();
            lecteurRef.current.arreter();

            signaler(
              "Attends, je crois que je m'entends parler dans ton micro. Mets un casque, ou coupe le micro quand je parle : sinon je confonds ta voix et la mienne.",
              'Le micro a capté la voix du professeur. Un casque règle le problème ; le mode mains libres a été coupé.',
            );
            return;
          }

          // Envoi automatique après un court silence : l'élève porte un casque,
          // lui demander de cliquer « Envoyer » casserait la conversation.
          envoyerTexte(texte);
          return;
        }

        // Le professeur parlait encore : ce silence n'est pas celui de l'élève,
        // c'est le sien. Depuis que le micro reste ouvert pendant qu'elle
        // parle — pour qu'on puisse la couper — les fenêtres d'écoute défilent
        // PENDANT l'énoncé de la question. L'élève ne l'a pas fini d'entendre
        // que deux silences sont déjà comptés, et elle lui annonce qu'elle
        // n'entend rien. On ne compte pas, on se remet simplement à l'écoute.
        if (lecteurRef.current.estOccupe()) {
          setTourDeParole((n) => n + 1);
          return;
        }

        // En mains libres, un silence n'est pas une panne : l'élève réfléchit.
        // On se remet à l'écoute sans rien dire. Ce n'est qu'au bout de
        // plusieurs tours à vide qu'on s'inquiète — sinon le professeur
        // répéterait « je ne t'ai pas entendu » toutes les vingt secondes.
        //
        // Le cas « micro muet » passe par le MÊME compteur. Il en était exclu,
        // et c'était un contresens : un enfant qui réfléchit avec un casque
        // sur les oreilles ne produit aucun son, donc son micro est déclaré
        // muet — et il se faisait rappeler à l'ordre au premier blanc.
        if (mainsLibresRef.current) {
          silencesRef.current += 1;

          if (silencesRef.current < SILENCES_AVANT_RELANCE) {
            setTourDeParole((n) => n + 1);
            return;
          }

          silencesRef.current = 0;
          setMainsLibres(false);

          // Le professeur ne parle JAMAIS du matériel. Un professeur particulier
          // ne s'interrompt pas pour dire « je n'entends rien, vérifie ton
          // micro » — et l'entendre le dire alors qu'on réfléchit casse tout.
          // Le diagnostic reste, mais il s'écrit, il ne se prononce pas.
          if (diagnostic?.muet) {
            setErreurMicro(
              diagnostic.peripherique
                ? `Aucun son ne sort de « ${diagnostic.peripherique} ». Change de micro via l'icône 🎤 dans la barre d'adresse, ou écris ton message.`
                : "Aucun son n'a été capté. Vérifie le micro dans les réglages du navigateur, ou écris ton message.",
            );
            return;
          }

          // Silencieux lui aussi. « Tu es toujours là ? » sonne juste dans la
          // bouche d'un professeur, mais il n'a aucun moyen de distinguer un
          // élève parti d'un élève en train de chercher — et se tromper coûte
          // beaucoup plus cher que de se taire.
          setErreurMicro(
            'Le micro s’est mis en veille après un long silence. '
              + 'Reclique dessus quand tu veux reprendre la parole.',
          );
          return;
        }

        // Rien transcrit. Le micro n'a-t-il rien capté, ou n'a-t-on rien
        // compris ? Les deux appellent une consigne opposée — répéter ne sert
        // à rien si le périphérique est muet.
        //
        // Le cas « rien capté » est un problème d'équipement : il s'affiche,
        // il ne se prononce pas. Le professeur ne fait pas de support
        // technique, et l'entendre en parler casse le cours.
        if (diagnostic?.muet) {
          setErreurMicro(
            diagnostic.peripherique
              ? `Aucun son ne sort de « ${diagnostic.peripherique} ». Change de micro via l'icône 🎤 dans la barre d'adresse, ou écris ton message.`
              : "Aucun son n'a été capté. Vérifie le micro dans les réglages du navigateur, ou écris ton message.",
          );
          return;
        }

        // Celui-ci se dit : l'élève a cliqué sur le micro et a parlé, mais on
        // n'a rien compris. « Tu peux répéter ? » est une phrase de professeur.
        signaler(
          "Je ne t'ai pas entendu. Tu peux répéter ?",
          'Le micro fonctionne mais rien n’a été transcrit. Parle un peu plus fort, ou écris ton message.',
        );
      },
      // LE MICRO EST OUVERT MAIS N'ENTEND RIEN — Camara, le 16/09/2026 : trois
      // familles sur PC, « comme si leur micro était en mute », casque ou
      // haut-parleur, et rien à reproduire chez lui. Le moteur du navigateur
      // savait le dire (voir `onFin` plus haut) ; celui-ci ne mesurait rien.
      //
      // ÉCRIT, JAMAIS PRONONCÉ, ET SANS COUPER L'ÉCOUTE : si la mesure se
      // trompe, l'élève continue comme si de rien. Le message dit quoi faire
      // sur Windows, parce que c'est là que ça arrive.
      onMuet: (diagnostic) => {
        setErreurMicro(
          diagnostic?.pisteMuette
            ? "Ton micro est coupé par l'ordinateur, pas par le site. Sur Windows : Paramètres › Confidentialité › Microphone, autorise le navigateur ; vérifie aussi la touche « muet » du casque. Ou écris ton message."
            : diagnostic?.peripherique
              ? `Aucun son ne sort de « ${diagnostic.peripherique} ». Un autre micro est peut-être sélectionné : change-le via l'icône 🎤 dans la barre d'adresse, vérifie qu'il n'est pas coupé, ou écris ton message.`
              : "Aucun son n'a été capté. Vérifie le micro dans les réglages du navigateur, ou écris ton message.",
        );
      },
      onErreur: (message) => {
        setEcoute(false);

        // Une panne de micro rend le mains libres inopérant : on le coupe
        // plutôt que de boucler sur la même erreur. Là encore, sans un mot :
        // c'est le navigateur qui a un problème, pas la leçon.
        setMainsLibres(false);
        setErreurMicro(message);
      },
    });
  }, [envoyerTexte, accumuler, armerEnvoi, signaler, couperLaParole, conversation, sansCasque,
      prendrePhoto, signalerOreilleMorte,
      ]);

  const basculerMicro = () => {
    if (seanceTerminee) return;

    if (ecoute) {
      arretVolontaireRef.current = true;
      ecouteRef.current?.arreter();

      // L'état doit retomber ICI. Le moteur du navigateur le faisait lui-même
      // en signalant sa fin d'écoute ; la liaison temps réel n'a pas cet
      // événement, et une fermeture volontaire ne déclenche pas non plus la
      // reprise. Sans cette ligne, `ecoute` restait à vrai pour toujours et le
      // micro ne se rouvrait plus jamais.
      setEcoute(false);
      return;
    }

    // Cliquer sur le micro pendant que le professeur parle, c'est lever la
    // main : on n'attend pas de l'entendre parler pour le faire taire.
    couperLaParole();
    demarrerEcoute();
  };

  /**
   * Mains libres : l'élève n'a plus à cliquer, le micro reste ouvert — y
   * compris pendant que le professeur parle, pour qu'il puisse le couper.
   */
  const basculerMainsLibres = () => {
    const nouveau = !mainsLibres;
    setMainsLibres(nouveau);
    localStorage.setItem('school-ia-mains-libres', nouveau ? '1' : '0');

    silencesRef.current = 0;
    setErreurMicro(null);

    if (!nouveau) {
      arretVolontaireRef.current = true;
      ecouteRef.current?.arreter();

      // Même raison qu'au bouton micro : sans ce retour à « fermé », rallumer
      // la détection automatique ne rouvrait rien — la réouverture se croyait
      // déjà faite.
      setEcoute(false);
    }
  };

  // Annonces de fin de séance. Le professeur prend la parole de lui-même :
  // c'est l'horloge du navigateur qui commande, le serveur ne connaît ni la
  // durée choisie ni l'heure d'entrée.
  useEffect(() => {
    if (!conversation || streaming) return;

    // Les adieux sont dits : plus une seule annonce. L'élève peut prendre
    // congé à trente secondes de la fin — le professeur lui répond, la séance
    // se ferme, et l'annonce d'échéance partait derrière comme si de rien
    // n'était. Il disait donc au revoir DEUX fois, à quelques secondes
    // d'intervalle, la seconde fois sans que personne lui ait rien demandé.
    if (adieuFait) return;

    // MÊME SANS LA BALISE, S'IL A DÉJÀ DIT AU REVOIR EN TOUTES LETTRES.
    //
    // C'est arrivé : le professeur répond à l'élève qui prend congé par un
    // « À bientôt Bilal ! » tout à fait réel, mais sans poser [FIN_SEANCE].
    // `adieuFait` reste alors faux, rien n'arrête cet effet, et dix secondes
    // plus tard l'annonce d'échéance partait quand même — un second
    // « au revoir » que personne n'avait demandé, cette fois avec la balise.
    // Ce filet ne ferme rien d'autre que cette annonce : le chronomètre et
    // le micro restent gouvernés par la vraie balise, comme avant.
    if (
      indexDernierProf !== -1
      && sembleDireAuRevoir(messages[indexDernierProf]?.contenu)
    ) {
      return;
    }

    // Pendant un contrôle, le professeur se tait : ni préavis ni conclusion.
    // Annoncer « il reste cinq minutes » au milieu d'une question est
    // exactement l'interruption qu'on cherche à éviter, et conclure avant la
    // copie rendue couperait l'élève en plein travail.
    //
    // Une exception : le rab n'est pas illimité. Passé dix minutes on
    // prévient, passé douze on clôture — sinon un contrôle abandonné en cours
    // laisserait la séance et le micro ouverts sans fin.
    if (evaluationEnCours && !rabEpuise) {
      /**
       * DEUX MINUTES AVANT LA FIN, ET SA COPIE N’EST PAS ARRIVÉE.
       *
       * Camara, le 18/09/2026 : « il préviendra l’élève en lui disant de
       * commencer à conclure et d’essayer d’envoyer sa copie… il ne fera
       * qu’une fois ce rappel, c’est tout, pas de répétition ».
       *
       * AU CAHIER SEULEMENT. À l’ordinateur, chaque réponse arrive au fil
       * des questions : il n’y a pas de copie qui pourrait rester sur la
       * table, et prévenir n’aurait aucun sens.
       *
       * ET SEULEMENT SI RIEN N’EST ENCORE ARRIVÉ. Presser celui qui vient
       * d’envoyer sa photo serait le pire des deux mondes : il croirait
       * que son envoi a échoué.
       *
       * LE RAB NE LE REJOUE PAS. Le drapeau est posé une fois pour la
       * séance ; passé l’heure, ce sont les deux annonces de clôture qui
       * prennent le relais, et elles disent déjà ce qu’il faut.
       */
      if (
        support === CAHIER
        && restant <= RAPPEL_COPIE
        && !annoncesRef.current.copieAttendue
        && !copieEvaluationRendue(messages)
      ) {
        annoncesRef.current.copieAttendue = true;
        dispatch(annoncer(conversation.id, 'copie-attendue'));
        return;
      }

      if (depasse >= RAB_MAXIMUM && !annoncesRef.current.clotureForcee) {
        annoncesRef.current.clotureForcee = true;

        // La clôture forcée porte aussi la conclusion : sans ce marqueur,
        // l'annonce de fin partirait derrière et le professeur dirait au
        // revoir deux fois.
        annoncesRef.current.fin = true;
        setRabEpuise(true);
        setMainsLibres(false);
        dispatch(annoncer(conversation.id, 'cloture-forcee'));
        return;
      }

      if (depasse >= RAB_AVERTISSEMENT && !annoncesRef.current.clotureProche) {
        annoncesRef.current.clotureProche = true;
        dispatch(annoncer(conversation.id, 'cloture-proche'));
      }

      return;
    }

    if (restant <= 0 && !annoncesRef.current.fin) {
      annoncesRef.current.fin = true;
      setMainsLibres(false);
      dispatch(annoncer(conversation.id, 'fin'));
      return;
    }

    // Le professeur salue. Ce message VAUT conclusion, d'où le marqueur `fin`
    // posé en même temps — sans lui, l'annonce d'échéance partirait quelques
    // secondes plus tard et il dirait au revoir deux fois.
    if (restant <= PREAVIS_FINAL && restant > 0 && !annoncesRef.current.preavisFinal) {
      annoncesRef.current.preavisFinal = true;
      annoncesRef.current.fin = true;
      setMainsLibres(false);
      dispatch(annoncer(conversation.id, 'fin-imminente'));
      return;
    }

    // L'ANNONCE DES CINQ MINUTES A ÉTÉ RETIRÉE.
    //
    // Elle faisait doublon, et de la pire façon : le marqueur de temps voyage
    // désormais avec chaque message de l'élève, le professeur connaît donc le
    // temps restant en permanence et l'annonce de lui-même, au bon moment,
    // dans le fil de ce qu'il est en train de dire. Relevé en séance :
    //
    //   « On a 5 minutes, donc je te propose juste un petit exercice… »
    //   « Il nous reste cinq minutes, Bilal, on va prendre le temps de… »
    //
    // Deux messages d'affilée pour dire la même chose, le second coupant
    // l'exercice que le premier venait de lancer. Une annonce déclenchée par
    // l'horloge ne peut pas savoir ce qu'il était en train de faire ; lui, si.
    //
    // Le préavis reste VISIBLE — le minuteur passe en « bientôt » sous cinq
    // minutes. Il informe sans interrompre, ce qui est exactement le rôle
    // qu'on attendait de cette annonce.
  }, [
    restant, depasse, conversation, streaming, evaluationEnCours, rabEpuise, adieuFait,
    messages, indexDernierProf, support, dispatch,
  ]);

  /**
   * Rouvre le micro dès qu'une réponse est possible — Y COMPRIS pendant que le
   * professeur parle.
   *
   * Il attendait auparavant que le lecteur soit silencieux, ce qui rendait
   * l'interruption impossible : tant que le professeur parlait, le micro était
   * fermé, et l'élève ne pouvait que subir la fin de l'explication.
   *
   * Le risque, sans casque, est que le micro capte la voix du professeur et la
   * prenne pour une interruption. C'est déjà traité en aval : `estUnEcho`
   * reconnaît le retour, coupe le mode mains libres et explique le problème.
   */
  useEffect(() => {
    if (!mainsLibres || seanceTerminee || streaming || ecoute || !vocalDispo) {
      return undefined;
    }

    // SANS CASQUE, ON N'OUVRE PAS PENDANT QU'IL PARLE.
    //
    // Suspendre l’écouteur en cours ne suffisait pas : cet effet en crée un
    // NEUF à chaque tour, et un écouteur neuf naît ouvert. La suspension
    // posée par `auDebutDeParole` serait alors perdue au premier
    // renouvellement, c’est-à-dire aussitôt.
    //
    // `tourDeParole` fait partie des dépendances et change au silence : la
    // réouverture se rejoue donc toute seule dès que le professeur a fini.
    if (sansCasque && profParleRef.current) return undefined;

    // Un court délai évite de rouvrir le micro dans la même image que sa
    // fermeture, ce qui ferait démarrer deux reconnaissances concurrentes.
    //
    // SUR iOS SANS CASQUE, CE DÉLAI EST PLUS LONG : voir
    // `DELAI_REOUVERTURE_IOS_HP_MS`. La sortie qui vient de jouer et
    // l'entrée qu'on réclame se disputent la même session audio, et 300 ms
    // ne laisse pas toujours à iOS le temps de la reconfigurer.
    const delai = sansCasque && estIOS() ? DELAI_REOUVERTURE_IOS_HP_MS : DELAI_REOUVERTURE_MS;
    const minuteur = setTimeout(demarrerEcoute, delai);
    return () => clearTimeout(minuteur);
  }, [mainsLibres, seanceTerminee, streaming, ecoute, tourDeParole, vocalDispo,
      sansCasque, demarrerEcoute]);

  if (loading) return <Loader texte="Le professeur arrive…" />;

  /**
   * LE DÉCOMPTE, DANS LA BULLE DU PROFESSEUR — Camara, le 17/09/2026 : « au
   * final, sur PC aussi, mets le chrono dans la même bulle que le professeur ».
   *
   * Il n'a plus qu'une seule place, à toutes les largeurs. Il en a eu deux le
   * temps d'une étape — une pour le téléphone, une pour l'ordinateur, le CSS
   * masquant celle qui ne servait pas — parce qu'aucune feuille de style ne
   * déplace un élément d'un parent à l'autre. La bulle valant pour les deux,
   * cette copie n'a plus lieu d'être : un seul décompte dans la page, donc un
   * seul dans l'arbre d'accessibilité.
   *
   * DÉCOMPTE ET NON TEMPS ÉCOULÉ : ce qui compte pour l'élève, c'est le temps
   * qu'il lui RESTE. La couleur change aux paliers plutôt que progressivement
   * — un dégradé continu ne se remarque jamais.
   */
  const decompte = (
    <span
      className={`chrono chrono--${
        quota
          ? 'suspendu'
          : depassement
            ? 'depassement'
            : restant === 0
              ? 'fini'
              : restant <= 60
                ? 'urgence'
                : restant <= PREAVIS
                  ? 'bientot'
                  : 'normal'
      }`}
      title={
        quota
          ? "Le forfait ne permet pas de suivre de cours"
          : depassement
            ? 'Le temps est écoulé, mais le contrôle se termine'
            : `Séance de ${dureeSeance} minutes`
      }
      aria-label={
        quota
          ? 'Séance suspendue, le forfait ne le permet pas'
          : depassement
            ? 'Temps dépassé, le contrôle se termine'
            : restant === 0
              ? 'Séance terminée'
              : `Il reste ${Math.ceil(restant / 60)} minutes de séance`
      }
    >
      {/* Pas de jauge quand la séance est suspendue : une barre à moitié
          pleine laisserait croire qu'un temps a été consommé. */}
      {!quota && (
        <span className="chrono__jauge" aria-hidden="true">
          <span style={{ width: `${(restant / (dureeSeance * 60)) * 100}%` }} />
        </span>
      )}
      {quota
        ? 'Suspendu'
        : depassement
          ? 'Contrôle en cours'
          : restant === 0
            ? 'Terminé'
            : formaterDuree(restant)}
    </span>
  );

  return (
    <div className="chat-espace">
    {copie && <Controle copie={copie} onFermer={() => setCopie(null)} />}

    <section className="chat">
      {/* LA CONFIRMATION DE LA PHOTO PRISE À LA VOIX.
          Se referme toute seule après quelques secondes : l'élève vient de
          parler sans toucher l'écran, il n'a rien à fermer non plus. */}
      {confirmationPhoto && (
        <div className="toast-photo" role="status">
          <span aria-hidden="true">✅</span> La photo est envoyée, le professeur l&apos;analyse.
        </div>
      )}

      {/* LE BANDEAU ET L'EN-TÊTE NE FONT QU'UN BLOC COLLANT.

          Collés séparément, ils se posaient au même décalage sous la barre
          de navigation — et celui du dessus recouvrait l'autre. L'en-tête
          n'avait pas disparu : « Quitter », « Relancer » et le nom du
          professeur étaient simplement cachés derrière le temps.

          Les réunir évite de calculer un décalage qui dépendrait de la
          hauteur du bandeau, laquelle change avec la taille de l'écran et
          avec l'état de la séance. Un seul bloc, un seul point de collage. */}
      {/* LA COULEUR DE LA MATIÈRE SUR LE BANDEAU — Camara, le 17/09/2026 :
          « améliore le background derrière les éléments, peut-être en fonction
          de la matière ». Les deux teintes sont posées ici et c'est la feuille
          de style qui tranche selon le thème : choisir en React ne suivrait
          pas un changement de thème système. Voir `styleMatiere`.

          `conversation` peut être nulle au premier rendu — `styleMatiere` rend
          alors la teinte de repli, et le bandeau ne clignote pas. */}
      <div
        className="chat__tete"
        data-mur={murMatiere(conversation)}
        style={styleMatiere(conversation)}
      >

      {/* LE TEMPS, SEUL ET EN GRAND, SOUS LA BARRE DE NAVIGATION.

          Il vivait au bout de la rangée des boutons, à la taille d'une
          pastille. C'est pourtant la seule information que l'élève consulte
          sans arrêt : il organise sa séance dessus, et il doit pouvoir la
          lire d'un coup d'œil sans la chercher.

          Sorti de l'en-tête, il ne se bat plus pour la place avec « Quitter »
          et « Relancer » — c'est ce qui le faisait rogner sur mobile — et il
          reste au même endroit quel que soit l'état de la séance.

          Collé sous la barre : il ne quitte jamais l'écran, au bureau comme
          sur téléphone. */}
      {/* L'HEURE QU'IL EST, ET ELLE SEULE.

          Le décompte est retourné dans l'en-tête, à sa place et à sa taille :
          il appartient à la séance, aux côtés de « Quitter » et « Relancer ».

          L'heure, elle, appartient à la journée — c'est elle qu'on regarde pour
          savoir s'il faut descendre dîner, et c'est elle qu'un parent qui passe
          derrière son enfant cherche en premier. D'où sa place à part, en haut
          et au centre. */}
      <div className="chrono-bandeau">
        <HorlogeReelle />
      </div>

      <header className="chat__entete">
        {/* LE PROFESSEUR DANS SA BULLE, SOUS L'HORLOGE — Camara, le 17/09/2026 :
            « fais en sorte que la bulle soit centrée bien en dessous de
            l'horloge ».

            SUR SA PROPRE LIGNE, et c'est ce qui la centre vraiment. Laissée dans
            la rangée des boutons, elle ne pouvait pas l'être : « Quitter » et
            « Relancer » pèsent à gauche bien plus que le décompte à droite, et
            l'espace libre se répartissant autour d'elle, elle tombait une
            centaine de pixels à droite du milieu — sous rien du tout.

            La bulle réunit avatar, prénom et matière parce que c'est une seule
            information : qui fait cours, et en quoi. Le prénom de l'ÉLÈVE en a
            été retiré — on le lui affichait au milieu de SA séance, sur SON
            écran. */}
        <div className="chat__prof-ligne">
          <span className="chat__prof">
            <Avatar
              nom={conversation?.profAvatar}
              couleur={conversation?.profCouleur}
              taille={38}
              parle={streaming && !muet}
            />

            <span className="chat__titre">
              {conversation?.profPrenom ?? conversation?.matiereLibelle}
              <span className="chat__eleve">{conversation?.matiereLibelle}</span>
            </span>

            {/* Il n'apparaît que sur téléphone — voir `.chat__prof-chrono`. La
                matière lui cède la place : elle est déjà écrite en toutes
                lettres dans le premier message du professeur. */}
            <span className="chat__prof-chrono">{decompte}</span>
          </span>
        </div>

        <span className="chat__gestes">
          {/* « QUITTER » SUFFIT — Camara, le 17/09/2026. Le libellé complet
              prenait la moitié de la rangée pour dire ce que le bouton dit déjà
              par sa place et sa couleur.

              LE NOM ACCESSIBLE GARDE LA PHRASE : un lecteur d'écran annonce
              « Quitter le cours », et la commande vocale accepte les deux — le
              nom contient le texte visible, c'est ce qu'exige la règle. */}
          <button
            type="button"
            className="btn-quitter"
            onClick={quitter}
            title="Quitter le cours"
            aria-label="Quitter le cours"
          >
            Quitter
          </button>

          {/* Une séance finie laisse deux issues, et une seule est mise en avant :
              repartir. « Quitter » reste en retrait plutôt que de rivaliser —
              deux boutons pleins côte à côte ne hiérarchisent plus rien. */}
          {/* Le contrôle reste téléchargeable quand tout le reste est verrouillé :
              c'est le document de l'élève, la fin de séance ne le lui retire pas. */}
          {copieId && (
            <button
              type="button"
              className="btn-copie"
              onClick={ouvrirCopie}
              disabled={copieEnCours}
            >
              <span aria-hidden="true">▤</span>{' '}
              {copieEnCours ? 'Ouverture…' : 'Mon contrôle'}
            </button>
          )}

        </span>

        <span className="chat__etat">
          {/* Le rappel du contrôle vit ICI, dans l'en-tête, et non au-dessus de
              la saisie où il repoussait le champ et le micro. Il reste sous les
              yeux — un enfant qui revient après deux minutes doit voir qu'il est
              en évaluation — mais il ne mange plus la place de ce qui sert à
              répondre. Le détail est dans l'infobulle : la consigne complète a
              déjà été dite à l'oral. */}
          {evaluationEnCours && !depassement && (
            <span
              className="chip-controle"
              title={`${conversation?.profPrenom ?? 'Ton professeur'} ne t'aide plus pendant l'évaluation. Prends ton temps, et réponds du mieux que tu peux.`}
            >
              <span className="chip-controle__pastille" aria-hidden="true" />
              Contrôle
            </span>
          )}

          <button
            type="button"
            className={`chat__son ${muet ? 'chat__son--coupe' : ''}`}
            onClick={basculerSon}
            title={muet ? 'Réactiver la voix' : 'Couper la voix'}
            aria-label={muet ? 'Réactiver la voix' : 'Couper la voix'}
          >
            {/* LE DESSIN NE DIT RIEN, ET C'EST VOULU : `alt` vide et
                `aria-hidden`. C'est le bouton qui porte le sens, dans son
                `aria-label` — sans quoi un lecteur d'écran annoncerait deux
                fois la même chose. La barre du son coupé est tracée par la
                feuille de style : il n'existe qu'un seul dessin. */}
            <img
              className="chat__son-icone"
              src={hautParleurPng}
              alt=""
              aria-hidden="true"
            />
          </button>
        </span>

        {/* SA PROPRE RANGÉE, SOUS LES TROIS AUTRES — Camara, le 17/09/2026 :
            « sur mobile, mets le bouton relancer en dessous de la ligne où on a
            Quitter, la bulle du professeur et le haut-parleur ».

            IL A FALLU LA SORTIR DU GROUPE DE GAUCHE. Restée dedans, elle ne
            pouvait occuper que le tiers gauche de la rangée — une boîte flex ne
            laisse pas sortir ses enfants —, et c'est ce qui lui faisait pousser
            la bulle et le son à mi-hauteur. */}
        {seanceTerminee && !quota && (
          // Inactif tant que le professeur conclut : sa parole ne se coupe pas,
          // et la saga d'annonce ignore une demande pendant qu'elle en traite une
          // autre — la nouvelle séance démarrerait sans un mot.
          <span className="chat__relance">
            <button
              type="button"
              className="btn-relancer"
              onClick={relancer}
              disabled={streaming}
              title={streaming ? 'Laisse le professeur terminer' : undefined}
            >
              <span aria-hidden="true">↻</span> Relancer {dureeSeance} min
            </button>
          </span>
        )}

      </header>
      </div>

      {/* DIT UNE FOIS, EN HAUT, ET PAS À CHAQUE TOUR.
          L’élève a répondu qu’il écoutait sur haut-parleur : il doit savoir
          que parler pendant l’explication ne servira à rien, sinon il
          essaiera, échouera, et croira que le micro est cassé. */}
      {sansCasque && mainsLibres && (
        <p className="chat__demi-duplex">
          <span aria-hidden="true">🔊</span>
          Tu écoutes sur haut-parleur : ton micro se met en pause pendant que
          le professeur parle, et se rouvre dès qu’il a fini.
        </p>
      )}

      <div className="chat__fil" ref={filRef}>
        {messages.length === 0 && !streaming && (
          <div className="chat__accueil">
            <Avatar
              nom={conversation?.profAvatar}
              couleur={conversation?.profCouleur}
              taille={82}
            />
            <p>Mets ton casque.</p>
            <p className="chat__accueil-note">
              {conversation?.profPrenom ?? 'Ton professeur'} va te parler.
            </p>
          </div>
        )}

        {/* Certains messages ne s'adressent pas à l'élève : [EVALUATION_ABANDONNEE]
            est enregistré seul, dans son propre message, et une fois les
            marqueurs retirés il ne reste rien. La bulle, elle, se dessinait
            quand même — un rectangle vide au milieu de la conversation. */}
        {/* LE MESSAGE QUI PORTE UNE DICTÉE ATTEND LE CHOIX DU SUPPORT.

            La voix, elle, attendait déjà. Le texte, non : l'élève lisait
            « Écoute bien, je te la lis en entier. Prends ton temps, et
            dis-moi quand tu as fini d'écrire » AU-DESSUS de la question
            « Comment veux-tu écrire cette dictée ? » — trois phrases qui
            parlent d'une lecture qui n'a pas eu lieu et d'une écriture qui
            n'a pas commencé.

            LA CONSIGNE NE SUFFIT PAS, C'EST MESURÉ. La règle est écrite dans
            le prompt depuis le 11/09/2026, le serveur tournait bien avec, et
            le professeur a réécrit les mêmes phrases au test suivant. Une
            garantie d'usage ne se demande pas au modèle, elle s'impose ici —
            c'est la leçon déjà tirée pour le marqueur de cahier.

            Rien n'est perdu : le message s'affiche entier dès le clic, au
            moment même où la voix le prononce. */}
        {messages
          .filter((m) => aQuelqueChoseAMontrer(m.contenu) || m.pieceJointe)
          .filter((m, i, liste) => !(
            // LE DERNIER SEULEMENT : les dictées passées restent lisibles.
            // Sans cette borne, une nouvelle dictée en attente de choix
            // effaçait du fil toutes celles des séances précédentes.
            dicteeEnAttente
            && i === liste.length - 1
            && contientDictee(m.contenu)
          ))
          .map((message) => (
            <div
              key={message.id}
              className={`bulle bulle--${message.role === 'user' ? 'eleve' : 'agent'}`}
            >
              {(message.piecesJointes ?? (message.pieceJointe ? [message.pieceJointe] : []))
                .map((piece) => (
                  <PieceJointeBulle
                    key={piece.id}
                    conversationId={conversation?.id}
                    piece={piece}
                    onAgrandir={(url, nom) => setAgrandie({ url, nom })}
                  />
                ))}
              <Contenu texte={message.contenu} onRappelerTableau={setTableauRappele} />
            </div>
          ))}

        {/* LE SUPPORT DE L'ÉVALUATION, À LA SUITE DU MESSAGE QUI LE DEMANDE.

            Masquée pendant que le professeur parle, comme les deux autres
            cartes : sa préconisation arrive en flux, et la question se
            serait posée avant qu'il ait fini de dire laquelle il conseille.

            Masquée aussi quand la séance est finie : un choix de support
            sur un contrôle qui ne commencera jamais. */}
        {support === null && !streaming && !seanceTerminee && (
          <SupportEvaluation
            disabled={streaming || seanceTerminee}
            onChoisir={choisirSupport}
          />
        )}

        {/* LA COPIE DU CONTRÔLE, À LA SUITE DU MESSAGE QUI LA PROPOSE.
            Masquée pendant que le professeur parle : elle apparaît quand il a
            fini sa phrase, comme la question du choix de dictée. */}
        {etatCopie && !streaming && !seanceTerminee && (
          <CopieControle
            etat={etatCopie}
            disabled={streaming || seanceTerminee || piecesEnAttente.length >= PIECES_MAX}
            onChoisir={choisirCopie}
            onFichier={envoyerPieceCopie}
            onScanner={scannerNatif ? undefined : scannerCopie}
          />
        )}

        {/* Même règle pendant que le professeur écrit : la dictée arrive
            souvent en flux, et la bulle se remplissait sous la question. */}
        {streaming && !dicteeEnAttente && (
          <div className="bulle bulle--agent">
            <Contenu texte={reponseEnCours} onRappelerTableau={setTableauRappele} />
            <span className="curseur" />
          </div>
        )}

        {/* DANS LE FIL, ET NON EN DESSOUS.
            Retour explicite pendant l'écoute : sans lui, l'élève ne sait pas si
            le professeur l'entend et finit par répéter ou abandonner.

            Il vivait sous le fil, en frère. Il lui prenait donc sa hauteur en
            apparaissant, et le bas de la conversation passait sous le bord —
            un message coupé en plein milieu, sans qu'aucun n'ait bougé. Un
            observateur de taille recollait bien le fil, mais après coup, et
            jamais tout à fait : pendant que le professeur écrit, la hauteur du
            contenu change plus vite que le défilement ne rattrape.

            Ici la question ne se pose plus. L'indicateur EST du contenu : il se
            place à la suite du dernier message comme le ferait une bulle, il
            défile avec lui, et il ne peut rien cacher puisqu'il ne recouvre
            rien et ne rogne aucune hauteur. */}
        {/* LE SILENCE DE DICTÉE, DIT À L'ÉCRAN.

            L'élève entend une phrase puis plus rien pendant vingt à quarante
            secondes, selon sa classe. C'est voulu — c'est le temps d'écrire —
            mais rien ne le disait : un enfant croit que ça a planté et clique
            ailleurs, ce qui coupe la dictée.

            Même place que l'indicateur d'écoute, et pour la même raison : il
            est DU CONTENU, à la suite du dernier message. Il défile avec le
            fil, ne recouvre rien et ne rogne aucune hauteur.

            Il passe avant l'écoute : pendant une dictée le micro est fermé,
            les deux ne peuvent pas se présenter ensemble — et si cela
            arrivait, c'est celui-ci qui dit la vérité du moment. */}
        {/* LA COPIE EN COURS, quand la dictée se fait au clavier.

            Elle est DANS LE FIL et non dans un panneau à part : c'est le
            cahier de l'élève, il doit être là où il regarde déjà. Les phrases
            validées s'empilent, numérotées comme des lignes de cahier.

            Rien de tout cela n'est envoyé au professeur avant que l'élève
            rende sa copie — c'est ce qui garantit qu'il ne dit rien pendant la
            dictée. */}
        {/* LE CHOIX DU MODE, POSÉ PAR L'ÉCRAN ET NON PAR LE PROFESSEUR.

            Il apparaît dès qu'une dictée arrive et que l'élève n'a pas encore
            dit comment il écrit. La voix attend ce clic : sans ça, la première
            phrase serait prononcée pendant qu'il cherche son stylo.

            Deux boutons et rien d'autre. Pas de croix, pas d'échappatoire :
            une dictée sans support n'a pas de sens, et laisser fermer la
            question rendrait la voix muette pour toujours. */}
        {/* LA VITESSE, AVANT D'ENTENDRE QUOI QUE CE SOIT.
            La voix attend ce clic, comme elle attend le support d'une dictée :
            entendre le passage une première fois au mauvais débit, c'est
            l'exercice qui commence sans l'élève. */}
        {vitesseEnAttente && (
          <div className="choix-dictee choix-dictee--vitesse">
            {/* « QUE JE PARLE » EN CONVERSATION, « que je lise » ailleurs.
                Le professeur ne lit pas un passage, il discute : lui demander
                à quelle vitesse il va LIRE annoncerait un exercice qui ne
                vient pas. */}
            <p className="choix-dictee__question">
              À quelle vitesse veux-tu que je
              {enConversation ? " parle" : " lise"}
              &nbsp;?
            </p>

            <div className="choix-dictee__boutons">
              {VITESSES.map((vitesse) => (
                <button
                  key={vitesse.cle}
                  type="button"
                  className="btn btn--fantome"
                  onClick={() => choisirVitesseEcoute(vitesse.cle)}
                >
                  {/* LE DESSIN SUFFIT, SANS SA PHRASE — Camara, le 16/09/2026 :
                      « enlève les sous-titres ». Le personnage qui traîne ou
                      qui court dit le débit mieux que « mot à mot », et
                      l'enfant choisit ici en une seconde. La phrase reste sur
                      la page d'accueil, où c'est un parent qui lit. */}
                  <img className="choix-dictee__image" src={vitesse.image} alt="" />
                  {vitesse.libelle}
                </button>
              ))}
            </div>
          </div>
        )}

        {dicteeEnAttente && (
          <div className="choix-dictee">
            <p className="choix-dictee__question">
              Comment veux-tu écrire cette dictée&nbsp;?
            </p>

            <div className="choix-dictee__boutons">
              <button
                type="button"
                className="btn btn--fantome"
                onClick={() => choisirModeDictee('cahier')}
              >
                <span aria-hidden="true">📓</span>
                Sur mon cahier
                <small>Tu m’enverras une photo à la fin</small>
              </button>

              <button
                type="button"
                className="btn btn--fantome"
                onClick={() => choisirModeDictee('clavier')}
              >
                <span aria-hidden="true">⌨️</span>
                Au clavier
                <small>Une phrase, puis Entrée</small>
              </button>
            </div>
          </div>
        )}

        {copieDictee && (
          <div className={`copie-dictee${relectureTerminee ? ' copie-dictee--pret' : ''}`}>
            <div className="copie-dictee__entete">
              <span className="copie-dictee__titre">Ta copie</span>
            </div>

            {copieDictee.length === 0 ? (
              <p className="copie-dictee__vide">
                Écris ta première phrase dans le champ en bas.
              </p>
            ) : (
              // Modifiables jusqu'au rendu, avec insertion à sa place —
              // voir `LignesCopie`.
              <LignesCopie lignes={copieDictee} onLignes={setCopieDictee} />
            )}

            {/* LES DEUX GESTES, SOUS LA COPIE — voulu par Camara le 11/09/2026.
                En gris au bout de l'en-tête, personne ne les lisait ; en
                pastilles au-dessus, ils prenaient plus de place que la copie
                et ressemblaient à des boutons. Une ligne lisible, sans forme
                de bouton, là où l'élève regarde quand il se relit : juste
                au-dessus de « Rendre ma copie ». */}
            {copieDictee.length > 0 && (
              <p className="copie-dictee__astuces">
                <span aria-hidden="true">✏️</span> Clique sur une ligne pour la corriger
                <span className="copie-dictee__astuces-sep" aria-hidden="true">·</span>
                <span className="copie-dictee__astuces-plus" aria-hidden="true">＋</span> ajoute une ligne en dessous
              </p>
            )}

            <div className="copie-dictee__actions">
              <button
                type="button"
                className={`btn btn--compact copie-dictee__rendre${
                  relectureTerminee ? ' copie-dictee__rendre--pret' : ''}`}
                onClick={rendreLaCopie}
                disabled={streaming || (copieDictee.length === 0 && !saisie.trim())}
              >
                Rendre ma copie
              </button>

              {/* UNE COPIE VIDE ÉTAIT UN PIÈGE SANS SORTIE.
                  « Rendre ma copie » est désactivé tant qu'aucune ligne n'est
                  écrite — c'est juste. Mais c'était la SEULE sortie : un élève
                  dont la dictée a échoué — rien n'a été prononcé, il en demande
                  une autre — restait avec ce panneau ouvert pour le reste de la
                  séance. Et tant qu'il est ouvert, la question « cahier ou
                  clavier ? » ne se repose plus : l'écran croit que la dictée
                  est toujours la même. */}
              {copieDictee.length === 0 && !saisie.trim() && (
                <button
                  type="button"
                  className="btn btn--fantome btn--compact"
                  onClick={() => setCopieDictee(null)}
                >
                  Annuler
                </button>
              )}
            </div>
          </div>
        )}

        {/* LE PENDANT DU PANNEAU « RENDRE MA COPIE », POUR LE CAHIER.
            L'élève qui écrit à la main n'a rien à taper : son seul geste de
            fin, c'est la photo. Sans ce bouton il devait le deviner, trouver
            le trombone, et comprendre tout seul qu'une dictée au cahier se
            rend en image. Le professeur, lui, n'a aucun moyen de la réclamer
            de façon fiable — il ne l'a pas fait. */}
        {cahierOuvert && (
          <div className={`copie-dictee${relectureTerminee ? ' copie-dictee--pret' : ''}`}>
            <div className="copie-dictee__entete">
              <span className="copie-dictee__titre">Ta copie</span>
              <span className="copie-dictee__aide">Sur ton cahier</span>
            </div>

            <p className="copie-dictee__vide">
              {relectureTerminee
                ? 'La relecture est finie : prends ta page en photo et envoie-la-moi.'
                : 'Quand tu as fini d’écrire, prends ta page en photo — c’est comme ça que je vois ton orthographe.'}
            </p>

            {/* DEUX BOUTONS, L'UN AU-DESSUS DE L'AUTRE.
                Côte à côte ils se sont déjà disputé la largeur de la carte,
                surtout sur téléphone. Empilés, chacun garde toute sa place. */}
            <div className="copie-dictee__boutons">
              <BoutonPieceJointe
                onFichier={deposer}
                disabled={streaming || seanceTerminee || piecesEnAttente.length >= PIECES_MAX}
                libelle="Envoyer ma copie"
              />

              {/* N'existe que si l'appareil a une caméra : sur un ordinateur
                  qui n'en a pas, ce bouton n'aurait rien à ouvrir. */}
              {cameraDispo && (
                <button
                  type="button"
                  className="btn btn--compact piece-jointe__rendre"
                  onClick={() => cameraRef.current?.ouvrir()}
                  disabled={streaming || seanceTerminee}
                >
                  <span aria-hidden="true">📸</span>
                  <span className="piece-jointe__libelle">Prendre ma copie en photo</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* LA RELECTURE COMPLÈTE SE VOIT, COMME LE SILENCE D'ÉCRITURE.
            Le texte n'est pas affiché — c'est toujours une dictée —, mais
            l'élève doit savoir que ce qu'il entend est la relecture, et
            qu'il peut corriger en même temps. */}
        {relectureDictee === 'en_cours' && !pauseDictee && (
          <div className="dictee-pause">
            <span className="dictee-pause__plume" aria-hidden="true">🔁</span>
            Je te relis toute la dictée : relis-toi et vérifie que tu n’as rien oublié.
          </div>
        )}

        {pauseDictee && (
          <div className="dictee-pause">
            <span className="dictee-pause__plume" aria-hidden="true">✍️</span>
            Écris… je reprends dans un instant.
          </div>
        )}

        {/* LE BANDEAU RESTE PENDANT QUE LE PROFESSEUR PARLE.

            Il ne s’affichait que si le micro était ouvert. En mode sans
            casque, le micro se ferme pendant l’explication : le bandeau
            disparaissait donc, et l’élève se retrouvait sans aucun repère au
            moment précis où il en avait le plus besoin.

            Il reste, et c’est son TEXTE qui change. L’onde continue de
            bouger : ce qu’elle signale, c’est que la séance est vivante, pas
            que le micro est ouvert. */}
        {(ecoute || profParle) && !pauseDictee && relectureDictee !== 'en_cours' && (
          <div className="ecoute-active">
            <span className="ecoute-active__onde"><i /><i /><i /><i /></span>

            {/* UN RETRAIT SILENCIEUX SERAIT PIRE QUE LE DÉFAUT.
                S'il tape et que la voix se tait sans rien dire, il parlerait
                dans le vide sans comprendre pourquoi. On le dit. */}
            {/* « TU PEUX LE COUPER » N’EST DIT QU’À QUI LE PEUT.

                Ce message ne regardait que `micEnPause`, vrai seulement
                quand le mode mains libres tourne. Mains libres éteint et
                haut-parleur choisi, l’élève lisait donc qu’il pouvait
                interrompre le professeur — alors que son micro était fermé.
                Il essaie, rien ne se passe, et il en conclut que le micro
                est cassé.

                La promesse dépend maintenant de sa CAUSE — le choix du
                haut-parleur — et non d’un état qui n’en est qu’une
                conséquence. */}
            {oreilleMorte
              ? 'Petit souci de connexion — je me remets à t’écouter…'
              : micEnPause || (sansCasque && profParle)
              ? 'Le professeur parle…'
              : profParle && !saisieTapee && !saisie
                ? 'Le professeur parle — tu peux le couper en parlant.'
              : saisieTapee
                ? 'Tu écris — je t’écoute à nouveau dès que le champ est vide.'
                : saisie ? `« ${saisie} »` : 'Je t’écoute…'}
          </div>
        )}
      </div>

      {error && <div className="alert alert--chat">{error}</div>}
      {erreurMicro && <div className="alert alert--chat">{erreurMicro}</div>}

      {/* La photo en grand. Une visionneuse et non un nouvel onglet : l'URL
          est un blob local, et l'ouvrir ailleurs sortirait l'élève du cours.
          Un clic n'importe où referme — un enfant ne cherche pas la croix. */}
      {agrandie && (
        <div
          className="visionneuse"
          role="dialog"
          aria-modal="true"
          aria-label={agrandie.nom ?? 'Document'}
          onClick={() => setAgrandie(null)}
        >
          <img src={agrandie.url} alt={agrandie.nom ?? 'Document envoyé'} />
          <button type="button" className="visionneuse__fermer" aria-label="Fermer">
            ×
          </button>
        </div>
      )}

      {scanOuvert && conversation && (
        <ScanMobileModale
          conversationId={conversation.id}
          profPrenom={conversation.profPrenom}
          onRecu={recevoirScan}
          onTermine={terminerScan}
          onFermer={() => {
            setScanOuvert(false);

            // Fermée sans photo : l'étiquette « copie » ne doit pas coller au
            // prochain document envoyé par un autre chemin.
            if (!piecesRef.current.some((p) => p.id)) rolePieceRef.current = null;
          }}
        />
      )}

      {sonBloque && (
        <div className="alert alert--chat">
          Ton navigateur a bloqué le son parce que la page n'a pas encore été
          cliquée. Clique n'importe où et {conversation?.profPrenom ?? 'ton professeur'}{' '}
          se remettra à parler.
        </div>
      )}

      {/* Interrupteur placé juste au-dessus du micro, pas dans l'en-tête :
          c'est ici que l'élève regarde quand il se demande comment parler. */}
      {vocalDispo && !seanceTerminee && (
        <div className="barre-vocale">
          <button
            type="button"
            className={`bascule ${mainsLibres ? 'bascule--active' : ''}`}
            onClick={basculerMainsLibres}
            role="switch"
            aria-checked={mainsLibres}
          >
            <span className="bascule__piste" aria-hidden="true">
              <span className="bascule__bouton" />
            </span>
            Détection automatique de la voix
          </button>

          <span className="barre-vocale__aide">
            {mainsLibres
              ? 'Parle quand tu veux, le micro se rouvre tout seul.'
              : 'Clique sur le micro pour parler.'}
          </span>

        </div>
      )}

      {/* Un contrôle est en cours. Le professeur l'a annoncé à l'oral, mais un
          enfant qui s'absente deux minutes et revient ne voit rien qui
          distingue un contrôle noté d'un exercice ordinaire. */}
      {/* Le temps est dépassé mais on continue : le dire, sinon l'élève voit
          un chrono à zéro et croit que tout va se couper d'un instant à l'autre. */}
      {depassement && (
        <div
          className={`fin-seance fin-seance--depassement ${
            depasse >= RAB_AVERTISSEMENT ? 'fin-seance--dernier-quart' : ''
          }`}
        >
          {depasse >= RAB_AVERTISSEMENT ? (
            <>
              <strong>Dernières minutes.</strong>
              <span>
                On a déjà bien dépassé l'heure. Termine ta question en cours :
                {' '}{conversation?.profPrenom ?? 'ton professeur'} clôture et te
                donne ta note dans un instant.
              </span>
            </>
          ) : (
            <>
              <strong>Le temps est écoulé, mais on ne coupe pas ton contrôle.</strong>
              <span>
                Termine tranquillement. La séance se fermera quand
                {' '}{conversation?.profPrenom ?? 'ton professeur'} t'aura donné ta note.
              </span>
            </>
          )}
        </div>
      )}

      {/* Forfait épuisé : on l'explique à l'enfant sans le culpabiliser, et on
          renvoie le parent vers l'endroit où il peut agir. Le motif change le
          message — un plafond individuel n'est pas un pot vide. */}
      {quota && <MessageQuota motif={quota} prof={conversation?.profPrenom} />}

      {/* Dire pourquoi la saisie est grisée. Un champ verrouillé sans
          explication se lit comme une panne. */}
      {seanceTerminee && !quota && !streaming && (
        <div className="fin-seance">
          <strong>
            {adieuFait ? 'Vous vous êtes dit au revoir.' : 'La séance est terminée.'}
          </strong>
          <span>
            Tu peux repartir pour {dureeSeance} minutes, ou revenir plus tard —
            {conversation?.profPrenom ?? 'ton professeur'} se souviendra d'où
            vous en êtes.
          </span>
        </div>
      )}

      {/* Le document attend AU-DESSUS de la saisie, accroché au message en
          cours d'écriture. Tant qu'il est là, l'élève n'a rien envoyé. */}
      {piecesEnAttente.length > 0 && (
        <div className="pieces-en-attente">
          {piecesEnAttente.map((p) => (
            <VignetteEnAttente
              key={p.cle}
              fichier={p.fichier}
              apercu={p.apercu}
              enCours={p.enCours}
              erreur={p.erreur}
              onRetirer={() => retirerDocument(p.cle)}
            />
          ))}
        </div>
      )}

      <form
        className={`chat__saisie ${seanceTerminee ? 'chat__saisie--close' : ''}`}
        onSubmit={soumettre}
        onDrop={auDepot}
        onDragOver={(evenement) => evenement.preventDefault()}
      >
        <BoutonPieceJointe
          onFichier={deposer}
          disabled={streaming || seanceTerminee || piecesEnAttente.length >= PIECES_MAX || copieBloquante}
          enSurbrillance={docDemande && piecesEnAttente.length === 0}
        />

        {/* La caméra pilotée à la voix : une fois allumée, dire « Photo »
            capture et envoie tout seul — la dictée, un schéma, n'importe
            quelle page du cahier à montrer. */}
        <CameraVoix
          ref={cameraRef}
          onErreur={setErreurMicro}
          enSurbrillance={docDemande}
          // LE MEME ETAT QUE LES TROIS AUTRES — Camara, le 16/09/2026 : en
          // entrant dans un cours, la caméra restait allumée pendant que le
          // trombone, le scanner et le micro étaient estompés. Tous se
          // coupent et se rallument ensemble.
          desactive={streaming || seanceTerminee || copieBloquante}
        />

        {/* LE SCANNER — voulu par Camara le 13/09/2026. Sur ordinateur, un QR
            code : l'enfant photographie sa copie avec son téléphone, sans s'y
            connecter. Sur téléphone ou tablette, un QR code pour soi-même
            n'aurait aucun sens : le bouton ouvre directement l'appareil photo. */}
        {scannerNatif ? (
          <label
            className={`piece-jointe__bouton scanner-mobile__bouton${
              streaming || seanceTerminee || piecesEnAttente.length >= PIECES_MAX || copieBloquante ? ' est-desactive' : ''
            }${docDemande && piecesEnAttente.length === 0 ? ' piece-jointe__bouton--surbrillance' : ''}`}
            title="Scanner un document"
            aria-label="Scanner un document"
          >
            <img src={scannerPng} alt="" className="icone-png" />
            <input
              type="file"
              hidden
              accept="image/*"
              capture="environment"
              disabled={streaming || seanceTerminee || piecesEnAttente.length >= PIECES_MAX || copieBloquante}
              onChange={(evenement) => {
                const fichier = evenement.target.files?.[0];
                evenement.target.value = '';
                if (fichier) deposer(fichier);
              }}
            />
          </label>
        ) : (
          <button
            type="button"
            className={`piece-jointe__bouton scanner-mobile__bouton${
              docDemande && piecesEnAttente.length === 0 ? ' piece-jointe__bouton--surbrillance' : ''
            }`}
            onClick={() => setScanOuvert(true)}
            disabled={streaming || seanceTerminee || piecesEnAttente.length >= PIECES_MAX || copieBloquante}
            title="Scanner un document avec ton téléphone"
            aria-label="Scanner un document avec ton téléphone"
          >
            <img src={scannerPng} alt="" className="icone-png" />
          </button>
        )}

        {vocalDispo && (
          <button
            type="button"
            className={`micro ${ecoute ? 'micro--actif' : ''}`}
            onClick={basculerMicro}
            disabled={streaming || seanceTerminee}
            title={seanceTerminee ? 'Séance terminée' : ecoute ? 'Arrêter' : 'Parler'}
            aria-label={
              seanceTerminee
                ? 'Micro fermé, la séance est terminée'
                : ecoute
                  ? 'Arrêter de parler'
                  : 'Parler au professeur'
            }
          >
            {/* Deux images et non une teinte : celle du micro ouvert est
                orange, celle du micro fermé bleue — c'est ce qu'un enfant
                lit d'un coup d'œil, avant même le halo. */}
            <img src={ecoute ? micOuvertPng : micFermePng} alt="" className="micro__icone" />
          </button>
        )}

        <textarea
          value={saisie}
          onChange={(evenement) => taper(evenement.target.value)}
          onKeyDown={auClavier}
          onPaste={auCollage}
          // PAS DE CORRECTEUR PENDANT UNE DICTÉE AU CLAVIER. Relevé le
          // 11/09/2026 : « souvrirent » souligné en rouge sous les yeux de
          // l'élève — le navigateur lui montrait sa faute avant qu'il rende
          // sa copie, et la dictée ne mesurait plus rien.
          spellCheck={copieDictee === null}
          autoCorrect={copieDictee === null ? 'on' : 'off'}
          autoCapitalize={copieDictee === null ? 'sentences' : 'off'}
          placeholder={
            quota
              ? 'Séance suspendue — voir le forfait'
              : seanceTerminee
                ? 'Séance terminée — relance une session pour continuer'
                : streaming
                ? 'Le professeur parle…'
                // Un document joint change l'invite : c'est une incitation à
                // dire ce qui bloque, pas une obligation. L'envoi reste
                // possible sans un mot.
                : piecesEnAttente.some((p) => p.id)
                  ? 'Dis-lui ce qui te bloque'
                  : copieDictee
                    ? 'Écris la phrase, puis Entrée'
                    : micEnPause
                      ? 'Le professeur parle…'
                      : ecoute
                        ? 'Je t’écoute…'
                        : vocalDispo
                          ? 'Parle, ou écris ici'
                          : 'Écris ton message…'
          }
          disabled={streaming || seanceTerminee}
          rows={2}
          /* La même limite que le serveur, pour qu'elle ne se manifeste jamais
             par une erreur. Sans elle, un élève qui colle un long texte voit
             son message refusé APRÈS l'envoi — il a tout perdu et ne comprend
             pas pourquoi. Ici la frappe s'arrête, ce qui se comprend seul.

             Dix mille caractères, c'est vingt fois la plus longue
             justification qu'un enfant écrira jamais. */
          maxLength={10000}
        />

        <button
          type="submit"
          className="btn btn--compact"
          /* Un document prêt suffit à autoriser l'envoi : montrer sa feuille
             EST un tour de parole. Tant qu'il monte encore, en revanche, le
             bouton reste fermé — partir sans lui enverrait un message vide. */
          disabled={
            streaming
            || seanceTerminee
            || piecesEnAttente.some((p) => p.enCours)
            || (!saisie.trim() && !piecesEnAttente.some((p) => p.id))
          }
        >
          Envoyer
        </button>
      </form>

      {!vocalDispo && !seanceTerminee && (
        <p className="chat__note-vocal">
          Le micro n'est pas disponible sur ce navigateur. Utilise Chrome ou Edge
          pour parler au professeur.
        </p>
      )}
    </section>

      <Ardoise
        contenu={contenuTableau}
        copieReference={copieReference}
        prof={conversation?.profPrenom}
        onMontrer={montrerSurLeTableau}
      />
    </div>
  );
}
