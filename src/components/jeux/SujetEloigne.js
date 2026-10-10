import * as se from '../../lib/jeux/sujetEloigne';
import { repliquesSujetEloigne } from '../../lib/jeux/voix/repliques';
import JeuDeChoix from './JeuDeChoix';
import PasseComposeCM1 from './PasseComposeCM1';
import { sceneDe } from './scenes/ce2-francais';

const SCENE = sceneDe('sujet-qui-s-eloigne');

/**
 * LE SUJET QUI S'ÉLOIGNE, À L'ÉCRAN — la phrase à trou, trois formes du
 * verbe ; une fois trouvée, la question qui retrouve le sujet. Toute la règle
 * vit dans `sujetEloigne.js`. L'univers de la couverture (le panneau de bois,
 * le chemin où court le petit SUJET, les galets qu'on glisse dans le trou)
 * vit dans `scenes/ce2-francais/Chemin.js` (09/10/2026).
 */
const REGLE = {
  MANCHES: se.MANCHES,
  serie: se.serie,
  bilan: se.bilan,
  consigne: () => repliquesSujetEloigne.consigne,
  choix: (p) => p.choix.map((f) => ({ cle: f, libelle: f })),
  verdict: se.verdict,
  erreur: (p, sens) => repliquesSujetEloigne.erreur(sens),
  aide: () => repliquesSujetEloigne.erreur('proche'),
  rendreLesChoix: SCENE.choix,
};

function SujetEloigneAvantCM1(props) {
  return (
    <JeuDeChoix
      {...props}
      regle={REGLE}
      classe="jeu--sujet"
      // La phrase à trou ; le sujet, surligné une fois la réponse trouvée : voir la scène.
      rendreQuestion={SCENE.question}
      rendreApres={(p) => (
        <p className="scene__bulle">{se.question(p)} <em>{p.sujet}.</em></p>
      )}
    />
  );
}

/** Au CM1 et au CM2, l'écran du cycle 3 — voir `PasseComposeCM1.js` ; il lit la classe. */
export default function SujetEloigne({ niveau, ...props }) {
  return niveau === 'CM1' || niveau === 'CM2' ? <PasseComposeCM1 niveau={niveau} {...props} /> : <SujetEloigneAvantCM1 niveau={niveau} {...props} />;
}
