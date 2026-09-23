/**
 * POÈME, THÉÂTRE OU RÉCIT ? — un jeu du CM1.
 *
 * Voulu par Camara le 21/09/2026.
 *
 * COMPÉTENCE DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   FR_CM1_LECT_GENRES — « Distinguer un poème, une scène de théâtre et un
 *                        récit »
 *
 * UN EXTRAIT, TROIS GENRES. Les extraits sont écrits pour le jeu. On juge à
 * la FORME, que l'écran garde telle quelle (retours à la ligne compris) :
 *   - le POÈME va à la ligne à chaque vers, et rime souvent ;
 *   - le THÉÂTRE met le nom du personnage avant chaque réplique, et des
 *     indications entre parenthèses ;
 *   - le RÉCIT enchaîne les phrases, et un narrateur raconte.
 * L'erreur donne les indices du bon genre.
 */

import { bilan as bilanCommun, outils } from './outils.js';

export const MANCHES = 8;

export const GENRES = { poeme: 'Un poème', theatre: 'Du théâtre', recit: 'Un récit' };

/** [extrait, genre]. Les retours à la ligne comptent. */
export const EXTRAITS = [
  ['Dans le jardin, la pluie\nFait chanter les feuilles ;\nEt la terre qui s’ennuie\nBoit tout ce qu’elle cueille.', 'poeme'],
  ['Petit escargot du soir,\nTu portes ta maison ;\nTu ne vas pas bien loin, mais voir\nLe monde est ta leçon.', 'poeme'],
  ['La mer a mis sa robe grise,\nLe ciel a fermé ses volets ;\nSur la plage, un vent qui frise\nEmporte les derniers galets.', 'poeme'],
  ['Mon crayon court sur la page,\nIl trace un chemin, un nuage,\nUne maison, un bateau,\nEt le soleil tout là-haut.', 'poeme'],
  ['LUCIE (en chuchotant). — Tu as entendu ce bruit ?\nMARC. — Quel bruit ? Je n’entends rien.\nLUCIE. — Là, derrière la porte !', 'theatre'],
  ['LE ROI (furieux). — Qui a mangé mes confitures ?\nLE VALET (tremblant). — Ce n’est pas moi, Majesté !\nLE ROI. — Alors qui ?', 'theatre'],
  ['LA MÈRE. — Range ta chambre, s’il te plaît.\nTHÉO (soupirant). — Encore ? Je l’ai rangée hier !\nLA MÈRE. — Hier, c’était hier.', 'theatre'],
  ['LE LOUP (à part). — Quel joli petit agneau…\nL’AGNEAU. — Bonjour, monsieur le loup !\nLE LOUP (souriant). — Bonjour, mon ami.', 'theatre'],
  ['Ce matin-là, Nina se leva avant tout le monde. Elle enfila ses bottes, prit son panier et partit vers la forêt. Le brouillard couvrait encore les champs.', 'recit'],
  ['Il était une fois un meunier qui n’avait qu’un âne et un chat. Quand il mourut, ses fils se partagèrent ce maigre héritage.', 'recit'],
  ['Le bateau quitta le port à l’aube. Pendant trois jours, les marins ne virent que la mer. Le quatrième jour, enfin, une île apparut.', 'recit'],
  ['Quand Samir ouvrit la boîte, il n’en crut pas ses yeux. À l’intérieur, un petit dragon dormait, roulé en boule.', 'recit'],
];

export function serie(graine = Date.now()) {
  const { melanger } = outils(graine);
  const parGenre = (g) => melanger(EXTRAITS.filter(([, x]) => x === g));
  const tires = [...parGenre('poeme').slice(0, 3), ...parGenre('theatre').slice(0, 3), ...parGenre('recit').slice(0, 2)];
  return melanger(tires).map(([question, genre]) => ({
    consigne: 'genre',
    question,
    bonne: genre,
    choix: Object.entries(GENRES).map(([cle, libelle]) => ({ cle, libelle })),
  }));
}

export function verdict(m, cle) {
  return cle === m.bonne ? 'juste' : `indices-${m.bonne}`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  genre: 'Poème, théâtre, ou récit ? Regarde bien comment le texte est écrit.',
  'indices-poeme': 'Des lignes courtes qui vont à la ligne, des vers, et souvent des rimes : c’est un poème.',
  'indices-theatre': 'Le nom du personnage avant chaque réplique, et des indications entre parenthèses : c’est du théâtre.',
  'indices-recit': 'Des phrases qui s’enchaînent, et quelqu’un qui raconte une histoire : c’est un récit.',
};
