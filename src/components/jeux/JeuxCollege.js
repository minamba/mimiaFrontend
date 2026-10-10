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
import { SCENES } from './scenes';
import useAmbiance, { DERNIERE_MINUTE_MS, adresseAmbiance } from '../../lib/jeux/ambiance.js';
import { REPERES_ESCAPE } from '../../lib/jeux/reperesEscape.js';
import { bruitage } from '../../lib/jeux/bruitages';
import { repliquesEscape, sansRang } from '../../lib/jeux/escapeTextes.js';
import useVoixJeu from '../../lib/jeux/voix/useVoixJeu';
import jeuSimple from './JeuSimple';
import {
  classeQuestion, designer, question, questionFrancais,
} from './scenes/base';

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
function useCompteARebours(m, termine, duree, attente = false) {
  const partie = useContext(PartieEscape);

  if (m.cadenas.avant.length === 0 && partie.premiere !== m) {
    partie.premiere = m;
    partie.debut = Date.now();
    partie.fin = null;
    partie.signale = false;
  }
  // Tant que la mission s'affiche, le temps ne court pas : le départ recule avec l'horloge.
  if (attente) partie.debut = Date.now();
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

/**
 * LE RÉCIT QUI S'ÉCRIT À LA MACHINE — l'énigme se dévoile lettre à lettre,
 * comme dans les escape games en ligne que Camara a montrés (09/10/2026). Un
 * clic l'écrit d'un coup ; un lecteur d'écran lit tout le texte dès le début ;
 * qui a demandé moins d'animations à son système l'a d'emblée en entier.
 */
const sansAnimation = () => typeof window === 'undefined'
  || typeof window.matchMedia !== 'function'
  || window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function Machine({ texte, className = 'exploration__recit' }) {
  const t = String(texte ?? '');
  const [n, setN] = useState(() => (sansAnimation() ? t.length : 0));
  useEffect(() => {
    if (sansAnimation()) {
      setN(t.length);
      return undefined;
    }
    setN(0);
    const id = setInterval(() => setN((k) => {
      if (k >= t.length) {
        clearInterval(id);
        return k;
      }
      return k + 2;
    }), 28);
    return () => clearInterval(id);
  }, [t]);
  const fini = n >= t.length;
  // Écrit en entier : le texte une seule fois, sans le double réservé au lecteur d'écran.
  if (fini) return <p className={className}>{t}</p>;
  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <p className={className} onClick={() => setN(t.length)}>
      <span className="visuellement-cache">{t}</span>
      <span aria-hidden="true">
        {t.slice(0, n)}
        {!fini && <span className="exploration__curseur" />}
      </span>
    </p>
  );
}

/**
 * Faute de repères pour un décor : six places réparties dans la salle, et la
 * porte au fond. Ne devrait servir que le temps de repérer un décor nouveau.
 */
const PLACES_PAR_DEFAUT = [
  { x: 16, y: 56, nom: 'le coin de gauche' },
  { x: 32, y: 38, nom: 'le mur du fond, à gauche' },
  { x: 48, y: 66, nom: 'le centre de la salle' },
  { x: 66, y: 40, nom: 'le mur du fond, à droite' },
  { x: 84, y: 58, nom: 'le coin de droite' },
  { x: 30, y: 78, nom: 'le sol, devant toi' },
];
const PORTE_PAR_DEFAUT = { x: 50, y: 28, nom: 'la porte' };

/** L'inventaire : chaque cadenas ouvert y range sa pièce, et l'objet où on l'a trouvée. */
function Inventaire({ objets, pieces, total }) {
  return (
    <aside className="exploration__inventaire" aria-label={`Inventaire : ${pieces.length} pièce${pieces.length > 1 ? 's' : ''} sur ${total}`}>
      <p className="exploration__inventaire-titre">Inventaire</p>
      <ol className="exploration__cases">
        {Array.from({ length: total }, (_, i) => (
          <li
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            className={`exploration__case${i < pieces.length ? ' est-pleine' : ''}${i === pieces.length - 1 ? ' est-nouvelle' : ''}`}
          >
            {i < pieces.length ? (
              <>
                <span className="exploration__lettre">{pieces[i]}</span>
                <span className="exploration__provenance">{objets[i]?.nom}</span>
              </>
            ) : <span className="exploration__vide" aria-hidden="true">?</span>}
          </li>
        ))}
      </ol>
    </aside>
  );
}

/**
 * LA SALLE À FOUILLER — Camara, le 09/10/2026, captures d'escape games en
 * ligne à l'appui : « des mouvements dans des pièces, des choses à
 * sélectionner ». Le décor de l'histoire devient une salle : six objets réels
 * y sont repérés (`reperesEscape.js`), un par cadenas. Celui du cadenas en
 * cours brille ; un clic zoome sur lui et ouvre son énigme, dont le récit
 * s'écrit à la machine. Chaque cadenas ouvert range sa pièce dans
 * l'inventaire ; les six ouverts, la porte s'éclaire et l'on sort.
 *
 * DANS L'ORDRE DU RÉCIT, un objet après l'autre : les étapes se suivent dans
 * l'histoire, et la voix dit « le premier cadenas », « le deuxième »… Les
 * objets suivants restent visibles, fermés : on voit ce qui reste à fouiller.
 *
 * LA MISSION D'ABORD : l'intro de l'histoire et la règle du chrono, sur une
 * carte. Le compte à rebours ne part qu'au clic sur « Commencer l'enquête ».
 */
function SalleEscape({
  etat, histoire, duree, ambiance, image, reperes, module, niveau,
}) {
  const {
    courante: m, manche, termine, enquete, ouvrir, enigme, sortie, sortir,
  } = etat;
  const { mode } = useJeuOuvert();
  const [commence, setCommence] = useState(false);
  const mission = !commence && manche === 0 && !enquete;
  const { partie, reste, arrete } = useCompteARebours(m, termine, duree, mission);

  // LA MISSION EST LUE — Camara, le 09/10/2026 : l'intro de l'histoire, puis
  // l'annonce du chrono. « Commencer l'enquête » coupe la lecture : la voix de
  // l'énigme prend la suite (`JeuDeChoix`).
  const voixMission = useVoixJeu(module.FAMILLE.matiereCode);
  const { dire: direMission, arreter: arreterMission } = voixMission;
  const defi = mode === DEFI;
  useEffect(() => {
    if (!mission) return;
    const cle = module.FAMILLE.cle;
    direMission([
      ...(histoire.intro ? [repliquesEscape.intro(cle, module, niveau)] : []),
      repliquesEscape.annonce(cle, duree / 60, defi),
    ]);
    // Une fois, à l'ouverture de la mission.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mission]);
  const finale = !arrete && reste > 0 && reste <= DERNIERE_MINUTE_MS;

  const objets = reperes?.objets?.length === m.cadenas.total ? reperes.objets : PLACES_PAR_DEFAUT;
  const porte = reperes?.porte ?? PORTE_PAR_DEFAUT;
  const ici = objets[manche] ?? objets[0];
  const pieces = [...m.cadenas.avant, ...(termine ? [m.cadenas.piece] : [])];

  const fouiller = () => {
    bruitage('selection');
    ouvrir();
  };
  const franchir = () => {
    bruitage('selection');
    sortir();
  };

  return (
    <div className={`exploration${enquete ? ' est-en-enquete' : ''}${mission ? ' est-en-mission' : ''}`}>
      <div className="escape__barre">
        <Chrono m={m} termine={termine} duree={duree} partie={partie} reste={reste} arrete={arrete} />
        <Ambiance url={ambiance} finale={finale} resteMs={reste} />
      </div>

      <div className="exploration__corps">
        <div className="exploration__piece" style={image ? { backgroundImage: `url(${image})` } : undefined}>
          <span className="exploration__poussiere" aria-hidden="true" />
          {objets.map((o, i) => {
            const etatObjet = i < pieces.length ? 'fouille' : (i === manche && !sortie ? 'a-fouiller' : 'ferme');
            const actif = etatObjet === 'a-fouiller' && !enquete && !mission;
            return (
              <button
                // eslint-disable-next-line react/no-array-index-key
                key={i}
                type="button"
                className={`exploration__objet est-${etatObjet}`}
                style={{ left: `${o.x}%`, top: `${o.y}%` }}
                onClick={actif ? fouiller : undefined}
                disabled={!actif}
                aria-label={etatObjet === 'a-fouiller' ? `Fouiller ${o.nom}` : `${o.nom} : ${etatObjet === 'fouille' ? 'cadenas ouvert' : 'pas encore'}`}
              >
                <span className="exploration__icone" aria-hidden="true">
                  {etatObjet === 'fouille' ? '✓' : (etatObjet === 'a-fouiller' ? '🔍' : '🔒')}
                </span>
                {etatObjet === 'a-fouiller' && <span className="exploration__etiquette" aria-hidden="true">{o.nom}</span>}
              </button>
            );
          })}
          <button
            type="button"
            className={`exploration__porte${sortie ? ' est-ouverte' : ''}`}
            style={{ left: `${porte.x}%`, top: `${porte.y}%` }}
            onClick={sortie ? franchir : undefined}
            disabled={!sortie}
            aria-label={sortie ? `Sortir par ${porte.nom}` : `${porte.nom} : fermée par six cadenas`}
          >
            <span aria-hidden="true">{sortie ? '🚪' : '🔐'}</span>
          </button>

          {sortie && (
            <div className="exploration__sortie" role="status">
              <Cadenas cadenas={m.cadenas} ouvert />
              {histoire.fin && <p className="escape__fin">{histoire.fin}</p>}
              <Duree duree={duree} />
              <button type="button" className="btn btn--principal" onClick={franchir}>
                {`Sortir par ${porte.nom}`}
              </button>
            </div>
          )}

          {/* Les fiches s'ouvrent dans la salle, centrées sur elle. */}
          {mission && (
            <div className="exploration__voile">
              <div className="exploration__fiche exploration__fiche--mission">
                <p className="exploration__titre">{histoire.titre}</p>
                {histoire.intro && <Machine texte={histoire.intro} />}
                <p className="escape__annonce">
                  {`Tu as ${duree / 60} minutes pour ouvrir les six cadenas. `}
                  {mode === DEFI ? 'À zéro, l’alarme gagne !' : 'À zéro, tu pourras quand même finir.'}
                </p>
                <p className="exploration__conseil">Fouille la salle : l’objet qui brille cache le premier cadenas.</p>
                <button
                  type="button"
                  className="btn btn--principal"
                  onClick={() => {
                    bruitage('selection');
                    arreterMission();
                    setCommence(true);
                  }}
                >
                  Commencer l’enquête
                </button>
              </div>
            </div>
          )}
          {enigme && (
            <div className="exploration__voile exploration__voile--enigme" style={{ '--ox': `${ici.x}%`, '--oy': `${ici.y}%` }}>
              <div className="exploration__fiche" role="dialog" aria-modal="true" aria-label={`Le cadenas caché dans ${ici.nom}`}>
                <p className="exploration__lieu">
                  <span className="exploration__numero">{String(manche + 1).padStart(2, '0')}</span>
                  {ici.nom}
                </p>
                {enigme}
              </div>
            </div>
          )}
        </div>

        <Inventaire objets={objets} pieces={pieces} total={m.cadenas.total} />
      </div>


    </div>
  );
}

/** Dans la salle, l'énigme : le récit de l'objet, à la machine, puis la question. */
const enigmeEscape = (francais) => (m) => (
  <div className="exploration__enigme">
    <Machine texte={sansRang(m.recit)} />
    <p className={classeQuestion(m.question)}>{francais ? designer(m.question) : m.question}</p>
  </div>
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
    rendreQuestion: module.ESCAPE ? enigmeEscape(francais) : (SCENES[cle]?.question ?? (francais ? questionFrancais : question)),
    // UNE SCÈNE PROPRE AU JEU (09/10/2026) : voir `scenes/index.js`.
    rendreApres: SCENES[cle]?.apres,
    objets: SCENES[cle]?.objets,
    rendreLesChoix: SCENES[cle]?.choix,
    // UN ESCAPE GAME SE JOUE DANS SA SALLE (09/10/2026) : voir `SalleEscape`.
    // L'annonce du chrono y est affichée, jamais dite : ses mots dépendent du
    // mode et de la classe, et une phrase dite doit être fixe pour être enregistrée.
    salle: module.ESCAPE
      ? (etat) => (
        <SalleEscape
          etat={etat}
          histoire={module.PAR_CLASSE[niveau]}
          module={module}
          niveau={niveau}
          duree={dureeEscape(niveau)}
          ambiance={adresseAmbiance(cle, niveau)}
          image={IMAGES_SECONDAIRE[`${cle}|${niveau}`]?.fond}
          reperes={REPERES_ESCAPE[`${cle}|${niveau}`]}
        />
      )
      : undefined,
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
