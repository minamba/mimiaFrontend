/**
 * LE RETRAIT D'UNE NOTION DU PROGRAMME, PAR UN BOUTON — signalement #67 v7 (23/11/2026).
 *
 * Six versions ont essayé de comprendre le « oui » TAPÉ par l'élève ; chacune laissait passer des cas. Désormais :
 *
 *   1. le professeur propose le retrait par une balise (`[RETRAIT_PROPOSE] id=…`), que l'écran ne montre jamais ;
 *   2. le SERVEUR la vérifie sur le programme relu en base et ajoute, seulement si la notion est retirable,
 *      `[RETRAIT_BOUTON]controle=C|id=N|libelle=X[/RETRAIT_BOUTON]` : c'est cette balise-là, et elle seule, qui fait
 *      afficher sous le message « Oui, retirer « X » » et « Non, la garder » ;
 *   3. seul le clic sur « Oui » appelle la route dédiée, qui retire CETTE notion ;
 *   4. le clic part ensuite comme un tour normal, avec un marqueur (`[RETRAIT_CLIC:RETIREE id=N]` ou `GARDEE`) que le
 *      serveur relit CONTRE LA BASE pour dire au professeur « RETIRÉ : X » ou « GARDÉE : X ». Le marqueur ne retire
 *      rien : taper la même chose à la main ne fait rien partir.
 */

/** La balise du professeur, jamais affichée ni dite. */
const PROPOSE = /\[RETRAIT_PROPOSE\][ \t  ]*(?:id[ \t]*[=:][ \t]*\d+|«[^«»\r\n\]]*»)?/gi;

/** La balise du serveur (forme complète), jamais affichée ni dite. */
const BOUTON = /\n*\[RETRAIT_BOUTON\][^\r\n]*?\[\/RETRAIT_BOUTON\]/g;
const BOUTON_LU = /\[RETRAIT_BOUTON\]controle=(\d+)\|id=(\d+)\|libelle=([^\r\n]*?)\[\/RETRAIT_BOUTON\]/g;

/** Le marqueur joint au message de l'élève après son clic. */
const CLIC = /\n?\[RETRAIT_CLIC:(?:RETIREE|GARDEE) id=\d+\]/g;

/** Retire les deux balises (professeur et serveur) pour l'affichage et la voix. */
export function retirerBalisesRetrait(texte) {
  return (texte ?? '').replace(BOUTON, '').replace(PROPOSE, '');
}

/** Retire le marqueur du clic de la bulle de l'élève. */
export function retirerMarqueurClicRetrait(texte) {
  return (texte ?? '').replace(CLIC, '').trimEnd();
}

/**
 * Le retrait proposé par un message du professeur : la DERNIÈRE balise du serveur, ou null (pas de balise du serveur =
 * pas de bouton, même si le professeur a écrit la sienne).
 */
export function retraitPropose(texte) {
  let trouve = null;
  for (const m of (texte ?? '').matchAll(BOUTON_LU)) {
    trouve = { controleId: Number(m[1]), notionId: Number(m[2]), libelle: m[3].trim() };
  }
  return trouve;
}

/**
 * La proposition à laquelle l'élève n'a pas encore répondu : celle du DERNIER message, s'il est du professeur. Dès
 * que l'élève a écrit ou cliqué, les boutons disparaissent (un retrait se propose à nouveau, jamais en différé).
 */
export function retraitEnAttente(messages) {
  const liste = messages ?? [];
  const dernier = liste[liste.length - 1];
  if (!dernier || dernier.role !== 'assistant') return null;
  return retraitPropose(dernier.contenu);
}

/** Le message envoyé après le clic : la phrase de l'élève + le marqueur relu par le serveur. */
export function marquerClicRetrait(libelle, notionId, retiree) {
  return retiree
    ? `Oui, retire « ${libelle} » de mon programme.\n[RETRAIT_CLIC:RETIREE id=${notionId}]`
    : `Non, je garde « ${libelle} ».\n[RETRAIT_CLIC:GARDEE id=${notionId}]`;
}
