import * as jardin from '../../lib/jeux/tourDuJardin';
import { repliquesJardin } from '../../lib/jeux/voix/repliques';
import JeuDeChoix from './JeuDeChoix';
import AiresCM1 from './AiresCM1';

/**
 * LE TOUR DU JARDIN, À L'ÉCRAN — le jardin dessiné, ses côtés écrits, trois
 * longueurs de clôture. Toute la règle vit dans `tourDuJardin.js`.
 */
const REGLE = {
  MANCHES: jardin.MANCHES,
  serie: jardin.serie,
  bilan: jardin.bilan,
  consigne: () => repliquesJardin.consigne,
  choix: (m) => m.choix.map((n) => ({ cle: n, libelle: `${n} m` })),
  verdict: jardin.verdict,
  erreur: (m, sens) => repliquesJardin.erreur(sens),
  aide: () => null,
};

function TourDuJardinAvantCM1(props) {
  return (
    <JeuDeChoix
      {...props}
      regle={REGLE}
      classe="jeu--jardin"
      rendreQuestion={(m, termine) => (
        <div className="jardin-jeu">
          <Jardin figure={m} />
          {termine && (
            <p className="jardin__calcul">{jardin.cotes(m).join(' + ')} = {m.bonne} m</p>
          )}
        </div>
      )}
    />
  );
}

/** Les sommets de chaque forme, dans un carré de 200 sur 160. */
function sommets(f) {
  if (f.forme === 'rectangle') return [[20, 30], [180, 30], [180, 130], [20, 130]];
  if (f.forme === 'carre') return [[50, 20], [150, 20], [150, 120], [50, 120]];
  if (f.forme === 'triangle') return [[100, 15], [180, 140], [20, 140]];
  return [[100, 12], [180, 68], [150, 145], [50, 145], [20, 68]];
}

/**
 * LE JARDIN : de l'herbe, une clôture, et une longueur sur chaque côté — sauf
 * les côtés d'en face du rectangle, que l'enfant doit déduire.
 */
function Jardin({ figure }) {
  const pts = sommets(figure);
  const longueurs = jardin.cotes(figure);
  const visible = (i) => figure.forme !== 'rectangle' || i < 2;
  const etiquettes = pts.map((p, i) => {
    const q = pts[(i + 1) % pts.length];
    const mx = (p[0] + q[0]) / 2;
    const my = (p[1] + q[1]) / 2;
    // L'étiquette est poussée vers l'extérieur de la figure.
    const cx = 100;
    const cy = 80;
    const dx = mx - cx;
    const dy = my - cy;
    const d = Math.hypot(dx, dy) || 1;
    return { x: mx + (dx / d) * 16, y: my + (dy / d) * 16, texte: `${longueurs[i]} m`, i };
  });
  return (
    <svg className="jardin__dessin" viewBox="-20 -10 240 180" role="img" aria-label={`Un jardin en forme de ${figure.forme}, côtés : ${longueurs.join(', ')} mètres`}>
      <polygon points={pts.map((p) => p.join(',')).join(' ')} className="jardin__herbe" />
      <polygon points={pts.map((p) => p.join(',')).join(' ')} className="jardin__cloture" />
      {figure.forme === 'carre' && <text x="100" y="75" textAnchor="middle" className="jardin__note">4 côtés égaux</text>}
      {etiquettes.filter((e) => visible(e.i) && (figure.forme !== 'carre' || e.i === 0)).map((e) => (
        <text key={e.i} x={e.x} y={e.y} textAnchor="middle" dominantBaseline="central" className="jardin__longueur">{e.texte}</text>
      ))}
    </svg>
  );
}

/** Au CM1 et au CM2, l'écran du cycle 3 — voir `AiresCM1.js` ; il lit la classe. */
export default function TourDuJardin({ niveau, ...props }) {
  return niveau === 'CM1' || niveau === 'CM2' ? <AiresCM1 niveau={niveau} {...props} /> : <TourDuJardinAvantCM1 niveau={niveau} {...props} />;
}
