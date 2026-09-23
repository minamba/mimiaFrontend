/**
 * LES APERÇUS DES NOUVEAUX JEUX DU CE2, sur leurs cartes de la ludothèque —
 * en attendant leurs couvertures. Même règle que les autres vignettes : un
 * dessin qui dit le geste du jeu.
 */

const Cadre = ({ label, children }) => (
  <svg className="jeu-vignette" viewBox="0 0 132 62" role="img" aria-label={label}>
    {children}
  </svg>
);

const Texte = ({
  x, y, taille = 15, children,
}) => (
  <text x={x} y={y} textAnchor="middle" className="jeu-vignette__chiffre" style={{ fontSize: taille }}>{children}</text>
);

export function VignettePartage() {
  return (
    <Cadre label="Des bonbons partagés dans trois assiettes">
      {[22, 66, 110].map((x) => <ellipse key={x} cx={x} cy="44" rx="18" ry="7" className="jeu-vignette__vide" />)}
      {[16, 28, 60, 72, 104, 116].map((x) => <circle key={x} cx={x} cy="38" r="5" className="jeu-vignette__jeton" />)}
      <Texte x={66} y={20}>12 ÷ 3</Texte>
    </Cadre>
  );
}

export function VignetteRuban() {
  return (
    <Cadre label="Un mètre ruban : 1 m = 100 cm">
      <rect x="8" y="34" width="116" height="16" rx="3" className="jeu-vignette__jeton" />
      <Texte x={66} y={24}>1 m = 100 cm</Texte>
    </Cadre>
  );
}

export function VignetteJardin() {
  return (
    <Cadre label="Un jardin rectangulaire et sa clôture">
      <rect x="30" y="14" width="72" height="36" rx="2" className="jeu-vignette__vide" />
      <Texte x={66} y={10} taille={11}>6 m</Texte>
      <Texte x={116} y={36} taille={11}>3 m</Texte>
    </Cadre>
  );
}

export function VignetteDuree() {
  return (
    <Cadre label="De 9 h 40 à 10 h 15">
      <Texte x={34} y={36}>9 h 40</Texte>
      <Texte x={66} y={36}>→</Texte>
      <Texte x={100} y={36}>10 h 15</Texte>
    </Cadre>
  );
}

export function VignetteBouteilles() {
  return (
    <Cadre label="Deux bouteilles : 1 L et 75 cL">
      <rect x="28" y="12" width="22" height="42" rx="6" className="jeu-vignette__jeton" />
      <rect x="82" y="12" width="22" height="42" rx="6" className="jeu-vignette__vide" />
      <Texte x={39} y={60} taille={10}>1 L</Texte>
      <Texte x={93} y={60} taille={10}>75 cL</Texte>
    </Cadre>
  );
}

export function VignetteMiroir() {
  return (
    <Cadre label="Une figure et son axe de symétrie">
      <polygon points="40,50 92,50 92,28 66,10 40,28" className="jeu-vignette__jeton" />
      <line x1="66" y1="4" x2="66" y2="58" className="jeu-vignette__trait" strokeDasharray="4 3" />
    </Cadre>
  );
}

export function VignetteDiagramme() {
  return (
    <Cadre label="Un diagramme en barres">
      {[[24, 30], [48, 14], [72, 38], [96, 22]].map(([x, y]) => (
        <rect key={x} x={x} y={y} width="16" height={54 - y} rx="2" className="jeu-vignette__jeton" />
      ))}
      <line x1="16" y1="54" x2="120" y2="54" className="jeu-vignette__trait" />
    </Cadre>
  );
}

export function VignetteComplements() {
  return (
    <Cadre label="Où ? Quand ? Comment ?">
      <Texte x={26} y={38}>Où ?</Texte>
      <Texte x={70} y={38}>Quand ?</Texte>
      <Texte x={114} y={38} taille={12}>Comment ?</Texte>
    </Cadre>
  );
}

export function VignetteSujet() {
  return (
    <Cadre label="Les enfants de la classe jouent">
      <Texte x={66} y={26} taille={12}>Les enfants de la classe</Texte>
      <Texte x={66} y={48} taille={14}>jouent</Texte>
    </Cadre>
  );
}
