import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { chargerEleves } from '../lib/actions/elevesActions';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import iconeJeux from '../assets/games.webp';
import { jeuxDeLaClasse, parMatiere } from '../lib/jeux/catalogue';
import {
  FRISE, classeDansSaVoie, frisePourLaClasse, programmeDeLaClasse, rangDeLaClasse,
} from '../lib/jeux/frise';
import { FournirJeu } from '../lib/jeux/contexteJeu';
import { DEFI, TRANQUILLE, coeursDeLaClasse } from '../lib/jeux/coeurs';
import ChoixDuMode from './jeux/ChoixDuMode';
import FinDuDefi from './jeux/FinDuDefi';
import FriseDesClasses from './jeux/FriseDesClasses';
import { sessionEleve } from '../lib/storage/sessionEleve';
import { styleMatiere } from '../lib/couleurMatiere';
import { bruitage, prechargerBruitages } from '../lib/jeux/bruitages';
import Balance from './jeux/Balance';
import BoiteDeDix from './jeux/BoiteDeDix';
import ChantierDesFormes from './jeux/ChantierDesFormes';
import DeuxParDeux from './jeux/DeuxParDeux';
import Horloge from './jeux/Horloge';
import Marchande from './jeux/Marchande';
import PaquetsDeDix from './jeux/PaquetsDeDix';
import PecheAuxSons from './jeux/PecheAuxSons';
import AtelierDesSyllabes from './jeux/AtelierDesSyllabes';
import MotsEclair from './jeux/MotsEclair';
import UnOuDes from './jeux/UnOuDes';
import CoffreDesCentaines from './jeux/CoffreDesCentaines';
import CourseDesTables from './jeux/CourseDesTables';
import PartsDePizza from './jeux/PartsDePizza';
import MachineADix from './jeux/MachineADix';
import MotsDeLiaison from './jeux/MotsDeLiaison';
import PoemeTheatreRecit from './jeux/PoemeTheatreRecit';
import CommeUneImage from './jeux/CommeUneImage';
import AQuiLePronom from './jeux/AQuiLePronom';
import Crible from './jeux/Crible';
import Robot from './jeux/Robot';
import SacDeBilles from './jeux/SacDeBilles';
import SuiteQuiContinue from './jeux/SuiteQuiContinue';
import BoiteMystere from './jeux/BoiteMystere';
import RecettePour8 from './jeux/RecettePour8';
import RegleDesDixiemes from './jeux/RegleDesDixiemes';
import PartageBonbons from './jeux/PartageBonbons';
import MetreRuban from './jeux/MetreRuban';
import TourDuJardin from './jeux/TourDuJardin';
import CombienDeTemps from './jeux/CombienDeTemps';
import Bouteilles from './jeux/Bouteilles';
import Miroir from './jeux/Miroir';
import Diagramme from './jeux/Diagramme';
import OuQuandComment from './jeux/OuQuandComment';
import SujetEloigne from './jeux/SujetEloigne';
import AOuA from './jeux/AOuA';
import DetectiveDuVerbe from './jeux/DetectiveDuVerbe';
import RoueDesVerbes from './jeux/RoueDesVerbes';
import TypesDePhrases from './jeux/TypesDePhrases';
import PhraseQuiDitNon from './jeux/PhraseQuiDitNon';
import ContrairesEtJumeaux from './jeux/ContrairesEtJumeaux';
import TrainDesNombres from './jeux/TrainDesNombres';
import VignetteBalance from './jeux/VignetteBalance';
import VignetteBoiteDeDix from './jeux/VignetteBoiteDeDix';
import VignetteChantier from './jeux/VignetteChantier';
import VignetteDeux from './jeux/VignetteDeux';
import VignetteHorloge from './jeux/VignetteHorloge';
import VignettePaquets from './jeux/VignettePaquets';
import VignettePeche from './jeux/VignettePeche';
import VignetteSyllabes from './jeux/VignetteSyllabes';
import VignetteEclair from './jeux/VignetteEclair';
import VignetteUnOuDes from './jeux/VignetteUnOuDes';
import VignetteCoffre from './jeux/VignetteCoffre';
import VignetteCourse from './jeux/VignetteCourse';
import VignettePizza from './jeux/VignettePizza';
import VignetteMachine from './jeux/VignetteMachine';
import {
  VignetteAOuA, VignetteContraires, VignetteDetective, VignetteNegation, VignetteRoue, VignetteTypes,
} from './jeux/VignettesFrancaisCE1';
import {
  VignettePartage, VignetteRuban, VignetteJardin, VignetteDuree, VignetteBouteilles, VignetteMiroir, VignetteDiagramme, VignetteComplements, VignetteSujet,
} from './jeux/VignettesCE2';
import VignetteTrain from './jeux/VignetteTrain';
import { ECRANS_COLLEGE, VIGNETTES_COLLEGE } from './jeux/JeuxCollege';

/** Le zoom d'un jeu en cours sur ordinateur : voir « LE JEU TIENT DANS L'ÉCRAN ». */
const ZOOM_JEU_MAX = 1.25;
const ZOOM_JEU_MIN = 0.7;

/** Les jeux écrits à ce jour. Un jeu du catalogue sans écran ne s'affiche pas. */
const ECRANS = {
  'boite-de-dix': BoiteDeDix,
  marchande: Marchande,
  'train-des-nombres': TrainDesNombres,
  'paquets-de-dix': PaquetsDeDix,
  'chantier-des-formes': ChantierDesFormes,
  horloge: Horloge,
  balance: Balance,
  'deux-par-deux': DeuxParDeux,
  'peche-aux-sons': PecheAuxSons,
  'atelier-syllabes': AtelierDesSyllabes,
  'mots-eclair': MotsEclair,
  'un-ou-des': UnOuDes,
  'coffre-des-centaines': CoffreDesCentaines,
  'course-des-tables': CourseDesTables,
  'parts-de-pizza': PartsDePizza,
  'machine-a-dix': MachineADix,
  'mots-de-liaison': MotsDeLiaison,
  'poeme-theatre-recit': PoemeTheatreRecit,
  'comme-une-image': CommeUneImage,
  'a-qui-le-pronom': AQuiLePronom,
  'le-crible': Crible,
  'le-robot': Robot,
  'sac-de-billes': SacDeBilles,
  'suite-qui-continue': SuiteQuiContinue,
  'boite-mystere': BoiteMystere,
  'recette-pour-8': RecettePour8,
  'regle-des-dixiemes': RegleDesDixiemes,
  'partage-des-bonbons': PartageBonbons,
  'metre-ruban': MetreRuban,
  'tour-du-jardin': TourDuJardin,
  'combien-de-temps': CombienDeTemps,
  'les-bouteilles': Bouteilles,
  'le-miroir': Miroir,
  'le-diagramme': Diagramme,
  'ou-quand-comment': OuQuandComment,
  'sujet-qui-s-eloigne': SujetEloigne,
  'a-ou-a': AOuA,
  'detective-du-verbe': DetectiveDuVerbe,
  'roue-des-verbes': RoueDesVerbes,
  'types-de-phrases': TypesDePhrases,
  'phrase-qui-dit-non': PhraseQuiDitNon,
  'contraires-et-jumeaux': ContrairesEtJumeaux,
  // Les jeux du collège : un écran par module, tous sur l'écran à choix.
  ...ECRANS_COLLEGE,
};

/**
 * L'APERÇU DE CHAQUE JEU. C'est la seule chose de la carte qu'un CP puisse
 * lire : il ne déchiffre pas encore le titre, mais il reconnaît la boîte de
 * dix qu'il manipule en classe.
 */
const VIGNETTES = {
  'boite-de-dix': VignetteBoiteDeDix,
  'train-des-nombres': VignetteTrain,
  'paquets-de-dix': VignettePaquets,
  'chantier-des-formes': VignetteChantier,
  horloge: VignetteHorloge,
  balance: VignetteBalance,
  'deux-par-deux': VignetteDeux,
  'peche-aux-sons': VignettePeche,
  'atelier-syllabes': VignetteSyllabes,
  'mots-eclair': VignetteEclair,
  'un-ou-des': VignetteUnOuDes,
  'coffre-des-centaines': VignetteCoffre,
  'course-des-tables': VignetteCourse,
  'parts-de-pizza': VignettePizza,
  'machine-a-dix': VignetteMachine,
  'partage-des-bonbons': VignettePartage,
  'metre-ruban': VignetteRuban,
  'tour-du-jardin': VignetteJardin,
  'combien-de-temps': VignetteDuree,
  'les-bouteilles': VignetteBouteilles,
  'le-miroir': VignetteMiroir,
  'le-diagramme': VignetteDiagramme,
  'ou-quand-comment': VignetteComplements,
  'sujet-qui-s-eloigne': VignetteSujet,
  'a-ou-a': VignetteAOuA,
  'detective-du-verbe': VignetteDetective,
  'roue-des-verbes': VignetteRoue,
  'types-de-phrases': VignetteTypes,
  'phrase-qui-dit-non': VignetteNegation,
  'contraires-et-jumeaux': VignetteContraires,
  ...VIGNETTES_COLLEGE,
};

/**
 * « MES JEUX » — la ludothèque de l'enfant.
 *
 * Voulue par Camara le 20/09/2026, remplie à partir du 21.
 *
 * ELLE S'OUVRE SUR SA CLASSE, et rien d'autre ne lui est proposé : un CM2 ne
 * doit JAMAIS se voir offrir un jeu de CP. Se voir proposer « pour les petits »
 * fait refermer la page pour de bon, et aucune quantité de jeux ne rattrape ça.
 *
 * MAIS IL PEUT Y RETOURNER LUI-MÊME. Camara, le 23/09/2026 : la frise du CP à
 * la terminale ouvre les classes d'avant et verrouille celles d'après. Choisir
 * de redescendre n'est pas la même chose que se le voir proposer — c'est
 * l'enfant qui décide, et la page continue de s'ouvrir sur son année.
 *
 * LA CLASSE VIENT DU SERVEUR, par deux chemins selon qui regarde : la liste
 * des enfants quand c'est le parent, la session quand c'est l'enfant lui-même
 * avec son code. Les deux portent `niveauCode` depuis le 21/09/2026.
 */
export default function JeuxEleve() {
  const { eleveId } = useParams();
  const { liste } = useSelector((etat) => etat.eleves);

  const [ouvert, setOuvert] = useState(null);

  // Les bruitages (survol des cartes, bonne et mauvaise réponse) sont décodés
  // dès l'arrivée sur la page : le premier doit tomber pile, pas après un temps.
  useEffect(() => { prechargerBruitages(); }, []);

  // LE SON DU SURVOL, SUR TOUT CE QUI SE CHOISIT — Camara, le 09/10/2026 : les
  // cartes des jeux, puis « le choix du mode, le choix des classes, le choix de
  // réponse ». Un seul écouteur pour toute la page plutôt qu'un par bouton :
  // chaque jeu a ses propres boutons de réponse, et un jeu écrit demain
  // sonnera sans rien déclarer. À la souris seulement ; un bouton inactif
  // (une réponse déjà écartée) ne sonne pas.
  const page = useRef(null);
  useEffect(() => {
    const racine = page.current;
    if (!racine) return undefined;
    let survole = null;
    const entrer = (e) => {
      if (e.pointerType !== 'mouse') return;
      const bouton = e.target.closest?.('button, a');
      if (!bouton || bouton === survole || !racine.contains(bouton)) return;
      survole = bouton;
      if (!bouton.disabled) bruitage('survol');
    };
    const sortir = (e) => {
      if (survole && !survole.contains(e.relatedTarget)) survole = null;
    };
    racine.addEventListener('pointerover', entrer);
    racine.addEventListener('pointerout', sortir);
    return () => {
      racine.removeEventListener('pointerover', entrer);
      racine.removeEventListener('pointerout', sortir);
    };
  }, []);

  // LE MODE DE JEU, ET LE NUMÉRO DE PARTIE.
  //
  // `null` veut dire « pas encore choisi » : c'est ce qui fait apparaître
  // l'écran du choix, plutôt qu'un troisième drapeau à tenir.
  //
  // Le numéro de partie sert de clé React au jeu. Le changer REMONTE l'écran à
  // neuf — graine, manche, score — ce qu'aucun jeu ne sait faire de
  // l'extérieur. C'est ainsi qu'on recommence après avoir perdu ses cœurs.
  const [mode, setMode] = useState(null);
  const [partie, setPartie] = useState(0);

  // LE BILAN DU DÉFI PERDU — `null` tant que le jeu tourne. Quand il est posé,
  // le jeu est DÉMONTÉ et la fin du défi prend sa place : c'est ce qui arrête
  // sa question suivante et la voix qui la lisait (Camara, 26/09).
  const [finDefi, setFinDefi] = useState(null);
  // LE SON DU DÉFI PERDU (game_over.mp3, Camara le 09/10/2026), UNE SEULE FOIS :
  // le dernier cœur et le chrono à zéro peuvent tous deux signaler la fin.
  const finSonnee = useRef(false);
  const terminerDefi = useCallback((bilan) => {
    if (!finSonnee.current) {
      finSonnee.current = true;
      bruitage('finDuDefi');
    }
    setFinDefi(bilan);
  }, []);

  // Changer de partie, de mode ou de jeu efface toujours le bilan.
  const lancer = useCallback((choisi) => {
    finSonnee.current = false;
    setFinDefi(null);
    setMode(choisi);
    setPartie((n) => n + 1);
  }, []);
  // Tous les « Revenir aux jeux » passent par ici, d'un jeu, du choix du mode
  // ou d'une fin de partie : le son du retour (09/10/2026) aussi.
  const fermer = useCallback(() => {
    bruitage('retour');
    finSonnee.current = false;
    setFinDefi(null);
    setOuvert(null);
    setMode(null);
  }, []);

  // La classe REGARDÉE, qui n'est pas forcément la sienne : `null` tant que
  // l'enfant n'a rien choisi, pour que la page s'ouvre toujours sur son année.
  //
  // GARDÉE LE TEMPS DE L'ONGLET — Camara, le 09/10/2026 : « quand je fais F5, je
  // me retrouve sur ma classe alors que j'avais cliqué sur une autre ». Le choix
  // survit donc à un rechargement (sessionStorage, par enfant) ; un nouvel
  // onglet, une nouvelle visite, rouvrent toujours sur l'année de l'enfant.
  const cleRegardee = `mimia.jeux.classeRegardee.${eleveId}`;
  const [regardee, setRegardeeBrute] = useState(() => {
    try {
      return window.sessionStorage.getItem(cleRegardee) || null;
    } catch {
      return null;
    }
  });
  const setRegardee = useCallback((code) => {
    setRegardeeBrute(code);
    try {
      if (code) window.sessionStorage.setItem(cleRegardee, code);
      else window.sessionStorage.removeItem(cleRegardee);
    } catch { /* sans stockage, le choix vaut jusqu'au prochain rechargement */ }
  }, [cleRegardee]);

  const eleve = liste.find((e) => String(e.id) === String(eleveId));
  const enfant = sessionEleve();

  // MÊME FILET QUE POUR LE CYCLE : une session ouverte avant le 21/09/2026 ne
  // porte pas son code de classe. Au primaire — les seuls jeux existants — le
  // libellé EST le code (« CE1 »), donc il suffit.
  const sien = String(enfant?.eleveId) === String(eleveId);

  // APRÈS UN F5, LA LISTE DES ENFANTS EST VIDE — Camara, le 08/10/2026 : « quand
  // je fais F5 sur la liste des jeux, je perds tout ; il faut repasser par Mes
  // cours ». La classe vient de cette liste, que seules les autres pages
  // chargeaient. On la charge ici aussi, comme elles — sauf en session enfant :
  // la classe y vient de la session, et le serveur refuse la liste à un enfant.
  const dispatch = useDispatch();
  useEffect(() => {
    if (liste.length === 0 && !sien) dispatch(chargerEleves());
  }, [dispatch, liste.length, sien]);

  const niveauCode = eleve?.niveauCode
    ?? (sien ? (enfant?.niveauCode || enfant?.niveau) : null);

  // Une classe gardée AU-DESSUS de la sienne — sa classe a changé entre-temps —
  // ne s'ouvre pas : la frise la verrouille, la mémoire ne doit pas la contourner.
  const regardeeValide = regardee && (!rangDeLaClasse(niveauCode) || rangDeLaClasse(regardee) <= rangDeLaClasse(niveauCode))
    ? regardee : null;
  const classe = regardeeValide ?? niveauCode;

  const jeux = useMemo(
    () => jeuxDeLaClasse(classe).filter((jeu) => ECRANS[jeu.cle]),
    [classe],
  );

  // Une classe de la frise « a des jeux » quand elle en a d'ÉCRITS : le
  // catalogue en annonce que les écrans ne servent pas encore.
  const etapes = useMemo(
    () => frisePourLaClasse(
      niveauCode,
      // Une année de lycée se lit dans la voie de l'élève (07/10/2026).
      (code) => jeuxDeLaClasse(classeDansSaVoie(code, niveauCode)).some((jeu) => ECRANS[jeu.cle]),
    ),
    [niveauCode],
  );

  // L'étape de frise qui correspond à ce qu'on regarde. PAR LE RANG et non par
  // le code : la classe d'un lycéen est `SECONDE_PRO` ou `PREMIERE_STMG`, que
  // la frise ne distingue pas — elle n'affiche que l'année.
  const etape = FRISE.find((e) => e.rang === rangDeLaClasse(classe));

  const Ecran = ouvert ? ECRANS[ouvert] : null;

  // EN PARTIE seulement : le jeu choisi, son mode choisi, et pas la fin du
  // défi. L'écran du choix du mode garde sa taille (Camara, 08/10/2026 : « c'est
  // uniquement quand on est en jeu qu'il faut faire le zoom »).
  const enPartie = Boolean(Ecran && mode && !finDefi);

  // LA MATIÈRE DU JEU DÉCIDE DE LA VOIX : les mathématiques parlent avec
  // celle de Nora. Le jeu ne la connaît pas lui-même, c'est le catalogue qui
  // la porte — voir `voix/repliques.js`.
  const matiereCode = jeux.find((j) => j.cle === ouvert)?.matiereCode;

  // OUVRIR UN JEU DOIT L'AMENER SOUS LES YEUX — Camara, le 23/09/2026 :
  // « quand je clique sur un jeu je ne suis jamais focus dessus, il faut que
  // je scrolle à la main ». Le jeu remplace la grille à sa place dans la page,
  // donc SOUS l'en-tête et la carte des niveaux : un enfant qui avait déroulé
  // jusqu'à la dernière matière se retrouvait devant un décor coupé en deux.
  //
  // LE FOCUS AUSSI, et pas seulement le défilement : sans lui, la tabulation
  // repartait du haut de la page, et un lecteur d'écran continuait d'annoncer
  // la liste qui n'existe plus.
  const zone = useRef(null);
  const premierRendu = useRef(true);

  // REVENIR LÀ OÙ L'ON ÉTAIT — Camara, le 08/10/2026 : « quand je reviens sur
  // la liste des jeux, au lieu de revenir à l'endroit où j'étais je reviens
  // tout en haut ». Le défilement vers la zone servait aussi à la FERMETURE,
  // et renvoyait en haut de la liste. On retient donc, à l'ouverture, la
  // position de la page et le jeu ouvert ; à la fermeture, on y revient, et le
  // focus retourne sur la carte de ce jeu.
  const retour = useRef(null);
  const ouvrir = useCallback((cle) => {
    retour.current = { y: window.scrollY, cle };
    setOuvert(cle);
    setMode(null);
    setFinDefi(null);
  }, []);

  useEffect(() => {
    // Au chargement, on ne bouge rien : la page s'ouvre où elle doit.
    if (premierRendu.current) {
      premierRendu.current = false;
      return;
    }

    if (!ouvert && retour.current) {
      const { y, cle } = retour.current;
      retour.current = null;
      const revenir = () => {
        window.scrollTo?.({ top: y, behavior: 'auto' });
        zone.current?.querySelector?.(`[data-jeu="${cle}"]`)?.focus?.({ preventScroll: true });
      };
      // Tout de suite, et encore une fois la liste peinte : ses couvertures et
      // la frise se mettent en place après ce premier passage.
      revenir();
      window.requestAnimationFrame?.(() => window.requestAnimationFrame(revenir));
      return;
    }

    const doux = !window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    zone.current?.scrollIntoView?.({ block: 'start', behavior: doux ? 'smooth' : 'auto' });
    zone.current?.focus?.({ preventScroll: true });
  }, [ouvert]);

  // LE JEU TIENT DANS L'ÉCRAN, ET AU CENTRE — Camara, le 08/10/2026 : « sur
  // certains jeux, le jeu déborde de la fenêtre ; rends ça dynamique pour que
  // tous les jeux s'adaptent à la taille de l'écran en hauteur et soient bien
  // centrés ».
  //
  // Le zoom n'est donc plus fixe : on mesure la hauteur NATURELLE du jeu (sa
  // hauteur affichée divisée par le zoom en cours) et la place sous la barre du
  // site, et on prend le plus grand zoom qui tient — jamais plus de 1,25 (le
  // réglage choisi le même jour), jamais moins de 0,7 (en dessous, le texte
  // deviendrait illisible : mieux vaut alors défiler un peu). Puis on cale la
  // partie au milieu de la place disponible.
  //
  // RECALCULÉ quand la fenêtre change, ou quand le CONTENU du jeu change de
  // hauteur (une intro d'escape game, une question plus longue). L'observateur
  // regarde le jeu lui-même, dont la taille en pixels de page ne bouge pas avec
  // le zoom : changer le zoom ne relance donc pas le calcul en boucle.
  const [zoomJeu, setZoomJeu] = useState(ZOOM_JEU_MAX);
  const zoomRef = useRef(ZOOM_JEU_MAX);

  useEffect(() => {
    const el = zone.current;
    const large = window.matchMedia?.('(min-width: 1100px)');
    if (!enPartie || !el || !large?.matches) return undefined;

    // LE ZOOM NE FAIT QUE DESCENDRE PENDANT LA PARTIE — Camara, le 08/10/2026 :
    // « quand je clique sur une réponse, ça zoome et dézoome à l'infini ». Changer
    // le zoom change la largeur intérieure du jeu, donc le nombre de lignes de
    // ses textes, donc sa hauteur — qui relançait le calcul, qui rechangeait le
    // zoom… Quand le CONTENU change, le zoom peut donc baisser, jamais remonter :
    // la boucle n'a plus de quoi tourner. Il n'est recalculé librement qu'à
    // l'ouverture du jeu et quand la fenêtre change de taille.
    let premier = true;
    const ajuster = (libre) => {
      const z = zoomRef.current;
      const haut = el.getBoundingClientRect().height;
      if (!haut) return;
      const barre = document.querySelector('.navbar')?.getBoundingClientRect().height ?? 0;
      const dispo = window.innerHeight - barre - 24;
      const calcule = Math.max(ZOOM_JEU_MIN, Math.min(ZOOM_JEU_MAX, dispo / (haut / z)));
      const nouveau = libre ? calcule : Math.min(z, calcule);
      if (Math.abs(nouveau - z) > 0.03) {
        zoomRef.current = nouveau;
        setZoomJeu(nouveau);
      }
      if (premier) {
        premier = false;
        // Au centre de la place sous la barre, une fois le nouveau zoom posé.
        window.requestAnimationFrame?.(() => {
          const r = el.getBoundingClientRect();
          const marge = Math.max(12, (window.innerHeight - barre - r.height) / 2);
          window.scrollTo?.({ top: window.scrollY + r.top - barre - marge, behavior: 'auto' });
        });
        return;
      }
      // LE JEU RESTE DANS L'ÉCRAN QUAND IL GRANDIT — Camara, le 08/10/2026 : « dans
      // la pêche aux sons, sur une bonne réponse la fenêtre s'agrandit et
      // déborde ». Un message, un bouton « C'est prêt ! » allongent le jeu : le
      // zoom baisse, mais le jeu restait calé où il était et son bas sortait de
      // l'écran. On décale la page juste assez pour le ramener, sans jamais
      // remonter son haut sous la barre.
      window.requestAnimationFrame?.(() => {
        const r = el.getBoundingClientRect();
        const depasse = r.bottom - (window.innerHeight - 12);
        if (depasse <= 0) return;
        const possible = r.top - (barre + 12);
        const decalage = Math.min(depasse, Math.max(0, possible));
        if (decalage > 0) window.scrollBy?.({ top: decalage, behavior: 'auto' });
      });
    };

    ajuster(true);
    const Observateur = window.ResizeObserver;
    const observateur = Observateur ? new Observateur(() => ajuster(false)) : null;
    if (observateur && el.firstElementChild) observateur.observe(el.firstElementChild);
    const auRedimensionnement = () => ajuster(true);
    window.addEventListener('resize', auRedimensionnement);
    return () => {
      observateur?.disconnect();
      window.removeEventListener('resize', auRedimensionnement);
    };
  }, [enPartie, ouvert, partie]);

  // ARRIVER PAR LA CARTE DU PROFESSEUR — Camara, le 23/09/2026. À la fin du
  // cours, le professeur propose un jeu ; sa carte mène ici avec
  // `?classe=CE1&jeu=course-des-tables`, et le jeu s'ouvre directement, à
  // cette classe-là. Les mêmes gardes que la frise : jamais une classe
  // au-dessus de la sienne, jamais un jeu qui n'existe pas à cette classe —
  // dans ces cas, la page s'ouvre simplement comme d'habitude.
  const [parametres] = useSearchParams();
  const classeDemandee = (parametres.get('classe') ?? '').toUpperCase();
  const jeuDemande = (parametres.get('jeu') ?? '').toLowerCase();

  useEffect(() => {
    if (!classeDemandee || !jeuDemande) return;

    const rangSien = rangDeLaClasse(niveauCode);
    const rangVu = rangDeLaClasse(classeDemandee);
    if (rangSien !== null && (rangVu === null || rangVu > rangSien)) return;
    if (!jeuxDeLaClasse(classeDemandee).some((j) => j.cle === jeuDemande && ECRANS[j.cle])) return;

    setRegardee(classeDemandee);
    setOuvert(jeuDemande);
    setMode(null);
    setFinDefi(null);
  }, [classeDemandee, jeuDemande, niveauCode, setRegardee]);

  return (
    // UN JEU OUVERT PREND LA PLACE — Camara, le 08/10/2026 : « sur PC, pour les
    // jeux, augmenter le zoom de 25 %, c'est trop petit ». Voir `.page--jeu-ouvert`.
    <section ref={page} className={`page page--large${enPartie ? ' page--jeu-ouvert' : ''}`}>
      <Link to={`/eleves/${eleveId}/matieres`} className="lien-retour">← Mes cours</Link>

      <div className="jeux-entete">
        <span className="jeux-entete__icone" aria-hidden="true">
          <img src={iconeJeux} alt="" />
        </span>

        <div>
          {/* LE TITRE PARLE LA LANGUE DES COUVERTURES — voir `.jeux-entete__titre`. */}
          <h1 className="jeux-entete__titre">
            Mes <span className="jeux-entete__titre-accent">jeux</span>
          </h1>
          <p className="page__sous-titre jeux-entete__sous-titre">
            Réviser en jouant, quelques minutes suffisent.
          </p>
        </div>
      </div>

      {/* `tabIndex={-1}` : la zone n'entre pas dans l'ordre de tabulation,
          mais elle peut RECEVOIR le focus quand on le lui donne. C'est ce qui
          permet de poser l'enfant sur le jeu qu'il vient d'ouvrir. */}
      <div
        className={`jeux-zone${enPartie ? ' jeux-zone--jeu' : ''}`}
        ref={zone}
        tabIndex={-1}
        style={enPartie ? { '--zoom-jeu': zoomJeu } : undefined}
      >
        {Ecran && !mode ? (
          // LE CHOIX DU MODE PRÉCÈDE LE JEU — mais seulement là où le défi
          // existe. Au CP, `ChoixDuMode` se choisit tout seul « tranquille » et
          // ne s'affiche pas : un écran à une seule porte n'est pas un choix,
          // c'est un obstacle.
          <ChoixDuMode
            titre={jeux.find((j) => j.cle === ouvert)?.titre}
            classe={classe}
            jeuCle={ouvert}
            niveau={programmeDeLaClasse(classe)}
            onChoisir={lancer}
            onQuitter={fermer}
          />
        ) : Ecran && finDefi ? (
          <FinDuDefi
            coeursMax={coeursDeLaClasse(classe)}
            reussies={finDefi.reussies}
            questions={finDefi.questions}
            // Le compte à rebours d'un escape game, et non le dernier cœur.
            raison={finDefi.raison}
            total={finDefi.total}
            onRefaire={() => lancer(DEFI)}
            onTranquille={() => lancer(TRANQUILLE)}
            onQuitter={fermer}
          />
        ) : Ecran ? (
          // CE QUE LE JEU SAIT DE LUI-MÊME : sa clé de catalogue, la classe
          // pour laquelle il tourne, le mode et ses cœurs. L'écran de fin y
          // puise le record personnel et la barre de cœurs, sans qu'aucun jeu
          // ait à relayer quoi que ce soit.
          <FournirJeu
            value={{
              jeuCle: ouvert,
              niveau: programmeDeLaClasse(classe),
              mode,
              coeursMax: mode === DEFI ? coeursDeLaClasse(classe) : 0,
              // RELANCER, C'EST REMONTER L'ÉCRAN. Changer la clé React suffit :
              // le jeu repart avec une graine neuve, sans qu'il ait à savoir
              // qu'on le recommence.
              rejouerPartie: (suivant) => lancer(suivant ?? mode),
              terminerDefi,
            }}
          >
          <Ecran
            key={partie}
            onQuitter={fermer}
            matiereCode={matiereCode}
            // LA CLASSE RÈGLE LA DIFFICULTÉ : l'horloge du CE1 a ses demies. Et
            // c'est bien la classe REGARDÉE : un CM2 qui rouvre un jeu de CE1 le
            // retrouve tel qu'il était au CE1, sinon le retour n'a aucun sens.
            niveau={programmeDeLaClasse(classe)}
          />
          </FournirJeu>
        ) : (
          <>
            <FriseDesClasses
              etapes={etapes}
              choisie={etape?.code}
              // Au lycée, l'année choisie reste dans la voie de l'élève : une
              // terminale STMG qui regarde « 1re » retrouve la 1re techno.
              onChoisir={(code) => setRegardee(classeDansSaVoie(code, niveauCode))}
            />

            {jeux.length === 0 ? (
              <div className="fiches-vide">
                <p className="fiches-vide__titre">
                  {etape ? `Pas encore de jeu en ${etape.court}.` : 'Pas encore de jeu pour ta classe.'}
                </p>
                <p>
                  Les premiers arrivent bientôt. En attendant, tu peux jouer à
                  ceux des classes d’avant : choisis-les dans la frise.
                </p>
              </div>
            ) : (
              // UNE SECTION PAR MATIÈRE, titrée — voir `parMatiere` dans le
              // catalogue. Chaque section prend la couleur de sa matière, celle
              // que l'enfant voit déjà sur ses cartes de cours.
              <div className="jeux-matieres">
                {parMatiere(jeux).map((groupe) => (
                  <section
                    key={groupe.matiereCode}
                    className="jeux-matiere"
                    style={styleMatiere({ matiereLibelle: groupe.matiere })}
                    aria-labelledby={`jeux-matiere-${groupe.matiereCode}`}
                  >
                    <h2 id={`jeux-matiere-${groupe.matiereCode}`} className="jeux-matiere__titre">
                      <span className="jeux-matiere__pastille" aria-hidden="true" />
                      {groupe.matiere}
                    </h2>

                    <ul className="jeux-liste">
                      {groupe.jeux.map((jeu) => (
                        <li key={jeu.cle}>
                          <CarteJeu jeu={jeu} onOuvrir={ouvrir} />
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}

                <ProchainsJeux />
              </div>
            )}
          </>
        )}
        </div>
      </section>
    );
  }

  /**
   * « DE NOUVEAUX JEUX ARRIVENT » — Camara, le 21/09/2026 : « à la fin de la
   * page mes jeux, un message pour dire que plein d'autres jeux arrivent dans
   * les autres matières, que les enfants soient patients ; propre, joli, design
   * gaming ». Au lancement, seuls les maths et le français ont leurs jeux ; ce
   * panneau dit aux enfants que ce n'est qu'un début.
   *
   * Il reprend l'enseigne du titre de la page (Lilita One, cerne de nuit) et
   * ses couleurs fixes, pour être le même sur les deux thèmes. Les matières à
   * venir sont des « niveaux verrouillés » : un cadenas, et « Bientôt ».
   */
  function ProchainsJeux() {
    return (
      <aside className="jeux-bientot" aria-labelledby="jeux-bientot-titre">
        <span className="jeux-bientot__etoiles" aria-hidden="true" />
        <p className="jeux-bientot__badge">Nouveaux niveaux en préparation</p>
        <h2 id="jeux-bientot-titre" className="jeux-bientot__titre">
          D’autres jeux <span className="jeux-bientot__accent">arrivent !</span>
        </h2>
        {/* SANS LISTE DE MATIÈRES — Camara, le 08/10/2026 : « enlève les
            matières ». L'anglais et les sciences ont désormais leurs escape
            games ; nommer ce qui arrive reviendrait à promettre une date. */}
        <p className="jeux-bientot__texte">
          Tes professeurs préparent plein de nouveaux jeux, dans d’autres
          matières. Encore un peu de patience.
        </p>

        <div className="jeux-bientot__chargement" aria-hidden="true">
          <span className="jeux-bientot__barre" />
      </div>
    </aside>
  );
}

/** Une carte de la ludothèque : sa couverture, ou son aperçu dessiné. */
function CarteJeu({ jeu, onOuvrir }) {
  return (
    <button
      type="button"
      className={`jeu-carte${jeu.image ? ' jeu-carte--illustree' : ''}`}
      data-jeu={jeu.cle}
      style={{
        ...styleMatiere({ matiereLibelle: jeu.matiere }),
        ...(jeu.image ? { backgroundImage: `url(${jeu.image})` } : {}),
      }}
      onClick={() => { bruitage('selection'); onOuvrir(jeu.cle); }}
    >
      {/* LE DESSIN D'ABORD, LE TEXTE ENSUITE : c'est l'ordre dans
          lequel un enfant lit une carte de jeu.

          L'APERÇU DESSINÉ NE SERT QUE SANS ILLUSTRATION. Les deux
          ensemble feraient deux images l'une sur l'autre — et
          l'aperçu, qui dit déjà ce qu'est le jeu, ferait doublon. */}
      {!jeu.image && (
        <span className="jeu-carte__vignette">
          {VIGNETTES[jeu.cle] ? VIGNETTES[jeu.cle]() : null}
        </span>
      )}

      {/* QUAND LA COUVERTURE PORTE DÉJÀ LE TITRE, on ne le réécrit
          pas par-dessus : ce serait deux fois le même mot, l'un
          peint et l'autre posé. Mais il reste dans le DOM, caché,
          pour les lecteurs d'écran — qui ne voient pas ce qui est
          dessiné sur une image. */}
      <span className={jeu.titreDansImage ? 'visuellement-cache' : 'jeu-carte__corps'}>
        <span className="jeu-carte__matiere">
          <span className="jeu-carte__point" aria-hidden="true" />
          {jeu.matiere}
        </span>
        <strong className="jeu-carte__titre">{jeu.titre}</strong>
        <span className="jeu-carte__accroche">{jeu.accroche}</span>
      </span>

      <span className="jeu-carte__jouer">
        <span className="jeu-carte__triangle" aria-hidden="true" />
        Jouer
      </span>
    </button>
  );
}
