/**
 * PROCÉDÉS ET EFFETS — le commentaire et l'explication, en 1re générale et
 * technologique. Professeur : Adrien (français).
 *
 * Extraits courts, écrits pour le jeu ou vers célèbres cités sans nom
 * d'auteur. Dans chaque extrait, le procédé demandé est le seul des choix
 * proposés qui y figure ; les effets proposés à côté du bon sont soit un
 * contresens, soit un effet « passe-partout » qui irait avec n'importe quel
 * texte.
 *
 * QUATRE SORTES DE MANCHES (3 + 3 + 1 + 1) :
 *   - L'EFFET (3) : un extrait, son procédé nommé ; quel effet ? LES
 *     PIÈGES : l'effet passe-partout (« un texte plus vivant »), le
 *     contresens ;
 *   - LE PROCÉDÉ (3) : quel procédé ? LES PIÈGES, les confusions vraies :
 *     litote et euphémisme, oxymore et antithèse, gradation et accumulation,
 *     comparaison et métaphore, chiasme et parallélisme ;
 *   - LA FOCALISATION (1) : interne, externe, zéro ;
 *   - LA VALEUR DU PRÉSENT (1) : énonciation, vérité générale, narration,
 *     habitude.
 * En voie technologique, le chiasme et la prétérition sont laissés de côté.
 */

import { bilan as bilanCommun, outils } from '../outils.js';

export const FAMILLE = { cle: 'procedes-et-effets', titre: 'Procédés et effets', matiereCode: 'FRANCAIS' };

export const PAR_CLASSE = {
  PREMIERE: {
    titre: 'Procédés et effets',
    accroche: 'Un procédé, et l’effet qu’il produit.',
    competences: ['FR_1RE_ECR_COMMENTAIRE', 'FR_1RE_METH_LINEAIRE'],
  },
  PREMIERE_TECHNO: {
    titre: 'Procédés et effets',
    accroche: 'Un procédé, et l’effet qu’il produit.',
    competences: ['FR_1TEC_ECR_COMMENTAIRE', 'FR_1TEC_METH_LINEAIRE'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

export const PROCEDES = {
  anaphore: 'Anaphore',
  gradation: 'Gradation',
  hyperbole: 'Hyperbole',
  accumulation: 'Accumulation',
  antithese: 'Antithèse',
  oxymore: 'Oxymore',
  chiasme: 'Chiasme',
  parallelisme: 'Parallélisme',
  comparaison: 'Comparaison',
  metaphore: 'Métaphore',
  personnification: 'Personnification',
  litote: 'Litote',
  euphemisme: 'Euphémisme',
  alliteration: 'Allitération',
  apostrophe: 'Apostrophe',
  rhetorique: 'Question rhétorique',
  preterition: 'Prétérition',
};

/** Les procédés laissés à la voie générale. */
const DIFFICILES = ['chiasme', 'preterition'];

/**
 * [extrait, procédé, deux procédés absents de l'extrait avec leur piège (null :
 * la définition du bon)].
 */
export const IDENTIFIER = [
  ['« Je t’attends le matin, je t’attends sous la pluie, je t’attends quand la nuit recouvre la ville. »', 'anaphore', [['oxymore', null], ['litote', null]]],
  ['« Mon pays, c’est la mer ; mon pays, c’est le vent. »', 'anaphore', [['oxymore', null], ['litote', null]]],
  ['« Il murmura, puis parla, puis cria enfin sa colère. »', 'gradation', [['accumulation', 'gradation-pas-accumulation'], ['antithese', null]]],
  ['« Va, cours, vole, et nous venge. »', 'gradation', [['accumulation', 'gradation-pas-accumulation'], ['euphemisme', null]]],
  ['« Je t’ai attendu cent ans devant cette porte. »', 'hyperbole', [['litote', 'hyperbole-pas-litote'], ['euphemisme', null]]],
  ['« Je te l’ai répété un million de fois. »', 'hyperbole', [['litote', 'hyperbole-pas-litote'], ['antithese', null]]],
  ['« Des cris, des pleurs, des rires, des chants, des appels emplissaient la place. »', 'accumulation', [['gradation', 'accumulation-pas-gradation'], ['litote', null]]],
  ['« Va, je ne te hais point. »', 'litote', [['euphemisme', 'litote-pas-euphemisme'], ['hyperbole', null]]],
  ['À propos d’un plat délicieux : « Ce n’est pas mauvais du tout ! »', 'litote', [['euphemisme', 'litote-pas-euphemisme'], ['antithese', null]]],
  ['« Il nous a quittés cette nuit. »', 'euphemisme', [['litote', 'euphemisme-pas-litote'], ['hyperbole', null]]],
  ['« Il a rendu le dernier soupir. »', 'euphemisme', [['litote', 'euphemisme-pas-litote'], ['hyperbole', null]]],
  ['« Un silence assourdissant pesait sur la salle. »', 'oxymore', [['antithese', 'oxymore-pas-antithese'], ['comparaison', null]]],
  ['« Cette obscure clarté qui tombe des étoiles »', 'oxymore', [['antithese', 'oxymore-pas-antithese'], ['litote', null]]],
  ['« Le jour, il rit ; la nuit, il pleure. »', 'antithese', [['oxymore', 'antithese-pas-oxymore'], ['comparaison', null]]],
  ['« Je brûle et je gèle à la fois. »', 'antithese', [['oxymore', 'antithese-pas-oxymore'], ['litote', null]]],
  ['« Il faut manger pour vivre et non pas vivre pour manger. »', 'chiasme', [['parallelisme', 'chiasme-pas-parallelisme'], ['gradation', null]]],
  ['« Elle aimait la vie, et la vie l’aimait. »', 'chiasme', [['parallelisme', 'chiasme-pas-parallelisme'], ['hyperbole', null]]],
  ['« Ses yeux brillaient comme deux étoiles. »', 'comparaison', [['metaphore', 'comparaison-outil'], ['litote', null]]],
  ['« La mer, pareille à un miroir, reflétait le ciel. »', 'comparaison', [['metaphore', 'comparaison-outil'], ['hyperbole', null]]],
  ['« Ses yeux étaient deux étoiles. »', 'metaphore', [['comparaison', 'metaphore-sans-outil'], ['litote', null]]],
  ['« La vie est un long fleuve. »', 'metaphore', [['comparaison', 'metaphore-sans-outil'], ['antithese', null]]],
  ['« La ville dort, et le vent soupire dans les rues. »', 'personnification', [['comparaison', null], ['antithese', null]]],
  ['« Les arbres pleuraient sous la pluie. »', 'personnification', [['comparaison', null], ['litote', null]]],
  ['« Pour qui sont ces serpents qui sifflent sur vos têtes ? »', 'alliteration', [['anaphore', null], ['gradation', null]]],
  ['« Ô nuit, cache-moi sous tes voiles ! »', 'apostrophe', [['hyperbole', null], ['litote', null]]],
  ['« Qui pourrait rester insensible à tant de misère ? »', 'rhetorique', [['litote', null], ['apostrophe', null]]],
  ['« Je ne vous parlerai pas de ses mensonges, ni de ses trahisons. »', 'preterition', [['litote', null], ['euphemisme', null]]],
];

/** Les effets qui iraient avec n'importe quel texte. */
export const PASSE_PARTOUT = [
  'Un texte plus vivant',
  'Un style plus riche',
  'Une phrase plus belle',
  'Un passage plus intéressant',
  'Une lecture plus agréable',
];

/** [extrait, procédé nommé, le bon effet, le contresens]. */
export const EFFETS = [
  ['« Je t’attends le matin, je t’attends sous la pluie, je t’attends quand la nuit recouvre la ville. »', 'Anaphore', 'Une attente martelée, qui paraît sans fin', 'Une attente brève, presque légère'],
  ['« Il murmura, puis parla, puis cria enfin sa colère. »', 'Gradation', 'Une colère qui monte jusqu’à l’éclat', 'Une colère qui s’apaise peu à peu'],
  ['« Je t’ai attendu cent ans devant cette porte. »', 'Hyperbole', 'Une impatience grossie, presque un reproche', 'Une attente courte et sans importance'],
  ['« Des cris, des pleurs, des rires, des appels emplissaient la place. »', 'Accumulation', 'Une impression de foule et de désordre', 'Une place calme, presque vide'],
  ['« Un ciel de plomb, des arbres noirs, une eau morte, un silence de tombe. »', 'Champ lexical de la mort', 'Une atmosphère funèbre, sans espoir', 'Une ambiance de fête et de renouveau'],
  ['« La raison du plus fort est toujours la meilleure. »', 'Présent de vérité générale', 'La force d’une loi, valable en tout temps', 'Un fait qui ne vaut que pour cet instant'],
  ['« Julie entra. Le salon lui parut immense, et ces visages inconnus l’effrayaient. »', 'Focalisation interne', 'L’angoisse du personnage, partagée par le lecteur', 'Un regard distant, neutre, sur la scène'],
  ['« Un homme entra. Il posa son chapeau, regarda la salle, puis sortit sans un mot. »', 'Focalisation externe', 'Un personnage opaque, qui garde son mystère', 'Les pensées intimes de l’homme, dévoilées'],
  ['« Un silence assourdissant pesait sur la salle. »', 'Oxymore', 'Un silence si lourd qu’il en devient oppressant', 'Une salle bruyante et joyeuse'],
  ['« Le jour, il rit ; la nuit, il pleure. »', 'Antithèse', 'Un être déchiré entre deux visages', 'Un personnage toujours égal à lui-même'],
  ['« Va, je ne te hais point. »', 'Litote', 'Un amour qui ne peut pas se dire ouvertement', 'Une haine franche et assumée'],
  ['« Il nous a quittés cette nuit. »', 'Euphémisme', 'L’annonce d’une mort, adoucie', 'L’annonce d’une mort, rendue plus brutale'],
  ['« Qui pourrait rester insensible à tant de misère ? »', 'Question rhétorique', 'Une indignation que le lecteur doit partager', 'Une vraie question, dont l’auteur ignore la réponse'],
  ['« La ville dort, et le vent soupire dans les rues. »', 'Personnification', 'Un décor nocturne qui prend vie', 'Un décor figé, froid, inanimé'],
  ['« Pour qui sont ces serpents qui sifflent sur vos têtes ? »', 'Allitération en « s »', 'Le sifflement des serpents, rendu audible', 'Une musique douce, apaisante'],
  ['« Ses yeux brillaient comme deux étoiles. »', 'Comparaison', 'Un regard idéalisé, lumineux', 'Un regard terne et inquiétant'],
  ['« Il entra. Il vit. Il comprit. »', 'Phrases courtes juxtaposées', 'Un récit rapide, presque haletant', 'Un récit ralenti, qui fait durer l’attente'],
  ['« Ô nuit, cache-moi sous tes voiles ! »', 'Apostrophe', 'La nuit devenue une confidente, à qui l’on parle', 'Une description neutre de la nuit'],
  ['« Il faut manger pour vivre et non pas vivre pour manger. »', 'Chiasme', 'Deux manières de vivre, opposées en miroir', 'Manger et vivre, confondus en une seule idée'],
];

export const FOCALISATIONS = {
  interne: 'Focalisation interne',
  externe: 'Focalisation externe',
  zero: 'Focalisation zéro (omnisciente)',
};

/** [extrait, son point de vue]. */
export const POINTS_DE_VUE = [
  ['Julie entra. Le salon lui parut immense, et ces visages inconnus l’effrayaient.', 'interne'],
  ['Paul ouvrit la lettre. Ses mains tremblaient ; il redoutait ce qu’il allait lire.', 'interne'],
  ['Du haut de la tour, Marie voyait la plaine s’étendre ; au loin, une fumée montait, qui l’inquiéta.', 'interne'],
  ['Le jeune homme regardait la ville à ses pieds ; elle lui semblait offerte, prête à être conquise.', 'interne'],
  ['Un homme entra. Il posa son chapeau, regarda la salle, puis sortit sans un mot.', 'externe'],
  ['Deux hommes parlaient à voix basse près de la fontaine. L’un d’eux montra la porte du doigt. Puis ils se séparèrent.', 'externe'],
  ['La voiture s’arrêta. Une femme en descendit, alluma une cigarette et attendit.', 'externe'],
  ['Le cavalier traversa le village au galop. Il ne s’arrêta pas. Les chiens aboyèrent derrière lui.', 'externe'],
  ['Pierre se croyait aimé de Louise ; il ignorait qu’elle en aimait un autre, et que, dix ans plus tard, il serait ruiné.', 'zero'],
  ['Tandis que Jeanne rêvait d’un mariage heureux, son père, à l’autre bout de la ville, signait déjà sa ruine.', 'zero'],
  ['Les deux frères se haïssaient en silence : l’aîné enviait la fortune du cadet, le cadet méprisait la paresse de l’aîné.', 'zero'],
  ['Elle sourit au jeune homme, sans se douter qu’il avait juré sa perte.', 'zero'],
];

export const PRESENTS = {
  enonciation: 'Présent d’énonciation',
  verite: 'Présent de vérité générale',
  narration: 'Présent de narration',
  habitude: 'Présent d’habitude',
};

/** [phrase, valeur du présent]. */
export const VALEURS_PRESENT = [
  ['La Terre tourne autour du Soleil.', 'verite'],
  ['« Rien ne sert de courir ; il faut partir à point. »', 'verite'],
  ['Qui ne risque rien n’a rien.', 'verite'],
  ['« La raison du plus fort est toujours la meilleure. »', 'verite'],
  ['En ce moment, je t’écris depuis la gare.', 'enonciation'],
  ['Regarde : il neige !', 'enonciation'],
  ['Ce soir, je n’ai pas envie de sortir.', 'enonciation'],
  ['Hier, je marchais tranquillement ; soudain, un chien surgit et me mord la main.', 'narration'],
  ['La nuit était calme. Tout à coup, la porte s’ouvre et un homme entre.', 'narration'],
  ['Le 14 juillet 1789, le peuple de Paris prend la Bastille.', 'narration'],
  ['Chaque matin, il se lève à six heures.', 'habitude'],
  ['Le dimanche, nous déjeunons chez ma grand-mère.', 'habitude'],
  ['Tous les soirs, elle lit avant de dormir.', 'habitude'],
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

function identifier(t, [extrait, bonne, faux]) {
  const cles = t.melanger([bonne, ...faux.map(([c]) => c)]);
  return {
    consigne: 'procede',
    question: extrait,
    bonne,
    choix: cles.map((c) => ({ cle: c, libelle: PROCEDES[c] })),
    pieges: Object.fromEntries(faux.map(([c, p]) => [c, p ?? `def-${bonne}`])),
    aide: 'procede-regle',
  };
}

const effet = (t, [extrait, procede, bon, contresens]) => libre(
  t.melanger,
  'effet',
  `${extrait}\n\nProcédé : ${procede}`,
  bon,
  [[t.au(PASSE_PARTOUT), 'effet-passe-partout'], [contresens, 'effet-contresens']],
);

const etiquettes = (consigne, question, bonne, cles, libelles) => ({
  consigne,
  question,
  bonne,
  choix: cles.map((c) => ({ cle: c, libelle: libelles[c] })),
  pieges: Object.fromEntries(cles.filter((c) => c !== bonne).map((c) => [c, `${consigne}-${bonne}`])),
  aide: `${consigne}-regle`,
});

function present(t, [phrase, bonne]) {
  const autres = t.melanger(Object.keys(PRESENTS).filter((c) => c !== bonne)).slice(0, 2);
  return etiquettes('present', phrase, bonne, t.melanger([bonne, ...autres]), PRESENTS);
}

export function serie(graine = Date.now(), niveau = CLASSES[0]) {
  const t = outils(graine);
  const techno = niveau === 'PREMIERE_TECHNO';
  const effets = EFFETS.filter(([, procede]) => !(techno && procede === 'Chiasme'));
  const procedes = IDENTIFIER.filter(([, p]) => !(techno && DIFFICILES.includes(p)));
  const choisis = t.melanger(effets).slice(0, 3);
  // L'extrait dont on demande l'effet, procédé nommé, ne revient pas pour qu'on nomme son procédé.
  const vus = choisis.map(([e]) => e);
  // De même pour le point de vue et le présent : un extrait déjà nommé ne revient pas.
  const libres = (liste) => liste.filter(([p]) => !vus.some((e) => e.includes(p.replace(/[«»]/g, '').trim())));
  const [extrait, vue] = t.au(libres(POINTS_DE_VUE));
  return t.melanger([
    ...choisis.map((e) => effet(t, e)),
    ...t.melanger(procedes.filter(([e]) => !vus.includes(e))).slice(0, 3).map((p) => identifier(t, p)),
    etiquettes('focalisation', extrait, vue, Object.keys(FOCALISATIONS), FOCALISATIONS),
    present(t, t.au(libres(VALEURS_PRESENT))),
  ]);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  // L'effet
  effet: 'Quel effet ce procédé produit-il dans ce passage ?',
  'effet-regle': 'Un effet se justifie par le texte : relie le procédé au sens précis du passage, à ce qu’il fait ressentir ou comprendre.',
  'effet-passe-partout': 'Cet effet irait avec n’importe quel procédé, dans n’importe quel texte : il ne dit rien. Relie le procédé au sens précis de ce passage.',
  'effet-contresens': 'Relis le passage : le procédé ne va pas dans ce sens. L’effet doit s’appuyer sur les mots du texte.',

  // Le procédé
  procede: 'Quel procédé reconnais-tu dans ce passage ?',
  'procede-regle': 'Observe la construction : une reprise en tête, une montée en intensité, une exagération, une opposition, une image, un son répété.',
  'def-anaphore': 'Le même mot, ou le même groupe, revient en tête de plusieurs phrases ou membres de phrase : c’est une anaphore.',
  'def-gradation': 'Les termes se suivent en montant en intensité, du plus faible au plus fort : c’est une gradation.',
  'def-hyperbole': 'L’expression exagère, grossit la réalité pour frapper : c’est une hyperbole.',
  'def-accumulation': 'Les termes s’ajoutent les uns aux autres, sans ordre d’intensité : c’est une accumulation.',
  'def-antithese': 'Deux idées contraires sont rapprochées, dans deux parties distinctes de la phrase : c’est une antithèse.',
  'def-oxymore': 'Deux mots de sens contraire sont collés dans le même groupe, un nom et son adjectif : c’est un oxymore.',
  'def-chiasme': 'Les termes reviennent en ordre inversé, A B puis B A, comme dans un miroir : c’est un chiasme.',
  'def-comparaison': 'Deux éléments sont rapprochés grâce à un outil de comparaison, comme, pareil à, tel : c’est une comparaison.',
  'def-metaphore': 'Deux éléments sont rapprochés sans outil de comparaison : l’un devient l’autre. C’est une métaphore.',
  'def-personnification': 'Une chose ou un élément reçoit des gestes ou des sentiments humains : c’est une personnification.',
  'def-litote': 'On dit moins pour faire entendre plus, souvent par une négation : c’est une litote.',
  'def-euphemisme': 'On adoucit une réalité pénible, comme la mort, pour la rendre moins brutale : c’est un euphémisme.',
  'def-alliteration': 'Une même consonne revient plusieurs fois et fait entendre un son : c’est une allitération.',
  'def-apostrophe': 'On s’adresse directement à quelqu’un ou à quelque chose, souvent avec « ô » : c’est une apostrophe.',
  'def-rhetorique': 'La question n’attend pas de réponse : elle affirme avec force ce qui va de soi. C’est une question rhétorique.',
  'def-preterition': 'On prétend ne pas parler d’une chose, et on en parle en le disant : c’est une prétérition.',
  'gradation-pas-accumulation': 'Les termes ne s’ajoutent pas seulement : ils montent en intensité, jusqu’au plus fort. C’est une gradation.',
  'accumulation-pas-gradation': 'Les termes s’ajoutent sans monter en intensité : aucun n’est plus fort que l’autre. C’est une accumulation.',
  'hyperbole-pas-litote': 'La litote dit moins pour faire entendre plus ; ici, au contraire, on exagère. C’est une hyperbole.',
  'litote-pas-euphemisme': 'L’euphémisme adoucit une réalité pénible ; la litote dit moins pour faire entendre plus. Ici, la négation laisse entendre bien davantage : c’est une litote.',
  'euphemisme-pas-litote': 'La litote dit moins pour faire entendre plus ; ici, on adoucit une réalité pénible, la mort. C’est un euphémisme.',
  'oxymore-pas-antithese': 'Les deux termes contraires sont collés l’un à l’autre, dans le même groupe de mots : c’est un oxymore. L’antithèse les place dans deux parties distinctes.',
  'antithese-pas-oxymore': 'Les termes contraires sont dans deux parties distinctes de la phrase : c’est une antithèse. L’oxymore les colle dans le même groupe.',
  'chiasme-pas-parallelisme': 'Le parallélisme répète le même ordre ; ici, l’ordre s’inverse, A B puis B A. C’est un chiasme.',
  'comparaison-outil': 'Il y a un outil de comparaison, comme ou pareil à : c’est une comparaison, pas une métaphore.',
  'metaphore-sans-outil': 'Aucun outil de comparaison : l’un des termes devient l’autre. C’est une métaphore, pas une comparaison.',

  // La focalisation
  focalisation: 'Quel est le point de vue adopté par le narrateur ?',
  'focalisation-regle': 'Demande-toi ce que sait le narrateur : les pensées d’un seul personnage, ce qu’on voit de l’extérieur, ou tout, y compris l’avenir et les pensées de chacun.',
  'focalisation-interne': 'On voit la scène par les yeux d’un personnage, avec ses impressions et ses pensées : c’est la focalisation interne.',
  'focalisation-externe': 'On ne voit que des gestes et des paroles, de l’extérieur, sans entrer dans aucune pensée : c’est la focalisation externe.',
  'focalisation-zero': 'Le narrateur sait tout : les pensées de plusieurs personnages, ce qui se passe ailleurs, l’avenir même. C’est la focalisation zéro.',

  // Le présent
  present: 'Quelle est la valeur de ce présent ?',
  'present-regle': 'Demande-toi si l’action a lieu au moment où l’on parle, si elle est vraie de tout temps, si elle se répète, ou si elle raconte un passé.',
  'present-enonciation': 'L’action a lieu au moment même où l’on parle : c’est un présent d’énonciation.',
  'present-verite': 'La phrase énonce une vérité valable en tout temps, comme une loi ou un proverbe : c’est un présent de vérité générale.',
  'present-narration': 'Le présent raconte des faits passés, pour les rendre plus vivants : c’est un présent de narration.',
  'present-habitude': 'L’action se répète régulièrement, chaque matin, tous les soirs : c’est un présent d’habitude.',
};
