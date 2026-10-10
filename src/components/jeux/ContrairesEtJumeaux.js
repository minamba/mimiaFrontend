import * as cj from '../../lib/jeux/contrairesEtJumeaux';
import { repliquesContraires } from '../../lib/jeux/voix/repliques';
import JeuDeChoix from './JeuDeChoix';
import VocabulaireCM1 from './VocabulaireCM1';
import { sceneDe } from './scenes/ce2-francais';

const SCENE = sceneDe('contraires-et-jumeaux');

/**
 * CONTRAIRES ET JUMEAUX, À L'ÉCRAN — le mot, la question, trois choix. Toute
 * la règle vit dans `contrairesEtJumeaux.js`. L'univers de la couverture (le
 * carrefour des panneaux, le rouge-gorge, les pancartes plantées dans l'herbe)
 * vit dans `scenes/ce2-francais/Panneaux.js` (09/10/2026).
 */
const regle = (niveau) => ({
  MANCHES: cj.MANCHES,
  serie: (graine) => cj.serie(graine, niveau),
  bilan: cj.bilan,
  consigne: repliquesContraires.question,
  choix: (m) => m.choix.map((mot) => ({ cle: mot, libelle: mot })),
  verdict: cj.verdict,
  erreur: (m, sens) => repliquesContraires.erreur(m, sens),
  aide: () => null,
  rendreLesChoix: SCENE.choix,
});
const REGLES = { CE1: regle('CE1'), CE2: regle('CE2') };

function ContrairesEtJumeauxAvantCM1({ niveau = 'CE1', ...props }) {
  return (
    <JeuDeChoix
      {...props}
      regle={REGLES[niveau] ?? REGLES.CE1}
      classe="jeu--contraires"
      // Le mot, le lien (↔ contraire, = jumeau, ⋯ famille), la case à trouver : voir la scène.
      rendreQuestion={SCENE.question}
      rendreApres={(m) => {
        if (m.demande === 'jumeau') return <p className="scene__bulle">{cj.PHRASES.jumeaux}</p>;
        if (m.demande === 'famille') return <p className="scene__bulle">{cj.PHRASES.familles}</p>;
        return null;
      }}
    />
  );
}

/** Au CM1 et au CM2, l'écran du cycle 3 — voir `VocabulaireCM1.js` ; il lit la classe. */
export default function ContrairesEtJumeaux({ niveau, ...props }) {
  return niveau === 'CM1' || niveau === 'CM2' ? <VocabulaireCM1 niveau={niveau} {...props} /> : <ContrairesEtJumeauxAvantCM1 niveau={niveau} {...props} />;
}
