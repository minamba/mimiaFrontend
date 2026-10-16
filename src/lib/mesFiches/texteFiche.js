/**
 * LE TEXTE D'UNE FICHE, ET RIEN QUE DU TEXTE.
 *
 * La fiche est écrite par un modèle. Jamais de HTML : l'afficher tel quel
 * ouvrirait une injection dans la page de l'enfant. Quatre marques suffisent,
 * lues ici et rendues par des composants :
 *
 *   **gras**          les mots à retenir ;
 *   *italique*        les exemples cités ;
 *   {AM/AB}           une fraction — les maths en ont besoin, sans moteur de formules ;
 *   [[nom de la figure]]  un blanc à remplir, dans une phrase modèle.
 *
 * Tout le reste est du texte, affiché tel quel : un « < » reste un « < ».
 */

const INSECABLE = String.fromCharCode(0xa0);
const INSECABLE_FINE = String.fromCharCode(0x202f);

/**
 * LA TYPOGRAPHIE FRANÇAISE : une espace insécable avant « ! ? ; : » et dans
 * les guillemets. Sans elle, un « ! » ou un « » » finit seul en début de
 * ligne — relevé sur la première carte visuelle (« papillon » coupé).
 */
export function typographier(texte) {
  return texte
    .replace(/« /g, `«${INSECABLE}`)
    .replace(/ »/g, `${INSECABLE}»`)
    .replace(/ ([!?;:])/g, `${INSECABLE_FINE}$1`);
}

const MOTIF = /\*\*(.+?)\*\*|\*(.+?)\*|\{([^{}/\n]+)\/([^{}\n]+)\}|\[\[(.+?)\]\]/g;

/**
 * Découpe un texte en morceaux : { type: 'texte' | 'gras' | 'italique' |
 * 'fraction' | 'blanc', ... }. Le gras et l'italique gardent leurs
 * fractions et leurs blancs à l'intérieur (un niveau suffit).
 */
export function decouperTexte(brut, profondeur = 0) {
  if (typeof brut !== 'string' || brut.length === 0) return [];
  const texte = profondeur === 0 ? typographier(brut) : brut;

  const morceaux = [];
  let depuis = 0;

  for (const trouve of texte.matchAll(MOTIF)) {
    if (trouve.index > depuis) {
      morceaux.push({ type: 'texte', texte: texte.slice(depuis, trouve.index) });
    }

    const [, gras, italique, haut, bas, blanc] = trouve;

    if (gras !== undefined) {
      morceaux.push({ type: 'gras', morceaux: profondeur < 1 ? decouperTexte(gras, profondeur + 1) : [{ type: 'texte', texte: gras }] });
    } else if (italique !== undefined) {
      morceaux.push({ type: 'italique', morceaux: profondeur < 1 ? decouperTexte(italique, profondeur + 1) : [{ type: 'texte', texte: italique }] });
    } else if (haut !== undefined) {
      morceaux.push({ type: 'fraction', haut: haut.trim(), bas: bas.trim() });
    } else {
      morceaux.push({ type: 'blanc', texte: blanc });
    }

    depuis = trouve.index + trouve[0].length;
  }

  if (depuis < texte.length) morceaux.push({ type: 'texte', texte: texte.slice(depuis) });

  return grouperFormules(morceaux);
}

/** Ce qui peut séparer deux fractions d'une même formule : « = », « ≠ », « × »… */
const OPERATEUR = /^\s*[=≠<>≤≥×+−-]\s*$/;

/**
 * UNE ÉGALITÉ DE FRACTIONS NE SE COUPE PAS EN FIN DE LIGNE — relevé sur la
 * fiche de contrôle de Thalès : « AM/AB = AN/AC = » d'un côté, « MN/BC » seul
 * sur la ligne suivante. Les fractions reliées par un opérateur forment une
 * `formule`, affichée d'un seul tenant.
 */
function grouperFormules(morceaux) {
  const groupes = [];

  for (let i = 0; i < morceaux.length; i += 1) {
    if (morceaux[i].type !== 'fraction') {
      groupes.push(morceaux[i]);
      continue;
    }

    const formule = [morceaux[i]];
    while (
      morceaux[i + 1]?.type === 'texte'
      && OPERATEUR.test(morceaux[i + 1].texte)
      && morceaux[i + 2]?.type === 'fraction'
    ) {
      formule.push(morceaux[i + 1], morceaux[i + 2]);
      i += 2;
    }

    groupes.push(formule.length > 1 ? { type: 'formule', morceaux: formule } : formule[0]);
  }

  return groupes;
}

/** Le texte nu, marques retirées — pour un libellé d'accessibilité ou une recherche. */
export function texteNu(texte) {
  const aplatir = (morceaux) => morceaux.map((m) => {
    if (m.type === 'fraction') return `${m.haut} sur ${m.bas}`;
    if (m.morceaux) return aplatir(m.morceaux);
    return m.texte;
  }).join('');

  return aplatir(decouperTexte(texte));
}
