import { outils } from '../../outils.js';
import { rangDe } from '../reglages.js';

/**
 * MYTHE OU HISTOIRE — « Détective de l'Histoire », Camara, le 10/10/2026
 * (cahier « Nouveaux jeux d'histoire et de géographie »). Une illustration et
 * une affirmation ; l'enfant tranche : Histoire (c'est vrai) ou Mythe (idée
 * reçue). Puis un tampon VRAI ou MYTHE frappe l'image, et Salim explique, le
 * mot clé surligné.
 *
 * LES TRENTE AFFIRMATIONS VIENNENT DU CAHIER validé par Camara ; les
 * explications ont été relues le 10/10/2026 et parfois précisées (la taille
 * de Napoléon, les cornes de l'opéra de Wagner, l'ENIAC « l'un des tout
 * premiers »). `motCle` est un morceau EXACT de l'explication : c'est lui
 * qu'on surligne (un test y veille).
 *
 * LA DIFFICULTÉ SUIT LA CLASSE : `niveau` 1, ce qu'un enfant de six ans a déjà
 * entendu (les Vikings, les dinosaures) ; 2, ce qu'on découvre au collège ;
 * 3, ce qui demande une date ou un raisonnement (Cléopâtre et la pyramide).
 * Une partie compte toujours au moins trois vrais et trois mythes : dix
 * mythes d'affilée, l'enfant répondrait « mythe » sans lire.
 */

export const HISTOIRE = 'histoire';
export const MYTHE = 'mythe';

/** Le nombre d'affirmations d'une partie. */
export const MANCHES = 10;

/** Au moins autant de chaque verdict dans une partie. */
export const MINIMUM_PAR_VERDICT = 3;

export const AFFIRMATIONS = [
  {
    id: '01-vikings', verdict: MYTHE, niveau: 1, motCle: 'opéra',
    affirmation: 'Les Vikings portaient des casques à cornes.',
    explication: 'Aucun casque viking à cornes n’a jamais été retrouvé. Les cornes ont été inventées au XIXe siècle, par des peintres et pour les costumes d’un opéra de Wagner, en 1876.',
  },
  {
    id: '02-napoleon', verdict: MYTHE, niveau: 1, motCle: 'caricatures anglaises',
    affirmation: 'Napoléon était tout petit.',
    explication: 'Il mesurait environ 1,69 mètre, un peu plus que la moyenne des Français de son temps. Ce sont les caricatures anglaises qui l’ont dessiné minuscule.',
  },
  {
    id: '03-terre-plate', verdict: MYTHE, niveau: 2, motCle: 'Ératosthène',
    affirmation: 'Au Moyen Âge, les savants pensaient que la Terre était plate.',
    explication: 'Les savants savaient que la Terre est ronde depuis l’Antiquité : le Grec Ératosthène avait même calculé sa taille, il y a plus de 2 200 ans.',
  },
  {
    id: '04-pyramides', verdict: MYTHE, niveau: 1, motCle: 'ouvriers égyptiens',
    affirmation: 'Les pyramides ont été construites par des esclaves.',
    explication: 'Ce sont des ouvriers égyptiens qui les ont bâties, nourris et logés, aidés de paysans qui venaient travailler à tour de rôle. On a retrouvé leurs villages et leurs tombes, au pied des pyramides.',
  },
  {
    id: '05-cleopatre', verdict: HISTOIRE, niveau: 3, motCle: 'plus de 2 500 ans',
    affirmation: 'Cléopâtre a vécu plus près de notre époque que de la construction de la grande pyramide.',
    explication: 'La grande pyramide date d’environ 2560 avant Jésus-Christ, et Cléopâtre est morte en 30 avant Jésus-Christ : plus de 2 500 ans les séparent. Entre Cléopâtre et nous, il y a un peu plus de 2 000 ans.',
  },
  {
    id: '06-gladiateurs', verdict: MYTHE, niveau: 2, motCle: 'gracié',
    affirmation: 'Les combats de gladiateurs finissaient toujours par une mort.',
    explication: 'Former un gladiateur coûtait très cher : beaucoup de combats s’arrêtaient avant, sous l’œil d’un arbitre, et le perdant pouvait être gracié.',
  },
  {
    id: '07-brioche', verdict: MYTHE, niveau: 3, motCle: 'Rousseau',
    affirmation: 'Marie-Antoinette a dit : « Qu’ils mangent de la brioche ! »',
    explication: 'Rien ne prouve qu’elle l’ait dit : la phrase apparaît dans un livre de Jean-Jacques Rousseau, écrit quand Marie-Antoinette était encore une enfant, en Autriche.',
  },
  {
    id: '08-muraille-lune', verdict: MYTHE, niveau: 1, motCle: 'étroite',
    affirmation: 'On voit la Grande Muraille de Chine depuis la Lune à l’œil nu.',
    explication: 'La Grande Muraille est très longue, mais étroite : quelques mètres de large. Depuis la Lune, à 384 000 kilomètres, on ne distingue aucune construction humaine.',
  },
  {
    id: '09-colomb', verdict: MYTHE, niveau: 2, motCle: 'Leif Erikson',
    affirmation: 'Christophe Colomb est le premier Européen arrivé en Amérique.',
    explication: 'Les Vikings de Leif Erikson y étaient arrivés vers l’an 1000, à Terre-Neuve, au Canada : près de 500 ans avant Colomb. Et des peuples vivaient en Amérique depuis bien plus longtemps encore !',
  },
  {
    id: '10-chats', verdict: HISTOIRE, niveau: 1, motCle: 'Bastet',
    affirmation: 'Les Égyptiens momifiaient aussi des chats.',
    explication: 'Des millions de chats ont été momifiés en Égypte, souvent pour être offerts à la déesse Bastet, qu’on représentait avec une tête de chat.',
  },
  {
    id: '11-chevaliers', verdict: MYTHE, niveau: 1, motCle: '20 à 25 kilos',
    affirmation: 'Les chevaliers en armure ne pouvaient pas monter seuls à cheval.',
    explication: 'Une armure pesait de 20 à 25 kilos, bien répartis sur tout le corps : un chevalier montait seul à cheval, et pouvait même courir.',
  },
  {
    id: '12-se-laver', verdict: MYTHE, niveau: 1, motCle: 'étuves',
    affirmation: 'Au Moyen Âge, personne ne se lavait.',
    explication: 'Les villes du Moyen Âge avaient des bains publics, les étuves : on venait s’y laver, et s’y retrouver entre voisins. Paris en comptait des dizaines.',
  },
  {
    id: '13-ordinateur', verdict: HISTOIRE, niveau: 2, motCle: '27 tonnes',
    affirmation: 'Le premier grand ordinateur pesait près de 30 tonnes.',
    explication: 'L’ENIAC, l’un des tout premiers ordinateurs, construit aux États-Unis en 1946, pesait environ 27 tonnes et remplissait une salle entière. Un téléphone d’aujourd’hui calcule des millions de fois plus vite.',
  },
  {
    id: '14-dinosaures', verdict: MYTHE, niveau: 1, motCle: '66 millions',
    affirmation: 'Les premiers humains ont connu les dinosaures.',
    explication: 'Les grands dinosaures ont disparu il y a 66 millions d’années, et les premiers humains sont apparus il y a moins de 3 millions d’années : plus de 60 millions d’années les séparent.',
  },
  {
    id: '15-urine', verdict: HISTOIRE, niveau: 1, motCle: 'foulons',
    affirmation: 'Les Romains lavaient le linge avec de l’urine.',
    explication: 'L’ammoniaque de l’urine nettoyait la laine : les blanchisseurs, les foulons, la récoltaient dans des jarres. L’empereur Vespasien a même fait payer une taxe sur l’urine !',
  },
  {
    id: '16-titanic', verdict: HISTOIRE, niveau: 1, motCle: 'pratiquement insubmersible',
    affirmation: 'On disait le Titanic insubmersible.',
    explication: 'La presse le présentait comme « pratiquement insubmersible ». Il a pourtant coulé lors de son premier voyage, en avril 1912, après avoir heurté un iceberg.',
  },
  {
    id: '17-jeanne', verdict: HISTOIRE, niveau: 2, motCle: 'Rouen',
    affirmation: 'Jeanne d’Arc a été jugée et condamnée à Rouen.',
    explication: 'Faite prisonnière, Jeanne d’Arc a été jugée à Rouen en 1431, puis condamnée au bûcher, à 19 ans.',
  },
  {
    id: '18-grottes', verdict: MYTHE, niveau: 1, motCle: 'campements',
    affirmation: 'Les hommes préhistoriques vivaient tous dans des grottes.',
    explication: 'Ils vivaient surtout dans des campements, sous des tentes de peaux ou dans des huttes ; les grottes servaient d’abri, ou de lieu pour peindre.',
  },
  {
    id: '19-louis-xiv', verdict: HISTOIRE, niveau: 2, motCle: 'plus de 72 ans',
    affirmation: 'Louis XIV a régné plus de 72 ans.',
    explication: 'Il a régné de 1643 à 1715, plus de 72 ans : c’est le plus long règne de l’histoire de France. Il est devenu roi à 4 ans !',
  },
  {
    id: '20-einstein', verdict: MYTHE, niveau: 1, motCle: 'excellent en maths',
    affirmation: 'Einstein était mauvais en maths à l’école.',
    explication: 'Il était excellent en maths : vers 12 ans, il apprenait déjà seul la géométrie. À 16 ans, il a raté un examen d’entrée… à cause des autres matières, pas des maths !',
  },
  {
    id: '21-tour-eiffel', verdict: HISTOIRE, niveau: 2, motCle: 'antenne',
    affirmation: 'La tour Eiffel devait être démontée au bout de 20 ans.',
    explication: 'Elle n’avait été autorisée que pour 20 ans. Elle a été sauvée parce qu’elle servait d’antenne géante pour la radio, qu’on appelait alors la TSF.',
  },
  {
    id: '22-varegues', verdict: HISTOIRE, niveau: 3, motCle: 'garde varangienne',
    affirmation: 'Des Vikings sont allés jusqu’à Constantinople.',
    explication: 'Ils y sont allés en descendant les fleuves de Russie. Certains sont même devenus les gardes du corps de l’empereur byzantin : la garde varangienne.',
  },
  {
    id: '23-30-ans', verdict: MYTHE, niveau: 3, motCle: 'beaucoup d’enfants',
    affirmation: 'Au Moyen Âge, les gens mouraient tous vers 30 ans.',
    explication: 'La moyenne était basse parce que beaucoup d’enfants mouraient très jeunes. Bien des adultes vivaient jusqu’à 60 ou 70 ans.',
  },
  {
    id: '24-chocolat', verdict: HISTOIRE, niveau: 1, motCle: 'cacao',
    affirmation: 'Le chocolat vient d’Amérique.',
    explication: 'Les Mayas et les Aztèques buvaient du cacao, souvent épicé et sans sucre. Les Espagnols l’ont rapporté en Europe au XVIe siècle.',
  },
  {
    id: '25-ninjas', verdict: MYTHE, niveau: 1, motCle: 'théâtre',
    affirmation: 'Les ninjas s’habillaient tout en noir.',
    explication: 'Ce costume noir vient du théâtre japonais, où les machinistes s’habillent en noir pour faire comme s’ils étaient invisibles. Les vrais espions se déguisaient plutôt en paysans ou en marchands.',
  },
  {
    id: '26-onna-musha', verdict: HISTOIRE, niveau: 3, motCle: 'onna-musha',
    affirmation: 'Au Japon, des femmes ont combattu comme les samouraïs.',
    explication: 'On les appelait les onna-musha. La plus célèbre, Tomoe Gozen, est racontée dans les récits d’une grande guerre du XIIe siècle.',
  },
  {
    id: '27-mayas-2012', verdict: MYTHE, niveau: 3, motCle: 'grand cycle',
    affirmation: 'Les Mayas avaient annoncé la fin du monde en 2012.',
    explication: '2012 marquait seulement la fin d’un grand cycle de leur calendrier, comme un compteur qui repart à zéro. Les Mayas n’ont jamais annoncé la fin du monde.',
  },
  {
    id: '28-canopes', verdict: HISTOIRE, niveau: 2, motCle: 'vases canopes',
    affirmation: 'Les Égyptiens gardaient les organes des momies dans des vases.',
    explication: 'Les vases canopes, aux couvercles en forme de têtes de dieux, gardaient l’estomac, le foie, les poumons et les intestins du défunt.',
  },
  {
    id: '29-newton', verdict: MYTHE, niveau: 1, motCle: 'tomber',
    affirmation: 'Newton a compris la gravité en recevant une pomme sur la tête.',
    explication: 'Selon un ami, Newton a vu une pomme tomber dans un jardin, et s’est demandé pourquoi elle tombait toujours tout droit. Elle ne lui est jamais tombée sur la tête !',
  },
  {
    id: '30-jeux-olympiques', verdict: HISTOIRE, niveau: 2, motCle: '776 avant Jésus-Christ',
    affirmation: 'Les premiers Jeux olympiques ont eu lieu il y a plus de 2 700 ans.',
    explication: 'Ils ont eu lieu en 776 avant Jésus-Christ, à Olympie, en Grèce. On y courait le stade, une course d’environ 192 mètres.',
  },
];

/** Ce que dit Salim : les mots du jeu, puis chaque affirmation et son explication. */
export const PHRASES = {
  consigne: 'Vrai fait d’Histoire, ou mythe ? Lis bien, et tranche !',
  bravo: 'Bien vu !',
  dommage: 'Raté !',
  'trop-tard': 'Trop tard !',
  vrai: 'C’est vrai : c’est de l’Histoire.',
  mythe: 'C’est un mythe : une idée reçue.',
  fin: 'Enquête terminée ! Tu sais maintenant démêler le vrai du faux.',
  ...Object.fromEntries(AFFIRMATIONS.flatMap((a) => [
    [`affirmation-${a.id}`, a.affirmation],
    [`explication-${a.id}`, a.explication],
  ])),
};

/** La part de chaque niveau dans une partie, selon l'année : [n1, n2, n3]. */
export function dosage(niveau) {
  const rang = rangDe(niveau);
  if (rang <= 3) return [10, 0, 0];
  if (rang <= 5) return [6, 4, 0];
  if (rang <= 9) return [4, 4, 2];
  return [2, 5, 3];
}

/**
 * LE DÉFI EST « RAPIDE » (catalogue) : un temps par affirmation, en défi
 * seulement — lire, c'est déjà long pour un petit. Null en tranquille.
 */
export function secondesParAffirmation(niveau, defi = false) {
  if (!defi) return null;
  const rang = rangDe(niveau);
  if (rang <= 5) return 20;
  if (rang <= 9) return 15;
  return 12;
}

/** La réponse est-elle juste ? */
export function estJuste(a, choix) {
  return a.verdict === choix;
}

/**
 * L'EXPLICATION EN TROIS MORCEAUX, pour surligner le mot clé : avant, le mot,
 * après. Si le mot n'y est pas (ne devrait jamais arriver), tout est « avant ».
 */
export function decouper(a) {
  const i = a.explication.indexOf(a.motCle);
  if (i < 0) return { avant: a.explication, mot: '', apres: '' };
  return {
    avant: a.explication.slice(0, i),
    mot: a.motCle,
    apres: a.explication.slice(i + a.motCle.length),
  };
}

/**
 * UNE PARTIE : dix affirmations selon le dosage de l'année, au moins trois de
 * chaque verdict, dans un ordre mélangé.
 */
export function serie(graine = Date.now(), niveau = 'CP') {
  const o = outils(graine);
  const [n1, n2, n3] = dosage(niveau);
  const ouvertes = o.melanger(AFFIRMATIONS.filter((a) => (a.niveau === 1) || (a.niveau === 2 && n2 > 0) || (a.niveau === 3 && n3 > 0)));
  const parNiveau = [1, 2, 3].map((n) => o.melanger(AFFIRMATIONS.filter((a) => a.niveau === n)));
  let tirees = [
    ...parNiveau[0].slice(0, n1),
    ...parNiveau[1].slice(0, n2),
    ...parNiveau[2].slice(0, n3),
  ];

  // L'équilibre des verdicts : on échange une affirmation du verdict en trop
  // contre une du verdict qui manque, du même niveau si possible.
  [HISTOIRE, MYTHE].forEach((verdict) => {
    const manque = MINIMUM_PAR_VERDICT - tirees.filter((a) => a.verdict === verdict).length;
    if (manque <= 0) return;
    const entrantes = ouvertes
      .filter((a) => a.verdict === verdict && !tirees.includes(a))
      .sort((a, b) => a.niveau - b.niveau)
      .slice(0, manque);
    const sortantes = tirees.filter((a) => a.verdict !== verdict);
    const echanges = new Map();
    entrantes.forEach((entrante) => {
      const libres = sortantes.filter((a) => !echanges.has(a));
      const sortante = libres.find((a) => a.niveau === entrante.niveau) ?? libres[libres.length - 1];
      if (sortante) echanges.set(sortante, entrante);
    });
    tirees = tirees.map((a) => echanges.get(a) ?? a);
  });

  return o.melanger(tirees);
}
