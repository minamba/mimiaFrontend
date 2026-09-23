import * as se from '../../lib/jeux/sujetEloigne';
import { repliquesSujetEloigne } from '../../lib/jeux/voix/repliques';
import JeuDeChoix from './JeuDeChoix';
import PasseComposeCM1 from './PasseComposeCM1';

/**
 * LE SUJET QUI S'ÉLOIGNE, À L'ÉCRAN — la phrase à trou, trois formes du
 * verbe ; une fois trouvée, la question qui retrouve le sujet. Toute la règle
 * vit dans `sujetEloigne.js`.
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
};

function SujetEloigneAvantCM1(props) {
  return (
    <JeuDeChoix
      {...props}
      regle={REGLE}
      classe="jeu--sujet"
      rendreQuestion={(p, termine) => {
        // Le sujet, surligné une fois la réponse trouvée.
        const reste = p.avant.slice(p.sujet.length);
        return (
          <p className="phrase-a-trou">
            {termine ? <mark className="sujet__sujet">{p.sujet}</mark> : p.sujet}
            {reste}{' '}
            <span className={`phrase-a-trou__trou${termine ? ' est-rempli' : ''}`}>{termine ? p.bon : '…'}</span>
            {' '}{p.apres}
          </p>
        );
      }}
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
