/**
 * LA CONTRACTION DE TEXTE — le français de 1re technologique (Adrien).
 *
 * COMPÉTENCES DU RÉFÉRENTIEL :
 *   FR_1TEC_ECR_CONTRACTION   — « Contracter au quart un texte d'idées… en
 *                                respectant énonciation, thèse et mouvement »
 *   FR_1TEC_ECR_COMPTER_MOTS  — « Tenir la longueur de la contraction à plus
 *                                ou moins 10 % et indiquer le nombre de mots »
 *   FR_1TEC_ECR_REFORMULER    — « Reformuler et synthétiser un propos… »
 *
 * CINQ SORTES DE MANCHES (3 + 2 + 1 + 1 + 1) :
 *   - LA CONTRACTION FIDÈLE (3) : un court paragraphe d'idées écrit pour le
 *     jeu ; laquelle de ces phrases le contracte fidèlement ? LES PIÈGES,
 *     trois parmi quatre : la phrase recopiée telle quelle, la thèse trahie
 *     (le contresens), l'avis ajouté (« à mon avis »), l'énonciation changée
 *     (« l'auteur explique que… ») ;
 *   - LE MOUVEMENT (2) : quel plan suit le texte ? LES PIÈGES : les bonnes
 *     étapes dans le mauvais ordre, une étape que le texte ne contient pas ;
 *   - LA FOURCHETTE (1) : le quart, à dix pour cent près, CALCULÉ (textes de
 *     quarante en quarante mots, pour des bornes entières). LES PIÈGES : la
 *     marge prise sur le texte entier au lieu du quart, dix mots au lieu de
 *     dix pour cent ;
 *   - LA BONNE LONGUEUR (1) : telle contraction tient-elle la longueur ? Les
 *     longueurs proposées ne frôlent jamais les bornes ;
 *   - LA MÉTHODE (1) : le nombre de mots indiqué à la fin, l'énonciation,
 *     l'ordre des idées, les exemples.
 * Aucun texte ne parle à la première personne du singulier : un « je » dans
 * une contraction est donc forcément un avis ajouté.
 */

import { bilan as bilanCommun, outils } from '../outils.js';

export const FAMILLE = { cle: 'contraction', titre: 'La contraction de texte', matiereCode: 'FRANCAIS' };

export const PAR_CLASSE = {
  PREMIERE_TECHNO: {
    titre: 'La contraction de texte',
    accroche: 'Garder l’essentiel, au quart près.',
    competences: ['FR_1TEC_ECR_CONTRACTION', 'FR_1TEC_ECR_COMPTER_MOTS', 'FR_1TEC_ECR_REFORMULER'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

/**
 * Les paragraphes d'idées. `recopie` est une phrase du texte, mot pour mot ;
 * `mouvement`, ses étapes dans l'ordre ; `absente`, une étape qu'il n'a pas.
 */
export const TEXTES = [
  {
    texte: 'Nous lisons de moins en moins de livres, et surtout de moins en moins longtemps. Ce n’est pas que nous aimions moins lire : nos journées sont découpées par les notifications, et notre attention s’émiette. Il ne s’agit donc pas d’accuser les écrans, mais de réapprendre à protéger des moments de silence, où rien ne vient interrompre la lecture.',
    bonne: 'Si nous lisons moins, c’est que notre attention est sans cesse dispersée : réapprenons à préserver des temps de calme pour lire.',
    recopie: 'Nous lisons de moins en moins de livres, et surtout de moins en moins longtemps.',
    trahison: 'Nous lisons moins parce que nous n’aimons plus lire : mieux vaut renoncer aux livres.',
    opinion: 'Notre attention dispersée nous fait moins lire, et il faut retrouver des temps calmes : une idée excellente, à mon avis.',
    enonciation: 'L’auteur explique que nous lisons moins à cause de notre attention dispersée, et qu’il faut retrouver des temps calmes.',
    mouvement: ['Constat', 'Cause', 'Proposition'],
    absente: 'Question',
  },
  {
    texte: 'Le sport à l’école ne sert pas seulement à se dépenser : il apprend à perdre, à respecter un adversaire, à tenir sa place dans une équipe. On objecte parfois qu’il humilie les élèves les moins doués. C’est oublier que tout dépend de la manière de l’enseigner : un professeur qui valorise les progrès, plutôt que les performances, ne laisse personne de côté.',
    bonne: 'Le sport scolaire forme au respect et au collectif ; s’il peut humilier, c’est affaire de pédagogie : valoriser les progrès n’exclut personne.',
    recopie: 'On objecte parfois qu’il humilie les élèves les moins doués.',
    trahison: 'Le sport scolaire humilie les élèves les moins doués : mieux vaudrait le supprimer.',
    opinion: 'Le sport scolaire forme au respect, si l’on valorise les progrès, et je pense que c’est la matière la plus utile de toutes.',
    enonciation: 'Selon l’auteur, le sport scolaire forme au respect, et une bonne pédagogie évite qu’il humilie.',
    mouvement: ['Thèse', 'Objection', 'Réfutation'],
    absente: 'Question',
  },
  {
    texte: 'Les vêtements n’ont jamais été aussi bon marché : on en achète plus, on les porte moins, on les jette plus vite. Ce rythme a un coût que l’étiquette ne montre pas : des ressources gaspillées, des déchets textiles qui s’accumulent. Il est temps de préférer des vêtements plus durables, quitte à en acheter moins.',
    bonne: 'Les vêtements bon marché, vite achetés et vite jetés, gaspillent ressources et matières : mieux vaut acheter moins, mais durable.',
    recopie: 'Il est temps de préférer des vêtements plus durables, quitte à en acheter moins.',
    trahison: 'Les vêtements bon marché permettent d’acheter plus : il faut en profiter tant qu’ils coûtent peu.',
    opinion: 'Acheter moins de vêtements, mais plus durables, éviterait un vrai gaspillage ; selon moi, c’est la seule solution raisonnable.',
    enonciation: 'L’auteur dénonce le gaspillage des vêtements bon marché et conseille d’en acheter moins, mais de meilleure qualité.',
    mouvement: ['Constat', 'Conséquence', 'Proposition'],
    absente: 'Objection',
  },
  {
    texte: 'Faut-il avoir peur de l’intelligence artificielle ? Elle n’est pas, en elle-même, une menace : c’est un outil, et tout dépend de l’usage qu’on en fait. Un même logiciel peut aider un médecin à repérer une maladie plus tôt, ou servir à fabriquer de fausses images pour tromper le public.',
    bonne: 'L’intelligence artificielle n’est pas dangereuse en soi : outil utile ou trompeur, elle vaut ce que vaut l’usage qu’on en fait.',
    recopie: 'Faut-il avoir peur de l’intelligence artificielle ?',
    trahison: 'L’intelligence artificielle est une menace : elle sert surtout à tromper le public.',
    opinion: 'L’intelligence artificielle vaut ce que vaut son usage, et je pense qu’on en fera surtout bon usage.',
    enonciation: 'L’auteur pense que l’intelligence artificielle n’est ni bonne ni mauvaise, et que tout dépend de son usage.',
    mouvement: ['Question', 'Thèse', 'Exemple'],
    absente: 'Proposition',
  },
  {
    texte: 'L’ennui a mauvaise réputation, et pourtant il est précieux. Quand rien ne nous occupe, notre esprit vagabonde et associe des idées qui n’avaient rien à voir. C’est souvent dans ces moments vides que naissent les projets les plus inventifs. En remplissant chaque minute, nous nous privons peut-être de nos meilleures idées.',
    bonne: 'Injustement décrié, l’ennui laisse l’esprit associer librement les idées : à trop remplir notre temps, nous étouffons notre créativité.',
    recopie: 'L’ennui a mauvaise réputation, et pourtant il est précieux.',
    trahison: 'L’ennui est du temps perdu : il faut occuper chaque minute pour être inventif.',
    opinion: 'L’ennui libère l’esprit et favorise les idées neuves, ce que je trouve, pour ma part, très juste.',
    enonciation: 'L’auteur défend l’ennui, qui selon lui libère l’esprit et favorise la créativité.',
    mouvement: ['Thèse', 'Explication', 'Mise en garde'],
    absente: 'Exemple',
  },
  {
    texte: 'Dans bien des cantines, une grande partie des repas finit à la poubelle. On accuse volontiers les élèves d’être difficiles. Mais si l’on servait des portions adaptées à leur appétit, et qu’on les associait au choix des menus, le gaspillage reculerait sans doute.',
    bonne: 'Le gaspillage des cantines ne tient pas qu’aux élèves : des portions adaptées et des menus choisis avec eux le réduiraient.',
    recopie: 'Dans bien des cantines, une grande partie des repas finit à la poubelle.',
    trahison: 'Le gaspillage des cantines vient des élèves difficiles : c’est à eux seuls de changer.',
    opinion: 'Des portions adaptées et des menus choisis avec les élèves réduiraient le gaspillage ; à mon avis, il faudrait l’imposer partout.',
    enonciation: 'L’auteur propose d’adapter les portions et d’associer les élèves aux menus pour réduire le gaspillage.',
    mouvement: ['Constat', 'Idée reçue', 'Proposition'],
    absente: 'Exemple',
  },
  {
    texte: 'Être tolérant, ce n’est pas tout accepter : c’est admettre que d’autres pensent autrement, sans renoncer à ses propres convictions. Cette vertu n’a rien de mou ; elle exige au contraire un effort constant. Dans un débat, écouter jusqu’au bout celui qui nous contredit demande plus de courage que de lui couper la parole.',
    bonne: 'La tolérance, qui admet d’autres pensées sans renier les siennes, demande un effort : écouter un contradicteur exige du courage.',
    recopie: 'Cette vertu n’a rien de mou ; elle exige au contraire un effort constant.',
    trahison: 'Être tolérant, c’est tout accepter sans rien défendre : une attitude facile.',
    opinion: 'La tolérance demande l’effort d’écouter jusqu’au bout ; je pense qu’elle manque beaucoup aujourd’hui.',
    enonciation: 'Pour l’auteur, la tolérance n’est pas une faiblesse mais un effort, comme le montre l’écoute d’un contradicteur.',
    mouvement: ['Définition', 'Thèse', 'Exemple'],
    absente: 'Question',
  },
  {
    texte: 'L’apprentissage est une voie d’excellence, et non un choix par défaut. On lui reproche parfois de fermer la porte des études longues. C’est inexact : bien des apprentis poursuivent ensuite vers des diplômes supérieurs, forts d’une expérience que les autres n’ont pas.',
    bonne: 'Loin d’être un choix par défaut, l’apprentissage n’interdit pas les études longues et apporte une expérience précieuse.',
    recopie: 'On lui reproche parfois de fermer la porte des études longues.',
    trahison: 'L’apprentissage est un choix par défaut, qui ferme la porte des études longues.',
    opinion: 'L’apprentissage mène aussi aux études longues, avec une vraie expérience ; c’est, selon moi, la meilleure des voies.',
    enonciation: 'L’auteur affirme que l’apprentissage est une voie d’excellence, qui n’empêche pas les études longues.',
    mouvement: ['Thèse', 'Objection', 'Réfutation'],
    absente: 'Définition',
  },
  {
    texte: 'Les adolescents dorment de moins en moins. Les écrans allumés tard le soir retardent l’endormissement, alors que le réveil, lui, sonne toujours à la même heure. Résultat : une fatigue durable, qui pèse sur la concentration en classe et sur l’humeur.',
    bonne: 'Les écrans retardent l’endormissement des adolescents, et non leur réveil : épuisés, ils se concentrent mal et s’irritent.',
    recopie: 'Les adolescents dorment de moins en moins.',
    trahison: 'Les adolescents dorment assez : leur fatigue vient seulement du travail scolaire.',
    opinion: 'Couchés tard à cause des écrans, les adolescents manquent de sommeil, et je trouve qu’on devrait interdire les téléphones le soir.',
    enonciation: 'L’auteur constate que les adolescents dorment trop peu à cause des écrans, et il en montre les conséquences.',
    mouvement: ['Constat', 'Cause', 'Conséquence'],
    absente: 'Proposition',
  },
  {
    texte: 'À quoi servent les musées, à l’heure où l’on peut voir n’importe quel tableau sur un écran ? Une reproduction donne l’image, pas l’œuvre : ni sa taille réelle, ni la matière de la peinture, ni le silence d’une salle. Les musées restent donc irremplaçables.',
    bonne: 'Un écran ne rend ni la taille, ni la matière, ni le silence d’une œuvre : le musée reste irremplaçable.',
    recopie: 'Les musées restent donc irremplaçables.',
    trahison: 'Les écrans rendent les musées inutiles : une reproduction suffit pour connaître une œuvre.',
    opinion: 'Une reproduction ne remplace pas l’œuvre, et le musée reste irremplaçable ; personnellement, j’adore les musées.',
    enonciation: 'L’auteur se demande à quoi servent les musées, et répond qu’ils restent irremplaçables.',
    mouvement: ['Question', 'Argument', 'Conclusion'],
    absente: 'Définition',
  },
];

/** Les quatre façons de rater une contraction, et la phrase qui dit la méthode. */
export const DEFAUTS = {
  recopie: 'fidele-recopie',
  trahison: 'fidele-trahison',
  opinion: 'fidele-opinion',
  enonciation: 'fidele-enonciation',
};

/** [question, la bonne réponse, [[réponse à écarter, la méthode], …]] : la méthode de la contraction. */
export const METHODES = [
  ['À la fin de ta contraction, tu dois…', 'indiquer le nombre de mots', [['donner ton avis sur le texte', 'methode-avis'], ['recopier la thèse de l’auteur', 'methode-recopie']]],
  ['Dans une contraction, on écrit…', 'en gardant l’énonciation du texte, comme l’auteur', [['« l’auteur dit que… »', 'methode-enonciation'], ['en ajoutant ses propres exemples', 'methode-ajout']]],
  ['Les exemples du texte, dans la contraction…', 'on les supprime, ou on résume l’essentiel', [['on les recopie tous', 'methode-recopie'], ['on en invente de meilleurs', 'methode-ajout']]],
  ['L’ordre des idées dans la contraction…', 'suit celui du texte', [['va de la plus importante à la moins importante', 'methode-ordre'], ['est libre', 'methode-ordre']]],
  ['Une contraction réussie…', 'reformule le texte avec ses propres mots', [['colle des phrases du texte bout à bout', 'methode-recopie'], ['commente et juge le texte', 'methode-avis']]],
];

/** Le quart d'un texte de n mots (n multiple de quarante), et ses bornes à dix pour cent près. */
export function fourchette(n) {
  const quart = n / 4;
  return { quart, min: quart - quart / 10, max: quart + quart / 10 };
}

const cartes = (liste) => liste.map((c) => ({ cle: c, libelle: c }));
const plan = (etapes) => etapes.join(' → ');

export const LONGUEURS = {
  dans: 'Oui, elle tient la longueur',
  longue: 'Non, elle est trop longue',
  courte: 'Non, elle est trop courte',
};
const PIEGE_LONGUEUR = { dans: 'longueur-marge', longue: 'longueur-trop-longue', courte: 'longueur-trop-courte' };

export function serie(graine = Date.now()) {
  const {
    melanger, entre, au,
  } = outils(graine);
  const textes = melanger(TEXTES);

  const fideles = textes.slice(0, 3).map((t) => {
    const defauts = melanger(Object.keys(DEFAUTS)).slice(0, 3);
    return {
      consigne: 'fidele',
      question: t.texte,
      bonne: t.bonne,
      choix: cartes(melanger([t.bonne, ...defauts.map((d) => t[d])])),
      pieges: Object.fromEntries(defauts.map((d) => [t[d], DEFAUTS[d]])),
      aide: 'fidele-regle',
    };
  });

  const mouvements = textes.slice(3, 5).map((t) => {
    const bonne = plan(t.mouvement);
    const ordre = plan([...t.mouvement].reverse());
    const i = entre(0, t.mouvement.length - 1);
    const absente = plan(t.mouvement.map((e, j) => (j === i ? t.absente : e)));
    return {
      consigne: 'mouvement',
      question: t.texte,
      bonne,
      choix: cartes(melanger([bonne, ordre, absente])),
      pieges: { [ordre]: 'mouvement-ordre', [absente]: 'mouvement-absente' },
      aide: 'mouvement-regle',
    };
  });

  // Un texte de 600 à 960 mots, de quarante en quarante : le quart et ses dix pour cent tombent juste.
  const k = entre(15, 24);
  const n = 40 * k;
  const { quart, min, max } = fourchette(n);
  const bonneF = `De ${min} à ${max} mots`;
  const surTexte = `De ${quart - n / 10} à ${quart + n / 10} mots`;
  const dixMots = `De ${quart - 10} à ${quart + 10} mots`;
  const fourchettes = [{
    consigne: 'fourchette',
    question: `Le texte à contracter compte ${n} mots. Ta contraction doit en faire le quart, à 10 % près.`,
    bonne: bonneF,
    choix: cartes(melanger([bonneF, surTexte, dixMots])),
    pieges: { [surTexte]: 'fourchette-marge-du-texte', [dixMots]: 'fourchette-dix-mots' },
    aide: 'fourchette-regle',
  }];

  // Une longueur nettement dedans, ou nettement dehors : jamais à trois mots d'une borne.
  const n2 = 40 * entre(15, 24);
  const f2 = fourchette(n2);
  const marge = f2.quart / 10;
  const etat = au(Object.keys(LONGUEURS));
  let mots;
  if (etat === 'dans') mots = f2.quart + entre(-(marge - 3), marge - 3);
  else if (etat === 'longue') mots = f2.max + entre(3, 2 * marge);
  else mots = f2.min - entre(3, 2 * marge);
  const longueurs = [{
    consigne: 'longueur',
    question: `Le texte compte ${n2} mots ; ta contraction en compte ${mots}.`,
    bonne: etat,
    choix: melanger(Object.keys(LONGUEURS)).map((cle) => ({ cle, libelle: LONGUEURS[cle] })),
    pieges: Object.fromEntries(Object.keys(LONGUEURS).filter((c) => c !== etat).map((c) => [c, PIEGE_LONGUEUR[etat]])),
    aide: 'longueur-regle',
  }];

  const methodes = melanger(METHODES).slice(0, 1).map(([question, bonne, faux]) => ({
    consigne: 'methode',
    question,
    bonne,
    choix: cartes(melanger([bonne, ...faux.map(([f]) => f)])),
    pieges: Object.fromEntries(faux),
    aide: 'methode-regle',
  }));

  return melanger([...fideles, ...mouvements, ...fourchettes, ...longueurs, ...methodes]);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  fidele: 'Quelle phrase contracte fidèlement ce paragraphe ?',
  mouvement: 'Quel plan suit fidèlement le mouvement de ce texte ?',
  fourchette: 'Entre combien de mots ta contraction doit-elle tenir ?',
  longueur: 'Cette contraction tient-elle la longueur demandée ?',
  methode: 'Une question de méthode sur la contraction.',

  'fidele-recopie': 'Cette phrase est recopiée mot pour mot, et elle ne garde qu’un morceau du texte. Contracter, c’est reformuler l’ensemble avec tes propres mots.',
  'fidele-trahison': 'Cette phrase trahit la thèse : elle fait dire au texte ce qu’il ne dit pas, parfois même le contraire. Retrouve d’abord la position de l’auteur, puis garde-la intacte.',
  'fidele-opinion': 'Cette phrase ajoute un avis qui n’est pas dans le texte. Dans une contraction, tu t’effaces : ni jugement, ni « à mon avis ».',
  'fidele-enonciation': 'Une contraction garde l’énonciation du texte : on ne parle pas de l’auteur, on parle à sa place, comme lui. Jamais « l’auteur explique que ».',
  'fidele-regle': 'Une bonne contraction garde la thèse et le mouvement du texte, avec tes propres mots, sans ajouter d’avis, et en gardant l’énonciation de l’auteur.',

  'mouvement-ordre': 'Ce sont bien les étapes du texte, mais pas dans son ordre. Une contraction suit le texte pas à pas : relis-le du début à la fin.',
  'mouvement-absente': 'Une de ces étapes n’existe pas dans le texte. Relis-le phrase par phrase et nomme ce que fait chacune.',
  'mouvement-regle': 'Pour trouver le mouvement, demande-toi ce que fait chaque partie du texte : constate-t-elle, explique-t-elle, objecte-t-elle, propose-t-elle ? Puis garde l’ordre du texte.',

  'fourchette-marge-du-texte': 'Les dix pour cent se calculent sur le quart, pas sur le texte entier. Calcule d’abord le quart, puis un dixième de ce quart.',
  'fourchette-dix-mots': 'La marge n’est pas de dix mots, mais de dix pour cent du quart : un dixième du quart, en plus ou en moins.',
  'fourchette-regle': 'Divise le nombre de mots par quatre pour avoir le quart. Puis retire et ajoute un dixième de ce quart : ce sont tes deux bornes.',

  'longueur-marge': 'Elle tient bien la longueur : la marge de dix pour cent autour du quart est permise. Calcule les deux bornes avant de juger.',
  'longueur-trop-longue': 'Elle dépasse la borne haute : le quart, plus un dixième de ce quart. Calcule les deux bornes avant de juger.',
  'longueur-trop-courte': 'Elle n’atteint pas la borne basse : le quart, moins un dixième de ce quart. Trop courte, une contraction perd des idées.',
  'longueur-regle': 'Calcule le quart du texte, puis un dixième de ce quart : la contraction doit tomber entre le quart moins ce dixième et le quart plus ce dixième.',

  'methode-avis': 'La contraction ne donne jamais d’avis : elle restitue le texte, sans le juger. Ton avis, c’est pour l’essai.',
  'methode-recopie': 'On ne recopie pas : on reformule. Un mot-clé du texte peut rester, mais pas ses phrases.',
  'methode-enonciation': 'On garde l’énonciation du texte : on parle comme l’auteur, sans jamais écrire « l’auteur dit que ».',
  'methode-ajout': 'La contraction n’ajoute rien : ni idée, ni exemple de ton cru. Elle ne garde que ce que dit le texte.',
  'methode-ordre': 'La contraction respecte le mouvement du texte : les idées viennent dans le même ordre que chez l’auteur.',
  'methode-regle': 'Contracter, c’est réduire au quart en gardant la thèse, le mouvement et l’énonciation, avec tes mots, sans avis, et en indiquant à la fin le nombre de mots.',
};
