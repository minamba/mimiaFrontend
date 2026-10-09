/**
 * POURQUOI ON RIT ? — les formes du comique en 5e.
 *
 * COMPÉTENCE DU RÉFÉRENTIEL :
 *   FR_5E_LECT_COMIQUE — « Identifier les procédés du comique dans une scène »
 *
 * CINQ COMIQUES : de geste, de mots, de situation, de caractère, de
 * répétition. TROIS SORTES DE MANCHES (4 + 2 + 2) :
 *   - LA SAYNÈTE (4) : une petite scène écrite pour le jeu, un seul comique
 *     évident ;
 *   - CHEZ MOLIÈRE (2) : des scènes célèbres, vérifiées une à une —
 *     « Sans dot ! » (L'Avare, I, 5), « Que diable allait-il faire dans cette
 *     galère ? » (Les Fourberies de Scapin, II, 7), Géronte dans le sac
 *     (Les Fourberies, III, 2), « Le pauvre homme ! » (Tartuffe, I, 4),
 *     « Le poumon ! » (Le Malade imaginaire, III, 10), Sganarelle pris pour
 *     un médecin et son faux latin (Le Médecin malgré lui) ;
 *   - LA DÉFINITION (2) : ce qui fait rire, et le nom du comique.
 * LES PIÈGES : chaque comique a deux voisins qu'on lui prend souvent
 * (geste et situation, mots et répétition, caractère et situation…) ; chaque
 * paire a sa phrase, qui dit comment les distinguer.
 */

import { bilan as bilanCommun, outils } from '../outils.js';

export const FAMILLE = { cle: 'pourquoi-on-rit', titre: 'Pourquoi on rit ?', matiereCode: 'FRANCAIS' };

export const PAR_CLASSE = {
  CINQUIEME: {
    titre: 'Pourquoi on rit ?',
    accroche: 'Geste, mots, situation, caractère…',
    competences: ['FR_5E_LECT_COMIQUE'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

export const COMIQUES = {
  geste: 'Comique de geste',
  mots: 'Comique de mots',
  situation: 'Comique de situation',
  caractere: 'Comique de caractère',
  repetition: 'Comique de répétition',
};

/** Les deux comiques qu'on prend le plus souvent pour celui-ci. */
const CONFUSIONS = {
  geste: ['situation', 'mots'],
  mots: ['geste', 'repetition'],
  situation: ['caractere', 'repetition'],
  caractere: ['situation', 'mots'],
  repetition: ['mots', 'situation'],
};

export const paire = (a, b) => [a, b].sort().join('-ou-');

/** [saynète, comique]. */
export const SAYNETES = [
  ['Le serveur glisse sur une peau de banane, et la tarte à la crème atterrit sur la tête du client.', 'geste'],
  ['Pierrot veut s’asseoir ; Arlequin retire la chaise au dernier moment, et Pierrot tombe les quatre fers en l’air.', 'geste'],
  ['Le valet poursuit le chat autour de la table, se cogne contre le buffet et fait tomber toutes les assiettes.', 'geste'],
  ['Le clown se penche pour ramasser son chapeau, le pousse du pied sans le vouloir, trébuche et tombe le nez dans la sciure.', 'geste'],
  ['LUC. — Mon chien n’a pas de nez.\nZOÉ. — Et comment sent-il ?\nLUC. — Très mauvais !', 'mots'],
  ['JULIE. — Tu as l’heure ?\nPAUL. — Oui.\n(Il s’en va sans rien ajouter.)', 'mots'],
  ['MAX. — J’ai acheté un mètre de tissu.\nLÉO. — Un maître ? Et qu’est-ce qu’il t’apprend ?', 'mots'],
  ['LE NOTAIRE (qui veut parler savamment). — Votre oncle a laissé un testament parfaitement… testamentaire, et absolument… héritable !', 'mots'],
  ['Le baron attend un prince ; un jardinier se présente au château, et le baron, le prenant pour le prince, lui offre le plus beau fauteuil et un festin.', 'situation'],
  ['Lucas cache un seau d’eau au-dessus de la porte pour piéger son frère. Il l’oublie, ouvre la porte le premier… et c’est lui qui est trempé.', 'situation'],
  ['Marie croit parler à sa sœur dans le noir et lui confie tous ses secrets. La lumière s’allume : c’était la voisine.', 'situation'],
  ['Deux élèves se cachent sous une table pour échapper au surveillant… qui vient justement s’asseoir à cette table pour lire son journal.', 'situation'],
  ['Le vieux Grippesou refuse d’allumer une bougie : « Pour lire, la lune suffit, et elle est gratuite ! »', 'caractere'],
  ['Le marquis se regarde dans chaque miroir du salon et demande à chacun s’il n’est pas le plus bel homme de Paris.', 'caractere'],
  ['Le capitaine raconte qu’il a vaincu cent ennemis à lui seul ; un chat miaule derrière lui, et il saute sur la table en hurlant.', 'caractere'],
  ['Monsieur Pichon se croit toujours malade : il prend sa température du matin au soir et appelle le médecin pour un simple éternuement.', 'caractere'],
  ['À chaque catastrophe que lui annonce son valet, l’incendie, l’inondation, la ruine, le baron ne répond qu’une chose : « Et mon chapeau ? »', 'repetition'],
  ['Chaque fois que l’on frappe à la porte, le majordome annonce d’une voix lugubre : « Encore un cousin de province ! »', 'repetition'],
  ['Le professeur répète « Je suis très calme ! » de plus en plus fort, à chaque nouvelle question des élèves.', 'repetition'],
  ['La grand-mère pose la même question à chaque invité qui entre : « Vous avez bien pensé à fermer le portail ? »', 'repetition'],
];

/** [scène de Molière, comique]. */
export const MOLIERE = [
  ['L’Avare : à chaque objection qu’on lui fait sur le mariage de sa fille, Harpagon répond « Sans dot ! ».', 'repetition'],
  ['Les Fourberies de Scapin : Géronte redit sans cesse « Que diable allait-il faire dans cette galère ? ».', 'repetition'],
  ['Tartuffe : Orgon ne répond que « Le pauvre homme ! » chaque fois qu’on lui donne des nouvelles de Tartuffe.', 'repetition'],
  ['Le Malade imaginaire : Toinette, déguisée en médecin, répond « Le poumon ! » à chaque plainte d’Argan.', 'repetition'],
  ['Les Fourberies de Scapin : Scapin fait cacher Géronte dans un sac, puis le roue de coups de bâton.', 'geste'],
  ['Le Médecin malgré lui : Sganarelle, un simple fagotier, est pris pour un grand médecin.', 'situation'],
  ['Le Médecin malgré lui : pour paraître savant, Sganarelle débite un latin de fantaisie qui ne veut rien dire.', 'mots'],
  ['L’Avare : Harpagon aime tant son argent qu’il soupçonne tout le monde de vouloir voler sa cassette.', 'caractere'],
  ['Le Malade imaginaire : Argan se croit gravement malade et avale remède sur remède, alors qu’il se porte bien.', 'caractere'],
];

/** [ce qui fait rire, comique]. */
export const DEFINITIONS = [
  ['On rit des chutes, des coups de bâton, des grimaces et des poursuites.', 'geste'],
  ['Le rire vient des mouvements du corps des personnages.', 'geste'],
  ['On rit des jeux de mots, des mots déformés ou d’un faux langage savant.', 'mots'],
  ['Le rire vient d’un mot pris dans un double sens.', 'mots'],
  ['On rit d’un quiproquo : un personnage est pris pour un autre.', 'situation'],
  ['On rit d’un piège qui se retourne contre celui qui l’a tendu.', 'situation'],
  ['On rit d’un défaut exagéré : l’avarice, la vanité, la peur.', 'caractere'],
  ['Le rire vise la façon d’être d’un personnage, toujours la même, poussée jusqu’au ridicule.', 'caractere'],
  ['On rit d’une même réplique qui revient plusieurs fois.', 'repetition'],
  ['Un personnage redit sans cesse la même phrase, quoi qu’on lui réponde.', 'repetition'],
];

export function serie(graine = Date.now()) {
  const { melanger } = outils(graine);

  const manche = (consigne, question, comique) => {
    const autres = CONFUSIONS[comique];
    return {
      consigne,
      question,
      bonne: comique,
      choix: melanger([comique, ...autres]).map((cle) => ({ cle, libelle: COMIQUES[cle] })),
      pieges: Object.fromEntries(autres.map((a) => [a, paire(a, comique)])),
      aide: 'comique-regle',
    };
  };

  return melanger([
    ...melanger(SAYNETES).slice(0, 4).map(([q, c]) => manche('saynete', q, c)),
    ...melanger(MOLIERE).slice(0, 2).map(([q, c]) => manche('moliere', q, c)),
    ...melanger(DEFINITIONS).slice(0, 2).map(([q, c]) => manche('definition', q, c)),
  ]);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  saynete: 'Dans cette petite scène, qu’est-ce qui fait rire ?',
  moliere: 'Chez Molière : quel comique reconnais-tu dans cette scène ?',
  definition: 'Quel comique correspond à cette définition ?',
  'geste-ou-situation': 'Le comique de geste naît du corps : une chute, un coup, une grimace. Le comique de situation naît d’un malentendu ou d’un concours de circonstances.',
  'geste-ou-mots': 'Si l’on rit de ce qui est dit, c’est le comique de mots ; si l’on rit de ce que fait le corps, c’est le comique de geste.',
  'mots-ou-repetition': 'Un jeu sur le sens ou le son d’un mot, c’est le comique de mots. Une même réplique qui revient plusieurs fois, c’est le comique de répétition.',
  'caractere-ou-situation': 'On rit d’un défaut du personnage, l’avarice, la vanité, la peur : c’est le comique de caractère. On rit d’un quiproquo ou d’un hasard : c’est le comique de situation.',
  'caractere-ou-mots': 'Le comique de caractère vise un défaut du personnage ; le comique de mots joue avec le langage, ses sens ou ses sons.',
  'repetition-ou-situation': 'Quand la même phrase revient encore et encore, c’est le comique de répétition. Le comique de situation, lui, naît d’un malentendu ou d’un retournement.',
  'comique-regle': 'Demande-toi de quoi l’on rit : du corps, c’est le geste ; d’un mot, ce sont les mots ; d’un malentendu, la situation ; d’un défaut, le caractère ; d’une phrase qui revient, la répétition.',
};
