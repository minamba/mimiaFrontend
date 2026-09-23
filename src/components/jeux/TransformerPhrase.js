import * as negation from '../../lib/jeux/phraseQuiDitNon';
import { repliquesNegation } from '../../lib/jeux/voix/repliques';
import JeuDeChoix from './JeuDeChoix';

/**
 * TRANSFORMER UNE PHRASE — la phrase qui dit non, au CE2, à l'écran. La
 * phrase de départ, la forme demandée, trois transformations. Toute la règle
 * vit dans `phraseQuiDitNon.js`, section « le CE2 » ; l'écran est celui des
 * jeux à choix.
 */
const REGLE = {
  MANCHES: 9,
  serie: negation.serieCE2,
  bilan: (n) => negation.bilan(n, 9),
  consigne: (m) => repliquesNegation.consigneCE2(m.forme),
  choix: (m) => m.choix.map((c) => ({ cle: c.texte, libelle: c.texte })),
  verdict: (m, texte) => m.choix.find((c) => c.texte === texte).faute ?? 'juste',
  erreur: (m, faute) => repliquesNegation.erreurCE2(faute),
  aide: () => null,
};

const NOMS = { negative: 'négative', interrogative: 'interrogative', exclamative: 'exclamative' };

export default function TransformerPhrase(props) {
  return (
    <JeuDeChoix
      {...props}
      regle={REGLE}
      classe="jeu--non jeu--transformer"
      rendreQuestion={(m) => (
        <p className="non__oui">
          <span className="non__marque">{NOMS[m.forme]}</span> {negation.phrase(m.phrase).mots.join(' ')}
        </p>
      )}
    />
  );
}
