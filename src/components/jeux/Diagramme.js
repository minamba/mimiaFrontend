import * as diag from '../../lib/jeux/diagramme';
import { repliquesDiagramme } from '../../lib/jeux/voix/repliques';
import JeuDeChoix from './JeuDeChoix';
import TableauxCM1 from './TableauxCM1';

/**
 * LE DIAGRAMME, À L'ÉCRAN — un diagramme en barres dessiné, sa question, trois
 * réponses. Toute la règle vit dans `diagramme.js`.
 *
 * LES VALEURS NE SONT PAS ÉCRITES SUR LES BARRES : les lire sur l'axe est la
 * compétence. Elles apparaissent une fois la réponse trouvée.
 */
const REGLE = {
  MANCHES: diag.MANCHES,
  serie: diag.serie,
  bilan: diag.bilan,
  consigne: () => repliquesDiagramme.consigne,
  choix: (m) => m.choix.map((c) => ({ cle: c, libelle: String(c) })),
  verdict: diag.verdict,
  erreur: (m, sens) => repliquesDiagramme.erreur(sens),
  aide: () => null,
};

function DiagrammeAvantCM1(props) {
  return (
    <JeuDeChoix
      {...props}
      regle={REGLE}
      classe="jeu--diagramme"
      rendreQuestion={(m, termine) => (
        <div className="diagramme-jeu">
          <Barres m={m} termine={termine} />
          <p className="diagramme__question">{m.question}</p>
        </div>
      )}
    />
  );
}

const COULEURS = ['#e76f51', '#f4a261', '#2a9d8f', '#5b6bd6'];

function Barres({ m, termine }) {
  const haut = 14;
  const y = (v) => 150 - (v / haut) * 130;
  return (
    <svg className="diagramme__dessin" viewBox="0 0 280 190" role="img" aria-label={m.titre}>
      <text x="150" y="12" textAnchor="middle" className="diagramme__titre">{m.titre}</text>
      {Array.from({ length: haut / 2 + 1 }, (_, k) => {
        const v = k * 2;
        return (
          <g key={v}>
            <line x1="34" y1={y(v)} x2="270" y2={y(v)} className="diagramme__grille" />
            <text x="28" y={y(v) + 4} textAnchor="end" className="diagramme__graduation">{v}</text>
          </g>
        );
      })}
      {m.valeurs.map((v, i) => {
        const x = 50 + i * 56;
        return (
          <g key={m.noms[i]}>
            <rect x={x} y={y(v)} width="36" height={150 - y(v)} rx="3" fill={COULEURS[i]} />
            <text x={x + 18} y="166" textAnchor="middle" className="diagramme__nom">{m.noms[i]}</text>
            {termine && <text x={x + 18} y={y(v) - 4} textAnchor="middle" className="diagramme__valeur">{v}</text>}
          </g>
        );
      })}
      <line x1="34" y1="150" x2="270" y2="150" className="diagramme__axe" />
    </svg>
  );
}

/** Au CM1 et au CM2, l'écran du cycle 3 — voir `TableauxCM1.js` ; il lit la classe. */
export default function Diagramme({ niveau, ...props }) {
  return niveau === 'CM1' || niveau === 'CM2' ? <TableauxCM1 niveau={niveau} {...props} /> : <DiagrammeAvantCM1 niveau={niveau} {...props} />;
}
