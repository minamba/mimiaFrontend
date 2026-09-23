import * as ruban from '../../lib/jeux/metreRuban';
import { repliquesRuban } from '../../lib/jeux/voix/repliques';
import JeuDeChoix from './JeuDeChoix';
import MesuresCM1 from './MesuresCM1';

/**
 * LE MÈTRE RUBAN, À L'ÉCRAN — la longueur à convertir sur un ruban dessiné,
 * trois réponses. Toute la règle vit dans `metreRuban.js`.
 */
const REGLE = {
  MANCHES: ruban.MANCHES,
  serie: ruban.serie,
  bilan: ruban.bilan,
  consigne: () => repliquesRuban.consigne,
  choix: (m) => m.choix.map((n) => ({ cle: n, libelle: `${ruban.ecrire(n)} ${m.unite}` })),
  verdict: ruban.verdict,
  erreur: (m, sens) => repliquesRuban.erreur(sens),
  aide: (m) => repliquesRuban.erreur(m.relation),
};

function MetreRubanAvantCM1(props) {
  return (
    <JeuDeChoix
      {...props}
      regle={REGLE}
      classe="jeu--ruban"
      rendreQuestion={(m, termine) => (
        <div className="ruban-jeu">
          <svg className="ruban__dessin" viewBox="0 0 300 40" aria-hidden="true">
            <rect x="0" y="8" width="300" height="24" rx="4" />
            {Array.from({ length: 31 }, (_, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <line key={i} x1={i * 10} y1="8" x2={i * 10} y2={i % 5 === 0 ? 22 : 16} />
            ))}
          </svg>
          <p className="ruban__question">
            {termine
              ? m.question.replace('?', ruban.ecrire(m.bonne))
              : m.question.replace(/\d{4,}/g, (x) => ruban.ecrire(Number(x)))}
          </p>
        </div>
      )}
    />
  );
}

/** Au CM1 et au CM2, l'écran du cycle 3 — voir `MesuresCM1.js` ; il lit la classe. */
export default function MetreRuban({ niveau, ...props }) {
  return niveau === 'CM1' || niveau === 'CM2' ? <MesuresCM1 niveau={niveau} {...props} /> : <MetreRubanAvantCM1 niveau={niveau} {...props} />;
}
