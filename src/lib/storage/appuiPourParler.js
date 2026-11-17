/**
 * « APPUIE ET PARLE », AU CP — Camara, le 12/11/2026, après Vanessa et Nour : téléphone sur haut-parleur, la maman à
 * côté, des phrases qui ne partaient pas. Au CP, l'enfant ne maîtrise pas l'outil et son parent parle avec lui : on
 * ne devine plus quand il a fini, il le dit par un second appui. Les décisions pures du mode, testées à part
 * (`appuiPourParler.test.js`) ; la mécanique vit dans `Chat.js`.
 */

export const CLE_MAINS_LIBRES = 'school-ia-mains-libres';
export const CLE_MAINS_LIBRES_CP = 'school-ia-mains-libres-cp';

/** La classe de l'élève est-elle le CP ? (`niveauLibelle` vaut « CP ».) */
export function estClasseCP(niveauLibelle) {
  return /^CP$/i.test(String(niveauLibelle ?? '').trim());
}

/**
 * Les mains libres sont-elles allumées ? Hors CP : oui, sauf si on les a éteintes (`!== '0'`, voir Chat.js). Au CP :
 * non — le bouton —, sauf si le parent les a remises (`=== '1'`). Un stockage illisible donne le défaut.
 */
export function mainsLibresAuDepart(cp, lire) {
  try {
    return cp ? lire(CLE_MAINS_LIBRES_CP) === '1' : lire(CLE_MAINS_LIBRES) !== '0';
  } catch {
    return !cp;
  }
}

/**
 * Ce qui part à l'appui sur « J'ai fini » : ce qui est assemblé, plus le provisoire que le fournisseur n'a pas encore
 * tranché (sauf s'il a déjà été repris). À défaut de parole, ce qu'il a tapé dans le champ.
 */
export function texteDeFinDeParole({ assemble = '', partiel = '', partielConsomme = false, tapee = false, saisie = '' }) {
  const reste = partielConsomme ? '' : String(partiel).trim();
  let texte = String(assemble).trim();
  if (reste) texte = texte ? `${texte} ${reste}` : reste;
  if (!texte && tapee) texte = String(saisie).trim();
  return texte;
}
