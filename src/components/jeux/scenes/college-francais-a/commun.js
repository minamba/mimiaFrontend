/**
 * LES BRIQUES COMMUNES DES SCÈNES DU GROUPE « COLLÈGE, FRANÇAIS A »
 * (09/10/2026). Chaque jeu a son univers ; ce qui se partage ici, ce sont les
 * outils de la langue : découper une phrase autour du mot entre crochets,
 * remplir un trou, retrouver un libellé, jouer des réponses-boutons.
 *
 * LE TEXTE ENTIER DE LA QUESTION RESTE TOUJOURS À L'ÉCRAN, tel quel (sans les
 * crochets) : une phrase « remplie » après la réponse s'ajoute à côté, elle ne
 * remplace jamais la question.
 *
 * Les classes viennent du jeu qui appelle (`prefixe`) : chaque jeu garde son
 * préfixe `sc-<clé>`.
 */

/** Le libellé d'une réponse, à partir de sa clé. */
export const libelleDe = (m, cle) => (m?.choix ?? []).find((c) => c.cle === cle)?.libelle ?? String(cle ?? '');

/** La bonne réponse, telle qu'elle s'affiche. */
export const laBonne = (m) => libelleDe(m, m?.bonne);

/** « Le [chat] dort. » → [{ texte: 'Le ', designe: false }, { texte: 'chat', designe: true }, …]. */
export function decouper(texte) {
  return String(texte ?? '').split(/(\[[^\]]+\])/).filter((t) => t !== '').map((t) => (/^\[[^\]]+\]$/.test(t)
    ? { texte: t.slice(1, -1), designe: true }
    : { texte: t, designe: false }));
}

/** Le texte sans crochets : ce que l'enfant lit. */
export const sansCrochets = (texte) => String(texte ?? '').replace(/\[([^\]]+)\]/g, '$1');

/** Ce qui est entre crochets (le premier groupe), ou null. */
export function entreCrochets(texte) {
  const r = /\[([^\]]+)\]/.exec(String(texte ?? ''));
  return r ? r[1] : null;
}

/**
 * LA PHRASE, avec le mot entre crochets mis en valeur. `classe` s'ajoute au
 * soulignement commun (`college__designe`), `apres` vient juste après le mot
 * désigné (une étiquette qui s'y accroche, par exemple).
 */
export function Designe({ texte, classe = '', apres = null }) {
  return decouper(texte).map((p, i) => (p.designe ? (
    // eslint-disable-next-line react/no-array-index-key
    <strong key={i} className={`college__designe ${classe}`.trim()}>
      {p.texte}
      {apres}
    </strong>
    // eslint-disable-next-line react/no-array-index-key
  ) : <span key={i}>{p.texte}</span>));
}

/** Remplace le premier trou (« ___ » ou « … ») par un mot. */
export function remplir(texte, mot, trou = /___|…/) {
  return String(texte ?? '').replace(trou, String(mot ?? ''));
}

/** Coupe une phrase en trois autour de son premier trou : [avant, après], ou null. */
export function autourDuTrou(texte, trou = '___') {
  const t = String(texte ?? '');
  const i = t.indexOf(trou);
  if (i < 0) return null;
  return [t.slice(0, i), t.slice(i + trou.length)];
}

/** Majuscule au début. */
export const majuscule = (t) => (t ? t[0].toUpperCase() + t.slice(1) : t);

/**
 * Cherche un mot entier dans une phrase (sans tenir compte de la casse) :
 * [avant, le mot tel qu'il est écrit, après], ou null.
 */
export function trouverMot(phrase, mot) {
  const p = String(phrase ?? '');
  const m = String(mot ?? '').trim();
  if (!m) return null;
  const echappe = m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Un mot élidé (« qu’ ») colle au suivant : pas de frontière à exiger après lui.
  const fin = /[’']$/.test(m) ? '' : '(?=$|[^\\p{L}])';
  // Avant le mot : le début, ou autre chose qu'une lettre (« l’île » : l'apostrophe compte comme un début).
  const r = new RegExp(`(^|[^\\p{L}-])(${echappe})${fin}`, 'iu').exec(p);
  if (!r) return null;
  const debut = r.index + r[1].length;
  return [p.slice(0, debut), p.slice(debut, debut + r[2].length), p.slice(debut + r[2].length)];
}

/**
 * LES RÉPONSES JOUÉES AUTREMENT : chacune reste un vrai bouton, à son libellé,
 * qui appelle `choisir(cle)` ; une réponse fausse est barrée, ternie et
 * désactivée. `rendu(c, i, faux)` dessine l'intérieur du bouton (le libellé y
 * reste écrit en toutes lettres) ; `styleDe(c, i)` donne à chaque place ses
 * variables CSS (une teinte, une position).
 */
export function Boutons({
  choix, fautes = [], choisir, prefixe, rendu, classe = '', etiquette = 'Choisis ta réponse', styleDe,
}) {
  return (
    <ul className={`${prefixe}__choix ${classe}`.trim()} aria-label={etiquette}>
      {(choix ?? []).map((c, i) => {
        const faux = fautes.includes(c.cle);
        return (
          <li key={c.cle} className={`${prefixe}__place`} style={{ '--i': i, ...(styleDe?.(c, i) ?? {}) }}>
            <button
              type="button"
              className={`${prefixe}__bouton${faux ? ' est-fausse' : ''}`}
              onClick={() => choisir(c.cle)}
              disabled={faux}
            >
              {rendu ? rendu(c, i, faux) : c.libelle}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
