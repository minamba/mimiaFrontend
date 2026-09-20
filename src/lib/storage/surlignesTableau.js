/**
 * LES MOTS QUE LE PROFESSEUR SURLIGNE AU TABLEAU — Camara, le 18/09/2026, en
 * pleine correction d'une expression écrite : « j'aimerais que le professeur
 * surligne les mots problématiques ».
 *
 * LA DICTÉE AVAIT DÉJÀ SES SURLIGNÉS, MAIS ILS VENAIENT D'UNE COMPARAISON : le
 * texte dicté d'un côté, la copie de l'autre, et l'écran trouvait lui-même les
 * écarts. Une rédaction n'a pas de texte modèle. Rien ne permet à l'écran de
 * deviner que « partie » est fautif dans « on est partie » et juste dans « je
 * suis partie » — c'est au professeur de le DÉSIGNER.
 *
 * IL LE FAIT EN ENCADRANT LE MOT : `==partie==`. C'est la notation de
 * surlignage de Markdown, qu'un modèle écrit sans qu'on ait à la lui
 * apprendre, et qu'un enfant ne tape jamais par hasard.
 *
 * LE MOT LUI-MÊME N'EST PAS TOUCHÉ, et c'est ce qui rend ça compatible avec la
 * règle d'or de la correction : la copie au tableau est SA copie, fautes
 * comprises. Surligner « partie » ne l'écrit pas « parti » — ça lui montre où
 * regarder.
 *
 * LE RENDU EST CELUI DE LA DICTÉE, À L'IDENTIQUE : même surligné corail, même
 * badge numéroté posé après le mot. Un enfant qui a déjà corrigé une dictée
 * sait lire ce tableau, et le professeur peut dire « regarde le mot 2 ».
 */

/**
 * Un mot encadré de deux signes égal, SUR UNE SEULE LIGNE et SANS `=` dedans.
 *
 * Les deux bornes ne sont pas des précautions de style : sans elles, un seul
 * `==` oublié ferait surligner tout le reste du tableau jusqu'au prochain.
 */
const MARQUE = /==([^=\n]+?)==/g;

/** Un mot surligné, comparable d'un tableau à l'autre. */
const cle = (mot) => mot.trim().toLocaleLowerCase('fr');

/**
 * LES NUMÉROS DES MOTS DU TABLEAU COURANT, STABLES D'UN TABLEAU À L'AUTRE —
 * voulu par Camara le 19/09/2026.
 *
 * LE DÉFAUT. Le professeur réécrit tout le texte à chaque faute corrigée, en
 * ne surlignant plus que celles qui restent. Numérotés dans l'ordre
 * d'apparition, les badges se recalculaient : la faute 1 corrigée, la 2
 * devenait 1 et la 3 devenait 2 — pendant que le professeur, lui, disait
 * encore « regarde le mot 3 ». L'enfant cherchait un badge qui n'existait plus.
 *
 * LA RÈGLE. Chaque mot garde le numéro qu'il avait au premier tableau où il
 * est apparu surligné. On relit les tableaux de la conversation dans l'ordre :
 * un mot déjà vu (même mot, pris dans l'ordre s'il revient plusieurs fois)
 * reprend son numéro ; un mot nouveau prend le suivant.
 *
 * UNE NOUVELLE CORRECTION REPART À 1 : un tableau dont AUCUN mot surligné
 * n'a été vu avant est un autre texte, pas la suite du précédent. Les tableaux
 * sans surligné — une conjugaison, la consigne — ne coupent rien : le
 * professeur peut faire un détour et revenir au texte.
 */
function numerosStables(contenu, precedents) {
  let registre = [];
  let prochain = 1;
  let numeros = [];

  for (const tableau of [...precedents, contenu]) {
    const mots = [...(tableau ?? '').matchAll(MARQUE)].map((m) => cle(m[1]));
    if (mots.length === 0) {
      numeros = [];
      continue;
    }

    const libres = [...registre];
    const repris = [];
    for (const mot of mots) {
      const i = libres.findIndex((r) => r.cle === mot);
      repris.push(i < 0 ? null : libres.splice(i, 1)[0].numero);
    }

    if (repris.every((n) => n === null)) {
      registre = [];
      prochain = 1;
    }

    numeros = [];
    for (let i = 0; i < mots.length; i += 1) {
      if (repris[i] !== null) {
        numeros.push(repris[i]);
      } else {
        registre.push({ cle: mots[i], numero: prochain });
        numeros.push(prochain);
        prochain += 1;
      }
    }
  }

  return numeros;
}

/**
 * Découpe le contenu du tableau en segments pour `TexteCompare`, ou rend
 * `null` s'il n'y a rien de surligné — le tableau s'affiche alors tel quel.
 *
 * Sans `precedents`, les mots sont numérotés dans leur ordre d'apparition.
 * Avec les tableaux qui l'ont précédé dans la conversation, chaque mot garde
 * le numéro de sa première apparition — voir `numerosStables`.
 */
export function lireSurlignes(contenu, precedents = []) {
  const texte = contenu ?? '';

  // `includes` et non `MARQUE.test` : un motif global garde son `lastIndex`
  // d'un appel à l'autre, et le second tableau lu serait lu à moitié.
  if (!texte.includes('==')) return null;

  const numeros = numerosStables(texte, precedents);

  const segments = [];
  let fin = 0;
  let numero = 0;

  for (const trouve of texte.matchAll(MARQUE)) {
    if (trouve.index > fin) {
      segments.push({ type: 'texte', texte: texte.slice(fin, trouve.index) });
    }

    segments.push({ type: 'mot', texte: trouve[1], erreur: numeros[numero] ?? numero + 1, badge: true });
    numero += 1;

    fin = trouve.index + trouve[0].length;
  }

  if (numero === 0) return null;

  if (fin < texte.length) segments.push({ type: 'texte', texte: texte.slice(fin) });

  return { segments, erreurs: numero };
}

/**
 * Le même texte, sans les marques — pour tout ce qui n'est pas le tableau.
 *
 * L'ARCHIVE SURTOUT : la copie rangée dans « Expressions écrites » doit être
 * celle de l'enfant, pas celle de l'enfant annotée par le professeur. Des `==`
 * qui traîneraient dedans se liraient comme des fautes de frappe à lui.
 */
export function sansSurlignes(texte) {
  return (texte ?? '').replace(MARQUE, '$1');
}
