/**
 * SI J'ÉTAIS… — les trois systèmes hypothétiques en 3e.
 *
 * COMPÉTENCE DU RÉFÉRENTIEL :
 *   FR_3E_LANG_HYPOTHESE — « Construire les trois systèmes hypothétiques avec
 *                           si »
 *
 * LES TROIS SYSTÈMES :
 *   1. si + présent          → futur              (si tu viens, nous irons)
 *   2. si + imparfait        → conditionnel présent (si tu venais, nous irions)
 *   3. si + plus-que-parfait → conditionnel passé  (si tu étais venu, nous
 *                                                    serions allés)
 *
 * TROIS SORTES DE MANCHES (4 + 2 + 2) :
 *   - LA PRINCIPALE (4) : « Si tu venais, nous … au cinéma. » ;
 *   - APRÈS SI (2) : « Si tu …, nous irions au cinéma. » LE PIÈGE : le
 *     conditionnel après si, « si j'aurais » ;
 *   - LA PHRASE CORRECTE (2) : « Si tu avais su… » contre « Si tu aurais su… ».
 *
 * PRUDENCE, PARCE QUE LA LANGUE EST PLUS SOUPLE QUE LA RÈGLE : certains
 * mélanges sont corrects (« si tu étais venu, nous serions heureux »,
 * plus-que-parfait puis conditionnel présent ; « si tu viens, nous allons »,
 * présent puis présent ; « si tu venais, nous allions », l'habitude). Aucun
 * de ces mélanges n'est jamais proposé comme piège : les mauvais choix sont
 * le futur après un imparfait ou un plus-que-parfait, le présent après un
 * imparfait, et le conditionnel après si — tous fautifs sans discussion.
 * Les conjugaisons sont écrites à la main, une par une.
 */

import { bilan as bilanCommun, outils } from '../outils.js';

export const FAMILLE = { cle: 'si-j-etais', titre: 'Si j’étais…', matiereCode: 'FRANCAIS' };

export const PAR_CLASSE = {
  TROISIEME: {
    titre: 'Si j’étais…',
    accroche: 'Les trois systèmes avec « si ».',
    competences: ['FR_3E_LANG_HYPOTHESE'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

/**
 * Une hypothèse :
 *   si: [conjonction, sujet, [présent, imparfait, plus-que-parfait],
 *        [conditionnel présent, conditionnel passé] (les FAUTES), suite]
 *   pr: [sujet, [futur, conditionnel présent, conditionnel passé, présent], suite]
 */
export const HYPOTHESES = [
  { si: ['Si', 'tu', ['viens', 'venais', 'étais venu'], ['viendrais', 'serais venu'], ''], pr: ['nous', ['irons', 'irions', 'serions allés', 'allons'], 'au cinéma'] },
  { si: ['Si', 'vous', ['travaillez', 'travailliez', 'aviez travaillé'], ['travailleriez', 'auriez travaillé'], ''], pr: ['vous', ['réussirez', 'réussiriez', 'auriez réussi', 'réussissez'], 'l’examen'] },
  { si: ['S’il', '', ['pleut', 'pleuvait', 'avait plu'], ['pleuvrait', 'aurait plu'], ''], pr: ['nous', ['resterons', 'resterions', 'serions restés', 'restons'], 'à la maison'] },
  { si: ['Si', 'elle', ['prend', 'prenait', 'avait pris'], ['prendrait', 'aurait pris'], 'le train'], pr: ['elle', ['arrivera', 'arriverait', 'serait arrivée', 'arrive'], 'à l’heure'] },
  { si: ['Si', 'nous', ['partons', 'partions', 'étions partis'], ['partirions', 'serions partis'], 'tôt'], pr: ['nous', ['éviterons', 'éviterions', 'aurions évité', 'évitons'], 'les bouchons'] },
  { si: ['Si', 'tu', ['lis', 'lisais', 'avais lu'], ['lirais', 'aurais lu'], 'ce livre'], pr: ['tu', ['comprendras', 'comprendrais', 'aurais compris', 'comprends'], 'l’histoire'] },
  { si: ['S’ils', '', ['gagnent', 'gagnaient', 'avaient gagné'], ['gagneraient', 'auraient gagné'], 'le match'], pr: ['ils', ['seront', 'seraient', 'auraient été', 'sont'], 'champions'] },
  { si: ['Si', 'on', ['a', 'avait', 'avait eu'], ['aurait', 'aurait eu'], 'le temps'], pr: ['on', ['visitera', 'visiterait', 'aurait visité', 'visite'], 'le musée'] },
  { si: ['Si', 'elle', ['sait', 'savait', 'avait su'], ['saurait', 'aurait su'], 'la réponse'], pr: ['elle', ['lèvera', 'lèverait', 'aurait levé', 'lève'], 'la main'] },
  { si: ['Si', 'nous', ['avons', 'avions', 'avions eu'], ['aurions', 'aurions eu'], 'assez d’argent'], pr: ['nous', ['achèterons', 'achèterions', 'aurions acheté', 'achetons'], 'un vélo'] },
  { si: ['Si', 'tu', ['fais', 'faisais', 'avais fait'], ['ferais', 'aurais fait'], 'attention'], pr: ['tu', ['ne tomberas pas', 'ne tomberais pas', 'ne serais pas tombé', 'ne tombes pas'], ''] },
  { si: ['Si', 'vous', ['êtes', 'étiez', 'aviez été'], ['seriez', 'auriez été'], 'à l’heure'], pr: ['vous', ['verrez', 'verriez', 'auriez vu', 'voyez'], 'le début du film'] },
  { si: ['S’il', '', ['fait', 'faisait', 'avait fait'], ['ferait', 'aurait fait'], 'beau'], pr: ['nous', ['pique-niquerons', 'pique-niquerions', 'aurions pique-niqué', 'pique-niquons'], 'au bord du lac'] },
  { si: ['Si', 'elles', ['courent', 'couraient', 'avaient couru'], ['courraient', 'auraient couru'], 'plus vite'], pr: ['elles', ['attraperont', 'attraperaient', 'auraient attrapé', 'attrapent'], 'le bus'] },
  { si: ['Si', 'tu', ['veux', 'voulais', 'avais voulu'], ['voudrais', 'aurais voulu'], ''], pr: ['je', ['t’aiderai', 't’aiderais', 't’aurais aidé', 't’aide'], ''] },
  { si: ['Si', 'vous', ['m’écoutez', 'm’écoutiez', 'm’aviez écouté'], ['m’écouteriez', 'm’auriez écouté'], ''], pr: ['vous', ['ne vous tromperez pas', 'ne vous tromperiez pas', 'ne vous seriez pas trompés', 'ne vous trompez pas'], ''] },
];

const SYSTEMES = ['systeme-un', 'systeme-deux', 'systeme-trois'];
const FUTUR = 0;
const PRESENT = 3;

const groupe = (...mots) => mots.filter(Boolean).join(' ');
/** La subordonnée : « Si tu viens », « S’il pleut le soir »… */
export const subordonnee = ({ si: [conj, sujet, , , suite] }, verbe) => groupe(conj, sujet, verbe, suite);
/** La principale : « nous irons au cinéma ». */
export const principale = ({ pr: [sujet, , suite] }, verbe) => groupe(sujet, verbe, suite);
/** La phrase entière ; pas de point après un trou final (« tu … »). */
export const phrase = (h, verbeSi, verbePr) => {
  const texte = `${subordonnee(h, verbeSi)}, ${principale(h, verbePr)}`;
  return texte.endsWith('…') ? texte : `${texte}.`;
};

export function serie(graine = Date.now()) {
  const { melanger, entre } = outils(graine);
  const hypotheses = melanger(HYPOTHESES);
  const libres = (bonne, faux) => melanger([bonne, ...faux.map(([f]) => f)]).map((c) => ({ cle: c, libelle: c }));

  // LA PRINCIPALE : le système se choisit, la principale se complète.
  const principales = hypotheses.slice(0, 4).map((h, i) => {
    const s = i < 3 ? i : entre(0, 2);
    const v = h.pr[1];
    // Système 1 : jamais le présent (« si tu viens, nous allons » est juste).
    // Systèmes 2 et 3 : jamais le mélange 2 ↔ 3, qui peut être juste.
    const faux = s === 0 ? [v[1], v[2]] : [v[FUTUR], v[PRESENT]];
    return {
      consigne: 'principale',
      question: phrase(h, h.si[2][s], '…'),
      bonne: v[s === 0 ? FUTUR : s],
      choix: libres(v[s === 0 ? FUTUR : s], faux.map((f) => [f])),
      pieges: Object.fromEntries(faux.map((f) => [f, SYSTEMES[s]])),
      aide: 'principale-regle',
    };
  });

  // APRÈS SI : la principale est donnée, la subordonnée se complète.
  const apresSi = hypotheses.slice(4, 6).map((h) => {
    const s = entre(0, 2);
    const [, , justes, conditionnels] = h.si;
    const verbePr = h.pr[1][s === 0 ? FUTUR : s];
    // L'autre temps faux : l'imparfait pour le système 1, le présent sinon
    // (« si tu venais, nous serions allés » peut être juste : on l'écarte).
    const autre = s === 0 ? justes[1] : justes[0];
    const faux = [[conditionnels[s === 2 ? 1 : 0], 'si-jamais-conditionnel'], [autre, SYSTEMES[s]]];
    return {
      consigne: 'apres-si',
      question: phrase(h, '…', verbePr),
      bonne: justes[s],
      choix: libres(justes[s], faux),
      pieges: Object.fromEntries(faux),
      aide: 'apres-si-regle',
    };
  });

  // LA PHRASE CORRECTE : systèmes 2 et 3, où « si j'aurais » guette.
  const correctes = hypotheses.slice(6, 8).map((h) => {
    const s = entre(1, 2);
    const [, , justes, conditionnels] = h.si;
    const v = h.pr[1];
    const bonne = phrase(h, justes[s], v[s]);
    const faux = [
      [phrase(h, conditionnels[s - 1], v[s]), 'si-jamais-conditionnel'],
      [phrase(h, justes[s], v[FUTUR]), SYSTEMES[s]],
    ];
    return {
      consigne: 'correcte',
      question: 'Laquelle de ces phrases est correcte ?',
      bonne,
      choix: libres(bonne, faux),
      pieges: Object.fromEntries(faux),
      aide: 'correcte-regle',
    };
  });

  return melanger([...principales, ...apresSi, ...correctes]);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  principale: 'Complète la principale : quel temps demande le verbe qui suit « si » ?',
  'apres-si': 'Complète la subordonnée qui commence par « si ».',
  correcte: 'Une seule de ces phrases est correcte : laquelle ?',
  'systeme-un': 'Après « si » au présent, la principale se met au futur : si tu viens, nous irons.',
  'systeme-deux': 'Après « si » à l’imparfait, la principale se met au conditionnel présent : si tu venais, nous irions.',
  'systeme-trois': 'Après « si » au plus-que-parfait, la principale se met au conditionnel passé : si tu étais venu, nous serions allés.',
  'si-jamais-conditionnel': 'Après « si » qui pose une condition, jamais de conditionnel : on ne dit pas « si j’aurais », mais « si j’avais ». Le conditionnel va dans la principale.',
  'principale-regle': 'Regarde le temps après « si » : présent, alors futur ; imparfait, alors conditionnel présent ; plus-que-parfait, alors conditionnel passé.',
  'apres-si-regle': 'Pars de la principale : futur, alors présent après « si » ; conditionnel présent, alors imparfait ; conditionnel passé, alors plus-que-parfait.',
  'correcte-regle': 'Vérifie d’abord le verbe après « si » : jamais de conditionnel. Puis vérifie que la principale va avec lui.',
};
