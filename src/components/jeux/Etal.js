/**
 * LES DESSINS DE « LA MARCHANDE » — les produits, les pièces, le billet.
 *
 * Le décor du marché est une image ; tout ce qui se manipule est dessiné ici,
 * pour la même raison que les œufs de la boîte de 10 : une image de pièce ne
 * se pose pas sur un comptoir.
 *
 * LES QUATRE PRODUITS SONT CEUX DES ARDOISES du décor — pomme, banane,
 * tomate, carotte. Dessinés gros et sans détail : ils font une trentaine de
 * pixels à l'écran, et un enfant doit les reconnaître en une seconde.
 */

const DESSINS = {
  pomme: (
    <>
      <path className="produit__chair produit__chair--pomme" d="M12 9 C 6 9 3 14 3 19 C 3 25 7 31 12 31 C 14 31 15 30 16 30 C 17 30 18 31 20 31 C 25 31 29 25 29 19 C 29 14 26 9 20 9 C 18 9 17 10 16 10 C 15 10 14 9 12 9 Z" />
      <path className="produit__tige" d="M16 10 V5" />
      <path className="produit__feuille" d="M16 6 C 20 2 25 4 24 8 C 23 11 18 10 16 6 Z" />
    </>
  ),

  banane: (
    <>
      <path
        className="produit__chair produit__chair--banane"
        d="M5 10 C 5 22 12 30 24 30 C 28 30 30 28 30 26 C 30 24 28 24 25 24 C 16 24 10 18 10 10 C 10 7 9 6 7 6 C 5 6 5 8 5 10 Z"
      />
      <path className="produit__tige" d="M6 7 V4" />
    </>
  ),

  tomate: (
    <>
      <circle className="produit__chair produit__chair--tomate" cx="16" cy="21" r="11" />
      <path className="produit__feuille" d="M16 10 l-6 -3 M16 10 l6 -3 M16 10 v-4 M16 10 l-3 -5 M16 10 l3 -5" />
    </>
  ),

  carotte: (
    <>
      <path className="produit__chair produit__chair--carotte" d="M16 32 L9 13 C 12 11 20 11 23 13 Z" />
      <path className="produit__feuille" d="M16 12 v-7 M16 9 l-5 -5 M16 9 l5 -5" />
    </>
  ),
};

/** Un produit de l'étal. Décoratif : son nom est dit par la consigne. */
export function Produit({ cle }) {
  const dessin = DESSINS[cle];
  if (!dessin) return null;

  return (
    <svg className="produit" viewBox="0 0 32 36" aria-hidden="true">
      {dessin}
    </svg>
  );
}

/**
 * UNE PIÈCE OU UN BILLET.
 *
 * LA VALEUR EST ÉCRITE DESSUS, comme sur la vraie monnaie — et c'est ce qui
 * relie le nombre écrit à la quantité qu'il vaut. Un CP ne reconnaît pas
 * encore une pièce à sa taille ; il lit « 2 ».
 *
 * LE BILLET A UNE AUTRE FORME ET UNE AUTRE COULEUR : on doit voir du premier
 * coup d'œil que ce n'est pas une pièce, sans quoi « 5 » ne serait qu'un rond
 * de plus.
 */
export function Monnaie({ valeur, genre }) {
  if (genre === 'billet') {
    return (
      <svg className="monnaie monnaie--billet" viewBox="0 0 64 38" aria-hidden="true">
        <rect className="billet__papier" x="2" y="2" width="60" height="34" rx="5" />
        <rect className="billet__cadre" x="7" y="7" width="50" height="24" rx="3" />
        <text className="monnaie__valeur" x="32" y="25" textAnchor="middle">{valeur} €</text>
      </svg>
    );
  }

  return (
    <svg className="monnaie monnaie--piece" viewBox="0 0 44 44" aria-hidden="true">
      <circle className="piece__tranche" cx="22" cy="22" r="20" />
      <circle className="piece__centre" cx="22" cy="22" r="14" />
      <text className="monnaie__valeur" x="22" y="28" textAnchor="middle">{valeur}</text>
    </svg>
  );
}
