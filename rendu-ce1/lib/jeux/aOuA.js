const React = require('react');
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.avecRemplacant = exports.VERBES = exports.PHRASES_SON = exports.PHRASES_ON = exports.PHRASES_ET = exports.PHRASES_A = exports.PHRASES = exports.MANCHES = void 0;
exports.bilan = bilan;
exports.remplacant = exports.paire = void 0;
exports.serie = serie;
exports.verdict = verdict;
/**
 * A OU À ? ET OU EST ? — le premier nouveau jeu de français du CE1.
 *
 * Voulu par Camara le 21/09/2026.
 *
 * COMPÉTENCE DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   FR_CE1_LANG_A_ET — « Distinguer a et à, et et est »
 *
 * LE JEU. Une phrase à trou ; l'enfant choisit le mot qui manque. Dix
 * phrases, cinq de chaque paire, mêlées.
 *
 * LA MÉTHODE EST CELLE DE LA CLASSE, et c'est elle que l'erreur rappelle :
 *   - « a » se remplace par « avait » : Léo a un chat → Léo avait un chat ;
 *   - « est » se remplace par « était » : le ciel est bleu → le ciel était
 *     bleu.
 * Si le remplacement marche, c'est le verbe ; sinon, c'est l'autre mot. Une
 * fois la phrase juste, le jeu montre le remplacement : la preuve, pas
 * seulement la réponse.
 *
 * LES PHRASES SONT ÉCRITES À LA MAIN ET RELUES : chacune n'a qu'une réponse
 * possible, et son remplacement est une vraie phrase.
 *
 * AU CE2, SON OU SONT ? ON OU ONT ? — Camara, le 21/09/2026. Compétence :
 *   FR_CE2_LANG_SON_ONT — « Distinguer son et sont, on et ont »
 * Même méthode, deux remplaçants de plus : « sont » devient « étaient », « ont »
 * devient « avaient ». Le trou n'est jamais en tête de phrase : « On » avec
 * une majuscule donnerait la réponse.
 */

const MANCHES = exports.MANCHES = 10;

/**
 * `avant` et `apres` entourent le trou ; `bon` est le mot qui manque ;
 * `preuve` est la phrase avec « avait » ou « était », quand elle marche.
 */
const PHRASES_A = exports.PHRASES_A = [{
  avant: 'Léo',
  apres: 'un chat.',
  bon: 'a'
}, {
  avant: 'Je vais',
  apres: 'l’école.',
  bon: 'à'
}, {
  avant: 'Maman',
  apres: 'faim.',
  bon: 'a'
}, {
  avant: 'Nous allons',
  apres: 'la piscine.',
  bon: 'à'
}, {
  avant: 'Il',
  apres: 'un vélo rouge.',
  bon: 'a'
}, {
  avant: 'Elle joue',
  apres: 'la balle.',
  bon: 'à'
}, {
  avant: 'Mon frère',
  apres: 'sept ans.',
  bon: 'a'
}, {
  avant: 'Ce livre est',
  apres: 'Lina.',
  bon: 'à'
}, {
  avant: 'Tom',
  apres: 'une belle voiture.',
  bon: 'a'
}, {
  avant: 'Je pense',
  apres: 'toi.',
  bon: 'à'
}, {
  avant: 'Le chien',
  apres: 'soif.',
  bon: 'a'
}, {
  avant: 'On part',
  apres: 'la mer.',
  bon: 'à'
}];
const PHRASES_ET = exports.PHRASES_ET = [{
  avant: 'Le ciel',
  apres: 'bleu.',
  bon: 'est'
}, {
  avant: 'J’aime le chocolat',
  apres: 'les fraises.',
  bon: 'et'
}, {
  avant: 'La soupe',
  apres: 'chaude.',
  bon: 'est'
}, {
  avant: 'Paul',
  apres: 'Julie jouent.',
  bon: 'et'
}, {
  avant: 'Mon chat',
  apres: 'noir.',
  bon: 'est'
}, {
  avant: 'Il mange une pomme',
  apres: 'une poire.',
  bon: 'et'
}, {
  avant: 'Le train',
  apres: 'en retard.',
  bon: 'est'
}, {
  avant: 'Je prends mon sac',
  apres: 'mon manteau.',
  bon: 'et'
}, {
  avant: 'Cette fleur',
  apres: 'jolie.',
  bon: 'est'
}, {
  avant: 'Le chat',
  apres: 'le chien dorment.',
  bon: 'et'
}, {
  avant: 'La porte',
  apres: 'fermée.',
  bon: 'est'
}, {
  avant: 'Un crayon',
  apres: 'une gomme.',
  bon: 'et'
}];
const PHRASES_SON = exports.PHRASES_SON = [{
  avant: 'Léo range',
  apres: 'cartable.',
  bon: 'son'
}, {
  avant: 'Les enfants',
  apres: 'dans la cour.',
  bon: 'sont'
}, {
  avant: 'Elle promène',
  apres: 'chien.',
  bon: 'son'
}, {
  avant: 'Mes amis',
  apres: 'en retard.',
  bon: 'sont'
}, {
  avant: 'Il lave',
  apres: 'vélo.',
  bon: 'son'
}, {
  avant: 'Les pommes',
  apres: 'mûres.',
  bon: 'sont'
}, {
  avant: 'Tom mange',
  apres: 'goûter.',
  bon: 'son'
}, {
  avant: 'Les chats',
  apres: 'sur le toit.',
  bon: 'sont'
}, {
  avant: 'Lina cherche',
  apres: 'crayon.',
  bon: 'son'
}, {
  avant: 'Ces fleurs',
  apres: 'belles.',
  bon: 'sont'
}];
const PHRASES_ON = exports.PHRASES_ON = [{
  avant: 'Demain,',
  apres: 'part en vacances.',
  bon: 'on'
}, {
  avant: 'Mes parents',
  apres: 'une voiture rouge.',
  bon: 'ont'
}, {
  avant: 'Ce soir,',
  apres: 'mange des crêpes.',
  bon: 'on'
}, {
  avant: 'Les oiseaux',
  apres: 'fait un nid.',
  bon: 'ont'
}, {
  avant: 'Ici,',
  apres: 'parle doucement.',
  bon: 'on'
}, {
  avant: 'Ils',
  apres: 'gagné le match.',
  bon: 'ont'
}, {
  avant: 'À la récré,',
  apres: 'court partout.',
  bon: 'on'
}, {
  avant: 'Les élèves',
  apres: 'bien travaillé.',
  bon: 'ont'
}, {
  avant: 'Dans ma classe,',
  apres: 'lit beaucoup.',
  bon: 'on'
}, {
  avant: 'Mes voisins',
  apres: 'un grand chien.',
  bon: 'ont'
}];
const PAIRES = [['a', 'à'], ['et', 'est'], ['son', 'sont'], ['on', 'ont']];
const REMPLACANTS = {
  a: 'avait',
  et: 'était',
  son: 'étaient',
  on: 'avaient'
};
/** Le mot de chaque paire qui est le verbe : c'est lui que le remplaçant remplace. */
const VERBES = exports.VERBES = ['a', 'est', 'sont', 'ont'];

/** La paire d'une phrase : « a » et « à », « et » et « est », « son » et « sont », « on » et « ont ». */
const paire = p => PAIRES.find(x => x.includes(p.bon));

/** Le mot qui remplace le verbe : avait, était, étaient, avaient. */
exports.paire = paire;
const remplacant = p => REMPLACANTS[paire(p)[0]];

/** La phrase avec le remplaçant — une vraie phrase quand le mot est le verbe. */
exports.remplacant = remplacant;
const avecRemplacant = p => `${p.avant} ${remplacant(p)} ${p.apres}`;

/** Un tirage reproductible — voir la note de `boiteDeDix.js`. */
exports.avecRemplacant = avecRemplacant;
function suite(graine) {
  let etat = graine % 2147483647;
  if (etat <= 0) etat += 2147483646;
  return () => {
    etat = etat * 16807 % 2147483647;
    return (etat - 1) / 2147483646;
  };
}

/** Dix phrases, cinq de chaque paire, mêlées. */
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
  const [x, y] = niveau === 'CE2' ? [PHRASES_SON, PHRASES_ON] : [PHRASES_A, PHRASES_ET];
  return melanger([...melanger(x).slice(0, 5), ...melanger(y).slice(0, 5)]);
}

/** Juste, ou le mot qu'on aurait dû tester. */
function verdict(p, choix) {
  return choix === p.bon ? 'juste' : p.bon;
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
const PHRASES = exports.PHRASES = {
  consigneA: 'Complète la phrase : a, ou à avec un accent ?',
  consigneEt: 'Complète la phrase : et, ou est ?',
  // La méthode, du côté du mot qu'il fallait.
  a: 'Essaie avec « avait » : ça marche, alors on écrit a, sans accent.',
  'à': 'Essaie avec « avait » : ça ne marche pas, alors on écrit à, avec un accent.',
  est: 'Essaie avec « était » : ça marche, alors on écrit est.',
  et: 'Essaie avec « était » : ça ne marche pas, alors on écrit et.',
  consigneSon: 'Complète la phrase : son, ou sont ?',
  consigneOn: 'Complète la phrase : on, ou ont ?',
  sont: 'Essaie avec « étaient » : ça marche, alors on écrit sont.',
  son: 'Essaie avec « étaient » : ça ne marche pas, alors on écrit son.',
  ont: 'Essaie avec « avaient » : ça marche, alors on écrit ont.',
  on: 'Essaie avec « avaient » : ça ne marche pas, alors on écrit on.'
};