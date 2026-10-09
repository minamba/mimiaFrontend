/**
 * LE GROUPEMENT DE TEXTES — le français de terminale professionnelle (Adrien).
 *
 * COMPÉTENCES DU RÉFÉRENTIEL :
 *   FR_TPRO_LECT_GROUPEMENT  — « Analyser un groupement de textes et de
 *                               documents autour d'un thème »
 *   FR_TPRO_METH_POINTS_VUE  — « Confronter des points de vue pour construire
 *                               un raisonnement personnel »
 *
 * TROIS SORTES DE MANCHES (2 + 3 + 3) :
 *   - LE THÈME (2) : trois documents (un texte, une image décrite, un
 *     article…) ; quel thème les relie ? LES PIÈGES : le thème trop étroit
 *     (celui d'un seul document), le thème trop vaste ;
 *   - LE POINT DE VUE (3) : quel regard tel document porte-t-il sur
 *     l'enjeu ? Favorable, critique, ou il informe sans juger ;
 *   - RAPPROCHER (3) : deux documents du groupement partagent-ils le même
 *     regard, s'opposent-ils, ou l'un informe-t-il quand l'autre prend
 *     parti ? La bonne réponse est CALCULÉE depuis le regard de chacun.
 * Les documents sont décrits, jamais attribués : aucun auteur, aucun chiffre
 * inventé. Un document qui informe le dit (« sans prendre parti »).
 */

import { bilan as bilanCommun, outils } from '../outils.js';

export const FAMILLE = { cle: 'groupement-textes', titre: 'Le groupement de textes', matiereCode: 'FRANCAIS' };

export const PAR_CLASSE = {
  TERMINALE_PRO: {
    titre: 'Le groupement de textes',
    accroche: 'Relier des documents, croiser les regards.',
    competences: ['FR_TPRO_LECT_GROUPEMENT', 'FR_TPRO_METH_POINTS_VUE'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

export const REGARDS = {
  favorable: 'Un regard favorable',
  critique: 'Un regard critique',
  neutre: 'Il informe sans juger',
};

export const RELATIONS = {
  accord: 'Ils partagent le même regard',
  opposition: 'Ils s’opposent',
  informe: 'L’un informe, l’autre prend parti',
};

/** La relation entre deux regards ; null si les deux informent (jamais dans un même groupement). */
export function relation(a, b) {
  if (a === 'neutre' && b === 'neutre') return null;
  if (a === 'neutre' || b === 'neutre') return 'informe';
  return a === b ? 'accord' : 'opposition';
}

/**
 * Un groupement : son thème, un thème trop étroit, un thème trop vaste,
 * l'enjeu sur lequel chaque document porte un regard, et trois documents.
 */
export const GROUPEMENTS = [
  {
    theme: 'La place des écrans dans nos vies',
    etroit: 'Les repas en famille',
    vaste: 'L’histoire des techniques',
    enjeu: 'les écrans',
    documents: [
      ['Un extrait d’essai : « L’écran n’est pas l’ennemi de la pensée ; il nous ouvre des bibliothèques entières, à condition de savoir y chercher. »', 'favorable'],
      ['Un dessin de presse : une famille à table, chacun le nez sur son téléphone, sans un mot ; au mur, un cadre où l’on lit « Bon appétit ».', 'critique'],
      ['Un article de presse qui présente les résultats d’une enquête sur le temps passé par les adolescents devant les écrans, sans les commenter.', 'neutre'],
    ],
  },
  {
    theme: 'Le sens du travail',
    etroit: 'Le métier d’ébéniste',
    vaste: 'L’économie mondiale',
    enjeu: 'le travail',
    documents: [
      ['Le témoignage d’une ébéniste : « Quand je livre un meuble fini, je sais pourquoi je me suis levée le matin. »', 'favorable'],
      ['Un dessin humoristique : un employé, attaché à son bureau par le câble de son ordinateur, regarde tristement par la fenêtre.', 'critique'],
      ['Un article qui présente l’évolution du nombre d’emplois dans plusieurs secteurs, sans prendre parti.', 'neutre'],
    ],
  },
  {
    theme: 'Vivre en ville',
    etroit: 'Le tourisme',
    vaste: 'La géographie du monde',
    enjeu: 'la ville',
    documents: [
      ['Un extrait d’essai : « La ville nous entasse et nous ignore ; on y croise mille visages sans en regarder aucun. »', 'critique'],
      ['Une affiche de l’office de tourisme : une place animée, des terrasses ensoleillées, et le slogan « Vivez la ville ! ».', 'favorable'],
      ['Un article qui décrit l’évolution de la population des grandes villes, chiffres à l’appui, sans les commenter.', 'neutre'],
    ],
  },
  {
    theme: 'La publicité et son influence',
    etroit: 'Les bonbons',
    vaste: 'L’art',
    enjeu: 'la publicité',
    documents: [
      ['Le témoignage d’un graphiste : « Une belle affiche peut aussi faire réfléchir : certaines campagnes ont changé notre regard sur la sécurité routière. »', 'favorable'],
      ['Un dessin de presse : un enfant, hypnotisé devant une télévision, d’où sortent des mains qui lui tendent des bonbons.', 'critique'],
      ['Un article qui explique comment les règles encadrant la publicité pour les enfants ont évolué, sans prendre position.', 'neutre'],
    ],
  },
  {
    theme: 'L’intelligence artificielle dans nos sociétés',
    etroit: 'La radiographie',
    vaste: 'Les sciences',
    enjeu: 'l’intelligence artificielle',
    documents: [
      ['Un article qui explique simplement comment fonctionne un logiciel capable de rédiger des textes, sans donner d’avis.', 'neutre'],
      ['La tribune d’une médecin : « Ces outils nous aident déjà à lire des radiographies plus vite ; refuser de s’en servir serait une faute. »', 'favorable'],
      ['Un dessin de presse : un robot assis au bureau du professeur, devant une salle de classe vide.', 'critique'],
    ],
  },
  {
    theme: 'Le sport et ses valeurs',
    etroit: 'Les marques de vêtements',
    vaste: 'Les loisirs',
    enjeu: 'le sport',
    documents: [
      ['Le discours d’un entraîneur : « Le sport apprend à perdre, à se relever, à compter sur les autres. »', 'favorable'],
      ['Une caricature : un champion couvert de logos de marques, si nombreux qu’on ne voit plus son visage.', 'critique'],
      ['Un article qui présente le nombre de licenciés de chaque fédération sportive, sans commentaire.', 'neutre'],
    ],
  },
  {
    theme: 'Voyager aujourd’hui',
    etroit: 'Les monuments célèbres',
    vaste: 'Les déplacements humains depuis la Préhistoire',
    enjeu: 'le voyage',
    documents: [
      ['Un extrait de récit de voyage : « Partir, c’est accepter d’être étonné ; chaque rencontre m’a appris un peu plus sur moi-même. »', 'favorable'],
      ['Une photographie de presse, légendée « Le selfie avant tout » : une foule se bouscule, téléphones levés, devant un monument qu’on ne voit plus.', 'critique'],
      ['Un article qui présente l’évolution du nombre de voyageurs internationaux, chiffres à l’appui, sans prendre parti.', 'neutre'],
    ],
  },
  {
    theme: 'Le rôle de l’école',
    etroit: 'Le calendrier scolaire',
    vaste: 'L’éducation dans le monde depuis l’Antiquité',
    enjeu: 'l’école',
    documents: [
      ['Un extrait de roman : le narrateur, au fond de la classe, regarde passer les nuages, persuadé que rien de ce qu’on lui enseigne ne lui servira.', 'critique'],
      ['La tribune d’une enseignante : « L’école reste le seul lieu où chacun, d’où qu’il vienne, peut apprendre gratuitement. »', 'favorable'],
      ['Un article qui présente le calendrier de la prochaine année scolaire, sans commentaire.', 'neutre'],
    ],
  },
  {
    theme: 'Les réseaux sociaux et le lien entre les personnes',
    etroit: 'L’astronomie',
    vaste: 'La communication',
    enjeu: 'les réseaux sociaux',
    documents: [
      ['Un dessin de presse : un adolescent seul dans sa chambre, entouré de centaines de cœurs « J’aime » qui flottent autour de lui.', 'critique'],
      ['Le témoignage d’une lycéenne : « C’est grâce à un groupe en ligne que j’ai trouvé d’autres passionnés d’astronomie près de chez moi. »', 'favorable'],
      ['Un extrait d’essai : « On n’y débat plus, on s’y affronte ; chacun ne lit plus que ceux qui pensent comme lui. »', 'critique'],
    ],
  },
  {
    theme: 'La place de la voiture en ville',
    etroit: 'Les outils de l’artisan',
    vaste: 'Les transports dans le monde',
    enjeu: 'la voiture en ville',
    documents: [
      ['La tribune d’un médecin : « Le bruit et la pollution des voitures abîment notre santé, jour après jour. »', 'critique'],
      ['Une affiche d’association : une rue embouteillée sous un ciel gris, avec la question « Et si on respirait ? ».', 'critique'],
      ['Le témoignage d’un artisan : « Sans ma camionnette, impossible d’apporter mes outils chez mes clients. »', 'favorable'],
    ],
  },
];

const LETTRES = ['A', 'B', 'C'];
const cartes = (liste) => liste.map((c) => ({ cle: c, libelle: c }));
const presenter = (g, indices) => indices.map((i) => `Document ${LETTRES[i]} — ${g.documents[i][0]}`).join('\n');

export function serie(graine = Date.now()) {
  const { melanger } = outils(graine);

  const themes = melanger(GROUPEMENTS).slice(0, 2).map((g) => ({
    consigne: 'theme',
    question: presenter(g, [0, 1, 2]),
    bonne: g.theme,
    choix: cartes(melanger([g.theme, g.etroit, g.vaste])),
    pieges: { [g.etroit]: 'theme-etroit', [g.vaste]: 'theme-vaste' },
    aide: 'theme-regle',
  }));

  const documents = GROUPEMENTS.flatMap((g) => g.documents.map((_, i) => [g, i]));
  const regards = melanger(documents).slice(0, 3).map(([g, i]) => {
    const regard = g.documents[i][1];
    return {
      consigne: 'regard',
      question: `${presenter(g, [i])}\n\nQuel regard ce document porte-t-il sur ${g.enjeu} ?`,
      bonne: regard,
      choix: Object.keys(REGARDS).map((cle) => ({ cle, libelle: REGARDS[cle] })),
      pieges: Object.fromEntries(Object.keys(REGARDS).filter((c) => c !== regard).map((c) => [c, `regard-${regard}`])),
      aide: 'regard-regle',
    };
  });

  const paires = GROUPEMENTS.flatMap((g) => [[0, 1], [0, 2], [1, 2]]
    .filter(([i, j]) => relation(g.documents[i][1], g.documents[j][1]))
    .map(([i, j]) => [g, i, j]));
  const rapprochements = melanger(paires).slice(0, 3).map(([g, i, j]) => {
    const r = relation(g.documents[i][1], g.documents[j][1]);
    return {
      consigne: 'rapprocher',
      question: `${presenter(g, [i, j])}\n\nQue peut-on dire de leurs regards sur ${g.enjeu} ?`,
      bonne: r,
      choix: Object.keys(RELATIONS).map((cle) => ({ cle, libelle: RELATIONS[cle] })),
      pieges: Object.fromEntries(Object.keys(RELATIONS).filter((c) => c !== r).map((c) => [c, `rapprocher-${r}`])),
      aide: 'rapprocher-regle',
    };
  });

  return melanger([...themes, ...regards, ...rapprochements]);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  theme: 'Quel thème relie ces trois documents ?',
  regard: 'Quel regard ce document porte-t-il sur son sujet ?',
  rapprocher: 'Ces deux documents se rapprochent-ils, ou s’opposent-ils ?',

  'theme-etroit': 'Ce thème ne concerne qu’un seul des documents. Le thème d’un groupement est ce que les trois ont en commun.',
  'theme-vaste': 'Ce thème est trop vaste : aucun des documents ne le traite vraiment. Cherche le sujet précis qu’ils partagent tous les trois.',
  'theme-regle': 'Résume chaque document en quelques mots, puis cherche ce qui revient dans les trois : c’est le thème du groupement.',

  'regard-favorable': 'Ce document met son sujet en valeur : des mots élogieux, une image flatteuse, un slogan enthousiaste. Son regard est favorable.',
  'regard-critique': 'Ce document dénonce : l’ironie d’un dessin, une exagération, des mots qui accusent. Son regard est critique.',
  'regard-neutre': 'Ce document donne des faits ou des chiffres sans les juger : il informe, sans prendre parti.',
  'regard-regle': 'Cherche les indices du jugement : les mots qui louent ou qui accusent, l’ironie d’une image. S’il n’y en a aucun, le document informe.',

  'rapprocher-accord': 'Ces deux documents jugent leur sujet de la même façon : leurs regards se rejoignent, même si leurs formes diffèrent.',
  'rapprocher-opposition': 'L’un est favorable, l’autre critique : même sujet, deux regards contraires. Ces documents s’opposent.',
  'rapprocher-informe': 'L’un de ces documents ne juge pas : il informe. On ne peut donc ni l’opposer ni l’associer à l’autre, qui prend parti.',
  'rapprocher-regle': 'Trouve d’abord le regard de chaque document, puis compare-les : le même, des regards contraires, ou un document qui se contente d’informer.',
};
