import * as cj from '../../lib/jeux/contrairesEtJumeaux';
import { repliquesContraires } from '../../lib/jeux/voix/repliques';
import JeuDeChoix from './JeuDeChoix';
import VocabulaireCM1 from './VocabulaireCM1';

/**
 * CONTRAIRES ET JUMEAUX, À L'ÉCRAN — le mot, la question, trois choix. Toute
 * la règle vit dans `contrairesEtJumeaux.js`.
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
});
const REGLES = { CE1: regle('CE1'), CE2: regle('CE2') };

/** Le signe entre les deux mots : ↔ pour un contraire, = pour un jumeau, ⋯ pour une famille. */
const LIEN = { contraire: '↔', jumeau: '=', famille: '⋯' };

function ContrairesEtJumeauxAvantCM1({ niveau = 'CE1', ...props }) {
  return (
    <JeuDeChoix
      {...props}
      regle={REGLES[niveau] ?? REGLES.CE1}
      classe="jeu--contraires"
      rendreQuestion={(m, termine) => (
        <p className="contraires__paire">
          <span className="contraires__mot">{m.mot}</span>
          <span className="contraires__lien">{LIEN[m.demande]}</span>
          <span className={`contraires__mot${termine ? ' est-trouve' : ' est-vide'}`}>
            {termine ? cj.reponse(m) : '?'}
          </span>
        </p>
      )}
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
