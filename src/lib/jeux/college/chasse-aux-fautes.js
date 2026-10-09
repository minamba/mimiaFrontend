/**
 * LA CHASSE AUX FAUTES — relire sa copie en 3e.
 *
 * COMPÉTENCE DU RÉFÉRENTIEL :
 *   FR_3E_LANG_ORTHO — « Relire une copie en ciblant les accords et les
 *                       homophones »
 *
 * TROIS SORTES DE MANCHES (4 + 2 + 2) :
 *   - TROUVE LA FAUTE (4) : une phrase, UNE faute, trois mots proposés ; les
 *     deux autres sont justes, et choisis pour avoir l'air suspects
 *     (« s'est acheté » sans accord, « arrivées » avec être) ;
 *   - LA PHRASE SANS FAUTE (2) : trois phrases presque semblables, une seule
 *     juste ; chacune des deux autres a UNE faute, et une seule ;
 *   - LE BON MOT (2) : on complète avec le bon homophone ou la bonne finale.
 * Chaque faute a sa sorte (participe avec avoir, avec être, -er ou -é,
 * leur ou leurs, sa ou ça, ses ou c'est, on ou ont, sujet éloigné…) et sa
 * phrase de méthode : le moyen de vérifier, pas la réponse.
 */

import { bilan as bilanCommun, outils } from '../outils.js';

export const FAMILLE = { cle: 'chasse-aux-fautes', titre: 'La chasse aux fautes', matiereCode: 'FRANCAIS' };

export const PAR_CLASSE = {
  TROISIEME: {
    titre: 'La chasse aux fautes',
    accroche: 'Une faute s’est cachée : trouve-la.',
    competences: ['FR_3E_LANG_ORTHO'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

/** [phrase avec UNE faute, le mot fautif, sa correction, sorte de faute, deux mots justes]. */
export const FAUTES = [
  ['Les enfants que j’ai vu jouaient dans la cour.', 'vu', 'vus', 'pp-avoir', ['jouaient', 'cour']],
  ['Elle s’est acheté une robe qu’elle a trouvé magnifique.', 'trouvé', 'trouvée', 'pp-avoir', ['acheté', 'magnifique']],
  ['Les lettres qu’il a écrit sont arrivées hier.', 'écrit', 'écrites', 'pp-avoir', ['arrivées', 'hier']],
  ['Ces fleurs étaient belles, mais elles ont fanées trop vite.', 'fanées', 'fané', 'pp-avoir-sans-cod', ['belles', 'étaient']],
  ['Les élèves sont arrivé en retard ce matin.', 'arrivé', 'arrivés', 'pp-etre', ['élèves', 'sont']],
  ['Il a passer toute la journée à lire.', 'passer', 'passé', 'infinitif-participe', ['toute', 'lire']],
  ['Nous allons regardé le film ce soir.', 'regardé', 'regarder', 'infinitif-participe', ['allons', 'soir']],
  ['Les voisins ont garé leur voitures devant le portail.', 'leur', 'leurs', 'leur-leurs', ['garé', 'devant']],
  ['Je leurs ai donné rendez-vous à midi.', 'leurs', 'leur', 'leur-pronom', ['donné', 'rendez-vous']],
  ['Elle a perdu ça trousse dans le bus.', 'ça', 'sa', 'sa-ca', ['perdu', 'dans']],
  ['Il a oublié c’est clés sur la table.', 'c’est', 'ses', 'ses-c-est', ['oublié', 'table']],
  ['Ils on fini leurs devoirs avant le dîner.', 'on', 'ont', 'on-ont', ['fini', 'leurs']],
  ['Le chien et le chat de la voisine dort sur le canapé.', 'dort', 'dorment', 'accord-sujet', ['voisine', 'canapé']],
  ['Les feuilles de l’arbre tombe en automne.', 'tombe', 'tombent', 'accord-sujet', ['feuilles', 'l’arbre']],
  ['Elle porte des chaussures noir et une veste rouge.', 'noir', 'noires', 'accord-adjectif', ['chaussures', 'rouge']],
  ['Mes cousines sont très gentil avec moi.', 'gentil', 'gentilles', 'accord-adjectif', ['cousines', 'très']],
  ['Il c’est trompé de chemin.', 'c’est', 's’est', 'ce-se', ['trompé', 'chemin']],
  ['Quand à moi, je préfère rester ici.', 'Quand', 'Quant', 'quand-quant', ['préfère', 'rester']],
  ['Ou est passé mon cahier ?', 'Ou', 'Où', 'ou-ou', ['passé', 'cahier']],
];

/** [phrase juste, [phrase fautive, sorte de faute], [phrase fautive, sorte de faute]]. */
export const TRIPLETS = [
  ['Les pommes que j’ai cueillies sont mûres.', ['Les pommes que j’ai cueilli sont mûres.', 'pp-avoir'], ['Les pommes que j’ai cueillies sont mûrs.', 'accord-adjectif']],
  ['Elles sont parties tôt et ont oublié leurs clés.', ['Elles sont parti tôt et ont oublié leurs clés.', 'pp-etre'], ['Elles sont parties tôt et on oublié leurs clés.', 'on-ont']],
  ['Je leur ai prêté mes livres.', ['Je leurs ai prêté mes livres.', 'leur-pronom'], ['Je leur ai prêter mes livres.', 'infinitif-participe']],
  ['Quant à ma sœur, elle s’est endormie.', ['Quand à ma sœur, elle s’est endormie.', 'quand-quant'], ['Quant à ma sœur, elle c’est endormie.', 'ce-se']],
  ['Où as-tu rangé tes chaussures neuves ?', ['Ou as-tu rangé tes chaussures neuves ?', 'ou-ou'], ['Où as-tu ranger tes chaussures neuves ?', 'infinitif-participe']],
  ['La voiture de mes oncles est garée dehors.', ['La voiture de mes oncles sont garée dehors.', 'accord-sujet'], ['La voiture de mes oncles est garé dehors.', 'pp-etre']],
  ['Il a vu ses amis devant le collège.', ['Il a vu c’est amis devant le collège.', 'ses-c-est'], ['Il a vus ses amis devant le collège.', 'pp-avoir-sans-cod']],
  ['Ma sœur a perdu sa montre, et ça l’ennuie.', ['Ma sœur a perdu ça montre, et ça l’ennuie.', 'sa-ca'], ['Ma sœur a perdu sa montre, et sa l’ennuie.', 'sa-ca']],
  ['Les chansons qu’elle a chantées étaient belles.', ['Les chansons qu’elle a chanté étaient belles.', 'pp-avoir'], ['Les chansons qu’elle a chantées étaient beaux.', 'accord-adjectif']],
];

/** [phrase à trou, le bon mot, [[mot faux, sorte de faute], …]]. */
export const TROUS = [
  ['Mes amis … déjà fini leur repas.', 'ont', [['on', 'on-ont']]],
  ['Je … ai dit la vérité.', 'leur', [['leurs', 'leur-pronom']]],
  ['Elle a rangé … affaires.', 'ses', [['c’est', 'ses-c-est'], ['s’est', 'ce-se']]],
  ['Il … blessé en tombant.', 's’est', [['c’est', 'ce-se'], ['ses', 'ses-c-est']]],
  ['Nous allons … la maison.', 'ranger', [['rangé', 'infinitif-participe'], ['rangez', 'infinitif-participe']]],
  ['Les filles se sont bien …', 'amusées', [['amusé', 'pp-etre'], ['amuser', 'infinitif-participe']]],
  ['… à toi, tu restes ici.', 'Quant', [['Quand', 'quand-quant'], ['Qu’en', 'quand-quant']]],
  ['Tu préfères le thé … le café ?', 'ou', [['où', 'ou-ou']]],
  ['Les tartes que nous avons … étaient délicieuses.', 'mangées', [['mangé', 'pp-avoir'], ['manger', 'infinitif-participe']]],
  ['Les enfants … partis à l’école.', 'sont', [['son', 'son-sont']]],
  ['J’ai vu … film hier soir.', 'ce', [['se', 'ce-se']]],
];

export function serie(graine = Date.now()) {
  const { melanger } = outils(graine);
  const libres = (liste) => melanger(liste).map((c) => ({ cle: c, libelle: c }));

  const trouver = melanger(FAUTES).slice(0, 4).map(([p, fautif, , sorte, justes]) => ({
    consigne: 'trouver',
    question: p,
    bonne: fautif,
    choix: libres([fautif, ...justes]),
    pieges: Object.fromEntries(justes.map((j) => [j, sorte])),
    aide: 'trouver-regle',
  }));

  const sansFaute = melanger(TRIPLETS).slice(0, 2).map(([juste, ...fautives]) => ({
    consigne: 'sans-faute',
    question: 'Une seule phrase est sans faute.',
    bonne: juste,
    choix: libres([juste, ...fautives.map(([f]) => f)]),
    pieges: Object.fromEntries(fautives),
    aide: 'sans-faute-regle',
  }));

  const trous = melanger(TROUS).slice(0, 2).map(([p, mot, faux]) => ({
    consigne: 'bon-mot',
    question: p,
    bonne: mot,
    choix: libres([mot, ...faux.map(([f]) => f)]),
    pieges: Object.fromEntries(faux),
    aide: 'bon-mot-regle',
  }));

  return melanger([...trouver, ...sansFaute, ...trous]);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  trouver: 'Une faute s’est cachée dans cette phrase. Quel mot est mal écrit ?',
  'sans-faute': 'Laquelle de ces phrases est écrite sans faute ?',
  'bon-mot': 'Quel mot complète correctement la phrase ?',
  'pp-avoir': 'Avec avoir, le participe passé s’accorde avec le COD seulement quand celui-ci est placé avant le verbe. Vérifie chaque participe.',
  'pp-avoir-sans-cod': 'Avec avoir, le participe passé ne s’accorde jamais avec le sujet. Sans COD placé avant, il reste invariable. Vérifie chaque participe.',
  'pp-etre': 'Avec être, le participe passé s’accorde avec le sujet. Cherche le sujet, puis vérifie le participe.',
  'infinitif-participe': 'Remplace le verbe par « vendre » ou « vendu » : si « vendre » convient, c’est l’infinitif en -er ; si « vendu » convient, c’est le participe en -é.',
  'leur-leurs': 'Devant un nom au pluriel, le déterminant leur prend un s. Regarde le nom qui suit chaque leur.',
  'leur-pronom': 'Juste devant un verbe, leur est un pronom : il ne prend jamais de s.',
  'sa-ca': 'Ça peut se remplacer par « cela » ; sa, par « la sienne » ou « ma ». Essaie sur chaque petit mot.',
  'ses-c-est': 'Ses peut se remplacer par « mes » ; c’est, par « cela est ». Essaie sur chaque petit mot.',
  'on-ont': 'Ont peut se remplacer par « avaient » ; on, par « il ». Essaie sur chaque petit mot.',
  'son-sont': 'Sont peut se remplacer par « étaient » ; son, par « mon ». Essaie sur chaque petit mot.',
  'accord-sujet': 'Le verbe s’accorde avec son sujet, même éloigné : demande-toi qui fait l’action, et combien ils sont.',
  'accord-adjectif': 'L’adjectif s’accorde en genre et en nombre avec le nom qu’il qualifie : cherche ce nom, puis vérifie.',
  'ce-se': 'Devant un verbe pronominal, on écrit se ou s’ : remplace par « me » pour vérifier. Devant un nom, ce est un déterminant.',
  'quand-quant': 'Quant à, avec un t, veut dire « en ce qui concerne ». Quand parle du temps.',
  'ou-ou': 'Où, avec un accent, indique le lieu. Ou, sans accent, veut dire « ou bien ».',
  'trouver-regle': 'Relis mot à mot : pour chaque verbe, cherche son sujet ; pour chaque participe, son auxiliaire ; pour chaque petit mot, essaie de le remplacer.',
  'sans-faute-regle': 'Compare les phrases : elles ne diffèrent que d’un mot. Pour ce mot, applique la règle et garde la phrase juste.',
  'bon-mot-regle': 'Remplace chaque mot proposé par un autre qui a le même rôle : celui qui garde un sens à la phrase est le bon.',
};
