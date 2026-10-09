/**
 * LA ROUE DES VERBES — la conjugaison au collège, de la 6e à la 3e.
 * Professeur : Adrien (français).
 *
 * Prolonge la roue des verbes du CM2 (`tempsCM2.js`). Toutes les formes sont
 * écrites à la main et relues, verbes irréguliers compris : aucune n'est
 * fabriquée par une règle, qui se tromperait sur « courrai » ou « vînmes ».
 *
 * 6e — LES HUIT TEMPS DE L'INDICATIF (3 + 3 + 2) :
 *   - CONJUGUER (3) : un verbe, un sujet, un temps. Pièges : le passé simple
 *     en -a pour un verbe qui n'est pas en -er (« il viva »), le futur sur
 *     l'infinitif (« je voirai »), un autre temps du même verbe ;
 *   - QUEL TEMPS ? (3) : reconnaître une forme, simple ou composée. Le piège
 *     roi : plus-que-parfait et passé antérieur (l'auxiliaire à l'imparfait
 *     ou au passé simple) ;
 *   - LES TEMPS COMPOSÉS (2) : le bon auxiliaire, et l'accord avec être.
 *
 * 5e — SUBJONCTIF PRÉSENT, FUTUR OU CONDITIONNEL (3 + 3 + 2) :
 *   - LE SUBJONCTIF (3) : après « il faut que », « bien que »… Pièges :
 *     l'indicatif, le mauvais radical, les irréguliers ;
 *   - JE VIENDRAI OU JE VIENDRAIS ? (3) : la certitude au futur, l'hypothèse
 *     et la politesse au conditionnel ; après « si » + présent, le futur ;
 *   - RECONNAÎTRE (2) : futur, conditionnel ou subjonctif.
 *
 * 4e — LA CONCORDANCE DES TEMPS DANS UN RÉCIT AU PASSÉ (3 + 3 + 2) :
 *   - AVANT (3) : l'action antérieure au plus-que-parfait (piège : le passé
 *     composé qui casse le récit) ;
 *   - APRÈS (3) : le futur vu du passé au conditionnel (« il promit qu'il
 *     reviendrait ») ;
 *   - EN MÊME TEMPS (2) : l'imparfait.
 *   Les phrases sont choisies pour qu'un seul temps soit défendable : on ne
 *   propose jamais deux temps qui donneraient chacun une phrase correcte.
 *
 * 3e — LES MODES ET LEUR VALEUR (3 + 3 + 2) :
 *   - QUEL MODE ? (3) : indicatif, subjonctif, conditionnel, impératif,
 *     infinitif, participe ;
 *   - QUELLE VALEUR ? (3) : politesse, information non vérifiée, hypothèse,
 *     futur dans le passé, souhait, doute, ordre, fait réel ;
 *   - LE BON MODE (2) : « après que » + indicatif, « avant que » + subjonctif,
 *     « je pense que » + indicatif.
 */

import { bilan as bilanCommun, outils } from '../outils.js';

export const FAMILLE = { cle: 'roue-des-verbes-college', titre: 'La roue des verbes', matiereCode: 'FRANCAIS' };

export const PAR_CLASSE = {
  SIXIEME: {
    titre: 'La roue des verbes',
    accroche: 'Les huit temps de l’indicatif.',
    competences: ['FR_6E_LANG_INDICATIF'],
  },
  CINQUIEME: {
    titre: 'La roue des verbes',
    accroche: 'Subjonctif, futur ou conditionnel ?',
    competences: ['FR_5E_LANG_SUBJONCTIF', 'FR_5E_LANG_CONDITIONNEL'],
  },
  QUATRIEME: {
    titre: 'La roue des verbes',
    accroche: 'Le récit au passé : la concordance.',
    competences: ['FR_4E_LANG_CONCORDANCE'],
  },
  TROISIEME: {
    titre: 'La roue des verbes',
    accroche: 'Chaque mode a sa valeur.',
    competences: ['FR_3E_LANG_MODES'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

const enChoix = (liste) => liste.map((c) => ({ cle: c, libelle: c }));

/** [question, bonne, [faux, piège], …] → une manche. */
function depuisBanque(melanger, consigne, [question, bonne, ...faux]) {
  return {
    consigne,
    question,
    bonne,
    choix: enChoix(melanger([bonne, ...faux.map(([f]) => f)])),
    pieges: Object.fromEntries(faux),
  };
}

/** Une question à étiquettes fixes : chaque mauvaise étiquette renvoie à la règle de la bonne. */
function classement(consigne, question, bonne, cles, libelles, prefixe) {
  return {
    consigne,
    question,
    bonne,
    choix: cles.map((c) => ({ cle: c, libelle: libelles[c] })),
    pieges: Object.fromEntries(cles.filter((c) => c !== bonne).map((c) => [c, `${prefixe}-${bonne}`])),
  };
}

// ------------------------------------------------------------------ 6e

/** [question, bonne, [faux, piège], [faux, piège]]. */
export const CONJUGUER_6E = [
  ['Nous … (venir) — passé simple', 'nous vînmes', ['nous venâmes', 'ps-en-a'], ['nous venions', 'choisi-imparfait']],
  ['Ils … (prendre) — passé simple', 'ils prirent', ['ils prenèrent', 'ps-en-a'], ['ils prenaient', 'choisi-imparfait']],
  ['Elle … (faire) — passé simple', 'elle fit', ['elle faisa', 'ps-en-a'], ['elle fait', 'choisi-present']],
  ['Il … (vivre) — passé simple', 'il vécut', ['il viva', 'ps-en-a'], ['il vivait', 'choisi-imparfait']],
  ['Tu … (finir) — passé simple', 'tu finis', ['tu finas', 'ps-en-a'], ['tu finissais', 'choisi-imparfait']],
  ['Nous … (avoir) — passé simple', 'nous eûmes', ['nous avâmes', 'ps-en-a'], ['nous avions', 'choisi-imparfait']],
  ['Il … (être) — passé simple', 'il fut', ['il était', 'choisi-imparfait'], ['il a été', 'choisi-passe-compose']],
  ['Je … (voir) — futur simple', 'je verrai', ['je voirai', 'futur-radical'], ['je verrais', 'futur-sans-s']],
  ['Tu … (aller) — futur simple', 'tu iras', ['tu alleras', 'futur-radical'], ['tu allais', 'choisi-imparfait']],
  ['Nous … (courir) — futur simple', 'nous courrons', ['nous courirons', 'futur-radical'], ['nous courons', 'choisi-present']],
  ['Ils … (savoir) — futur simple', 'ils sauront', ['ils savront', 'futur-radical'], ['ils savaient', 'choisi-imparfait']],
  ['Je … (envoyer) — futur simple', 'j’enverrai', ['j’envoierai', 'futur-radical'], ['j’envoyais', 'choisi-imparfait']],
  ['Je … (appeler) — futur simple', 'j’appellerai', ['j’appelerai', 'doubler-consonne'], ['j’appellerais', 'futur-sans-s']],
  ['Vous … (dire) — présent', 'vous dites', ['vous disez', 'present-irregulier'], ['vous direz', 'choisi-futur']],
  ['Ils … (faire) — présent', 'ils font', ['ils faisent', 'present-irregulier'], ['ils feront', 'choisi-futur']],
  ['Je … (pouvoir) — présent', 'je peux', ['je peut', 'terminaison-je'], ['je pourrai', 'choisi-futur']],
  ['Il … (peindre) — présent', 'il peint', ['il peind', 'present-indre'], ['il peignait', 'choisi-imparfait']],
  ['Nous … (manger) — imparfait', 'nous mangions', ['nous mangeions', 'imparfait-sans-e'], ['nous mangeâmes', 'choisi-passe-simple']],
  ['Elles … (lancer) — imparfait', 'elles lançaient', ['elles lancaient', 'cedille'], ['elles lancèrent', 'choisi-passe-simple']],
];

export const TEMPS = ['present', 'imparfait', 'passe-simple', 'futur', 'passe-compose', 'plus-que-parfait', 'passe-anterieur', 'futur-anterieur'];
const NOM_TEMPS = {
  present: 'présent',
  imparfait: 'imparfait',
  'passe-simple': 'passé simple',
  futur: 'futur simple',
  'passe-compose': 'passé composé',
  'plus-que-parfait': 'plus-que-parfait',
  'passe-anterieur': 'passé antérieur',
  'futur-anterieur': 'futur antérieur',
};

/** [forme, son temps, deux temps qui s'en approchent]. */
export const QUEL_TEMPS_6E = [
  ['ils eurent chanté', 'passe-anterieur', 'plus-que-parfait', 'passe-compose'],
  ['il fut sorti', 'passe-anterieur', 'plus-que-parfait', 'passe-simple'],
  ['elle était partie', 'plus-que-parfait', 'passe-anterieur', 'passe-compose'],
  ['j’avais vu', 'plus-que-parfait', 'imparfait', 'passe-compose'],
  ['nous aurons fini', 'futur-anterieur', 'futur', 'plus-que-parfait'],
  ['nous serons arrivés', 'futur-anterieur', 'futur', 'passe-compose'],
  ['elle aura compris', 'futur-anterieur', 'futur', 'passe-compose'],
  ['tu prendras', 'futur', 'present', 'passe-simple'],
  ['je pris', 'passe-simple', 'present', 'passe-compose'],
  ['elles finirent', 'passe-simple', 'futur', 'imparfait'],
  ['vous fûtes', 'passe-simple', 'imparfait', 'passe-anterieur'],
  ['vous chantiez', 'imparfait', 'present', 'passe-simple'],
  ['ils couraient', 'imparfait', 'passe-simple', 'present'],
  ['ils sont venus', 'passe-compose', 'present', 'plus-que-parfait'],
  ['tu as pris', 'passe-compose', 'passe-simple', 'present'],
  ['nous lisons', 'present', 'imparfait', 'futur'],
];

export const COMPOSES_6E = [
  ['Elles … (partir) — passé composé', 'elles sont parties', ['elles ont parti', 'auxiliaire-etre'], ['elles sont parti', 'accord-etre']],
  ['Nous … (arriver) — plus-que-parfait', 'nous étions arrivés', ['nous avions arrivé', 'auxiliaire-etre'], ['nous étions arrivé', 'accord-etre']],
  ['Il … (tomber) — passé antérieur', 'il fut tombé', ['il eut tombé', 'auxiliaire-etre'], ['il était tombé', 'choisi-plus-que-parfait']],
  ['Ils … (manger) — futur antérieur', 'ils auront mangé', ['ils auront mangés', 'accord-avoir'], ['ils avaient mangé', 'choisi-plus-que-parfait']],
  ['Elle … (venir) — futur antérieur', 'elle sera venue', ['elle aura venu', 'auxiliaire-etre'], ['elle sera venu', 'accord-etre']],
  ['Vous … (finir) — plus-que-parfait', 'vous aviez fini', ['vous aviez finis', 'accord-avoir'], ['vous étiez fini', 'auxiliaire-avoir']],
  ['Nous … (voir) — passé antérieur', 'nous eûmes vu', ['nous eûmes vus', 'accord-avoir'], ['nous avions vu', 'choisi-plus-que-parfait']],
  ['Elles … (rester) — plus-que-parfait', 'elles étaient restées', ['elles avaient resté', 'auxiliaire-etre'], ['elles étaient resté', 'accord-etre']],
  ['Ils … (aller) — futur antérieur', 'ils seront allés', ['ils auront allé', 'auxiliaire-etre'], ['ils seront allé', 'accord-etre']],
  ['Elle … (prendre) — passé composé', 'elle a pris', ['elle est prise', 'auxiliaire-avoir'], ['elle a prise', 'accord-avoir']],
];

function sixieme({ melanger }) {
  const liste = [];
  melanger(CONJUGUER_6E).slice(0, 3).forEach((e) => liste.push(depuisBanque(melanger, 'conjuguer-6e', e)));
  melanger(QUEL_TEMPS_6E).slice(0, 3).forEach(([forme, bonne, a, b]) => {
    liste.push(classement('quel-temps-6e', `« ${forme} »`, bonne, melanger([bonne, a, b]), NOM_TEMPS, 'reconnaitre'));
  });
  melanger(COMPOSES_6E).slice(0, 2).forEach((e) => liste.push(depuisBanque(melanger, 'temps-compose-6e', e)));
  return melanger(liste);
}

// ------------------------------------------------------------------ 5e

export const SUBJONCTIF_5E = [
  ['Il faut que tu … (faire) tes devoirs.', 'fasses', ['fais', 'subj-indicatif'], ['faisses', 'subj-irregulier']],
  ['Il faut que tu … (aller) chez le dentiste.', 'ailles', ['vas', 'subj-indicatif'], ['alles', 'subj-irregulier']],
  ['Je veux que vous … (venir) ce soir.', 'veniez', ['venez', 'subj-indicatif'], ['viendrez', 'subj-indicatif']],
  ['Il faut que nous … (aller) au CDI.', 'allions', ['allons', 'subj-indicatif'], ['aillions', 'subj-nous']],
  ['Je souhaite qu’elle … (être) là demain.', 'soit', ['est', 'subj-indicatif'], ['sera', 'subj-indicatif']],
  ['Il faut qu’ils … (avoir) du courage.', 'aient', ['ont', 'subj-indicatif'], ['ayent', 'subj-irregulier']],
  ['Bien qu’il … (pleuvoir), nous sortons.', 'pleuve', ['pleut', 'subj-indicatif'], ['pleuvra', 'subj-indicatif']],
  ['Il faut que je … (prendre) le bus.', 'prenne', ['prends', 'subj-indicatif'], ['prende', 'subj-radical']],
  ['Je voudrais que tu … (savoir) la vérité.', 'saches', ['sais', 'subj-indicatif'], ['sauras', 'subj-indicatif']],
  ['Il faut que vous … (finir) ce travail.', 'finissiez', ['finissez', 'subj-indicatif'], ['finiez', 'subj-radical']],
  ['Pour que tu … (pouvoir) venir, je t’attends.', 'puisses', ['peux', 'subj-indicatif'], ['pourras', 'subj-indicatif']],
  ['Il faut qu’il … (dire) la vérité.', 'dise', ['dit', 'subj-indicatif'], ['dira', 'subj-indicatif']],
  ['J’aimerais qu’ils … (voir) ce film.', 'voient', ['voyent', 'subj-radical'], ['verront', 'subj-indicatif']],
  ['Il faut que nous … (croire) en nous.', 'croyions', ['croyons', 'subj-indicatif'], ['croirons', 'subj-indicatif']],
];

export const FUTUR_CONDITIONNEL_5E = [
  ['Demain, je … (venir) te voir.', 'viendrai', ['viendrais', 'cond-futur-certain']],
  ['Si j’avais le temps, je … (venir) te voir.', 'viendrais', ['viendrai', 'cond-hypothese']],
  ['Je … (vouloir) un verre d’eau, s’il vous plaît.', 'voudrais', ['voudrai', 'cond-politesse']],
  ['Je … (souhaiter) parler au directeur, s’il vous plaît.', 'souhaiterais', ['souhaiterai', 'cond-politesse']],
  ['Quand je serai grand, je … (être) pilote.', 'serai', ['serais', 'cond-futur-certain']],
  ['L’an prochain, ils … (aller) au lycée.', 'iront', ['iraient', 'cond-futur-certain']],
  ['Dans deux jours, je … (savoir) mes résultats.', 'saurai', ['saurais', 'cond-futur-certain']],
  ['Au cas où il pleuvrait, nous … (rester) à la maison.', 'resterions', ['resterons', 'cond-hypothese']],
  ['Nous … (aimer) partir loin, si nous le pouvions.', 'aimerions', ['aimerons', 'cond-hypothese']],
  ['Si elle avait des ailes, elle … (voler).', 'volerait', ['volera', 'cond-hypothese']],
  ['Si vous m’écoutiez, vous … (comprendre).', 'comprendriez', ['comprendrez', 'cond-hypothese']],
  ['Si tu travailles, tu … (réussir).', 'réussiras', ['réussirais', 'cond-si-present']],
  ['S’il fait beau demain, nous … (faire) un pique-nique.', 'ferons', ['ferions', 'cond-si-present']],
];

const NOM_FORMES = { futur: 'futur', conditionnel: 'conditionnel', subjonctif: 'subjonctif présent' };

/** [forme, futur, conditionnel ou subjonctif]. */
export const RECONNAITRE_5E = [
  ['nous chanterions', 'conditionnel'],
  ['nous chanterons', 'futur'],
  ['qu’ils viennent', 'subjonctif'],
  ['je finirais', 'conditionnel'],
  ['je finirai', 'futur'],
  ['que tu fasses', 'subjonctif'],
  ['ils prendraient', 'conditionnel'],
  ['ils prendront', 'futur'],
  ['que nous soyons', 'subjonctif'],
  ['vous verriez', 'conditionnel'],
  ['vous verrez', 'futur'],
  ['qu’elle puisse', 'subjonctif'],
];

function cinquieme({ melanger }) {
  const liste = [];
  melanger(SUBJONCTIF_5E).slice(0, 3).forEach((e) => liste.push(depuisBanque(melanger, 'subjonctif-5e', e)));
  melanger(FUTUR_CONDITIONNEL_5E).slice(0, 3).forEach((e) => liste.push(depuisBanque(melanger, 'futur-conditionnel-5e', e)));
  melanger(RECONNAITRE_5E).slice(0, 2).forEach(([forme, bonne]) => {
    liste.push(classement('reconnaitre-5e', `« ${forme} »`, bonne, ['futur', 'conditionnel', 'subjonctif'], NOM_FORMES, 'forme'));
  });
  return melanger(liste);
}

// ------------------------------------------------------------------ 4e

/** L'action est ANTÉRIEURE : plus-que-parfait. */
export const AVANT_4E = [
  ['Il retrouva enfin le livre qu’il … (perdre) la veille.', 'avait perdu', ['a perdu', 'avant-passe-compose'], ['perdra', 'avant-futur']],
  ['Elle était épuisée, car elle … (marcher) toute la nuit.', 'avait marché', ['a marché', 'avant-passe-compose'], ['marchera', 'avant-futur']],
  ['Quand nous arrivâmes, les invités … (partir) depuis longtemps.', 'étaient partis', ['sont partis', 'avant-passe-compose'], ['partiront', 'avant-futur']],
  ['Le chevalier montra le bouclier qu’il … (recevoir) de son père.', 'avait reçu', ['a reçu', 'avant-passe-compose'], ['recevra', 'avant-futur']],
  ['Il comprit qu’il … (se tromper) de chemin.', 's’était trompé', ['s’est trompé', 'avant-passe-compose'], ['se trompera', 'avant-futur']],
  ['Ils mangèrent le pain qu’ils … (acheter) le matin.', 'avaient acheté', ['ont acheté', 'avant-passe-compose'], ['achèteront', 'avant-futur']],
  ['Le village semblait vide : ses habitants … (partir) l’hiver précédent.', 'étaient partis', ['sont partis', 'avant-passe-compose'], ['partiront', 'avant-futur']],
  ['Elle relut le message que son ami lui … (écrire).', 'avait écrit', ['a écrit', 'avant-passe-compose'], ['écrira', 'avant-futur']],
  ['Nous reconnûmes l’homme que nous … (croiser) au marché.', 'avions croisé', ['avons croisé', 'avant-passe-compose'], ['croiserons', 'avant-futur']],
  ['Tom raconta le rêve qu’il … (faire) cette nuit-là.', 'avait fait', ['a fait', 'avant-passe-compose'], ['fera', 'avant-futur']],
  ['Le chien grelottait : il … (rester) dehors toute la nuit.', 'était resté', ['est resté', 'avant-passe-compose'], ['restera', 'avant-futur']],
];

/** L'action est À VENIR, vue du passé : conditionnel présent. */
export const APRES_4E = [
  ['Il promit qu’il … (revenir) le lendemain.', 'reviendrait', ['reviendra', 'apres-futur'], ['revient', 'apres-present']],
  ['Elle savait que la tempête … (arriver) dans la nuit.', 'arriverait', ['arrivera', 'apres-futur'], ['arrive', 'apres-present']],
  ['Ils annoncèrent qu’ils … (partir) à l’aube.', 'partiraient', ['partiront', 'apres-futur'], ['partent', 'apres-present']],
  ['Le devin prédit que le roi … (mourir) avant l’hiver.', 'mourrait', ['mourra', 'apres-futur'], ['meurt', 'apres-present']],
  ['Je pensais que tu … (venir) le lendemain.', 'viendrais', ['viendras', 'apres-futur'], ['viens', 'apres-present']],
  ['Nous espérions qu’il … (faire) beau le jour suivant.', 'ferait', ['fera', 'apres-futur'], ['fait', 'apres-present']],
  ['Le capitaine jura qu’il … (retrouver) le trésor.', 'retrouverait', ['retrouvera', 'apres-futur'], ['retrouve', 'apres-present']],
  ['Elle comprit qu’elle ne … (pouvoir) jamais oublier ce jour.', 'pourrait', ['pourra', 'apres-futur'], ['peut', 'apres-present']],
  ['Il était sûr que son équipe … (gagner) la finale du lendemain.', 'gagnerait', ['gagnera', 'apres-futur'], ['gagne', 'apres-present']],
  ['Le guide assura que nous … (voir) bientôt la mer.', 'verrions', ['verrons', 'apres-futur'], ['voyons', 'apres-present']],
  ['Mes parents décidèrent que nous … (aller) en Bretagne l’été suivant.', 'irions', ['irons', 'apres-futur'], ['allons', 'apres-present']],
];

/** L'action a lieu EN MÊME TEMPS : imparfait. */
export const PENDANT_4E = [
  ['Il vit que la porte … (être) ouverte.', 'était', ['est', 'pendant-present'], ['sera', 'pendant-futur']],
  ['Elle remarqua que l’enfant … (pleurer).', 'pleurait', ['pleure', 'pendant-present'], ['pleurera', 'pendant-futur']],
  ['Nous sentîmes que le sol … (trembler).', 'tremblait', ['tremble', 'pendant-present'], ['tremblera', 'pendant-futur']],
  ['Ils entendirent que quelqu’un … (frapper) à la porte.', 'frappait', ['frappe', 'pendant-present'], ['frappera', 'pendant-futur']],
  ['Je crus qu’il … (dormir).', 'dormait', ['dort', 'pendant-present'], ['dormira', 'pendant-futur']],
  ['Tu remarquas que ton voisin … (tricher).', 'trichait', ['triche', 'pendant-present'], ['trichera', 'pendant-futur']],
  ['Le roi apprit que son peuple … (souffrir) de la faim.', 'souffrait', ['souffre', 'pendant-present'], ['souffrira', 'pendant-futur']],
  ['Le marin vit que la mer … (grossir) à vue d’œil.', 'grossissait', ['grossit', 'pendant-present'], ['grossira', 'pendant-futur']],
];

function quatrieme({ melanger }) {
  const liste = [];
  melanger(AVANT_4E).slice(0, 3).forEach((e) => liste.push(depuisBanque(melanger, 'concordance-4e', e)));
  melanger(APRES_4E).slice(0, 3).forEach((e) => liste.push(depuisBanque(melanger, 'concordance-4e', e)));
  melanger(PENDANT_4E).slice(0, 2).forEach((e) => liste.push(depuisBanque(melanger, 'concordance-4e', e)));
  return melanger(liste);
}

// ------------------------------------------------------------------ 3e

const NOM_MODES = {
  indicatif: 'indicatif',
  subjonctif: 'subjonctif',
  conditionnel: 'conditionnel',
  imperatif: 'impératif',
  infinitif: 'infinitif',
  participe: 'participe',
};

/** [phrase, verbe entre crochets : son mode, deux modes voisins]. */
export const QUEL_MODE_3E = [
  ['Il faut que tu [viennes].', 'subjonctif', 'indicatif', 'imperatif'],
  ['Bien qu’il [soit] malade, il travaille.', 'subjonctif', 'indicatif', 'conditionnel'],
  ['Je doute qu’elle [puisse] venir.', 'subjonctif', 'indicatif', 'conditionnel'],
  ['[Viens] avec moi !', 'imperatif', 'indicatif', 'subjonctif'],
  ['[Prenez] vos cahiers.', 'imperatif', 'indicatif', 'subjonctif'],
  ['Si j’étais riche, je [voyagerais].', 'conditionnel', 'indicatif', 'subjonctif'],
  ['Je [voudrais] un renseignement.', 'conditionnel', 'indicatif', 'subjonctif'],
  ['Je sais qu’il [viendra].', 'indicatif', 'conditionnel', 'subjonctif'],
  ['Nous [partions] tous les étés en Bretagne.', 'indicatif', 'conditionnel', 'subjonctif'],
  ['Elle aime [lire] le soir.', 'infinitif', 'indicatif', 'participe'],
  ['Il est parti sans [dire] au revoir.', 'infinitif', 'participe', 'indicatif'],
  ['Le chat, [effrayé], s’enfuit.', 'participe', 'indicatif', 'infinitif'],
  ['Les élèves, [arrivés] en retard, attendent.', 'participe', 'indicatif', 'infinitif'],
];

const NOM_VALEURS = {
  reel: 'un fait réel',
  souhait: 'un souhait, une volonté',
  doute: 'un doute',
  politesse: 'une demande polie',
  rumeur: 'une information non vérifiée',
  hypothese: 'un fait imaginé',
  'futur-passe': 'un futur vu du passé',
  ordre: 'un ordre, un conseil',
};

/** [phrase, valeur du verbe entre crochets, deux valeurs voisines]. */
export const VALEUR_3E = [
  ['Je [voudrais] un renseignement, s’il vous plaît.', 'politesse', 'hypothese', 'rumeur'],
  ['[Pourriez]-vous m’aider, s’il vous plaît ?', 'politesse', 'ordre', 'rumeur'],
  ['Selon la presse, le ministre [serait] malade.', 'rumeur', 'politesse', 'futur-passe'],
  ['D’après les témoins, le voleur [aurait fui] par la fenêtre.', 'rumeur', 'hypothese', 'futur-passe'],
  ['Si j’avais des ailes, je [volerais] jusqu’à toi.', 'hypothese', 'politesse', 'rumeur'],
  ['Si tu m’avais écouté, tu [aurais réussi].', 'hypothese', 'rumeur', 'politesse'],
  ['Il annonça qu’il [partirait] le lendemain.', 'futur-passe', 'rumeur', 'hypothese'],
  ['Elle croyait que l’orage [éclaterait] dans la soirée.', 'futur-passe', 'hypothese', 'rumeur'],
  ['Je souhaite que tu [réussisses].', 'souhait', 'reel', 'ordre'],
  ['Pourvu qu’il [fasse] beau demain !', 'souhait', 'reel', 'ordre'],
  ['Je doute qu’il [vienne] ce soir.', 'doute', 'reel', 'souhait'],
  ['Il est possible qu’elle [soit] en retard.', 'doute', 'reel', 'ordre'],
  ['[Range] ta chambre avant ce soir.', 'ordre', 'souhait', 'reel'],
  ['[Soyez] prudents sur la route.', 'ordre', 'souhait', 'reel'],
  ['La Terre [tourne] autour du Soleil.', 'reel', 'ordre', 'hypothese'],
  ['Je sais qu’elle [a réussi] son examen.', 'reel', 'doute', 'souhait'],
];

export const CHOISIR_MODE_3E = [
  ['Avant qu’il … (partir), dis-lui au revoir.', 'parte', ['part', 'choisir-subjonctif'], ['partira', 'choisir-subjonctif']],
  ['Après qu’il … (partir), nous rangeons la salle.', 'est parti', ['soit parti', 'choisir-indicatif'], ['parte', 'choisir-indicatif']],
  ['Bien qu’elle … (être) fatiguée, elle continue.', 'soit', ['est', 'choisir-subjonctif'], ['serait', 'choisir-subjonctif']],
  ['Il faut que vous … (être) à l’heure.', 'soyez', ['êtes', 'choisir-subjonctif'], ['seriez', 'choisir-subjonctif']],
  ['Je pense qu’il … (avoir) raison.', 'a', ['ait', 'choisir-indicatif'], ['ayant', 'choisir-conjugue']],
  ['Elle est partie sans que je la … (voir).', 'voie', ['vois', 'choisir-subjonctif'], ['voyant', 'choisir-conjugue']],
  ['Pour que tout le monde … (entendre), parle fort.', 'entende', ['entend', 'choisir-subjonctif'], ['entendra', 'choisir-subjonctif']],
  ['Puisque tu … (être) là, aide-moi.', 'es', ['sois', 'choisir-indicatif'], ['être', 'choisir-conjugue']],
  ['Je suis sûr qu’elle … (venir).', 'viendra', ['vienne', 'choisir-indicatif'], ['venir', 'choisir-conjugue']],
  ['Je veux que tu … (faire) attention.', 'fasses', ['fais', 'choisir-subjonctif'], ['ferais', 'choisir-subjonctif']],
  ['Je doute qu’il … (pouvoir) venir.', 'puisse', ['peut', 'choisir-subjonctif'], ['pourra', 'choisir-subjonctif']],
];

function troisieme({ melanger }) {
  const liste = [];
  melanger(QUEL_MODE_3E).slice(0, 3).forEach(([phrase, bonne, a, b]) => {
    liste.push(classement('quel-mode-3e', phrase, bonne, melanger([bonne, a, b]), NOM_MODES, 'mode'));
  });
  melanger(VALEUR_3E).slice(0, 3).forEach(([phrase, bonne, a, b]) => {
    liste.push(classement('valeur-3e', phrase, bonne, melanger([bonne, a, b]), NOM_VALEURS, 'valeur'));
  });
  melanger(CHOISIR_MODE_3E).slice(0, 2).forEach((e) => liste.push(depuisBanque(melanger, 'choisir-mode-3e', e)));
  return melanger(liste);
}

// ------------------------------------------------------------------ le jeu

const PAR_NIVEAU = {
  SIXIEME: sixieme, CINQUIEME: cinquieme, QUATRIEME: quatrieme, TROISIEME: troisieme,
};

export function serie(graine = Date.now(), niveau = CLASSES[0]) {
  const fabrique = PAR_NIVEAU[niveau] ?? PAR_NIVEAU[CLASSES[0]];
  return fabrique(outils(graine));
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  // 6e — les consignes
  'conjuguer-6e': 'Conjugue ce verbe au temps demandé.',
  'conjuguer-6e-regle': 'Repère le temps demandé, puis cherche le radical du verbe et la terminaison de ce temps.',
  'quel-temps-6e': 'À quel temps de l’indicatif ce verbe est-il conjugué ?',
  'quel-temps-6e-regle': 'Compte les mots : un seul, c’est un temps simple ; deux, un temps composé. Puis regarde la terminaison, ou le temps de l’auxiliaire.',
  'temps-compose-6e': 'Conjugue ce verbe à ce temps composé : choisis bien l’auxiliaire.',
  'temps-compose-6e-regle': 'Un temps composé, c’est l’auxiliaire être ou avoir, puis le participe passé. Avec être, le participe s’accorde avec le sujet.',
  // 6e — les erreurs
  'choisi-present': 'Ça, c’est le présent. Relis le temps demandé, et cherche ses terminaisons.',
  'choisi-imparfait': 'Ça, c’est l’imparfait, avec ses terminaisons en -ais, -ait, -ions. Relis le temps demandé.',
  'choisi-futur': 'Ça, c’est le futur simple, avec le r avant la terminaison. Relis le temps demandé.',
  'choisi-passe-simple': 'Ça, c’est le passé simple. Relis le temps demandé.',
  'choisi-passe-compose': 'Ça, c’est le passé composé : l’auxiliaire au présent. Relis le temps demandé.',
  'choisi-plus-que-parfait': 'Ça, c’est le plus-que-parfait : l’auxiliaire à l’imparfait. Relis le temps demandé.',
  'ps-en-a': 'Le passé simple en -a, -âmes, -èrent, c’est seulement pour les verbes en -er. Les autres prennent i, u ou in : il prit, il courut, il vint.',
  'futur-radical': 'Au futur, certains verbes changent de radical : j’irai, je verrai, je courrai, je saurai. Ceux-là s’apprennent par cœur.',
  'futur-sans-s': 'Avec je, le futur se termine par -rai, sans s. Avec un s, c’est le conditionnel.',
  'doubler-consonne': 'Appeler et jeter doublent leur consonne devant un e muet : j’appellerai, je jetterai.',
  'present-irregulier': 'Ce verbe est irrégulier au présent : vous dites, vous faites, ils font. Ces formes s’apprennent par cœur.',
  'terminaison-je': 'Avec je, la terminaison est -s ou -x, jamais -t : je peux, je veux.',
  'present-indre': 'Les verbes en -indre perdent leur d au présent : il peint, il craint, il joint.',
  'imparfait-sans-e': 'Devant i, le g se prononce déjà comme j : pas besoin de e. Nous mangions.',
  cedille: 'Devant a et o, le c prend une cédille pour garder le son s : elles lançaient.',
  'reconnaitre-present': 'Un seul mot, et l’action se passe maintenant : c’est le présent.',
  'reconnaitre-imparfait': 'Un seul mot, qui se termine comme « je chantais », « nous chantions » ou « ils chantaient » : c’est l’imparfait.',
  'reconnaitre-passe-simple': 'Un seul mot, avec les terminaisons du récit : -a, -it, -ut, -int, -èrent, -irent. C’est le passé simple.',
  'reconnaitre-futur': 'Un seul mot, avec le r avant la terminaison : -rai, -ras, -ra, -rons. C’est le futur simple.',
  'reconnaitre-passe-compose': 'Deux mots : l’auxiliaire au présent, puis le participe passé. C’est le passé composé.',
  'reconnaitre-plus-que-parfait': 'Deux mots : l’auxiliaire à l’imparfait, puis le participe passé. C’est le plus-que-parfait.',
  'reconnaitre-passe-anterieur': 'Deux mots : l’auxiliaire au passé simple, puis le participe passé. C’est le passé antérieur.',
  'reconnaitre-futur-anterieur': 'Deux mots : l’auxiliaire au futur, puis le participe passé. C’est le futur antérieur.',
  'auxiliaire-etre': 'Ce verbe se conjugue avec l’auxiliaire être aux temps composés : il est parti, elle est venue.',
  'auxiliaire-avoir': 'Ce verbe se conjugue avec l’auxiliaire avoir aux temps composés : vous aviez fini, elle a pris.',
  'accord-etre': 'Avec être, le participe passé s’accorde avec le sujet : elles sont parties.',
  'accord-avoir': 'Avec avoir, le participe passé ne s’accorde pas avec le sujet : ils ont mangé.',

  // 5e
  'subjonctif-5e': 'Complète la phrase avec le verbe au subjonctif présent.',
  'subjonctif-5e-regle': 'Le subjonctif présent se forme sur le radical de ils au présent, avec les terminaisons -e, -es, -e, -ions, -iez, -ent.',
  'futur-conditionnel-5e': 'Futur ou conditionnel ? Choisis la bonne forme.',
  'futur-conditionnel-5e-regle': 'Le futur dit ce qui arrivera à coup sûr. Le conditionnel dit ce qui est imaginé, soumis à une condition, ou demandé poliment.',
  'reconnaitre-5e': 'Futur, conditionnel ou subjonctif : reconnais cette forme.',
  'reconnaitre-5e-regle': 'Le futur et le conditionnel ont le r avant la terminaison ; le subjonctif est annoncé par que.',
  'subj-indicatif': 'Après « il faut que », un souhait, une volonté, « pour que » ou « bien que », le verbe se met au subjonctif : que tu fasses, qu’il vienne.',
  'subj-radical': 'Le subjonctif se forme sur le radical de ils au présent : ils prennent, que je prenne ; ils finissent, que vous finissiez.',
  'subj-nous': 'Avec nous et vous, le subjonctif ressemble à l’imparfait : que nous allions, que vous veniez.',
  'subj-irregulier': 'Être, avoir, aller, faire, pouvoir et savoir ont un subjonctif irrégulier, à savoir par cœur : que je sois, que j’aie, que j’aille, que je fasse.',
  'cond-futur-certain': 'L’action aura lieu, c’est sûr : c’est le futur, sans la terminaison de l’imparfait.',
  'cond-hypothese': 'Après « si » et l’imparfait, ou quand l’action est seulement imaginée, on emploie le conditionnel : le r du futur, puis la terminaison de l’imparfait.',
  'cond-politesse': 'Pour demander poliment, on emploie le conditionnel : je voudrais, je souhaiterais.',
  'cond-si-present': 'Après « si » suivi du présent, la suite se met au futur : si tu travailles, tu réussiras.',
  'forme-futur': 'Le r, puis -ai, -as, -a, -ons, -ez, -ont : c’est le futur.',
  'forme-conditionnel': 'Le r du futur, puis la terminaison de l’imparfait, comme dans « je chanterais » ou « nous chanterions » : c’est le conditionnel.',
  'forme-subjonctif': 'La forme est annoncée par que, sans le r du futur : c’est le subjonctif présent.',

  // 4e
  'concordance-4e': 'Le récit est au passé : choisis le verbe qui respecte la concordance des temps.',
  'concordance-4e-regle': 'Dans un récit au passé, une action antérieure se met au plus-que-parfait, une action simultanée à l’imparfait, une action à venir au conditionnel présent.',
  'avant-passe-compose': 'Dans un récit au passé, le passé composé casse la concordance. Une action terminée avant se met au plus-que-parfait : il avait perdu.',
  'avant-futur': 'Cette action s’est passée avant celle du récit : on emploie le plus-que-parfait, avec l’auxiliaire à l’imparfait.',
  'apres-futur': 'Dans un récit au passé, un futur vu depuis le passé se met au conditionnel présent : il promit qu’il reviendrait.',
  'apres-present': 'Le présent casse le récit au passé. Une action à venir, vue depuis le passé, se met au conditionnel présent.',
  'pendant-present': 'Le présent casse le récit au passé. Une action qui se passe en même temps se met à l’imparfait.',
  'pendant-futur': 'L’action se passe en même temps que celle du récit : pas de futur, mais l’imparfait.',

  // 3e
  'quel-mode-3e': 'À quel mode est le verbe entre crochets ?',
  'quel-mode-3e-regle': 'Demande-toi si le verbe est conjugué, avec un sujet, puis ce qu’il exprime : un fait, un souhait, une hypothèse, un ordre.',
  'valeur-3e': 'Qu’exprime le verbe entre crochets ?',
  'valeur-3e-regle': 'Regarde le mode du verbe, puis les mots autour : si, que, s’il vous plaît, selon. Ce sont eux qui donnent la valeur.',
  'choisir-mode-3e': 'Complète la phrase avec le verbe au bon mode.',
  'choisir-mode-3e-regle': 'Regarde le mot qui introduit le verbe : certains appellent le subjonctif, d’autres l’indicatif.',
  'mode-indicatif': 'Le fait est présenté comme réel et certain : c’est l’indicatif.',
  'mode-subjonctif': 'Le verbe suit que et exprime un souhait, un doute, une obligation : c’est le subjonctif.',
  'mode-conditionnel': 'Le verbe a le r du futur et la terminaison de l’imparfait : c’est le conditionnel.',
  'mode-imperatif': 'Le verbe donne un ordre, sans sujet exprimé : c’est l’impératif.',
  'mode-infinitif': 'Le verbe n’est pas conjugué, il n’a pas de sujet : il est à l’infinitif, en -er, -ir, -re ou -oir.',
  'mode-participe': 'Le verbe n’est pas conjugué et s’emploie comme un adjectif : c’est le participe.',
  'valeur-reel': 'L’indicatif présente le fait comme réel, sûr : c’est un fait.',
  'valeur-souhait': 'Le subjonctif, après un verbe de volonté ou « pourvu que », exprime un souhait, une volonté.',
  'valeur-doute': 'Le subjonctif, après « je doute que » ou « il est possible que », exprime un doute, une incertitude.',
  'valeur-politesse': 'Le conditionnel adoucit une demande : c’est la politesse.',
  'valeur-rumeur': 'Le conditionnel signale une information qui n’est pas vérifiée : on la rapporte sans en être sûr.',
  'valeur-hypothese': 'Le conditionnel, après « si » et l’imparfait ou le plus-que-parfait, exprime un fait imaginé : une hypothèse.',
  'valeur-futur-passe': 'Le conditionnel, après un verbe au passé, exprime un futur vu depuis le passé.',
  'valeur-ordre': 'L’impératif, sans sujet exprimé, donne un ordre ou un conseil.',
  'choisir-subjonctif': 'Après « il faut que », « bien que », « pour que », « avant que », « sans que », un souhait ou un doute, on emploie le subjonctif.',
  'choisir-indicatif': 'Quand le fait est présenté comme sûr, après « je sais que », « je pense que », « puisque » ou « après que », on emploie l’indicatif.',
  'choisir-conjugue': 'Il faut ici un verbe conjugué, avec son sujet : ni infinitif, ni participe.',
};
