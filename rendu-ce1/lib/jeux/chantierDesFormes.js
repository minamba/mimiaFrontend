const React = require('react');
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TAILLE_TAS = exports.PLURIELS = exports.NOMS = exports.MODELES = exports.MANCHES = exports.FAMILLES = exports.ESSAIS_AVANT_AIDE = exports.COULEURS = void 0;
exports.aide = aide;
exports.bilan = bilan;
exports.consigne = consigne;
exports.erreur = erreur;
exports.message = message;
exports.modele = modele;
exports.niveauDe = niveauDe;
exports.serie = serie;
exports.verdict = verdict;
/**
 * LE CHANTIER DES FORMES — le cinquième jeu de Mimia, pour le CP.
 *
 * Voulu par Camara le 21/09/2026. Le chef de chantier a besoin d'un type de
 * pièce — tous les triangles, tous les carrés — et l'enfant les trouve dans
 * le tas, puis annonce qu'il a fini.
 *
 * COMPÉTENCE DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   MATH_CP_GEO_FIGURES — « Reconnaître carré, rectangle, triangle et cercle »
 *
 * CE QUE « RECONNAÎTRE » VEUT DIRE, ET POURQUOI CE N'EST PAS FACILE. Montrer
 * un triangle bien droit parmi un rond et un carré ne demande rien : on
 * repère le dessin qu'on connaît. La difficulté réelle du CP est ailleurs, et
 * elle est bien connue :
 *
 *   - L'ORIENTATION. Un carré posé sur la pointe, les enfants l'appellent
 *     « un losange » et refusent d'y voir un carré. Un triangle à l'envers
 *     n'est plus « un triangle » pour beaucoup d'entre eux.
 *
 *   - LE PROTOTYPE. Ils reconnaissent le triangle du manuel, pointe en haut,
 *     côtés égaux. Un triangle plat et allongé est rejeté.
 *
 *   - LES FAUX AMIS. Un ovale n'est pas un cercle. Une forme qui n'est pas
 *     fermée n'est pas un triangle. Un « triangle » dont un côté est courbé
 *     non plus. Au CP, on apprend qu'une figure a des côtés droits et qu'elle
 *     est fermée : ces pièges vérifient que c'est compris.
 *
 * Le jeu monte donc en trois paliers : les formes du manuel d'abord, pour
 * apprendre le geste ; puis les mêmes formes tournées, allongées, renversées ;
 * enfin les faux amis parmi les intrus.
 *
 * LE PROJET ANNONÇAIT « RECONSTITUER UN DESSIN EN POSANT DES FORMES ».
 * Copier un modèle ne demande que d'apparier deux dessins identiques — un
 * triangle avec un triangle — et ne teste aucune des difficultés ci-dessus.
 * Le quadrillage (MATH_CP_GEO_REPERAGE) qu'il devait aussi travailler reste
 * donc ouvert pour un autre jeu, et n'est PAS déclaré ici.
 */

const MANCHES = exports.MANCHES = 8;

/** Six pièces par tas : assez pour chercher, pas assez pour se perdre. */
const TAILLE_TAS = exports.TAILLE_TAS = 6;

/**
 * Au bout de trois annonces fausses dans la même manche, le jeu montre les
 * bonnes pièces. Sans cette aide, un enfant persuadé qu'un carré sur la
 * pointe est « un losange » tournerait en rond indéfiniment — et c'est
 * justement le moment où lui montrer la réponse lui apprend quelque chose.
 */
const ESSAIS_AVANT_AIDE = exports.ESSAIS_AVANT_AIDE = 3;
const FAMILLES = exports.FAMILLES = ['carre', 'rectangle', 'triangle', 'cercle'];
const NOMS = exports.NOMS = {
  carre: 'carré',
  rectangle: 'rectangle',
  triangle: 'triangle',
  cercle: 'cercle'
};
const PLURIELS = exports.PLURIELS = {
  carre: 'carrés',
  rectangle: 'rectangles',
  triangle: 'triangles',
  cercle: 'cercles'
};

/**
 * LES COULEURS DES PIÈCES, toutes différentes dans un même tas.
 *
 * C'est une règle, pas un goût : si tous les triangles étaient orange,
 * l'enfant trierait par couleur et le jeu ne demanderait plus rien. Six
 * pièces, six couleurs, tirées au hasard : la couleur ne dit jamais la forme.
 */
const COULEURS = exports.COULEURS = ['#e76f51', '#2a9d8f', '#e9b949', '#457b9d', '#9b5de5', '#e56b8a'];
const CARRE = '22,22 78,22 78,78 22,78';
const RECTANGLE = '10,32 90,32 90,68 10,68';
const TRIANGLE = '50,14 88,80 12,80';

/**
 * LES MODÈLES DE PIÈCES — une donnée relue, pas une génération.
 *
 * Tout est dessiné dans un carré de 100 × 100 centré en (50, 50). `niveau`
 * dit à partir de quel palier la pièce peut sortir : 1 pour les formes du
 * manuel, 2 pour les mêmes tournées ou allongées, 3 pour les faux amis.
 *
 * LES RECTANGLES SONT TOUJOURS NETTEMENT PLUS LONGS QUE LARGES — au moins
 * 1,8 fois. Un rectangle presque carré serait une question de mesure, pas de
 * reconnaissance, et le CP ne mesure pas encore les côtés.
 *
 * LES FAUX AMIS (`piege`) ne sont jamais à trouver. Chacun porte la raison
 * pour laquelle ce n'en est pas un, dite à l'enfant s'il le choisit : le
 * message nomme la propriété qui manque, jamais un simple « raté ».
 */
const MODELES = exports.MODELES = [{
  cle: 'carre',
  famille: 'carre',
  niveau: 1,
  trace: {
    type: 'polygone',
    points: CARRE
  }
}, {
  cle: 'carre-penche',
  famille: 'carre',
  niveau: 2,
  rotation: 18,
  trace: {
    type: 'polygone',
    points: CARRE
  }
},
// Le « losange » que les enfants refusent d'appeler carré.
{
  cle: 'carre-pointe',
  famille: 'carre',
  niveau: 2,
  rotation: 45,
  trace: {
    type: 'polygone',
    points: CARRE
  }
}, {
  cle: 'rectangle',
  famille: 'rectangle',
  niveau: 1,
  trace: {
    type: 'polygone',
    points: RECTANGLE
  }
}, {
  cle: 'rectangle-debout',
  famille: 'rectangle',
  niveau: 2,
  rotation: 90,
  trace: {
    type: 'polygone',
    points: RECTANGLE
  }
}, {
  cle: 'rectangle-penche',
  famille: 'rectangle',
  niveau: 2,
  rotation: 25,
  trace: {
    type: 'polygone',
    points: RECTANGLE
  }
}, {
  cle: 'rectangle-long',
  famille: 'rectangle',
  niveau: 2,
  trace: {
    type: 'polygone',
    points: '8,40 92,40 92,60 8,60'
  }
}, {
  cle: 'triangle',
  famille: 'triangle',
  niveau: 1,
  trace: {
    type: 'polygone',
    points: TRIANGLE
  }
}, {
  cle: 'triangle-renverse',
  famille: 'triangle',
  niveau: 2,
  rotation: 180,
  trace: {
    type: 'polygone',
    points: TRIANGLE
  }
}, {
  cle: 'triangle-tourne',
  famille: 'triangle',
  niveau: 2,
  rotation: 35,
  trace: {
    type: 'polygone',
    points: TRIANGLE
  }
}, {
  cle: 'triangle-rectangle',
  famille: 'triangle',
  niveau: 2,
  trace: {
    type: 'polygone',
    points: '18,16 18,84 84,84'
  }
}, {
  cle: 'triangle-plat',
  famille: 'triangle',
  niveau: 2,
  trace: {
    type: 'polygone',
    points: '6,70 94,70 64,42'
  }
}, {
  cle: 'cercle',
  famille: 'cercle',
  niveau: 1,
  trace: {
    type: 'cercle',
    r: 36
  }
},
// ---------------------------------------------------- les faux amis
{
  cle: 'ovale',
  piege: true,
  imite: 'cercle',
  niveau: 3,
  raison: 'Ce rond est aplati : ce n’est pas un cercle.',
  raisonCle: 'aplati',
  trace: {
    type: 'ellipse',
    rx: 42,
    ry: 24
  }
}, {
  cle: 'cercle-ouvert',
  piege: true,
  imite: 'cercle',
  niveau: 3,
  raison: 'Cette forme n’est pas fermée.',
  raisonCle: 'ouverte',
  trace: {
    type: 'chemin',
    d: 'M82.6 34.8 A36 36 0 1 0 82.6 65.2'
  }
}, {
  cle: 'triangle-ouvert',
  piege: true,
  imite: 'triangle',
  niveau: 3,
  raison: 'Cette forme n’est pas fermée.',
  raisonCle: 'ouverte',
  trace: {
    type: 'ligne',
    points: '50,14 88,80 12,80 32.9,43.7'
  }
}, {
  cle: 'triangle-courbe',
  piege: true,
  imite: 'triangle',
  niveau: 3,
  raison: 'Un de ses côtés est courbé.',
  raisonCle: 'courbe',
  trace: {
    type: 'chemin',
    d: 'M50 14 L88 80 Q50 40 12 80 Z'
  }
}, {
  cle: 'carre-ouvert',
  piege: true,
  imite: 'carre',
  niveau: 3,
  raison: 'Cette forme n’est pas fermée.',
  raisonCle: 'ouverte',
  trace: {
    type: 'ligne',
    points: '22,22 78,22 78,78 22,78 22,50'
  }
}, {
  cle: 'rectangle-ouvert',
  piege: true,
  imite: 'rectangle',
  niveau: 3,
  raison: 'Cette forme n’est pas fermée.',
  raisonCle: 'ouverte',
  trace: {
    type: 'ligne',
    points: '46,32 90,32 90,68 10,68 10,32'
  }
}];

/** Le modèle d'une pièce, d'après sa clé. */
function modele(cle) {
  return MODELES.find(m => m.cle === cle);
}

/** Le palier d'une manche : le manuel, puis les formes tournées, puis les faux amis. */
function niveauDe(manche) {
  if (manche < 2) return 1;
  if (manche < 5) return 2;
  return 3;
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
 * LA SÉRIE D'UNE PARTIE.
 *
 * Quatre règles de tirage, chacune vérifiée par un test :
 *
 * 1. JAMAIS LA MÊME FORME DEMANDÉE DEUX FOIS D'AFFILÉE.
 *
 * 2. DEUX OU TROIS PIÈCES À TROUVER, JAMAIS UNE. Avec une seule, l'enfant
 *    s'arrête au premier triangle venu ; avec plusieurs, il doit regarder
 *    tout le tas.
 *
 * 3. JAMAIS DE CARRÉ QUAND ON DEMANDE LES RECTANGLES. Un carré EST un
 *    rectangle — ses quatre coins sont droits. Mais le CP apprend à les
 *    nommer séparément, et l'inclusion n'arrive que bien plus tard. Poser un
 *    carré dans ce tas, c'est poser une question dont la bonne réponse
 *    dépend de la classe : on ne la pose pas.
 *
 * 4. AU PALIER 2, AU MOINS UNE PIÈCE À TROUVER SORT DU MANUEL — tournée,
 *    renversée ou allongée. C'est tout l'intérêt du palier. Au palier 3, un
 *    faux ami se glisse parmi les intrus.
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
  let precedente = null;
  for (let i = 0; i < manches; i += 1) {
    const niveau = niveauDe(i);
    let famille;
    do {
      famille = pioche(FAMILLES);
    } while (famille === precedente);
    precedente = famille;

    // Les pièces à trouver.
    const nombreCibles = 2 + Math.floor(tirer() * 2);
    const bonnes = MODELES.filter(m => m.famille === famille && !m.piege && m.niveau <= niveau);
    const horsManuel = bonnes.filter(m => m.niveau === 2);
    const cibles = [];
    if (niveau >= 2 && horsManuel.length > 0) cibles.push(pioche(horsManuel));

    // Des pièces à trouver DIFFÉRENTES tant qu'il y en a : deux fois le même
    // triangle renversé, c'est une seule question posée deux fois.
    const reserve = melanger(bonnes.filter(m => !cibles.includes(m)));
    for (let k = 0; cibles.length < nombreCibles; k += 1) {
      cibles.push(reserve.length > 0 ? reserve[k % reserve.length] : bonnes[0]);
    }

    // Les intrus.
    const intrus = [];
    if (niveau >= 3) {
      const pieges = MODELES.filter(m => m.piege && m.imite === famille);
      if (pieges.length > 0) intrus.push(pioche(pieges));
    }

    /**
     * LES INTRUS VIENNENT DE PLUSIEURS FORMES, À TOUR DE RÔLE. Tirés au
     * hasard, ils pouvaient tous être des rectangles : deux carrés parmi
     * quatre rectangles, et la manche ne comparait plus qu'une forme à une
     * autre. On les prend donc famille par famille, chacune mélangée.
     */
    const familles = melanger(FAMILLES.filter(f => f !== famille && !(famille === 'rectangle' && f === 'carre')));
    const parFamille = familles.map(f => melanger(MODELES.filter(m => !m.piege && m.famille === f && m.niveau <= niveau)));
    const tour = [];
    const plusLongue = Math.max(...parFamille.map(l => l.length));
    for (let k = 0; k < plusLongue; k += 1) {
      parFamille.forEach(l => {
        if (k < l.length) tour.push(l[k]);
      });
    }
    for (let k = 0; cibles.length + intrus.length < TAILLE_TAS; k += 1) {
      intrus.push(tour[k % tour.length]);
    }
    const couleurs = melanger(COULEURS);
    const pieces = melanger([...cibles.map(m => ({
      modele: m.cle,
      cible: true
    })), ...intrus.map(m => ({
      modele: m.cle,
      cible: false
    }))]).map((piece, k) => ({
      ...piece,
      id: `${i}-${k}`,
      couleur: couleurs[k],
      // La taille aussi est tirée à part de la forme : sans ça, les grands
      // seraient toujours des carrés et l'enfant trierait par taille.
      taille: 0.72 + tirer() * 0.22
    }));
    liste.push({
      famille,
      niveau,
      pieces
    });
  }
  return liste;
}

/**
 * Ce que vaut une annonce : les pièces choisies, comparées au tas.
 *
 * UN INTRUS CHOISI PASSE AVANT UNE PIÈCE OUBLIÉE. C'est l'erreur qui apprend
 * le plus — l'enfant croit qu'une forme en est une et se trompe — et c'est
 * aussi la seule qu'on peut lui MONTRER sans lui donner la réponse : on
 * marque la pièce fautive. Une pièce oubliée, elle, ne se montre pas ; on dit
 * seulement qu'il en manque.
 */
function verdict(choisies, pieces) {
  const cibles = pieces.filter(p => p.cible).map(p => p.id);
  const erreurs = choisies.filter(id => !cibles.includes(id));
  if (erreurs.length > 0) return {
    sens: 'intrus',
    erreurs
  };
  if (cibles.some(id => !choisies.includes(id))) return {
    sens: 'manque',
    erreurs: []
  };
  return {
    sens: 'juste',
    erreurs: []
  };
}

/**
 * LA PHRASE QUI ACCOMPAGNE UNE ANNONCE FAUSSE.
 *
 * Un faux ami choisi seul dit POURQUOI ce n'en est pas un : « elle n'est pas
 * fermée », « un côté est courbé ». C'est la propriété qu'on veut faire
 * entendre, bien plus utile qu'un « ce n'est pas un triangle » qui ne dit pas
 * ce qui cloche.
 */
function erreur(resultat, famille, pieces) {
  if (resultat.sens === 'manque') {
    return {
      cle: 'chantier/manque',
      texte: 'Il en manque. Cherche encore.'
    };
  }
  if (resultat.sens !== 'intrus') return null;
  const fautives = pieces.filter(p => resultat.erreurs.includes(p.id));
  if (fautives.length === 1) {
    const m = modele(fautives[0].modele);
    return m.piege ? {
      cle: `chantier/piege-${m.raisonCle}`,
      texte: m.raison
    } : {
      cle: `chantier/intrus-${famille}`,
      texte: `Celle-ci n’est pas un ${NOMS[famille]}.`
    };
  }
  return {
    cle: `chantier/intrus-pluriel-${famille}`,
    texte: `Celles-ci ne sont pas des ${PLURIELS[famille]}.`
  };
}

/** Le texte seul de l'erreur — ce que l'écran affiche. */
function message(resultat, famille, pieces) {
  var _erreur$texte, _erreur;
  return (_erreur$texte = (_erreur = erreur(resultat, famille, pieces)) === null || _erreur === void 0 ? void 0 : _erreur.texte) !== null && _erreur$texte !== void 0 ? _erreur$texte : null;
}

/**
 * Le mot de la fin, d'après le nombre de manches réussies à la première
 * annonce — même mesure que les quatre autres jeux.
 */
function bilan(duPremierCoup, manches = MANCHES) {
  if (duPremierCoup === manches) return 'Sans une seule erreur. Bravo !';
  if (duPremierCoup >= manches - 2) return 'Presque parfait !';
  if (duPremierCoup >= manches / 2) return 'C’est de mieux en mieux !';
  return 'Tu y arrives. On recommence ?';
}

/**
 * LES PHRASES DU JEU, ÉCRITES ET DITES.
 *
 * LA CONSIGNE N'A PLUS DE DESSIN — Camara, le 21/09/2026 : « dans la
 * question on montre la réponse avec le dessin, c'est normal ? ». Ce ne
 * l'était pas : aux deux premières manches, les pièces à trouver étaient
 * exactement le dessin de la consigne, et à toutes les manches l'enfant
 * comparait des images sans avoir besoin de savoir ce que veut dire
 * « rectangle ». La consigne est maintenant DITE par la professeure : c'est
 * le mot qu'il faut relier à la forme, et c'est précisément la compétence.
 *
 * Elle vit ici et non dans l'écran pour n'exister qu'en un exemplaire : voir
 * `voix/repliques.js`.
 */
function consigne(famille) {
  return `Le chef de chantier a besoin de tous les ${PLURIELS[famille]}.`;
}
function aide(famille) {
  return `Regarde : les voici. Ce sont tous des ${PLURIELS[famille]}.`;
}