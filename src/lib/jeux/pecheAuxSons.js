/**
 * LA PÊCHE AUX SONS — le premier jeu de français de Mimia, pour le CP.
 *
 * Voulu par Camara le 21/09/2026.
 *
 * COMPÉTENCE DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   FR_CP_LECT_GRAPHEMES — « Connaître les correspondances entre lettres et
 *   sons »
 *
 * LE PLAN RANGEAIT AUSSI « ENCODER UN MOT » SOUS CE JEU. Encoder, c'est écrire
 * un mot à partir des sons qu'on entend : ici, l'enfant repère un son, il
 * n'écrit rien. FR_CP_ECR_ENCODER reste ouverte pour un autre jeu, et n'est
 * PAS déclarée ici.
 *
 * LE JEU. Six poissons dans la mare, chacun avec une image. Adrien dit le son
 * du jour — la lettre s'affiche en grand —, puis nomme chaque image. L'enfant
 * pêche celles où il entend le son, et annonce qu'il a fini.
 *
 * ADRIEN NOMME CHAQUE IMAGE, ET C'EST ESSENTIEL. Une image peut se dire de
 * deux façons : le mouton est aussi un « agneau », la fusée une « navette ».
 * La compétence est d'entendre le son dans le mot, pas de deviner le mot : le
 * mot est donc toujours donné. Un haut-parleur sur chaque poisson le redit.
 *
 * LA TABLE DES MOTS EST UNE DONNÉE RELUE, son par son. Chaque mot porte la
 * liste des sons qu'on y ENTEND — pas des lettres qu'on y écrit : « loup »
 * s'écrit avec un u mais ne contient pas le son « u », et c'est justement le
 * piège le plus utile du CP. Un test vérifie que chaque manche ne demande
 * que des mots où le son est présent, et ne propose en leurre que des mots
 * où il est absent.
 */

export const MANCHES = 8;
export const PAR_MANCHE = 6;
export const CIBLES = 3;
export const ESSAIS_AVANT_AIDE = 3;

/**
 * LES SONS DU JEU. `lettre` est ce qui s'affiche en grand. `consigne` est ce
 * que dit Adrien : une voyelle se dit seule ; une consonne ne se prononce pas
 * seule sans devenir le nom de la lettre (« ch » deviendrait « cé-hache »),
 * on la fait donc entendre au début d'un mot.
 */
export const SONS = [
  { cle: 'a', lettre: 'a', consigne: 'Pêche les images où tu entends « a », comme dans « chat ».', exemple: 'chat' },
  { cle: 'i', lettre: 'i', consigne: 'Pêche les images où tu entends « i », comme dans « lit ».', exemple: 'lit' },
  { cle: 'o', lettre: 'o', consigne: 'Pêche les images où tu entends « o », comme dans « vélo ».', exemple: 'velo' },
  { cle: 'u', lettre: 'u', consigne: 'Pêche les images où tu entends « u », comme dans « lune ».', exemple: 'lune' },
  { cle: 'ou', lettre: 'ou', consigne: 'Pêche les images où tu entends « ou », comme dans « loup ».', exemple: 'loup' },
  { cle: 'on', lettre: 'on', consigne: 'Pêche les images où tu entends « on », comme dans « mouton ».', exemple: 'mouton' },
  { cle: 'an', lettre: 'an', consigne: 'Pêche les images où tu entends « an », comme dans « orange ».', exemple: 'orange' },
  { cle: 'ch', lettre: 'ch', consigne: 'Pêche les images où tu entends le son du début de « chat ».', exemple: 'chat' },
  { cle: 'r', lettre: 'r', consigne: 'Pêche les images où tu entends le son du début de « rat ».', exemple: 'rat' },
  { cle: 'l', lettre: 'l', consigne: 'Pêche les images où tu entends le son du début de « lune ».', exemple: 'lune' },
];

/**
 * LES MOTS ET LEURS SONS ENTENDUS.
 *
 * `sons` ne liste que les sons du jeu. `douteux` écarte un mot des manches
 * d'un son qu'on y entend à moitié : « camion » se dit « ca-myon », et le
 * « i » qui y glisse ferait débat — ni cible, ni leurre.
 *
 * Les émojis ont été choisis parmi les plus anciens, pour s'afficher sur
 * toutes les tablettes, et pour ne se lire que d'une façon une fois nommés.
 */
export const MOTS = [
  { cle: 'chat', mot: 'chat', image: '🐱', sons: ['ch', 'a'] },
  { cle: 'lapin', mot: 'lapin', image: '🐰', sons: ['l', 'a'] },
  { cle: 'vache', mot: 'vache', image: '🐄', sons: ['a', 'ch'] },
  { cle: 'rat', mot: 'rat', image: '🐀', sons: ['r', 'a'] },
  { cle: 'banane', mot: 'banane', image: '🍌', sons: ['a'] },
  { cle: 'canard', mot: 'canard', image: '🦆', sons: ['a', 'r'] },
  { cle: 'sapin', mot: 'sapin', image: '🎄', sons: ['a'] },
  { cle: 'loup', mot: 'loup', image: '🐺', sons: ['l', 'ou'] },
  { cle: 'poule', mot: 'poule', image: '🐔', sons: ['ou', 'l'] },
  { cle: 'souris', mot: 'souris', image: '🐭', sons: ['ou', 'r', 'i'] },
  { cle: 'bouche', mot: 'bouche', image: '👄', sons: ['ou', 'ch'] },
  { cle: 'ours', mot: 'ours', image: '🐻', sons: ['ou', 'r'] },
  { cle: 'mouton', mot: 'mouton', image: '🐑', sons: ['ou', 'on'] },
  { cle: 'fourmi', mot: 'fourmi', image: '🐜', sons: ['ou', 'r', 'i'] },
  { cle: 'lune', mot: 'lune', image: '🌙', sons: ['l', 'u'] },
  { cle: 'tortue', mot: 'tortue', image: '🐢', sons: ['o', 'r', 'u'] },
  { cle: 'bus', mot: 'bus', image: '🚌', sons: ['u'] },
  { cle: 'tulipe', mot: 'tulipe', image: '🌷', sons: ['u', 'l', 'i'] },
  { cle: 'fusee', mot: 'fusée', image: '🚀', sons: ['u'] },
  { cle: 'lunettes', mot: 'lunettes', image: '👓', sons: ['l', 'u'] },
  { cle: 'lit', mot: 'lit', image: '🛏️', sons: ['l', 'i'] },
  { cle: 'riz', mot: 'riz', image: '🍚', sons: ['r', 'i'] },
  { cle: 'citron', mot: 'citron', image: '🍋', sons: ['i', 'r', 'on'] },
  { cle: 'pizza', mot: 'pizza', image: '🍕', sons: ['i', 'a'] },
  { cle: 'robot', mot: 'robot', image: '🤖', sons: ['r', 'o'] },
  { cle: 'moto', mot: 'moto', image: '🏍️', sons: ['o'] },
  { cle: 'velo', mot: 'vélo', image: '🚲', sons: ['l', 'o'] },
  { cle: 'pomme', mot: 'pomme', image: '🍎', sons: ['o'] },
  { cle: 'soleil', mot: 'soleil', image: '☀️', sons: ['o', 'l'] },
  { cle: 'cochon', mot: 'cochon', image: '🐷', sons: ['o', 'ch', 'on'] },
  { cle: 'ballon', mot: 'ballon', image: '🎈', sons: ['a', 'l', 'on'] },
  { cle: 'maison', mot: 'maison', image: '🏠', sons: ['on'] },
  { cle: 'dragon', mot: 'dragon', image: '🐉', sons: ['r', 'a', 'on'] },
  { cle: 'bonbon', mot: 'bonbon', image: '🍬', sons: ['on'] },
  { cle: 'camion', mot: 'camion', image: '🚚', sons: ['a', 'on'], douteux: ['i'] },
  { cle: 'dent', mot: 'dent', image: '🦷', sons: ['an'] },
  { cle: 'elephant', mot: 'éléphant', image: '🐘', sons: ['l', 'an'] },
  { cle: 'serpent', mot: 'serpent', image: '🐍', sons: ['r', 'an'] },
  { cle: 'orange', mot: 'orange', image: '🍊', sons: ['o', 'r', 'an'] },
  { cle: 'tente', mot: 'tente', image: '⛺', sons: ['an'] },
  { cle: 'panda', mot: 'panda', image: '🐼', sons: ['an', 'a'] },
  { cle: 'ange', mot: 'ange', image: '👼', sons: ['an'] },
  { cle: 'cheval', mot: 'cheval', image: '🐴', sons: ['ch', 'a', 'l'] },
  { cle: 'chapeau', mot: 'chapeau', image: '🎩', sons: ['ch', 'a', 'o'] },
  { cle: 'main', mot: 'main', image: '✋', sons: [] },
  { cle: 'fraise', mot: 'fraise', image: '🍓', sons: ['r'] },
  { cle: 'fleur', mot: 'fleur', image: '🌸', sons: ['l', 'r'] },
];

export function mot(cle) {
  return MOTS.find((m) => m.cle === cle);
}

export function son(cle) {
  return SONS.find((s) => s.cle === cle);
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
 * LA SÉRIE D'UNE PARTIE : huit sons différents, et pour chacun trois mots où
 * on l'entend et trois où on ne l'entend pas.
 *
 * LE MOT D'EXEMPLE N'EST JAMAIS DANS LA MARE : Adrien vient de le dire avec
 * le son, le pêcher ne demanderait rien.
 */
export function serie(graine = Date.now(), manches = MANCHES) {
  const tirer = suite(graine);
  const melanger = (liste) => {
    const copie = [...liste];
    for (let i = copie.length - 1; i > 0; i -= 1) {
      const j = Math.floor(tirer() * (i + 1));
      [copie[i], copie[j]] = [copie[j], copie[i]];
    }
    return copie;
  };

  return melanger(SONS).slice(0, manches).map((s) => {
    const avec = MOTS.filter((m) => m.sons.includes(s.cle) && m.cle !== s.exemple && !m.douteux?.includes(s.cle));
    const sans = MOTS.filter((m) => !m.sons.includes(s.cle) && !m.douteux?.includes(s.cle));
    const poissons = melanger([
      ...melanger(avec).slice(0, CIBLES).map((m) => ({ mot: m.cle, cible: true })),
      ...melanger(sans).slice(0, PAR_MANCHE - CIBLES).map((m) => ({ mot: m.cle, cible: false })),
    ]);
    return { son: s.cle, poissons };
  });
}

/**
 * Ce que vaut une pêche annoncée — même règle que le chantier des formes : un
 * intrus pêché passe avant une cible oubliée, parce qu'on peut le MONTRER
 * sans donner la réponse.
 */
export function verdict(peches, poissons) {
  const cibles = poissons.filter((p) => p.cible).map((p) => p.mot);
  const erreurs = peches.filter((c) => !cibles.includes(c));
  if (erreurs.length > 0) return { sens: 'intrus', erreurs };
  if (cibles.some((c) => !peches.includes(c))) return { sens: 'manque', erreurs: [] };
  return { sens: 'juste', erreurs: [] };
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
  intrus: 'Écoute encore : dans cette image, on n’entend pas le son.',
  intrusPluriel: 'Écoute encore : dans ces images, on n’entend pas le son.',
  manque: 'Il en manque. Écoute encore chaque image.',
  aide: 'Regarde : les voici. Dans ces images, on entend le son.',
};
