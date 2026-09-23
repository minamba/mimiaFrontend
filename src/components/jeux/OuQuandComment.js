import * as oqc from '../../lib/jeux/ouQuandComment';
import { repliquesComplements } from '../../lib/jeux/voix/repliques';
import JeuDeChoix from './JeuDeChoix';
import ComplementsCM1 from './ComplementsCM1';

/**
 * OÙ, QUAND, COMMENT ?, À L'ÉCRAN — la phrase, le groupe surligné, trois
 * questions. Toute la règle vit dans `ouQuandComment.js`.
 */
const REGLE = {
  MANCHES: oqc.MANCHES,
  serie: oqc.serie,
  bilan: oqc.bilan,
  consigne: () => repliquesComplements.consigne,
  choix: () => oqc.QUESTIONS.map(({ cle, libelle }) => ({ cle, libelle })),
  verdict: oqc.verdict,
  erreur: (p, type) => repliquesComplements.indice(type),
  aide: (p) => repliquesComplements.indice(p.type),
};

function OuQuandCommentAvantCM1(props) {
  return (
    <JeuDeChoix
      {...props}
      regle={REGLE}
      classe="jeu--complements"
      rendreQuestion={(p, termine) => (
        <p className="phrase-a-trou">
          {p.avant}{p.avant && ' '}
          <mark className={`complement${termine ? ` complement--${p.type}` : ''}`}>{p.groupe}</mark>
          {p.apres.startsWith(',') || p.apres === '.' ? '' : ' '}{p.apres}
        </p>
      )}
    />
  );
}

/** Au CM1 et au CM2, l'écran du cycle 3 — voir `ComplementsCM1.js` ; il lit la classe. */
export default function OuQuandComment({ niveau, ...props }) {
  return niveau === 'CM1' || niveau === 'CM2' ? <ComplementsCM1 niveau={niveau} {...props} /> : <OuQuandCommentAvantCM1 niveau={niveau} {...props} />;
}
