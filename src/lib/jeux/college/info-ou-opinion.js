/**
 * INFO OU OPINION ? — lire la presse en 4e.
 *
 * COMPÉTENCE DU RÉFÉRENTIEL :
 *   FR_4E_LECT_PRESSE — « Distinguer information, opinion et source dans un
 *                        article »
 *
 * TROIS SORTES DE MANCHES (4 + 2 + 2) :
 *   - INFO OU OPINION ? (4) : une phrase d'article. Une information se
 *     vérifie (un chiffre, une date, un fait) ; une opinion juge, conseille,
 *     préfère. LE PIÈGE : le ton assuré d'une opinion (« sans aucun doute »)
 *     et le chiffre qui fait sérieux ;
 *   - LE MOT QUI JUGE (2) : dans une phrase d'article, le seul mot qui donne
 *     un avis (« absurde », « enfin », « malheureusement ») ;
 *   - LA SOURCE (2) : qui parle, quelle source croire, pourquoi la citer,
 *     l'éditorial, la dépêche d'agence.
 * Les faits cités sont vrais (la Loire, le Rhône) ou inventés et donnés
 * comme tels (un collège, un match) : seul compte qu'on puisse les vérifier.
 */

import { bilan as bilanCommun, outils } from '../outils.js';

export const FAMILLE = { cle: 'info-ou-opinion', titre: 'Info ou opinion ?', matiereCode: 'FRANCAIS' };

export const PAR_CLASSE = {
  QUATRIEME: {
    titre: 'Info ou opinion ?',
    accroche: 'Le fait, l’avis, et qui le dit.',
    competences: ['FR_4E_LECT_PRESSE'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

/** [phrase d'article, 'info' ou 'opinion']. */
export const PHRASES_ARTICLE = [
  ['La tour Eiffel mesure environ 330 mètres de haut.', 'info'],
  ['Le collège Jean-Moulin a accueilli 520 élèves à la rentrée.', 'info'],
  ['Le match s’est terminé sur le score de 2 à 1.', 'info'],
  ['Hier soir, le conseil municipal a voté la fermeture de la piscine pour travaux.', 'info'],
  ['Selon Météo-France, il est tombé 40 millimètres de pluie cette nuit à Brest.', 'info'],
  ['Le ticket de bus passera de 1,70 € à 1,90 € en janvier.', 'info'],
  ['Le festival a lieu chaque année au mois de juillet.', 'info'],
  ['Le Rhône prend sa source en Suisse.', 'info'],
  ['La Loire est le plus long fleuve de France.', 'info'],
  ['Le nouveau gymnase ouvrira ses portes le 3 septembre.', 'info'],
  ['Ce film est le plus beau de l’année.', 'opinion'],
  ['Il faudrait interdire les téléphones dans les cours de récréation.', 'opinion'],
  ['La nouvelle piscine est une vraie réussite.', 'opinion'],
  ['Les élèves ont beaucoup trop de devoirs.', 'opinion'],
  ['Le maire a eu tort de fermer la bibliothèque.', 'opinion'],
  ['Cette chanson est vraiment ennuyeuse.', 'opinion'],
  ['C’est, sans aucun doute, le meilleur joueur de l’équipe.', 'opinion'],
  ['Les vacances d’été sont trop longues.', 'opinion'],
  ['On devrait manger moins de viande.', 'opinion'],
  ['Ce quartier est le plus agréable de la ville.', 'opinion'],
];

/** [phrase, le mot qui juge, deux mots qui ne jugent pas]. */
export const MOTS_QUI_JUGENT = [
  ['Le maire a pris une décision absurde hier soir.', 'absurde', ['maire', 'hier soir']],
  ['Cette exposition magnifique ouvre samedi.', 'magnifique', ['exposition', 'samedi']],
  ['Le ministre a enfin annoncé la baisse des prix.', 'enfin', ['ministre', 'la baisse']],
  ['Malheureusement, le concert a été annulé.', 'Malheureusement', ['le concert', 'annulé']],
  ['Ce joueur talentueux a marqué deux buts.', 'talentueux', ['joueur', 'deux buts']],
  ['Le collège a ouvert une cantine bio, une excellente initiative.', 'excellente', ['cantine', 'bio']],
  ['Des travaux interminables bloquent la rue depuis mars.', 'interminables', ['travaux', 'depuis mars']],
  ['Le jury a récompensé un roman ennuyeux.', 'ennuyeux', ['jury', 'roman']],
  ['Heureusement, personne n’a été blessé.', 'Heureusement', ['personne', 'blessé']],
];

/** [question, bonne réponse, deux choix faux, phrase de l'erreur]. */
export const SOURCES = [
  ['« Selon l’INSEE, la population de la ville a augmenté. » Quelle est la source ?', 'l’INSEE', ['la population', 'la ville'], 'source-qui-parle'],
  ['« D’après le capitaine des pompiers, l’incendie est maîtrisé. » Quelle est la source ?', 'le capitaine des pompiers', ['l’incendie', 'le lecteur'], 'source-qui-parle'],
  ['Pour connaître le nombre d’habitants d’une ville, quelle source est la plus fiable ?', 'les chiffres officiels', ['un commentaire anonyme', 'une rumeur au marché'], 'source-fiable'],
  ['Pourquoi un journaliste cite-t-il ses sources ?', 'pour qu’on puisse vérifier', ['pour allonger l’article', 'pour donner son avis'], 'source-verifier'],
  ['Une information confirmée par plusieurs sources indépendantes est…', 'plus fiable', ['forcément fausse', 'une opinion'], 'source-croiser'],
  ['« Un témoin dit avoir vu un ours dans le village. » Que faire avant de le croire ?', 'vérifier ailleurs', ['le partager tout de suite', 'le croire, c’est écrit'], 'source-croiser'],
  ['Dans un journal, l’éditorial est un texte qui…', 'donne l’opinion du journal', ['donne la météo', 'liste les résultats sportifs'], 'source-editorial'],
  ['Une dépêche de l’AFP, c’est…', 'une information d’une agence de presse', ['un article d’opinion', 'une publicité'], 'source-agence'],
];

export function serie(graine = Date.now()) {
  const { melanger } = outils(graine);

  const nature = [
    ...melanger(PHRASES_ARTICLE.filter(([, n]) => n === 'info')).slice(0, 2),
    ...melanger(PHRASES_ARTICLE.filter(([, n]) => n === 'opinion')).slice(0, 2),
  ].map(([phrase, n]) => ({
    consigne: 'nature',
    question: `« ${phrase} »`,
    bonne: n,
    choix: [{ cle: 'info', libelle: 'Une information' }, { cle: 'opinion', libelle: 'Une opinion' }],
    pieges: n === 'info' ? { opinion: 'info-verifiable' } : { info: 'opinion-jugement' },
    aide: 'nature-regle',
  }));

  const qcm = (consigne, question, bonne, faux, phrase, aide) => ({
    consigne,
    question,
    bonne,
    choix: melanger([bonne, ...faux]).map((c) => ({ cle: c, libelle: c })),
    pieges: Object.fromEntries(faux.map((f) => [f, phrase])),
    ...(aide ? { aide } : {}),
  });

  const mots = melanger(MOTS_QUI_JUGENT).slice(0, 2)
    .map(([phrase, mot, faux]) => qcm('mot-qui-juge', `« ${phrase} »`, mot, faux, 'mot-neutre', 'mot-qui-juge-regle'));
  const sources = melanger(SOURCES).slice(0, 2)
    .map(([question, bonne, faux, phrase]) => qcm('source', question, bonne, faux, phrase));

  return melanger([...nature, ...mots, ...sources]);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  nature: 'Cette phrase donne-t-elle une information, ou une opinion ?',
  'mot-qui-juge': 'Dans cette phrase, quel mot donne un avis ?',
  source: 'Une question sur les sources d’une information.',
  'info-verifiable': 'Cette phrase peut se vérifier : un chiffre, une date, un fait. Même si elle ne te plaît pas, c’est une information.',
  'opinion-jugement': 'Cette phrase juge, conseille ou compare selon un goût : on peut ne pas être d’accord. Même dite avec assurance, c’est une opinion.',
  'nature-regle': 'Demande-toi si l’on peut vérifier la phrase. Si oui, c’est une information ; si l’on peut seulement être d’accord ou non, c’est une opinion.',
  'mot-neutre': 'Ce mot nomme ou situe, sans juger. Cherche le mot qui donne un avis : un adjectif ou un adverbe qui dit si c’est bien ou mal.',
  'mot-qui-juge-regle': 'Enlève le mot : si la phrase devient neutre, c’est lui qui jugeait.',
  'source-qui-parle': 'La source, c’est celui qui donne l’information : on la repère après « selon » ou « d’après ».',
  'source-fiable': 'Une source fiable est connue et vérifiable, comme un organisme officiel. Un message anonyme ou une rumeur ne le sont pas.',
  'source-verifier': 'Citer sa source permet au lecteur de vérifier d’où vient l’information.',
  'source-croiser': 'Avant de croire ou de partager une information, on la vérifie auprès d’autres sources : c’est croiser les sources.',
  'source-editorial': 'L’éditorial est le texte où le journal donne son opinion sur l’actualité : il ne faut pas le lire comme une simple information.',
  'source-agence': 'Une agence de presse, comme l’AFP, envoie aux journaux des informations brèves et vérifiées : des dépêches.',
};
