import * as aOuA from '../../lib/jeux/aOuA';
import { repliquesAOuA } from '../../lib/jeux/voix/repliques';
import JeuDeChoix from './JeuDeChoix';
import HomophonesCM1 from './HomophonesCM1';

/**
 * A OU À ? ET OU EST ?, À L'ÉCRAN — la phrase à trou, les deux mots, et la
 * preuve par « avait » ou « était » une fois la phrase juste. Toute la règle
 * vit dans `aOuA.js` ; l'écran est celui des jeux à choix.
 */
/** La règle d'une classe : au CE2, son/sont et on/ont. */
const regle = (niveau) => ({
  MANCHES: aOuA.MANCHES,
  serie: (graine) => aOuA.serie(graine, niveau),
  bilan: aOuA.bilan,
  consigne: repliquesAOuA.consigne,
  choix: (p) => aOuA.paire(p).map((mot) => ({ cle: mot, libelle: mot })),
  verdict: aOuA.verdict,
  // L'erreur donne la méthode du mot qu'il fallait écrire.
  erreur: (p, bon) => repliquesAOuA.methode(bon),
  aide: (p) => repliquesAOuA.methode(p.bon),
});
const REGLES = { CE1: regle('CE1'), CE2: regle('CE2') };

function AOuAAvantCM1({ niveau = 'CE1', ...props }) {
  return (
    <JeuDeChoix
      {...props}
      regle={REGLES[niveau] ?? REGLES.CE1}
      // Au CE2, son/sont a son propre décor : voir `.jeu--aoua-ce2`.
      classe={niveau === 'CE2' ? 'jeu--aoua jeu--aoua-ce2' : 'jeu--aoua'}
      rendreQuestion={(p, termine) => (
        <p className="phrase-a-trou">
          {p.avant}{' '}
          <span className={`phrase-a-trou__trou${termine ? ' est-rempli' : ''}`}>{termine ? p.bon : '…'}</span>
          {' '}{p.apres}
        </p>
      )}
      rendreApres={(p) => {
        // LA PREUVE : avec le verbe, le remplacement fait une vraie phrase.
        const verbe = aOuA.VERBES.includes(p.bon);
        return (
          <p className="scene__bulle">
            {verbe
              ? <>Preuve : <em>{aOuA.avecRemplacant(p)}</em></>
              : <>« {aOuA.remplacant(p)} » ne marche pas ici : ce n’est pas le verbe.</>}
          </p>
        );
      }}
    />
  );
}

/** Au CM1 et au CM2, l'écran du cycle 3 — voir `HomophonesCM1.js` ; il lit la classe. */
export default function AOuA({ niveau, ...props }) {
  return niveau === 'CM1' || niveau === 'CM2' ? <HomophonesCM1 niveau={niveau} {...props} /> : <AOuAAvantCM1 niveau={niveau} {...props} />;
}
