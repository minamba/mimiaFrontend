import * as aOuA from '../../lib/jeux/aOuA';
import { repliquesAOuA } from '../../lib/jeux/voix/repliques';
import JeuDeChoix from './JeuDeChoix';
import HomophonesCM1 from './HomophonesCM1';
import { sceneDe } from './scenes/ce2-francais';

/**
 * A OU À ? ET OU EST ?, À L'ÉCRAN — la phrase à trou, les deux mots, et la
 * preuve par « avait » ou « était » une fois la phrase juste. Toute la règle
 * vit dans `aOuA.js` ; l'écran est celui des jeux à choix. L'univers des
 * couvertures (au CE1 le bureau aux post-it et sa lampe, au CE2 le tableau au
 * soleil de craie) vit dans `scenes/ce2-francais/PostIts.js` (09/10/2026).
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
  // Les post-it (CE1) ou les bâtons de craie (CE2) : voir la scène.
  rendreLesChoix: sceneDe('a-ou-a', niveau).choix,
});
const REGLES = { CE1: regle('CE1'), CE2: regle('CE2') };

function AOuAAvantCM1({ niveau = 'CE1', ...props }) {
  const ce2 = niveau === 'CE2';
  return (
    <JeuDeChoix
      {...props}
      regle={REGLES[niveau] ?? REGLES.CE1}
      // Au CE2, son/sont a son propre décor : voir `.jeu--aoua-ce2`.
      classe={ce2 ? 'jeu--aoua jeu--aoua-ce2' : 'jeu--aoua'}
      // La phrase à trou, au tableau : voir la scène.
      rendreQuestion={sceneDe('a-ou-a', ce2 ? 'CE2' : 'CE1').question}
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
