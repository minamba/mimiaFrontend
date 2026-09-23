/**
 * UN OU DES ? — le quatrième jeu de français de Mimia, pour le CP.
 *
 * Voulu par Camara le 21/09/2026.
 *
 * COMPÉTENCE DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   FR_CP_LANG_PLURIEL — « Marquer le pluriel d'un nom par un -s »
 *
 * LE PLAN RANGEAIT AUSSI « RECONNAÎTRE UNE QUESTION, UN ORDRE » SOUS CE JEU.
 * C'est une autre compétence (FR_CP_LANG_TYPES), un autre geste — écouter
 * l'intonation d'une phrase — et elle ne tient pas dans le titre. Elle n'est
 * PAS déclarée ici ; elle reste ouverte pour un autre jeu.
 *
 * LE JEU. Une image montre un objet, ou plusieurs. L'enfant compose
 * l'étiquette : il choisit « un » (ou « une ») ou « des », puis le nom sans
 * ou avec son s. Puis il annonce.
 *
 * LE S NE S'ENTEND PAS, ET C'EST TOUT LE SUJET. « un chat » et « des chats »
 * se disent pareil à la fin : seul le petit mot devant et le nombre d'objets
 * disent qu'il faut un s.
 *
 * CHAQUE ÉTIQUETTE SE FAIT LIRE — Camara, le 21/09/2026 : « le professeur de
 * français ne lit pas les propositions ». Au début, Adrien ne les disait pas :
 * « chat » et « chats » sonnent pareil, les lire n'aidait pas à choisir. Mais
 * un enfant de CP qui déchiffre mal restait bloqué devant « des ». Désormais,
 * un haut-parleur sur chaque étiquette la fait dire — sans la choisir. Et on
 * fait de la difficulté la leçon : quand l'enfant a écouté les deux formes
 * d'un même nom, Adrien lui fait remarquer que c'est pareil, et que ce sont
 * ses yeux qui décident. Une fois par partie, pas à chaque manche.
 * « chats » se dit donc avec le son de « chat » : c'est le même enregistrement
 * (voir `motADire`).
 *
 * DEUX ERREURS DIFFÉRENTES, DEUX RÉPONSES DIFFÉRENTES :
 *   - le NOMBRE : « un » devant trois chats → « compte bien » ;
 *   - l'ACCORD : « des chats » juste, mais « des chat » → « avec des, le mot
 *     prend un s ». C'est la règle que le jeu enseigne ; elle est nommée
 *     telle quelle.
 *
 * DES NOMS À PLURIEL RÉGULIER SEULEMENT : pas de x (« bateaux », « oiseaux »),
 * pas de nom qui finit déjà par s (« souris », « ours »). Le CP apprend le -s ;
 * les exceptions viennent au CE1.
 */

export const MANCHES = 10;
export const ESSAIS_AVANT_AIDE = 3;

/** Les noms, leur petit mot au singulier, et leur image. */
export const NOMS = [
  { nom: 'chat', article: 'un', image: '🐱' },
  { nom: 'chien', article: 'un', image: '🐶' },
  { nom: 'lapin', article: 'un', image: '🐰' },
  { nom: 'poisson', article: 'un', image: '🐟' },
  { nom: 'canard', article: 'un', image: '🦆' },
  { nom: 'ballon', article: 'un', image: '🎈' },
  { nom: 'livre', article: 'un', image: '📕' },
  { nom: 'crayon', article: 'un', image: '✏️' },
  { nom: 'arbre', article: 'un', image: '🌳' },
  { nom: 'vélo', article: 'un', image: '🚲' },
  { nom: 'poule', article: 'une', image: '🐔' },
  { nom: 'pomme', article: 'une', image: '🍎' },
  { nom: 'fleur', article: 'une', image: '🌷' },
  { nom: 'étoile', article: 'une', image: '⭐' },
  { nom: 'voiture', article: 'une', image: '🚗' },
  { nom: 'fraise', article: 'une', image: '🍓' },
  { nom: 'banane', article: 'une', image: '🍌' },
  { nom: 'maison', article: 'une', image: '🏠' },
  { nom: 'clé', article: 'une', image: '🔑' },
  { nom: 'tortue', article: 'une', image: '🐢' },
];

export function nom(cle) {
  return NOMS.find((n) => n.nom === cle);
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
 * LA SÉRIE D'UNE PARTIE : dix noms différents, autant de « un » que de
 * « des », dans le désordre. Au pluriel, de deux à cinq objets : un enfant
 * qui ne regarderait que « deux » apprendrait que pluriel veut dire deux.
 *
 * L'ordre des étiquettes est tiré aussi : sans cela, le singulier serait
 * toujours à gauche, et l'enfant apprendrait une place, pas une règle.
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

  const pluriels = melanger(Array.from({ length: MANCHES }, (_, i) => i < MANCHES / 2));
  return melanger(NOMS).slice(0, MANCHES).map((n, i) => ({
    nom: n.nom,
    combien: pluriels[i] ? 2 + Math.floor(tirer() * 4) : 1,
    petitsMots: melanger([n.article, 'des']),
    formes: melanger([n.nom, `${n.nom}s`]),
  }));
}

/**
 * Ce que vaut une étiquette annoncée. Le nombre passe avant l'accord : si le
 * petit mot ne va pas avec l'image, c'est ce qu'il faut regarder d'abord.
 */
export function verdict(petitMot, forme, manche) {
  const pluriel = manche.combien > 1;
  const attendu = pluriel ? 'des' : nom(manche.nom).article;
  if (petitMot !== attendu) return { sens: 'nombre', pluriel };
  const avecS = forme.endsWith('s') && forme !== manche.nom;
  if (avecS !== pluriel) return { sens: 'accord', pluriel };
  return { sens: 'juste', pluriel };
}

/**
 * Ce qu'on entend en écoutant une étiquette : le petit mot tel quel, ou le nom
 * SANS son s — « fleurs » se dit comme « fleur », c'est le même son.
 */
export function motADire(etiquetteChoisie) {
  if (['un', 'une', 'des'].includes(etiquetteChoisie)) return { sorte: 'petit-mot', mot: etiquetteChoisie };
  const leNom = NOMS.find((n) => n.nom === etiquetteChoisie || `${n.nom}s` === etiquetteChoisie);
  return { sorte: 'nom', mot: leNom.nom };
}

/** L'étiquette juste, telle qu'elle s'écrit. */
export function etiquette(manche) {
  const n = nom(manche.nom);
  return manche.combien > 1 ? `des ${n.nom}s` : `${n.article} ${n.nom}`;
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
  consigne: 'Il y en a un, ou plusieurs ? Écris l’étiquette avec les bons mots.',
  nombreUn: 'Compte bien : il n’y en a qu’un seul.',
  nombreDes: 'Compte bien : il y en a plusieurs.',
  accordDes: 'Avec « des », le mot prend un s.',
  accordUn: 'Il n’y en a qu’un : le mot ne prend pas de s.',
  aide: 'Regarde : voici la bonne étiquette.',
  pareil: 'Tu entends ? C’est pareil ! Ce sont tes yeux qui décident.',
};
