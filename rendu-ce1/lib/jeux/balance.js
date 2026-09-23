const React = require('react');
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.avecArticle = exports.PHRASES_CE1 = exports.PHRASES = exports.OBJETS = exports.MANCHES_RANGER = exports.MANCHES = exports.GRAMMES_PAR_CUBE_CE2 = exports.GRAMMES_PAR_CUBE = exports.CUBES_MAX = exports.BOITE_POIDS_CE2 = exports.BOITE_POIDS = void 0;
exports.bilan = bilan;
exports.boiteDe = void 0;
exports.consignePeser = consignePeser;
exports.consignePeserCE1 = consignePeserCE1;
exports.enKilos = enKilos;
exports.estPiege = estPiege;
exports.grammesParCube = exports.grammes = exports.etiquettePoids = void 0;
exports.inclinaison = inclinaison;
exports.objet = objet;
exports.ordreJuste = ordreJuste;
exports.plusLourdQue = plusLourdQue;
exports.resultat = resultat;
exports.resultatCE1 = resultatCE1;
exports.resultatCE2 = resultatCE2;
exports.serie = serie;
exports.verdictGrammes = verdictGrammes;
exports.verdictPeser = verdictPeser;
exports.verdictRanger = verdictRanger;
/**
 * LA BALANCE — le septième jeu de Mimia, pour le CP.
 *
 * Voulu par Camara le 21/09/2026.
 *
 * COMPÉTENCE DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   MATH_CP_MES_MASSE — « Comparer et mesurer des masses »
 *
 * LE PLAN RANGEAIT AUSSI LES LONGUEURS SOUS CE JEU. Une balance ne mesure pas
 * une longueur : MATH_CP_MES_LONGUEUR reste ouverte pour un autre jeu, et
 * n'est PAS déclarée ici.
 *
 * DEUX MOITIÉS DE PARTIE, LES DEUX VERBES DE LA COMPÉTENCE :
 *
 *   1. COMPARER EN RANGEANT (4 manches). Trois objets sur la table, une
 *      balance vide. L'enfant pose les objets deux par deux sur la balance,
 *      autant de fois qu'il veut, puis les range du plus léger au plus lourd
 *      et annonce qu'il a fini.
 *
 *   2. MESURER (4 manches). Un objet sur un plateau ; l'enfant pose des cubes
 *      sur l'autre jusqu'à ce que la balance soit droite, puis annonce. L'objet
 *      pèse alors autant de cubes qu'il en a posé.
 *
 * POURQUOI RANGER, ET PAS « LEQUEL EST LE PLUS LOURD ? » — Camara, le
 * 21/09/2026, devant la première version : « il n'y a pas de réflexion,
 * l'enfant voit celui qui tire vers le bas directement ». C'était vrai :
 * deux objets déjà posés, une balance qui penche, et la réponse était sous
 * ses yeux. Désormais la balance est un OUTIL : c'est l'enfant qui choisit
 * quoi peser, et il doit combiner plusieurs pesées pour conclure — aucune ne
 * suffit à elle seule à ranger trois objets.
 *
 * LE PIÈGE DU CP, ET POURQUOI LES OBJETS SONT CEUX-LÀ. L'enfant croit que le
 * plus gros est le plus lourd. Les objets sont donc choisis pour que la
 * taille MENTE : un gros ballon qui ne pèse presque rien, un petit caillou
 * qui pèse plus que tout. Dans chaque manche, ranger par la taille donne un
 * rangement faux : on ne réussit qu'en pesant.
 *
 * AU MESURAGE, LA BALANCE BOUGE À CHAQUE CUBE, comme une vraie : c'est elle
 * qui dit s'il en manque ou s'il y en a trop. Rien ne se gagne sans
 * l'annoncer.
 */

const MANCHES = exports.MANCHES = 8;
const MANCHES_RANGER = exports.MANCHES_RANGER = 4;

/** Au plus, huit cubes sur un plateau : l'objet le plus lourd en pèse six. */
const CUBES_MAX = exports.CUBES_MAX = 8;

/**
 * LES OBJETS — une donnée relue, pas une génération.
 *
 * `masse` est en cubes. `taille` est l'échelle du dessin : ELLE NE SUIT PAS LA
 * MASSE, et c'est voulu. Le ballon est le plus gros et le plus léger, le
 * caillou le plus petit et le plus lourd.
 */
const OBJETS = exports.OBJETS = [{
  cle: 'ballon',
  nom: 'ballon',
  article: 'le',
  masse: 1,
  taille: 1.35
}, {
  cle: 'balle',
  nom: 'balle',
  article: 'la',
  masse: 2,
  taille: 0.62
}, {
  cle: 'pomme',
  nom: 'pomme',
  article: 'la',
  masse: 3,
  taille: 0.82
}, {
  cle: 'conserve',
  nom: 'boîte de conserve',
  article: 'la',
  masse: 4,
  taille: 0.9
}, {
  cle: 'livre',
  nom: 'livre',
  article: 'le',
  masse: 5,
  taille: 1.15
}, {
  cle: 'caillou',
  nom: 'caillou',
  article: 'le',
  masse: 6,
  taille: 0.58
}];
function objet(cle) {
  return OBJETS.find(o => o.cle === cle);
}

/** Un tirage reproductible — voir la note de `boiteDeDix.js`. */
function suite(graine) {
  let etat = graine % 2147483647;
  if (etat <= 0) etat += 2147483646;
  return () => {
    etat = etat * 16807 % 2147483647;
    return (etat - 1) / 2147483646;
  };
}

/**
 * UN PIÈGE : deux objets dont la taille dit le contraire de la balance — le
 * plus gros est le plus léger. L'écart de taille doit se voir, sinon ce
 * n'est pas un piège mais un détail.
 */
function estPiege(a, b) {
  const [gros, petit] = a.taille > b.taille ? [a, b] : [b, a];
  return gros.taille - petit.taille >= 0.25 && gros.masse < petit.masse;
}

/**
 * L'INCLINAISON DE LA BALANCE, en degrés : positive quand le plateau de
 * droite descend. Cinq degrés par cube d'écart, quatorze au plus — un cube de
 * différence doit se voir, dix ne doivent pas renverser le dessin.
 */
function inclinaison(gauche, droite) {
  return Math.max(-14, Math.min(14, (droite - gauche) * 5));
}

/** Les objets du plus léger au plus lourd : la bonne réponse d'une manche. */
function ordreJuste(cles) {
  return [...cles].sort((a, b) => objet(a).masse - objet(b).masse);
}

/**
 * LA SÉRIE D'UNE PARTIE.
 *
 * À RANGER : trois objets dont au moins une paire est un piège — ranger par
 * la taille y donne donc toujours une erreur —, posés sur la table dans un
 * ordre qui n'est jamais déjà le bon.
 *
 * À MESURER : un objet d'au moins deux cubes — un cube seul, il suffirait
 * d'en poser un —, jamais le même deux fois d'affilée.
 */
function serie(graine = Date.now(), manches = MANCHES) {
  const tirer = suite(graine);
  const pioche = liste => liste[Math.floor(tirer() * liste.length)];
  const melanger = liste => {
    const copie = [...liste];
    for (let i = copie.length - 1; i > 0; i -= 1) {
      const j = Math.floor(tirer() * (i + 1));
      [copie[i], copie[j]] = [copie[j], copie[i]];
    }
    return copie;
  };
  const liste = [];
  for (let i = 0; i < manches; i += 1) {
    if (i < MANCHES_RANGER) {
      let trio;
      let table;
      do {
        trio = melanger(OBJETS).slice(0, 3);
        table = trio.map(o => o.cle);
      } while (!(estPiege(trio[0], trio[1]) || estPiege(trio[0], trio[2]) || estPiege(trio[1], trio[2])) || table.join() === ordreJuste(table).join());
      liste.push({
        mode: 'ranger',
        table
      });
    } else {
      const precedent = liste[liste.length - 1];
      let o;
      do {
        o = pioche(OBJETS.filter(x => x.masse >= 2));
      } while ((precedent === null || precedent === void 0 ? void 0 : precedent.objet) === o.cle);
      liste.push({
        mode: 'peser',
        objet: o.cle
      });
    }
  }
  return liste;
}

/**
 * Ce que vaut un rangement annoncé.
 *
 * L'ERREUR NOMME UNE PAIRE, pas le rangement entier : la première paire de
 * voisins dans le mauvais ordre. « Le livre est plus lourd que la pomme » —
 * l'enfant sait quoi peser pour vérifier, sans qu'on lui donne la réponse.
 */
function verdictRanger(rangement) {
  for (let i = 0; i + 1 < rangement.length; i += 1) {
    const a = objet(rangement[i]);
    const b = objet(rangement[i + 1]);
    if (a.masse > b.masse) return {
      sens: 'inverse',
      lourd: a.cle,
      leger: b.cle
    };
  }
  return {
    sens: 'juste'
  };
}

/** Ce que vaut un mesurage annoncé : le bon nombre de cubes, ou trop, ou pas assez. */
function verdictPeser(cubes, cle) {
  const {
    masse
  } = objet(cle);
  if (cubes === masse) return 'juste';
  return cubes > masse ? 'trop' : 'manque';
}

/** Le mot de la fin — le même dans tous les jeux. */
function bilan(duPremierCoup, manches = MANCHES) {
  if (duPremierCoup === manches) return 'Sans une seule erreur. Bravo !';
  if (duPremierCoup >= manches - 2) return 'Presque parfait !';
  if (duPremierCoup >= manches / 2) return 'C’est de mieux en mieux !';
  return 'Tu y arrives. On recommence ?';
}

/**
 * LES PHRASES DU JEU, ÉCRITES ET DITES. Elles vivent ici pour n'exister qu'en
 * un exemplaire : voir `voix/repliques.js`.
 */
const avecArticle = o => `${o.article} ${o.nom}`;
exports.avecArticle = avecArticle;
const majuscule = t => t.charAt(0).toUpperCase() + t.slice(1);
function consignePeser(cle) {
  return `Pose des cubes pour équilibrer ${avecArticle(objet(cle))}.`;
}

/** Le résultat du mesurage : ce qu'on vient de mesurer, dit en entier. */
function resultat(cle) {
  const o = objet(cle);
  return `${majuscule(avecArticle(o))} pèse ${o.masse} cube${o.masse > 1 ? 's' : ''}.`;
}

/** L'erreur d'un rangement : une paire dans le mauvais ordre. */
function plusLourdQue(lourd, leger) {
  return `${majuscule(avecArticle(objet(lourd)))} est plus lourd${objet(lourd).article === 'la' ? 'e' : ''} que ${avecArticle(objet(leger))}.`;
}
const PHRASES = exports.PHRASES = {
  consigneComparer: 'Pose deux objets sur la balance pour les comparer.',
  consigneRanger: 'Range-les du plus léger au plus lourd.',
  plein: 'La balance est pleine : reprends d’abord un objet.',
  manque: 'Il manque des cubes : l’objet est encore plus lourd.',
  trop: 'Il y a trop de cubes : ce sont eux qui sont plus lourds.'
};

// ------------------------------------------------------------ le CE1

/**
 * AU CE1, LES VRAIS POIDS — Camara, le 21/09/2026 : les jeux de CP qui s'y
 * prêtent gagnent un niveau CE1. Compétence :
 *   MATH_CE1_MES_MASSE — « Comparer et mesurer des masses »
 *
 * LE RANGEMENT NE CHANGE PAS : il travaille déjà « comparer », et les pièges
 * de taille valent à tout âge.
 *
 * LE MESURAGE PASSE DES CUBES AUX GRAMMES. Au CP, le cube est une unité
 * inventée ; le CE1 découvre les unités de tout le monde. L'objet se pèse
 * avec LA BOÎTE DE POIDS DE LA CLASSE — un poids de 500 g, deux de 200 g,
 * deux de 100 g —, pas avec une réserve sans fond : 600 g ne s'obtient pas en
 * posant six fois 100 g, il faut combiner 500 et 100. C'est tout l'intérêt
 * des poids marqués.
 *
 * LES MASSES GARDENT L'ORDRE DU CP, cent grammes par cube : le ballon pèse
 * 100 g, le caillou 600 g. Le rangement et le mesurage disent donc la même
 * chose des mêmes objets.
 */
const GRAMMES_PAR_CUBE = exports.GRAMMES_PAR_CUBE = 100;

/** La boîte de poids : chaque poids n'y est qu'une fois, sauf les doublons marqués. */
const BOITE_POIDS = exports.BOITE_POIDS = [500, 200, 200, 100, 100];

/**
 * AU CE2, LE KILOGRAMME — Camara, le 21/09/2026. Compétence :
 *   MATH_CE2_MES_MASSE — « Utiliser le gramme et le kilogramme »
 * Les objets pèsent 250 g par cube (le caillou, 1 kg 500 g), et la boîte
 * contient le poids d'un kilo : 1 kg, 500 g, 200 g, 50 g. Chaque masse s'y
 * compose d'une seule façon, et 1 250 g oblige à dire « 1 kilogramme 250
 * grammes » — la conversion est dans la réponse.
 */
const GRAMMES_PAR_CUBE_CE2 = exports.GRAMMES_PAR_CUBE_CE2 = 250;
const BOITE_POIDS_CE2 = exports.BOITE_POIDS_CE2 = [1000, 500, 200, 50];
const boiteDe = niveau => niveau === 'CE2' ? BOITE_POIDS_CE2 : BOITE_POIDS;
exports.boiteDe = boiteDe;
const grammesParCube = niveau => niveau === 'CE2' ? GRAMMES_PAR_CUBE_CE2 : GRAMMES_PAR_CUBE;
exports.grammesParCube = grammesParCube;
const grammes = (cle, niveau = 'CE1') => objet(cle).masse * grammesParCube(niveau);

/** Ce que vaut un mesurage en grammes : le poids posé, ou trop, ou pas assez. */
exports.grammes = grammes;
function verdictGrammes(poses, cle, niveau = 'CE1') {
  const total = poses.reduce((s, g) => s + g, 0);
  if (total === grammes(cle, niveau)) return 'juste';
  return total > grammes(cle, niveau) ? 'trop' : 'manque';
}

/** Une masse dite en kilogrammes et grammes : « 1 kilogramme 250 grammes ». */
function enKilos(g) {
  const kg = Math.floor(g / 1000);
  const reste = g % 1000;
  const morceaux = [];
  if (kg > 0) morceaux.push(`${kg} kilogramme${kg > 1 ? 's' : ''}`);
  if (reste > 0) morceaux.push(`${reste} grammes`);
  return morceaux.join(' ');
}

/** L'étiquette d'un poids : « 1 kg » ou « 200 g ». */
const etiquettePoids = g => g >= 1000 ? `${g / 1000} kg` : `${g} g`;
exports.etiquettePoids = etiquettePoids;
function resultatCE2(cle) {
  return `${majuscule(avecArticle(objet(cle)))} pèse ${enKilos(grammes(cle, 'CE2'))}.`;
}
function consignePeserCE1(cle) {
  return `Pose des poids pour équilibrer ${avecArticle(objet(cle))}.`;
}
function resultatCE1(cle) {
  return `${majuscule(avecArticle(objet(cle)))} pèse ${grammes(cle)} grammes.`;
}
const PHRASES_CE1 = exports.PHRASES_CE1 = {
  manque: 'Il manque des poids : l’objet est encore plus lourd.',
  trop: 'Il y a trop de poids : ce sont eux qui sont plus lourds.'
};