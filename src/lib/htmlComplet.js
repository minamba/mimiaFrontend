/**
 * LE MODE « HTML COMPLET » DU MESSAGE DE DIFFUSION (Min's, le 24/11/2026) : on colle le HTML d'un courriel (le mail
 * Black Friday de Slimane), l'aperçu le montre tel quel et l'envoi le transmet tel quel.
 *
 * Le mode est porté par le TEXTE du template, sans colonne en base : un texte qui se termine par ce marqueur est un
 * HTML complet (même règle que le serveur, `HtmlComplet.Est`). Le marqueur est en FIN de texte pour que les insertions
 * au curseur (variables) gardent leurs positions : l'écran l'enlève à l'affichage et le remet à chaque frappe.
 */
export const MARQUEUR_HTML_COMPLET = '<!--mimia:html-complet-->';

const FIN = `\n${MARQUEUR_HTML_COMPLET}`;

/** Vrai si le texte d'un template est un HTML complet. */
export const estHtmlComplet = (texte) => (texte ?? '').trimEnd().endsWith(MARQUEUR_HTML_COMPLET);

/** Le HTML sans le marqueur, tel qu'on l'affiche et le modifie. */
export function sansMarqueur(texte) {
  const t = texte ?? '';
  if (t.endsWith(FIN)) return t.slice(0, -FIN.length);
  const fin = t.trimEnd();
  return fin.endsWith(MARQUEUR_HTML_COMPLET) ? fin.slice(0, -MARQUEUR_HTML_COMPLET.length).trimEnd() : t;
}

/** Le texte à enregistrer : le HTML tapé, suivi du marqueur. */
export const avecMarqueur = (html) => `${sansMarqueur(html)}${FIN}`;
