/**
 * POÈME, THÉÂTRE OU RÉCIT ? — le vocabulaire du théâtre en 5e.
 *
 * COMPÉTENCE DU RÉFÉRENTIEL :
 *   FR_5E_LECT_THEATRE — « Lire une pièce de théâtre : réplique, didascalie,
 *                         acte, scène »
 *
 * TROIS SORTES DE MANCHES (3 + 3 + 2) :
 *   - DANS L'EXTRAIT (3) : un passage d'une scène écrite pour le jeu ; est-ce
 *     une réplique, une didascalie, une tirade, un monologue, un aparté ?
 *   - LE BON MOT (3) : une définition, le mot qui lui répond ;
 *   - LA PIÈCE (2) : acte, scène, exposition, dénouement, et qui entend quoi.
 * LES PIÈGES sont les confusions de la classe : la tirade et le monologue,
 * l'aparté et la réplique, la didascalie et la réplique. Chaque paire a sa
 * phrase, qui distingue les deux mots.
 */

import { bilan as bilanCommun, outils } from '../outils.js';

export const FAMILLE = { cle: 'poeme-theatre-college', titre: 'Poème, théâtre ou récit ?', matiereCode: 'FRANCAIS' };

export const PAR_CLASSE = {
  CINQUIEME: {
    titre: 'Poème, théâtre ou récit ?',
    accroche: 'Réplique, didascalie, aparté…',
    competences: ['FR_5E_LECT_THEATRE'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

export const TERMES = {
  replique: 'Une réplique',
  didascalie: 'Une didascalie',
  tirade: 'Une tirade',
  monologue: 'Un monologue',
  aparte: 'Un aparté',
};

/** Les deux mots avec lesquels chacun se confond le plus. */
const CONFUSIONS = {
  replique: ['didascalie', 'tirade'],
  didascalie: ['replique', 'aparte'],
  tirade: ['monologue', 'replique'],
  monologue: ['tirade', 'aparte'],
  aparte: ['monologue', 'replique'],
};

/** La phrase qui distingue deux mots, quel que soit le sens de l'erreur. */
export const paire = (a, b) => [a, b].sort().join('-ou-');

/** [extrait, passage visé, terme]. Les retours à la ligne comptent. */
export const EXTRAITS = [
  ['LÉA. — Tu viens ce soir ?\nTOM (gêné). — Je ne sais pas encore.', '(gêné)', 'didascalie'],
  ['LE ROI (se levant brusquement). — Qu’on fasse entrer le messager !\nLE GARDE. — Tout de suite, Majesté.', '(se levant brusquement)', 'didascalie'],
  ['(La scène se passe dans une cuisine, la nuit.)\nMARTHE. — Qui est là ?', '(La scène se passe dans une cuisine, la nuit.)', 'didascalie'],
  ['ANNE. — Il pleut encore.\nJULES. — Alors prends ton parapluie.', 'Alors prends ton parapluie.', 'replique'],
  ['LE PÈRE. — Où étais-tu passé ?\nLE FILS. — Chez Paul, je te l’avais dit.\nLE PÈRE. — Tu ne m’as rien dit du tout.', 'Chez Paul, je te l’avais dit.', 'replique'],
  ['LA REINE. — Votre épée, chevalier.\nLE CHEVALIER. — La voici, Madame.', 'La voici, Madame.', 'replique'],
  ['LE VALET (à part). — Si mon maître savait ce que j’ai fait de sa montre…\nLE MAÎTRE. — Tu disais ?', 'Si mon maître savait ce que j’ai fait de sa montre…', 'aparte'],
  ['LISETTE. — Madame est très contente de vous.\nDORANTE (à part). — Contente ? Elle ne m’a pas regardé une seule fois !\nLISETTE. — Elle vous attend au salon.', 'Contente ? Elle ne m’a pas regardé une seule fois !', 'aparte'],
  ['LE MARCHAND. — Ce vase est une pièce rare, monsieur.\nLE CLIENT (à part). — Rare ? J’ai vu le même au marché pour trois sous.', 'Rare ? J’ai vu le même au marché pour trois sous.', 'aparte'],
  ['MARC (seul sur scène). — Personne ne m’a vu entrer. Où peut bien être cette lettre ? Si je ne la trouve pas avant ce soir, tout est perdu.', 'Personne ne m’a vu entrer. Où peut bien être cette lettre ? Si je ne la trouve pas avant ce soir, tout est perdu.', 'monologue'],
  ['(La servante est sortie. Julie reste seule.)\nJULIE. — Partir ou rester ? Si je pars, je le perds ; si je reste, je me perds moi-même. Que faire ?', 'Partir ou rester ? Si je pars, je le perds ; si je reste, je me perds moi-même. Que faire ?', 'monologue'],
  ['LE VOLEUR (seul, la nuit, devant le coffre). — Encore trois chiffres… Calme-toi, mon vieux. Le gardien dort, la rue est vide, personne ne viendra.', 'Encore trois chiffres… Calme-toi, mon vieux. Le gardien dort, la rue est vide, personne ne viendra.', 'monologue'],
  ['PAUL. — Pourquoi pars-tu ?\nROSE. — Pourquoi ? Parce que depuis dix ans, j’attends que tu me regardes vraiment. Parce que tu promets toujours et ne tiens jamais. Parce que cette maison est devenue une prison. Voilà pourquoi je pars, Paul.\nPAUL. — Rose…', 'Pourquoi ? Parce que depuis dix ans, j’attends que tu me regardes vraiment. Parce que tu promets toujours et ne tiens jamais. Parce que cette maison est devenue une prison. Voilà pourquoi je pars, Paul.', 'tirade'],
  ['LE GÉNÉRAL. — Soldats ! Vous avez marché trois jours sans dormir. Vous avez eu faim, vous avez eu froid, et pas un de vous ne s’est plaint. Demain, nous livrerons la dernière bataille ; demain, vous rentrerez chez vous en héros !\nUN SOLDAT. — Vive le général !', 'Soldats ! Vous avez marché trois jours sans dormir. Vous avez eu faim, vous avez eu froid, et pas un de vous ne s’est plaint. Demain, nous livrerons la dernière bataille ; demain, vous rentrerez chez vous en héros !', 'tirade'],
  ['LE NOTAIRE. — Avez-vous des questions ?\nL’HÉRITIER. — Une seule, mais elle est longue. Pourquoi mon oncle, qui ne m’a jamais écrit, jamais rendu visite, jamais souhaité un anniversaire, me laisse-t-il sa maison ? Et pourquoi à moi plutôt qu’à ma sœur, qui l’a soigné jusqu’au bout ?\nLE NOTAIRE. — Je l’ignore, monsieur.', 'Une seule, mais elle est longue. Pourquoi mon oncle, qui ne m’a jamais écrit, jamais rendu visite, jamais souhaité un anniversaire, me laisse-t-il sa maison ? Et pourquoi à moi plutôt qu’à ma sœur, qui l’a soigné jusqu’au bout ?', 'tirade'],
];

/** [définition, terme]. */
export const DEFINITIONS = [
  ['Ce que dit un personnage quand il prend la parole dans un dialogue.', 'replique'],
  ['Les paroles qu’un personnage adresse à un autre, juste après lui.', 'replique'],
  ['Une indication de l’auteur, souvent en italique, qui n’est pas prononcée sur scène.', 'didascalie'],
  ['Ce qui précise le ton, le geste ou le décor, sans être dit par les comédiens.', 'didascalie'],
  ['Une longue réplique, d’un seul tenant, adressée à un autre personnage.', 'tirade'],
  ['Un personnage parle longtemps, sans être interrompu, devant un autre personnage qui l’écoute.', 'tirade'],
  ['Un personnage seul en scène parle à voix haute.', 'monologue'],
  ['Seul sur le plateau, un personnage réfléchit tout haut à ce qu’il va faire.', 'monologue'],
  ['Un personnage parle pour lui-même : les autres, pourtant présents, ne sont pas censés l’entendre.', 'aparte'],
  ['Une parole que seul le public entend, alors que d’autres personnages sont sur scène.', 'aparte'],
];

/** [question, bonne réponse, [[choix faux, phrase de l'erreur], …]]. */
export const PIECE = [
  ['Dans une pièce, on change de scène quand…', 'un personnage entre ou sort', [['le décor change de couleur', 'scene-entree'], ['un personnage dit une tirade', 'scene-entree']]],
  ['Une grande partie de la pièce, découpée en plusieurs scènes, s’appelle…', 'un acte', [['une réplique', 'acte-ou-scene'], ['une didascalie', 'acte-ou-scene']]],
  ['Dans « Acte III, scène 2 », le chiffre romain III indique…', 'le numéro de l’acte', [['le numéro de la scène', 'acte-ou-scene'], ['le nombre de personnages', 'acte-ou-scene']]],
  ['La première scène, qui présente les personnages et la situation, s’appelle…', 'l’exposition', [['le dénouement', 'exposition-denouement'], ['l’aparté', 'exposition-denouement']]],
  ['La fin de la pièce, où l’intrigue se résout, s’appelle…', 'le dénouement', [['l’exposition', 'exposition-denouement'], ['la didascalie', 'exposition-denouement']]],
  ['Pendant la représentation, le spectateur entend-il les didascalies ?', 'Non : elles guident les comédiens', [['Oui : un comédien les lit', 'didascalie-muette'], ['Oui : à la fin de chaque acte', 'didascalie-muette']]],
  ['Un personnage fait un aparté. Qui est censé l’entendre ?', 'Le public seulement', [['Tous les personnages présents', 'aparte-public'], ['Personne, pas même le public', 'aparte-public']]],
  ['Pendant un monologue, combien de personnages sont en scène ?', 'Un seul', [['Deux', 'monologue-seul'], ['Toute la troupe', 'monologue-seul']]],
];

export function serie(graine = Date.now()) {
  const { melanger } = outils(graine);

  const categorie = (consigne, question, terme) => {
    const autres = CONFUSIONS[terme];
    return {
      consigne,
      question,
      bonne: terme,
      choix: melanger([terme, ...autres]).map((cle) => ({ cle, libelle: TERMES[cle] })),
      pieges: Object.fromEntries(autres.map((a) => [a, paire(a, terme)])),
      aide: `${consigne}-regle`,
    };
  };

  const extraits = melanger(EXTRAITS).slice(0, 3)
    .map(([extrait, passage, terme]) => categorie('extrait', `${extrait}\n\n→ « ${passage} »`, terme));
  const definitions = melanger(DEFINITIONS).slice(0, 3)
    .map(([definition, terme]) => categorie('definition', definition, terme));
  const piece = melanger(PIECE).slice(0, 2).map(([question, bonne, faux]) => ({
    consigne: 'piece',
    question,
    bonne,
    choix: melanger([bonne, ...faux.map(([f]) => f)]).map((c) => ({ cle: c, libelle: c })),
    pieges: Object.fromEntries(faux),
    aide: 'piece-regle',
  }));

  return melanger([...extraits, ...definitions, ...piece]);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  extrait: 'Dans cet extrait de théâtre, comment appelle-t-on le passage indiqué ?',
  definition: 'Quel mot du théâtre correspond à cette définition ?',
  piece: 'Une question sur la façon dont une pièce est construite.',
  'didascalie-ou-replique': 'Une didascalie n’est pas prononcée : elle indique le ton, le geste ou le décor. Une réplique, c’est ce que le personnage dit.',
  'replique-ou-tirade': 'Une tirade est une réplique très longue, d’un seul tenant. Une réplique courte reste une simple réplique.',
  'aparte-ou-didascalie': 'Une didascalie n’est jamais prononcée. Un aparté est prononcé, mais les autres personnages ne sont pas censés l’entendre.',
  'monologue-ou-tirade': 'Le monologue se dit seul en scène. La tirade est une longue réplique adressée à un autre personnage, qui écoute.',
  'aparte-ou-monologue': 'Dans un monologue, le personnage est seul en scène. Dans un aparté, d’autres personnages sont là, mais ne sont pas censés l’entendre.',
  'aparte-ou-replique': 'Une réplique s’adresse aux autres personnages. Un aparté, le personnage le dit pour lui seul, et les autres ne l’entendent pas.',
  'extrait-regle': 'Regarde qui parle, à qui, et combien de temps : seul en scène, c’est un monologue ; pour soi devant les autres, un aparté ; longtemps à quelqu’un, une tirade ; entre parenthèses, une didascalie.',
  'definition-regle': 'Réplique, tirade, monologue, aparté : ce sont des paroles. La didascalie, elle, ne se prononce pas.',
  'scene-entree': 'Une scène change à chaque entrée ou sortie d’un personnage : c’est ce qui la délimite.',
  'acte-ou-scene': 'L’acte est la grande partie de la pièce ; il se découpe en scènes. Dans « acte, scène », l’acte vient toujours en premier.',
  'exposition-denouement': 'L’exposition ouvre la pièce et présente la situation ; le dénouement la ferme, quand l’intrigue se résout.',
  'didascalie-muette': 'Les didascalies ne sont pas dites : le metteur en scène et les comédiens les lisent, le public voit seulement ce qu’elles décrivent.',
  'aparte-public': 'L’aparté est une convention : le public l’entend, mais les autres personnages, sur scène, font comme s’ils n’entendaient rien.',
  'monologue-seul': 'Le monologue, c’est un personnage seul en scène qui parle à voix haute.',
  'piece-regle': 'Une pièce se découpe en actes, et chaque acte en scènes. Elle s’ouvre sur l’exposition et se ferme sur le dénouement.',
};
