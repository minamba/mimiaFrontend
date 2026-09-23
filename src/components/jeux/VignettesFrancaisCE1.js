/**
 * LES APERÇUS DES SIX JEUX DE FRANÇAIS DU CE1, sur leurs cartes de la
 * ludothèque — en attendant leurs couvertures. Même règle que les autres
 * vignettes : un dessin qui dit le geste du jeu.
 */

const Cadre = ({ label, children }) => (
  <svg className="jeu-vignette" viewBox="0 0 132 62" role="img" aria-label={label}>
    {children}
  </svg>
);

const Texte = ({ x, y, taille = 17, children }) => (
  <text x={x} y={y} textAnchor="middle" className="jeu-vignette__chiffre" style={{ fontSize: taille }}>{children}</text>
);

export function VignetteAOuA() {
  return (
    <Cadre label="a ou à, et ou est">
      <rect x="8" y="14" width="52" height="34" rx="8" className="jeu-vignette__jeton" />
      <rect x="72" y="14" width="52" height="34" rx="8" className="jeu-vignette__vide" />
      <Texte x={34} y={37}>a</Texte>
      <Texte x={98} y={37}>à</Texte>
    </Cadre>
  );
}

export function VignetteTypes() {
  return (
    <Cadre label="Point, point d’interrogation, ordre">
      <Texte x={24} y={40} taille={26}>.</Texte>
      <Texte x={66} y={40} taille={26}>?</Texte>
      <Texte x={108} y={40} taille={26}>!</Texte>
    </Cadre>
  );
}

export function VignetteContraires() {
  return (
    <Cadre label="grand, le contraire de petit">
      <Texte x={34} y={37}>grand</Texte>
      <Texte x={66} y={37}>↔</Texte>
      <Texte x={100} y={37}>petit</Texte>
    </Cadre>
  );
}

export function VignetteRoue() {
  return (
    <Cadre label="Une roue de pronoms et le verbe chanter">
      <circle cx="30" cy="31" r="24" className="jeu-vignette__vide" />
      <path d="M30 31 L30 7 A24 24 0 0 1 47 14 Z" className="jeu-vignette__jeton" />
      <Texte x={92} y={37} taille={15}>nous …ons</Texte>
    </Cadre>
  );
}

export function VignetteDetective() {
  return (
    <Cadre label="Une loupe sur le verbe">
      <circle cx="40" cy="28" r="16" className="jeu-vignette__vide" />
      <line x1="52" y1="40" x2="64" y2="52" className="jeu-vignette__trait" />
      <Texte x={40} y={33} taille={13}>verbe</Texte>
      <Texte x={100} y={37} taille={15}>sujet</Texte>
    </Cadre>
  );
}

export function VignetteNegation() {
  return (
    <Cadre label="ne et pas autour du verbe">
      <Texte x={26} y={37} taille={16}>ne</Texte>
      <rect x="44" y="18" width="44" height="28" rx="7" className="jeu-vignette__jeton" />
      <Texte x={108} y={37} taille={16}>pas</Texte>
    </Cadre>
  );
}
