import * as types from '../../lib/jeux/typesDePhrases';
import { repliquesTypes } from '../../lib/jeux/voix/repliques';
import JeuDeChoix from './JeuDeChoix';

/**
 * RACONTE, QUESTION OU ORDRE ?, À L'ÉCRAN — la phrase sans son signe de fin,
 * les trois types, et le signe qui apparaît une fois la réponse trouvée.
 * Toute la règle vit dans `typesDePhrases.js`.
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
};

export default function TypesDePhrases(props) {
  return (
    <JeuDeChoix
      {...props}
      regle={REGLE}
      classe="jeu--types"
      rendreQuestion={(p, termine) => (
        <p className="phrase-a-trou">
          {p.texte}
          <span className={`phrase-a-trou__trou phrase-a-trou__trou--signe${termine ? ' est-rempli' : ''}`}>
            {termine ? types.signe(p) : '…'}
          </span>
        </p>
      )}
    />
  );
}
