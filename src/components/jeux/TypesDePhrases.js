import * as types from '../../lib/jeux/typesDePhrases';
import { repliquesTypes } from '../../lib/jeux/voix/repliques';
import JeuDeChoix from './JeuDeChoix';
import { sceneDe } from './scenes/ce2-francais';

const SCENE = sceneDe('types-de-phrases');

/**
 * RACONTE, QUESTION OU ORDRE ?, À L'ÉCRAN — la phrase sans son signe de fin,
 * les trois types, et le signe qui apparaît une fois la réponse trouvée.
 * Toute la règle vit dans `typesDePhrases.js`. L'univers de la couverture
 * (la planche du carrefour, la loupe qui cherche l'indice, le poteau de
 * flèches) vit dans `scenes/ce2-francais/Loupe.js` (09/10/2026).
 */
const REGLE = {
  MANCHES: types.MANCHES,
  serie: types.serie,
  bilan: types.bilan,
  consigne: () => repliquesTypes.consigne,
  choix: () => types.TYPES.map(({ cle, libelle }) => ({ cle, libelle })),
  verdict: types.verdict,
  erreur: (p, bon) => repliquesTypes.indice(bon),
  aide: (p) => repliquesTypes.indice(p.type),
  rendreLesChoix: SCENE.choix,
};

export default function TypesDePhrases(props) {
  return (
    <JeuDeChoix
      {...props}
      regle={REGLE}
      classe="jeu--types"
      // La phrase sans son signe, puis le signe et l'indice : voir la scène.
      rendreQuestion={SCENE.question}
    />
  );
}
