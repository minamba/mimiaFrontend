/**
 * L'EXPLICATION LINÉAIRE — l'oral du bac de français, en 1re générale et
 * technologique. Professeur : Adrien (français).
 *
 * Des extraits courts, écrits pour le jeu, phrases numérotées ; chacun a UN
 * tournant net (un connecteur, un changement de temps, de ton ou de
 * personnage). Les extraits d'une partie qui servent à trouver le tournant
 * ne reviennent pas dans la même partie : leur découpage y serait donné.
 *
 * QUATRE SORTES DE MANCHES (1re : 2 + 3 + 2 + 1 ; 1re techno : 2 + 2 + 2 + 2) :
 *   - LE TOURNANT (2) : à quelle phrase le passage bascule-t-il ? LES
 *     PIÈGES : s'arrêter trop tôt, passer la rupture ;
 *   - CE QUE FAIT LE MOUVEMENT : il installe, oppose, fait basculer,
 *     réfute. LES PIÈGES : la paraphrase (redire ce que dit le texte), le
 *     contresens, prendre la concession ou l'opinion adverse pour la thèse ;
 *   - LE PROJET DE LECTURE (2) : une question sur la manière dont le texte
 *     agit. LES PIÈGES : la question de fait, la question hors du texte ;
 *   - LINÉAIRE OU COMMENTAIRE ? : suivre le texte dans l'ordre, à l'oral,
 *     ou regrouper l'analyse en axes, à l'écrit.
 */

import { bilan as bilanCommun, outils } from '../outils.js';

export const FAMILLE = { cle: 'explication-lineaire', titre: 'L’explication linéaire', matiereCode: 'FRANCAIS' };

export const PAR_CLASSE = {
  PREMIERE: {
    titre: 'L’explication linéaire',
    accroche: 'Les mouvements du texte, et ce qu’ils font.',
    competences: ['FR_1RE_METH_LINEAIRE'],
  },
  PREMIERE_TECHNO: {
    titre: 'L’explication linéaire',
    accroche: 'Les mouvements du texte, et ce qu’ils font.',
    competences: ['FR_1TEC_METH_LINEAIRE'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

/**
 * Les extraits : { phrases, tournant (numéro de la phrase où il bascule),
 * leurres (deux numéros sans rupture) }.
 */
export const TEXTES = [
  {
    phrases: ['Le jardin dormait sous le soleil de juillet.', 'Les abeilles bourdonnaient autour des roses.', 'Assise sur le banc, Claire lisait sans hâte.', 'Soudain, un cri déchira le silence.', 'Claire laissa tomber son livre.', 'Elle courut vers la maison.'],
    tournant: 4,
    leurres: [2, 6],
  },
  {
    phrases: ['Pendant des années, Paul avait cru que son père l’avait abandonné.', 'Il en avait nourri une colère sourde.', 'Mais un matin, une lettre arriva.', 'Elle portait l’écriture de son père.', 'Paul la lut sans respirer.'],
    tournant: 3,
    leurres: [2, 5],
  },
  {
    phrases: ['On dit souvent que les jeunes ne lisent plus.', 'On les accuse de préférer les écrans aux livres.', 'Pourtant, jamais on n’a autant lu de messages et d’articles.', 'La lecture n’a pas disparu : elle a changé de forme.', 'C’est cette lecture-là qu’il faut apprendre à enrichir.'],
    tournant: 3,
    leurres: [2, 5],
  },
  {
    phrases: ['La ville s’éveillait lentement.', 'Les marchands ouvraient leurs volets.', 'Les cloches sonnaient.', 'Tout semblait paisible.', 'Alors, au coin de la rue, parurent les soldats.', 'En un instant, la place se vida.'],
    tournant: 5,
    leurres: [2, 6],
  },
  {
    phrases: ['La mer roulait ses vagues grises.', 'Le vent couchait les herbes de la dune.', 'Et moi, devant ce rivage, je pensais à toi.', 'Je me demandais si tu voyais la même mer.', 'Je me demandais si tu pensais encore à moi.'],
    tournant: 3,
    leurres: [2, 5],
  },
  {
    phrases: ['Je me souviens de la maison de mon enfance.', 'Elle sentait la cire et le pain chaud.', 'Ma grand-mère y chantait en cousant.', 'Le soir, on y entendait le vent dans les tilleuls.', 'Aujourd’hui, la maison est vendue.', 'Des inconnus ont repeint les volets.'],
    tournant: 5,
    leurres: [2, 6],
  },
  {
    phrases: ['Certes, la ville offre bien des avantages.', 'On y trouve des écoles, des théâtres, des hôpitaux.', 'On y croise sans cesse de nouveaux visages.', 'Mais la ville épuise ceux qui l’habitent.', 'Le bruit et la vitesse ne leur laissent aucun repos.', 'Ils finissent par oublier le silence.'],
    tournant: 4,
    leurres: [2, 6],
  },
  {
    phrases: ['Le voyageur marchait depuis l’aube.', 'Ses pieds saignaient.', 'La faim le tenaillait.', 'Il croyait ne jamais revoir les siens.', 'Enfin, au sommet de la colline, il aperçut le village.', 'Des larmes de joie lui montèrent aux yeux.'],
    tournant: 5,
    leurres: [2, 3],
  },
  {
    phrases: ['Le salon brillait de mille bougies.', 'Pourtant, Julie ne voyait rien de cette fête.', 'Elle guettait la porte.', 'Elle attendait un seul visage.'],
    tournant: 2,
    leurres: [3, 4],
  },
  {
    phrases: ['Les invités riaient, les verres tintaient.', 'L’orchestre jouait une valse légère.', 'Les couples tournaient sous les lustres.', 'Tout à coup, la musique s’arrêta.', 'Un homme en noir venait d’entrer.', 'Personne ne le connaissait.'],
    tournant: 4,
    leurres: [2, 6],
  },
  {
    phrases: ['Le progrès technique a transformé nos vies.', 'Il a allongé l’espérance de vie.', 'Il a rapproché les continents.', 'Il a soulagé l’homme de bien des tâches pénibles.', 'Cependant, il a aussi ses victimes.', 'La nature en paie le prix.'],
    tournant: 5,
    leurres: [2, 3],
  },
  {
    phrases: ['Il faisait nuit noire.', 'Le vent hurlait dans la cheminée.', 'Seul dans sa chambre, l’enfant tremblait.', 'Alors la porte s’ouvrit doucement.', 'Sa mère entra, une bougie à la main.', 'L’enfant se blottit contre elle.'],
    tournant: 4,
    leurres: [2, 6],
  },
];

/** Le texte tel qu'il s'affiche, phrases numérotées. */
export const texte = (i) => TEXTES[i].phrases.map((p, k) => `${k + 1}. ${p}`).join('\n');

/**
 * [extrait, première et dernière phrase du mouvement, ce qu'il fait, la
 * paraphrase, le contresens et son piège].
 */
export const ROLES = [
  [0, 1, 3, 'Il installe un calme que la suite va briser.', 'Il raconte que Claire lit au soleil.', ['Il installe d’emblée une menace.', 'contresens-mouvement']],
  [0, 4, 6, 'Il fait basculer la scène dans l’inquiétude et l’action.', 'Il raconte que Claire entend un cri et court.', ['Il prolonge la paix du jardin.', 'contresens-mouvement']],
  [1, 1, 2, 'Il montre une rancune ancienne que la suite va ébranler.', 'Il dit que Paul en veut à son père.', ['Il montre un fils apaisé.', 'contresens-mouvement']],
  [1, 3, 5, 'Il introduit l’événement qui remet tout en question.', 'Il raconte que Paul reçoit une lettre.', ['Il confirme l’abandon du père.', 'contresens-mouvement']],
  [2, 1, 2, 'Il expose une idée reçue que l’auteur va réfuter.', 'Il dit qu’on accuse les jeunes de ne plus lire.', ['Il présente la thèse de l’auteur.', 'these-adverse']],
  [2, 3, 5, 'Il réfute l’idée reçue et avance la thèse de l’auteur.', 'Il dit qu’on lit beaucoup de messages.', ['Il concède que les jeunes ne lisent plus.', 'contresens-mouvement']],
  [4, 1, 2, 'Il peint un décor dépouillé, avant l’entrée du « je ».', 'Il décrit la mer et la dune.', ['Il exprime déjà les sentiments du poète.', 'contresens-mouvement']],
  [4, 3, 5, 'Il fait entendre le lyrisme : le paysage ramène à l’absent.', 'Il dit que le poète pense à quelqu’un.', ['Il poursuit une description objective.', 'contresens-mouvement']],
  [5, 1, 4, 'Il ranime un passé heureux par les sensations.', 'Il décrit la maison de la grand-mère.', ['Il dénonce une enfance malheureuse.', 'contresens-mouvement']],
  [5, 5, 6, 'Il oppose au souvenir la perte, au présent.', 'Il dit que la maison a été vendue.', ['Il célèbre la joie du changement.', 'contresens-mouvement']],
  [6, 1, 3, 'Il concède les avantages de la ville avant de les dépasser.', 'Il énumère ce qu’on trouve en ville.', ['Il défend la thèse du texte.', 'concession-pas-these']],
  [6, 4, 6, 'Il affirme la thèse : la ville épuise.', 'Il dit que la ville est bruyante.', ['Il prolonge l’éloge de la ville.', 'contresens-mouvement']],
  [10, 1, 4, 'Il fait l’éloge du progrès avant de le nuancer.', 'Il dit que le progrès allonge la vie.', ['Il condamne le progrès.', 'contresens-mouvement']],
  [10, 5, 6, 'Il nuance cet éloge en montrant le prix du progrès.', 'Il dit que la nature souffre.', ['Il renforce l’éloge du progrès.', 'contresens-mouvement']],
];

/** [extrait, le bon projet de lecture, la question de fait, la question hors du texte]. */
export const PROJETS = [
  [0, 'Comment le texte fait-il basculer une scène paisible dans l’inquiétude ?', 'Que fait Claire quand elle entend le cri ?', 'Pourquoi les jardins sont-ils si présents en littérature ?'],
  [1, 'Comment le récit prépare-t-il un retournement entre le fils et le père ?', 'Qui a écrit la lettre que reçoit Paul ?', 'Les pères abandonnent-ils souvent leurs enfants ?'],
  [2, 'Comment l’auteur réfute-t-il une idée reçue pour défendre une autre idée de la lecture ?', 'Qu’accuse-t-on les jeunes de préférer aux livres ?', 'Faut-il interdire les écrans aux adolescents ?'],
  [4, 'Comment le paysage marin devient-il l’expression d’un manque ?', 'Que voit le poète au bord de la mer ?', 'Pourquoi les poètes aiment-ils tant la mer ?'],
  [5, 'Comment le souvenir sensible rend-il la perte de la maison plus douloureuse ?', 'Que faisait la grand-mère dans la maison ?', 'Faut-il vendre les maisons de famille ?'],
  [6, 'Comment le texte concède-t-il avant de condamner la vie en ville ?', 'Que trouve-t-on dans une ville ?', 'La campagne est-elle plus agréable que la ville ?'],
  [7, 'Comment le texte fait-il passer le voyageur du désespoir à la joie ?', 'Que voit le voyageur du haut de la colline ?', 'Pourquoi les héros de roman voyagent-ils ?'],
  [9, 'Comment l’arrivée d’un inconnu brise-t-elle l’harmonie de la fête ?', 'Quelle danse joue l’orchestre ?', 'Pourquoi les bals étaient-ils à la mode autrefois ?'],
  [10, 'Comment le texte nuance-t-il l’éloge du progrès ?', 'Qu’a fait le progrès pour l’espérance de vie ?', 'Qui a inventé la machine à vapeur ?'],
  [11, 'Comment le récit fait-il naître la peur, puis la dissipe-t-il ?', 'Qui entre dans la chambre de l’enfant ?', 'Les enfants ont-ils peur du noir ?'],
];

export const EXERCICES = { lineaire: 'L’explication linéaire', commentaire: 'Le commentaire' };

/** [ce qu'on fait, l'exercice qui le demande]. */
export const METHODES = [
  ['On suit le texte dans l’ordre, du début à la fin.', 'lineaire'],
  ['On découpe le texte en mouvements, et on les étudie l’un après l’autre.', 'lineaire'],
  ['C’est l’exercice de l’oral du bac de français.', 'lineaire'],
  ['On lit le texte à voix haute devant l’examinateur.', 'lineaire'],
  ['On montre comment le sens se construit au fil de la lecture.', 'lineaire'],
  ['Une question de grammaire l’accompagne, à l’oral.', 'lineaire'],
  ['On organise l’analyse en deux ou trois axes de lecture.', 'commentaire'],
  ['On ne suit pas l’ordre du texte : on regroupe les remarques par idées.', 'commentaire'],
  ['Chaque partie défend une idée directrice sur le texte.', 'commentaire'],
  ['C’est un des sujets possibles de l’épreuve écrite du bac de français.', 'commentaire'],
  ['On rédige, en plusieurs heures, une analyse organisée par idées.', 'commentaire'],
];

function libre(melanger, consigne, question, bonne, faux) {
  return {
    consigne,
    question,
    bonne,
    choix: melanger([bonne, ...faux.map(([f]) => f)]).map((c) => ({ cle: c, libelle: c })),
    pieges: Object.fromEntries(faux),
    aide: `${consigne}-regle`,
  };
}

function tournant(t, i) {
  const { tournant: n, leurres } = TEXTES[i];
  const nombres = t.melanger([n, ...leurres]);
  return {
    consigne: 'bascule',
    question: texte(i),
    bonne: String(n),
    choix: nombres.map((k) => ({ cle: String(k), libelle: `Phrase ${k}` })),
    pieges: Object.fromEntries(leurres.map((k) => [String(k), k < n ? 'bascule-trop-tot' : 'bascule-trop-tard'])),
    aide: 'bascule-regle',
  };
}

const role = (t, [i, debut, fin, bon, paraphrase, contresens]) => libre(
  t.melanger,
  'role',
  `${texte(i)}\n\n→ Le mouvement des phrases ${debut} à ${fin}.`,
  bon,
  [[paraphrase, 'paraphrase'], contresens],
);

const projet = (t, [i, bon, fait, hors]) => libre(
  t.melanger,
  'projet',
  texte(i),
  bon,
  [[fait, 'projet-fait'], [hors, 'projet-hors-texte']],
);

const methode = ([enonce, bonne]) => ({
  consigne: 'methode',
  question: enonce,
  bonne,
  choix: Object.keys(EXERCICES).map((c) => ({ cle: c, libelle: EXERCICES[c] })),
  pieges: Object.fromEntries(Object.keys(EXERCICES).filter((c) => c !== bonne).map((c) => [c, `c-est-${bonne}`])),
  aide: 'methode-regle',
});

/** Combien de manches de chaque sorte, par classe. */
const COMPTES = {
  PREMIERE: { bascule: 2, role: 3, projet: 2, methode: 1 },
  PREMIERE_TECHNO: { bascule: 2, role: 2, projet: 2, methode: 2 },
};

export function serie(graine = Date.now(), niveau = CLASSES[0]) {
  const t = outils(graine);
  const n = COMPTES[niveau] ?? COMPTES[CLASSES[0]];
  const pourTournant = t.melanger(TEXTES.map((_, i) => i)).slice(0, n.bascule);
  // Un texte dont on cherche le tournant ne revient pas : son découpage le donnerait.
  const roles = t.melanger(ROLES.filter(([i]) => !pourTournant.includes(i))).slice(0, n.role);
  const projets = t.melanger(PROJETS.filter(([i]) => !pourTournant.includes(i))).slice(0, n.projet);
  return t.melanger([
    ...pourTournant.map((i) => tournant(t, i)),
    ...roles.map((r) => role(t, r)),
    ...projets.map((p) => projet(t, p)),
    ...t.melanger(METHODES).slice(0, n.methode).map(methode),
  ]);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  bascule: 'À quelle phrase ce passage bascule-t-il ?',
  'bascule-regle': 'Cherche la rupture : un connecteur comme mais, pourtant, soudain, alors, ou un changement de temps, de lieu, de personnage ou de ton.',
  'bascule-trop-tot': 'Jusque-là, rien ne change encore : même temps, même ton, même sujet. Avance jusqu’au mot qui marque la rupture.',
  'bascule-trop-tard': 'La rupture a déjà eu lieu plus haut : remonte jusqu’au mot qui la marque, un connecteur ou un changement de temps.',

  role: 'Que fait ce mouvement dans le texte ?',
  'role-regle': 'Ne raconte pas le passage : dis ce qu’il fait. Il installe, oppose, fait basculer, réfute, conclut.',
  paraphrase: 'Tu redis ce que dit le texte : c’est de la paraphrase. Une explication dit ce que fait le passage, et comment.',
  'contresens-mouvement': 'Relis les mots du passage : ils ne vont pas dans ce sens. Appuie chaque remarque sur un indice précis du texte.',
  'these-adverse': 'Ces phrases rapportent ce que dit « on » : c’est l’opinion que l’auteur va combattre, pas sa propre thèse. Repère le « pourtant » qui suit.',
  'concession-pas-these': '« Certes » annonce une concession : l’auteur accorde un point avant de le dépasser. Sa thèse vient après le « mais ».',

  projet: 'Quel projet de lecture convient à cet extrait ?',
  'projet-regle': 'Un projet de lecture pose une question sur la manière dont le texte agit, comment, en quoi ; toute l’explication y répondra.',
  'projet-fait': 'Cette question se règle en relisant une phrase : elle porte sur l’histoire, pas sur la manière dont le texte agit.',
  'projet-hors-texte': 'Cette question sort de l’extrait : elle est trop générale. Le projet de lecture porte sur ce texte précis et sur ses effets.',

  methode: 'Explication linéaire ou commentaire : de quel exercice parle-t-on ?',
  'methode-regle': 'L’explication linéaire suit le texte dans l’ordre, mouvement par mouvement, à l’oral. Le commentaire regroupe l’analyse en axes, à l’écrit.',
  'c-est-lineaire': 'Suivre le texte dans l’ordre, mouvement par mouvement, à l’oral : c’est l’explication linéaire.',
  'c-est-commentaire': 'Regrouper l’analyse en axes, en parties fondées sur des idées, à l’écrit : c’est le commentaire.',
};
