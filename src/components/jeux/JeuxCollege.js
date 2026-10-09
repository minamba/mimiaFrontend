import {
  createContext, useContext, useEffect, useLayoutEffect, useRef, useState,
} from 'react';
import { MODULES_COLLEGE } from '../../lib/jeux/college/index.js';
import { MODULES_LYCEE } from '../../lib/jeux/lycee/index.js';
import {
  cadran, dureeEscape, enMinutes, resteMs,
} from '../../lib/jeux/college/chrono.js';
import { DEFI } from '../../lib/jeux/coeurs';
import { useJeuOuvert } from '../../lib/jeux/contexteJeu';
import { IMAGES_SECONDAIRE } from '../../lib/jeux/imagesSecondaire.js';
import useAmbiance, { DERNIERE_MINUTE_MS, adresseAmbiance } from '../../lib/jeux/ambiance.js';
import jeuSimple from './JeuSimple';

/**
 * LES ÉCRANS DES JEUX DU COLLÈGE — voir `lib/jeux/college/index.js`.
 *
 * Aucun écran à écrire jeu par jeu : un jeu du collège est un module « une
 * question, des choix », joué par l'écran commun (`JeuDeChoix`, via
 * `jeuSimple`). La voix suit : le préfixe de ses phrases est la clé du jeu.
 *
 * LA QUESTION GARDE SES RETOURS À LA LIGNE : un programme du robot, un
 * tableau de valeurs, un extrait de texte s'écrivent sur plusieurs lignes.
 */
/**
 * LES QUESTIONS SUR PLUSIEURS LIGNES S'ALIGNENT À GAUCHE, et le CODE garde ses
 * espaces de début de ligne (07/10/2026) : en Python, l'indentation fait
 * partie du programme — « pre-line » l'effaçait, et une boucle devenait
 * illisible. Est du code une question dont une ligne commence par des
 * espaces, ou qui porte un mot-clé de programme.
 */
function classeQuestion(texte) {
  const q = String(texte ?? '');
  const lignes = q.includes('\n');
  const code = lignes && (/\n[ \t\u00a0]+\S/.test(q) || /\b(def|for|while|print|range|append)\b/.test(q));
  return `phrase-a-trou college__question${lignes ? ' college__question--lignes' : ''}${code ? ' college__question--code' : ''}`;
}

const question = (m) => <p className={classeQuestion(m.question)}>{m.question}</p>;

/**
 * EN FRANÇAIS, LE MOT À ANALYSER EST ENTRE CROCHETS dans la question
 * (« Le chat [mange] la souris. ») : on le souligne au lieu de montrer les
 * crochets. Pas en maths, où [AB] est un segment et doit rester écrit tel quel.
 */
function designer(texte) {
  return String(texte).split(/(\[[^\]]+\])/).map((morceau, i) => (/^\[[^\]]+\]$/.test(morceau)
    // eslint-disable-next-line react/no-array-index-key
    ? <strong key={i} className="college__designe">{morceau.slice(1, -1)}</strong>
    : morceau));
}

const questionFrancais = (m) => <p className={classeQuestion(m.question)}>{designer(m.question)}</p>;

/**
 * LE CODE DU CADENAS, case par case : les pièces déjà trouvées, celle de
 * l'étape — un « ? » tant qu'elle n'est pas gagnée —, puis les cases vides.
 */
function Cadenas({ cadenas, ouvert }) {
  const cases = Array.from({ length: cadenas.total }, (_, i) => {
    if (i < cadenas.avant.length) return { piece: cadenas.avant[i], etat: 'trouvee' };
    if (i === cadenas.avant.length) return ouvert ? { piece: cadenas.piece, etat: 'nouvelle' } : { piece: '?', etat: 'courante' };
    return { piece: '', etat: 'vide' };
  });
  const trouvees = cadenas.avant.length + (ouvert ? 1 : 0);
  return (
    <div className="escape__cadenas" aria-label={`Code : ${trouvees} pièce${trouvees > 1 ? 's' : ''} sur ${cadenas.total}`}>
      <span className="escape__serrure" aria-hidden="true">{trouvees === cadenas.total ? '🔓' : '🔒'}</span>
      <ol className="escape__code">
        {cases.map((c, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <li key={i} className={`escape__piece escape__piece--${c.etat}`}>{c.piece}</li>
        ))}
      </ol>
    </div>
  );
}

/**
 * LA PARTIE EN COURS D'UN ESCAPE GAME, pour son compte à rebours : quand elle
 * a commencé, quand le dernier cadenas s'est ouvert. Elle vit AU-DESSUS de
 * l'écran de jeu, qui ne sait rien du temps, et passe d'une étape à l'autre
 * sans être remise à zéro.
 */
const PartieEscape = createContext(null);

/**
 * LE COMPTE À REBOURS — voir `lib/jeux/college/chrono.js`.
 *
 * UNE PARTIE NEUVE SE RECONNAÎT À SA PREMIÈRE ÉTAPE : « Rejouer » tire une
 * nouvelle série sans démonter l'écran, et sa première étape est un objet
 * neuf. C'est là que le chrono repart. Le relevé se fait pendant le rendu,
 * comme les cœurs : un relevé identique ne change rien, le double rendu du
 * mode strict retombe sur le même état.
 *
 * À ZÉRO, EN DÉFI, la page démonte le jeu (`terminerDefi`), exactement comme
 * au dernier cœur ; en tranquille, il affiche « Temps écoulé » et l'élève
 * finit quand même.
 */
function useCompteARebours(m, termine, duree) {
  const partie = useContext(PartieEscape);

  if (m.cadenas.avant.length === 0 && partie.premiere !== m) {
    partie.premiere = m;
    partie.debut = Date.now();
    partie.fin = null;
    partie.signale = false;
  }
  const derniere = m.cadenas.avant.length === m.cadenas.total - 1;
  if (derniere && termine && partie.fin == null) partie.fin = Date.now();
  const arrete = partie.fin != null;

  const [maintenant, setMaintenant] = useState(() => Date.now());
  useEffect(() => {
    if (arrete) return undefined;
    const id = setInterval(() => setMaintenant(Date.now()), 250);
    return () => clearInterval(id);
  }, [arrete]);

  const reste = resteMs(duree, partie.debut, arrete ? partie.fin : Math.max(maintenant, partie.debut));
  return { partie, reste, arrete };
}

/**
 * L'AFFICHAGE DU CHRONO. Le temps se compte au-dessus de lui, dans la scène
 * (`useCompteARebours`), parce que l'ambiance en a besoin aussi : à la
 * dernière minute, elle laisse place à la musique de fin (09/10/2026).
 */
function Chrono({
  m, termine, duree, partie, reste, arrete,
}) {
  const { mode, terminerDefi } = useJeuOuvert();
  const defi = mode === DEFI;
  const ouverts = m.cadenas.avant.length + (termine ? 1 : 0);

  useLayoutEffect(() => {
    if (reste > 0 || !defi || arrete || partie.signale) return;
    partie.signale = true;
    terminerDefi?.({ reussies: ouverts, questions: ouverts, raison: 'temps', total: m.cadenas.total });
  }, [reste, defi, arrete, partie, terminerDefi, ouverts, m.cadenas.total]);

  const etat = reste === 0 ? ' est-ecoule' : (reste < 60000 ? ' est-presse' : '');
  return (
    // LE CHRONO EN MODE JEU VIDÉO — Camara, le 08/10/2026 : « rends-le plus mode
    // gaming ; quand on arrive à une minute de la fin, mets un halo ». Un anneau
    // néon qui se vide, un cadran à chiffres lumineux, et dans la dernière minute
    // tout passe au rouge avec un halo qui pulse.
    <div className={`escape__chrono${etat}`} role="timer" aria-label={`Temps restant : ${cadran(reste)}`}>
      <span className="escape__anneau" aria-hidden="true">
        <svg viewBox="0 0 44 44">
          <circle className="escape__anneau-fond" cx="22" cy="22" r="19" />
          <circle
            className="escape__anneau-jauge"
            cx="22"
            cy="22"
            r="19"
            pathLength="100"
            style={{ strokeDashoffset: 100 - Math.round((reste / (duree * 1000)) * 1000) / 10 }}
          />
        </svg>
        <span className="escape__anneau-icone">⏱</span>
      </span>
      <span className="escape__temps">
        <span className="escape__etiquette" aria-hidden="true">
          {reste === 0 ? 'Temps écoulé' : (reste < 60000 ? 'Dernière minute' : 'Temps restant')}
        </span>
        <span className="escape__cadran">{cadran(reste)}</span>
      </span>
      {reste === 0 && !arrete && <span className="escape__ecoule">Temps écoulé : finis quand même, la porte t’attend.</span>}
    </div>
  );
}

/** Ce qu'a duré la partie, dit une fois le dernier cadenas ouvert. */
function Duree({ duree }) {
  const partie = useContext(PartieEscape);
  if (partie?.fin == null) return null;
  const ecoule = partie.fin - partie.debut;
  return (
    <p className="escape__duree">
      {ecoule <= duree * 1000
        ? `Porte ouverte en ${enMinutes(ecoule)}, avant la fin du compte à rebours !`
        : `Porte ouverte en ${enMinutes(ecoule)} : le chrono était à zéro, mais tu as tenu jusqu’au bout.`}
    </p>
  );
}

/**
 * LA SCÈNE D'UN ESCAPE GAME : le décor et la mission avant le premier cadenas,
 * le compte à rebours, le récit de l'étape, sa question, le code qui se
 * remplit — et, le dernier cadenas ouvert, ce que l'élève a sauvé, et en
 * combien de temps.
 *
 * L'ANNONCE DU CHRONO EST AFFICHÉE, JAMAIS DITE : ses mots dépendent du mode
 * et de la classe, et une phrase dite doit être fixe pour être enregistrée.
 */
/**
 * L'AMBIANCE DE L'HISTOIRE (09/10/2026) : une boucle de bruits naturels qui joue
 * tant que la partie dure, et le bouton qui la coupe — voir `lib/jeux/ambiance.js`.
 */
function Ambiance({ url, finale, resteMs: reste }) {
  const { coupee, basculer } = useAmbiance(url, { finale, resteMs: reste });
  return (
    <button
      type="button"
      className={`escape__ambiance${coupee ? ' est-coupee' : ''}`}
      onClick={basculer}
      aria-pressed={!coupee}
      title={coupee ? 'Remettre l’ambiance' : 'Couper l’ambiance'}
    >
      <span aria-hidden="true">{coupee ? '🔇' : '🌊'}</span>
      <span>{coupee ? 'Ambiance coupée' : 'Ambiance'}</span>
    </button>
  );
}

function SceneEscape({
  m, termine, intro, fin, duree, francais, ambiance,
}) {
  const { mode } = useJeuOuvert();
  const premiere = m.cadenas.avant.length === 0;
  const derniere = m.cadenas.avant.length === m.cadenas.total - 1;
  const { partie, reste, arrete } = useCompteARebours(m, termine, duree);
  // La dernière minute d'une partie en cours : la musique de fin remplace l'ambiance.
  const finale = !arrete && reste > 0 && reste <= DERNIERE_MINUTE_MS;
  return (
    <div className="escape">
      <div className="escape__barre">
        <Chrono m={m} termine={termine} duree={duree} partie={partie} reste={reste} arrete={arrete} />
        <Ambiance url={ambiance} finale={finale} resteMs={reste} />
      </div>
      {premiere && intro && <p className="escape__intro">{intro}</p>}
      {premiere && (
        <p className="escape__annonce">
          {`Tu as ${duree / 60} minutes pour ouvrir les six cadenas. `}
          {mode === DEFI ? 'À zéro, l’alarme gagne !' : 'À zéro, tu pourras quand même finir.'}
        </p>
      )}
      <p className="escape__recit">{m.recit}</p>
      <p className={classeQuestion(m.question)}>{francais ? designer(m.question) : m.question}</p>
      <Cadenas cadenas={m.cadenas} ouvert={termine} />
      {derniere && termine && fin && <p className="escape__fin" role="status">{fin}</p>}
      {derniere && termine && <Duree duree={duree} />}
    </div>
  );
}

const sceneEscape = ({ intro, fin }, francais, duree, ambiance) => (m, termine) => (
  <SceneEscape m={m} termine={termine} intro={intro} fin={fin} duree={duree} francais={francais} ambiance={ambiance} />
);

/**
 * L'ÉCRAN D'UN MODULE. Un escape game a une scène par classe (son intro et sa
 * fin en dépendent) ; un jeu ordinaire, une seule. Une classe que le module ne
 * couvre pas — elle ne devrait jamais arriver, le catalogue filtre — reprend
 * sa première classe plutôt que de planter.
 */
function ecranDuModule(module) {
  const { cle } = module.FAMILLE;
  const francais = module.FAMILLE.matiereCode === 'FRANCAIS';
  const parClasse = Object.fromEntries(module.CLASSES.map((niveau) => [niveau, jeuSimple({
    module,
    prefixe: cle,
    classe: `jeu--college jeu--${cle}${module.ESCAPE ? ' jeu--escape' : ''}`,
    rendreQuestion: module.ESCAPE
      ? sceneEscape(module.PAR_CLASSE[niveau], francais, dureeEscape(niveau), adresseAmbiance(cle, niveau))
      : (francais ? questionFrancais : question),
    niveau,
    // Le fond peint de ce jeu dans cette classe, s'il existe (08/10/2026).
    fond: IMAGES_SECONDAIRE[`${cle}|${niveau}`]?.fond,
  })]));

  function Ecran({ niveau, ...props }) {
    const classe = parClasse[niveau] ? niveau : module.CLASSES[0];
    const Jeu = parClasse[classe];
    // Le chrono d'un escape game vit ici, au-dessus du jeu : voir `Chrono`.
    const partie = useRef({}).current;
    return module.ESCAPE
      ? <PartieEscape.Provider value={partie}><Jeu {...props} niveau={classe} /></PartieEscape.Provider>
      : <Jeu {...props} niveau={classe} />;
  }
  Ecran.displayName = `JeuCollege(${cle})`;
  return Ecran;
}

/**
 * LE LYCÉE PASSE PAR LA MÊME FABRIQUE (07/10/2026) : ses modules suivent le
 * même contrat, ses escape games ont la même scène et le même chrono.
 */
const MODULES = [...MODULES_COLLEGE, ...MODULES_LYCEE];

/** Clé du catalogue → écran, pour `ECRANS` dans `JeuxEleve`. */
export const ECRANS_COLLEGE = Object.fromEntries(
  MODULES.map((module) => [module.FAMILLE.cle, ecranDuModule(module)]),
);

/**
 * L'APERÇU DE LA CARTE, faute de couverture : un cadenas pour un escape game,
 * le signe de sa matière pour les autres. Du texte, rien à charger.
 */
const SIGNES = {
  MATHS: 'x²', FRANCAIS: 'Aa', HISTOIRE_GEO: '🧭', ANGLAIS: 'En', SCIENCES: '🔬', PHYSIQUE_CHIMIE: '⚗️', SVT: '🌱',
};

export const VIGNETTES_COLLEGE = Object.fromEntries(MODULES.map((module) => [
  module.FAMILLE.cle,
  () => (
    <span className={`college__vignette${module.ESCAPE ? ' college__vignette--escape' : ''}`} aria-hidden="true">
      {module.ESCAPE ? '🔐' : SIGNES[module.FAMILLE.matiereCode] ?? '★'}
    </span>
  ),
]));
