/**
 * L'APERÇU DE « LA BOÎTE DE 10 », sur sa carte de la ludothèque.
 *
 * Camara, le 21/09/2026 : « faut que ce soit beau ». Mais la vignette ne sert
 * pas qu'à décorer — c'est la seule chose de la carte qu'un CP puisse LIRE.
 * Il ne déchiffre pas encore « La boîte de 10 » ; il reconnaît, lui, la boîte
 * qu'il a en classe. Un jeu s'annonce par son dessin, pas par son titre.
 *
 * Le dessin montre la situation de départ, pas une boîte pleine : six jetons
 * posés, quatre cases vides. C'est déjà la question du jeu.
 */
export default function VignetteBoiteDeDix() {
  const cases = Array.from({ length: 10 }, (_, i) => i < 6);

  return (
    <svg
      className="jeu-vignette"
      viewBox="0 0 132 62"
      role="img"
      aria-label="Une boîte de dix cases, six sont remplies"
    >
      <rect x="2" y="2" width="128" height="58" rx="10" className="jeu-vignette__boite" />

      {cases.map((plein, i) => {
        const x = 12 + (i % 5) * 24;
        const y = 14 + Math.floor(i / 5) * 24;

        return plein
          ? <circle key={i} cx={x} cy={y} r="8" className="jeu-vignette__jeton" />
          : <circle key={i} cx={x} cy={y} r="8" className="jeu-vignette__vide" />;
      })}
    </svg>
  );
}
