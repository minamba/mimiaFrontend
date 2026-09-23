/**
 * L'ATELIER DES SYLLABES — le deuxième jeu de français de Mimia, pour le CP.
 *
 * Voulu par Camara le 21/09/2026.
 *
 * COMPÉTENCE DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   FR_CP_LECT_SYLLABES — « Déchiffrer des syllabes et des mots réguliers »
 *
 * LE JEU. Une image, et Adrien dit le mot : « radio ». Un train attend, avec
 * autant de wagons vides que le mot a de syllabes. En dessous, des étiquettes
 * écrites — les syllabes du mot, mêlées à trois leurres. L'enfant pose les
 * étiquettes dans les wagons, dans l'ordre, puis annonce qu'il a fini.
 *
 * LES ÉTIQUETTES NE PARLENT PAS D'EMBLÉE. La compétence est de DÉCHIFFRER : si
 * toucher « ra » faisait entendre « ra », l'enfant choisirait à l'oreille sans
 * rien lire. Le mot entier, lui, est toujours redonné : c'est le modèle sonore
 * auquel il compare ce qu'il lit.
 *
 * DEUX AIDES QUI NE LISENT PAS À SA PLACE — Camara, le 22/09/2026 : « ce serait
 * bien de permettre à l'enfant d'entendre le son de chaque syllabe » :
 *   - « ÉCOUTE EN SYLLABES », toujours là : Adrien dit le mot syllabe par
 *     syllabe, « mou… ton », comme on frappe dans ses mains en classe.
 *     L'enfant sait ce qu'il cherche, mais doit encore le TROUVER en lisant ;
 *   - APRÈS DEUX ERREURS (`SYLLABES_PARLANTES`), chaque étiquette a son
 *     haut-parleur, leurres compris : l'enfant qui décroche n'est jamais
 *     bloqué, mais il a d'abord essayé de lire. Une seule fois par manche,
 *     Adrien le lui annonce.
 *
 * DES MOTS RÉGULIERS SEULEMENT, et le mot est coupé comme on l'apprend au CP,
 * syllabe écrite par syllabe écrite. Sont écartés :
 *   - les lettres muettes (« robot », « canard », « avocat ») : la syllabe
 *     écrite n'y est plus celle qu'on entend ;
 *   - les e muets en fin de mot (« lune », « tomate ») : faut-il un wagon
 *     « ne » ? Les méthodes ne s'accordent pas ;
 *   - les consonnes doubles (« ballon ») et les coupes discutées (« camion »,
 *     « avion » : « mion » ou « mi-on » ?).
 *   « radio », « piano » et « koala » gardent leur voyelle seule : c'est
 *   l'exemple même du plan, « ra-di-o ».
 *
 * LES LEURRES SONT ÉCRITS À LA MAIN, mot par mot, et relus : une voyelle ou
 * une consonne voisine (« mo » / « mi »). JAMAIS UN LEURRE QUI SE DIT COMME LA
 * BONNE SYLLABE : « to » à côté de « teau » dans « bateau » punirait un enfant
 * qui a bien lu. Un test le vérifie pour les cas connus.
 */

export const MANCHES = 8;
export const DEUX_SYLLABES = 5;
export const ESSAIS_AVANT_AIDE = 3;
/** Au bout de combien d'erreurs les étiquettes se mettent à parler. */
export const SYLLABES_PARLANTES = 2;

/**
 * LES MOTS. `syllabes` se lit dans l'ordre ; `leurres` sont les trois
 * étiquettes de trop. L'émoji est un des plus anciens, et Adrien nomme
 * toujours le mot : le clavier 🎹 est un « piano », sans débat.
 */
export const MOTS = [
  { cle: 'moto', mot: 'moto', image: '🏍️', syllabes: ['mo', 'to'], leurres: ['mi', 'ta', 'do'] },
  { cle: 'velo', mot: 'vélo', image: '🚲', syllabes: ['vé', 'lo'], leurres: ['va', 'la', 'fé'] },
  { cle: 'cafe', mot: 'café', image: '☕', syllabes: ['ca', 'fé'], leurres: ['co', 'fa', 'vé'] },
  { cle: 'tele', mot: 'télé', image: '📺', syllabes: ['té', 'lé'], leurres: ['ta', 'li', 'dé'] },
  { cle: 'bebe', mot: 'bébé', image: '👶', syllabes: ['bé', 'bé'], leurres: ['ba', 'pé', 'bo'] },
  { cle: 'lama', mot: 'lama', image: '🦙', syllabes: ['la', 'ma'], leurres: ['lo', 'na', 'mi'] },
  { cle: 'judo', mot: 'judo', image: '🥋', syllabes: ['ju', 'do'], leurres: ['jo', 'du', 'to'] },
  { cle: 'panda', mot: 'panda', image: '🐼', syllabes: ['pan', 'da'], leurres: ['pon', 'ta', 'ba'] },
  { cle: 'lapin', mot: 'lapin', image: '🐰', syllabes: ['la', 'pin'], leurres: ['li', 'pan', 'bin'] },
  { cle: 'sapin', mot: 'sapin', image: '🎄', syllabes: ['sa', 'pin'], leurres: ['si', 'pon', 'ba'] },
  { cle: 'melon', mot: 'melon', image: '🍈', syllabes: ['me', 'lon'], leurres: ['mo', 'lan', 'non'] },
  { cle: 'mouton', mot: 'mouton', image: '🐑', syllabes: ['mou', 'ton'], leurres: ['mon', 'tan', 'bou'] },
  { cle: 'bonbon', mot: 'bonbon', image: '🍬', syllabes: ['bon', 'bon'], leurres: ['ban', 'pon', 'bo'] },
  { cle: 'bateau', mot: 'bateau', image: '⛵', syllabes: ['ba', 'teau'], leurres: ['bi', 'tou', 'da'] },
  { cle: 'cadeau', mot: 'cadeau', image: '🎁', syllabes: ['ca', 'deau'], leurres: ['ta', 'dou', 'ga'] },
  { cle: 'citron', mot: 'citron', image: '🍋', syllabes: ['ci', 'tron'], leurres: ['co', 'tra', 'ton'] },

  { cle: 'radio', mot: 'radio', image: '📻', syllabes: ['ra', 'di', 'o'], leurres: ['ro', 'da', 'a'] },
  { cle: 'piano', mot: 'piano', image: '🎹', syllabes: ['pi', 'a', 'no'], leurres: ['po', 'i', 'na'] },
  { cle: 'kimono', mot: 'kimono', image: '👘', syllabes: ['ki', 'mo', 'no'], leurres: ['ka', 'ma', 'nu'] },
  { cle: 'koala', mot: 'koala', image: '🐨', syllabes: ['ko', 'a', 'la'], leurres: ['ka', 'o', 'li'] },
  { cle: 'canape', mot: 'canapé', image: '🛋️', syllabes: ['ca', 'na', 'pé'], leurres: ['co', 'ni', 'ba'] },
  { cle: 'kangourou', mot: 'kangourou', image: '🦘', syllabes: ['kan', 'gou', 'rou'], leurres: ['kon', 'go', 'ra'] },
];

export function mot(cle) {
  return MOTS.find((m) => m.cle === cle);
}

/** Toutes les syllabes écrites du jeu, leurres compris, une fois chacune. */
export function toutesLesSyllabes() {
  return [...new Set(MOTS.flatMap((m) => [...m.syllabes, ...m.leurres]))];
}

/** Un tirage reproductible — voir la note de `boiteDeDix.js`. */
function suite(graine) {
  let etat = graine % 2147483647;
  if (etat <= 0) etat += 2147483646;

  return () => {
    etat = (etat * 16807) % 2147483647;
    return (etat - 1) / 2147483646;
  };
}

/**
 * LA SÉRIE D'UNE PARTIE : cinq mots de deux syllabes pour entrer dans le jeu,
 * puis trois mots de trois syllabes. Chaque manche porte ses étiquettes déjà
 * mélangées : `etiquettes` a un identifiant par étiquette, parce que « bébé »
 * a deux étiquettes « bé » qu'il faut pouvoir poser l'une puis l'autre.
 */
export function serie(graine = Date.now()) {
  const tirer = suite(graine);
  const melanger = (liste) => {
    const copie = [...liste];
    for (let i = copie.length - 1; i > 0; i -= 1) {
      const j = Math.floor(tirer() * (i + 1));
      [copie[i], copie[j]] = [copie[j], copie[i]];
    }
    return copie;
  };

  const deux = melanger(MOTS.filter((m) => m.syllabes.length === 2)).slice(0, DEUX_SYLLABES);
  const trois = melanger(MOTS.filter((m) => m.syllabes.length === 3)).slice(0, MANCHES - DEUX_SYLLABES);

  return [...deux, ...trois].map((m) => ({
    mot: m.cle,
    etiquettes: melanger([...m.syllabes, ...m.leurres]).map((texte, id) => ({ id, texte })),
  }));
}

/**
 * Ce que vaut un train annoncé. On compare ce qui est ÉCRIT, pas quelle
 * étiquette a été posée : les deux « bé » de « bébé » se valent.
 *
 *   - juste : chaque wagon porte la bonne syllabe ;
 *   - ordre : les bonnes syllabes, mais pas à leur place — l'enfant a lu, il
 *     doit maintenant écouter l'ordre ;
 *   - faux : au moins un wagon porte une syllabe qui n'est pas dans le mot.
 *     `erreurs` donne les wagons fautifs, pour les montrer.
 */
export function verdict(poses, cleMot) {
  const attendu = mot(cleMot).syllabes;
  if (poses.every((s, i) => s === attendu[i])) return { sens: 'juste', erreurs: [] };

  const restant = [...attendu];
  const erreurs = [];
  poses.forEach((s, i) => {
    const k = restant.indexOf(s);
    if (k === -1) erreurs.push(i);
    else restant.splice(k, 1);
  });
  if (erreurs.length === 0) return { sens: 'ordre', erreurs: [] };
  return { sens: 'faux', erreurs };
}

/** Le mot de la fin — le même dans tous les jeux. */
export function bilan(duPremierCoup, manches = MANCHES) {
  if (duPremierCoup === manches) return 'Sans une seule erreur. Bravo !';
  if (duPremierCoup >= manches - 2) return 'Presque parfait !';
  if (duPremierCoup >= manches / 2) return 'C’est de mieux en mieux !';
  return 'Tu y arrives. On recommence ?';
}

/**
 * LES PHRASES DU JEU, ÉCRITES ET DITES. Elles vivent ici pour n'exister qu'en
 * un exemplaire : voir `voix/repliques.js`.
 */
export const PHRASES = {
  consigne: 'Écoute le mot, et range ses syllabes dans les wagons.',
  faux: 'Relis le wagon en rouge : cette syllabe n’est pas dans le mot.',
  fauxPluriel: 'Relis les wagons en rouge : ces syllabes ne sont pas dans le mot.',
  ordre: 'Ce sont les bonnes syllabes, mais pas dans le bon ordre.',
  aide: 'Regarde : voici le mot, syllabe par syllabe.',
  sonsOuverts: 'Maintenant, tu peux écouter chaque syllabe : touche son petit haut-parleur.',
};
