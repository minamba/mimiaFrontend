const React = require('react');
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PHRASES = exports.MOTS = exports.MANCHES = exports.FAMILLES = void 0;
exports.bilan = bilan;
exports.famille = void 0;
exports.question = question;
exports.reponse = void 0;
exports.serie = serie;
exports.triplet = triplet;
exports.verdict = verdict;
/**
 * CONTRAIRES ET JUMEAUX — le troisième nouveau jeu de français du CE1.
 *
 * Voulu par Camara le 21/09/2026.
 *
 * COMPÉTENCE DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   FR_CE1_LANG_VOC_RELATIONS — « Employer des synonymes et des contraires »
 *
 * LE JEU. Un mot ; on demande tantôt son contraire, tantôt son « jumeau » —
 * un mot qui veut dire presque la même chose. « Jumeau » est le mot de la
 * classe pour synonyme ; le mot savant est donné une fois trouvé.
 *
 * LE PIÈGE EST TOUJOURS LÀ : quand on demande le contraire, le jumeau est
 * parmi les choix, et inversement. L'enfant qui a reconnu « un mot de la
 * même famille de sens » sans lire la question tombe dedans — et l'erreur
 * lui dit exactement cela.
 *
 * LES TRIPLETS SONT ÉCRITS À LA MAIN ET RELUS : des mots qu'un enfant de
 * sept ans connaît, et un seul contraire, un seul jumeau possibles parmi les
 * choix. Le troisième choix vient d'un autre triplet — JAMAIS D'UN TRIPLET
 * VOISIN (`eviter`) : « énorme », pris chez « gros », voudrait presque dire
 * « grand », et l'enfant aurait raison de le choisir.
 *
 * AU CE2, LES FAMILLES DE MOTS — Camara, le 21/09/2026. Compétence :
 *   FR_CE2_LANG_VOC_RELATIONS — « Utiliser synonymes, contraires et familles de
 *   mots »
 * Quatre manches sur dix demandent un mot de la même famille. LE PIÈGE EST UN
 * SOSIE : un mot qui commence pareil sans partager le sens — « merci » n'est
 * pas de la famille de « mer », « terrible » pas de celle de « terre ».
 * L'enfant qui ne regarde que les lettres tombe dedans, et c'est exactement
 * ce que la famille de mots apprend à dépasser. Les familles sont choisies
 * pour être évidentes par le SENS, pas seulement par l'étymologie.
 */

const MANCHES = exports.MANCHES = 10;
const MOTS = exports.MOTS = [{
  mot: 'content',
  contraire: 'triste',
  jumeau: 'heureux',
  eviter: ['gentil']
}, {
  mot: 'grand',
  contraire: 'petit',
  jumeau: 'immense',
  eviter: ['gros', 'vieux']
}, {
  mot: 'beau',
  contraire: 'laid',
  jumeau: 'joli',
  eviter: ['propre']
}, {
  mot: 'chaud',
  contraire: 'froid',
  jumeau: 'brûlant'
}, {
  mot: 'gentil',
  contraire: 'méchant',
  jumeau: 'aimable',
  eviter: ['content']
}, {
  mot: 'facile',
  contraire: 'difficile',
  jumeau: 'simple'
}, {
  mot: 'fort',
  contraire: 'faible',
  jumeau: 'costaud',
  eviter: ['gros']
}, {
  mot: 'plein',
  contraire: 'vide',
  jumeau: 'rempli',
  eviter: ['mouillé']
}, {
  mot: 'vieux',
  contraire: 'jeune',
  jumeau: 'âgé',
  eviter: ['grand']
}, {
  mot: 'mouillé',
  contraire: 'sec',
  jumeau: 'trempé',
  eviter: ['plein']
}, {
  mot: 'gros',
  contraire: 'mince',
  jumeau: 'énorme',
  eviter: ['grand', 'fort']
}, {
  mot: 'rapide',
  contraire: 'lent',
  jumeau: 'vif'
}, {
  mot: 'propre',
  contraire: 'sale',
  jumeau: 'net',
  eviter: ['beau']
}, {
  mot: 'début',
  contraire: 'fin',
  jumeau: 'commencement'
}];
function triplet(mot) {
  return MOTS.find(m => m.mot === mot);
}
const FAMILLES = exports.FAMILLES = [{
  mot: 'dent',
  famille: 'dentiste',
  sosie: 'dessert'
}, {
  mot: 'jardin',
  famille: 'jardinier',
  sosie: 'jaune'
}, {
  mot: 'lait',
  famille: 'laitier',
  sosie: 'laid'
}, {
  mot: 'fleur',
  famille: 'fleuriste',
  sosie: 'flûte'
}, {
  mot: 'mer',
  famille: 'marin',
  sosie: 'merci'
}, {
  mot: 'terre',
  famille: 'terrain',
  sosie: 'terrible'
}, {
  mot: 'chant',
  famille: 'chanteur',
  sosie: 'chance'
}, {
  mot: 'jour',
  famille: 'journée',
  sosie: 'jouet'
}, {
  mot: 'lent',
  famille: 'lentement',
  sosie: 'lentille'
}, {
  mot: 'glace',
  famille: 'glacier',
  sosie: 'glisser'
}, {
  mot: 'froid',
  famille: 'refroidir',
  sosie: 'fromage'
}, {
  mot: 'peur',
  famille: 'peureux',
  sosie: 'perle'
}];
const famille = mot => FAMILLES.find(f => f.mot === mot);

/** Un tirage reproductible — voir la note de `boiteDeDix.js`. */
exports.famille = famille;
function suite(graine) {
  let etat = graine % 2147483647;
  if (etat <= 0) etat += 2147483646;
  return () => {
    etat = etat * 16807 % 2147483647;
    return (etat - 1) / 2147483646;
  };
}

/**
 * Dix mots différents, cinq contraires et cinq jumeaux mêlés. Les trois
 * choix : la bonne réponse, le piège (l'autre relation) et un mot d'un autre
 * triplet.
 */
function serie(graine = Date.now(), niveau = 'CE1') {
  const tirer = suite(graine);
  const melanger = liste => {
    const copie = [...liste];
    for (let i = copie.length - 1; i > 0; i -= 1) {
      const j = Math.floor(tirer() * (i + 1));
      [copie[i], copie[j]] = [copie[j], copie[i]];
    }
    return copie;
  };
  const ce2 = niveau === 'CE2';
  const nbRelations = ce2 ? MANCHES - 4 : MANCHES;
  const demandes = melanger(Array.from({
    length: nbRelations
  }, (_, i) => i % 2 ? 'contraire' : 'jumeau'));
  const relations = melanger(MOTS).slice(0, nbRelations).map((t, i) => {
    const autres = MOTS.filter(x => {
      var _t$eviter;
      return x !== t && !((_t$eviter = t.eviter) !== null && _t$eviter !== void 0 ? _t$eviter : []).includes(x.mot);
    });
    const ailleurs = autres[Math.floor(tirer() * autres.length)];
    const intrus = tirer() < 0.5 ? ailleurs.contraire : ailleurs.jumeau;
    return {
      mot: t.mot,
      demande: demandes[i],
      choix: melanger([t.contraire, t.jumeau, intrus])
    };
  });
  if (!ce2) return relations;

  // Le CE2 : quatre familles, avec leur sosie et un mot d'une autre famille.
  const familles = melanger(FAMILLES).slice(0, 4).map(f => {
    const autres = FAMILLES.filter(x => x !== f);
    const ailleurs = autres[Math.floor(tirer() * autres.length)].famille;
    return {
      mot: f.mot,
      demande: 'famille',
      choix: melanger([f.famille, f.sosie, ailleurs])
    };
  });
  return melanger([...relations, ...familles]);
}

/** La bonne réponse d'une manche. */
const reponse = m => m.demande === 'famille' ? famille(m.mot).famille : triplet(m.mot)[m.demande];

/** Juste, le piège (l'autre relation), ou un mot sans lien. */
exports.reponse = reponse;
function verdict(m, choix) {
  if (choix === reponse(m)) return 'juste';
  if (m.demande === 'famille') return choix === famille(m.mot).sosie ? 'sosie' : 'sans-lien';
  const t = triplet(m.mot);
  if (choix === t.contraire || choix === t.jumeau) return 'piege';
  return 'sans-lien';
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
function question(m) {
  if (m.demande === 'famille') return `Quel mot est de la même famille que « ${m.mot} » ?`;
  return m.demande === 'contraire' ? `Quel est le contraire de « ${m.mot} » ?` : `Quel mot veut dire presque la même chose que « ${m.mot} » ?`;
}
const PHRASES = exports.PHRASES = {
  piegeContraire: 'Ce mot veut dire presque la même chose. On cherche le contraire.',
  piegeJumeau: 'Ce mot dit le contraire. On cherche un mot qui veut dire presque la même chose.',
  sansLien: 'Ce mot n’a rien à voir. Relis bien le mot.',
  jumeaux: 'Des mots jumeaux, on les appelle des synonymes.',
  sosie: 'Ce mot lui ressemble, mais son sens n’a rien à voir : ce n’est pas la même famille.',
  familles: 'Une famille de mots : des mots construits sur le même mot, qui gardent un peu de son sens.'
};