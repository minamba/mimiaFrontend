/**
 * Le rendu des balises d'un texte écrit à la main.
 *
 * `**gras**`, `_italique_`, `[texte](https://…)` et `[image:N]`, plus les
 * émoticônes, qui n'ont rien à faire ici — ce sont des caractères comme les
 * autres, le navigateur les dessine tout seul.
 *
 * AUCUN `dangerouslySetInnerHTML`, ET C'EST LE POINT. Transformer ce texte en
 * chaîne HTML puis l'injecter ouvrirait la porte à `<script>` — le texte vient
 * d'un champ de saisie, et même un champ réservé à l'administration finit un
 * jour par recevoir un copier-coller venu d'ailleurs. On construit donc des
 * ÉLÉMENTS React : ce qui n'est pas reconnu reste du texte, et du texte ne
 * s'exécute pas.
 *
 * LE MÊME VOCABULAIRE QUE LES COURRIELS (`**gras**`, `[image:N]`, voir
 * `MarqueursImages.cs`) : une seule convention à apprendre pour toute
 * l'administration, et la renumérotation des images est déjà écrite des deux
 * côtés.
 */

/** Ce qu'on accepte d'ouvrir. Un lien `javascript:` est du code déguisé. */
const lienSur = (url) => /^https?:\/\//i.test(url ?? '');

/**
 * Découpe une ligne en morceaux : gras, italique, lien, image, texte.
 *
 * L'ORDRE DES ALTERNATIVES COMPTE. `[image:1]` doit être reconnu AVANT la
 * forme générale d'un lien `[…](…)`, sinon un marqueur d'image suivi d'une
 * parenthèse serait avalé comme un lien au libellé étrange.
 */
const DECOUPE = /(\*\*[^*]+\*\*|_[^_]+_|\[image:\d+\]|\[[^\]]+\]\([^)]+\)|https?:\/\/\S+)/g;

/**
 * La ponctuation qui suit une adresse collée en fin de phrase lui appartient
 * rarement : « Voir https://exemple.fr. » — le point termine la phrase, pas
 * l'adresse. On le rend au texte, sinon le lien mène à une page qui n'existe
 * pas. Les parenthèses fermantes suivent la même règle, à ceci près qu'une
 * adresse peut en contenir une légitime (Wikipédia) : on ne retire que celles
 * qui ne sont pas ouvertes dans l'adresse elle-même.
 */
const rognerPonctuation = (url) => {
  let fin = url.length;

  while (fin > 0) {
    const c = url[fin - 1];

    if ('.,;:!?«»"\''.includes(c)) { fin -= 1; continue; }

    if (c === ')') {
      const morceau = url.slice(0, fin);
      const ouvertes = (morceau.match(/\(/g) ?? []).length;
      const fermees = (morceau.match(/\)/g) ?? []).length;

      if (fermees > ouvertes) { fin -= 1; continue; }
    }

    break;
  }

  return { adresse: url.slice(0, fin), reste: url.slice(fin) };
};

/**
 * @param texte le texte balisé
 * @param urlImage fonction rang → URL. Rendre null masque l'image : c'est ce
 *   qui permet d'écrire `[image:2]` avant de l'avoir téléversée sans que
 *   l'aperçu ne montre une image cassée.
 */
export function rendreTexteRiche(texte, urlImage) {
  const lignes = (texte ?? '').split('\n');

  return lignes.map((ligne, indexLigne) => {
    const morceaux = ligne.split(DECOUPE).filter((m) => m !== '');

    const contenu = morceaux.map((morceau, index) => {
      // eslint-disable-next-line react/no-array-index-key
      const cle = `${indexLigne}-${index}`;

      if (morceau.startsWith('**') && morceau.endsWith('**')) {
        return <strong key={cle}>{morceau.slice(2, -2)}</strong>;
      }

      if (morceau.startsWith('_') && morceau.endsWith('_') && morceau.length > 2) {
        return <em key={cle}>{morceau.slice(1, -1)}</em>;
      }

      const image = morceau.match(/^\[image:(\d+)\]$/);
      if (image) {
        const url = urlImage?.(Number(image[1]));

        // PAS DE SILENCE QUAND L'IMAGE MANQUE. La première version rendait
        // `null` : le marqueur disparaissait, et on croyait que rien ne
        // s'était passé — alors qu'il y avait bien une image, simplement pas
        // encore chargée ou impossible à lire. Un cadre le dit.
        if (!url) {
          return (
            <span key={cle} className="texte-riche__manque">
              Image {image[1]} — indisponible
            </span>
          );
        }

        // UN TEXTE DE REMPLACEMENT, MÊME PAUVRE. `alt=""` aurait dit « cette
        // image ne porte aucune information » — c'est faux, une capture d'écran
        // dans une idée EST l'information. On n'a pas mieux que son numéro,
        // faute de légende, mais un lecteur d'écran annonce au moins qu'il y a
        // là une illustration, et laquelle. Le mot « image » lui-même est banni
        // de l'alt : le lecteur d'écran l'annonce déjà, le répéter fait doublon.
        return (
          <img
            key={cle}
            className="texte-riche__image"
            src={url}
            alt={`Illustration ${image[1]}`}
          />
        );
      }

      const lien = morceau.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (lien && lienSur(lien[2])) {
        return (
          // `noreferrer` en plus de `noopener` : le premier ferme aussi la
          // fuite du référent, le second l'accès à `window.opener`.
          <a key={cle} href={lien[2]} target="_blank" rel="noopener noreferrer">
            {lien[1]}
          </a>
        );
      }

      // UNE ADRESSE COLLÉE TELLE QUELLE DEVIENT UN LIEN — Camara, le
      // 17/09/2026 : « le fait de coller un lien, il est détecté et s'affiche
      // directement sous forme de lien cliquable ». Personne ne va écrire
      // `[texte](adresse)` pour déposer une référence en vitesse dans une idée.
      //
      // `https?://` EXIGÉ, et pas `www.` ni un nom de domaine nu : il faudrait
      // alors deviner le protocole, et « rendez-vous mardi 14.30 » deviendrait
      // un lien vers un domaine tchèque.
      if (lienSur(morceau)) {
        const { adresse, reste } = rognerPonctuation(morceau);

        return (
          <span key={cle}>
            <a href={adresse} target="_blank" rel="noopener noreferrer">{adresse}</a>
            {reste}
          </span>
        );
      }

      // Un lien mal formé ou dangereux retombe ici : il s'affiche tel qu'il a
      // été écrit, ce qui est à la fois sûr et visible — on voit qu'il ne
      // marche pas plutôt que de le voir disparaître.
      return <span key={cle}>{morceau}</span>;
    });

    // Une ligne vide sépare deux paragraphes : elle garde sa hauteur.
    return (
      // eslint-disable-next-line react/no-array-index-key
      <p key={indexLigne} className="texte-riche__ligne">
        {contenu.length > 0 ? contenu : ' '}
      </p>
    );
  });
}

/**
 * Insère une balise autour de la sélection d'un champ de texte, ou à la
 * position du curseur si rien n'est sélectionné.
 *
 * RENVOIE AUSSI OÙ REMETTRE LE CURSEUR. Sans cela, il repart à la fin du
 * champ après chaque clic sur « Gras » — on écrit une phrase, on met un mot en
 * gras, et la suite s'écrit trois paragraphes plus bas.
 */
export function entourerSelection(valeur, debut, fin, avant, apres = avant) {
  const selection = valeur.slice(debut, fin);
  const texte = valeur.slice(0, debut) + avant + selection + apres + valeur.slice(fin);

  return {
    texte,
    // Rien de sélectionné : le curseur se place ENTRE les deux balises, prêt à
    // taper. Quelque chose de sélectionné : la sélection reste, balises
    // comprises, pour qu'un second clic puisse l'annuler à la main.
    debut: debut + avant.length,
    fin: debut + avant.length + selection.length,
  };
}
