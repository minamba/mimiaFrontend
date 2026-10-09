/**
 * LE PARTICIPE PASSÉ — ses accords, de la 6e à la 4e.
 * Professeur : Adrien (français).
 *
 * UNE PHRASE À TROU, TROIS FORMES DU MÊME PARTICIPE. Chaque forme fausse
 * porte le nom de l'erreur qu'elle trahit.
 *
 * 6e (3 + 3 + 2, mélangées) :
 *   - AVEC ÊTRE (3) : accord avec le sujet. Pièges : l'oubli de l'accord, le
 *     mauvais genre ou le mauvais nombre ;
 *   - AVEC AVOIR, COD APRÈS (3) : pas d'accord. LES DEUX PIÈGES : accorder
 *     avec le sujet (« Les joueuses ont gagnées ») et accorder avec le COD
 *     placé après (« a écrit des lettres » → « écrites ») ;
 *   - AVEC AVOIR, COD AVANT (2) : accord avec le COD placé avant (« que »,
 *     « les », « l' »). Piège : laisser le participe invariable.
 *
 * 4e — LES VERBES PRONOMINAUX, CAS CLASSIQUES ET SÛRS SEULEMENT (3 + 3 + 2) :
 *   - ACCORD AVEC LE SUJET (3) : « se » est COD (« elles se sont lavées »),
 *     ou le verbe est essentiellement pronominal (s'enfuir, se souvenir,
 *     s'évanouir, se moquer, s'apercevoir de) ;
 *   - COD APRÈS LE VERBE (3) : « elles se sont lavé les mains », « elle s'est
 *     acheté une robe » — invariable ;
 *   - « SE » EST COI (2) : se parler, se téléphoner, se sourire, s'écrire,
 *     se mentir, se succéder, se ressembler — invariable.
 * On écarte volontairement les cas discutés (se plaire, se rendre compte,
 * se laisser + infinitif, se faire + infinitif).
 */

import { bilan as bilanCommun, outils } from '../outils.js';

export const FAMILLE = { cle: 'participe-passe-college', titre: 'Le participe passé', matiereCode: 'FRANCAIS' };

export const PAR_CLASSE = {
  SIXIEME: {
    titre: 'Le participe passé',
    accroche: 'Avec être, avec avoir : accorder ou pas ?',
    competences: ['FR_6E_LANG_PP'],
  },
  QUATRIEME: {
    titre: 'Le participe des pronominaux',
    accroche: 'Se laver, se parler : qui commande l’accord ?',
    competences: ['FR_4E_LANG_PP_PRONOMINAL'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

/** [phrase à trou, bonne forme, [forme fausse, nom de l'erreur]…]. */
const AVEC_ETRE = [
  ['Mes cousines sont ___ hier soir.', 'arrivées', [['arrivé', 'etre-oubli'], ['arrivés', 'etre-genre']]],
  ['Le train est ___ à l’heure.', 'parti', [['partis', 'etre-genre'], ['partie', 'etre-genre']]],
  ['Les oiseaux sont ___ vers le sud.', 'partis', [['parti', 'etre-oubli'], ['parties', 'etre-genre']]],
  ['Ma sœur est ___ en courant.', 'sortie', [['sorti', 'etre-oubli'], ['sorties', 'etre-genre']]],
  ['Les feuilles sont ___ de l’arbre.', 'tombées', [['tombé', 'etre-oubli'], ['tombés', 'etre-genre']]],
  ['Mon père et moi sommes ___ très tard.', 'rentrés', [['rentré', 'etre-oubli'], ['rentrées', 'etre-genre']]],
  ['Les invités sont ___ vers minuit.', 'repartis', [['reparti', 'etre-oubli'], ['reparties', 'etre-genre']]],
  ['La neige est ___ toute la nuit.', 'tombée', [['tombé', 'etre-oubli'], ['tombées', 'etre-genre']]],
  ['Les chats sont ___ sous le lit.', 'restés', [['resté', 'etre-oubli'], ['restées', 'etre-genre']]],
  ['Cette chanson est ___ célèbre.', 'devenue', [['devenu', 'etre-oubli'], ['devenues', 'etre-genre']]],
  ['Mes grands-parents sont ___ en Bretagne.', 'nés', [['né', 'etre-oubli'], ['nées', 'etre-genre']]],
  ['Les filles sont ___ dans la salle.', 'entrées', [['entré', 'etre-oubli'], ['entrés', 'etre-genre']]],
];

const AVOIR_APRES = [
  ['Les enfants ont ___ une tarte.', 'mangé', [['mangés', 'avoir-sujet'], ['mangée', 'avoir-cod-apres']]],
  ['Ma mère a ___ des lettres.', 'écrit', [['écrite', 'avoir-sujet'], ['écrites', 'avoir-cod-apres']]],
  ['Les joueuses ont ___ la finale.', 'gagné', [['gagnées', 'avoir-sujet'], ['gagnée', 'avoir-cod-apres']]],
  ['Elle a ___ ses clés.', 'perdu', [['perdue', 'avoir-sujet'], ['perdues', 'avoir-cod-apres']]],
  ['Mes frères ont ___ des fleurs.', 'cueilli', [['cueillis', 'avoir-sujet'], ['cueillies', 'avoir-cod-apres']]],
  ['Les filles ont ___ leurs livres.', 'ouvert', [['ouvertes', 'avoir-sujet'], ['ouverts', 'avoir-cod-apres']]],
  ['Ma tante a ___ des crêpes.', 'préparé', [['préparée', 'avoir-sujet'], ['préparées', 'avoir-cod-apres']]],
  ['Les garçons ont ___ une cabane.', 'construit', [['construits', 'avoir-sujet'], ['construite', 'avoir-cod-apres']]],
  ['Léa a ___ ses devoirs.', 'fini', [['finie', 'avoir-sujet'], ['finis', 'avoir-cod-apres']]],
  ['Mes sœurs ont ___ une série.', 'regardé', [['regardées', 'avoir-sujet'], ['regardée', 'avoir-cod-apres']]],
  ['Les voisines ont ___ la porte.', 'fermé', [['fermées', 'avoir-sujet'], ['fermée', 'avoir-cod-apres']]],
  ['Les garçons ont ___ une chanson.', 'chanté', [['chantés', 'avoir-sujet'], ['chantée', 'avoir-cod-apres']]],
];

const AVOIR_AVANT = [
  ['Les fleurs que j’ai ___ sentent bon.', 'cueillies', [['cueilli', 'avoir-cod-avant'], ['cueillis', 'cod-avant-genre']]],
  ['Ces lettres, je les ai ___ hier.', 'écrites', [['écrit', 'avoir-cod-avant'], ['écrits', 'cod-avant-genre']]],
  ['La robe qu’elle a ___ est bleue.', 'choisie', [['choisi', 'avoir-cod-avant'], ['choisies', 'cod-avant-genre']]],
  ['Mes clés ? Je les ai ___ dans le jardin.', 'retrouvées', [['retrouvé', 'avoir-cod-avant'], ['retrouvés', 'cod-avant-genre']]],
  ['Les gâteaux que tu as ___ étaient délicieux.', 'préparés', [['préparé', 'avoir-cod-avant'], ['préparées', 'cod-avant-genre']]],
  ['Cette histoire, mon grand-père me l’a ___ cent fois.', 'racontée', [['raconté', 'avoir-cod-avant'], ['racontées', 'cod-avant-genre']]],
  ['Les chansons que nous avons ___ sont anciennes.', 'apprises', [['appris', 'avoir-cod-avant'], ['apprise', 'cod-avant-genre']]],
  ['Les livres que Léa a ___ sont passionnants.', 'lus', [['lu', 'avoir-cod-avant'], ['lues', 'cod-avant-genre']]],
];

const PRONOMINAL_SUJET = [
  ['Elles se sont ___ avant de dîner.', 'lavées', [['lavé', 'pronominal-sujet'], ['lavés', 'pronominal-genre']]],
  ['Les prisonniers se sont ___ pendant la nuit.', 'enfuis', [['enfui', 'pronominal-sujet'], ['enfuies', 'pronominal-genre']]],
  ['Ma grand-mère s’est ___ de son enfance.', 'souvenue', [['souvenu', 'pronominal-sujet'], ['souvenues', 'pronominal-genre']]],
  ['Les enfants se sont ___ dans le parc.', 'amusés', [['amusé', 'pronominal-sujet'], ['amusées', 'pronominal-genre']]],
  ['Léa s’est ___ dans le miroir.', 'regardée', [['regardé', 'pronominal-sujet'], ['regardées', 'pronominal-genre']]],
  ['Elles se sont ___ de leur erreur.', 'aperçues', [['aperçu', 'pronominal-sujet'], ['aperçus', 'pronominal-genre']]],
  ['Les spectatrices se sont ___ en silence.', 'levées', [['levé', 'pronominal-sujet'], ['levés', 'pronominal-genre']]],
  ['La reine s’est ___ en apprenant la nouvelle.', 'évanouie', [['évanoui', 'pronominal-sujet'], ['évanouies', 'pronominal-genre']]],
  ['Mes cousins se sont ___ très tôt.', 'réveillés', [['réveillé', 'pronominal-sujet'], ['réveillées', 'pronominal-genre']]],
  ['Elles se sont ___ de leurs voisins.', 'moquées', [['moqué', 'pronominal-sujet'], ['moqués', 'pronominal-genre']]],
  ['Sophie s’est ___ sur le banc.', 'assise', [['assis', 'pronominal-sujet'], ['assises', 'pronominal-genre']]],
  ['Mes sœurs se sont ___ de bonne heure.', 'couchées', [['couché', 'pronominal-sujet'], ['couchés', 'pronominal-genre']]],
];

const PRONOMINAL_COD_APRES = [
  ['Elles se sont ___ les mains.', 'lavé', [['lavées', 'pronominal-cod-apres'], ['lavés', 'pronominal-cod-apres']]],
  ['Léa s’est ___ le doigt avec un couteau.', 'coupé', [['coupée', 'pronominal-cod-apres'], ['coupées', 'pronominal-cod-apres']]],
  ['Les enfants se sont ___ les dents.', 'brossé', [['brossés', 'pronominal-cod-apres'], ['brossées', 'pronominal-cod-apres']]],
  ['Ma sœur s’est ___ la cheville.', 'tordu', [['tordue', 'pronominal-cod-apres'], ['tordues', 'pronominal-cod-apres']]],
  ['Ils se sont ___ des cadeaux.', 'offert', [['offerts', 'pronominal-cod-apres'], ['offertes', 'pronominal-cod-apres']]],
  ['Elle s’est ___ une jolie robe.', 'acheté', [['achetée', 'pronominal-cod-apres'], ['achetées', 'pronominal-cod-apres']]],
  ['Elles se sont ___ les ongles.', 'coupé', [['coupées', 'pronominal-cod-apres'], ['coupés', 'pronominal-cod-apres']]],
  ['Nos voisines se sont ___ une belle maison.', 'construit', [['construites', 'pronominal-cod-apres'], ['construite', 'pronominal-cod-apres']]],
  ['Ma mère s’est ___ le bras en tombant.', 'cassé', [['cassée', 'pronominal-cod-apres'], ['cassés', 'pronominal-cod-apres']]],
  ['Les filles se sont ___ de longues lettres.', 'écrit', [['écrites', 'pronominal-cod-apres'], ['écrits', 'pronominal-cod-apres']]],
];

const PRONOMINAL_COI = [
  ['Ils se sont ___ pendant des heures.', 'parlé', [['parlés', 'pronominal-coi'], ['parlées', 'pronominal-coi']]],
  ['Les deux amies se sont ___ hier soir.', 'téléphoné', [['téléphonées', 'pronominal-coi'], ['téléphonés', 'pronominal-coi']]],
  ['Elles se sont ___ en se croisant.', 'souri', [['souries', 'pronominal-coi'], ['souris', 'pronominal-coi']]],
  ['Les deux sœurs se sont ___ toute leur vie.', 'écrit', [['écrites', 'pronominal-coi'], ['écrits', 'pronominal-coi']]],
  ['Ils se sont ___ l’un à l’autre.', 'menti', [['mentis', 'pronominal-coi'], ['menties', 'pronominal-coi']]],
  ['Les orateurs se sont ___ à la tribune.', 'succédé', [['succédés', 'pronominal-coi'], ['succédées', 'pronominal-coi']]],
  ['Les deux jumelles se sont toujours ___.', 'ressemblé', [['ressemblées', 'pronominal-coi'], ['ressemblés', 'pronominal-coi']]],
];

const fabriquer = (consigne, regle) => ([question, bonne, fausses], melanger) => ({
  consigne,
  question,
  bonne,
  choix: melanger([bonne, ...fausses.map(([f]) => f)]).map((c) => ({ cle: c, libelle: c })),
  pieges: Object.fromEntries(fausses),
  aide: regle,
});

export const SORTES = {
  SIXIEME: [
    { banque: AVEC_ETRE, nombre: 3, fabriquer: fabriquer('avec-etre', 'etre-oubli') },
    { banque: AVOIR_APRES, nombre: 3, fabriquer: fabriquer('avec-avoir', 'avoir-sujet') },
    { banque: AVOIR_AVANT, nombre: 2, fabriquer: fabriquer('avec-avoir', 'avoir-cod-avant') },
  ],
  QUATRIEME: [
    { banque: PRONOMINAL_SUJET, nombre: 3, fabriquer: fabriquer('pronominal', 'pronominal-sujet') },
    { banque: PRONOMINAL_COD_APRES, nombre: 3, fabriquer: fabriquer('pronominal', 'pronominal-cod-apres') },
    { banque: PRONOMINAL_COI, nombre: 2, fabriquer: fabriquer('pronominal', 'pronominal-coi') },
  ],
};

export function serie(graine = Date.now(), niveau = 'SIXIEME') {
  const { melanger } = outils(graine);
  const sortes = SORTES[niveau] ?? SORTES[CLASSES[0]];
  const liste = sortes.flatMap(({ banque, nombre, fabriquer: f }) => melanger(banque).slice(0, nombre).map((item) => f(item, melanger)));
  return melanger(liste);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  'avec-etre': 'Avec l’auxiliaire être : choisis le participe passé bien accordé.',
  'avec-avoir': 'Avec l’auxiliaire avoir : faut-il accorder le participe passé ? Cherche le COD, et regarde où il est placé.',
  pronominal: 'Un verbe pronominal : choisis le participe passé bien écrit. Demande-toi ce que représente se.',
  'avec-etre-regle': 'Avec être, le participe passé s’accorde avec le sujet, en genre et en nombre.',
  'avec-avoir-regle': 'Avec avoir, le participe passé ne s’accorde jamais avec le sujet ; il s’accorde avec le COD, seulement s’il est placé avant le verbe.',
  'pronominal-regle': 'Avec un verbe pronominal, cherche le COD : s’il est placé avant, le participe s’accorde avec lui ; sinon, il reste invariable.',
  'etre-oubli': 'Avec l’auxiliaire être, le participe passé s’accorde avec le sujet. Cherche qui est-ce qui fait l’action, puis regarde son genre et son nombre.',
  'etre-genre': 'Regarde bien le sujet : est-il masculin ou féminin, singulier ou pluriel ? Le participe prend exactement les mêmes marques.',
  'avoir-sujet': 'Avec l’auxiliaire avoir, le participe passé ne s’accorde jamais avec le sujet. Cherche plutôt le COD, et regarde où il est placé.',
  'avoir-cod-apres': 'Le COD est placé après le verbe : au moment où on écrit le participe, on ne le connaît pas encore. Le participe reste invariable.',
  'avoir-cod-avant': 'Le COD est placé avant le verbe : que, les ou l’ reprennent un nom déjà dit. Le participe s’accorde avec ce nom.',
  'cod-avant-genre': 'Retrouve le nom que reprend le COD placé avant, que, les ou l’ : son genre et son nombre donnent l’accord du participe.',
  'pronominal-sujet': 'Ici, se représente le sujet lui-même, ou le verbe n’existe qu’à la forme pronominale : le participe s’accorde avec le sujet.',
  'pronominal-genre': 'Le participe s’accorde avec le sujet : regarde bien s’il est masculin ou féminin, singulier ou pluriel.',
  'pronominal-cod-apres': 'Le COD est placé après le verbe, comme les mains ou une robe : se n’est pas le COD. Le participe reste invariable.',
  'pronominal-coi': 'Ici, se est un COI : on parle à quelqu’un, on sourit à quelqu’un. Il n’y a pas de COD avant le verbe, le participe reste invariable.',
};
