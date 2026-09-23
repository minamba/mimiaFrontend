/**
 * QUI RACONTE ? — poème, théâtre ou récit au CM2.
 *
 * Voulu par Camara le 21/09/2026 : « attaque le CM2 ».
 *
 * COMPÉTENCE DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   FR_CM2_LECT_NARRATEUR — « Distinguer l'auteur du narrateur et repérer
 *                              qui raconte »
 *
 * UN EXTRAIT DE RÉCIT, écrit pour le jeu : qui le raconte ? Un PERSONNAGE qui
 * dit « je » et vit l'histoire, ou un NARRATEUR qui n'est pas dans l'histoire
 * et dit « il », « elle ». LE PIÈGE : le « je » d'un dialogue, entre
 * guillemets — c'est un personnage qui parle, pas celui qui raconte.
 * Une manche sur huit demande si l'auteur et le narrateur sont la même
 * personne.
 */

import { bilan as bilanCommun, outils } from './outils.js';

export const MANCHES = 8;

/** [extrait, personnage ou exterieur, un dialogue qui trompe]. */
export const EXTRAITS = [
  ['Ce matin-là, je me suis levé avant tout le monde. J’ai enfilé mes bottes et je suis sorti dans le jardin encore gris.', 'personnage', false],
  ['Quand j’ai ouvert la boîte, mon cœur s’est mis à battre : un petit dragon dormait à l’intérieur.', 'personnage', false],
  ['Nous avions marché toute la journée. Mes jambes me faisaient mal, mais je ne voulais pas me plaindre.', 'personnage', false],
  ['Je n’oublierai jamais le jour où mon grand-père m’a appris à pêcher.', 'personnage', false],
  ['Nina se leva avant tout le monde. Elle enfila ses bottes et sortit dans le jardin encore gris.', 'exterieur', false],
  ['Le vieux marin regardait la mer. Il savait qu’une tempête approchait.', 'exterieur', false],
  ['Léa cria : « Je suis là, derrière l’arbre ! » Mais personne ne l’entendit.', 'exterieur', true],
  ['« J’ai trouvé la clé ! » s’écria Samir. Ses amis coururent le rejoindre.', 'exterieur', true],
];

export function serie(graine = Date.now()) {
  const { melanger } = outils(graine);
  const perso = melanger(EXTRAITS.filter(([, q]) => q === 'personnage')).slice(0, 3);
  const exterieur = melanger(EXTRAITS.filter(([, q]) => q === 'exterieur')).slice(0, 4);
  const manches = [...perso, ...exterieur].map(([question, bonne, dialogue]) => ({
    consigne: 'qui',
    question,
    bonne,
    dialogue,
    choix: [
      { cle: 'personnage', libelle: 'Un personnage de l’histoire' },
      { cle: 'exterieur', libelle: 'Un narrateur hors de l’histoire' },
    ],
  }));
  manches.push({
    consigne: 'auteur',
    question: 'Un romancier écrit : « Je suis un chat, et je m’appelle Moustache. »',
    bonne: 'non',
    choix: [
      { cle: 'oui', libelle: 'Le narrateur, c’est l’auteur' },
      { cle: 'non', libelle: 'Le narrateur, c’est le chat' },
    ],
  });
  return melanger(manches);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  if (m.consigne === 'auteur') return 'auteur-regle';
  if (m.dialogue) return 'qui-dialogue';
  return `qui-${m.bonne}`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  qui: 'Qui raconte cette histoire ? Un personnage, ou un narrateur hors de l’histoire ?',
  auteur: 'Qui raconte, ici ? L’auteur, ou un personnage ?',
  'qui-personnage': 'Celui qui raconte dit je et vit ce qu’il raconte : c’est un personnage de l’histoire.',
  'qui-exterieur': 'Celui qui raconte dit il ou elle : il n’est pas dans l’histoire.',
  'qui-dialogue': 'Le je est entre guillemets : c’est un personnage qui parle. Mais celui qui raconte dit il ou elle.',
  'auteur-regle': 'L’auteur écrit le livre, mais il peut faire raconter l’histoire par un autre : ici, c’est le chat qui dit je.',
};
